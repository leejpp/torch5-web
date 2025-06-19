import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { collection, query, where, orderBy, limit, onSnapshot, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { theme } from '../../styles/theme';
import { 
  CommonContainer, 
  CommonHeader, 
  HeaderContent, 
  HeaderTop, 
  PrimaryButton, 
  SecondaryButton,
  TertiaryButton,
  PageTitle,
  Card,
  fadeIn
} from '../../components/common/TalantStyles';
import { 
  formatDate, 
  formatTime, 
  getAvailableMonths, 
  groupByDate, 
  getMonthName, 
  showToast,
  STUDENT_LIST
} from '../../utils/talantUtils';

// fadeIn은 이제 공통 컴포넌트에서 가져옴

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// eslint-disable-next-line no-unused-vars
const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const slideInLeft = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// Container, Header, HeaderContent, HeaderTop은 TalantStyles에서 import됨

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 4px;
  }
`;

const BackButton = styled.button`
  background: #3182F6;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  
  &:hover {
    background: #2B6CB0;
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    min-height: 44px;
  }
`;

const BoardButton = styled.button`
  background: #7C3AED;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  
  &:hover {
    background: #6D28D9;
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    min-height: 44px;
  }
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  
  @media (max-width: 768px) {
    text-align: center;
    order: -1; /* 모바일에서 제목을 맨 위로 */
  }
`;

const InputButton = styled.button`
  background: #10B981;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #059669;
  }
  
  @media (max-width: 768px) {
    justify-content: center;
    padding: 12px 16px;
  }
`;

const FilterToggle = styled.button`
  display: none;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: ${theme.colors.neutral[1]};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: ${theme.transitions.default};
  margin-bottom: ${theme.spacing.md};
  width: 100%;

  &:hover {
    background: rgba(59, 130, 246, 0.15);
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.xs};
  }
`;

const FiltersContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};

  @media (max-width: 768px) {
    display: ${props => props.$show ? 'grid' : 'none'};
    grid-template-columns: 1fr;
    gap: ${theme.spacing.sm};
    background: rgba(248, 250, 252, 0.8);
    padding: ${theme.spacing.md};
    border-radius: ${theme.borderRadius.lg};
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};

  @media (max-width: 768px) {
    gap: 4px;
  }
`;

const FilterLabel = styled.label`
  color: ${theme.colors.neutral[1]};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: ${theme.spacing.xs};

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.xs};
    margin-bottom: 2px;
  }
`;

const Select = styled.select`
  padding: ${theme.spacing.md};
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.base};
  width: 100%;
  font-family: ${theme.typography.fontFamily};
  outline: none;
  transition: ${theme.transitions.default};
  background: white;
  color: ${theme.colors.neutral[1]};

  &:focus {
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: ${theme.spacing.sm};
    font-size: ${theme.typography.fontSize.sm};
    border-width: 1px;
  }
`;

const DateInput = styled.input`
  padding: ${theme.spacing.md};
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.base};
  width: 100%;
  font-family: ${theme.typography.fontFamily};
  outline: none;
  transition: ${theme.transitions.default};
  background: white;
  color: ${theme.colors.neutral[1]};

  &:focus {
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: ${theme.spacing.sm};
    font-size: ${theme.typography.fontSize.sm};
    border-width: 1px;
  }
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  padding-top: 6px;
  margin-top: 6px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const FilterBadge = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #9F77FF 100%);
  color: white;
  padding: 2px 6px;
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  display: flex;
  align-items: center;
  gap: 4px;
  animation: ${slideInLeft} 0.3s ease-out;

  .remove {
    cursor: pointer;
    background: rgba(255, 255, 255, 0.2);
    width: 14px;
    height: 14px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const ClearFiltersBtn = styled.button`
  background: transparent;
  border: 1px solid ${theme.colors.error};
  color: ${theme.colors.error};
  padding: 2px 6px;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  cursor: pointer;
  transition: ${theme.transitions.default};

  &:hover {
    background: ${theme.colors.error};
    color: white;
  }
`;

const ContentArea = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.lg};
  
  @media (max-width: 480px) {
    padding: ${theme.spacing.md};
  }
`;

const SectionHeader = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h2`
  color: ${theme.colors.neutral[1]};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  margin: 0;
`;

const DateCard = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  margin-bottom: 20px;
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;
`;

const DateHeader = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #9F77FF 100%);
  color: white;
  padding: 15px 20px;
  font-weight: ${theme.typography.fontWeight.semibold};
  font-size: ${theme.typography.fontSize.base};
`;

const HistoryList = styled.div`
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HistoryGroup = styled.div`
  margin-bottom: 24px;
`;

const HistoryDateHeader = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #4B5563;
  margin-bottom: 8px;
  padding: 0 16px;
`;

const HistoryItem = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 0 16px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  position: relative;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const HistoryItemMain = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
`;

const HistoryNameReason = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
`;

const HistoryName = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #222;
`;

const HistoryReason = styled.div`
  background: none;
  color: #333;
  font-size: 15px;
  font-weight: 500;
  margin-top: 2px;
  word-break: break-all;
`;

const HistoryTalant = styled.div`
  font-size: 22px;
  font-weight: 800;
  color: #3182F6;
  min-width: 48px;
  text-align: right;
`;

const HistoryDate = styled.div`
  font-size: 12px;
  color: #A0AEC0;
  margin-top: 10px;
  text-align: left;
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  font-size: 16px;
  color: #E5E7EB;
  transition: all 0.2s ease;
  position: absolute;
  bottom: 12px;
  right: 12px;
  border-radius: 4px;
  
  &:hover {
    color: #EF4444;
    background: rgba(239, 68, 68, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${theme.colors.neutral[3]};
  animation: ${fadeIn} 0.8s ease-out;

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    animation: ${float} 3s ease-in-out infinite;
  }

  p {
    font-size: ${theme.typography.fontSize.base};
    margin: 0;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: ${theme.colors.neutral[3]};
  font-size: ${theme.typography.fontSize.base};
  
  .loading-icon {
    font-size: 2rem;
    margin-bottom: 15px;
    animation: ${pulse} 1.5s ease-in-out infinite;
  }
`;

const SpinIcon = styled.div`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    100% { transform: rotate(360deg); }
  }
`;

const Toast = styled.div`
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(${props => props.$show ? '0' : '100px'});
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: ${theme.shadows.xl};
  padding: 16px 24px;
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.neutral[1]};
  font-size: ${theme.typography.fontSize.base};
  z-index: 1001;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  opacity: ${props => props.$show ? 1 : 0};
`;

// STUDENTS는 이제 STUDENT_LIST로 공통 유틸에서 가져옴

const KOREAN_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const History = () => {
  const navigate = useNavigate();
  const [allHistory, setAllHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState('');
  const [dateFilterType, setDateFilterType] = useState('month');
  const [monthFilter, setMonthFilter] = useState('');
  const [specificDateFilter, setSpecificDateFilter] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [currentMonthData, setCurrentMonthData] = useState(true); // 현재 월 데이터만 로드 여부

  // 토스트 메시지 표시 (공통 유틸 사용)
  const handleShowToast = useCallback((message, duration = 3000) => {
    showToast(setToast, message, duration);
  }, []);

  // 초기 로드 시 현재 월 설정
  useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMonthFilter(currentMonth);
  }, []);

  // 사용 가능한 월 목록 로드 (가벼운 쿼리)
  useEffect(() => {
    const loadAvailableMonths = async () => {
      try {
        // 모든 월을 가져오기 위해 receivedDate만 조회
        const q = query(
          collection(db, 'talant_history'),
          orderBy('receivedDate', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const dates = snapshot.docs.map(doc => doc.data().receivedDate?.toDate() || new Date());
        const months = getAvailableMonths(dates.map(date => ({ date })));
        setAvailableMonths(months);
      } catch (error) {
        console.error('Error loading available months:', error);
      }
    };
    
    loadAvailableMonths();
  }, []);

  // 월별 데이터 로드
  useEffect(() => {
    if (!monthFilter && currentMonthData) return; // 월 필터가 없고 현재 월 데이터 모드가 아니면 스킵

    setLoading(true);
    let q;

    if (monthFilter) {
      // 선택된 월의 데이터만 로드
      const [year, month] = monthFilter.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      q = query(
        collection(db, 'talant_history'),
        where('receivedDate', '>=', Timestamp.fromDate(startDate)),
        where('receivedDate', '<=', Timestamp.fromDate(endDate)),
        orderBy('receivedDate', 'desc')
      );
    } else {
      // 전체 데이터 로드 (필터가 '전체 월'인 경우)
      q = query(
        collection(db, 'talant_history'),
        orderBy('createdAt', 'desc'),
        limit(100) // 성능을 위해 최근 100개만 로드
      );
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          reason: data.reason || '',
          talant: data.talant || '0',
          receivedDate: data.receivedDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date()
        };
      });
      
      // 클라이언트 측에서 createdAt으로 추가 정렬
      historyData.sort((a, b) => {
        // 먼저 receivedDate로 정렬 (내림차순)
        const dateCompare = b.receivedDate - a.receivedDate;
        if (dateCompare !== 0) return dateCompare;
        // 같은 날짜면 createdAt으로 정렬 (내림차순)
        return b.createdAt - a.createdAt;
      });
      
      setAllHistory(historyData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading history:', error);
      handleShowToast('데이터 로드 중 오류가 발생했습니다.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [monthFilter, handleShowToast]);

  // 필터링 로직
  useEffect(() => {
    let filtered = [...allHistory];

    // 이름 필터
    if (nameFilter) {
      filtered = filtered.filter(item => item.name === nameFilter);
    }

    // 날짜 필터
    if (dateFilterType === 'month' && monthFilter) {
      filtered = filtered.filter(item => {
        const date = item.receivedDate;
        const itemMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return itemMonth === monthFilter;
      });
    } else if (dateFilterType === 'specific' && specificDateFilter) {
      filtered = filtered.filter(item => {
        const date = item.receivedDate;
        const itemDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        return itemDate === specificDateFilter;
      });
    }

    setFilteredHistory(filtered);
  }, [allHistory, nameFilter, dateFilterType, monthFilter, specificDateFilter]);

  // 날짜별로 그룹화 함수 (공통 유틸 사용하되 UI에 맞게 확장)
  const groupHistoryByDate = (history) => {
    // 직접 날짜별로 그룹핑 (더 안전한 방법)
    const grouped = {};
    
    history.forEach(item => {
      const date = item.receivedDate;
      // 날짜가 유효하지 않은 경우 건너뛰기
      if (!date || isNaN(date.getTime())) {
        console.warn('Invalid date found in history item:', item);
        return;
      }
      
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });
    
    // UI에 맞게 변환
    return Object.keys(grouped).map(dateKey => {
      const [year, month, day] = dateKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const displayDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${KOREAN_DAYS[date.getDay()]})`;
      
      return {
        date,
        displayDate,
        items: grouped[dateKey].sort((a, b) => b.createdAt - a.createdAt)
      };
    }).sort((a, b) => b.date - a.date);
  };

  // 삭제 함수
  const handleDelete = async (id) => {
    if (window.confirm('정말로 이 기록을 삭제하시겠습니까?')) {
      setDeletingIds(prev => new Set([...prev, id]));
      
      try {
        await deleteDoc(doc(db, 'talant_history', id));
        handleShowToast('기록이 삭제되었습니다.');
      } catch (error) {
        console.error('Error deleting:', error);
        handleShowToast('삭제 중 오류가 발생했습니다.');
      } finally {
        setDeletingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    }
  };

  // 필터 초기화
  const clearFilters = () => {
    setNameFilter('');
    setMonthFilter('');
    setSpecificDateFilter('');
    handleShowToast('모든 필터가 제거되었습니다.');
  };

  // 활성 필터 제거
  const removeFilter = (filterType) => {
    switch (filterType) {
      case 'name':
        setNameFilter('');
        handleShowToast('이름 필터가 제거되었습니다.');
        break;
      case 'month':
        setMonthFilter('');
        handleShowToast('기간 필터가 제거되었습니다.');
        break;
      case 'specific':
        setSpecificDateFilter('');
        handleShowToast('날짜 필터가 제거되었습니다.');
        break;
      default:
        break;
    }
  };

  // 메모화된 값들
  const groupedHistory = useMemo(() => groupHistoryByDate(filteredHistory), [filteredHistory]);
  const hasActiveFilters = useMemo(() => 
    nameFilter || monthFilter || specificDateFilter, 
    [nameFilter, monthFilter, specificDateFilter]
  );
  
  // 메모화된 콜백 함수들
  const handleNameFilterChange = useCallback((e) => {
    setNameFilter(e.target.value);
  }, []);
  
  const handleDateFilterTypeChange = useCallback((e) => {
    setDateFilterType(e.target.value);
  }, []);
  
  const handleMonthFilterChange = useCallback((e) => {
    setMonthFilter(e.target.value);
    if (e.target.value === '') {
      setCurrentMonthData(false); // 전체 월 선택 시 현재 월 모드 해제
    }
  }, []);
  
  const handleSpecificDateFilterChange = useCallback((e) => {
    setSpecificDateFilter(e.target.value);
  }, []);
  
  const toggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);
  
  const navigateToInput = useCallback(() => {
    navigate('/talant/input');
  }, [navigate]);
  
  const navigateToDashboard = useCallback(() => {
    navigate('/talant');
  }, [navigate]);

  return (
    <CommonContainer>
      <CommonHeader>
        <HeaderContent>
          <HeaderTop>
            <ButtonGroup>
              <BackButton onClick={navigateToDashboard}>
                ← 대시보드
              </BackButton>
              <BoardButton onClick={() => navigate('/talant/board')}>
                📊 현황판
              </BoardButton>
            </ButtonGroup>
            <Title>달란트 내역</Title>
            <InputButton onClick={navigateToInput}>
              <span>달란트 입력</span>
              <span>📋</span>
            </InputButton>
          </HeaderTop>
          
          <FilterToggle onClick={toggleFilters}>
            <span>필터</span>
            <span>{showFilters ? '숨기기' : '보기'}</span>
            <span>{showFilters ? '▲' : '▼'}</span>
          </FilterToggle>
          
          <FiltersContainer $show={showFilters}>
          <FilterGroup>
            <FilterLabel>이름</FilterLabel>
            <Select
              value={nameFilter}
              onChange={handleNameFilterChange}
            >
              <option value="">전체 이름</option>
                              {STUDENT_LIST.map(student => (
                <option key={student} value={student}>{student}</option>
              ))}
            </Select>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>기간 필터</FilterLabel>
            <Select
              value={dateFilterType}
              onChange={handleDateFilterTypeChange}
            >
              <option value="month">월별</option>
              <option value="specific">특정 날짜</option>
            </Select>
          </FilterGroup>

          {dateFilterType === 'month' && (
            <FilterGroup>
              <FilterLabel>월 선택</FilterLabel>
              <Select
                value={monthFilter}
                onChange={handleMonthFilterChange}
              >
                <option value="">최근 100개</option>
                {availableMonths.map(month => {
                  const [year, monthNum] = month.split('-');
                  const displayMonth = `${year}년 ${parseInt(monthNum)}월`;
                  return (
                    <option key={month} value={month}>{displayMonth}</option>
                  );
                })}
              </Select>
            </FilterGroup>
          )}

          {dateFilterType === 'specific' && (
            <FilterGroup>
              <FilterLabel>날짜 선택</FilterLabel>
              <DateInput
                type="date"
                value={specificDateFilter}
                onChange={handleSpecificDateFilterChange}
              />
            </FilterGroup>
          )}
        </FiltersContainer>

        {hasActiveFilters && (
          <ActiveFilters>
            {nameFilter && (
              <FilterBadge>
                이름: {nameFilter}
                <span className="remove" onClick={() => removeFilter('name')}>×</span>
              </FilterBadge>
            )}
            {monthFilter && (
              <FilterBadge>
                월: {monthFilter}
                <span className="remove" onClick={() => removeFilter('month')}>×</span>
              </FilterBadge>
            )}
            {specificDateFilter && (
              <FilterBadge>
                날짜: {specificDateFilter}
                <span className="remove" onClick={() => removeFilter('specific')}>×</span>
              </FilterBadge>
            )}
            <ClearFiltersBtn onClick={clearFilters}>
              전체 필터 제거
            </ClearFiltersBtn>
          </ActiveFilters>
        )}
        </HeaderContent>
      </CommonHeader>

      <ContentArea>
        {loading ? (
        <LoadingMessage>
          <div className="loading-icon">⏳</div>
          데이터를 불러오는 중...
        </LoadingMessage>
      ) : groupedHistory.length === 0 ? (
        <EmptyMessage>
          <div className="empty-icon">📋</div>
          <p>표시할 내역이 없습니다.</p>
        </EmptyMessage>
      ) : (
        <>
          <SectionHeader>
            <SectionTitle>
              {monthFilter 
                ? `${monthFilter} 내역 (${filteredHistory.length}개)`
                : hasActiveFilters 
                  ? `필터링된 내역 (${filteredHistory.length}개)` 
                  : `최근 내역 (${allHistory.length}개)`}
            </SectionTitle>
          </SectionHeader>

          {groupedHistory.map((group, index) => (
            <HistoryGroup key={index}>
              <HistoryDateHeader>{group.displayDate}</HistoryDateHeader>
              {group.items.map((item) => (
                <HistoryItem key={item.id}>
                  <HistoryItemMain>
                    <HistoryNameReason>
                      <HistoryName>{item.name}</HistoryName>
                      <HistoryReason>{item.reason}</HistoryReason>
                    </HistoryNameReason>
                    <HistoryTalant>+{item.talant}</HistoryTalant>
                  </HistoryItemMain>
                  <HistoryDate>
                    입력: {formatDate(item.createdAt)}
                  </HistoryDate>
                  <DeleteButton
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingIds.has(item.id)}
                  >
                    {deletingIds.has(item.id) ? '⏳' : '🗑️'}
                  </DeleteButton>
                </HistoryItem>
              ))}
            </HistoryGroup>
          ))}
        </>
      )}

        <Toast $show={toast.show}>
          {toast.message}
        </Toast>
      </ContentArea>
    </CommonContainer>
  );
};

export default memo(History); 