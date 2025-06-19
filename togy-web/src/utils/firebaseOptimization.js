import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  getDocs,
  onSnapshot,
  doc,
  getDoc,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

// 페이지네이션을 위한 쿼리 빌더
export const createPaginatedQuery = (collectionName, pageSize = 50, lastDoc = null, filters = {}) => {
  let baseQuery = collection(db, collectionName);
  
  // 필터 적용
  Object.entries(filters).forEach(([field, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      baseQuery = query(baseQuery, where(field, '==', value));
    }
  });
  
  // 정렬 및 제한
  baseQuery = query(baseQuery, orderBy('createdAt', 'desc'), limit(pageSize));
  
  // 페이지네이션
  if (lastDoc) {
    baseQuery = query(baseQuery, startAfter(lastDoc));
  }
  
  return baseQuery;
};

// 최적화된 달란트 히스토리 로드
export const loadTalantHistoryOptimized = async (filters = {}, pageSize = 100) => {
  try {
    const q = createPaginatedQuery('talant_history', pageSize, null, filters);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // 날짜 변환
      receivedDate: doc.data().receivedDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  } catch (error) {
    console.error('히스토리 로드 에러:', error);
    throw error;
  }
};

// 월별 데이터만 로드하는 최적화된 쿼리
export const loadMonthlyTalantData = async (year, month, studentName = null) => {
  try {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    
    let q = query(
      collection(db, 'talant_history'),
      where('receivedDate', '>=', Timestamp.fromDate(startOfMonth)),
      where('receivedDate', '<=', Timestamp.fromDate(endOfMonth)),
      orderBy('receivedDate', 'desc')
    );
    
    // 특정 학생만 필터링
    if (studentName) {
      q = query(q, where('name', '==', studentName));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      receivedDate: doc.data().receivedDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  } catch (error) {
    console.error('월별 데이터 로드 에러:', error);
    throw error;
  }
};

// 실시간 랭킹 구독 (최근 데이터만)
export const subscribeToRecentRanking = (callback, daysBack = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  
  const q = query(
    collection(db, 'talant_history'),
    where('receivedDate', '>=', Timestamp.fromDate(cutoffDate)),
    orderBy('receivedDate', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      receivedDate: doc.data().receivedDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate()
    }));
    
    callback(data);
  }, (error) => {
    console.error('랭킹 구독 에러:', error);
  });
};

// 배치 작업으로 다중 달란트 추가
export const addMultipleTalants = async (talantArray) => {
  try {
    const batch = writeBatch(db);
    const results = [];
    
    talantArray.forEach((talantData) => {
      const docRef = doc(collection(db, 'talant_history'));
      batch.set(docRef, {
        ...talantData,
        createdAt: Timestamp.fromDate(new Date()),
        receivedDate: Timestamp.fromDate(talantData.receivedDate || new Date())
      });
      results.push(docRef.id);
    });
    
    await batch.commit();
    return results;
  } catch (error) {
    console.error('배치 추가 에러:', error);
    throw error;
  }
};

// 캐시된 데이터 로드 (메모리 캐시)
const dataCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5분

export const loadWithCache = async (cacheKey, loadFunction) => {
  const cached = dataCache.get(cacheKey);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  
  try {
    const data = await loadFunction();
    dataCache.set(cacheKey, {
      data,
      timestamp: now
    });
    return data;
  } catch (error) {
    // 캐시된 데이터가 있으면 반환, 없으면 에러 throw
    if (cached) {
      console.warn('네트워크 에러로 캐시된 데이터 반환:', error);
      return cached.data;
    }
    throw error;
  }
};

// 캐시 초기화
export const clearCache = (cacheKey = null) => {
  if (cacheKey) {
    dataCache.delete(cacheKey);
  } else {
    dataCache.clear();
  }
};

// 연결 상태 모니터링
export const monitorConnection = (callback) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // 초기 상태 확인
  callback(navigator.onLine);
  
  // 정리 함수 반환
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// 지능형 재시도 로직
export const retryWithBackoff = async (operation, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 지수 백오프
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`재시도 ${attempt}/${maxRetries} (${delay}ms 대기)`);
    }
  }
}; 