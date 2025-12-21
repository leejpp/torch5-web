import { collection, getDocs, query, where, orderBy, doc, setDoc, deleteDoc, getDoc, Timestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';

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

// 학생 리스트 상수 (하위 호환성을 위해 유지, 하지만 Firebase에서 동적으로 불러오는 것을 권장)
export const STUDENT_LIST = [
  '임동하', '장지민', '황희', '김종진',
  '방시온', '정예담', '방온유', '정예준'
];

export const loadStudentsFromFirebase = async () => {
  try {
    // user_stats 컬렉션에서 학생 목록 가져오기 (문서 ID가 학생 이름)
    const q = query(collection(db, 'user_stats'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // 초기 데이터가 없으면 기본 학생 목록을 user_stats에 저장
      const defaultStudents = STUDENT_LIST;
      for (const studentName of defaultStudents) {
        await setDoc(doc(db, 'user_stats', studentName), {
          total: 0,
          createdAt: Timestamp.now()
        });
      }
      return defaultStudents.sort();
    }
    
    // 문서 ID가 학생 이름, 클라이언트에서 정렬
    return snapshot.docs.map(doc => doc.id).sort();
  } catch (error) {
    console.error('학생 목록 로드 실패:', error);
    // 오류 시 기본 목록 반환
    return STUDENT_LIST;
  }
};

// 학생 추가
export const addStudent = async (studentName) => {
  try {
    // user_stats 컬렉션에 학생 추가 (중복 체크)
    const userStatsRef = doc(db, 'user_stats', studentName);
    const userStatsDoc = await getDoc(userStatsRef);
    
    if (userStatsDoc.exists()) {
      throw new Error('이미 존재하는 학생입니다.');
    }
    
    // 새 학생을 user_stats에 추가 (total: 0으로 초기화)
    await setDoc(userStatsRef, {
      total: 0,
      createdAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('학생 추가 실패:', error);
    throw error;
  }
};

// 학생 삭제
export const deleteStudent = async (studentName) => {
  try {
    // 1. talant_history에서 해당 학생의 모든 기록 삭제
    const historyQuery = query(
      collection(db, 'talant_history'),
      where('name', '==', studentName)
    );
    const historySnapshot = await getDocs(historyQuery);
    
    // 배치 삭제 (한 번에 최대 500개까지 가능)
    const batchSize = 500;
    const batches = [];
    let currentBatch = writeBatch(db);
    let operationCount = 0;
    
    historySnapshot.forEach((docSnapshot) => {
      if (operationCount >= batchSize) {
        batches.push(currentBatch);
        currentBatch = writeBatch(db);
        operationCount = 0;
      }
      currentBatch.delete(docSnapshot.ref);
      operationCount++;
    });
    
    // 마지막 배치 추가
    if (operationCount > 0) {
      batches.push(currentBatch);
    }
    
    // 모든 배치 실행
    for (const batch of batches) {
      await batch.commit();
    }
    
    // 2. user_stats 컬렉션에서 학생 삭제
    const userStatsRef = doc(db, 'user_stats', studentName);
    await deleteDoc(userStatsRef);
    
    return true;
  } catch (error) {
    console.error('학생 삭제 실패:', error);
    throw error;
  }
};

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