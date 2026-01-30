import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';
import KoreanLunarCalendar from 'korean-lunar-calendar';

const AllBirthdays = () => {
  const [rawMembers, setRawMembers] = useState([]); // Store raw data from DB
  const [members, setMembers] = useState([]); // Store processed data with calculated dates
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Default to current month
  const [selectedDept, setSelectedDept] = useState('전체');

  // Fetch raw data once on mount
  useEffect(() => {
    fetchRawMembers();
  }, []);

  // Recalculate dates whenever raw data or selectedYear changes
  useEffect(() => {
    if (rawMembers.length > 0) {
      processMembers(rawMembers, selectedYear);
    }
  }, [rawMembers, selectedYear]);

  const fetchRawMembers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'church_member'));
      const memberList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRawMembers(memberList);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processMembers = (memberList, year) => {
    const calendar = new KoreanLunarCalendar();
    const currentYearStart = new Date(year, 0, 1);
    const currentYearEnd = new Date(year, 11, 31);

    const processed = memberList.map(member => {
      let solarDate;
      let displayDateStr = `${member.birthMonth}월 ${member.birthDay}일`;
      const isLunar = member.isLunar === true || member.isLunar === 'true';

      if (isLunar) {
        displayDateStr += ' (음)';
        try {
          // Check Selected Year Lunar Date
          calendar.setLunarDate(year, Number(member.birthMonth), Number(member.birthDay), false);
          const solarDateCurrent = new Date(
            calendar.solarCalendar.year,
            calendar.solarCalendar.month - 1,
            calendar.solarCalendar.day
          );

          // Check Previous Year Lunar Date
          calendar.setLunarDate(year - 1, Number(member.birthMonth), Number(member.birthDay), false);
          const solarDatePrev = new Date(
            calendar.solarCalendar.year,
            calendar.solarCalendar.month - 1,
            calendar.solarCalendar.day
          );

          // Check Next Year Lunar Date
          calendar.setLunarDate(year + 1, Number(member.birthMonth), Number(member.birthDay), false);
          const solarDateNext = new Date(
            calendar.solarCalendar.year,
            calendar.solarCalendar.month - 1,
            calendar.solarCalendar.day
          );

          if (solarDatePrev >= currentYearStart && solarDatePrev <= currentYearEnd) {
            solarDate = solarDatePrev;
          } else if (solarDateCurrent >= currentYearStart && solarDateCurrent <= currentYearEnd) {
            solarDate = solarDateCurrent;
          } else if (solarDateNext >= currentYearStart && solarDateNext <= currentYearEnd) {
            solarDate = solarDateNext;
          } else {
            solarDate = solarDateCurrent;
          }
        } catch (e) {
          console.error("Lunar conversion error", e);
          solarDate = new Date(year, Number(member.birthMonth) - 1, Number(member.birthDay));
        }
      } else {
        displayDateStr += ' (양)';
        solarDate = new Date(year, Number(member.birthMonth) - 1, Number(member.birthDay));
      }

      return {
        ...member,
        solarDate,
        displayDateStr,
        isLunar
      };
    });

    processed.sort((a, b) => a.solarDate.getTime() - b.solarDate.getTime());
    setMembers(processed);
  };

  // Month Navigation
  const handlePrev = () => {
    if (selectedMonth === '전체') {
      setSelectedYear(prev => prev - 1);
    } else {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(prev => prev - 1);
      } else {
        setSelectedMonth(prev => prev - 1);
      }
    }
  };

  const handleNext = () => {
    if (selectedMonth === '전체') {
      setSelectedYear(prev => prev + 1);
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(prev => prev + 1);
      } else {
        setSelectedMonth(prev => prev + 1);
      }
    }
  };

  const handleReset = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth() + 1);
  };

  // Departments
  const departments = useMemo(() => {
    const depts = new Set(members.map(m => m.dept || '기타'));
    return ['전체', ...Array.from(depts).sort()];
  }, [members]);

  // Filter Members
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      // Dept Filter
      if (selectedDept !== '전체' && (member.dept || '기타') !== selectedDept) return false;

      // Month Filter
      if (selectedMonth !== '전체') {
        const memberMonth = member.solarDate.getMonth() + 1;
        if (memberMonth !== Number(selectedMonth)) return false;
      }

      return true;
    });
  }, [members, selectedDept, selectedMonth]);

  const formatSolarDate = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = days[date.getDay()];
    return `${month}월 ${day}일 (${dayOfWeek})`;
  };

  // Year Range for Dropdown
  const yearRange = useMemo(() => {
    const current = new Date().getFullYear();
    const years = [];
    for (let i = -5; i <= 5; i++) {
      years.push(current + i);
    }
    return years;
  }, []);

  return (
    <Container>
      <ControlBar>


        <DateNavigator>
          <NavButton onClick={handlePrev}>◀</NavButton>

          <DateSelectGroup>
            <HiddenSelect
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {yearRange.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </HiddenSelect>
            <DateText>{selectedYear}.</DateText>
          </DateSelectGroup>

          <DateSelectGroup>
            <HiddenSelect
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value === '전체' ? '전체' : Number(e.target.value))}
            >
              <option value="전체">Entire</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </HiddenSelect>
            <DateText>
              {selectedMonth === '전체' ? 'All' : String(selectedMonth).padStart(2, '0')}
            </DateText>
          </DateSelectGroup>

          <NavButton onClick={handleNext}>▶</NavButton>
        </DateNavigator>

        <RightControls>
          <TodayButton onClick={handleReset}>오늘</TodayButton>
          <FilterDropdown
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </FilterDropdown>
        </RightControls>
      </ControlBar>

      {isLoading ? (
        <LoadingState>데이터를 불러오는 중입니다...</LoadingState>
      ) : (
        <>
          <ResultSummary>
            총 <strong>{filteredMembers.length}</strong>명의 생일자가 있습니다.
          </ResultSummary>

          {/* Desktop Table View */}
          <DesktopView>
            <TableContainer>
              <Table>
                <thead>
                  <TableRow>
                    <TableHeader>소속</TableHeader>
                    <TableHeader>이름</TableHeader>
                    <TableHeader>직분</TableHeader>
                    <TableHeader>원래 생일</TableHeader>
                    <TableHeader>{selectedYear}년 날짜 (양력)</TableHeader>
                  </TableRow>
                </thead>
                <tbody>
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map(member => (
                      <TableRow key={member.id} $isToday={
                        member.solarDate.getFullYear() === new Date().getFullYear() &&
                        member.solarDate.getMonth() === new Date().getMonth() &&
                        member.solarDate.getDate() === new Date().getDate()
                      }>
                        <TableCell><DeptBadge>{member.dept}</DeptBadge></TableCell>
                        <TableCell><Name>{member.name}</Name></TableCell>
                        <TableCell>{member.position}</TableCell>
                        <TableCell>{member.displayDateStr}</TableCell>
                        <TableCell $highlight>
                          {formatSolarDate(member.solarDate)}
                          {/* Happy Birthday Badge */}
                          {member.solarDate.getFullYear() === new Date().getFullYear() &&
                            member.solarDate.getMonth() === new Date().getMonth() &&
                            member.solarDate.getDate() === new Date().getDate() &&
                            <TodayBadge>Today!</TodayBadge>}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <EmptyCell colSpan="5">
                        {selectedMonth}월에는 생일자가 없습니다.
                      </EmptyCell>
                    </TableRow>
                  )}
                </tbody>
              </Table>
            </TableContainer>
          </DesktopView>

          {/* Mobile Card View */}
          <MobileView>
            {filteredMembers.length > 0 ? (
              <CardList>
                {filteredMembers.map(member => {
                  const isToday = member.solarDate.getFullYear() === new Date().getFullYear() &&
                    member.solarDate.getMonth() === new Date().getMonth() &&
                    member.solarDate.getDate() === new Date().getDate();
                  return (
                    <MemberCard key={member.id} $isToday={isToday}>
                      <CardHeader>
                        <CardUserInfo>
                          <DeptBadge>{member.dept}</DeptBadge>
                          <CardName>{member.name} <CardPosition>{member.position}</CardPosition></CardName>
                        </CardUserInfo>
                        {isToday && <TodayBadge>오늘 생일! 🎂</TodayBadge>}
                      </CardHeader>
                      <CardBody>
                        <CardDate $isToday={isToday}>
                          {formatSolarDate(member.solarDate)}
                        </CardDate>
                        <CardOriginalDate>
                          원래 생일: {member.displayDateStr}
                        </CardOriginalDate>
                      </CardBody>
                    </MemberCard>
                  );
                })}
              </CardList>
            ) : (
              <EmptyStateCard>
                {selectedMonth}월에는 생일자가 없습니다.
              </EmptyStateCard>
            )}
          </MobileView>
        </>
      )}
    </Container>
  );
};

// Styles
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${spacing.md};
  
  ${media['max-md']} {
    padding: ${spacing.sm};
  }
`;

// Control Bar Styles (Minimalist)
const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.full};
  box-shadow: ${shadows.md};
  margin-bottom: ${spacing.lg};
  position: sticky;
  top: ${spacing.sm};
  z-index: 100;

  ${media['max-md']} {
    padding: ${spacing.sm};
    gap: ${spacing.xs};
  }
`;

const BackLink = styled(Link)`
  font-size: ${typography.fontSize.lg};
  color: ${colors.neutral[500]};
  text-decoration: none;
  padding: ${spacing.xs};
  
  &:hover {
    color: ${colors.neutral[900]};
  }
`;

const DateNavigator = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  
  ${media['max-md']} {
    gap: ${spacing.sm};
  }
`;

const NavButton = styled.button`
  background: none;
  border: none;
  font-size: ${typography.fontSize.lg};
  color: ${colors.neutral[400]};
  cursor: pointer;
  padding: 0 ${spacing.xs};
  
  &:hover {
    color: ${colors.primary[600]};
  }
`;

const DateSelectGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DateText = styled.span`
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[800]};
  font-family: ${typography.fontFamily.heading};
  pointer-events: none; // Let clicks pass to select
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.lg};
  }
`;

const HiddenSelect = styled.select`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0; // Hide but remain clickable
  cursor: pointer;
  font-size: ${typography.fontSize.sm};
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const TodayButton = styled.button`
  background: ${colors.neutral[100]};
  border: none;
  border-radius: ${borderRadius.md};
  padding: 4px 8px;
  font-size: ${typography.fontSize.xs};
  color: ${colors.neutral[600]};
  cursor: pointer;
  font-weight: ${typography.fontWeight.bold};

  &:hover {
    background: ${colors.neutral[200]};
    color: ${colors.neutral[800]};
  }
`;

const FilterDropdown = styled.select`
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${borderRadius.full};
  border: 1px solid ${colors.neutral[200]};
  font-size: ${typography.fontSize.sm};
  background-color: ${colors.neutral[50]};
  cursor: pointer;
  color: ${colors.neutral[700]};
  max-width: 100px;

  &:focus {
    outline: none;
    border-color: ${colors.primary[500]};
  }
`;

const ResultSummary = styled.div`
  text-align: center;
  margin-bottom: ${spacing.md};
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.sm};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${spacing['4xl']};
  color: ${colors.neutral[500]};
`;

// Shared styles for Badge, Table, Card (reused from previous design for consistency)
const DeptBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  background-color: ${colors.neutral[100]};
  color: ${colors.neutral[600]};
  border-radius: 12px;
  font-size: 0.85rem;
  
  ${media['max-md']} {
    font-size: 0.75rem;
    padding: 2px 6px;
  }
`;

const TodayBadge = styled.span`
  display: inline-block;
  margin-left: 8px;
  padding: 2px 6px;
  background-color: ${colors.error[500]};
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  animation: bounce 1s infinite;
  
  @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
  }
`;

// Desktop Components
const DesktopView = styled.div`
  display: block;
  ${media['max-md']} {
    display: none;
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: ${borderRadius.xl};
  box-shadow: ${shadows.sm};
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${colors.neutral[100]};
  ${props => props.$isToday && `background-color: #FFF8E1 !important;`}
  &:last-child { border-bottom: none; }
`;

const TableHeader = styled.th`
  text-align: left;
  padding: ${spacing.md};
  background-color: ${colors.neutral[50]};
  color: ${colors.neutral[600]};
  font-weight: ${typography.fontWeight.bold};
  font-size: ${typography.fontSize.xs};
`;

const TableCell = styled.td`
  padding: ${spacing.md};
  color: ${colors.neutral[700]};
  font-size: ${typography.fontSize.sm};
  ${props => props.$highlight && `
    color: ${colors.primary[700]};
    font-weight: bold;
  `}
`;

const Name = styled.span`
  font-weight: 600;
  color: ${colors.neutral[900]};
`;

const EmptyCell = styled.td`
  padding: ${spacing.xl};
  text-align: center;
  color: ${colors.neutral[400]};
`;

// Mobile Components
const MobileView = styled.div`
  display: none;
  ${media['max-md']} {
    display: block;
  }
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const MemberCard = styled.div`
  background: white;
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.sm};
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral[100]};
  
  ${props => props.$isToday && `
    border-color: ${colors.error[300]};
    background-color: #FFF8E1;
    box-shadow: ${shadows.md};
  `}
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.xs};
`;

const CardUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const CardName = styled.div`
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
`;

const CardPosition = styled.span`
  font-size: ${typography.fontSize.xs};
  color: ${colors.neutral[500]};
  font-weight: normal;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CardDate = styled.div`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
  color: ${props => props.$isToday ? colors.error[600] : colors.primary[600]};
`;

const CardOriginalDate = styled.div`
  font-size: ${typography.fontSize.xs};
  color: ${colors.neutral[400]};
`;

const EmptyStateCard = styled.div`
  background: white;
  padding: ${spacing.xl};
  text-align: center;
  border-radius: ${borderRadius.lg};
  color: ${colors.neutral[500]};
  border: 1px dashed ${colors.neutral[300]};
`;

export default AllBirthdays;
