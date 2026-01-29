export const theme = {
  colors: {
    primary: '#1A4D2E', // Deep Green
    secondary: '#F9E076', // Butter Yellow
    neutral: {
      1: '#333333',
      2: '#FDFBF7', // Cream White Background
      3: '#5C5A55',
      4: '#1A1918'
    },
    success: '#43A047',
    error: '#E53935',
    background: '#FDFBF7', // Minimal Cream White
    surface: '#FFFFFF'
  },
  typography: {
    fontFamily: {
      heading: "'Pretendard', 'Noto Sans KR', sans-serif",
      body: "'Spoqa Han Sans Neo', 'Noto Sans KR', sans-serif"
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.05)'
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  transitions: {
    default: 'all 0.2s ease-in-out',
    fast: 'all 0.1s ease-in-out',
    slow: 'all 0.3s ease-in-out'
  }
}; 