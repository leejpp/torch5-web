import React, { useState, useEffect, useRef } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ko from 'date-fns/locale/ko';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { theme } from '../../styles/theme';

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
  DEFAULT: { label: '기본', bgColor: '#4285F4', color: 'white' },
  BIRTHDAY: { label: '생일', bgColor: '#E6E6FA', color: '#6A5ACD' },  // 보라색
  MEETING: { label: '모임', bgColor: '#E0F4FF', color: '#0066FF' },   // 파란색
  ACTIVITY: { label: '활동', bgColor: '#E8F5E9', color: '#2E7D32' },  // 초록색
  EVENT: { label: '행사', bgColor: '#FFF3CD', color: '#856404' },     // 노란색
  HOLIDAY: { label: '공휴일', bgColor: '#FFEBEE', color: '#D32F2F' }  // 빨간색
};

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const calendarRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

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
      setEvents(eventsList);
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

  const handleTitleClick = () => {
    setDate(new Date());
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      const newDate = new Date(date);
      if (diff > 0) {
        newDate.setMonth(date.getMonth() + 1);
      } else {
        newDate.setMonth(date.getMonth() - 1);
      }
      setDate(newDate);
    }
    setTouchStart(null);
  };

  return (
    <Container>
      <Header>
        <TitleSection>
          <HomeButton onClick={() => navigate('/')}>← 홈으로</HomeButton>
          <TitleWrapper>
            <Title onClick={handleTitleClick}>일정</Title>
            <CurrentDate>
              {format(date, 'yyyy년 M월')}
            </CurrentDate>
          </TitleWrapper>
        </TitleSection>
      </Header>
      <CalendarContainer
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {isLoading ? (
          <LoadingSpinner>일정을 불러오는 중...</LoadingSpinner>
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
            eventPropGetter={event => {
              const eventType = EVENT_TYPES[event.type] || EVENT_TYPES.DEFAULT;
              return {
                style: {
                  backgroundColor: eventType.bgColor,
                  color: eventType.color
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
                  backgroundColor: isToday ? '#e7f0ff' : 'white',
                  color: isSunday ? '#ff4444' : '#333'
                }
              };
            }}
            date={date}
            onNavigate={newDate => setDate(newDate)}
          />
        )}
      </CalendarContainer>

      {isModalOpen && selectedEvent && (
        <Modal onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h2>{selectedEvent.title}</h2>
            <EventDetails>
              <DetailItem>
                <Label>날짜</Label>
                <Value>
                  {format(selectedEvent.start, 'yyyy년 MM월 dd일')}
                  {format(selectedEvent.start, 'yyyy-MM-dd') !== format(selectedEvent.end, 'yyyy-MM-dd') && 
                    ` ~ ${format(selectedEvent.end, 'yyyy년 MM월 dd일')}`
                  }
                </Value>
              </DetailItem>
              <DetailItem>
                <Label>타입</Label>
                <Value>{EVENT_TYPES[selectedEvent.type]?.label || EVENT_TYPES.DEFAULT.label}</Value>
              </DetailItem>
              {selectedEvent.location && (
                <DetailItem>
                  <Label>장소</Label>
                  <Value>{selectedEvent.location}</Value>
                </DetailItem>
              )}
              {selectedEvent.description && (
                <DetailItem>
                  <Label>설명</Label>
                  <Description>{selectedEvent.description}</Description>
                </DetailItem>
              )}
            </EventDetails>
            <CloseButton onClick={() => setIsModalOpen(false)}>
              닫기
            </CloseButton>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${theme.colors.background};
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 0;
  }
`;

const Header = styled.header`
  background-color: ${theme.colors.primary};
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: ${theme.borderRadius.lg};
  margin: 1rem 1rem 2rem;
  box-shadow: ${theme.shadows.sm};
  
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    margin: 0.5rem 0.5rem 1rem;
  }
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  justify-content: center;
  position: relative;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const CurrentDate = styled.span`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
`;

const HomeButton = styled.button`
  color: white;
  text-decoration: none;
  font-size: 1rem;
  display: flex;
  align-items: center;
  position: absolute;
  left: 0;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  background: none;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0.4rem 0.8rem;
  }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:active {
    opacity: 0.6;
  }
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CalendarContainer = styled.div`
  flex: 1;
  background-color: white;
  touch-action: pan-y pinch-zoom;
  
  .rbc-calendar {
    width: 100%;
    height: 100% !important;
  }
  
  .rbc-month-view {
    border: none;
    margin: 0;
    width: 100%;
  }
  
  .rbc-month-row {
    min-height: 120px;
  }
  
  .rbc-row {
    margin: 0;
  }

  .rbc-header {
    padding: 8px 0;
    text-align: center;
    font-size: 0.9rem;
    border: none !important;
    
    &:first-child {
      color: #ff4444;
    }
    &:last-child {
      color: #0066ff;
    }
  }
  
  .rbc-date-cell {
    padding: 4px;
    text-align: center;
    
    > a {
      font-size: 0.9rem;
      margin: 0;
      padding-top: 4px;
      display: inline-block;
      color: #333;
    }
    
    &:first-child > a {
      color: #ff4444;
    }
    &:last-child > a {
      color: #0066ff;
    }
  }
  
  .rbc-event {
    margin: 0;
    padding: 2px 4px;
    width: calc(100% - 2px) !important;
    font-size: 0.85rem;
    border: none;
    border-radius: 2px;
  }
  
  .rbc-row-segment {
    padding: 0;
  }
  
  .rbc-show-more {
    margin: 0;
    padding: 2px 4px;
    background-color: transparent;
    color: #666;
    text-align: center;
  }
  
  .rbc-month-view,
  .rbc-month-row,
  .rbc-date-cell,
  .rbc-day-bg {
    border: none !important;
  }
  
  .rbc-month-row + .rbc-month-row {
    border-top: 1px solid #eee;
  }
  
  .rbc-toolbar {
    display: none;
  }
  
  @media (max-width: 768px) {
    padding: 0;
    
    .rbc-calendar {
      height: calc(100vh - 60px) !important;
    }
    
    .rbc-header {
      padding: 8px 0;
      font-size: 0.85rem;
    }
    
    .rbc-date-cell > a {
      font-size: 0.85rem;
    }
    
    .rbc-event {
      padding: 1px 2px;
      margin: 0;
      font-size: 0.8rem;
    }
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: #666;
  font-size: 1.2rem;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 600px;
  position: relative;
  z-index: 1001;

  @media (max-width: 768px) {
    width: 90%;
    margin: 10px;
    padding: 1.2rem;
    
    h2 {
      font-size: 1.2rem;
      margin-bottom: 0.8rem;
    }
  }
`;

const EventDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5rem 0;

  @media (max-width: 768px) {
    gap: 0.8rem;
    margin: 1rem 0;
  }
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  @media (max-width: 768px) {
    gap: 0.2rem;
  }
`;

const Label = styled.span`
  color: #666;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const Value = styled.span`
  color: #333;
  font-size: 1rem;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const Description = styled.p`
  color: #333;
  font-size: 1rem;
  white-space: pre-wrap;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 100%;
  padding: 0.8rem;
  background-color: #f0f0f0;
  border: none;
  border-radius: 5px;
  color: #666;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

export default Calendar;