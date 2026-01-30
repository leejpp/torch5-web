import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { db } from '../../../firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../../styles/designSystem';

const ScriptureAdmin = () => {
    const [verses, setVerses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingVerse, setEditingVerse] = useState(null);
    const [formData, setFormData] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        reference: '',
        content: ''
    });

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [deleteModal, setDeleteModal] = useState({ show: false, verseId: null, verseRef: '' });

    const showToast = useCallback((message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    }, []);

    const fetchVerses = useCallback(async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, 'monthly_verses'), orderBy('year', 'desc'), orderBy('month', 'desc'));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setVerses(data);
        } catch (error) {
            console.error("Error fetching verses: ", error);
            showToast('데이터를 불러오는 중 오류가 발생했습니다.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchVerses();
    }, [fetchVerses]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'year' || name === 'month' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const verseData = {
                ...formData,
                updatedAt: new Date()
            };

            if (editingVerse) {
                await updateDoc(doc(db, 'monthly_verses', editingVerse.id), verseData);
                showToast('수정되었습니다.', 'success');
            } else {
                verseData.createdAt = new Date();
                await addDoc(collection(db, 'monthly_verses'), verseData);
                showToast('등록되었습니다.', 'success');
            }

            closeForm();
            fetchVerses();
        } catch (error) {
            console.error("Error saving verse: ", error);
            showToast('저장 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.verseId) return;
        try {
            await deleteDoc(doc(db, 'monthly_verses', deleteModal.verseId));
            showToast('삭제되었습니다.', 'success');
            setDeleteModal({ show: false, verseId: null, verseRef: '' });
            fetchVerses();
        } catch (error) {
            console.error("Error deleting verse: ", error);
            showToast('삭제 중 오류가 발생했습니다.', 'error');
        }
    };

    const openEditForm = (verse) => {
        setEditingVerse(verse);
        setFormData({
            year: verse.year,
            month: verse.month,
            reference: verse.reference,
            content: verse.content
        });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingVerse(null);
        setFormData({
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            reference: '',
            content: ''
        });
    };

    return (
        <Container>
            <Header>
                <Title>📖 이달의 말씀 관리</Title>
                <AddButton onClick={() => setIsFormOpen(true)}>+ 말씀 등록</AddButton>
            </Header>

            {isLoading ? (
                <LoadingState>불러오는 중...</LoadingState>
            ) : (
                <VerseGrid>
                    {verses.length > 0 ? (
                        verses.map(verse => (
                            <VerseCard key={verse.id}>
                                <CardHeader>
                                    <DateBadge>{verse.year}년 {verse.month}월</DateBadge>
                                    <ActionButtons>
                                        <IconButton onClick={() => openEditForm(verse)}>✏️</IconButton>
                                        <IconButton $danger onClick={() => setDeleteModal({ show: true, verseId: verse.id, verseRef: `${verse.year}년 ${verse.month}월` })}>🗑️</IconButton>
                                    </ActionButtons>
                                </CardHeader>
                                <Reference>{verse.reference}</Reference>
                                <Content>{verse.content}</Content>
                            </VerseCard>
                        ))
                    ) : (
                        <EmptyState>등록된 말씀이 없습니다.</EmptyState>
                    )}
                </VerseGrid>
            )}

            {isFormOpen && (
                <ModalOverlay onClick={closeForm}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <h3>{editingVerse ? '말씀 수정' : '말씀 등록'}</h3>
                            <CloseButton onClick={closeForm}>✕</CloseButton>
                        </ModalHeader>
                        <form onSubmit={handleSubmit}>
                            <FormGroup>
                                <Label>연도 / 월</Label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Input
                                        type="number"
                                        name="year"
                                        value={formData.year}
                                        onChange={handleInputChange}
                                        style={{ width: '80px' }}
                                    />
                                    <Input
                                        type="number"
                                        name="month"
                                        value={formData.month}
                                        onChange={handleInputChange}
                                        min="1" max="12"
                                        style={{ width: '60px' }}
                                    />
                                </div>
                            </FormGroup>
                            <FormGroup>
                                <Label>성경 구절 (예: 요한복음 3:16)</Label>
                                <Input
                                    name="reference"
                                    value={formData.reference}
                                    onChange={handleInputChange}
                                    placeholder="구절 입력"
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>말씀 본문</Label>
                                <TextArea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    placeholder="말씀 전체 내용 입력"
                                    rows={5}
                                    required
                                />
                            </FormGroup>
                            <FormActions>
                                <CancelButton type="button" onClick={closeForm}>취소</CancelButton>
                                <SubmitButton type="submit">저장</SubmitButton>
                            </FormActions>
                        </form>
                    </ModalContent>
                </ModalOverlay>
            )}

            {deleteModal.show && (
                <ModalOverlay>
                    <DeleteModalContent>
                        <h3>삭제 확인</h3>
                        <p><strong>{deleteModal.verseRef}</strong> 말씀을 삭제하시겠습니까?</p>
                        <FormActions>
                            <CancelButton onClick={() => setDeleteModal({ show: false, verseId: null, verseRef: '' })}>취소</CancelButton>
                            <DeleteConfirmButton onClick={handleDelete}>삭제</DeleteConfirmButton>
                        </FormActions>
                    </DeleteModalContent>
                </ModalOverlay>
            )}

            {toast.show && (
                <Toast $type={toast.type}>{toast.message}</Toast>
            )}
        </Container>
    );
};

// Styles
const Container = styled.div`
    padding: ${spacing.lg};
    max-width: 1000px;
    margin: 0 auto;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${spacing.xl};
`;

const Title = styled.h2`
    font-size: ${typography.fontSize['2xl']};
    font-weight: ${typography.fontWeight.bold};
    color: ${colors.neutral[800]};
`;

const AddButton = styled.button`
    background-color: ${colors.primary[600]};
    color: white;
    padding: ${spacing.sm} ${spacing.lg};
    border-radius: ${borderRadius.lg};
    border: none;
    font-weight: bold;
    cursor: pointer;
    &:hover { background-color: ${colors.primary[700]}; }
`;

const VerseGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: ${spacing.lg};
`;

const VerseCard = styled.div`
    background: white;
    padding: ${spacing.lg};
    border-radius: ${borderRadius.lg};
    box-shadow: ${shadows.md};
    border: 1px solid ${colors.neutral[200]};
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${spacing.md};
`;

const DateBadge = styled.span`
    background: ${colors.secondary[100]};
    color: ${colors.secondary[700]};
    padding: 4px 8px;
    border-radius: ${borderRadius.full};
    font-size: ${typography.fontSize.sm};
    font-weight: bold;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: ${spacing.xs};
`;

const IconButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.1rem;
    padding: 4px;
    border-radius: ${borderRadius.full};
    &:hover { background: ${colors.neutral[100]}; }
    ${props => props.$danger && `color: ${colors.error[600]};`}
`;

const Reference = styled.h3`
    font-size: ${typography.fontSize.lg};
    font-weight: bold;
    margin-bottom: ${spacing.sm};
    color: ${colors.primary[800]};
`;

const Content = styled.p`
    color: ${colors.neutral[700]};
    line-height: 1.6;
    white-space: pre-wrap;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: ${spacing['2xl']};
    color: ${colors.neutral[500]};
    grid-column: 1 / -1;
`;

const LoadingState = styled.div`
    text-align: center;
    padding: 50px;
    color: ${colors.neutral[500]};
`;

// Modal Components (Reused style from Members.js mostly)
const ModalOverlay = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: white;
    padding: ${spacing.xl};
    border-radius: ${borderRadius.xl};
    width: 90%;
    max-width: 500px;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${spacing.lg};
    h3 { font-size: ${typography.fontSize.xl}; font-weight: bold; }
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
`;

const FormGroup = styled.div`
    margin-bottom: ${spacing.md};
`;

const Label = styled.label`
    display: block;
    margin-bottom: ${spacing.xs};
    font-weight: bold;
    font-size: ${typography.fontSize.sm};
`;

const Input = styled.input`
    width: 100%;
    padding: ${spacing.sm};
    border: 1px solid ${colors.neutral[300]};
    border-radius: ${borderRadius.md};
    &:focus { outline: 2px solid ${colors.primary[200]}; border-color: ${colors.primary[500]}; }
`;

const TextArea = styled.textarea`
    width: 100%;
    padding: ${spacing.sm};
    border: 1px solid ${colors.neutral[300]};
    border-radius: ${borderRadius.md};
    resize: vertical;
    &:focus { outline: 2px solid ${colors.primary[200]}; border-color: ${colors.primary[500]}; }
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${spacing.md};
    margin-top: ${spacing.lg};
`;

const CancelButton = styled.button`
    padding: ${spacing.sm} ${spacing.lg};
    border: 1px solid ${colors.neutral[300]};
    background: white;
    border-radius: ${borderRadius.md};
    cursor: pointer;
    &:hover { background: ${colors.neutral[50]}; }
`;

const SubmitButton = styled.button`
    padding: ${spacing.sm} ${spacing.lg};
    background: ${colors.primary[600]};
    color: white;
    border: none;
    border-radius: ${borderRadius.md};
    cursor: pointer;
    font-weight: bold;
    &:hover { background: ${colors.primary[700]}; }
`;

const DeleteModalContent = styled.div`
    background: white;
    padding: ${spacing.xl};
    border-radius: ${borderRadius.lg};
    max-width: 400px;
    text-align: center;
`;

const DeleteConfirmButton = styled(SubmitButton)`
    background: ${colors.error[600]};
    &:hover { background: ${colors.error[700]}; }
`;

const Toast = styled.div`
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${props => props.$type === 'error' ? colors.error[600] : colors.primary[600]};
    color: white;
    padding: ${spacing.sm} ${spacing.lg};
    border-radius: ${borderRadius.full};
    box-shadow: ${shadows.lg};
    animation: slideUp 0.3s ease-out;
    z-index: 2000;
    
    @keyframes slideUp {
        from { transform: translate(-50%, 20px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
`;

export default ScriptureAdmin;
