import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <Container>
      <Header>
        <HeaderContent>
          <HomeLink to="/admin">TOGY 관리자</HomeLink>
          <Nav>
            <NavLink to="/admin/notice">공지사항</NavLink>
            <NavLink to="/admin/prayer">중보기도</NavLink>
            <NavLink to="/admin/voices">마음의 소리</NavLink>
            <NavLink to="/admin/calendar">일정관리</NavLink>
            <NavLink to="/admin/members">멤버관리</NavLink>
          </Nav>
        </HeaderContent>
      </Header>
      <Main>{children}</Main>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
`;

const Header = styled.header`
  background-color: #333;
  color: white;
  padding: 1rem 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const HomeLink = styled(Link)`
  font-size: 1.5rem;
  color: white;
  text-decoration: none;
  
  &:hover {
    color: #FFB6C1;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 0.5rem;
  
  &:hover {
    color: #FFB6C1;
  }
`;

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export default AdminLayout;