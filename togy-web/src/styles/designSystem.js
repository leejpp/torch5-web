import { keyframes } from 'styled-components';

// 🎨 컬러 팔레트 - Minimal Green & Yellow Theme
export const colors = {
  // Primary (Deep Forest Green: #1A4D2E) - 차분하고 신뢰감 있는 짙은 초록
  primary: {
    50: '#F2F7F4',
    100: '#E1EFE6',
    200: '#C3DFCC',
    300: '#9FBFA9',
    400: '#759F82',
    500: '#4F7F5E',
    600: '#346642',
    700: '#1A4D2E', // Main
    800: '#143A24',
    900: '#0E2919',
  },

  // Secondary (Butter Yellow: #F9E076) - 부드럽고 따뜻한 노랑
  secondary: {
    50: '#FFFEF0',
    100: '#FFFBD1',
    200: '#FFF6A3',
    300: '#F9E076', // Main
    400: '#F4C542',
    500: '#EDA615',
    600: '#D1840B',
    700: '#A65F06',
    800: '#804505',
    900: '#5F3003',
  },

  // Neutral (Warm Grey) - 차가운 회색 대신 따뜻한 크림/베이지 톤이 섞인 회색
  neutral: {
    50: '#FDFBF7', // Background (Cream White)
    100: '#F5F2EB',
    200: '#EBE6DC',
    300: '#D6D1C7',
    400: '#A8A49D',
    500: '#807D77',
    600: '#5C5A55',
    700: '#403E3B', // Body Text Light
    800: '#2B2A28', // Body Text Dark
    900: '#1A1918',
  },

  // Semantic Colors (Clean & Muted)
  success: {
    50: '#F0F9F4',
    500: '#43A047',
    900: '#1B5E20',
  },

  warning: {
    50: '#FFF8E1',
    500: '#FB8C00',
    900: '#E65100',
  },

  error: {
    50: '#FFEBEE',
    500: '#E53935',
    900: '#B71C1C',
  },

  // Red/Green/Blue/Amber/Orange/Accent - 기본 유지하되 톤 다운
  red: { 500: '#E53935' },
  green: { 500: '#43A047' },
  blue: { 500: '#1E88E5' },
  amber: { 500: '#FFB300' },
  orange: { 500: '#FB8C00' },
  accent: { 500: '#8E24AA' },

  // Background Gradients - Removed or Minimal
  gradients: {
    primary: '#1A4D2E', // Solid Green for minimal look
    secondary: '#F9E076', // Solid Yellow
    primarySoft: 'linear-gradient(180deg, #1A4D2E 0%, #143A24 100%)', // Very subtle
    accent: 'linear-gradient(135deg, #F9E076 0%, #F4C542 100%)',
    glass: 'rgba(255, 255, 255, 0.8)', // for glassmorphism if needed
  }
};

// 📝 타이포그래피 (유지)
export const typography = {
  fontFamily: {
    primary: "'Pretendard', 'Noto Sans KR', sans-serif",
    heading: "'Pretendard', 'Noto Sans KR', sans-serif",
    body: "'Spoqa Han Sans Neo', 'Noto Sans KR', sans-serif",
    mono: "'JetBrains Mono', 'Monaco', 'Consolas', monospace",
  },

  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.6,
    relaxed: 1.8,
  }
};

// 📐 간격 시스템
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
  '5xl': '6rem',   // 96px
  '6xl': '8rem',   // 128px
};

// 🔘 Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// 🪄 애니메이션
export const animations = {
  // Fade animations
  fadeIn: keyframes`
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,

  fadeInUp: keyframes`
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,

  // Float animation
  float: keyframes`
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  `,

  // Bounce animation
  bounce: keyframes`
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      transform: translate3d(0, -20px, 0);
    }
    70% {
      transform: translate3d(0, -10px, 0);
    }
    90% {
      transform: translate3d(0, -4px, 0);
    }
  `,

  // Shake animation
  shake: keyframes`
    0%, 100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(5px);
    }
  `,

  // Spin animation
  spin: keyframes`
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  `,

  // Scale animation
  scaleIn: keyframes`
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  `,

  // Slide animations
  slideInRight: keyframes`
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  `,

  slideInLeft: keyframes`
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  `,
};

// 🌫️ 그림자 (Minimal & Soft)
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)',

  // Glass effect replaced with soft solid style
  glass: '0 4px 20px rgba(0, 0, 0, 0.03)',
  glassHover: '0 10px 30px rgba(0, 0, 0, 0.06)',
};

// 📱 반응형 Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// 🎯 미디어 쿼리 헬퍼
export const media = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,

  // Max-width queries
  'max-sm': `@media (max-width: ${breakpoints.sm})`,
  'max-md': `@media (max-width: ${breakpoints.md})`,
  'max-lg': `@media (max-width: ${breakpoints.lg})`,
  'max-xl': `@media (max-width: ${breakpoints.xl})`,
};

// 🎨 컴포넌트 스타일 프리셋
export const components = {
  // Card - Solid & Clean
  glassCard: {
    background: '#FFFFFF',
    border: `1px solid ${colors.neutral[200]}`,
    boxShadow: shadows.md,
    borderRadius: borderRadius['2xl'],
  },

  // Button variants
  button: {
    primary: {
      background: colors.primary[700],
      color: '#FFFFFF',
      boxShadow: 'none',
    },
    secondary: {
      background: colors.secondary[300],
      color: colors.primary[900],
      border: 'none',
      fontWeight: typography.fontWeight.bold,
    },
    ghost: {
      background: 'transparent',
      color: colors.primary[700],
      border: `1px solid ${colors.primary[200]}`,
    }
  }
};

// 🎭 테마
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  media,
  animations,
  components,
};

export default theme;