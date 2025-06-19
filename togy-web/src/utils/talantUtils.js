// 달란트 카테고리 상수
export const TALANT_CATEGORIES = [
  { reason: '출석', value: 3, emoji: '✅' },
  { reason: '오후출석', value: 3, emoji: '🌅' },
  { reason: '문화교실', value: 3, emoji: '🎨' },
  { reason: '말씀암송', value: 1, emoji: '📖' },
  { reason: '성경읽기', value: 1, emoji: '📚' },
  { reason: '기도문기도', value: 5, emoji: '🙏' },
  { reason: '손가락기도', value: 10, emoji: '👋' }
];

// 학생 리스트 상수
export const STUDENT_LIST = [
  '임동하', '장지민', '황희', '김종진',
  '방시온', '정예담', '방온유', '정예준'
];

// 날짜 포맷 함수
export const formatDate = (date) => {
  if (!date) return '';
  
  if (date.toDate) {
    // Firestore Timestamp
    return date.toDate().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
  
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
  
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 시간 포맷 함수
export const formatTime = (date) => {
  if (!date) return '';
  
  const actualDate = date.toDate ? date.toDate() : new Date(date);
  return actualDate.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 월별 그룹핑 함수
export const getAvailableMonths = (history) => {
  const months = new Set();
  history.forEach(item => {
    const date = item.date.toDate ? item.date.toDate() : new Date(item.date);
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.add(monthStr);
  });
  return Array.from(months).sort().reverse();
};

// 데이터 그룹핑 함수
export const groupByDate = (history) => {
  const grouped = {};
  history.forEach(item => {
    const dateStr = formatDate(item.date);
    if (!grouped[dateStr]) {
      grouped[dateStr] = [];
    }
    grouped[dateStr].push(item);
  });
  
  return Object.keys(grouped)
    .sort((a, b) => new Date(b) - new Date(a))
    .reduce((acc, date) => {
      acc[date] = grouped[date].sort((a, b) => {
        const timeA = a.date.toDate ? a.date.toDate() : new Date(a.date);
        const timeB = b.date.toDate ? b.date.toDate() : new Date(b.date);
        return timeB - timeA;
      });
      return acc;
    }, {});
};

// 랭킹 계산 함수
export const calculateRanking = (history) => {
  const scores = {};
  
  history.forEach(item => {
    if (!scores[item.name]) {
      scores[item.name] = { name: item.name, score: 0 };
    }
    scores[item.name].score += item.value;
  });
  
  return Object.values(scores).sort((a, b) => b.score - a.score);
};

// 디바운스 함수
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 월 이름 가져오기
export const getMonthName = (monthString) => {
  if (!monthString) return '';
  const [year, month] = monthString.split('-');
  return `${year}년 ${parseInt(month)}월`;
};

// 카테고리 정보 가져오기
export const getCategoryInfo = (reason) => {
  return TALANT_CATEGORIES.find(cat => cat.reason === reason) || 
         { reason, value: 0, emoji: '❓' };
};

// 토스트 메시지 표시 함수
export const showToast = (setToast, message, duration = 3000) => {
  setToast({ show: true, message });
  setTimeout(() => {
    setToast({ show: false, message: '' });
  }, duration);
};