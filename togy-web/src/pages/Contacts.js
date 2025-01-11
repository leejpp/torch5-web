import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Contacts = () => {
  return (
    <Container>
      <Header>
        <TitleSection>
          <HomeButton to="/">← 홈으로</HomeButton>
          <Title>비상연락망</Title>
        </TitleSection>
      </Header>
    </Container>
  );
};

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HomeButton = styled(Link)`
  color: #666;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-size: 1rem;
  
  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
`;

export default Contacts;