import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';

const Dashboard = () => {
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
            <HeaderIcon>🎛️</HeaderIcon>
            <Title>관리자 대시보드</Title>
            <Subtitle>청년부 운영을 위한 관리 도구</Subtitle>
          </TitleSection>
          
          <WelcomeMessage>
            <WelcomeIcon>✨</WelcomeIcon>
            <WelcomeText>환영합니다! 오늘도 좋은 하루 되세요</WelcomeText>
          </WelcomeMessage>
        </HeaderContent>
      </Header>

      <MainContent>
        <DashboardSection>
          <SectionHeader>
            <SectionTitle>관리 메뉴</SectionTitle>
            <SectionDescription>각 영역을 클릭하여 관리 페이지로 이동하세요</SectionDescription>
          </SectionHeader>

          <MenuGrid>
            <MenuCard to="/admin/prayer" delay={0}>
              <CardGradient color="primary" />
              <CardContent>
                <MenuIconContainer>
                  <MenuIcon>🙏</MenuIcon>
                  <IconRing />
                </MenuIconContainer>
                <MenuInfo>
                  <MenuTitle>중보기도 관리</MenuTitle>
                  <MenuDescription>
                    기도제목 등록, 수정, 삭제 관리<br/>
                    청년부 기도 요청 현황 확인
                  </MenuDescription>
                </MenuInfo>
                <MenuArrow>→</MenuArrow>
              </CardContent>
            </MenuCard>

            <MenuCard to="/admin/voices" delay={0.1}>
              <CardGradient color="secondary" />
              <CardContent>
                <MenuIconContainer>
                  <MenuIcon>💌</MenuIcon>
                  <IconRing />
                </MenuIconContainer>
                <MenuInfo>
                  <MenuTitle>마음의 소리 관리</MenuTitle>
                  <MenuDescription>
                    청년부 의견 및 제안사항 확인<br/>
                    소중한 마음의 소리 관리
                  </MenuDescription>
                </MenuInfo>
                <MenuArrow>→</MenuArrow>
              </CardContent>
            </MenuCard>

            <MenuCard to="/admin/calendar" delay={0.2}>
              <CardGradient color="accent" />
              <CardContent>
                <MenuIconContainer>
                  <MenuIcon>📅</MenuIcon>
                  <IconRing />
                </MenuIconContainer>
                <MenuInfo>
                  <MenuTitle>일정 관리</MenuTitle>
                  <MenuDescription>
                    청년부 행사 및 모임 일정 등록<br/>
                    이벤트 생성, 수정, 삭제 관리
                  </MenuDescription>
                </MenuInfo>
                <MenuArrow>→</MenuArrow>
              </CardContent>
            </MenuCard>

            <MenuCard to="/admin/yearlythemes" delay={0.3}>
              <CardGradient color="warm" />
              <CardContent>
                <MenuIconContainer>
                  <MenuIcon>📖</MenuIcon>
                  <IconRing />
                </MenuIconContainer>
                <MenuInfo>
                  <MenuTitle>연간 테마 관리</MenuTitle>
                  <MenuDescription>
                    청년부 연간 주제와 비전 관리<br/>
                    테마 등록, 수정, 삭제 관리
                  </MenuDescription>
                </MenuInfo>
                <MenuArrow>→</MenuArrow>
              </CardContent>
            </MenuCard>

            <MenuCard to="/admin/cells" delay={0.4}>
              <CardGradient color="success" />
              <CardContent>
                <MenuIconContainer>
                  <MenuIcon>🔄</MenuIcon>
                  <IconRing />
                </MenuIconContainer>
                <MenuInfo>
                  <MenuTitle>셀 재편성</MenuTitle>
                  <MenuDescription>
                    청년부 셀 구성 최적화<br/>
                    스마트 알고리즘으로 균형있는 셀 배치
                  </MenuDescription>
                </MenuInfo>
                <MenuArrow>→</MenuArrow>
              </CardContent>
            </MenuCard>
          </MenuGrid>
        </DashboardSection>

        <StatsSection>
          <StatsCard>
            <StatsBackground />
            <StatsContent>
              <StatsHeader>
                <StatsIcon>📊</StatsIcon>
                <StatsTitle>운영 현황</StatsTitle>
              </StatsHeader>
              <StatsGrid>
                <StatItem>
                  <StatNumber>활성</StatNumber>
                  <StatLabel>시스템 상태</StatLabel>
                </StatItem>
                <StatItem>
                  <StatNumber>최신</StatNumber>
                  <StatLabel>디자인 버전</StatLabel>
                </StatItem>
                <StatItem>
                  <StatNumber>안전</StatNumber>
                  <StatLabel>데이터 보안</StatLabel>
                </StatItem>
              </StatsGrid>
            </StatsContent>
          </StatsCard>
        </StatsSection>
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
    transform: translateY(-10px);
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

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const ringExpand = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
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
      radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, rgba(236, 72, 153, 0.03) 0%, transparent 50%);
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

const WelcomeMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
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

const WelcomeIcon = styled.span`
  font-size: ${typography.fontSize.lg};
`;

const WelcomeText = styled.span`
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

const DashboardSection = styled.section`
  margin-bottom: ${spacing['4xl']};
  animation: ${fadeInUp} 0.8s ease-out 1s both;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: ${spacing['3xl']};
  
  ${media['max-md']} {
    margin-bottom: ${spacing['2xl']};
  }
`;

const SectionTitle = styled.h2`
  color: ${colors.neutral[800]};
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.lg};
  font-family: ${typography.fontFamily.heading};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.xl};
  }
`;

const SectionDescription = styled.p`
  color: ${colors.neutral[600]};
  font-size: ${typography.fontSize.lg};
  line-height: ${typography.lineHeight.relaxed};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.base};
  }
`;

const MenuGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xl};
  
  ${media['max-md']} {
    gap: ${spacing.lg};
  }
`;

const MenuCard = styled(Link)`
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${borderRadius['2xl']};
  box-shadow: ${shadows.lg};
  text-decoration: none;
  color: inherit;
  transition: all 0.4s ease;
  overflow: hidden;
  animation: ${fadeInUp} 0.8s ease-out ${props => 1.2 + props.delay}s both;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: ${shadows['2xl']};
  }
`;

const CardGradient = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: ${props => 
    props.color === 'primary' ? colors.gradients.primary :
    props.color === 'secondary' ? colors.gradients.secondary :
    colors.gradients.accent
  };
`;

const CardContent = styled.div`
  position: relative;
  z-index: 1;
  padding: ${spacing['3xl']};
  display: flex;
  align-items: center;
  gap: ${spacing['2xl']};
  
  ${media['max-md']} {
    padding: ${spacing['2xl']};
    flex-direction: column;
    text-align: center;
    gap: ${spacing.xl};
  }
`;

const MenuIconContainer = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const MenuIcon = styled.div`
  font-size: ${typography.fontSize['4xl']};
  position: relative;
  z-index: 1;
  animation: ${pulse} 2s ease-in-out infinite;
  
  ${media['max-md']} {
    font-size: ${typography.fontSize['3xl']};
  }
`;

const IconRing = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border: 2px solid ${colors.primary[200]};
  border-radius: ${borderRadius.full};
  animation: ${ringExpand} 2s ease-out infinite;
  
  ${media['max-md']} {
    width: 60px;
    height: 60px;
  }
`;

const MenuInfo = styled.div`
  flex: 1;
`;

const MenuTitle = styled.h3`
  color: ${colors.neutral[800]};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.sm};
  font-family: ${typography.fontFamily.heading};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.lg};
  }
`;

const MenuDescription = styled.p`
  color: ${colors.neutral[600]};
  font-size: ${typography.fontSize.base};
  line-height: ${typography.lineHeight.relaxed};
  margin: 0;
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.sm};
  }
`;

const MenuArrow = styled.div`
  font-size: ${typography.fontSize['2xl']};
  color: ${colors.primary[500]};
  transition: transform 0.3s ease;
  
  ${MenuCard}:hover & {
    transform: translateX(8px);
  }
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.xl};
  }
`;

const StatsSection = styled.section`
  animation: ${fadeInUp} 0.8s ease-out 1.5s both;
`;

const StatsCard = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: ${borderRadius['2xl']};
`;

const StatsBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${colors.gradients.secondary};
  
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
      rgba(255, 255, 255, 0.2),
      transparent
    );
    animation: ${shimmer} 3s infinite;
  }
`;

const StatsContent = styled.div`
  position: relative;
  z-index: 1;
  padding: ${spacing['3xl']};
  
  ${media['max-md']} {
    padding: ${spacing['2xl']};
  }
`;

const StatsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.lg};
  margin-bottom: ${spacing['2xl']};
  justify-content: center;
  
  ${media['max-md']} {
    margin-bottom: ${spacing.xl};
  }
`;

const StatsIcon = styled.div`
  font-size: ${typography.fontSize['2xl']};
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;

const StatsTitle = styled.h3`
  color: white;
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  margin: 0;
  font-family: ${typography.fontFamily.heading};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${spacing.xl};
  
  ${media['max-md']} {
    grid-template-columns: 1fr;
    gap: ${spacing.lg};
  }
`;

const StatItem = styled.div`
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: ${borderRadius.xl};
  padding: ${spacing.xl};
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const StatNumber = styled.div`
  color: white;
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.sm};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.lg};
  }
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
`;

export default Dashboard;