import styled, { keyframes, css } from 'styled-components';

// 토스 컬러 시스템
export const TossColors = {
  // 주요 색상
  primary: '#0064FF',
  primaryLight: '#E6F2FF', 
  primaryDark: '#0050CC',
  
  // 그레이 계열
  grey50: '#F9FAFB',
  grey100: '#F3F4F6',
  grey200: '#E5E7EB',
  grey300: '#D1D5DB',
  grey400: '#9CA3AF',
  grey500: '#6B7280',
  grey600: '#4B5563',
  grey700: '#374151',
  grey800: '#1F2937',
  grey900: '#111827',
  
  // 상태 색상
  success: '#00C896',
  successLight: '#E6F9F5',
  warning: '#FF8A00',
  warningLight: '#FFF4E6',
  danger: '#FF4545',
  dangerLight: '#FFE6E6',
  
  // 배경 색상
  background: '#FFFFFF',
  backgroundSecondary: '#F8FAFC',
  backgroundTertiary: '#F1F3F4',
};

// 토스 애니메이션
export const TossAnimations = {
  fadeInUp: keyframes`
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,
  
  slideInLeft: keyframes`
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  `,
  
  bounce: keyframes`
    0%, 20%, 53%, 80%, 100% {
      animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
      transform: translate3d(0, -30px, 0);
    }
    70% {
      animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
      transform: translate3d(0, -15px, 0);
    }
    90% {
      transform: translate3d(0,-4px,0);
    }
  `,

  shimmer: keyframes`
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  `,
};

// 토스 컨테이너
export const TossContainer = styled.div`
  min-height: 100vh;
  background: ${TossColors.backgroundSecondary};
  font-family: 'SF Pro Display', 'SF Pro Icons', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: ${TossColors.grey900};
  line-height: 1.6;
`;

// 토스 헤더
export const TossHeader = styled.header`
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid ${TossColors.grey100};
  z-index: 100;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

export const TossHeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// 토스 버튼 스타일
const buttonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 600;
  text-decoration: none;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  user-select: none;
  outline: none;
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:focus-visible {
    outline: 2px solid ${TossColors.primary};
    outline-offset: 2px;
  }
`;

export const TossPrimaryButton = styled.button`
  ${buttonBase}
  background: ${TossColors.primary};
  color: white;
  padding: 12px 20px;
  font-size: 16px;
  
  &:hover:not(:disabled) {
    background: ${TossColors.primaryDark};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 100, 255, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

export const TossSecondaryButton = styled.button`
  ${buttonBase}
  background: ${TossColors.grey100};
  color: ${TossColors.grey700};
  padding: 12px 20px;
  font-size: 16px;
  
  &:hover:not(:disabled) {
    background: ${TossColors.grey200};
    transform: translateY(-1px);
  }
`;

export const TossTextButton = styled.button`
  ${buttonBase}
  background: transparent;
  color: ${TossColors.primary};
  padding: 8px 12px;
  font-size: 14px;
  
  &:hover:not(:disabled) {
    background: ${TossColors.primaryLight};
  }
`;

// 토스 카드
export const TossCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${TossAnimations.fadeInUp} 0.6s ease-out;
  animation-delay: ${props => props.delay || 0}s;
  animation-fill-mode: both;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

export const TossCardHeader = styled.div`
  padding: 24px 24px 0;
`;

export const TossCardBody = styled.div`
  padding: 24px;
`;

export const TossCardFooter = styled.div`
  padding: 0 24px 24px;
`;

// 토스 타이틀
export const TossTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${TossColors.grey900};
  margin: 0 0 8px 0;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

export const TossSubtitle = styled.p`
  font-size: 16px;
  color: ${TossColors.grey600};
  margin: 0;
  line-height: 1.5;
`;

// 토스 입력 필드
export const TossInput = styled.input`
  width: 100%;
  padding: 16px;
  border: 2px solid ${TossColors.grey200};
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  background: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: ${TossColors.primary};
    box-shadow: 0 0 0 3px ${TossColors.primaryLight};
  }
  
  &::placeholder {
    color: ${TossColors.grey400};
  }
`;

// 토스 메시지
export const TossSuccessMessage = styled.div`
  background: ${TossColors.successLight};
  color: ${TossColors.success};
  padding: 16px 20px;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: ${TossAnimations.slideInLeft} 0.4s ease-out;
  
  &::before {
    content: '✅';
    font-size: 16px;
  }
`;

export const TossErrorMessage = styled.div`
  background: ${TossColors.dangerLight};
  color: ${TossColors.danger};
  padding: 16px 20px;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: ${TossAnimations.slideInLeft} 0.4s ease-out;
  
  &::before {
    content: '❌';
    font-size: 16px;
  }
`;

export const TossWarningMessage = styled.div`
  background: ${TossColors.warningLight};
  color: ${TossColors.warning};
  padding: 16px 20px;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: ${TossAnimations.slideInLeft} 0.4s ease-out;
  
  &::before {
    content: '⚠️';
    font-size: 16px;
  }
`;

// 토스 로딩 스피너
export const TossLoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid ${TossColors.grey200};
  border-top: 3px solid ${TossColors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 토스 뱃지
export const TossBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.variant) {
      case 'success':
        return css`
          background: ${TossColors.successLight};
          color: ${TossColors.success};
        `;
      case 'warning':
        return css`
          background: ${TossColors.warningLight};
          color: ${TossColors.warning};
        `;
      case 'danger':
        return css`
          background: ${TossColors.dangerLight};
          color: ${TossColors.danger};
        `;
      default:
        return css`
          background: ${TossColors.primaryLight};
          color: ${TossColors.primary};
        `;
    }
  }}
`;

// 토스 그리드
export const TossGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

// 토스 플렉스
export const TossFlex = styled.div`
  display: flex;
  align-items: ${props => props.align || 'center'};
  justify-content: ${props => props.justify || 'flex-start'};
  gap: ${props => props.gap || '12px'};
  flex-wrap: ${props => props.wrap || 'nowrap'};
  
  @media (max-width: 768px) {
    flex-direction: ${props => props.mobileDirection || 'column'};
    gap: ${props => props.mobileGap || '12px'};
  }
`; 