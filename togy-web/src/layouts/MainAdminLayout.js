import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { colors, typography, spacing, shadows, borderRadius, media } from '../styles/designSystem';

const MainAdminLayout = () => {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <Container>
            <Header>
                <HeaderContent>
                    <BackToPortal to="/admin">⬅︎ 전체 관리자</BackToPortal>
                    <HomeLink to="/admin/main">
                        <Logo>TorchChurch 본당 관리자</Logo>
                    </HomeLink>
                    <MenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <MenuIcon>{isMenuOpen ? '✕' : '☰'}</MenuIcon>
                    </MenuButton>
                    <Nav $isOpen={isMenuOpen}>
                        <NavLink to="/admin/main/members" $isActive={location.pathname === '/admin/main/members'}>성도 관리</NavLink>
                    </Nav>
                </HeaderContent>
            </Header>
            <Main>
                <Outlet />
            </Main>
            <Footer>
                <FooterContent>
                    <FooterText>© 2026 TorchChurch 본당 관리자. All rights reserved.</FooterText>
                </FooterContent>
            </Footer>
        </Container>
    );
};

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${colors.neutral[50]};
`;

const Header = styled.header`
  background: linear-gradient(135deg, ${colors.primary[800]} 0%, ${colors.primary[600]} 100%);
  color: white;
  box-shadow: ${shadows.lg};
  position: sticky;
  top: 0;
  z-index: 100;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${spacing.md} ${spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  ${media['max-md']} {
    padding: ${spacing.md};
  }
`;

const BackToPortal = styled(Link)`
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: ${typography.fontSize.sm};
  margin-right: ${spacing.lg};
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
  
  &:hover {
    color: white;
  }
`;

const HomeLink = styled(Link)`
  text-decoration: none;
`;

const Logo = styled.h1`
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  
  &::before {
    content: '⛪️';
    font-size: ${typography.fontSize.xl};
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  
  ${media['max-md']} {
    display: block;
  }
`;

const MenuIcon = styled.span`
  display: block;
  line-height: 1;
`;

const Nav = styled.nav`
  display: flex;
  gap: ${spacing.md};
  
  ${media['max-md']} {
    display: ${props => props.$isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: ${colors.primary[800]};
    padding: ${spacing.md};
    flex-direction: column;
    box-shadow: ${shadows.lg};
  }
`;

const NavLink = styled(Link)`
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: ${typography.fontWeight.medium};
  font-size: ${typography.fontSize.sm};
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.md};
  transition: all 0.2s ease;
  background-color: ${props => props.$isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: ${spacing.xl};
  
  ${media['max-md']} {
    padding: ${spacing.md};
  }
`;

const Footer = styled.footer`
  background: white;
  padding: ${spacing.xl} 0;
  margin-top: auto;
  border-top: 1px solid ${colors.neutral[200]};
`;

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${spacing.xl};
  text-align: center;
`;

const FooterText = styled.p`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.sm};
  margin: 0;
`;

export default MainAdminLayout;
