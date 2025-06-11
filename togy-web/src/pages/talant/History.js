import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { theme } from '../../styles/theme';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

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

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  
  &:before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%);
    z-index: -1;
  }
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.lg};
  z-index: 100;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  gap: ${theme.spacing.sm};
`;

const BackButton = styled.button`
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #2563EB 100%);
  color: white;
  border: none;
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  transition: ${theme.transitions.default};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  box-shadow: ${theme.shadows.sm};
  flex-shrink: 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
  
  @media (max-width: 480px) {
    padding: ${theme.spacing.xs} ${theme.spacing.md};
    font-size: ${theme.typography.fontSize.xs};
  }
`;

const Title = styled.h1`
  color: ${theme.colors.neutral[1]};
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  font-family: ${theme.typography.fontFamily};
  margin: 0;
  
  @media (max-width: 480px) {
    font-size: ${theme.typography.fontSize.xl};
  }
`;

const InputButton = styled.button`
  background: linear-gradient(135deg, #10B981 0%, #047857 100%);
  color: white;
  border: none;
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  transition: ${theme.transitions.default};
  box-shadow: ${theme.shadows.sm};
  flex-shrink: 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
  
  @media (max-width: 480px) {
    padding: ${theme.spacing.xs} ${theme.spacing.md};
    font-size: ${theme.typography.fontSize.xs};
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

const HistoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  background: ${theme.colors.neutral[5]};
  border-radius: ${theme.borderRadius.md};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  ${props => props.$deleting && `
    opacity: 0.5;
    transform: scale(0.98);
    pointer-events: none;
  `}

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
    background: white;
  }

  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(135deg, ${theme.colors.primary} 0%, #9F77FF 100%);
  }

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 6px;
  }
`;

const HistoryInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
`;

const HistoryMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const HistoryName = styled.span`
  color: ${theme.colors.neutral[1]};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-size: ${theme.typography.fontSize.sm};
  white-space: nowrap;
`;

const HistoryReason = styled.span`
  color: ${theme.colors.neutral[3]};
  font-size: ${theme.typography.fontSize.xs};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const HistoryTime = styled.span`
  color: ${theme.colors.neutral[3]};
  font-size: ${theme.typography.fontSize.xs};
  background: rgba(59, 130, 246, 0.1);
  padding: 3px 8px;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid rgba(59, 130, 246, 0.2);
  white-space: nowrap;
  font-weight: ${theme.typography.fontWeight.medium};
`;

const HistoryAmount = styled.div`
  color: ${theme.colors.success};
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize.base};
  flex-shrink: 0;
  margin-right: 10px;
`;

const DeleteButton = styled.button`
  background: transparent;
  border: 1px solid ${theme.colors.error};
  color: ${theme.colors.error};
  padding: 4px 8px;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  cursor: pointer;
  transition: ${theme.transitions.default};
  display: flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: ${theme.colors.error};
    color: white;
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

const STUDENTS = ['임동하', '장지민', '황희', '김종진', '방시온', '정예담', '방온유', '정예준'];

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

  // 토스트 메시지 표시
  const showToast = useCallback((message, duration = 3000) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, duration);
  }, []);

  // 시간 포맷 함수 (날짜, 요일 포함)
  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = KOREAN_DAYS[date.getDay()];
    
    return `${month}/${day}(${dayOfWeek}) ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // 데이터 로드
  useEffect(() => {
    const q = query(collection(db, 'talant_history'), orderBy('createdAt', 'desc'));
    
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
      
      setAllHistory(historyData);
      
      // 사용 가능한 월 목록 생성
      const months = [...new Set(historyData.map(item => {
        const date = item.receivedDate;
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }))].sort().reverse();
      
      setAvailableMonths(months);
      setLoading(false);
    }, (error) => {
      console.error('Error loading history:', error);
      showToast('데이터 로드 중 오류가 발생했습니다.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [showToast]);

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

  // 날짜별로 그룹화 (입력 시간 기준)
  const groupByDate = (history) => {
    const groups = {};
    
    history.forEach(item => {
      const date = item.createdAt;
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          items: []
        };
      }
      
      groups[dateKey].items.push(item);
    });
    
    // 각 그룹 내에서도 입력 시간 순으로 정렬
    Object.values(groups).forEach(group => {
      group.items.sort((a, b) => b.createdAt - a.createdAt);
    });
    
    return Object.values(groups).sort((a, b) => b.date - a.date);
  };

  // 삭제 함수
  const handleDelete = async (id) => {
    if (window.confirm('정말로 이 기록을 삭제하시겠습니까?')) {
      setDeletingIds(prev => new Set([...prev, id]));
      
      try {
        await deleteDoc(doc(db, 'talant_history', id));
        showToast('기록이 삭제되었습니다.');
      } catch (error) {
        console.error('Error deleting:', error);
        showToast('삭제 중 오류가 발생했습니다.');
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
    showToast('모든 필터가 제거되었습니다.');
  };

  // 활성 필터 제거
  const removeFilter = (filterType) => {
    switch (filterType) {
      case 'name':
        setNameFilter('');
        showToast('이름 필터가 제거되었습니다.');
        break;
      case 'month':
        setMonthFilter('');
        showToast('기간 필터가 제거되었습니다.');
        break;
      case 'specific':
        setSpecificDateFilter('');
        showToast('날짜 필터가 제거되었습니다.');
        break;
      default:
        break;
    }
  };

  // 메모화된 값들
  const groupedHistory = useMemo(() => groupByDate(filteredHistory), [filteredHistory]);
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
    <Container>
      <Header>
        <HeaderContent>
          <HeaderTop>
            <BackButton onClick={navigateToDashboard}>
              ← 대시보드
            </BackButton>
            <Title>달란트 내역</Title>
            <InputButton onClick={navigateToInput}>
              <span>달란트 입력</span>
              <span>📋</span>
            </InputButton>
          </HeaderTop>
          
          <FilterToggle onClick={toggleFilters}>
            <span>🔍</span>
            <span>필터 {showFilters ? '숨기기' : '보기'}</span>
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
              {STUDENTS.map(student => (
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
                <option value="">전체 월</option>
                {availableMonths.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
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
      </Header>

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
              {hasActiveFilters ? `필터링된 내역 (${filteredHistory.length}개)` : `전체 내역 (${allHistory.length}개)`}
            </SectionTitle>
          </SectionHeader>

          {groupedHistory.map((group) => (
            <DateCard key={group.date.getTime()}>
              <DateHeader>
                {`${group.date.getFullYear()}년 ${group.date.getMonth() + 1}월 ${group.date.getDate()}일 (${KOREAN_DAYS[group.date.getDay()]})`}
              </DateHeader>
              
              <HistoryList>
                {group.items.map((item) => (
                  <HistoryItem key={item.id} $deleting={deletingIds.has(item.id)}>
                    <HistoryInfo>
                      <HistoryMeta>
                        <HistoryName>{item.name}</HistoryName>
                        <HistoryTime>{formatTime(item.createdAt)}</HistoryTime>
                      </HistoryMeta>
                      <HistoryReason>{item.reason}</HistoryReason>
                    </HistoryInfo>
                    
                    <HistoryAmount>+{item.talant}</HistoryAmount>
                    
                    <DeleteButton
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingIds.has(item.id)}
                    >
                      {deletingIds.has(item.id) ? (
                        <SpinIcon>🔄</SpinIcon>
                      ) : (
                        '🗑️'
                      )}
                    </DeleteButton>
                  </HistoryItem>
                ))}
              </HistoryList>
            </DateCard>
          ))}
        </>
      )}

        <Toast $show={toast.show}>
          {toast.message}
        </Toast>
      </ContentArea>
    </Container>
  );
};

export default memo(History); 