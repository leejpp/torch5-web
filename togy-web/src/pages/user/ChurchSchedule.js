import React, { useState, useEffect, useRef } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ko from 'date-fns/locale/ko';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';
import { processCalendarEvents } from '../../utils/lunarCalendar';

const locales = {
  'ko': ko,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const EVENT_TYPES = {
  DEFAULT: {
    label: '기본',
    bgColor: '#F5F5F5',
    color: '#616161',
    gradient: 'linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)'
  },
  BIRTHDAY: {
    label: '생일',
    bgColor: '#E1BEE7',
    color: '#6A1B9A',
    gradient: 'linear-gradient(135deg, #E1BEE7 0%, #CE93D8 100%)'
  },
  MEETING: {
    label: '예배',
    bgColor: '#BBDEFB',
    color: '#1565C0',
    gradient: 'linear-gradient(135deg, #BBDEFB 0%, #90CAF9 100%)'
  },
  ACTIVITY: {
    label: '활동',
    bgColor: '#C8E6C9',
    color: '#2E7D32',
    gradient: 'linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 100%)'
  },
  EVENT: {
    label: '기타',
    bgColor: '#FFF9C4',
    color: '#F57F17',
    gradient: 'linear-gradient(135deg, #FFF9C4 0%, #FFF59D 100%)'
  },
  HOLIDAY: {
    label: '공휴일',
    bgColor: '#FFD1D1',
    color: '#C62828',
    gradient: 'linear-gradient(135deg, #FFCDD2 0%, #EF9A9A 100%)'
  }
};

const ChurchSchedule = () => {
  const [rawEvents, setRawEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const calendarRef = useRef(null);
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate();

  // Create years array for dropdown (current year - 2 to + 5)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (rawEvents.length > 0) {
      const processed = processCalendarEvents(rawEvents, date.getFullYear());
      setEvents(processed);
    }
  }, [rawEvents, date]);

  const fetchEvents = async () => {
    try {
      const q = query(collection(db, 'events'), orderBy('start'));
      const snapshot = await getDocs(q);
      const eventsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        start: doc.data().start.toDate(),
        end: doc.data().end.toDate(),
      }));
      setRawEvents(eventsList);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleYearChange = (e) => {
    const newDate = new Date(date);
    newDate.setFullYear(parseInt(e.target.value));
    setDate(newDate);
  };

  const handleMonthChange = (e) => {
    const newDate = new Date(date);
    newDate.setMonth(parseInt(e.target.value) - 1);
    setDate(newDate);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(date);
    newDate.setDate(1); // 날짜를 1일로 초기화하여 월 건너뜀 방지
    newDate.setMonth(date.getMonth() - 1);
    setDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(date);
    newDate.setDate(1); // 날짜를 1일로 초기화하여 월 건너뜀 방지
    newDate.setMonth(date.getMonth() + 1);
    setDate(newDate);
  };

  const handleToday = () => {
    setDate(new Date());
  };

  return (
    <Container>
      <BackgroundOverlay />

      <TopControls>
        <BackButton onClick={() => navigate('/')}>
          <BackIcon>←</BackIcon>
        </BackButton>

        <ControlBar>
          <DateControls>
            <NavButton onClick={handlePrevMonth}>&lt;</NavButton>
            <SelectGroup>
              <Select value={date.getFullYear()} onChange={handleYearChange}>
                {years.map(year => (
                  <option key={year} value={year}>{year}년</option>
                ))}
              </Select>
              <Select value={date.getMonth() + 1} onChange={handleMonthChange}>
                {months.map(month => (
                  <option key={month} value={month}>{month}월</option>
                ))}
              </Select>
            </SelectGroup>
            <NavButton onClick={handleNextMonth}>&gt;</NavButton>
          </DateControls>

          <TodayButton onClick={handleToday}>오늘</TodayButton>
        </ControlBar>

        <div style={{ width: '40px' }}></div> {/* Spacer for visual balance if needed, or keeping it strictly between */}
      </TopControls>

      <MainContent>
        <CalendarSection>
          <CalendarCard>
            <CalendarContainer>
              {isLoading ? (
                <LoadingSection>
                  <LoadingIcon>📅</LoadingIcon>
                  <LoadingText>일정을 불러오는 중...</LoadingText>
                </LoadingSection>
              ) : (
                <BigCalendar
                  ref={calendarRef}
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  culture='ko'
                  onSelectEvent={handleEventSelect}
                  views={['month']}
                  defaultView="month"
                  toolbar={false}
                  formats={{
                    monthHeaderFormat: 'yyyy년 MM월',
                    dayHeaderFormat: 'eee',
                    dayRangeHeaderFormat: ({ start, end }) =>
                      `${format(start, 'MM월 dd일')} - ${format(end, 'MM월 dd일')}`,
                  }}
                  messages={{
                    next: "다음",
                    previous: "이전",
                    today: "오늘",
                    month: "월",
                    showMore: total => `+${total}개 더보기`
                  }}
                  popup
                  eventPropGetter={event => {
                    const eventType = EVENT_TYPES[event.type] || EVENT_TYPES.DEFAULT;
                    return {
                      className: `rbc-event-${eventType.label} mobile-responsive-event`,
                      style: {
                        backgroundColor: eventType.bgColor,
                        color: eventType.color,
                        border: `1px solid ${eventType.color}`,
                        borderLeft: `3px solid ${eventType.color}`, // Accent on left
                      }
                    };
                  }}
                  dayPropGetter={date => {
                    const today = new Date();
                    const isToday = date.getDate() === today.getDate() &&
                      date.getMonth() === today.getMonth() &&
                      date.getYear() === today.getYear();
                    const isSunday = date.getDay() === 0;
                    return {
                      className: isToday ? 'today' : '',
                      style: {
                        backgroundColor: isToday ? colors.primary[50] : 'white',
                        color: isSunday ? colors.error[600] : colors.neutral[700]
                      }
                    };
                  }}
                  date={date}
                  onNavigate={newDate => setDate(newDate)}
                  components={{
                    event: ({ event }) => (
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{event.title}</span>
                      </div>
                    )
                  }}
                />
              )}
            </CalendarContainer>
          </CalendarCard>
        </CalendarSection>
      </MainContent>

      {isModalOpen && selectedEvent && (
        <Modal onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalBackground />
            <ModalHeader>
              <EventTitleSection>
                <EventIcon>
                  {selectedEvent.type === 'BIRTHDAY' ? '🎂' :
                    selectedEvent.type === 'MEETING' ? '👥' :
                      selectedEvent.type === 'ACTIVITY' ? '🎯' :
                        selectedEvent.type === 'EVENT' ? '📌' :
                          selectedEvent.type === 'HOLIDAY' ? '🏖️' : '📅'}
                </EventIcon>
                <EventTitle>{selectedEvent.title}</EventTitle>
              </EventTitleSection>
              <EventTypeTag eventType={selectedEvent.type || 'DEFAULT'}>
                <TagText>
                  {EVENT_TYPES[selectedEvent.type]?.label || EVENT_TYPES.DEFAULT.label}
                  {selectedEvent.isLunar && ' (음력)'}
                </TagText>
              </EventTypeTag>
            </ModalHeader>

            <EventDetails>
              <DetailCard>
                <DetailIcon>📅</DetailIcon>
                <DetailContent>
                  <DetailValue>
                    <div style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#666' }}>
                      {format(selectedEvent.start, 'yyyy년 MM월 dd일 (EEE)', { locale: ko })}
                      {selectedEvent.isLunar && selectedEvent.lunarDateLabel && (
                        <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '4px' }}>
                          (음력 {selectedEvent.lunarDateLabel})
                        </div>
                      )}
                    </div>{format(selectedEvent.start, 'yyyy-MM-dd') !== format(selectedEvent.end, 'yyyy-MM-dd') &&
                      ` ~ ${format(selectedEvent.end, 'yyyy년 MM월 dd일 (eee)', { locale: ko })}`
                    }
                  </DetailValue>
                </DetailContent>
              </DetailCard>

              {selectedEvent.location && (
                <DetailCard>
                  <DetailIcon>📍</DetailIcon>
                  <DetailContent>
                    <DetailLabel>장소</DetailLabel>
                    <DetailValue>{selectedEvent.location}</DetailValue>
                  </DetailContent>
                </DetailCard>
              )}

              {selectedEvent.description && (
                <DetailCard>
                  <DetailIcon>📝</DetailIcon>
                  <DetailContent>
                    <DetailLabel>설명</DetailLabel>
                    <DetailDescription>{selectedEvent.description}</DetailDescription>
                  </DetailContent>
                </DetailCard>
              )}
            </EventDetails>

            <ModalFooter>
              <CloseButton onClick={() => setIsModalOpen(false)}>
                닫기
              </CloseButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

// 애니메이션
const slideUp = keyframes`
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

// 스타일 컴포넌트
const Container = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background-color: ${colors.neutral[50]};
`;

const BackgroundOverlay = styled.div`
  display: none;
`;



const TopControls = styled.div`
  padding: ${spacing.md};
  background: white;
  border-bottom: 1px solid ${colors.neutral[200]};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BackButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid ${colors.neutral[200]};
  border-radius: ${borderRadius.full};
  color: ${colors.neutral[600]};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${colors.neutral[50]};
    color: ${colors.neutral[900]};
    transform: translateX(-2px);
  }
`;

const BackIcon = styled.span`
  font-size: ${typography.fontSize.lg};
`;

const ControlBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${spacing.md};
  position: relative;
`;

const DateControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  background: ${colors.neutral[50]};
  padding: 4px;
  border-radius: ${borderRadius.full};
  border: 1px solid ${colors.neutral[200]};
`;

const NavButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: white;
  color: ${colors.neutral[600]};
  font-size: ${typography.fontSize.lg};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${shadows.sm};
  transition: all 0.2s;
  
  &:hover {
    background: ${colors.primary[50]};
    color: ${colors.primary[600]};
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const SelectGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: 0 ${spacing.sm};
`;

const Select = styled.select`
  appearance: none;
  background: transparent;
  border: none;
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[800]};
  cursor: pointer;
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${borderRadius.md};
  text-align: center;
  
  &:hover {
    background: ${colors.neutral[200]};
  }
  
  &:focus {
    outline: none;
  }
`;

const TodayButton = styled.button`
  position: absolute;
  right: 0;
  padding: ${spacing.xs} ${spacing.md};
  background: ${colors.primary[600]};
  color: white;
  border: none;
  border-radius: ${borderRadius.full};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.bold};
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${shadows.sm};
  
  &:hover {
    background: ${colors.primary[700]};
    transform: translateY(-1px);
  }
  
  ${media['max-md']} {
    position: static;
  }
`;

const MainContent = styled.main`
  max-width: 100%; // Full width
  margin: 0 auto;
  padding: ${spacing.md};
  padding-bottom: 80px; // Footer/Bottom spacing
  
  ${media['max-md']} {
    padding: 0;
  }
`;

const CalendarSection = styled.section`
  animation: ${slideUp} 0.5s ease-out;
`;

const CalendarCard = styled.div`
  background: white;
  border-radius: ${borderRadius.xl};
  box-shadow: ${shadows.sm};
  border: 1px solid ${colors.neutral[200]};
  overflow: hidden;
`;

const CalendarContainer = styled.div`
  padding: 0; // Remove padding entirely
  height: calc(100vh - 140px); // Maximize height minus header
  
  ${media['max-md']} {
    padding: 0;
    height: calc(100vh - 120px);
  }
  
  .rbc-calendar {
    width: 100%;
    height: 100% !important;
    font-family: ${typography.fontFamily.body};
  }
  
  .rbc-month-view {
    border: none; // Remove outer border
    border-top: 1px solid ${colors.neutral[200]};
    border-radius: 0;
  }
  
  .rbc-header {
    padding: 4px 0; // Compact header
    font-size: ${typography.fontSize.xs};
    font-weight: ${typography.fontWeight.bold};
    color: ${colors.neutral[600]};
    background: ${colors.neutral[50]};
    border-bottom: 1px solid ${colors.neutral[200]};
    
    &:first-child { color: ${colors.error[600]}; }
    &:last-child { color: ${colors.primary[600]}; }
  }
  
  .rbc-date-cell {
    padding: 2px 4px; // tighter padding for date number
    font-size: 11px; // smaller date number
    font-weight: ${typography.fontWeight.medium};
    color: ${colors.neutral[500]};
    
    position: relative; // For z-index
    z-index: 1;

    &:first-child { color: ${colors.error[500]}; }
    &:last-child { color: ${colors.primary[500]}; }
  }
  
  .rbc-today {
    background-color: ${colors.primary[50]} !important;
  }
  
  .rbc-today > .rbc-date-cell > a { // Assuming 'a' is the number
    background: ${colors.primary[600]};
    color: white !important;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin: 0 auto;
  }
  
  .rbc-event {
    border-radius: 2px;
    margin: 1px 2px;
    box-shadow: none;
    transition: transform 0.1s;
    font-size: 10px;
    font-weight: 600;
    padding: 0 2px;
    line-height: 1;
    display: flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 16px;
    margin-top: 1px;
    
    &:hover {
      transform: scale(1.02);
      z-index: 10;
    }

    ${media['max-md']} {
        font-size: 9px !important; // Adjusted to 9px as requested
        height: 15px; // Reduced height
        padding: 0 1px;
    }
  }
  
  .rbc-off-range-bg {
    background: ${colors.neutral[50]};
  }
`;

const LoadingSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: ${colors.neutral[400]};
  gap: ${spacing.md};
`;

const LoadingIcon = styled.div`
  font-size: ${typography.fontSize['3xl']};
  animation: ${float} 2s ease-in-out infinite;
`;

const LoadingText = styled.div`
  font-size: ${typography.fontSize.md};
`;

// Modal Styles
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: ${spacing.md};
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 400px;
  border-radius: ${borderRadius['2xl']};
  box-shadow: ${shadows['2xl']};
  position: relative;
  overflow: hidden;
  animation: ${slideUp} 0.3s ease-out;
`;

const ModalBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: ${colors.neutral[50]};
  z-index: 0;
`;

const ModalHeader = styled.div`
  padding: ${spacing.xl};
  position: relative;
  z-index: 1;
  text-align: center;
`;

const EventTitleSection = styled.div`
  margin-bottom: ${spacing.md};
`;

const EventIcon = styled.div`
  font-size: ${typography.fontSize['4xl']};
  margin-bottom: ${spacing.sm};
  animation: ${float} 3s ease-in-out infinite;
`;

const EventTitle = styled.h2`
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
  margin: 0;
`;

const EventTypeTag = styled.div`
  display: inline-block;
  padding: 4px 12px;
  background: white;
  border-radius: ${borderRadius.full};
  box-shadow: ${shadows.sm};
  border: 1px solid ${colors.neutral[200]};
`;

const TagText = styled.span`
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[600]};
`;

const EventDetails = styled.div`
  padding: 0 ${spacing.xl} ${spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
  position: relative;
  z-index: 1;
`;

const DetailCard = styled.div`
  background: ${colors.neutral[50]};
  padding: ${spacing.md};
  border-radius: ${borderRadius.lg};
  display: flex;
  gap: ${spacing.md};
  border: 1px solid ${colors.neutral[100]};
`;

const DetailIcon = styled.div`
  font-size: ${typography.fontSize.lg};
`;

const DetailContent = styled.div`
  flex: 1;
`;

const DetailLabel = styled.div`
  font-size: 10px;
  color: ${colors.neutral[500]};
  font-weight: ${typography.fontWeight.bold};
  text-transform: uppercase;
  margin-bottom: 2px;
`;

const DetailValue = styled.div`
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[800]};
  font-weight: ${typography.fontWeight.medium};
`;

const DetailDescription = styled.div`
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[700]};
  line-height: 1.5;
  white-space: pre-wrap;
`;

const ModalFooter = styled.div`
  padding: ${spacing.md} ${spacing.xl} ${spacing.xl};
`;

const CloseButton = styled.button`
  width: 100%;
  padding: ${spacing.md};
  border-radius: ${borderRadius.xl};
  border: none;
  background: ${colors.neutral[900]};
  color: white;
  font-weight: ${typography.fontWeight.bold};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: black;
    transform: translateY(-1px);
  }
`;

export default ChurchSchedule;
