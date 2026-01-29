import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import styled from 'styled-components';
import { colors, typography, spacing, shadows, borderRadius, media } from '../styles/designSystem';

const TalantLayout = () => {
  return (
    <LayoutContainer>
      <Header>
        <HeaderContent>
          <BackToPortal to="/admin">⬅︎ 전체 관리자</BackToPortal>
          <Title to="/admin/talant">🌱 교회학교 관리자</Title>
          <Nav>
            <NavLink to="/admin/talant/input">입력</NavLink>
            <NavLink to="/admin/talant/history">내역</NavLink>
            <NavLink to="/admin/talant/board">현황판</NavLink>
            <NavLink to="/admin/talant/students">학생관리</NavLink>
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
  background-color: #F5F5F7;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid ${colors.neutral[200]};
  padding: ${spacing.md} 0;
  box-shadow: ${shadows.sm};
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
  gap: ${spacing.md};
  
  ${media['max-md']} {
    gap: ${spacing.sm};
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: ${colors.neutral[600]};
  font-weight: 500;
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${borderRadius.md};
  transition: all 0.2s;

  &:hover {
    background-color: ${colors.neutral[100]};
    color: ${colors.primary[600]};
  }
`;

const Main = styled.main`
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: ${spacing.xl} ${spacing.lg};
`;

export default TalantLayout;