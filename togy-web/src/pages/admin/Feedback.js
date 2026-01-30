import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../../firebase/config';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';

const STATUS = {
    PENDING: { value: 'PENDING', label: '확인 전', color: colors.amber[500], bg: 'rgba(245, 158, 11, 0.1)' },
    COMPLETED: { value: 'COMPLETED', label: '확인 완료', color: colors.green[500], bg: 'rgba(34, 197, 94, 0.1)' }
};

const FeedbackAdmin = () => {
    const [voices, setVoices] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [statusUpdateModal, setStatusUpdateModal] = useState({
        isOpen: false,
        voiceId: null,
        currentStatus: null
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', content: '' });

    useEffect(() => {
        fetchVoices();
    }, []);

    const fetchVoices = async () => {
        try {
            const q = query(
                collection(db, 'voices'),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);

            // Data mapping and status normalization
            const voiceData = snapshot.docs.map(doc => {
                const data = doc.data();
                let status = data.status || 'PENDING';

                // Map old statuses to new simplified ones
                if (['ACCEPTED', 'HOLD', 'REJECTED'].includes(status)) {
                    status = 'COMPLETED';
                }

                return {
                    id: doc.id,
                    ...data,
                    status
                };
            });

            setVoices(voiceData);
        } catch (error) {
            console.error("Error fetching feedback:", error);
            setMessage({ type: 'error', content: '피드백을 불러오는 중 오류가 발생했습니다.' });
            setTimeout(() => setMessage({ type: '', content: '' }), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setIsUpdating(true);
        try {
            const voiceRef = doc(db, 'voices', statusUpdateModal.voiceId);
            await updateDoc(voiceRef, {
                status: newStatus,
                statusUpdatedAt: new Date()
            });

            await fetchVoices();
            setMessage({ type: 'success', content: '상태가 성공적으로 변경되었습니다.' });
            setTimeout(() => setMessage({ type: '', content: '' }), 3000);
            setStatusUpdateModal({ isOpen: false, voiceId: null, currentStatus: null });
        } catch (error) {
            console.error("Error updating status:", error);
            setMessage({ type: 'error', content: '상태 변경 중 오류가 발생했습니다.' });
            setTimeout(() => setMessage({ type: '', content: '' }), 3000);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('정말로 이 피드백을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.')) return;

        setIsUpdating(true);
        try {
            await deleteDoc(doc(db, 'voices', id));
            setVoices(prev => prev.filter(voice => voice.id !== id));
            setMessage({ type: 'success', content: '피드백이 삭제되었습니다.' });
            setTimeout(() => setMessage({ type: '', content: '' }), 3000);
        } catch (error) {
            console.error("Error deleting feedback:", error);
            setMessage({ type: 'error', content: '삭제 중 오류가 발생했습니다.' });
            setTimeout(() => setMessage({ type: '', content: '' }), 3000);
        } finally {
            setIsUpdating(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp.seconds * 1000);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            return diffInMinutes < 1 ? '방금 전' : `${diffInMinutes}분 전`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}시간 전`;
        } else if (diffInHours < 24 * 7) {
            return `${Math.floor(diffInHours / 24)}일 전`;
        } else {
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    const filteredVoices = voices.filter(voice =>
        selectedStatus === 'ALL' || voice.status === selectedStatus
    );

    const getStatusStats = () => {
        const stats = {};
        voices.forEach(voice => {
            stats[voice.status] = (stats[voice.status] || 0) + 1;
        });
        return stats;
    };

    const statusStats = getStatusStats();

    return (
        <Container>
            <MainContent>
                <TopNav>
                    <BackToMain to="/admin">⬅︎ 관리자 메인으로 돌아가기</BackToMain>
                </TopNav>

                <HeaderSection>
                    <Title>사이트 피드백 관리</Title>
                    <Stats>
                        <StatText>총 {voices.length}개</StatText>
                    </Stats>
                </HeaderSection>

                <FilterContainer>
                    <FilterButton
                        $active={selectedStatus === 'ALL'}
                        onClick={() => setSelectedStatus('ALL')}
                    >
                        전체 ({voices.length})
                    </FilterButton>
                    {Object.values(STATUS).map(status => (
                        <FilterButton
                            key={status.value}
                            $active={selectedStatus === status.value}
                            onClick={() => setSelectedStatus(status.value)}
                        >
                            {status.label} ({statusStats[status.value] || 0})
                        </FilterButton>
                    ))}
                </FilterContainer>

                <VoicesList>
                    {isLoading ? (
                        <Message>불러오는 중...</Message>
                    ) : filteredVoices.length === 0 ? (
                        <Message>등록된 글이 없습니다.</Message>
                    ) : (
                        filteredVoices.map((voice) => (
                            <VoiceItem key={voice.id}>
                                <VoiceHeader>
                                    <DateText>{formatDate(voice.createdAt)}</DateText>
                                    <ActionGroup>
                                        <StatusPill
                                            $status={voice.status}
                                            onClick={() => setStatusUpdateModal({
                                                isOpen: true,
                                                voiceId: voice.id,
                                                currentStatus: voice.status
                                            })}
                                        >
                                            {STATUS[voice.status]?.label || voice.status}
                                        </StatusPill>
                                        <DeleteButton onClick={() => handleDelete(voice.id)}>삭제</DeleteButton>
                                    </ActionGroup>
                                </VoiceHeader>
                                <VoiceMessage>{voice.message}</VoiceMessage>
                            </VoiceItem>
                        ))
                    )}
                </VoicesList>
            </MainContent>

            {statusUpdateModal.isOpen && (
                <Overlay onClick={() => !isUpdating && setStatusUpdateModal({ isOpen: false, voiceId: null, currentStatus: null })}>
                    <Modal onClick={(e) => e.stopPropagation()}>
                        <ModalTitle>상태 변경</ModalTitle>
                        <ModalGrid>
                            {Object.values(STATUS).map(status => (
                                <StatusOption
                                    key={status.value}
                                    $selected={statusUpdateModal.currentStatus === status.value}
                                    $color={status.color}
                                    onClick={() => handleStatusUpdate(status.value)}
                                    disabled={isUpdating}
                                >
                                    {status.label}
                                </StatusOption>
                            ))}
                        </ModalGrid>
                        <CloseButton onClick={() => setStatusUpdateModal({ isOpen: false, voiceId: null, currentStatus: null })}>
                            닫기
                        </CloseButton>
                    </Modal>
                </Overlay>
            )}

            {message.content && (
                <Toast $type={message.type}>
                    {message.content}
                </Toast>
            )}
        </Container>
    );
};

// Styles
const Container = styled.div`
  min-height: 100vh;
  background-color: #ffffff;
  padding: ${spacing.xl};
`;

const MainContent = styled.main`
  max-width: 800px;
  margin: 0 auto;
`;

const TopNav = styled.div`
    margin-bottom: ${spacing.lg};
`;

const BackToMain = styled(Link)`
    color: ${colors.neutral[500]};
    text-decoration: none;
    font-size: ${typography.fontSize.sm};
    display: inline-flex;
    align-items: center;
    transition: color 0.2s;

    &:hover {
        color: ${colors.neutral[900]};
        text-decoration: underline;
    }
`;

const HeaderSection = styled.div`
  margin-bottom: ${spacing.xl};
  border-bottom: 2px solid ${colors.neutral[100]};
  padding-bottom: ${spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const Title = styled.h1`
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
`;

const Stats = styled.div`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.sm};
`;

const StatText = styled.span``;

const FilterContainer = styled.div`
  display: flex;
  gap: ${spacing.sm};
  margin-bottom: ${spacing['2xl']};
  flex-wrap: wrap;
    padding-bottom: ${spacing.lg};
    border-bottom: 1px solid ${colors.neutral[100]};
`;

const FilterButton = styled.button`
  background: ${props => props.$active ? colors.neutral[900] : 'white'};
  color: ${props => props.$active ? 'white' : colors.neutral[600]};
  border: 1px solid ${props => props.$active ? colors.neutral[900] : colors.neutral[300]};
  padding: ${spacing.xs} ${spacing.md};
  border-radius: ${borderRadius.full};
  font-size: ${typography.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${colors.neutral[900]};
    color: ${props => props.$active ? 'white' : colors.neutral[900]};
  }
`;

const VoicesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const VoiceItem = styled.div`
  background: white;
  border: 1px solid ${colors.neutral[200]};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.lg};
  transition: border-color 0.2s;
  
  &:hover {
    border-color: ${colors.neutral[400]};
  }
`;

const VoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.md};
`;

const DateText = styled.span`
  color: ${colors.neutral[400]};
  font-size: ${typography.fontSize.xs};
`;

const ActionGroup = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.sm};
`;

const DeleteButton = styled.button`
    background: none;
    border: none;
    color: ${colors.neutral[400]};
    font-size: ${typography.fontSize.xs};
    cursor: pointer;
    padding: 4px 8px;
    
    &:hover {
        color: ${colors.red[600]};
        text-decoration: underline;
    }
`;

const StatusPill = styled.button`
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  border: none;
  background: ${props => {
        switch (props.$status) {
            case 'COMPLETED': return colors.green[100];
            default: return colors.amber[100];
        }
    }};
  color: ${props => {
        switch (props.$status) {
            case 'COMPLETED': return colors.green[700];
            default: return colors.amber[700];
        }
    }};
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
`;

const VoiceMessage = styled.p`
  color: ${colors.neutral[800]};
  font-size: ${typography.fontSize.base};
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
`;

const Message = styled.p`
  text-align: center;
  color: ${colors.neutral[500]};
  padding: ${spacing.xl};
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  padding: ${spacing.xl};
  border-radius: ${borderRadius.lg};
  width: 90%;
  max-width: 320px;
`;

const ModalTitle = styled.h3`
  font-weight: bold;
  text-align: center;
  margin-bottom: ${spacing.lg};
  color: ${colors.neutral[900]};
`;

const ModalGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.lg};
`;

const StatusOption = styled.button`
  background: white;
  border: 1px solid ${props => props.$selected ? props.$color : colors.neutral[200]};
  color: ${props => props.$selected ? props.$color : colors.neutral[700]};
  padding: ${spacing.md};
  border-radius: ${borderRadius.md};
  font-weight: ${props => props.$selected ? 'bold' : 'normal'};
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.$color};
    color: ${props => props.$color};
    background: ${colors.neutral[50]};
  }
  
  ${props => props.$selected && `
    background: ${colors.neutral[50]};
    box-shadow: 0 0 0 1px ${props.$color};
  `}
`;

const CloseButton = styled.button`
  width: 100%;
  padding: ${spacing.md};
  background: ${colors.neutral[100]};
  border: none;
  border-radius: ${borderRadius.md};
  color: ${colors.neutral[600]};
  cursor: pointer;
  
  &:hover {
    background: ${colors.neutral[200]};
  }
`;

const Toast = styled.div`
  position: fixed;
  bottom: ${spacing.xl};
  left: 50%;
  transform: translateX(-50%);
  background: ${colors.neutral[900]};
  color: white;
  padding: ${spacing.md} ${spacing.xl};
  border-radius: ${borderRadius.full};
  font-size: ${typography.fontSize.sm};
  box-shadow: ${shadows.lg};
  animation: fadeUp 0.3s ease-out;
  
  @keyframes fadeUp {
    from { opacity: 0; transform: translate(-50%, 20px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }
`;

export default FeedbackAdmin;
