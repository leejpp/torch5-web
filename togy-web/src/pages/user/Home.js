import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';
// 아이콘 라이브러리 임포트 (예: react-icons)
// import { FaHeart, FaFlask, FaSyncAlt, FaUsers, FaCalendarAlt, FaCommentDots, FaPray, FaPlus } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const [yearlyTheme, setYearlyTheme] = useState({
    theme: '말씀이 삶이 되고, 삶이 예배가 되어\n영적 성장을 이루는 삶',
    year: '2025'
  });
  const [visionItems, setVisionItems] = useState([
    { id: 1, text: '서로를 위해 기도하는 청년 공동체', emoji: '🙏', color: colors.gradients.primary },
    { id: 2, text: '주님께서 맡겨 주신 사명을 이루어 주 영광 위해 사는 청년부', emoji: '✨', color: colors.gradients.secondary },
    { id: 3, text: '영,혼,육,가정,경제의 균형 있는 성장으로 예수님을 닮아가는 청년부', emoji: '⚖️', color: colors.gradients.success },
    { id: 4, text: '천하보다 소중한 한 영혼을 살리는 삶', emoji: '💎', color: colors.gradients.warm },
    { id: 5, text: '하나님 안에서의 친목하는 청년부', emoji: '🤝', color: colors.gradients.cool }
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchYearlyThemes();
  }, []);

  const fetchYearlyThemes = async () => {
    try {
      const q = query(collection(db, 'yearlyThemes'), orderBy('year', 'desc'));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const themes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // 가장 최신 테마를 사용
        const latestTheme = themes[0];
        if (latestTheme.theme) {
          setYearlyTheme({
            theme: latestTheme.theme,
            year: latestTheme.year || '2025'
          });
        }
        
        // direction 배열이 있으면 비전 아이템들로 업데이트
        if (latestTheme.direction && Array.isArray(latestTheme.direction)) {
          const updatedVisionItems = latestTheme.direction.map((item, index) => ({
            id: index + 1,
            text: typeof item === 'string' ? item : item.text || item,
            emoji: [
              '🙏', '✨', '⚖️', '💎', '🤝', 
              '🌟', '💚', '🔥', '🙌', '❤️'
            ][index % 10],
            color: [
              colors.gradients.primary,
              colors.gradients.secondary,
              colors.gradients.success,
              colors.gradients.warm,
              colors.gradients.cool
            ][index % 5]
          }));
          setVisionItems(updatedVisionItems);
        }
      }
    } catch (error) {
      console.error("Error fetching yearly themes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { 
      title: '중보기도', 
      subtitle: '서로를 위해 기도해요', 
      emoji: '💙', 
      path: '/prayer',
      gradient: colors.gradients.primary,
      isPrimary: true
    },
    { 
      title: '마음의 소리', 
      subtitle: '마음을 나누어요', 
      emoji: '💬', 
      path: '/voices',
      gradient: colors.gradients.secondary 
    },
    { 
      title: '캘린더', 
      subtitle: '일정을 확인해요', 
      emoji: '🗓️', 
      path: '/calendar',
      gradient: colors.gradients.success 
    }
  ];



  return (
    <Container>
      <BackgroundOverlay />
      
      <Header>
        <HeaderContent>
          {isLoading ? (
            <>
              <LoadingIcon>⏳</LoadingIcon>
              <HeaderLoadingText>테마를 불러오는 중...</HeaderLoadingText>
            </>
          ) : (
            <>
              <ThemeIcon>📖</ThemeIcon>
              <YearlyThemeTitle>
                {yearlyTheme.theme.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < yearlyTheme.theme.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </YearlyThemeTitle>
              <ThemeYear>{yearlyTheme.year}년 연간 주제</ThemeYear>
            </>
          )}
        </HeaderContent>
      </Header>

      <MainContent>
        <VisionSection>
          <VisionCard>
            <VisionCardContent>
              <VisionTitle>우리의 비전</VisionTitle>
              <VisionList>
                {visionItems.map((item, index) => (
                  <VisionItem key={item.id} delay={index * 0.05}>
                    <VisionItemNumber>{item.id}</VisionItemNumber>
                    <VisionItemContent>
                      <VisionItemEmoji>{item.emoji}</VisionItemEmoji>
                      <VisionItemText>{item.text}</VisionItemText>
                    </VisionItemContent>
                  </VisionItem>
                ))}
              </VisionList>
            </VisionCardContent>
          </VisionCard>
        </VisionSection>

        <QuickActionsSection>
          <QuickActionsGrid>
            {quickActions.map((action, index) => (
              <ActionCard 
                key={action.title}
                onClick={() => navigate(action.path)}
                isPrimary={action.isPrimary}
                delay={index * 0.1}
              >
                <ActionCardBackground gradient={action.gradient} />
                <ActionCardContent>
                  <ActionEmoji>{action.emoji}</ActionEmoji>
                  <ActionTitle isPrimary={action.isPrimary}>{action.title}</ActionTitle>
                  <ActionSubtitle isPrimary={action.isPrimary}>{action.subtitle}</ActionSubtitle>
                </ActionCardContent>
                <ActionButton isPrimary={action.isPrimary}>
                  이동하기 →
                </ActionButton>
              </ActionCard>
            ))}
          </QuickActionsGrid>
        </QuickActionsSection>
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

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  z-index: -2;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.05) 0%, transparent 50%);
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
  padding: ${spacing['4xl']} ${spacing['2xl']} ${spacing['3xl']};
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  
  ${media['max-md']} {
    padding: ${spacing['3xl']} ${spacing.lg} ${spacing['2xl']};
  }
`;

const ThemeIcon = styled.div`
  font-size: ${typography.fontSize['4xl']};
  margin-bottom: ${spacing.lg};
  animation: ${float} 3s ease-in-out infinite, ${fadeInUp} 0.8s ease-out;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  
  ${media['max-md']} {
    font-size: ${typography.fontSize['3xl']};
  }
`;

const YearlyThemeTitle = styled.h1`
  color: white;
  font-size: ${typography.fontSize['4xl']};
  font-weight: ${typography.fontWeight.extrabold};
  margin-bottom: ${spacing.lg};
  font-family: ${typography.fontFamily.heading};
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  line-height: ${typography.lineHeight.tight};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize['2xl']};
    br {
      display: none;
    }
  }
`;

const ThemeYear = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.semibold};
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.lg};
  }
`;

const LoadingIcon = styled.div`
  font-size: ${typography.fontSize['4xl']};
  margin-bottom: ${spacing.lg};
  animation: ${pulse} 2s ease-in-out infinite;
  
  ${media['max-md']} {
    font-size: ${typography.fontSize['3xl']};
  }
`;

const HeaderLoadingText = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.medium};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.lg};
  }
`;



const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${spacing.lg};
  
  ${media['max-md']} {
    padding: 0 ${spacing.md};
  }
`;

const VisionSection = styled.section`
  padding: ${spacing['4xl']} 0;
  
  ${media['max-md']} {
    padding: ${spacing['2xl']} 0;
  }
`;



const VisionTitle = styled.h3`
  font-size: ${typography.fontSize['3xl']};
  font-weight: ${typography.fontWeight.bold};
  text-align: center;
  margin-bottom: ${spacing['2xl']};
  color: ${colors.neutral[800]};
  font-family: ${typography.fontFamily.heading};
  animation: ${fadeInUp} 0.8s ease-out 0.3s both;
  position: relative;
  z-index: 2;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -${spacing.md};
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: ${colors.gradients.primary};
    border-radius: ${borderRadius.full};
  }
  
  ${media['max-md']} {
    font-size: ${typography.fontSize['2xl']};
    margin-bottom: ${spacing.xl};
  }
`;

const VisionCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${borderRadius['2xl']};
  padding: ${spacing['2xl']};
  box-shadow: ${shadows.glass};
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;
  position: relative;
  overflow: hidden;
  margin-bottom: ${spacing['4xl']};
  
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
    padding: ${spacing.xl};
    margin-bottom: ${spacing['2xl']};
  }
`;

const VisionCardContent = styled.div`
  position: relative;
  z-index: 1;
`;

const VisionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
  
  ${media['max-md']} {
    gap: ${spacing.md};
  }
`;

const VisionItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.lg};
  padding: ${spacing.lg};
  background: linear-gradient(135deg, ${colors.neutral[50]} 0%, ${colors.neutral[100]} 100%);
  border-radius: ${borderRadius.xl};
  border-left: 4px solid transparent;
  border-image: ${colors.gradients.primary} 1;
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.6s ease-out ${props => 0.5 + props.delay}s both;
  
  &:hover {
    transform: translateX(4px);
    background: linear-gradient(135deg, ${colors.neutral[100]} 0%, ${colors.neutral[200]} 100%);
  }
  
  ${media['max-md']} {
    padding: ${spacing.md};
    gap: ${spacing.md};
  }
`;

const VisionItemNumber = styled.div`
  width: 32px;
  height: 32px;
  background: ${colors.gradients.primary};
  color: white;
  border-radius: ${borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${typography.fontWeight.bold};
  font-size: ${typography.fontSize.sm};
  flex-shrink: 0;
  
  ${media['max-md']} {
    width: 28px;
    height: 28px;
    font-size: ${typography.fontSize.xs};
  }
`;

const VisionItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  flex: 1;
  
  ${media['max-md']} {
    gap: ${spacing.sm};
  }
`;

const VisionItemEmoji = styled.div`
  font-size: ${typography.fontSize.xl};
  flex-shrink: 0;
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.lg};
  }
`;

const VisionItemText = styled.p`
  font-size: ${typography.fontSize.base};
  line-height: ${typography.lineHeight.normal};
  color: ${colors.neutral[700]};
  font-weight: ${typography.fontWeight.normal};
  margin: 0;
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.sm};
    line-height: ${typography.lineHeight.tight};
  }
`;

const QuickActionsSection = styled.section`
  padding: ${spacing['2xl']} 0 ${spacing['4xl']};
  
  ${media['max-md']} {
    padding: ${spacing.xl} 0 ${spacing['2xl']};
  }
`;



const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${spacing.xl};
  
  ${media['max-md']} {
    grid-template-columns: 1fr;
    gap: ${spacing.lg};
  }
`;

const ActionCard = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${borderRadius['2xl']};
  padding: ${spacing['2xl']};
  cursor: pointer;
  transition: all 0.4s ease;
  box-shadow: ${shadows.md};
  animation: ${fadeInUp} 0.8s ease-out ${props => 0.7 + props.delay}s both;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: ${shadows['2xl']};
  }
  
  ${props => props.isPrimary && `
    background: ${colors.gradients.primary};
    color: white;
    
    &:hover {
      box-shadow: 0 25px 50px rgba(102, 126, 234, 0.4);
    }
  `}
`;

const ActionCardBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.gradient};
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${ActionCard}:hover & {
    opacity: 0.1;
  }
`;

const ActionCardContent = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
`;

const ActionEmoji = styled.div`
  font-size: ${typography.fontSize['3xl']};
  margin-bottom: ${spacing.lg};
  animation: ${float} 3s ease-in-out infinite;
`;

const ActionTitle = styled.h4`
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.sm};
  color: ${props => props.isPrimary ? 'white' : colors.neutral[800]};
`;

const ActionSubtitle = styled.p`
  font-size: ${typography.fontSize.sm};
  color: ${props => props.isPrimary ? 'rgba(255,255,255,0.9)' : colors.neutral[600]};
  margin-bottom: ${spacing.xl};
`;

const ActionButton = styled.div`
  padding: ${spacing.md} ${spacing.lg};
  border-radius: ${borderRadius.xl};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  text-align: center;
  transition: all 0.3s ease;
  
  ${props => props.isPrimary ? `
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
  ` : `
    background: ${colors.gradients.primary};
    color: white;
  `}
  
  ${ActionCard}:hover & {
    transform: translateY(-2px);
    ${props => props.isPrimary ? `
      background: rgba(255, 255, 255, 0.3);
    ` : `
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    `}
  }
`;

export default Home;