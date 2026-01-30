import React from 'react';
import styled from 'styled-components';
import { Link, Outlet } from 'react-router-dom';
import { colors, typography, spacing, shadows, media } from '../styles/designSystem';

const SimpleLayout = () => {
    return (
        <Container>
            <Header>
                <HeaderContent>
                    <BackToMain to="/">⬅︎ 메인으로</BackToMain>
                    <Logo>TorchChurch</Logo>
                    <HeaderSpacer />
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
  background-color: ${colors.neutral[50]};
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid ${colors.neutral[200]};
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: ${shadows.sm};
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${spacing.md} ${spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BackToMain = styled(Link)`
  color: ${colors.neutral[600]};
  text-decoration: none;
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    color: ${colors.primary[700]};
  }
`;

const Logo = styled.h1`
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.primary[700]};
  font-family: ${typography.fontFamily.heading};
  margin: 0;
`;

const HeaderSpacer = styled.div`
  width: 80px; // To balance the Back button for centering Logo
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  margin: 0 auto;
`;

const Footer = styled.footer`
  background: ${colors.neutral[100]};
  padding: ${spacing.lg} 0;
  margin-top: auto;
  border-top: 1px solid ${colors.neutral[200]};
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${spacing.lg};
  text-align: center;
`;

const FooterText = styled.p`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.sm};
  margin: 0;
`;

export default SimpleLayout;
