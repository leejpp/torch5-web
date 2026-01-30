import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { colors, typography, spacing, shadows, borderRadius, media } from '../styles/designSystem';

const AdminLayout = () => {
  const location = useLocation();

  return (
    <LayoutContainer>
      <Header>
        <HeaderContent>
          <BackToPortal to="/admin">⬅︎ 전체 관리자</BackToPortal>
          <Title to="/admin/togy">🔥 TOGY 청년부</Title>
          <Nav>
            <NavLink to="/admin/togy/prayer" $isActive={location.pathname.includes('/prayer')}>중보기도</NavLink>

            <NavLink to="/admin/togy/yearlythemes" $isActive={location.pathname.includes('/yearlythemes')}>연간테마</NavLink>
            <NavLink to="/admin/togy/cells" $isActive={location.pathname.includes('/cells')}>셀 재편성</NavLink>
          </Nav>
        </HeaderContent>
      </Header>
      <Main>
        <Outlet />
      </Main>
    </LayoutContainer>
  );
};

const LayoutContainer = styled.div`
  min-height: 100vh;
  background-color: ${colors.background};
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid ${colors.neutral[200]};
  padding: ${spacing.md} 0;
  box-shadow: ${shadows.sm};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${spacing.lg};
  display: flex;
  align-items: center;
  gap: ${spacing.xl};

  ${media['max-md']} {
    flex-direction: column;
    gap: ${spacing.md};
  }
`;

const BackToPortal = styled(Link)`
  color: ${colors.neutral[500]};
  text-decoration: none;
  font-size: ${typography.fontSize.sm};
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    color: ${colors.neutral[800]};
  }
`;

const Title = styled(Link)`
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.primary[600]};
  text-decoration: none;
  margin-right: auto;
  
  ${media['max-md']} {
    margin-right: 0;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: ${spacing.sm};
  
  ${media['max-md']} {
    gap: ${spacing.xs};
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: ${props => props.$isActive ? colors.primary[600] : colors.neutral[600]};
  font-weight: ${props => props.$isActive ? typography.fontWeight.bold : typography.fontWeight.medium};
  padding: ${spacing.xs} ${spacing.md};
  border-radius: ${borderRadius.md};
  transition: all 0.2s;
  background-color: ${props => props.$isActive ? colors.primary[50] : 'transparent'};

  &:hover {
    background-color: ${colors.neutral[100]};
    color: ${colors.primary[600]};
  }
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  margin: 0 auto;
  padding: 0;
`;

export default AdminLayout;