import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { colors, typography, spacing, shadows, borderRadius, media } from '../styles/designSystem';
import AdminAuth from '../components/admin/AdminAuth';

const AdminLayout = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <AdminAuth>
      <Container>
        <Header>
          <HeaderContent>
            <HomeLink to="/admin">
              <Logo>TOGY 관리자</Logo>
            </HomeLink>
            <MenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <MenuIcon>{isMenuOpen ? '✕' : '☰'}</MenuIcon>
            </MenuButton>
            <Nav $isOpen={isMenuOpen}>
              <NavLink to="/admin/prayer" $isActive={location.pathname === '/admin/prayer'}>중보기도</NavLink>
              <NavLink to="/admin/voices" $isActive={location.pathname === '/admin/voices'}>마음의 소리</NavLink>
              <NavLink to="/admin/calendar" $isActive={location.pathname === '/admin/calendar'}>일정관리</NavLink>
              <NavLink to="/admin/cells" $isActive={location.pathname === '/admin/cells'}>셀 재편성</NavLink>
            </Nav>
          </HeaderContent>
        </Header>
        <Main>
          <Outlet />
        </Main>
        <Footer>
          <FooterContent>
            <FooterText>© 2025 TOGY 청년부 관리자. All rights reserved.</FooterText>
          </FooterContent>
        </Footer>
      </Container>
    </AdminAuth>
  );
};

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
`;

const Header = styled.header`
  background: linear-gradient(135deg, ${colors.secondary[600]} 0%, ${colors.primary[600]} 100%);
  color: white;
  box-shadow: ${shadows.lg};
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${colors.gradients.accent};
  }
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
`;

const HomeLink = styled(Link)`
  text-decoration: none;
`;

const Logo = styled.h1`
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.extrabold};
  font-family: ${typography.fontFamily.heading};
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  
  &::before {
    content: '👑';
    font-size: ${typography.fontSize.lg};
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.xl};
    
    &::before {
      font-size: ${typography.fontSize.base};
    }
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
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
    background: linear-gradient(135deg, ${colors.secondary[700]} 0%, ${colors.primary[700]} 100%);
    backdrop-filter: blur(20px);
    padding: ${spacing.lg};
    flex-direction: column;
    gap: ${spacing.md};
    box-shadow: ${shadows.xl};
    border-top: 2px solid ${colors.gradients.accent};
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: ${typography.fontWeight.bold};
  font-size: ${typography.fontSize.base};
  padding: ${spacing.sm} ${spacing.lg};
  border-radius: ${borderRadius.lg};
  transition: all 0.3s ease;
  background-color: ${props => props.$isActive ? 'rgba(255, 255, 255, 0.3)' : 'transparent'};
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  border: 1px solid ${props => props.$isActive ? 'rgba(255, 255, 255, 0.3)' : 'transparent'};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: ${colors.gradients.accent};
    opacity: 0.2;
    transition: left 0.5s ease;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.4);
    
    &::before {
      left: 100%;
    }
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
  background: linear-gradient(135deg, ${colors.neutral[50]} 0%, ${colors.secondary[50]} 100%);
  padding: ${spacing['2xl']} 0;
  margin-top: auto;
  border-top: 1px solid ${colors.neutral[200]};
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${spacing['2xl']};
  text-align: center;
`;

const FooterText = styled.p`
  color: ${colors.neutral[600]};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  margin: 0;
  
  &::before {
    content: '👑 ';
    color: ${colors.secondary[500]};
  }
`;

export default AdminLayout;