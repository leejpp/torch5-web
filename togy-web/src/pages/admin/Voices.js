import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { db } from '../../firebase/config';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';

const STATUS = {
  PENDING: { value: 'PENDING', label: '접수 대기', color: colors.amber[500], bg: 'rgba(245, 158, 11, 0.1)' },
  ACCEPTED: { value: 'ACCEPTED', label: '접수됨', color: colors.green[500], bg: 'rgba(34, 197, 94, 0.1)' },
  HOLD: { value: 'HOLD', label: '보류', color: colors.orange[500], bg: 'rgba(249, 115, 22, 0.1)' },
  COMPLETED: { value: 'COMPLETED', label: '완료', color: colors.blue[500], bg: 'rgba(59, 130, 246, 0.1)' },
  REJECTED: { value: 'REJECTED', label: '반려', color: colors.red[500], bg: 'rgba(239, 68, 68, 0.1)' }
};

const VoicesAdmin = () => {
  const [voices, setVoices] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
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
      setVoices(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status: doc.data().status || 'PENDING'
      })));
    } catch (error) {
      console.error("Error fetching voices:", error);
      setMessage({ type: 'error', content: '마음의 소리를 불러오는 중 오류가 발생했습니다.' });
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
        <HeaderSection>
          <StatBadge>
            <span>📊</span>
            <span>총 {voices.length}개</span>
          </StatBadge>
        </HeaderSection>

        <FilterSection>
          <FilterGrid>
            <FilterButton
              $active={selectedStatus === 'ALL'}
              onClick={() => setSelectedStatus('ALL')}
            >
              <FilterLabel>전체</FilterLabel>
              <FilterCount>{voices.length}</FilterCount>
            </FilterButton>

            {Object.values(STATUS).map(status => (
              <FilterButton
                key={status.value}
                $active={selectedStatus === status.value}
                onClick={() => setSelectedStatus(status.value)}
                $statusColor={status.color}
                $statusBg={status.bg}
              >
                <FilterLabel>{status.label}</FilterLabel>
                <FilterCount>{statusStats[status.value] || 0}</FilterCount>
              </FilterButton>
            ))}
          </FilterGrid>
        </FilterSection>

        <VoicesSection>
          <SectionTitle>
            <SectionIcon>💬</SectionIcon>
            {selectedStatus === 'ALL' ? '전체 목록' : STATUS[selectedStatus]?.label}
            {filteredVoices.length > 0 && <VoiceCount>({filteredVoices.length})</VoiceCount>}
          </SectionTitle>

          {isLoading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>불러오는 중...</LoadingText>
            </LoadingContainer>
          ) : filteredVoices.length === 0 ? (
            <EmptyState>
              <EmptyIcon>💭</EmptyIcon>
              <EmptyTitle>데이터가 없습니다</EmptyTitle>
              <EmptyDescription>
                {selectedStatus === 'ALL'
                  ? '아직 접수된 의견이 없습니다.'
                  : '해당 상태의 의견이 없습니다.'}
              </EmptyDescription>
            </EmptyState>
          ) : (
            <VoicesList>
              {filteredVoices.map((voice, index) => (
                <VoiceCard key={voice.id} delay={index * 0.05}>
                  <VoiceHeader>
                    <VoiceDate>
                      {formatDate(voice.createdAt)}
                    </VoiceDate>
                    <StatusBadge
                      $color={STATUS[voice.status].color}
                      $bg={STATUS[voice.status].bg}
                      onClick={() => setStatusUpdateModal({
                        isOpen: true,
                        voiceId: voice.id,
                        currentStatus: voice.status
                      })}
                    >
                      {STATUS[voice.status].label}
                    </StatusBadge>
                  </VoiceHeader>

                  <VoiceContent>
                    <MessageText>{voice.message}</MessageText>
                  </VoiceContent>
                </VoiceCard>
              ))}
            </VoicesList>
          )}
        </VoicesSection>
      </MainContent>

      {message.content && (
        <MessagePopup $type={message.type}>
          <PopupIcon>
            {message.type === 'success' ? '✅' : '❌'}
          </PopupIcon>
          {message.content}
        </MessagePopup>
      )}

      {statusUpdateModal.isOpen && (
        <StatusModal onClick={() => !isUpdating && setStatusUpdateModal({ isOpen: false, voiceId: null, currentStatus: null })}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>상태 변경</ModalTitle>
            </ModalHeader>

            <StatusGrid>
              {Object.values(STATUS).map(status => (
                <StatusOptionButton
                  key={status.value}
                  $color={status.color}
                  $bg={status.bg}
                  $active={statusUpdateModal.currentStatus === status.value}
                  onClick={() => handleStatusUpdate(status.value)}
                  disabled={isUpdating}
                >
                  <StatusOptionLabel>{status.label}</StatusOptionLabel>
                </StatusOptionButton>
              ))}
            </StatusGrid>

            <ModalActions>
              <CancelButton
                onClick={() => setStatusUpdateModal({
                  isOpen: false,
                  voiceId: null,
                  currentStatus: null
                })}
                disabled={isUpdating}
              >
                닫기
              </CancelButton>
            </ModalActions>
          </ModalContent>
        </StatusModal>
      )}
    </Container>
  );
};

// 애니메이션
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const slideInUp = keyframes`
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// 스타일 컴포넌트
const Container = styled.div`
  min-height: 100vh;
  background-color: ${colors.background};
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${spacing['3xl']} ${spacing.lg};
  
  ${media['max-md']} {
    padding: ${spacing['2xl']} ${spacing.md};
  }
`;

const HeaderSection = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: ${spacing['3xl']};
  padding-bottom: ${spacing.xl};
  border-bottom: 1px solid ${colors.neutral[200]};
  animation: ${fadeInUp} 0.6s ease-out;

  ${media['max-md']} {
    flex-direction: column;
    align-items: flex-start;
    gap: ${spacing.lg};
  }
`;

const Title = styled.h1`
  font-size: ${typography.fontSize['3xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
  margin-bottom: ${spacing.xs};
  font-family: ${typography.fontFamily.heading};
`;

const Subtitle = styled.p`
  font-size: ${typography.fontSize.lg};
  color: ${colors.neutral[500]};
`;

const StatBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.sm} ${spacing.md};
  background-color: white;
  border: 1px solid ${colors.neutral[200]};
  border-radius: ${borderRadius.full};
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[600]};
  font-weight: ${typography.fontWeight.medium};
`;

const FilterSection = styled.div`
  margin-bottom: ${spacing['2xl']};
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
`;

const FilterGrid = styled.div`
  display: flex;
  gap: ${spacing.md};
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.md} ${spacing.lg};
  background: white;
  border: 1px solid ${props => props.$active ? (props.$statusColor || colors.primary[500]) : colors.neutral[200]};
  border-radius: ${borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  ${props => props.$active && `
    background: ${props.$statusBg || colors.primary[50]};
    box-shadow: 0 0 0 1px ${props.$statusColor || colors.primary[500]};
  `}

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.sm};
    border-color: ${props => props.$statusColor || colors.primary[500]};
  }
`;

const FilterLabel = styled.span`
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.neutral[700]};
  font-size: ${typography.fontSize.sm};
`;

const FilterCount = styled.span`
  background: ${colors.neutral[100]};
  padding: 2px 8px;
  border-radius: ${borderRadius.full};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[600]};
`;

const VoicesSection = styled.section`
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  color: ${colors.neutral[800]};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.xl};
  font-family: ${typography.fontFamily.heading};
`;

const SectionIcon = styled.span`
  font-size: ${typography.fontSize['2xl']};
`;

const VoiceCount = styled.span`
  color: ${colors.neutral[400]};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.medium};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${spacing['4xl']};
  color: ${colors.neutral[500]};
`;

const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid ${colors.neutral[200]};
  border-top-color: ${colors.primary[500]};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin-bottom: ${spacing.md};
`;

const LoadingText = styled.p`
  font-size: ${typography.fontSize.sm};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${spacing['4xl']};
  background: ${colors.neutral[50]};
  border-radius: ${borderRadius.xl};
  border: 1px dashed ${colors.neutral[300]};
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${spacing.lg};
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[700]};
  margin-bottom: ${spacing.xs};
`;

const EmptyDescription = styled.p`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.sm};
`;

const VoicesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const VoiceCard = styled.div`
  background: white;
  border-radius: ${borderRadius.xl};
  padding: ${spacing.xl};
  box-shadow: ${shadows.sm};
  border: 1px solid ${colors.neutral[200]};
  transition: all 0.2s ease;
  ${props => `animation: ${fadeInUp} 0.5s ease-out ${props.delay}s both;`}

  &:hover {
    box-shadow: ${shadows.md};
    transform: translateY(-2px);
  }
`;

const VoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.lg};
`;

const VoiceDate = styled.span`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.sm};
`;

const StatusBadge = styled.button`
  padding: ${spacing.xs} ${spacing.md};
  border-radius: ${borderRadius.full};
  background: ${props => props.$bg};
  color: ${props => props.$color};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.bold};
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    filter: brightness(0.95);
    transform: scale(1.05);
  }
`;

const VoiceContent = styled.div`
  color: ${colors.neutral[800]};
  line-height: 1.6;
`;

const MessageText = styled.p`
  white-space: pre-wrap;
  font-size: ${typography.fontSize.base};
`;

const MessagePopup = styled.div`
  position: fixed;
  bottom: ${spacing['2xl']};
  right: ${spacing['2xl']};
  background: white;
  padding: ${spacing.lg} ${spacing.xl};
  border-radius: ${borderRadius.xl};
  box-shadow: ${shadows.xl};
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  z-index: 1000;
  animation: ${slideInUp} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid ${props => props.$type === 'error' ? colors.red[100] : colors.green[100]};
  
  ${props => props.$type === 'error' && `border-left: 4px solid ${colors.red[500]};`}
  ${props => props.$type === 'success' && `border-left: 4px solid ${colors.green[500]};`}
`;

const PopupIcon = styled.span`
  font-size: ${typography.fontSize.xl};
`;

const StatusModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${spacing.md};
  animation: ${fadeInUp} 0.2s ease-out;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: ${borderRadius['2xl']};
  padding: ${spacing['2xl']};
  width: 100%;
  max-width: 400px;
  box-shadow: ${shadows['2xl']};
`;

const ModalHeader = styled.div`
  text-align: center;
  margin-bottom: ${spacing.xl};
`;

const ModalTitle = styled.h3`
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.xl};
`;

const StatusOptionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.md};
  border: 1px solid ${props => props.$active ? props.$color : colors.neutral[200]};
  border-radius: ${borderRadius.lg};
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.$active && `
    background: ${props.$bg};
    box-shadow: 0 0 0 1px ${props.$color};
  `}

  &:hover {
    border-color: ${props => props.$color};
    background: ${props => props.$bg};
  }
`;

const StatusOptionLabel = styled.span`
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.neutral[800]};
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: center;
`;

const CancelButton = styled.button`
  padding: ${spacing.md} ${spacing['2xl']};
  background: ${colors.neutral[100]};
  color: ${colors.neutral[700]};
  border: none;
  border-radius: ${borderRadius.lg};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${colors.neutral[200]};
  }
`;

export default VoicesAdmin;
