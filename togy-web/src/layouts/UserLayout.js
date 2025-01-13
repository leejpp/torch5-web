import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const UserLayout = ({ children }) => {
  return (
    <Container>
      <Header>
        <HomeLink to="/">TOGY 청년부</HomeLink>
      </Header>
      <Main>{children}</Main>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const HomeLink = styled(Link)`
  font-size: 1.5rem;
  color: #333;
  text-decoration: none;
  
  &:hover {
    color: #FFB6C1;
  }
`;

const Main = styled.main`
  min-height: calc(100vh - 100px);
`;

export default UserLayout;