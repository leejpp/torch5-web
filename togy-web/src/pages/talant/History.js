import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { collection, query, where, orderBy, limit, onSnapshot, getDocs, deleteDoc, doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';
import {
  formatDate,
  formatTime,
  getAvailableMonths
} from '../../utils/talantUtils';

const KOREAN_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 안전한 날짜 파싱 함수
const safeParseDateValue = (dateValue) => {
  if (!dateValue) return new Date();
  if (typeof dateValue.toDate === 'function') return dateValue.toDate();
  if (dateValue instanceof Date) return dateValue;
  if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  return new Date();
};

const TalantHistory = () => {
  const navigate = useNavigate();
  const [allHistory, setAllHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState('');
  const [dateFilterType, setDateFilterType] = useState('month');
  const [monthFilter, setMonthFilter] = useState('');
  const [specificDateFilter, setSpecificDateFilter] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableNames, setAvailableNames] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Toast Function
  const showToastMessage = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Load Available Months
  useEffect(() => {
    const loadAvailableMonths = async () => {
      try {
        const q = query(collection(db, 'talant_history'), orderBy('receivedDate', 'desc'));
        const snapshot = await getDocs(q);
        const historyData = snapshot.docs.map(doc => ({
          date: safeParseDateValue(doc.data().receivedDate),
          name: doc.data().name || ''
        }));

        const months = getAvailableMonths(historyData);
        setAvailableMonths(months);

        const names = [...new Set(historyData.map(item => item.name).filter(name => name))];
        setAvailableNames(names.sort());

        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        setMonthFilter(currentMonth);
      } catch (error) {
        console.error('Error loading available months:', error);
      }
    };
    loadAvailableMonths();
  }, []);

  // Load Data
  useEffect(() => {
    setLoading(true);
    let q;

    if (monthFilter) {
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
      q = query(
        collection(db, 'talant_history'),
        orderBy('receivedDate', 'desc'),
        limit(100)
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
          receivedDate: safeParseDateValue(data.receivedDate),
          createdAt: safeParseDateValue(data.createdAt)
        };
      });

      // Sort
      historyData.sort((a, b) => {
        const dateCompare = b.receivedDate - a.receivedDate;
        if (dateCompare !== 0) return dateCompare;
        return b.createdAt - a.createdAt;
      });

      setAllHistory(historyData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading history:', error);
      showToastMessage('데이터 로드 중 오류가 발생했습니다.', 'error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [monthFilter]);

  // Filtering
  useEffect(() => {
    let filtered = [...allHistory];

    if (nameFilter) {
      filtered = filtered.filter(item => item.name === nameFilter);
    }

    if (dateFilterType === 'specific' && specificDateFilter) {
      filtered = filtered.filter(item => {
        const date = item.receivedDate;
        const itemDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        return itemDate === specificDateFilter;
      });
    }

    setFilteredHistory(filtered);
  }, [allHistory, nameFilter, dateFilterType, specificDateFilter]);

  // Grouping
  const groupedHistory = useMemo(() => {
    const grouped = {};
    filteredHistory.forEach(item => {
      const date = item.receivedDate;
      if (!date || isNaN(date.getTime())) return;
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(item);
    });

    return Object.keys(grouped).map(dateKey => {
      const [year, month, day] = dateKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return {
        date,
        displayDate: `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${KOREAN_DAYS[date.getDay()]})`,
        items: grouped[dateKey].sort((a, b) => b.createdAt - a.createdAt)
      };
    }).sort((a, b) => b.date - a.date);
  }, [filteredHistory]);

  // Update Stats
  const updateUserStats = async (studentName, talantValue) => {
    try {
      const userStatsRef = doc(db, 'user_stats', studentName);
      const userStatsDoc = await getDoc(userStatsRef);

      if (userStatsDoc.exists()) {
        const currentTotal = userStatsDoc.data().total || 0;
        await updateDoc(userStatsRef, {
          total: currentTotal + talantValue
        });
      } else {
        await setDoc(userStatsRef, { total: talantValue });
      }
    } catch (error) {
      console.error('user_stats 업데이트 오류:', error);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (window.confirm('정말로 이 기록을 삭제하시겠습니까?')) {
      setDeletingIds(prev => new Set([...prev, id]));
      try {
        const talantDocRef = doc(db, 'talant_history', id);
        const talantDoc = await getDoc(talantDocRef);

        if (talantDoc.exists()) {
          const { name, talant } = talantDoc.data();
          await deleteDoc(talantDocRef);
          await updateUserStats(name, -(parseInt(talant) || 0));
          showToastMessage('기록이 삭제되었습니다.');
        }
      } catch (error) {
        console.error('Error deleting:', error);
        showToastMessage('삭제 중 오류가 발생했습니다.', 'error');
      } finally {
        setDeletingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    }
  };

  const clearFilters = () => {
    setNameFilter('');
    setMonthFilter('');
    setSpecificDateFilter('');
    showToastMessage('필터가 초기화되었습니다.');
  };

  return (
    <PageContainer>
      <Header>
        <HeaderContent>
          <BackButton onClick={() => navigate('/admin/talant')}>
            ← 대시보드
          </BackButton>
          <PageTitle>달란트 내역</PageTitle>
          <ButtonGroup>
            <HeaderButton onClick={() => navigate('/admin/talant/board')}>
              📊 현황판
            </HeaderButton>
            <HeaderButton $primary onClick={() => navigate('/admin/talant/input')}>
              ✏️ 입력하기
            </HeaderButton>
          </ButtonGroup>
        </HeaderContent>
      </Header>

      <ContentArea>
        {/* Filters */}
        <FiltersSection>
          <FilterToggle onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? '필터 접기' : '필터 열기'} 🔍
          </FilterToggle>

          <FiltersContainer $show={showFilters}>
            <FilterGroup>
              <FilterLabel>기간 선택</FilterLabel>
              <Select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
                <option value="">전체 기간</option>
                {availableMonths.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </Select>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>이름 검색</FilterLabel>
              <Select value={nameFilter} onChange={(e) => setNameFilter(e.target.value)}>
                <option value="">전체 학생</option>
                {availableNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </Select>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>특정 날짜</FilterLabel>
              <DateInput
                type="date"
                value={specificDateFilter}
                onChange={(e) => {
                  setSpecificDateFilter(e.target.value);
                  if (e.target.value) setDateFilterType('specific');
                }}
              />
            </FilterGroup>

            {(nameFilter || monthFilter || specificDateFilter) && (
              <ClearFiltersBtn onClick={clearFilters}>필터 초기화 ↺</ClearFiltersBtn>
            )}
          </FiltersContainer>
        </FiltersSection>

        {loading ? (
          <LoadingState>데이터를 불러오는 중입니다...</LoadingState>
        ) : filteredHistory.length === 0 ? (
          <EmptyState>
            <div className="icon">📭</div>
            <p>달란트 내역이 없습니다.</p>
          </EmptyState>
        ) : (
          <HistoryList>
            {groupedHistory.map(group => (
              <DateGroup key={group.displayDate}>
                <DateHeader>{group.displayDate}</DateHeader>
                {group.items.map(item => (
                  <HistoryItem key={item.id}>
                    <ItemLeft>
                      <ItemName>
                        {item.name}
                        {item.reason === '출석' && <Badge $type="attendance">출석</Badge>}
                        {item.reason === '전도' && <Badge $type="evangelism">전도</Badge>}
                      </ItemName>
                      <ItemDetails>
                        <span className="reason">{item.reason}</span>
                        <span className="dot">•</span>
                        <span className="time">{formatTime(item.createdAt)}</span>
                      </ItemDetails>
                    </ItemLeft>
                    <ItemRight>
                      <TalantAmount>+{item.talant}</TalantAmount>
                      <DeleteBtn
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingIds.has(item.id)}
                      >
                        🗑️
                      </DeleteBtn>
                    </ItemRight>
                  </HistoryItem>
                ))}
              </DateGroup>
            ))}
          </HistoryList>
        )}
      </ContentArea>

      <Toast $show={toast.show} $type={toast.type}>
        {toast.message}
      </Toast>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: ${colors.neutral[50]};
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid ${colors.neutral[200]};
  padding: ${spacing.md} 0;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const HeaderContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 ${spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  ${media['max-md']} {
    flex-direction: column;
    gap: ${spacing.md};
    padding: ${spacing.md};
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[600]};
  cursor: pointer;
  padding: ${spacing.sm};
  
  &:hover {
    color: ${colors.neutral[900]};
  }
  
  ${media['max-md']} {
    align-self: flex-start;
  }
`;

const PageTitle = styled.h1`
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacing.md};
`;

const HeaderButton = styled.button`
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.lg};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${props => props.$primary ? `
    background: ${colors.primary[600]};
    color: white;
    &:hover { background: ${colors.primary[700]}; }
  ` : `
    background: ${colors.neutral[100]};
    color: ${colors.neutral[700]};
    &:hover { background: ${colors.neutral[200]}; }
  `}
`;

const ContentArea = styled.main`
  max-width: 800px;
  margin: 0 auto;
  padding: ${spacing.xl} ${spacing.lg};
  
  ${media['max-md']} {
    padding: ${spacing.lg} ${spacing.md};
  }
`;

const FiltersSection = styled.div`
  margin-bottom: ${spacing.xl};
`;

const FilterToggle = styled.button`
  display: none;
  width: 100%;
  padding: ${spacing.sm};
  background: white;
  border: 1px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.md};
  color: ${colors.neutral[600]};
  font-weight: ${typography.fontWeight.semibold};
  
  ${media['max-md']} {
    display: block;
    margin-bottom: ${spacing.md};
  }
`;

const FiltersContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${spacing.md};
  align-items: end;
  background: white;
  padding: ${spacing.lg};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.sm};
  border: 1px solid ${colors.neutral[200]};
  
  ${media['max-md']} {
    display: ${props => props.$show ? 'grid' : 'none'};
    grid-template-columns: 1fr;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

const FilterLabel = styled.label`
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[500]};
  text-transform: uppercase;
`;

const Select = styled.select`
  padding: ${spacing.sm};
  border: 1px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSize.sm};
  &:focus { outline: none; border-color: ${colors.primary[500]}; }
`;

const DateInput = styled.input`
  padding: ${spacing.sm};
  border: 1px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSize.sm};
  &:focus { outline: none; border-color: ${colors.primary[500]}; }
`;

const ClearFiltersBtn = styled.button`
  padding: ${spacing.sm};
  background: ${colors.neutral[100]};
  color: ${colors.neutral[600]};
  border: none;
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSize.xs};
  cursor: pointer;
  &:hover { background: ${colors.neutral[200]}; }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${spacing['4xl']};
  color: ${colors.neutral[500]};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing['4xl']};
  color: ${colors.neutral[500]};
  
  .icon { font-size: ${typography.fontSize['4xl']}; margin-bottom: ${spacing.md}; }
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xl};
`;

const DateGroup = styled.div``;

const DateHeader = styled.h3`
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[500]};
  margin-bottom: ${spacing.sm};
  padding-left: ${spacing.xs};
`;

const HistoryItem = styled.div`
  background: white;
  border-radius: ${borderRadius.lg};
  padding: ${spacing.md} ${spacing.lg};
  margin-bottom: ${spacing.sm};
  box-shadow: ${shadows.sm};
  border: 1px solid ${colors.neutral[200]};
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
  }
`;

const ItemLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ItemName = styled.div`
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const Badge = styled.span`
  font-size: 10px;
  padding: 2px 6px;
  border-radius: ${borderRadius.sm};
  background: ${props => props.$type === 'attendance' ? colors.success[100] : colors.primary[100]};
  color: ${props => props.$type === 'attendance' ? colors.success[700] : colors.primary[700]};
  font-weight: ${typography.fontWeight.bold};
`;

const ItemDetails = styled.div`
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[500]};
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
`;

const ItemRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
`;

const TalantAmount = styled.div`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.primary[600]};
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.2s;
  font-size: ${typography.fontSize.lg};
  
  &:hover:not(:disabled) { opacity: 1; }
  &:disabled { cursor: not-allowed; }
`;

const Toast = styled.div`
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(${props => props.$show ? '0' : '100px'});
  background: ${props => props.$type === 'error' ? colors.error[500] : colors.neutral[800]};
  color: white;
  padding: ${spacing.md} ${spacing.xl};
  border-radius: ${borderRadius.full};
  box-shadow: ${shadows.xl};
  font-weight: ${typography.fontWeight.medium};
  opacity: ${props => props.$show ? 1 : 0};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  white-space: nowrap;
`;

export default TalantHistory;