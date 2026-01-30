import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { SermonService } from '../../services/SermonService';
import { getYoutubeId, getThumbnailUrl } from '../../utils/youtube';
import { colors, typography, spacing, borderRadius, shadows, media } from '../../styles/designSystem';

const SERVICE_TYPES = ['주일대예배', '주일오후예배', '수요저녁예배', '금요철야예배', '청년부예배', '주일학교예배', '기타'];

const SermonsAdmin = () => {
    const [sermons, setSermons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSermon, setEditingSermon] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        preacher: '',
        date: '',
        serviceType: '주일대예배',
        scripture: '',
        youtubeUrl: ''
    });

    // Toast State
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({ show: false, sermonId: null, sermonTitle: '' });

    useEffect(() => {
        fetchSermons();
    }, []);

    const fetchSermons = async () => {
        setIsLoading(true);
        try {
            const { sermons: data } = await SermonService.getSermons(null, 20); // Fetch last 20 by default for admin
            setSermons(data);
        } catch (error) {
            console.error(error);
            showToast('데이터를 불러오는데 실패했습니다.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.title || !formData.date || !formData.youtubeUrl) {
            showToast('필수 항목을 모두 입력해주세요 (제목, 날짜, 유튜브링크).', 'error');
            return false;
        }
        if (!getYoutubeId(formData.youtubeUrl)) {
            showToast('유효한 유튜브 링크가 아닙니다.', 'error');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const youtubeId = getYoutubeId(formData.youtubeUrl);
        const sermonData = {
            ...formData,
            youtubeId
        };

        try {
            if (editingSermon) {
                await SermonService.updateSermon(editingSermon.id, sermonData);
                showToast('설교 영상이 수정되었습니다.');
            } else {
                await SermonService.createSermon(sermonData);
                showToast('새 설교 영상이 등록되었습니다.');
            }
            closeForm();
            fetchSermons();
        } catch (error) {
            console.error(error);
            showToast('오류가 발생했습니다.', 'error');
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.sermonId) return;

        try {
            await SermonService.deleteSermon(deleteModal.sermonId);
            showToast('삭제되었습니다.');
            setDeleteModal({ show: false, sermonId: null, sermonTitle: '' });
            fetchSermons();
        } catch (error) {
            console.error(error);
            showToast('삭제 중 오류가 발생했습니다.', 'error');
        }
    };

    const openEditForm = (sermon) => {
        setEditingSermon(sermon);
        setFormData({
            title: sermon.title,
            preacher: sermon.preacher || '',
            date: sermon.date,
            serviceType: sermon.serviceType || '주일대예배',
            scripture: sermon.scripture || '',
            youtubeUrl: sermon.youtubeUrl
        });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingSermon(null);
        setFormData({
            title: '',
            preacher: '',
            date: '',
            serviceType: '주일대예배',
            scripture: '',
            youtubeUrl: ''
        });
    };

    return (
        <Container>
            <Header>
                <TitleSection>
                    <SubHeader>Media Center</SubHeader>
                    <PageTitle>설교 영상 관리</PageTitle>
                </TitleSection>
            </Header>

            <ActionBar>
                <AddButton onClick={() => setIsFormOpen(true)}>+ 새 영상 등록</AddButton>
                {/* Temporary Migration Button - Can be removed after use */}
                <MigrateButton onClick={async () => {
                    if (!window.confirm('기존 데이터의 예배 이름을 최신 버전으로 변경하시겠습니까?')) return;
                    try {
                        const { sermons: allSermons } = await SermonService.getSermons(null, 1000); // Fetch ample amount
                        let count = 0;
                        for (const sermon of allSermons) {
                            let newType = null;
                            if (sermon.serviceType === '오후예배') newType = '주일오후예배';
                            else if (sermon.serviceType === '수요예배' || sermon.serviceType === '수요찬양예배') newType = '수요저녁예배';
                            else if (sermon.serviceType === '금요기도회') newType = '금요철야예배';

                            if (newType) {
                                await SermonService.updateSermon(sermon.id, { serviceType: newType });
                                count++;
                            }
                        }
                        alert(`${count}개의 영상 데이터가 성공적으로 업데이트되었습니다.`);
                        fetchSermons();
                    } catch (e) {
                        console.error(e);
                        alert('업데이트 중 오류가 발생했습니다.');
                    }
                }}>🔄 데이터 일괄 변경</MigrateButton>
            </ActionBar>

            {/* List Section */}
            <ListContainer>
                {isLoading ? (
                    <EmptyState>로딩 중...</EmptyState>
                ) : sermons.length > 0 ? (
                    <SermonTable>
                        <thead>
                            <tr>
                                <th>썸네일</th>
                                <th>날짜/구분</th>
                                <th>제목/설교자</th>
                                <th>조회수</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sermons.map(sermon => (
                                <tr key={sermon.id}>
                                    <td width="120px">
                                        <Thumbnail src={getThumbnailUrl(sermon.youtubeId)} />
                                    </td>
                                    <td>
                                        <DateText>{sermon.date}</DateText>
                                        <Badge>{sermon.serviceType}</Badge>
                                    </td>
                                    <td>
                                        <SermonTitle>{sermon.title}</SermonTitle>
                                        <Preacher>{sermon.preacher} {sermon.scripture && `| ${sermon.scripture}`}</Preacher>
                                    </td>
                                    <td>{sermon.viewCount || 0}</td>
                                    <td>
                                        <ActionGroup>
                                            <ActionButton onClick={() => openEditForm(sermon)}>✏️</ActionButton>
                                            <ActionButton $danger onClick={() => setDeleteModal({ show: true, sermonId: sermon.id, sermonTitle: sermon.title })}>🗑️</ActionButton>
                                        </ActionGroup>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </SermonTable>
                ) : (
                    <EmptyState>등록된 설교 영상이 없습니다.</EmptyState>
                )}
            </ListContainer>

            {/* Create/Edit Modal */}
            {isFormOpen && (
                <ModalOverlay onClick={closeForm}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>{editingSermon ? '설교 영상 수정' : '새 영상 등록'}</ModalTitle>
                            <CloseButton onClick={closeForm}>✕</CloseButton>
                        </ModalHeader>
                        <Form onSubmit={handleSubmit}>
                            <FormGrid>
                                <FormGroup>
                                    <Label>예배 날짜 *</Label>
                                    <Input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>예배 구분 *</Label>
                                    <Select name="serviceType" value={formData.serviceType} onChange={handleInputChange}>
                                        {SERVICE_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </Select>
                                </FormGroup>
                                <FormGroup style={{ gridColumn: '1 / -1' }}>
                                    <Label>설교 제목 *</Label>
                                    <Input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="설교 제목을 입력하세요"
                                        required
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>설교자</Label>
                                    <Input
                                        name="preacher"
                                        value={formData.preacher}
                                        onChange={handleInputChange}
                                        placeholder="설교자 이름 (예: 홍길동 목사)"
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>본문 말씀</Label>
                                    <Input
                                        name="scripture"
                                        value={formData.scripture}
                                        onChange={handleInputChange}
                                        placeholder="예: 요한복음 3:16"
                                    />
                                </FormGroup>
                                <FormGroup style={{ gridColumn: '1 / -1' }}>
                                    <Label>유튜브 링크 *</Label>
                                    <Input
                                        name="youtubeUrl"
                                        value={formData.youtubeUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://youtu.be/..."
                                        required
                                    />
                                    {getYoutubeId(formData.youtubeUrl) && (
                                        <PreviewArea>
                                            <p>썸네일 미리보기:</p>
                                            <img src={getThumbnailUrl(getYoutubeId(formData.youtubeUrl))} alt="Preview" />
                                        </PreviewArea>
                                    )}
                                </FormGroup>
                            </FormGrid>
                            <FormActions>
                                <CancelButton type="button" onClick={closeForm}>취소</CancelButton>
                                <SubmitButton type="submit">{editingSermon ? '수정 완료' : '등록하기'}</SubmitButton>
                            </FormActions>
                        </Form>
                    </ModalContent>
                </ModalOverlay>
            )}

            {/* Delete Modal */}
            {deleteModal.show && (
                <ModalOverlay>
                    <DeleteModalContent>
                        <DeleteIcon>🗑️</DeleteIcon>
                        <ModalTitle>영상 삭제</ModalTitle>
                        <p>정말 <strong>{deleteModal.sermonTitle}</strong> 영상을 삭제하시겠습니까?<br />이 작업은 되돌릴 수 없습니다.</p>
                        <FormActions>
                            <CancelButton onClick={() => setDeleteModal({ show: false, sermonId: null, sermonTitle: '' })}>취소</CancelButton>
                            <DeleteConfirmButton onClick={handleDelete}>삭제하기</DeleteConfirmButton>
                        </FormActions>
                    </DeleteModalContent>
                </ModalOverlay>
            )}

            {/* Toast */}
            {toast.show && (
                <Toast $type={toast.type}>{toast.message}</Toast>
            )}
        </Container>
    );
};

// Styles
const Container = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: ${spacing.xl};
    min-height: 100vh;
    background-color: ${colors.neutral[50]};
    ${media['max-md']} { padding: ${spacing.md}; }
`;

const Header = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: ${spacing.xl};
    padding-bottom: ${spacing.lg};
    border-bottom: 1px solid ${colors.neutral[200]};
    ${media['max-md']} { flex-direction: column; align-items: flex-start; gap: ${spacing.md}; }
`;

const TitleSection = styled.div` display: flex; flex-direction: column; `;
const SubHeader = styled.span` font-size: 0.9rem; color: ${colors.neutral[500]}; text-transform: uppercase; font-weight: 600; `;
const PageTitle = styled.h1` font-size: 2rem; color: ${colors.neutral[900]}; font-weight: bold; `;

const ActionBar = styled.div` display: flex; justify-content: flex-end; margin-bottom: ${spacing.lg}; `;

const AddButton = styled.button`
    background-color: ${colors.primary[600]}; color: white; border: none; padding: ${spacing.md} ${spacing.xl};
    border-radius: ${borderRadius.lg}; font-weight: bold; cursor: pointer; transition: 0.2s;
    &:hover { background-color: ${colors.primary[700]}; }
`;

const MigrateButton = styled.button`
    margin-left: 10px;
    background-color: ${colors.secondary[500]}; color: white; border: none; padding: ${spacing.md} ${spacing.lg};
    border-radius: ${borderRadius.lg}; font-weight: bold; cursor: pointer; transition: 0.2s;
    &:hover { background-color: ${colors.secondary[600]}; }
`;

const ListContainer = styled.div` background: white; border-radius: ${borderRadius.xl}; box-shadow: ${shadows.sm}; overflow: hidden; `;

const SermonTable = styled.table`
    width: 100%; border-collapse: collapse;
    th, td { padding: ${spacing.md}; text-align: left; vertical-align: middle; border-bottom: 1px solid ${colors.neutral[100]}; }
    th { background: ${colors.neutral[50]}; font-weight: 600; color: ${colors.neutral[600]}; }
    ${media['max-md']} { font-size: 0.9rem; th, td { padding: ${spacing.sm}; } }
`;

const Thumbnail = styled.img` width: 120px; height: 68px; object-fit: cover; border-radius: ${borderRadius.md}; background: #eee; `;
const DateText = styled.div` font-weight: 600; color: ${colors.neutral[800]}; `;
const Badge = styled.span` display: inline-block; background: ${colors.secondary[100]}; color: ${colors.secondary[700]}; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; margin-top: 4px; `;
const SermonTitle = styled.div` font-weight: bold; font-size: 1.1rem; color: ${colors.neutral[900]}; margin-bottom: 4px; `;
const Preacher = styled.div` color: ${colors.neutral[500]}; font-size: 0.9rem; `;

const ActionGroup = styled.div` display: flex; gap: 8px; `;
const ActionButton = styled.button`
    background: none; border: 1px solid ${colors.neutral[200]}; padding: 6px; border-radius: 6px; cursor: pointer;
    &:hover { background: ${colors.neutral[100]}; }
    ${props => props.$danger && `&:hover { background: ${colors.error[50]}; border-color: ${colors.error[200]}; }`}
`;

const EmptyState = styled.div` padding: ${spacing['4xl']}; text-align: center; color: ${colors.neutral[500]}; `;

// Form & Modal
const ModalOverlay = styled.div`
    position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5);
    display: flex; justify-content: center; align-items: center; z-index: 1000; padding: ${spacing.md};
`;
const ModalContent = styled.div` background: white; padding: ${spacing.xl}; border-radius: ${borderRadius.xl}; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; `;
const ModalHeader = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: ${spacing.lg}; `;
const ModalTitle = styled.h3` font-size: 1.5rem; font-weight: bold; `;
const CloseButton = styled.button` background: none; border: none; font-size: 1.5rem; cursor: pointer; `;

const Form = styled.form` display: flex; flex-direction: column; gap: ${spacing.lg}; `;
const FormGrid = styled.div`
    display: grid; grid-template-columns: 1fr 1fr; gap: ${spacing.lg};
    ${media['max-md']} { grid-template-columns: 1fr; gap: ${spacing.md}; }
`;
const FormGroup = styled.div` display: flex; flex-direction: column; gap: 6px; `;
const Label = styled.label` font-size: 0.9rem; font-weight: 600; color: ${colors.neutral[700]}; `;
const Input = styled.input` padding: 10px; border: 1px solid ${colors.neutral[300]}; border-radius: ${borderRadius.md}; &:focus { outline: none; border-color: ${colors.primary[500]}; } `;
const Select = styled.select` padding: 10px; border: 1px solid ${colors.neutral[300]}; border-radius: ${borderRadius.md}; background: white; `;
const PreviewArea = styled.div`
    margin-top: 10px;
    p { font-size: 0.8rem; color: ${colors.neutral[500]}; margin-bottom: 4px; }
    img { width: 100%; max-width: 200px; border-radius: ${borderRadius.md}; }
`;

const FormActions = styled.div` display: flex; justify-content: flex-end; gap: ${spacing.md}; margin-top: ${spacing.md}; `;
const CancelButton = styled.button` padding: 10px 20px; background: ${colors.neutral[100]}; border: none; border-radius: ${borderRadius.md}; cursor: pointer; &:hover { background: ${colors.neutral[200]}; } `;
const SubmitButton = styled.button` padding: 10px 20px; background: ${colors.primary[600]}; color: white; border: none; border-radius: ${borderRadius.md}; font-weight: bold; cursor: pointer; &:hover { background: ${colors.primary[700]}; } `;

const DeleteModalContent = styled(ModalContent)` max-width: 400px; text-align: center; `;
const DeleteIcon = styled.div` font-size: 3rem; margin-bottom: ${spacing.md}; `;
const DeleteConfirmButton = styled(SubmitButton)` background: ${colors.error[600]}; &:hover { background: ${colors.error[700]}; } `;

const Toast = styled.div`
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    padding: 10px 20px; background: ${props => props.$type === 'error' ? colors.error[600] : colors.primary[600]};
    color: white; border-radius: 30px; box-shadow: ${shadows.lg}; z-index: 2000;
`;

export default SermonsAdmin;
