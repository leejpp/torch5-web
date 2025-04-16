import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { theme } from '../styles/theme';

const UserLayout = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Container>
      <Header>
        <HeaderContent>
          <HomeLink to="/">
            <Logo>TOGY 청년부</Logo>
          </HomeLink>
          <MenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <MenuIcon>{isMenuOpen ? '✕' : '☰'}</MenuIcon>
          </MenuButton>
          <Nav $isOpen={isMenuOpen}>
            <NavLink to="/prayer" $isActive={location.pathname === '/prayer'}>중보기도</NavLink>
            <NavLink to="/voices" $isActive={location.pathname === '/voices'}>마음의 소리</NavLink>
            <NavLink to="/calendar" $isActive={location.pathname === '/calendar'}>일정</NavLink>
          </Nav>
        </HeaderContent>
      </Header>
      <Main>
        <Outlet />
      </Main>
      <Footer>
        <FooterContent>
          <FooterText>© 2025 TOGY 청년부. All rights reserved.</FooterText>
        </FooterContent>
      </Footer>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
`;

const Header = styled.header`
  background-color: #4285F4;
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 0.8rem 1.5rem;
  }
`;

const HomeLink = styled(Link)`
  text-decoration: none;
`;

const Logo = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
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
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: #357ae8;
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
  background-color: ${props => props.$isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    width: 100%;
    text-align: center;
  }
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  margin: 0 auto;
`;

const Footer = styled.footer`
  background-color: #e7f0ff;
  padding: 1.5rem 0;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
`;

const FooterText = styled.p`
  color: #4285F4;
  font-size: 0.9rem;
  margin: 0;
`;

export default UserLayout;