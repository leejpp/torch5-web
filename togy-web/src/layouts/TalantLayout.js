import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background-color: #F5F5F7;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const TalantLayout = () => {
  return (
    <LayoutContainer>
      <Outlet />
    </LayoutContainer>
  );
};

export default TalantLayout; 