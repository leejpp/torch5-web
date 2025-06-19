import React, { Suspense } from 'react';
import styled from 'styled-components';

// Lazy Loading 컴포넌트들
const TalantDashboard = React.lazy(() => import('./Dashboard'));
const TalantInput = React.lazy(() => import('./Input'));
const TalantHistory = React.lazy(() => import('./History'));
const TalantBoard = React.lazy(() => import('./Board'));
const TalantRank = React.lazy(() => import('./Rank'));

// 로딩 컴포넌트
const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #FAFAFC;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', Arial, sans-serif;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3182f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
`;

const TalantLoadingFallback = () => (
  <LoadingContainer>
    <LoadingSpinner />
    <LoadingText>달란트 시스템을 불러오는 중...</LoadingText>
  </LoadingContainer>
);

// HOC로 Suspense 감싸기
const withSuspense = (Component) => (props) => (
  <Suspense fallback={<TalantLoadingFallback />}>
    <Component {...props} />
  </Suspense>
);

export const LazyTalantDashboard = withSuspense(TalantDashboard);
export const LazyTalantInput = withSuspense(TalantInput);
export const LazyTalantHistory = withSuspense(TalantHistory);
export const LazyTalantBoard = withSuspense(TalantBoard);
export const LazyTalantRank = withSuspense(TalantRank); 