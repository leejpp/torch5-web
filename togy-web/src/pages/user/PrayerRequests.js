import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import styled, { keyframes } from 'styled-components';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';

const PrayerRequests = () => {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrayers();
  }, []);

  const fetchPrayers = async () => {
    try {
      // 일단 모든 데이터를 가져옴 (Firestore는 복합 정렬이 복잡하므로 클라이언트에서 정렬)
      const q = query(collection(db, 'prayerRequests'), orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const prayerList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // 핀된 항목을 최상단에 정렬
      const sortedPrayers = prayerList.sort((a, b) => {
        // 1순위: 핀 상태 (핀된 항목이 먼저)
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        // 2순위: 핀된 항목들끼리는 pinnedAt 기준으로 정렬 (최근에 핀된 것이 먼저)
        if (a.isPinned && b.isPinned) {
          const aPinnedAt = a.pinnedAt?.seconds || 0;
          const bPinnedAt = b.pinnedAt?.seconds || 0;
          return bPinnedAt - aPinnedAt;
        }
        
        // 3순위: 핀되지 않은 항목들끼리는 updatedAt 기준으로 정렬 (최근 업데이트가 먼저)
        const aUpdatedAt = a.updatedAt?.seconds || 0;
        const bUpdatedAt = b.updatedAt?.seconds || 0;
        return bUpdatedAt - aUpdatedAt;
      });
      
      setPrayers(sortedPrayers);
    } catch (error) {
      console.error("Error fetching prayers:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp.seconds * 1000);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}일 전`;
    return formatDateTime(timestamp);
  };

  return (
    <Container>
      <BackgroundOverlay />
      
      <Header>
        <HeaderContent>
          <HeaderIcon>🙏</HeaderIcon>
          <Title>중보기도</Title>
          <Subtitle>서로를 위해 기도하며 함께 성장해요</Subtitle>
        </HeaderContent>
      </Header>

      <MainContent>
        {loading ? (
          <LoadingSection>
            <LoadingCard>
              <LoadingIcon>🙏</LoadingIcon>
              <LoadingText>기도제목을 불러오는 중...</LoadingText>
              <LoadingBar>
                <LoadingProgress />
              </LoadingBar>
            </LoadingCard>
          </LoadingSection>
        ) : prayers.length === 0 ? (
          <EmptySection>
            <EmptyCard>
              <EmptyIcon>💙</EmptyIcon>
              <EmptyTitle>아직 등록된 기도제목이 없어요</EmptyTitle>
              <EmptyMessage>
                첫 번째 기도제목을 등록해서<br/>
                함께 기도해보세요!
              </EmptyMessage>
              <EmptyFooter>관리자에게 기도제목 등록을 요청해주세요</EmptyFooter>
            </EmptyCard>
          </EmptySection>
        ) : (
          <PrayersSection>
            <SectionHeader>
              <PrayerCount>
                총 <CountNumber>{prayers.length}</CountNumber>명의 기도제목
              </PrayerCount>
              {prayers.filter(p => p.isPinned).length > 0 && (
                <PinInfo>
                  📌 <PinCount>{prayers.filter(p => p.isPinned).length}</PinCount>개 항목이 상단에 고정되어 있습니다
                </PinInfo>
              )}
              <PrayerDescription>사랑으로 서로를 위해 기도해주세요</PrayerDescription>
            </SectionHeader>

            <PrayerGrid>
              {prayers.map((prayer, index) => (
                <PrayerCard key={prayer.id} delay={index * 0.1} isPinned={prayer.isPinned}>
                  <CardGradient isPinned={prayer.isPinned} />
                  <CardContent>
                    <PrayerHeader>
                      <PersonInfo>
                        <PersonAvatar isPinned={prayer.isPinned}>
                          {prayer.id.charAt(0)}
                        </PersonAvatar>
                        <PersonDetails>
                          <PersonName>{prayer.id}</PersonName>
                          <TimeStamp>{getTimeAgo(prayer.updatedAt)}</TimeStamp>
                          {prayer.isPinned && <PinStatus>📌 상단 고정</PinStatus>}
                        </PersonDetails>
                      </PersonInfo>
                      <PrayerBadge isPinned={prayer.isPinned}>
                        {prayer.prayerItems.length}개 제목
                      </PrayerBadge>
                    </PrayerHeader>

                    <PrayerList>
                      {prayer.prayerItems.map((item, itemIndex) => (
                        <PrayerItem key={itemIndex} delay={itemIndex * 0.05}>
                          <ItemNumber>{itemIndex + 1}</ItemNumber>
                          <ItemContent>
                            <PrayerText>{item}</PrayerText>
                          </ItemContent>
                        </PrayerItem>
                      ))}
                    </PrayerList>


                  </CardContent>
                </PrayerCard>
              ))}
            </PrayerGrid>
          </PrayersSection>
        )}
      </MainContent>
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

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
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

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const loadingProgress = keyframes`
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
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
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.03) 0%, transparent 50%);
  }
`;

const Header = styled.header`
  background: ${colors.gradients.primary};
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
  padding: ${spacing['3xl']} ${spacing['2xl']} ${spacing['2xl']};
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  
  ${media['max-md']} {
    padding: ${spacing.xl} ${spacing.lg} ${spacing.lg};
  }
`;

const HeaderIcon = styled.div`
  font-size: ${typography.fontSize['3xl']};
  margin-bottom: ${spacing.lg};
  animation: ${float} 3s ease-in-out infinite, ${fadeInUp} 0.8s ease-out;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
`;

const Title = styled.h1`
  color: white;
  font-size: ${typography.fontSize['4xl']};
  font-weight: ${typography.fontWeight.extrabold};
  margin-bottom: ${spacing.sm};
  font-family: ${typography.fontFamily.heading};
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  
  ${media['max-md']} {
    font-size: ${typography.fontSize['2xl']};
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.medium};
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.base};
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${spacing['2xl']} ${spacing.lg};
  
  ${media['max-md']} {
    padding: ${spacing.lg} ${spacing.md};
  }
`;

const LoadingSection = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const LoadingCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${borderRadius['2xl']};
  padding: ${spacing['3xl']};
  text-align: center;
  box-shadow: ${shadows.glass};
  max-width: 300px;
  width: 100%;
`;

const LoadingIcon = styled.div`
  font-size: ${typography.fontSize['3xl']};
  margin-bottom: ${spacing.lg};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const LoadingText = styled.p`
  color: ${colors.neutral[700]};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.medium};
  margin-bottom: ${spacing.lg};
`;

const LoadingBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${colors.neutral[200]};
  border-radius: ${borderRadius.full};
  overflow: hidden;
`;

const LoadingProgress = styled.div`
  height: 100%;
  background: ${colors.gradients.primary};
  border-radius: ${borderRadius.full};
  animation: ${loadingProgress} 2s ease-in-out infinite;
`;

const EmptySection = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const EmptyCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${borderRadius['2xl']};
  padding: ${spacing['4xl']};
  text-align: center;
  box-shadow: ${shadows.glass};
  max-width: 500px;
  width: 100%;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -200px;
    width: 200px;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    animation: ${shimmer} 3s infinite;
  }
  
  ${media['max-md']} {
    padding: ${spacing['3xl']} ${spacing['2xl']};
  }
`;

const EmptyIcon = styled.div`
  font-size: ${typography.fontSize['5xl']};
  margin-bottom: ${spacing.xl};
  animation: ${float} 3s ease-in-out infinite;
  
  ${media['max-md']} {
    font-size: ${typography.fontSize['4xl']};
  }
`;

const EmptyTitle = styled.h2`
  color: ${colors.neutral[800]};
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.lg};
  font-family: ${typography.fontFamily.heading};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.xl};
  }
`;

const EmptyMessage = styled.p`
  color: ${colors.neutral[600]};
  font-size: ${typography.fontSize.lg};
  line-height: ${typography.lineHeight.relaxed};
  margin-bottom: ${spacing['2xl']};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.base};
    br {
      display: none;
    }
  }
`;

const EmptyFooter = styled.p`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.sm};
  font-style: italic;
`;

const PrayersSection = styled.section`
  animation: ${fadeInUp} 0.8s ease-out;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: ${spacing['3xl']};
  
  ${media['max-md']} {
    margin-bottom: ${spacing['2xl']};
  }
`;

const PrayerCount = styled.h2`
  color: ${colors.neutral[800]};
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.sm};
  font-family: ${typography.fontFamily.heading};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.xl};
  }
`;

const CountNumber = styled.span`
  color: ${colors.primary[600]};
  background: ${colors.gradients.primary};
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: ${typography.fontWeight.extrabold};
`;

const PrayerDescription = styled.p`
  color: ${colors.neutral[600]};
  font-size: ${typography.fontSize.base};
`;

const PrayerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${spacing['2xl']};
  
  ${media['max-md']} {
    grid-template-columns: 1fr;
    gap: ${spacing.xl};
  }
`;

const PrayerCard = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${borderRadius['2xl']};
  box-shadow: ${props => props.isPinned ? shadows['2xl'] : shadows.md};
  transition: all 0.4s ease;
  animation: ${fadeInUp} 0.8s ease-out ${props => props.delay}s both;
  overflow: hidden;
  border: ${props => props.isPinned 
    ? '2px solid rgba(251, 191, 36, 0.4)'
    : '1px solid rgba(255, 255, 255, 0.2)'
  };
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: ${shadows['2xl']};
  }
  
  ${props => props.isPinned && `
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      z-index: 10;
    }
  `}
`;

const CardGradient = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: ${props => props.isPinned 
    ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
    : colors.gradients.primary
  };
  z-index: 5;
`;

const CardContent = styled.div`
  padding: ${spacing['2xl']};
  position: relative;
  z-index: 1;
  
  ${media['max-md']} {
    padding: ${spacing.xl};
  }
`;

const PrayerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.xl};
  
  ${media['max-md']} {
    margin-bottom: ${spacing.lg};
    gap: ${spacing.md};
  }
`;

const PersonInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.lg};
  flex: 1;
  min-width: 0;
  
  ${media['max-md']} {
    gap: ${spacing.md};
  }
`;

const PersonAvatar = styled.div`
  width: 48px;
  height: 48px;
  background: ${props => props.isPinned 
    ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
    : colors.gradients.primary
  };
  color: white;
  border-radius: ${borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${typography.fontWeight.bold};
  font-size: ${typography.fontSize.lg};
  box-shadow: ${props => props.isPinned ? shadows.lg : shadows.md};
  flex-shrink: 0;
  transition: all 0.3s ease;
  
  ${media['max-md']} {
    width: 40px;
    height: 40px;
    font-size: ${typography.fontSize.base};
  }
`;

const PersonDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
  min-width: 0;
  flex: 1;
`;

const PersonName = styled.h3`
  color: ${colors.neutral[800]};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.base};
  }
`;

const TimeStamp = styled.span`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.sm};
`;

const PrayerBadge = styled.span`
  background: ${props => props.isPinned 
    ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
    : colors.gradients.secondary
  };
  color: white;
  padding: ${spacing.sm} ${spacing.lg};
  border-radius: ${borderRadius.full};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  box-shadow: ${props => props.isPinned ? shadows.md : shadows.sm};
  white-space: nowrap;
  flex-shrink: 0;
  
  ${media['max-md']} {
    padding: ${spacing.xs} ${spacing.md};
    font-size: ${typography.fontSize.xs};
  }
`;

const PrayerList = styled.div`
  margin-bottom: ${spacing.xl};
  
  ${media['max-md']} {
    margin-bottom: ${spacing.lg};
  }
`;

const PrayerItem = styled.div`
  display: flex;
  gap: ${spacing.lg};
  padding: ${spacing.lg};
  margin-bottom: ${spacing.lg};
  background: linear-gradient(135deg, ${colors.neutral[50]} 0%, ${colors.neutral[100]} 100%);
  border-radius: ${borderRadius.xl};
  border-left: 4px solid transparent;
  border-image: ${colors.gradients.primary} 1;
  transition: all 0.3s ease;
  animation: ${slideInRight} 0.6s ease-out ${props => 0.2 + props.delay}s both;
  
  &:hover {
    transform: translateX(4px);
    background: linear-gradient(135deg, ${colors.neutral[100]} 0%, ${colors.neutral[200]} 100%);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
  
  ${media['max-md']} {
    padding: ${spacing.md};
    margin-bottom: ${spacing.md};
    gap: ${spacing.md};
  }
`;

const ItemNumber = styled.div`
  width: 28px;
  height: 28px;
  background: ${colors.gradients.primary};
  color: white;
  border-radius: ${borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${typography.fontWeight.bold};
  font-size: ${typography.fontSize.sm};
  flex-shrink: 0;
`;

const ItemContent = styled.div`
  flex: 1;
`;

const PrayerText = styled.p`
  color: ${colors.neutral[700]};
  font-size: ${typography.fontSize.base};
  line-height: ${typography.lineHeight.relaxed};
  margin: 0;
  white-space: pre-wrap;
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.sm};
  }
`;

// 핀 기능을 위한 새로운 스타일 컴포넌트들
const PinInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: ${borderRadius.xl};
  padding: ${spacing.sm} ${spacing.lg};
  color: #f59e0b;
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  margin-bottom: ${spacing.sm};
  
  ${media['max-md']} {
    padding: ${spacing.xs} ${spacing.md};
    font-size: ${typography.fontSize.xs};
  }
`;

const PinCount = styled.span`
  color: #f59e0b;
  font-weight: ${typography.fontWeight.bold};
`;

const PinStatus = styled.span`
  color: #f59e0b;
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.semibold};
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  margin-top: ${spacing.xs};
`;

export default PrayerRequests;