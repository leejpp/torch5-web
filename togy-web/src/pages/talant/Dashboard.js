import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

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
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
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
      radial-gradient(circle at 20% 20%, rgba(123, 74, 255, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, rgba(16, 185, 129, 0.03) 0%, transparent 50%);
  }
`;

const Header = styled.header`
  background: linear-gradient(135deg, #7B4AFF 0%, #9333EA 100%);
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
  padding: ${theme.spacing['2xl']} ${theme.spacing.lg} ${theme.spacing.xl};
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing.xl} ${theme.spacing.md};
  }
`;

const TalantBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${theme.borderRadius.full};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  animation: ${fadeInUp} 0.8s ease-out;
`;

const BadgeIcon = styled.span`
  font-size: ${theme.typography.fontSize.lg};
`;

const BadgeText = styled.span`
  color: white;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const HeaderIcon = styled.div`
  font-size: ${theme.typography.fontSize['4xl']};
  margin-bottom: ${theme.spacing.lg};
  animation: ${float} 3s ease-in-out infinite, ${fadeInUp} 0.8s ease-out 0.2s both;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize['3xl']};
  }
`;

const Title = styled.h1`
  color: white;
  font-size: ${theme.typography.fontSize['4xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  margin-bottom: ${theme.spacing.sm};
  font-family: ${theme.typography.fontFamily};
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.medium};
  animation: ${fadeInUp} 0.8s ease-out 0.6s both;
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize.lg};
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing['2xl']} ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing.xl} ${theme.spacing.md};
  }
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing['2xl']};
  
  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.lg};
  }
`;

const MenuCard = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.lg};
  cursor: pointer;
  transition: ${theme.transitions.default};
  overflow: hidden;
  animation: ${fadeInUp} 0.8s ease-out ${props => 1.2 + props.delay}s both;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
`;

const CardGradient = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: ${props => props.gradient};
`;

const CardContent = styled.div`
  position: relative;
  z-index: 1;
  padding: ${theme.spacing['2xl']};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xl};
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
    text-align: center;
    gap: ${theme.spacing.lg};
  }
`;

const IconContainer = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const MenuIcon = styled.div`
  font-size: ${theme.typography.fontSize['4xl']};
  position: relative;
  z-index: 1;
  animation: ${pulse} 2s ease-in-out infinite;
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize['3xl']};
  }
`;

const IconRing = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border: 2px solid ${props => props.color || theme.colors.primary};
  border-radius: ${theme.borderRadius.full};
  opacity: 0.3;
  
  @media (max-width: ${theme.breakpoints.md}) {
    width: 60px;
    height: 60px;
  }
`;

const MenuInfo = styled.div`
  flex: 1;
`;

const MenuTitle = styled.h3`
  color: ${theme.colors.neutral[1]};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  margin-bottom: ${theme.spacing.sm};
  font-family: ${theme.typography.fontFamily};
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize.lg};
  }
`;

const MenuDescription = styled.p`
  color: ${theme.colors.neutral[3]};
  font-size: ${theme.typography.fontSize.base};
  line-height: 1.6;
  margin: 0;
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize.sm};
  }
`;

const MenuArrow = styled.div`
  font-size: ${theme.typography.fontSize['2xl']};
  color: ${theme.colors.primary};
  transition: transform 0.3s ease;
  
  ${MenuCard}:hover & {
    transform: translateX(4px);
  }
`;

const InfoSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing['2xl']};
  box-shadow: ${theme.shadows.lg};
  text-align: center;
  animation: ${fadeInUp} 0.8s ease-out 1.8s both;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(123, 74, 255, 0.1),
      transparent
    );
    animation: ${shimmer} 2s ease-in-out infinite;
  }
`;

const InfoTitle = styled.h2`
  color: ${theme.colors.primary};
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  margin-bottom: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
`;

const InfoText = styled.p`
  color: ${theme.colors.neutral[3]};
  font-size: ${theme.typography.fontSize.lg};
  line-height: 1.6;
  position: relative;
  z-index: 1;
`;

const TalantDashboard = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: '달란트 입력',
      description: '주일학교 학생들의 달란트를 입력하고 관리합니다',
      icon: '✏️',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      color: '#3B82F6',
      path: '/talant/input',
      delay: 0
    },
    {
      title: '달란트 내역',
      description: '전체 달란트 내역을 날짜별로 확인하고 관리합니다',
      icon: '📊',
      gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
      color: '#10B981',
      path: '/talant/history',
      delay: 0.1
    },
    {
      title: '달란트 현황판',
      description: '학생별 월간 달란트 현황을 달력 형태로 한눈에 확인합니다',
      icon: '📅',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      color: '#8B5CF6',
      path: '/talant/board',
      delay: 0.2
    },
    {
      title: '달란트 랭킹',
      description: '학생들의 달란트 순위를 확인하고 공유합니다',
      icon: '🏆',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      color: '#F59E0B',
      path: '/talant/rank',
      delay: 0.3
    }
  ];

  return (
    <Container>
      <BackgroundOverlay />
      
      <Header>
        <HeaderContent>
          <TalantBadge>
            <BadgeIcon>🎯</BadgeIcon>
            <BadgeText>주일학교 관리 시스템</BadgeText>
          </TalantBadge>
          
          <HeaderIcon>💎</HeaderIcon>
          <Title>달란트 관리 시스템</Title>
          <Subtitle>주일학교 달란트를 효율적으로 관리해보세요</Subtitle>
        </HeaderContent>
      </Header>

      <MainContent>
        <MenuGrid>
          {menuItems.map((item, index) => (
            <MenuCard 
              key={index} 
              onClick={() => navigate(item.path)}
              delay={item.delay}
            >
              <CardGradient gradient={item.gradient} />
              <CardContent>
                <IconContainer>
                  <MenuIcon>{item.icon}</MenuIcon>
                  <IconRing color={item.color} />
                </IconContainer>
                <MenuInfo>
                  <MenuTitle>{item.title}</MenuTitle>
                  <MenuDescription>{item.description}</MenuDescription>
                </MenuInfo>
                <MenuArrow>→</MenuArrow>
              </CardContent>
            </MenuCard>
          ))}
        </MenuGrid>

        <InfoSection>
          <InfoTitle>
            <span>📋</span> 사용 안내
          </InfoTitle>
          <InfoText>
            주일학교 달란트 시스템을 통해 학생들의 달란트를 체계적으로 관리할 수 있습니다.
            <br />
            출석, 암송, 헌금, 전도 등 다양한 항목의 달란트 입력과 실시간 랭킹 확인이 가능합니다.
          </InfoText>
        </InfoSection>
      </MainContent>
    </Container>
  );
};

export default TalantDashboard; 