import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';

const TalantDashboard = () => {
  return (
    <Container>
      <MainContent>
        <DashboardSection>
          <SectionHeader>
            <SectionTitle>교회학교 관리</SectionTitle>
            <SectionDescription>주일학교 학생들의 달란트와 성장을 관리하세요</SectionDescription>
          </SectionHeader>

          <MenuGrid>
            <MenuCard to="/admin/talant/input" delay={0}>
              <CardGradient color="primary" />
              <CardContent>
                <MenuIconContainer>
                  <MenuIcon>✏️</MenuIcon>
                  <IconRing />
                </MenuIconContainer>
                <MenuInfo>
                  <MenuTitle>달란트 입력</MenuTitle>
                  <MenuDescription>
                    주일학교 학생들의 달란트 부여<br />
                    빠르고 쉬운 입력 시스템
                  </MenuDescription>
                </MenuInfo>
                <MenuArrow>→</MenuArrow>
              </CardContent>
            </MenuCard>

            <MenuCard to="/admin/talant/history" delay={0.1}>
              <CardGradient color="secondary" />
              <CardContent>
                <MenuIconContainer>
                  <MenuIcon>📊</MenuIcon>
                  <IconRing />
                </MenuIconContainer>
                <MenuInfo>
                  <MenuTitle>달란트 내역</MenuTitle>
                  <MenuDescription>
                    전체 달란트 지급 내역 조회<br />
                    날짜별 체계적인 관리
                  </MenuDescription>
                </MenuInfo>
                <MenuArrow>→</MenuArrow>
              </CardContent>
            </MenuCard>

            <MenuCard to="/admin/talant/board" delay={0.2}>
              <CardGradient color="accent" />
              <CardContent>
                <MenuIconContainer>
                  <MenuIcon>📅</MenuIcon>
                  <IconRing />
                </MenuIconContainer>
                <MenuInfo>
                  <MenuTitle>달란트 현황판</MenuTitle>
                  <MenuDescription>
                    학생별 월간 현황 대시보드<br />
                    한눈에 보는 달란트 현황
                  </MenuDescription>
                </MenuInfo>
                <MenuArrow>→</MenuArrow>
              </CardContent>
            </MenuCard>

            <MenuCard to="/admin/talant/students" delay={0.3}>
              <CardGradient color="success" />
              <CardContent>
                <MenuIconContainer>
                  <MenuIcon>👥</MenuIcon>
                  <IconRing />
                </MenuIconContainer>
                <MenuInfo>
                  <MenuTitle>학생 관리</MenuTitle>
                  <MenuDescription>
                    학생 명단 관리 및 수정<br />
                    새로운 학생 등록 및 삭제
                  </MenuDescription>
                </MenuInfo>
                <MenuArrow>→</MenuArrow>
              </CardContent>
            </MenuCard>
          </MenuGrid>
        </DashboardSection>
      </MainContent>
    </Container>
  );
};

// Animations
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

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background-color: ${colors.neutral[50]};
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
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
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
  font-size: ${typography.fontSize['3xl']};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.sm};
  font-family: ${typography.fontFamily.heading};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize['2xl']};
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
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${spacing.xl};
  
  ${media['max-md']} {
    grid-template-columns: 1fr;
    gap: ${spacing.lg};
  }
`;

const MenuCard = styled(Link)`
  position: relative;
  background: white;
  border-radius: ${borderRadius['2xl']};
  box-shadow: ${shadows.md};
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  overflow: hidden;
  animation: ${fadeInUp} 0.8s ease-out ${props => 0.4 + props.delay}s both;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${shadows.xl};
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
        props.color === 'accent' ? colors.gradients.accent :
          colors.success[500]
  };
`;

const CardContent = styled.div`
  padding: ${spacing['2xl']};
  display: flex;
  align-items: flex-start;
  gap: ${spacing.xl};
  height: 100%;
  
  ${media['max-md']} {
    padding: ${spacing.xl};
    align-items: center;
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
  width: 60px;
  height: 60px;
  border: 2px solid ${colors.primary[100]};
  border-radius: ${borderRadius.full};
  animation: ${ringExpand} 2s ease-out infinite;
`;

const MenuInfo = styled.div`
  flex: 1;
`;

const MenuTitle = styled.h3`
  color: ${colors.neutral[800]};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.xs};
  font-family: ${typography.fontFamily.heading};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.lg};
  }
`;

const MenuDescription = styled.p`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.sm};
  line-height: ${typography.lineHeight.relaxed};
  margin: 0;
`;

const MenuArrow = styled.div`
  font-size: ${typography.fontSize['2xl']};
  color: ${colors.neutral[300]};
  transition: transform 0.3s ease, color 0.3s ease;
  align-self: center;
  
  ${MenuCard}:hover & {
    transform: translateX(5px);
    color: ${colors.primary[500]};
  }
`;

export default TalantDashboard; 