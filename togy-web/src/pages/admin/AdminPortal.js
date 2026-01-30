import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';

const AdminPortal = () => {
    const [openSection, setOpenSection] = React.useState('');

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? '' : section);
    };

    return (
        <Container>
            <ContentWrapper>
                <HeaderSection>
                    <MainTitle>횃불교회 통합 관리자</MainTitle>
                    <SubTitle>관리하실 부서를 선택해주세요</SubTitle>
                </HeaderSection>

                {/* 1. 횃불교회 (Torch Church) */}
                <SectionGroup>
                    <AccordionHeader
                        isOpen={openSection === 'church'}
                        onClick={() => toggleSection('church')}
                        style={{ borderColor: colors.primary[200] }}
                    >
                        <HeaderIcon>⛪️</HeaderIcon>
                        <HeaderText>
                            <HeaderTitle>횃불교회 (본당)</HeaderTitle>
                            <HeaderDesc>Torch Church Admin</HeaderDesc>
                        </HeaderText>
                        <HeaderArrow isOpen={openSection === 'church'}>▼</HeaderArrow>
                    </AccordionHeader>

                    <AccordionContent isOpen={openSection === 'church'}>
                        <SubButton to="/admin/main/members">
                            <ButtonIcon>👥</ButtonIcon>
                            <ButtonText>
                                <ButtonTitle>성도 관리</ButtonTitle>
                            </ButtonText>
                            <ArrowIcon>→</ArrowIcon>
                        </SubButton>
                        <SubButton to="/admin/main/schedule">
                            <ButtonIcon>📅</ButtonIcon>
                            <ButtonText>
                                <ButtonTitle>일정 관리</ButtonTitle>
                            </ButtonText>
                            <ArrowIcon>→</ArrowIcon>
                        </SubButton>
                        <SubButton to="/admin/main/notice">
                            <ButtonIcon>📢</ButtonIcon>
                            <ButtonText>
                                <ButtonTitle>공지사항 관리</ButtonTitle>
                            </ButtonText>
                            <ArrowIcon>→</ArrowIcon>
                        </SubButton>
                    </AccordionContent>
                </SectionGroup>

                {/* 2. TOGY 청년부 (TOGY Youth) */}
                <SectionGroup>
                    <AccordionHeader
                        isOpen={openSection === 'youth'}
                        onClick={() => toggleSection('youth')}
                        style={{ borderColor: colors.primary[400] }}
                    >
                        <HeaderIcon>🔥</HeaderIcon>
                        <HeaderText>
                            <HeaderTitle>TOGY 청년부</HeaderTitle>
                            <HeaderDesc>Youth Ministry Admin</HeaderDesc>
                        </HeaderText>
                        <HeaderArrow isOpen={openSection === 'youth'}>▼</HeaderArrow>
                    </AccordionHeader>

                    <AccordionContent isOpen={openSection === 'youth'}>
                        <SubButton to="/admin/togy/prayer">
                            <ButtonIcon>🙏</ButtonIcon>
                            <ButtonText>
                                <ButtonTitle>중보기도 관리</ButtonTitle>
                            </ButtonText>
                            <ArrowIcon>→</ArrowIcon>
                        </SubButton>
                        <SubButton to="/admin/togy/voices">
                            <ButtonIcon>💬</ButtonIcon>
                            <ButtonText>
                                <ButtonTitle>마음의 소리</ButtonTitle>
                            </ButtonText>
                            <ArrowIcon>→</ArrowIcon>
                        </SubButton>

                        <SubButton to="/admin/togy/yearlythemes">
                            <ButtonIcon>📖</ButtonIcon>
                            <ButtonText>
                                <ButtonTitle>연간 테마</ButtonTitle>
                            </ButtonText>
                            <ArrowIcon>→</ArrowIcon>
                        </SubButton>
                        <SubButton to="/admin/togy/cells">
                            <ButtonIcon>👥</ButtonIcon>
                            <ButtonText>
                                <ButtonTitle>셀 재편성</ButtonTitle>
                            </ButtonText>
                            <ArrowIcon>→</ArrowIcon>
                        </SubButton>
                    </AccordionContent>
                </SectionGroup>

                {/* 3. 교회학교 (Church School) */}
                <SectionGroup>
                    <AccordionHeader
                        isOpen={openSection === 'school'}
                        onClick={() => toggleSection('school')}
                        style={{ borderColor: colors.secondary[400] }}
                    >
                        <HeaderIcon>🌱</HeaderIcon>
                        <HeaderText>
                            <HeaderTitle>교회학교</HeaderTitle>
                            <HeaderDesc>Church School Admin</HeaderDesc>
                        </HeaderText>
                        <HeaderArrow isOpen={openSection === 'school'}>▼</HeaderArrow>
                    </AccordionHeader>

                    <AccordionContent isOpen={openSection === 'school'}>
                        <SubButton to="/admin/talant/input">
                            <ButtonIcon>✍️</ButtonIcon>
                            <ButtonText>
                                <ButtonTitle>달란트 입력</ButtonTitle>
                            </ButtonText>
                            <ArrowIcon>→</ArrowIcon>
                        </SubButton>
                        <SubButton to="/admin/talant/history">
                            <ButtonIcon>📜</ButtonIcon>
                            <ButtonText>
                                <ButtonTitle>달란트 내역</ButtonTitle>
                            </ButtonText>
                            <ArrowIcon>→</ArrowIcon>
                        </SubButton>
                        <SubButton to="/admin/talant/board">
                            <ButtonIcon>📊</ButtonIcon>
                            <ButtonText>
                                <ButtonTitle>달란트 현황판</ButtonTitle>
                            </ButtonText>
                            <ArrowIcon>→</ArrowIcon>
                        </SubButton>
                        <SubButton to="/admin/talant/students">
                            <ButtonIcon>🎓</ButtonIcon>
                            <ButtonText>
                                <ButtonTitle>학생 관리</ButtonTitle>
                            </ButtonText>
                            <ArrowIcon>→</ArrowIcon>
                        </SubButton>
                    </AccordionContent>
                </SectionGroup>

                <Footer>
                    <HomeLink to="/">메인으로 돌아가기</HomeLink>
                    <Copyright>© 2026 Torch Church Admin Portal</Copyright>
                </Footer>
            </ContentWrapper>
        </Container>
    );
};

const Container = styled.div`
    min-height: 100vh;
    background-color: ${colors.neutral[50]};
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${spacing.xl};
    background-image: radial-gradient(${colors.neutral[200]} 1px, transparent 1px);
    background-size: 20px 20px;
`;

const ContentWrapper = styled.div`
    max-width: 800px;
    width: 100%;
`;

const HeaderSection = styled.div`
    text-align: center;
    margin-bottom: ${spacing['4xl']};
`;

const MainTitle = styled.h1`
    font-size: ${typography.fontSize['4xl']};
    color: ${colors.primary[800]};
    margin-bottom: ${spacing.sm};
    
    ${media['max-md']} {
        font-size: ${typography.fontSize['3xl']};
    }
`;

const SubTitle = styled.p`
    font-size: ${typography.fontSize.xl};
    color: ${colors.neutral[500]};
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
  padding: ${spacing.lg};
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
  transform: rotate(${props => props.isOpen ? '180deg' : '0deg'});
`;

const AccordionContent = styled.div`
  overflow: hidden;
  max-height: ${props => props.isOpen ? '500px' : '0'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  transform: translateY(${props => props.isOpen ? '0' : '-10px'});
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  padding-top: ${props => props.isOpen ? spacing.sm : '0'};
  padding-left: ${spacing.md};
`;

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

const ButtonIcon = styled.div`
  font-size: ${typography.fontSize.xl};
  margin-right: ${spacing.lg};
  min-width: 24px;
  text-align: center;
`;

const ButtonText = styled.div`
  flex: 1;
`;

const ButtonTitle = styled.h3`
  font-family: ${typography.fontFamily.heading};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[800]};
  margin-bottom: 2px;
`;

const ButtonDesc = styled.p`
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.xs};
  color: ${colors.neutral[500]};
`;

const ArrowIcon = styled.div`
    font-size: ${typography.fontSize.lg};
    color: ${colors.neutral[300]};
    transition: all 0.3s ease;
`;

const Footer = styled.div`
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: ${spacing.md};
`;

const HomeLink = styled(Link)`
    color: ${colors.primary[600]};
    font-weight: 500;
    text-decoration: none;
    
    &:hover {
        text-decoration: underline;
    }
`;

const Copyright = styled.div`
    color: ${colors.neutral[400]};
    font-size: ${typography.fontSize.sm};
`;

export default AdminPortal;
