import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { colors, typography, spacing, borderRadius, shadows, media } from '../styles/designSystem';

const MainLanding = () => {
  return (
    <Container>
      <ContentWrapper>
        <LogoSection>
          <LogoIcon>🔥</LogoIcon>
          <MainTitle>Torch Church</MainTitle>
          <SubTitle>'여호와를 기뻐하는 것이 우리의 힘이라!'</SubTitle>
        </LogoSection>

        <AdminLink to="/admin">⚙️</AdminLink>

        <ButtonGroup>
          <PrimaryButton to="/togy">
            <ButtonIcon>🌱</ButtonIcon>
            <ButtonText>
              <ButtonTitle>TOGY 청년부</ButtonTitle>
              <ButtonDesc>Torch Of God Youth</ButtonDesc>
            </ButtonText>
            <ArrowIcon>→</ArrowIcon>
          </PrimaryButton>

          <SecondaryButton to="/birthdays">
            <ButtonIcon>🎂</ButtonIcon>
            <ButtonText>
              <ButtonTitle>전교인 생일 보기</ButtonTitle>
              <ButtonDesc>Celebrating Together</ButtonDesc>
            </ButtonText>
            <ArrowIcon>→</ArrowIcon>
          </SecondaryButton>

          <SecondaryButton to="/talant-rank" style={{ borderColor: colors.primary[200] }}>
            <ButtonIcon>🏆</ButtonIcon>
            <ButtonText>
              <ButtonTitle>달란트 랭킹 보기</ButtonTitle>
              <ButtonDesc>Talant Hall of Fame</ButtonDesc>
            </ButtonText>
            <ArrowIcon>→</ArrowIcon>
          </SecondaryButton>
        </ButtonGroup>

        <Footer>
          © 2026 Torch Church. All rights reserved.
        </Footer>
      </ContentWrapper>
    </Container>
  );
};

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

// Styles
const Container = styled.div`
  min-height: 100vh;
  background-color: ${colors.neutral[50]}; // Cream White
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${spacing.lg};
  background-image: radial-gradient(${colors.primary[50]} 1px, transparent 1px);
  background-size: 40px 40px;
  position: relative; // For absolute positioning of children
`;

const AdminLink = styled(Link)`
  position: absolute;
  top: ${spacing.xl};
  right: ${spacing.xl};
  font-size: ${typography.fontSize.xl};
  text-decoration: none;
  opacity: 0.3;
  transition: opacity 0.3s;
  
  &:hover {
    opacity: 1;
  }
`;

const ContentWrapper = styled.div`
  max-width: 600px;
  width: 100%;
  text-align: center;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const LogoSection = styled.div`
  margin-bottom: ${spacing['4xl']};
`;

const LogoIcon = styled.div`
  font-size: ${typography.fontSize['5xl']};
  margin-bottom: ${spacing.lg};
  animation: ${float} 3s ease-in-out infinite;
`;

const MainTitle = styled.h1`
  font-family: ${typography.fontFamily.heading};
  font-size: ${typography.fontSize['4xl']};
  font-weight: ${typography.fontWeight.extrabold};
  color: ${colors.primary[700]};
  margin-bottom: ${spacing.sm};
  letter-spacing: -0.02em;
  
  ${media['max-md']} {
    font-size: ${typography.fontSize['3xl']};
  }
`;

const SubTitle = styled.p`
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.xl};
  color: ${colors.neutral[500]};
  font-weight: ${typography.fontWeight.medium};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.lg};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
  margin-bottom: ${spacing['4xl']};
  
  ${media['max-md']} {
    width: 100%; // Full width on mobile
  }
`;

const PrimaryButton = styled(Link)`
  display: flex;
  align-items: center;
  background: white;
  padding: ${spacing.xl};
  border-radius: ${borderRadius['2xl']};
  border: 1px solid ${colors.neutral[200]};
  box-shadow: ${shadows.md};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${shadows.xl};
    border-color: ${colors.primary[300]};
    
    & > div:first-child { // Icon
      transform: scale(1.1) rotate(5deg);
    }
    
    & > div:last-child { // Arrow
      transform: translateX(4px);
      color: ${colors.primary[600]};
    }
  }
  
  &:active {
    transform: translateY(-2px);
  }
  
  ${media['max-md']} {
    padding: ${spacing.lg}; // Slightly smaller padding on mobile
  }
`;

const SecondaryButton = styled(Link)`
  display: flex;
  align-items: center;
  background: white;
  padding: ${spacing.xl};
  border-radius: ${borderRadius['2xl']};
  border: 1px solid ${colors.neutral[200]};
  box-shadow: ${shadows.md};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${shadows.xl};
    border-color: ${colors.secondary[300]}; // Yellow border
    
    & > div:first-child { // Icon
      transform: scale(1.1) rotate(-5deg);
    }
    
    & > div:last-child { // Arrow
      transform: translateX(4px);
      color: ${colors.secondary[600]};
    }
  }
  
  &:active {
    transform: translateY(-2px);
  }
`;

const ButtonIcon = styled.div`
  font-size: ${typography.fontSize['3xl']};
  margin-right: ${spacing.lg};
  transition: transform 0.3s ease;
`;

const ButtonText = styled.div`
  flex: 1;
  text-align: left;
`;

const ButtonTitle = styled.h3`
  font-family: ${typography.fontFamily.heading};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[800]};
  margin-bottom: 4px;
`;

const ButtonDesc = styled.p`
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[500]};
  font-weight: ${typography.fontWeight.medium};
`;

const ArrowIcon = styled.div`
  font-size: ${typography.fontSize.xl};
  color: ${colors.neutral[400]};
  transition: all 0.3s ease;
`;

const Footer = styled.footer`
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[400]};
`;

export default MainLanding;
