import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { colors, typography, spacing, shadows, borderRadius, media } from '../styles/designSystem';

const UserLayout = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Container>
      <Header>
        <HeaderContent>
          <BackToMain to="/">⬅︎ 메인으로</BackToMain>
          <HomeLink to="/togy">
            <Logo>TorchChurch</Logo>
          </HomeLink>
          <MenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <MenuIcon>{isMenuOpen ? '✕' : '☰'}</MenuIcon>
          </MenuButton>
          <Nav $isOpen={isMenuOpen}>
            <NavLink to="/togy/birthdays" $isActive={location.pathname === '/togy/birthdays'}>전교인 생일</NavLink>
            <NavLink to="/togy/prayer" $isActive={location.pathname === '/togy/prayer'}>중보기도</NavLink>
            <NavLink to="/togy/voices" $isActive={location.pathname === '/togy/voices'}>마음의 소리</NavLink>
            <NavLink to="/togy/calendar" $isActive={location.pathname === '/togy/calendar'}>일정</NavLink>
          </Nav>
        </HeaderContent>
      </Header>
      <Main>
        <Outlet />
      </Main>
      <Footer>
        <FooterContent>
          <FooterText>© 2026 TorchChurch. All rights reserved.</FooterText>
        </FooterContent>
      </Footer>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${colors.neutral[50]}; // Cream White
`;

const Header = styled.header`
  background: ${colors.neutral[50]}; // Cream White
  border-bottom: 1px solid ${colors.neutral[200]};
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${spacing.lg} ${spacing['2xl']};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
  
  ${media['max-md']} {
    padding: ${spacing.md} ${spacing.xl};
  }
  ${media['max-md']} {
    padding: ${spacing.md} ${spacing.xl};
  }
`;

const BackToMain = styled(Link)`
  position: absolute;
  left: ${spacing['2xl']};
  color: ${colors.neutral[500]};
  text-decoration: none;
  font-size: ${typography.fontSize.sm};
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    color: ${colors.primary[700]};
  }
  
  ${media['max-md']} {
    position: static;
    font-size: 0;
    &::before {
      content: '⬅︎';
      font-size: ${typography.fontSize.lg};
    }
  }
`;

const HomeLink = styled(Link)`
  text-decoration: none;
`;

const Logo = styled.h1`
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.extrabold};
  font-family: ${typography.fontFamily.heading};
  color: ${colors.primary[700]}; // Deep Green
  margin: 0;
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.xl};
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${colors.primary[700]};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MenuIcon = styled.span`
  display: block;
  line-height: 1;
`;

const Nav = styled.nav`
  display: flex;
  gap: ${spacing.xl};
  
  ${media['max-md']} {
    display: ${props => props.$isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: ${colors.neutral[50]};
    border-bottom: 1px solid ${colors.neutral[200]};
    padding: ${spacing.lg};
    flex-direction: column;
    gap: ${spacing.md};
    box-shadow: ${shadows.lg};
  }
`;

const NavLink = styled(Link)`
  color: ${colors.primary[700]}; // Deep Green
  text-decoration: none;
  font-weight: ${typography.fontWeight.semibold};
  font-size: ${typography.fontSize.base};
  padding: ${spacing.sm} ${spacing.lg};
  border-radius: ${borderRadius.lg};
  transition: all 0.2s ease;
  background-color: ${props => props.$isActive ? colors.primary[100] : 'transparent'};
  
  &:hover {
    background-color: ${colors.primary[50]};
    transform: translateY(-1px);
  }
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.sm};
    width: 100%;
    text-align: center;
    padding: ${spacing.md} ${spacing.lg};
  }
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  margin: 0 auto;
`;

const Footer = styled.footer`
  background: ${colors.primary[700]}; // Deep Green
  padding: ${spacing['2xl']} 0;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${spacing['2xl']};
  text-align: center;
`;

const FooterText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  margin: 0;
`;

export default UserLayout;