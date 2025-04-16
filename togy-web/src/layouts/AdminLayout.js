import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, Outlet } from 'react-router-dom';
import { theme } from '../styles/theme';
import AdminAuth from '../components/admin/AdminAuth';

const AdminLayout = () => {
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
              <NavLink to="/admin/notice">공지사항</NavLink>
              <NavLink to="/admin/prayer">중보기도</NavLink>
              <NavLink to="/admin/voices">마음의 소리</NavLink>
              <NavLink to="/admin/calendar">일정관리</NavLink>
              <NavLink to="/admin/members">멤버관리</NavLink>
            </Nav>
          </HeaderContent>
        </Header>
        <Main>
          <Outlet />
        </Main>
        <Footer>
          <FooterContent>
            <FooterText>© 2024 TOGY 청년부 관리자. All rights reserved.</FooterText>
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
  background-color: ${theme.colors.background};
`;

const Header = styled.header`
  background-color: ${theme.colors.neutral[1]};
  box-shadow: ${theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: ${theme.breakpoints.xl};
  margin: 0 auto;
  padding: ${theme.spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing.sm};
  }
`;

const HomeLink = styled(Link)`
  text-decoration: none;
`;

const Logo = styled.h1`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.background};
  margin: 0;
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize.xl};
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${theme.colors.background};
  font-size: ${theme.typography.fontSize['2xl']};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: block;
  }
`;

const MenuIcon = styled.span`
  display: block;
  line-height: 1;
`;

const Nav = styled.nav`
  display: flex;
  gap: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: ${props => props.$isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: ${theme.colors.neutral[1]};
    padding: ${theme.spacing.md};
    flex-direction: column;
    gap: ${theme.spacing.sm};
  }
`;

const NavLink = styled(Link)`
  color: ${theme.colors.background};
  text-decoration: none;
  font-weight: ${theme.typography.fontWeight.medium};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  transition: ${theme.transitions.default};
  
  &:hover {
    background-color: ${theme.colors.neutral[4]};
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize.sm};
    width: 100%;
    text-align: center;
  }
`;

const Main = styled.main`
  flex: 1;
  max-width: ${theme.breakpoints.xl};
  margin: 0 auto;
  padding: ${theme.spacing.xl};
  width: 100%;
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing.md};
  }
`;

const Footer = styled.footer`
  background-color: ${theme.colors.neutral[2]};
  padding: ${theme.spacing.lg} 0;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: ${theme.breakpoints.xl};
  margin: 0 auto;
  padding: 0 ${theme.spacing.md};
  text-align: center;
`;

const FooterText = styled.p`
  color: ${theme.colors.neutral[3]};
  font-size: ${theme.typography.fontSize.sm};
  margin: 0;
`;

export default AdminLayout;