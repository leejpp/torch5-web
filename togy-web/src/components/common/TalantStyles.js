import styled, { keyframes } from 'styled-components';

// 공통 애니메이션
export const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// 공통 컨테이너
export const CommonContainer = styled.div`
  min-height: 100vh;
  background: #FAFAFC;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', Arial, sans-serif;
  color: #222;
`;

// 공통 헤더
export const CommonHeader = styled.div`
  position: sticky;
  top: 0;
  background: white;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  z-index: 100;
`;

export const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

export const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

// 공통 버튼들
export const PrimaryButton = styled.button`
  background: #3182F6;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2B6CB0;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled(PrimaryButton)`
  background: #10B981;
  
  &:hover {
    background: #059669;
  }
`;

export const TertiaryButton = styled(PrimaryButton)`
  background: #7C3AED;
  
  &:hover {
    background: #6D28D9;
  }
`;

// 공통 타이틀
export const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  margin: 0;
`;

// 공통 카드
export const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  animation: ${fadeInUp} 0.8s ease-out ${props => props.delay || 0}s both;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
`;

// 로딩 스피너
export const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

// 공통 메시지
export const SuccessMessage = styled.div`
  background: rgba(16, 185, 129, 0.1);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  color: #10B981;
  border: 1px solid rgba(16, 185, 129, 0.2);
  margin-top: 12px;
  animation: ${fadeInUp} 0.5s ease-out;
`;

export const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  margin-top: 12px;
  animation: ${fadeInUp} 0.5s ease-out;
`; 