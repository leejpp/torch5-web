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
        </HeaderContent>
        {/* New Visible Navigation Bar */}
        <NavBar>
          <NavContainer>
            <NavLink to="/togy" $isActive={location.pathname === '/togy'}>
              <NavText>메인</NavText>
            </NavLink>
            <NavLink to="/togy/prayer" $isActive={location.pathname === '/togy/prayer'}>
              <NavText>중보기도</NavText>
            </NavLink>

          </NavContainer>
        </NavBar>
      </Header>
      <Main>
        <Outlet />
      </Main>
      <Footer>
        <FooterContent>
          <FooterText>© 2026 TorchChurch. All rights reserved.</FooterText>
        </FooterContent>
      </Footer>
    </Container >
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

const NavBar = styled.div`
  border-top: 1px solid ${colors.neutral[200]};
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 65px; // Below header
  z-index: 99;
`;

const NavContainer = styled.div`
  max-width: 600px; // Match content width
  margin: 0 auto;
  display: flex;
  justify-content: center;
  gap: ${spacing['2xl']};
  padding: 0 ${spacing.md};

  ${media['max-md']} {
     justify-content: space-around;
     padding: 0;
     gap: 0;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  padding: ${spacing.md} 0;
  color: ${props => props.$isActive ? colors.primary[700] : colors.neutral[400]};
  font-weight: ${props => props.$isActive ? typography.fontWeight.bold : typography.fontWeight.medium};
  font-size: ${typography.fontSize.sm};
  position: relative;
  transition: all 0.2s;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%) scaleX(${props => props.$isActive ? 1 : 0});
    width: 20px; // Small indicator
    height: 2px;
    background-color: ${colors.primary[600]};
    transition: transform 0.2s ease;
  }

  &:hover {
    color: ${colors.primary[800]};
  }
`;

const NavText = styled.span`
  white-space: nowrap;
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