import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';
import KoreanLunarCalendar from 'korean-lunar-calendar';

const AllBirthdays = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentYear] = useState(new Date().getFullYear());

  // Filters
  const [selectedDept, setSelectedDept] = useState('전체');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Default to current month

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMembers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'church_member'));
      const memberList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const calendar = new KoreanLunarCalendar();

      // Calculate solar date for current year
      const processedMembers = memberList.map(member => {
        let solarDate;
        let displayDateStr = `${member.birthMonth}월 ${member.birthDay}일`;

        // Robust check for isLunar (handle string 'true' or boolean true)
        const isLunar = member.isLunar === true || member.isLunar === 'true';

        if (isLunar) {
          displayDateStr += ' (음)'; // Explicitly add (음) indicator

          try {
            // Check Current Year Lunar Date
            calendar.setLunarDate(currentYear, Number(member.birthMonth), Number(member.birthDay), false);
            const solarDateCurrent = new Date(
              calendar.solarCalendar.year,
              calendar.solarCalendar.month - 1,
              calendar.solarCalendar.day
            );

            // Check Previous Year Lunar Date
            calendar.setLunarDate(currentYear - 1, Number(member.birthMonth), Number(member.birthDay), false);
            const solarDatePrev = new Date(
              calendar.solarCalendar.year,
              calendar.solarCalendar.month - 1,
              calendar.solarCalendar.day
            );

            const currentYearStart = new Date(currentYear, 0, 1);
            const currentYearEnd = new Date(currentYear, 11, 31);

            // Select the date that falls within the current year
            if (solarDatePrev >= currentYearStart && solarDatePrev <= currentYearEnd) {
              solarDate = solarDatePrev;
            } else if (solarDateCurrent >= currentYearStart && solarDateCurrent <= currentYearEnd) {
              solarDate = solarDateCurrent;
            } else {
              // Fallback to current lunar year's solar date even if outside (rare edge case)
              solarDate = solarDateCurrent;
            }
          } catch (e) {
            console.error("Lunar conversion error", e);
            // Fallback to purely numeric date if conversion crashes
            solarDate = new Date(currentYear, Number(member.birthMonth) - 1, Number(member.birthDay));
          }
        } else {
          displayDateStr += ' (양)';
          solarDate = new Date(currentYear, Number(member.birthMonth) - 1, Number(member.birthDay));
        }

        return {
          ...member,
          solarDate,
          displayDateStr,
          isLunar // ensuring this is passed through
        };
      });

      // Sort by solar date
      processedMembers.sort((a, b) => {
        return a.solarDate.getTime() - b.solarDate.getTime();
      });

      setMembers(processedMembers);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract unique departments
  const departments = useMemo(() => {
    const depts = new Set(members.map(m => m.dept || '기타'));
    return ['전체', ...Array.from(depts).sort()];
  }, [members]);

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      // Dept Filter
      if (selectedDept !== '전체' && (member.dept || '기타') !== selectedDept) return false;

      // Month Filter
      const memberMonth = member.solarDate.getMonth() + 1;
      if (selectedMonth !== '전체' && memberMonth !== Number(selectedMonth)) return false;

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

  return (
    <Container>
      <PageHeader>
        <BackToMain to="/">⬅︎ 메인으로</BackToMain>
        <FastIcon>🎂</FastIcon>
        <Title>전교인 생일 보기</Title>
        <Subtitle>{currentYear}년 생일 달력입니다.</Subtitle>
      </PageHeader>

      <FilterSection>
        <FilterGroup>
          <FilterLabel>월 선택</FilterLabel>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value === '전체' ? '전체' : Number(e.target.value))}
          >
            <option value="전체">전체 보기</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>{month}월</option>
            ))}
          </Select>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>부서 선택</FilterLabel>
          <Select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </Select>
        </FilterGroup>
      </FilterSection>

      {isLoading ? (
        <LoadingState>
          <div>데이터를 불러오는 중입니다...</div>
        </LoadingState>
      ) : (
        <>
          <ResultSummary>
            {selectedMonth !== '전체' && <Highlight>{selectedMonth}월 </Highlight>}
            {selectedDept !== '전체' && <Highlight>{selectedDept} </Highlight>}
            생일자: 총 <strong>{filteredMembers.length}</strong>명
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
                    <TableHeader>올해 날짜 (양력)</TableHeader>
                  </TableRow>
                </thead>
                <tbody>
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map(member => (
                      <TableRow key={member.id} $isToday={
                        member.solarDate.getMonth() === new Date().getMonth() &&
                        member.solarDate.getDate() === new Date().getDate()
                      }>
                        <TableCell><DeptBadge>{member.dept}</DeptBadge></TableCell>
                        <TableCell><Name>{member.name}</Name></TableCell>
                        <TableCell>{member.position}</TableCell>
                        <TableCell>{member.displayDateStr}</TableCell>
                        <TableCell $highlight>
                          {formatSolarDate(member.solarDate)}
                          {member.isToday && <TodayBadge>오늘!</TodayBadge>}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <EmptyCell colSpan="5">
                        {selectedMonth}월에는 생일자가 없습니다. 🎉
                      </EmptyCell>
                    </TableRow>
                  )}
                </tbody>
              </Table>
            </TableContainer>
          </DesktopView>

          {/* Mobile Card View - Requested by User */}
          <MobileView>
            {filteredMembers.length > 0 ? (
              <CardList>
                {filteredMembers.map(member => {
                  const isToday = member.solarDate.getMonth() === new Date().getMonth() &&
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
                {selectedMonth}월에는 생일자가 없습니다. 🎉
              </EmptyStateCard>
            )}
          </MobileView>
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: ${spacing.xl} ${spacing.lg};
  position: relative;
  
  ${media['max-md']} {
    padding: ${spacing.md};
  }
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: ${spacing.xl};
`;

const FastIcon = styled.div`
    font-size: 3rem;
    margin-bottom: ${spacing.sm};
`;

const Title = styled.h2`
  font-size: ${typography.fontSize['3xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.primary[700]};
  margin-bottom: ${spacing.xs};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize['2xl']};
  }
`;

const Subtitle = styled.p`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.lg};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.base};
  }
  ${media['max-md']} {
    font-size: ${typography.fontSize.base};
  }
`;

const BackToMain = styled(Link)`
  position: absolute;
  top: ${spacing.lg};
  left: ${spacing.lg};
  color: ${colors.neutral[500]};
  text-decoration: none;
  font-size: ${typography.fontSize.sm};
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    color: ${colors.primary[700]};
  }
`;

const FilterSection = styled.div`
    display: flex;
    justify-content: center;
    gap: ${spacing.xl};
    margin-bottom: ${spacing.xl};
    flex-wrap: wrap;
    background: ${colors.neutral[50]};
    padding: ${spacing.lg};
    border-radius: ${borderRadius.lg};
    
    ${media['max-md']} {
        gap: ${spacing.sm};
        padding: ${spacing.md};
        display: grid;
        grid-template-columns: 1fr 1fr;
    }
`;

const FilterGroup = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.md};
    
    ${media['max-md']} {
        flex-direction: column;
        align-items: stretch;
        gap: ${spacing.xs};
    }
`;

const FilterLabel = styled.label`
    font-weight: ${typography.fontWeight.semibold};
    color: ${colors.neutral[700]};
    min-width: 60px;
    
    ${media['max-md']} {
        font-size: ${typography.fontSize.xs};
        margin-bottom: 2px;
    }
`;

const Select = styled.select`
    padding: ${spacing.sm} ${spacing.lg};
    border-radius: ${borderRadius.md};
    border: 1px solid ${colors.neutral[300]};
    font-size: ${typography.fontSize.base};
    background-color: white;
    cursor: pointer;
    min-width: 120px;

    &:focus {
        border-color: ${colors.primary[500]};
        outline: none;
        box-shadow: 0 0 0 2px ${colors.primary[100]};
    }
    
    ${media['max-md']} {
        width: 100%;
        min-width: auto;
        padding: ${spacing.sm};
        font-size: ${typography.fontSize.sm};
    }
`;

const ResultSummary = styled.div`
    text-align: right;
    margin-bottom: ${spacing.sm};
    color: ${colors.neutral[600]};
    font-size: ${typography.fontSize.base};
    
    ${media['max-md']} {
        font-size: ${typography.fontSize.sm};
        margin-bottom: ${spacing.md};
    }
`;

const Highlight = styled.span`
    color: ${colors.primary[600]};
    font-weight: bold;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${spacing['4xl']};
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.lg};
`;

// Desktop View Components
const DesktopView = styled.div`
    display: block;
    ${media['max-md']} {
        display: none;
    }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: ${borderRadius.xl};
  box-shadow: ${shadows.md};
  overflow: hidden;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${colors.neutral[200]};
  
  ${props => props.$isToday && `
    background-color: #FFF8E1 !important;
  `}

  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${colors.neutral[50]};
  }
`;

const TableHeader = styled.th`
  text-align: left;
  padding: ${spacing.md} ${spacing.lg};
  background-color: ${colors.primary[50]};
  color: ${colors.primary[800]};
  font-weight: ${typography.fontWeight.bold};
  font-size: ${typography.fontSize.sm};
`;

const TableCell = styled.td`
  padding: ${spacing.md} ${spacing.lg};
  color: ${colors.neutral[700]};
  vertical-align: middle;
  
  ${props => props.$highlight && `
    color: ${colors.primary[700]};
    font-weight: ${typography.fontWeight.bold};
  `}
`;

const Name = styled.span`
    font-weight: 600;
    color: ${colors.neutral[900]};
`;

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

const EmptyCell = styled.td`
    padding: ${spacing['4xl']};
    text-align: center;
    color: ${colors.neutral[400]};
    font-size: ${typography.fontSize.lg};
`;

// Mobile View Components
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
    padding: ${spacing.lg};
    border: 1px solid ${colors.neutral[200]};
    
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
    margin-bottom: ${spacing.sm};
`;

const CardUserInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.sm};
`;

const CardBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const CardName = styled.div`
    font-size: ${typography.fontSize.lg};
    font-weight: ${typography.fontWeight.bold};
    color: ${colors.neutral[900]};
    display: flex;
    align-items: center;
    gap: ${spacing.sm};
`;

const CardPosition = styled.span`
    font-size: ${typography.fontSize.sm};
    color: ${colors.neutral[500]};
    font-weight: ${typography.fontWeight.normal};
`;

const CardDate = styled.div`
    font-size: ${typography.fontSize.xl};
    font-weight: ${typography.fontWeight.bold};
    color: ${props => props.$isToday ? colors.error[600] : colors.primary[600]};
    margin: ${spacing.xs} 0;
`;

const CardOriginalDate = styled.div`
    font-size: ${typography.fontSize.sm};
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
