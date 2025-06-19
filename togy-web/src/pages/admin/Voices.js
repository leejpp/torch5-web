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
      <BackgroundOverlay />
      
      <Header>
        <HeaderContent>
          <AdminBadge>
            <BadgeIcon>👑</BadgeIcon>
            <BadgeText>관리자</BadgeText>
          </AdminBadge>
          
          <TitleSection>
            <HeaderIcon>💌</HeaderIcon>
            <Title>마음의 소리 관리</Title>
            <Subtitle>청년부 의견 및 제안사항 관리</Subtitle>
          </TitleSection>
          
          <StatsCard>
            <StatsIcon>📊</StatsIcon>
            <StatsText>총 {voices.length}개의 마음의 소리가 접수되었습니다</StatsText>
          </StatsCard>
        </HeaderContent>
      </Header>

      <MainContent>
        <FilterSection>
          <SectionTitle>
            <SectionIcon>🎛️</SectionIcon>
            상태별 필터
          </SectionTitle>
          
          <FilterGrid>
            <FilterButton 
              $active={selectedStatus === 'ALL'}
              onClick={() => setSelectedStatus('ALL')}
            >
              <FilterIcon>📋</FilterIcon>
              <FilterInfo>
                <FilterLabel>전체보기</FilterLabel>
                <FilterCount>{voices.length}</FilterCount>
              </FilterInfo>
            </FilterButton>
            
            {Object.values(STATUS).map(status => (
              <FilterButton
                key={status.value}
                $active={selectedStatus === status.value}
                onClick={() => setSelectedStatus(status.value)}
                $statusColor={status.color}
                $statusBg={status.bg}
              >
                <FilterIcon>
                  {status.value === 'PENDING' && '⏳'}
                  {status.value === 'ACCEPTED' && '✅'}
                  {status.value === 'HOLD' && '⏸️'}
                  {status.value === 'COMPLETED' && '🎉'}
                  {status.value === 'REJECTED' && '❌'}
                </FilterIcon>
                <FilterInfo>
                  <FilterLabel>{status.label}</FilterLabel>
                  <FilterCount>{statusStats[status.value] || 0}</FilterCount>
                </FilterInfo>
              </FilterButton>
            ))}
          </FilterGrid>
        </FilterSection>

        <VoicesSection>
          <SectionTitle>
            <SectionIcon>💬</SectionIcon>
            {selectedStatus === 'ALL' ? '전체 마음의 소리' : STATUS[selectedStatus]?.label || '마음의 소리'}
            {filteredVoices.length > 0 && <VoiceCount>({filteredVoices.length})</VoiceCount>}
          </SectionTitle>

          {isLoading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>마음의 소리를 불러오는 중...</LoadingText>
            </LoadingContainer>
          ) : filteredVoices.length === 0 ? (
            <EmptyState>
              <EmptyIcon>💭</EmptyIcon>
              <EmptyTitle>
                {selectedStatus === 'ALL' 
                  ? '아직 전달된 마음의 소리가 없습니다'
                  : `${STATUS[selectedStatus]?.label || ''} 상태의 마음의 소리가 없습니다`}
              </EmptyTitle>
              <EmptyDescription>
                청년부 구성원들의 소중한 의견을 기다리고 있습니다
              </EmptyDescription>
            </EmptyState>
          ) : (
            <VoicesList>
              {filteredVoices.map((voice, index) => (
                <VoiceCard key={voice.id} delay={index * 0.1}>
                  <VoiceHeader>
                    <VoiceDate>
                      <DateIcon>🕐</DateIcon>
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
                      <StatusIcon>
                        {voice.status === 'PENDING' && '⏳'}
                        {voice.status === 'ACCEPTED' && '✅'}
                        {voice.status === 'HOLD' && '⏸️'}
                        {voice.status === 'COMPLETED' && '🎉'}
                        {voice.status === 'REJECTED' && '❌'}
                      </StatusIcon>
                      {STATUS[voice.status].label}
                      <ChangeIcon>⚙️</ChangeIcon>
                    </StatusBadge>
                  </VoiceHeader>
                  
                  <VoiceContent>
                    <ContentIcon>💬</ContentIcon>
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
              <ModalIcon>⚙️</ModalIcon>
              <ModalTitle>상태 변경</ModalTitle>
            </ModalHeader>
            
            <ModalDescription>
              이 마음의 소리의 처리 상태를 변경하세요
            </ModalDescription>
            
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
                  {isUpdating ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <StatusOptionIcon>
                        {status.value === 'PENDING' && '⏳'}
                        {status.value === 'ACCEPTED' && '✅'}
                        {status.value === 'HOLD' && '⏸️'}
                        {status.value === 'COMPLETED' && '🎉'}
                        {status.value === 'REJECTED' && '❌'}
                      </StatusOptionIcon>
                      <StatusOptionLabel>{status.label}</StatusOptionLabel>
                    </>
                  )}
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
                <ButtonIcon>❌</ButtonIcon>
                취소
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
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
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
  position: relative;
  overflow-x: hidden;
`;

const BackgroundOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  z-index: -2;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, rgba(59, 130, 246, 0.03) 0%, transparent 50%);
  }
`;

const Header = styled.header`
  background: ${colors.gradients.secondary};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  }
`;

const HeaderContent = styled.div`
  position: relative;
  padding: ${spacing['4xl']} ${spacing['2xl']} ${spacing['3xl']};
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  
  ${media['max-md']} {
    padding: ${spacing['3xl']} ${spacing.lg} ${spacing['2xl']};
  }
`;

const AdminBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.sm};
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${borderRadius.full};
  padding: ${spacing.sm} ${spacing.lg};
  margin-bottom: ${spacing.xl};
  animation: ${fadeInUp} 0.8s ease-out;
`;

const BadgeIcon = styled.span`
  font-size: ${typography.fontSize.lg};
`;

const BadgeText = styled.span`
  color: white;
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
`;

const TitleSection = styled.div`
  margin-bottom: ${spacing.xl};
`;

const HeaderIcon = styled.div`
  font-size: ${typography.fontSize['4xl']};
  margin-bottom: ${spacing.lg};
  animation: ${float} 3s ease-in-out infinite, ${fadeInUp} 0.8s ease-out 0.2s both;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  
  ${media['max-md']} {
    font-size: ${typography.fontSize['3xl']};
  }
`;

const Title = styled.h1`
  color: white;
  font-size: ${typography.fontSize['4xl']};
  font-weight: ${typography.fontWeight.extrabold};
  margin-bottom: ${spacing.sm};
  font-family: ${typography.fontFamily.heading};
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  
  ${media['max-md']} {
    font-size: ${typography.fontSize['2xl']};
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.medium};
  animation: ${fadeInUp} 0.8s ease-out 0.6s both;
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.lg};
  }
`;

const StatsCard = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.sm};
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: ${borderRadius.xl};
  padding: ${spacing.lg} ${spacing.xl};
  animation: ${fadeInUp} 0.8s ease-out 0.8s both;
  
  ${media['max-md']} {
    padding: ${spacing.md} ${spacing.lg};
  }
`;

const StatsIcon = styled.span`
  font-size: ${typography.fontSize.lg};
`;

const StatsText = styled.span`
  color: white;
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.medium};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.sm};
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${spacing['3xl']} ${spacing.lg};
  
  ${media['max-md']} {
    padding: ${spacing['2xl']} ${spacing.md};
  }
`;

const FilterSection = styled.section`
  margin-bottom: ${spacing['4xl']};
  animation: ${fadeInUp} 0.8s ease-out 1s both;
`;

const VoicesSection = styled.section`
  animation: ${fadeInUp} 0.8s ease-out 1.2s both;
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: ${spacing.lg};
  color: ${colors.neutral[800]};
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing['2xl']};
  font-family: ${typography.fontFamily.heading};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.xl};
    margin-bottom: ${spacing.xl};
  }
`;

const SectionIcon = styled.span`
  font-size: ${typography.fontSize['2xl']};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.xl};
  }
`;

const VoiceCount = styled.span`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.normal};
  margin-left: ${spacing.sm};
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${spacing.lg};
  
  ${media['max-md']} {
    grid-template-columns: 1fr;
    gap: ${spacing.md};
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.lg};
  padding: ${spacing.lg} ${spacing.xl};
  background: ${props => props.$active 
    ? (props.$statusBg || 'rgba(59, 130, 246, 0.1)') 
    : 'rgba(255, 255, 255, 0.95)'};
  backdrop-filter: blur(20px);
  border: 2px solid ${props => props.$active 
    ? (props.$statusColor || colors.primary[400]) 
    : 'rgba(255, 255, 255, 0.3)'};
  border-radius: ${borderRadius.xl};
  color: ${props => props.$active 
    ? (props.$statusColor || colors.primary[700]) 
    : colors.neutral[600]};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.medium};
  box-shadow: ${props => props.$active ? shadows.lg : shadows.md};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.lg};
    background: ${props => props.$statusBg || 'rgba(59, 130, 246, 0.05)'};
    border-color: ${props => props.$statusColor || colors.primary[300]};
  }
`;

const FilterIcon = styled.span`
  font-size: ${typography.fontSize.xl};
  flex-shrink: 0;
`;

const FilterInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
`;

const FilterLabel = styled.span`
  font-weight: ${typography.fontWeight.semibold};
`;

const FilterCount = styled.span`
  font-size: ${typography.fontSize.sm};
  opacity: 0.8;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.lg};
  padding: ${spacing['4xl']};
  color: ${colors.neutral[600]};
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(139, 92, 246, 0.2);
  border-top: 3px solid ${colors.secondary[500]};
  border-radius: ${borderRadius.full};
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.medium};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing['4xl']};
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${borderRadius['2xl']};
  box-shadow: ${shadows.lg};
`;

const EmptyIcon = styled.div`
  font-size: ${typography.fontSize['4xl']};
  margin-bottom: ${spacing.lg};
  animation: ${pulse} 2s ease-in-out infinite;
`;

const EmptyTitle = styled.h3`
  color: ${colors.neutral[700]};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.sm};
  font-family: ${typography.fontFamily.heading};
`;

const EmptyDescription = styled.p`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.base};
`;

const VoicesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xl};
`;

const VoiceCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${borderRadius['2xl']};
  box-shadow: ${shadows.lg};
  overflow: hidden;
  transition: all 0.4s ease;
  animation: ${fadeInUp} 0.8s ease-out ${props => 1.4 + props.delay}s both;
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${shadows['2xl']};
  }
`;

const VoiceHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.xl} ${spacing['2xl']};
  background: rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  
  ${media['max-md']} {
    padding: ${spacing.lg} ${spacing.xl};
    flex-direction: column;
    gap: ${spacing.lg};
    align-items: flex-start;
  }
`;

const VoiceDate = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
`;

const DateIcon = styled.span`
  font-size: ${typography.fontSize.base};
`;

const StatusBadge = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.lg};
  background: ${props => props.$bg};
  color: ${props => props.$color};
  border: 2px solid ${props => props.$color};
  border-radius: ${borderRadius.full};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: ${shadows.md};
  }
`;

const StatusIcon = styled.span`
  font-size: ${typography.fontSize.sm};
`;

const ChangeIcon = styled.span`
  font-size: ${typography.fontSize.xs};
  opacity: 0.7;
`;

const VoiceContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.lg};
  padding: ${spacing['2xl']};
`;

const ContentIcon = styled.span`
  font-size: ${typography.fontSize.xl};
  flex-shrink: 0;
  margin-top: ${spacing.xs};
`;

const MessageText = styled.p`
  color: ${colors.neutral[700]};
  font-size: ${typography.fontSize.base};
  line-height: ${typography.lineHeight.relaxed};
  margin: 0;
  flex: 1;
  word-break: break-word;
`;

const MessagePopup = styled.div`
  position: fixed;
  bottom: ${spacing['2xl']};
  right: ${spacing['2xl']};
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.lg} ${spacing.xl};
  background: ${props => props.$type === 'success' 
    ? 'rgba(34, 197, 94, 0.95)' 
    : 'rgba(239, 68, 68, 0.95)'};
  color: white;
  border-radius: ${borderRadius.xl};
  box-shadow: ${shadows.lg};
  backdrop-filter: blur(10px);
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.medium};
  animation: ${slideInUp} 0.3s ease-out;
  z-index: 1000;
  
  ${media['max-md']} {
    bottom: ${spacing.lg};
    right: ${spacing.lg};
    left: ${spacing.lg};
  }
`;

const PopupIcon = styled.span`
  font-size: ${typography.fontSize.lg};
`;

const StatusModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContent = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${borderRadius['2xl']};
  padding: ${spacing['3xl']};
  max-width: 500px;
  width: 90%;
  box-shadow: ${shadows['2xl']};
  animation: ${fadeInUp} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.lg};
  margin-bottom: ${spacing.lg};
`;

const ModalIcon = styled.span`
  font-size: ${typography.fontSize['2xl']};
`;

const ModalTitle = styled.h3`
  color: ${colors.neutral[800]};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  margin: 0;
  font-family: ${typography.fontFamily.heading};
`;

const ModalDescription = styled.p`
  color: ${colors.neutral[600]};
  font-size: ${typography.fontSize.base};
  line-height: ${typography.lineHeight.relaxed};
  margin-bottom: ${spacing['2xl']};
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${spacing.lg};
  margin-bottom: ${spacing['2xl']};
  
  ${media['max-md']} {
    grid-template-columns: 1fr;
  }
`;

const StatusOptionButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.lg};
  background: ${props => props.$active ? props.$bg : 'rgba(255, 255, 255, 0.8)'};
  color: ${props => props.$active ? props.$color : colors.neutral[600]};
  border: 2px solid ${props => props.$active ? props.$color : colors.neutral[300]};
  border-radius: ${borderRadius.xl};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  
  &:hover:not(:disabled) {
    background: ${props => props.$bg};
    border-color: ${props => props.$color};
    color: ${props => props.$color};
    transform: translateY(-2px);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const StatusOptionIcon = styled.span`
  font-size: ${typography.fontSize.lg};
`;

const StatusOptionLabel = styled.span`
  font-weight: ${typography.fontWeight.semibold};
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: center;
`;

const CancelButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.lg} ${spacing.xl};
  background: rgba(255, 255, 255, 0.8);
  color: ${colors.neutral[600]};
  border: 2px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.xl};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.95);
    border-color: ${colors.neutral[400]};
    transform: translateY(-2px);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ButtonIcon = styled.span`
  font-size: ${typography.fontSize.base};
`;

export default VoicesAdmin; 