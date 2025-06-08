import React, { useState, useEffect, useCallback } from 'react';
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

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const slideInLeft = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideInRight = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 20px;
  padding-bottom: 100px;
`;

const Header = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: ${theme.borderRadius.xl};
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: ${theme.shadows.lg};
  animation: ${fadeIn} 0.8s ease-out;
  position: sticky;
  top: 20px;
  z-index: 10;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  gap: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const BackButton = styled.button`
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #9F77FF 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  transition: ${theme.transitions.default};
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: ${theme.shadows.sm};
  flex-shrink: 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: ${theme.typography.fontSize.xs};
  }
`;

const Title = styled.h1`
  color: ${theme.colors.neutral[1]};
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  margin: 0;
  text-align: center;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #9F77FF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  flex: 1;

  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.xl};
  }
`;

const InputButton = styled.button`
  background: linear-gradient(135deg, #10B981 0%, #047857 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  transition: ${theme.transitions.default};
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: ${theme.shadows.sm};
  flex-shrink: 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: ${theme.typography.fontSize.xs};
  }
`;

const HeaderSpacer = styled.div`
  width: 120px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const FiltersContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  color: ${theme.colors.neutral[1]};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: ${theme.borderRadius.lg};
  background: white;
  color: ${theme.colors.neutral[1]};
  font-size: ${theme.typography.fontSize.base};
  transition: ${theme.transitions.default};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }

  &:hover {
    border-color: ${theme.colors.primary};
  }
`;

const DateInput = styled.input`
  padding: 12px 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: ${theme.borderRadius.lg};
  background: white;
  color: ${theme.colors.neutral[1]};
  font-size: ${theme.typography.fontSize.base};
  transition: ${theme.transitions.default};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }

  &:hover {
    border-color: ${theme.colors.primary};
  }
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const FilterBadge = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #9F77FF 100%);
  color: white;
  padding: 6px 12px;
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.sm};
  display: flex;
  align-items: center;
  gap: 8px;
  animation: ${slideInLeft} 0.3s ease-out;

  .remove {
    cursor: pointer;
    background: rgba(255, 255, 255, 0.2);
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const ClearFiltersBtn = styled.button`
  background: transparent;
  border: 2px solid ${theme.colors.error};
  color: ${theme.colors.error};
  padding: 8px 16px;
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: ${theme.transitions.default};

  &:hover {
    background: ${theme.colors.error};
    color: white;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30px 0 20px 0;
  animation: ${fadeIn} 0.8s ease-out 0.2s both;
`;

const SectionTitle = styled.h2`
  color: ${theme.colors.neutral[1]};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin: 0;
`;

const DateCard = styled.div`
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: ${theme.shadows.sm};
  animation: ${fadeIn} 0.6s ease-out;
  transition: ${theme.transitions.default};

  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const DateHeader = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #9F77FF 100%);
  color: white;
  padding: 15px 20px;
  font-weight: ${theme.typography.fontWeight.semibold};
  font-size: ${theme.typography.fontSize.base};
`;

const HistoryList = styled.div`
  padding: 0;
`;

const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: ${theme.transitions.default};
  opacity: ${props => props.$deleting ? 0.5 : 1};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const HistoryInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const HistoryMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const HistoryName = styled.span`
  color: ${theme.colors.neutral[1]};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-size: ${theme.typography.fontSize.base};
`;

const HistoryReason = styled.span`
  color: ${theme.colors.neutral[3]};
  font-size: ${theme.typography.fontSize.sm};
`;

const HistoryAmount = styled.div`
  color: ${theme.colors.success};
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize.lg};
  margin-right: 15px;

  @media (max-width: 480px) {
    margin-right: 0;
    align-self: flex-end;
  }
`;

const DeleteButton = styled.button`
  background: transparent;
  border: 1px solid ${theme.colors.error};
  color: ${theme.colors.error};
  padding: 6px 12px;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: ${theme.transitions.default};
  display: flex;
  align-items: center;
  gap: 5px;

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

const LoadingSkeleton = styled.div`
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.05) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0.05) 100%
  );
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: ${theme.borderRadius.md};
  height: 20px;
  margin-bottom: 10px;

  &.title {
    height: 24px;
    width: 60%;
  }

  &.content {
    height: 16px;
    width: 80%;
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

  // 토스트 메시지 표시
  const showToast = useCallback((message, duration = 3000) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, duration);
  }, []);

  // 데이터 로드
  useEffect(() => {
    const q = query(collection(db, 'talant_history'), orderBy('receivedDate', 'desc'));
    
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

  // 필터 적용
  useEffect(() => {
    let filtered = [...allHistory];

    // 이름 필터
    if (nameFilter) {
      filtered = filtered.filter(item => item.name === nameFilter);
    }

    // 날짜 필터
    if (dateFilterType === 'month' && monthFilter) {
      const [year, month] = monthFilter.split('-');
      filtered = filtered.filter(item => {
        const itemDate = item.receivedDate;
        return itemDate.getFullYear() === parseInt(year) && 
               itemDate.getMonth() === parseInt(month) - 1;
      });
    } else if (dateFilterType === 'specific' && specificDateFilter) {
      const filterDate = new Date(specificDateFilter);
      filtered = filtered.filter(item => {
        const itemDate = item.receivedDate;
        return itemDate.getFullYear() === filterDate.getFullYear() &&
               itemDate.getMonth() === filterDate.getMonth() &&
               itemDate.getDate() === filterDate.getDate();
      });
    }

    setFilteredHistory(filtered);
  }, [allHistory, nameFilter, dateFilterType, monthFilter, specificDateFilter]);

  // 날짜별 그룹화
  const groupByDate = useCallback((items) => {
    const groups = {};
    
    items.forEach(item => {
      const date = item.receivedDate;
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: item.receivedDate,
          items: []
        };
      }
      
      groups[dateKey].items.push(item);
    });
    
    return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, []);

  // 삭제 처리
  const handleDelete = async (id) => {
    const item = allHistory.find(h => h.id === id);
    if (!item) return;

    if (window.confirm(`정말로 다음 항목을 삭제하시겠습니까?\n\n이름: ${item.name}\n사유: ${item.reason}\n달란트: ${item.talant}`)) {
      try {
        setDeletingIds(prev => new Set(prev).add(id));
        await deleteDoc(doc(db, 'talant_history', id));
        showToast('내역이 삭제되었습니다.');
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

  const groupedHistory = groupByDate(filteredHistory);
  const hasActiveFilters = nameFilter || monthFilter || specificDateFilter;

  return (
    <Container>
      <Header>
        <HeaderTop>
          <BackButton onClick={() => navigate('/talant')}>
            <span>←</span>
            대시보드
          </BackButton>
          <Title>📚 달란트 전체 내역</Title>
          <InputButton onClick={() => navigate('/talant/input')}>
            <span>➕</span>
            달란트 입력
          </InputButton>
        </HeaderTop>
        
        <FiltersContainer>
          <FilterGroup>
            <FilterLabel>이름</FilterLabel>
            <Select
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
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
              onChange={(e) => setDateFilterType(e.target.value)}
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
                onChange={(e) => setMonthFilter(e.target.value)}
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
                onChange={(e) => setSpecificDateFilter(e.target.value)}
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
      </Header>

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

          {groupedHistory.map((group, groupIndex) => (
            <DateCard key={group.date.getTime()}>
              <DateHeader>
                {`${group.date.getFullYear()}년 ${group.date.getMonth() + 1}월 ${group.date.getDate()}일 (${KOREAN_DAYS[group.date.getDay()]})`}
              </DateHeader>
              
              <HistoryList>
                {group.items.map((item, index) => (
                  <HistoryItem key={item.id} $deleting={deletingIds.has(item.id)}>
                    <HistoryInfo>
                      <HistoryMeta>
                        <HistoryName>{item.name}</HistoryName> - {item.reason}
                      </HistoryMeta>
                    </HistoryInfo>
                    
                    <HistoryAmount>+{item.talant} 달란트</HistoryAmount>
                    
                    <DeleteButton
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingIds.has(item.id)}
                    >
                      {deletingIds.has(item.id) ? (
                        <SpinIcon>🔄</SpinIcon>
                      ) : (
                        '🗑️'
                      )}
                      삭제
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
    </Container>
  );
};

export default History; 