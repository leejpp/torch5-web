import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { colors, typography, spacing, borderRadius, shadows, media } from '../styles/designSystem';

const MainLanding = () => {
  const [openSection, setOpenSection] = React.useState('');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? '' : section);
  };

  return (
    <Container>
      <ContentWrapper>
        <LogoSection>
          <LogoIcon>🔥</LogoIcon>
          <MainTitle>Torch Church</MainTitle>
          <SubTitle>'여호와를 기뻐하는 것이 우리의 힘이라!'</SubTitle>
        </LogoSection>

        <AdminLink to="/admin">⚙️</AdminLink>

        {/* 1. 횃불교회 (Torch Church) */}
        <SectionGroup>
          <AccordionHeader
            $isOpen={openSection === 'church'}
            onClick={() => toggleSection('church')}
          >
            <HeaderIcon>⛪</HeaderIcon>
            <HeaderText>
              <HeaderTitle>횃불교회</HeaderTitle>
              <HeaderDesc>Torch Church</HeaderDesc>
            </HeaderText>
            <HeaderArrow $isOpen={openSection === 'church'}>▼</HeaderArrow>
          </AccordionHeader>

          <AccordionContent $isOpen={openSection === 'church'}>
            <SubButton to="/schedule" style={{ borderColor: colors.primary[200] }}>
              <ButtonIcon>📅</ButtonIcon>
              <ButtonText>
                <ButtonTitle>교회 일정 보기</ButtonTitle>
              </ButtonText>
              <ArrowIcon>→</ArrowIcon>
            </SubButton>

            <SubButton to="/notice" style={{ borderColor: colors.primary[200] }}>
              <ButtonIcon>📢</ButtonIcon>
              <ButtonText>
                <ButtonTitle>교회 소식 보기</ButtonTitle>
              </ButtonText>
              <ArrowIcon>→</ArrowIcon>
            </SubButton>



            <SubButton to="/birthdays">
              <ButtonIcon>🎂</ButtonIcon>
              <ButtonText>
                <ButtonTitle>전교인 생일 보기</ButtonTitle>
              </ButtonText>
              <ArrowIcon>→</ArrowIcon>
            </SubButton>
          </AccordionContent>
        </SectionGroup>

        {/* 2. TOGY 청년부 (TOGY Youth) */}
        <SectionGroup>
          <AccordionHeader
            $isOpen={openSection === 'youth'}
            onClick={() => toggleSection('youth')}
            style={{ borderColor: colors.primary[400] }}
          >
            <HeaderIcon>🌱</HeaderIcon>
            <HeaderText>
              <HeaderTitle>TOGY 청년부</HeaderTitle>
              <HeaderDesc>Torch Of God Youth</HeaderDesc>
            </HeaderText>
            <HeaderArrow $isOpen={openSection === 'youth'}>▼</HeaderArrow>
          </AccordionHeader>

          <AccordionContent $isOpen={openSection === 'youth'}>
            <SubButton to="/togy" style={{ borderColor: colors.primary[400] }}>
              <ButtonIcon>🏠</ButtonIcon>
              <ButtonText>
                <ButtonTitle>청년부 메인</ButtonTitle>
              </ButtonText>
              <ArrowIcon>→</ArrowIcon>
            </SubButton>

            <SubButton to="/togy/prayer" style={{ borderColor: colors.primary[400] }}>
              <ButtonIcon>🙏</ButtonIcon>
              <ButtonText>
                <ButtonTitle>중보기도</ButtonTitle>
              </ButtonText>
              <ArrowIcon>→</ArrowIcon>
            </SubButton>


          </AccordionContent>
        </SectionGroup>

        {/* 3. 교회학교 (Church School) */}
        <SectionGroup>
          <AccordionHeader
            $isOpen={openSection === 'school'}
            onClick={() => toggleSection('school')}
            style={{ borderColor: colors.secondary[200] }}
          >
            <HeaderIcon>🏫</HeaderIcon>
            <HeaderText>
              <HeaderTitle>교회학교</HeaderTitle>
              <HeaderDesc>Church School</HeaderDesc>
            </HeaderText>
            <HeaderArrow $isOpen={openSection === 'school'}>▼</HeaderArrow>
          </AccordionHeader>

          <AccordionContent $isOpen={openSection === 'school'}>
            <SubButton to="/talant-rank" style={{ borderColor: colors.secondary[200] }}>
              <ButtonIcon>🏆</ButtonIcon>
              <ButtonText>
                <ButtonTitle>달란트 랭킹 보기</ButtonTitle>
              </ButtonText>
              <ArrowIcon>→</ArrowIcon>
            </SubButton>
          </AccordionContent>
        </SectionGroup>

        {/* Feedback Section (Minimal) */}
        <MinimalFeedbackLink to="/feedback">
          사이트 이용 의견 / 오류 제보
        </MinimalFeedbackLink>

        <SocialSection>
          <SocialTitle>Follow Us</SocialTitle>
          <SocialLinks>
            <SocialLink href="https://www.instagram.com/the__seomgim" target="_blank" rel="noopener noreferrer">
              <SocialIcon>📷</SocialIcon> The섬김 중등부
            </SocialLink>
            <SocialLink href="https://www.youtube.com/@JR_worship" target="_blank" rel="noopener noreferrer">
              <SocialIcon>📺</SocialIcon> JR워십
            </SocialLink>
          </SocialLinks>
        </SocialSection>

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
  font-size: ${typography.fontSize.xl};
  margin-right: ${spacing.lg};
  transition: transform 0.3s ease;
`;

const ButtonText = styled.div`
  flex: 1;
  text-align: left;
`;

const ButtonTitle = styled.h3`
  font-family: ${typography.fontFamily.heading};
  font-size: ${typography.fontSize.base};
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

// Accordion Styles
const SectionGroup = styled.div`
  margin-bottom: ${spacing.md};
  width: 100%;
`;

const AccordionHeader = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  background: white;
  padding: ${spacing.lg}; // Slightly smaller than primary
  border-radius: ${borderRadius.xl};
  border: 1px solid ${colors.neutral[200]};
  box-shadow: ${shadows.sm};
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
    border-color: ${colors.primary[200]};
  }
`;

const HeaderIcon = styled.div`
  font-size: ${typography.fontSize['2xl']};
  margin-right: ${spacing.lg};
`;

const HeaderText = styled.div`
  flex: 1;
`;

const HeaderTitle = styled.h3`
  font-family: ${typography.fontFamily.heading};
  font-size: ${typography.fontSize.lg}; 
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[800]};
  margin-bottom: 2px;
`;

const HeaderDesc = styled.p`
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[500]};
`;

const HeaderArrow = styled.div`
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[400]};
  transition: transform 0.3s;
  transform: rotate(${props => props.$isOpen ? '180deg' : '0deg'});
`;

const AccordionContent = styled.div`
  overflow: hidden;
  max-height: ${props => props.$isOpen ? '500px' : '0'};
  opacity: ${props => props.$isOpen ? '1' : '0'};
  transform: translateY(${props => props.$isOpen ? '0' : '-10px'});
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  padding-top: ${props => props.$isOpen ? spacing.sm : '0'};
  padding-left: ${spacing.md}; // Indent content
`;

// SubButton (Based on SecondaryButton but smaller)
const SubButton = styled(Link)`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  padding: ${spacing.md} ${spacing.lg};
  border-radius: ${borderRadius.xl};
  border: 1px solid ${colors.neutral[200]};
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    background: white;
    transform: translateX(4px);
    border-color: ${colors.primary[300]};
    
    & > div:last-child { // Arrow
      transform: translateX(4px);
      color: ${colors.primary[600]};
    }
  }
`;

const Footer = styled.footer`
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[400]};
`;

const SocialSection = styled.div`
  margin-top: ${spacing.lg};
  margin-bottom: ${spacing.xl};
  animation: ${fadeInUp} 1s ease-out;
`;

const SocialTitle = styled.div`
  font-size: 11px;
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[400]};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: ${spacing.md};
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: ${spacing.lg};
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[500]};
  text-decoration: none;
  transition: all 0.2s;
  padding: 6px 12px;
  border-radius: ${borderRadius.full};
  background: white;
  box-shadow: ${shadows.sm};
  border: 1px solid ${colors.neutral[200]};

  &:hover {
    color: ${colors.primary[600]};
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
    border-color: ${colors.primary[200]};
  }
`;

const MinimalFeedbackLink = styled(Link)`
  display: inline-block;
  margin-top: ${spacing.xl};
  margin-bottom: ${spacing.md};
  font-size: ${typography.fontSize.xs};
  color: ${colors.neutral[400]};
  text-decoration: underline;
  text-underline-offset: 4px;
  transition: color 0.2s;
  
  &:hover {
    color: ${colors.neutral[600]};
  }
`;

const SocialIcon = styled.span`
  margin-right: 6px;
  font-size: 1.1em;
`;

export default MainLanding;
