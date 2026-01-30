import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { db } from '../../../firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, writeBatch, where } from 'firebase/firestore';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../../styles/designSystem';

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${spacing.lg};
    margin-bottom: ${spacing.xl};

    ${media['max-md']} {
        grid-template-columns: 1fr;
        gap: ${spacing.md};
    }
`;

const Members = () => {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        dept: '본당',
        position: '성도',
        phone: '',
        birthMonth: '',
        birthDay: '',
        isLunar: false
    });

    // Filtering State
    const [selectedDept, setSelectedDept] = useState('전체');
    const [selectedPosition, setSelectedPosition] = useState('전체');

    // Toast State
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Delete Confirmation State
    const [deleteModal, setDeleteModal] = useState({ show: false, memberId: null, memberName: '' });

    // New Modal States for Batch Actions
    const [batchRegisterModal, setBatchRegisterModal] = useState(false);
    const [deleteAllBirthdaysModal, setDeleteAllBirthdaysModal] = useState(false);

    // Toast Function
    const showToast = useCallback((message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    }, []);

    const fetchMembers = useCallback(async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, 'church_member'));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort by Name
            data.sort((a, b) => a.name.localeCompare(b.name));

            setMembers(data);
        } catch (error) {
            console.error("Error fetching members: ", error);
            showToast('데이터를 불러오는 중 오류가 발생했습니다.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.dept || !formData.phone || !formData.birthMonth || !formData.birthDay) {
            showToast('모든 필수 항목을 입력해주세요.', 'error');
            return;
        }

        try {
            const memberData = {
                name: formData.name,
                dept: formData.dept,
                position: formData.position,
                phone: formData.phone,
                birthMonth: formData.birthMonth,
                birthDay: formData.birthDay,
                isLunar: formData.isLunar,
                updatedAt: new Date()
            };

            if (editingMember) {
                await updateDoc(doc(db, 'church_member', editingMember.id), memberData);
                showToast('성도 정보가 수정되었습니다.', 'success');
            } else {
                memberData.createdAt = new Date();
                await addDoc(collection(db, 'church_member'), memberData);
                showToast('새로운 성도가 등록되었습니다.', 'success');
            }

            closeForm();
            fetchMembers();
        } catch (error) {
            console.error("Error saving member: ", error);
            showToast('저장 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.memberId) return;

        try {
            await deleteDoc(doc(db, 'church_member', deleteModal.memberId));
            showToast('성도 정보가 삭제되었습니다.', 'success');
            setDeleteModal({ show: false, memberId: null, memberName: '' });
            fetchMembers();
        } catch (error) {
            console.error("Error deleting member: ", error);
            showToast('삭제 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleBatchRegister = () => {
        setBatchRegisterModal(true);
    };

    const executeBatchRegister = async () => {
        setBatchRegisterModal(false);
        setIsLoading(true);
        try {
            const batch = writeBatch(db);
            const eventsRef = collection(db, 'events');
            let count = 0;
            const currentYear = new Date().getFullYear();

            // Generate UUID for repeatGroupId
            const generateUUID = () => {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };

            members.forEach(member => {
                if (member.birthMonth && member.birthDay) {
                    const newEventRef = doc(eventsRef);
                    const birthDate = new Date(currentYear, Number(member.birthMonth) - 1, Number(member.birthDay), 9, 0, 0);

                    batch.set(newEventRef, {
                        title: `${member.name} ${member.position} 생일`,
                        description: `[성도 생일] ${member.dept} ${member.name} 성도님의 생일입니다.`,
                        start: birthDate,
                        end: birthDate,
                        location: '',
                        allDay: true,
                        type: 'BIRTHDAY',
                        isLunar: member.isLunar || false,
                        isRecurring: true,
                        repeat: {
                            type: 'YEARLY',
                            repeatGroupId: generateUUID()
                        },
                        createdAt: new Date()
                    });
                    count++;
                }
            });

            await batch.commit();
            showToast(`${count}명의 생일 일정이 캘린더에 등록되었습니다!`, 'success');
        } catch (error) {
            console.error("Error batch registering birthdays:", error);
            showToast('생일 일괄 등록 중 오류가 발생했습니다.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAllBirthdays = () => {
        setDeleteAllBirthdaysModal(true);
    };

    const executeDeleteAllBirthdays = async () => {
        setDeleteAllBirthdaysModal(false);
        setIsLoading(true);
        try {
            const q = query(collection(db, 'events'), where('type', '==', 'BIRTHDAY'));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                showToast('삭제할 생일 일정이 없습니다.', 'info');
                setIsLoading(false);
                return;
            }

            const batch = writeBatch(db);
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            showToast(`${snapshot.size}개의 생일 일정이 삭제되었습니다.`, 'success');
        } catch (error) {
            console.error("Error deleting all birthdays:", error);
            showToast('생일 일정 삭제 중 오류가 발생했습니다.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const openEditForm = (member) => {
        setEditingMember(member);
        setFormData({
            name: member.name,
            dept: member.dept || '본당',
            position: member.position || '성도',
            phone: member.phone || '',
            birthMonth: member.birthMonth || '',
            birthDay: member.birthDay || '',
            isLunar: member.isLunar || false
        });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingMember(null);
        setFormData({
            name: '',
            dept: '본당',
            position: '성도',
            phone: '',
            birthMonth: '',
            birthDay: '',
            isLunar: false
        });
    };

    // Filter Logic
    const uniqueDepts = ['전체', ...new Set(members.map(m => m.dept || '기타'))].sort();
    const uniquePositions = ['전체', ...new Set(members.map(m => m.position || '기타'))].sort();

    const filteredMembers = members.filter(member => {
        const matchesDept = selectedDept === '전체' || (member.dept || '기타') === selectedDept;
        const matchesPosition = selectedPosition === '전체' || (member.position || '기타') === selectedPosition;
        return matchesDept && matchesPosition;
    });

    return (
        <Container>
            <ActionBar>
                <BatchButton onClick={handleBatchRegister}>
                    📅 생일 일괄 등록
                </BatchButton>
                <DeleteAllButton onClick={handleDeleteAllBirthdays}>
                    🗑️ 생일 전체 삭제
                </DeleteAllButton>
                <AddButton onClick={() => setIsFormOpen(true)}>
                    + 성도 추가
                </AddButton>
            </ActionBar>

            <FilterContainer>
                <FilterGroup>
                    <FilterLabel>부서:</FilterLabel>
                    <Select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                        {uniqueDepts.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </Select>
                </FilterGroup>
                <FilterGroup>
                    <FilterLabel>직분:</FilterLabel>
                    <Select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)}>
                        {uniquePositions.map(pos => (
                            <option key={pos} value={pos}>{pos}</option>
                        ))}
                    </Select>
                </FilterGroup>
                <SummaryText>
                    총 <strong>{filteredMembers.length}</strong>명
                </SummaryText>
            </FilterContainer>

            {isLoading ? (
                <LoadingState>데이터를 불러오는 중입니다...</LoadingState>
            ) : (
                <TableContainer>
                    <Table>
                        <thead>
                            <TableRow>
                                <TableHeader>부서</TableHeader>
                                <TableHeader>직분</TableHeader>
                                <TableHeader>이름</TableHeader>
                                <TableHeader>전화번호</TableHeader>
                                <TableHeader>생일</TableHeader>
                                <TableHeader width="120px">관리</TableHeader>
                            </TableRow>
                        </thead>
                        <tbody>
                            {filteredMembers.length > 0 ? (
                                filteredMembers.map(member => (
                                    <TableRow key={member.id}>
                                        <TableCell><Badge>{member.dept || '-'}</Badge></TableCell>
                                        <TableCell>{member.position || '-'}</TableCell>
                                        <TableCell><strong>{member.name}</strong></TableCell>
                                        <TableCell>{member.phone}</TableCell>
                                        <TableCell>
                                            {member.birthMonth}월 {member.birthDay}일
                                            {member.isLunar && <LunarBadge>음</LunarBadge>}
                                        </TableCell>
                                        <TableCell>
                                            <ActionGroup>
                                                <ActionButton onClick={() => openEditForm(member)}>✏️</ActionButton>
                                                <ActionButton $danger onClick={() => setDeleteModal({ show: true, memberId: member.id, memberName: member.name })}>🗑️</ActionButton>
                                            </ActionGroup>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                                        데이터가 없습니다.
                                    </TableCell>
                                </TableRow>
                            )}
                        </tbody>
                    </Table>
                </TableContainer>
            )}

            {/* Input Modal */}
            {isFormOpen && (
                <ModalOverlay onClick={closeForm}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>{editingMember ? '성도 정보 수정' : '새 성도 등록'}</ModalTitle>
                            <CloseButton onClick={closeForm}>✕</CloseButton>
                        </ModalHeader>
                        <form onSubmit={handleSubmit}>
                            <FormGrid>
                                <FormGroup>
                                    <Label>이름 *</Label>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="이름 입력"
                                        required
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>전화번호 *</Label>
                                    <Input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="010-0000-0000"
                                        required
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>부서</Label>
                                    <Input
                                        name="dept"
                                        value={formData.dept}
                                        onChange={handleInputChange}
                                        placeholder="부서 입력"
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>직분</Label>
                                    <Input
                                        name="position"
                                        value={formData.position}
                                        onChange={handleInputChange}
                                        placeholder="직분 입력"
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>생일 (월) *</Label>
                                    <Select name="birthMonth" value={formData.birthMonth} onChange={handleInputChange} required>
                                        <option value="">선택</option>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                            <option key={m} value={m}>{m}월</option>
                                        ))}
                                    </Select>
                                </FormGroup>
                                <FormGroup>
                                    <Label>생일 (일) *</Label>
                                    <Select name="birthDay" value={formData.birthDay} onChange={handleInputChange} required>
                                        <option value="">선택</option>
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                            <option key={d} value={d}>{d}일</option>
                                        ))}
                                    </Select>
                                </FormGroup>
                                <FormGroup>
                                    <Label>음력 여부</Label>
                                    <CheckboxLabel>
                                        <input
                                            type="checkbox"
                                            name="isLunar"
                                            checked={formData.isLunar}
                                            onChange={handleInputChange}
                                        />
                                        음력 생일입니다
                                    </CheckboxLabel>
                                </FormGroup>
                            </FormGrid>
                            <FormActions>
                                <CancelButton type="button" onClick={closeForm}>취소</CancelButton>
                                <SubmitButton type="submit">{editingMember ? '수정 완료' : '등록하기'}</SubmitButton>
                            </FormActions>
                        </form>
                    </ModalContent>
                </ModalOverlay>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <ModalOverlay>
                    <DeleteModalContent>
                        <DeleteIcon>⚠️</DeleteIcon>
                        <ModalTitle>성도 삭제</ModalTitle>
                        <p>정말로 <strong>{deleteModal.memberName}</strong> 성도님을 삭제하시겠습니까?<br />이 작업은 되돌릴 수 없습니다.</p>
                        <FormActions>
                            <CancelButton onClick={() => setDeleteModal({ show: false, memberId: null, memberName: '' })}>취소</CancelButton>
                            <DeleteConfirmButton onClick={handleDelete}>삭제하기</DeleteConfirmButton>
                        </FormActions>
                    </DeleteModalContent>
                </ModalOverlay>
            )}

            {/* Batch Register Modal */}
            {batchRegisterModal && (
                <ModalOverlay>
                    <ModalContent>
                        <ModalHeader>
                            <ModalTitle>생일 일괄 등록</ModalTitle>
                            <CloseButton onClick={() => setBatchRegisterModal(false)}>✕</CloseButton>
                        </ModalHeader>
                        <p>전체 성도 <strong>{members.length}명</strong>의 생일 일정을 캘린더에 일괄 등록하시겠습니까?</p>
                        <p style={{ color: colors.neutral[500], fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            이미 등록된 일정이 중복될 수 있으니 주의해주세요.
                        </p>
                        <FormActions style={{ marginTop: '2rem' }}>
                            <CancelButton onClick={() => setBatchRegisterModal(false)}>취소</CancelButton>
                            <BatchButton onClick={executeBatchRegister}>일괄 등록하기</BatchButton>
                        </FormActions>
                    </ModalContent>
                </ModalOverlay>
            )}

            {/* Delete All Birthdays Modal */}
            {deleteAllBirthdaysModal && (
                <ModalOverlay>
                    <DeleteModalContent>
                        <DeleteIcon>📅</DeleteIcon>
                        <ModalTitle>생일 전체 삭제</ModalTitle>
                        <p>캘린더에 등록된 <strong>모든 [생일] 타입의 일정</strong>을 삭제하시겠습니까?</p>
                        <p style={{ color: colors.error[600], fontWeight: 'bold', marginTop: '0.5rem' }}>
                            이 작업은 되돌릴 수 없습니다.
                        </p>
                        <FormActions>
                            <CancelButton onClick={() => setDeleteAllBirthdaysModal(false)}>취소</CancelButton>
                            <DeleteConfirmButton onClick={executeDeleteAllBirthdays}>전체 삭제하기</DeleteConfirmButton>
                        </FormActions>
                    </DeleteModalContent>
                </ModalOverlay>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <Toast $type={toast.type}>
                    {toast.message}
                </Toast>
            )}
        </Container>
    );
};

// Styles
const Container = styled.div`
    padding: ${spacing.md};
`;

const ActionBar = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: ${spacing.sm};
    margin-bottom: ${spacing.lg};
`;

const AddButton = styled.button`
    background-color: ${colors.primary[600]};
    color: white;
    border: none;
    padding: ${spacing.md} ${spacing.lg};
    border-radius: ${borderRadius.lg};
    font-weight: ${typography.fontWeight.bold};
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: ${colors.primary[700]};
    }
`;

const BatchButton = styled.button`
    background-color: ${colors.secondary[100]};
    color: ${colors.secondary[700]};
    border: none;
    padding: ${spacing.md} ${spacing.lg};
    border-radius: ${borderRadius.lg};
    font-weight: ${typography.fontWeight.bold};
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: ${colors.secondary[200]};
    }
`;

const DeleteAllButton = styled.button`
    background-color: ${colors.error[100]};
    color: ${colors.error[700]};
    border: none;
    padding: ${spacing.md} ${spacing.lg};
    border-radius: ${borderRadius.lg};
    font-weight: ${typography.fontWeight.bold};
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: ${colors.error[200]};
    }
`;

const FilterContainer = styled.div`
    display: flex;
    gap: ${spacing.lg};
    align-items: center;
    background: white;
    padding: ${spacing.lg};
    border-radius: ${borderRadius.lg};
    box-shadow: ${shadows.sm};
    margin-bottom: ${spacing.lg};
    flex-wrap: wrap;
`;

const FilterGroup = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.sm};
`;

const FilterLabel = styled.span`
    font-weight: ${typography.fontWeight.semibold};
    color: ${colors.neutral[600]};
`;

const Select = styled.select`
    padding: ${spacing.sm} ${spacing.md};
    border-radius: ${borderRadius.md};
    border: 1px solid ${colors.neutral[300]};
    background-color: white;
`;

const SummaryText = styled.div`
    margin-left: auto;
    color: ${colors.neutral[600]};
`;

const TableContainer = styled.div`
    background: white;
    border-radius: ${borderRadius.lg};
    box-shadow: ${shadows.sm};
    overflow-x: auto;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    min-width: 800px;
`;

const TableRow = styled.tr`
    border-bottom: 1px solid ${colors.neutral[200]};
    &:last-child { border-bottom: none; }
    &:hover { background-color: ${colors.neutral[50]}; }
`;

const TableHeader = styled.th`
    text-align: left;
    padding: ${spacing.md} ${spacing.lg};
    background-color: ${colors.neutral[100]};
    color: ${colors.neutral[600]};
    font-weight: ${typography.fontWeight.bold};
    width: ${props => props.width || 'auto'};
`;

const TableCell = styled.td`
    padding: ${spacing.md} ${spacing.lg};
    color: ${colors.neutral[800]};
    vertical-align: middle;
`;

const Badge = styled.span`
    background-color: ${colors.primary[50]};
    color: ${colors.primary[700]};
    padding: 2px 8px;
    border-radius: ${borderRadius.full};
    font-size: ${typography.fontSize.sm};
    font-weight: ${typography.fontWeight.medium};
`;

const LunarBadge = styled.span`
    background-color: ${colors.secondary[100]};
    color: ${colors.secondary[700]};
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.75rem;
    margin-left: 6px;
`;

const ActionGroup = styled.div`
    display: flex;
    gap: ${spacing.sm};
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    opacity: 0.7;
    transition: opacity 0.2s;
    
    &:hover {
        opacity: 1;
        transform: scale(1.1);
    }
    
    ${props => props.$danger && `
        &:hover { color: ${colors.error[600]}; }
    `}
`;

// Modal Styles
const ModalOverlay = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: white;
    padding: ${spacing.xl};
    border-radius: ${borderRadius.xl};
    width: 100%;
    max-width: 600px;
    box-shadow: ${shadows.xl};
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${spacing.xl};
`;

const ModalTitle = styled.h3`
    font-size: ${typography.fontSize.xl};
    font-weight: ${typography.fontWeight.bold};
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: ${colors.neutral[500]};
`;



const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing.xs};
`;

const Label = styled.label`
    font-size: ${typography.fontSize.sm};
    font-weight: ${typography.fontWeight.semibold};
    color: ${colors.neutral[700]};
`;

const Input = styled.input`
    padding: ${spacing.sm} ${spacing.md};
    border-radius: ${borderRadius.md};
    border: 1px solid ${colors.neutral[300]};
    
    &:focus {
        outline: none;
        border-color: ${colors.primary[500]};
    }
`;

const CheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    gap: ${spacing.sm};
    font-size: ${typography.fontSize.sm};
    cursor: pointer;
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${spacing.md};
`;

const CancelButton = styled.button`
    padding: ${spacing.md} ${spacing.lg};
    border: 1px solid ${colors.neutral[300]};
    background: white;
    border-radius: ${borderRadius.md};
    cursor: pointer;
    
    &:hover { background: ${colors.neutral[50]}; }
`;

const SubmitButton = styled.button`
    padding: ${spacing.md} ${spacing.lg};
    background: ${colors.primary[600]};
    color: white;
    border: none;
    border-radius: ${borderRadius.md};
    font-weight: bold;
    cursor: pointer;
    
    &:hover { background: ${colors.primary[700]}; }
`;

const DeleteModalContent = styled(ModalContent)`
    max-width: 400px;
    text-align: center;
`;

const DeleteIcon = styled.div`
    font-size: 3rem;
    margin-bottom: ${spacing.md};
`;

const DeleteConfirmButton = styled(SubmitButton)`
    background: ${colors.error[600]};
    &:hover { background: ${colors.error[700]}; }
`;

const Toast = styled.div`
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    padding: ${spacing.md} ${spacing.xl};
    background: ${props => props.$type === 'error' ? colors.error[600] : colors.primary[600]};
    color: white;
    border-radius: ${borderRadius.full};
    box-shadow: ${shadows.lg};
    z-index: 2000;
    animation: slideUp 0.3s ease-out;

    @keyframes slideUp {
        from { transform: translate(-50%, 20px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
`;

const LoadingState = styled.div`
    text-align: center;
    padding: ${spacing['4xl']};
    color: ${colors.neutral[500]};
`;

export default Members;
