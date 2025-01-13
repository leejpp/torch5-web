import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ko from 'date-fns/locale/ko';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import UserLayout from '../../layouts/UserLayout';
import { db } from '../../firebase/config';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

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

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <UserLayout>
      <Container>
        <Header>
          <TitleSection>
            <HomeButton to="/">← 홈으로</HomeButton>
            <Title>일정</Title>
          </TitleSection>
        </Header>
        <CalendarContainer>
          {isLoading ? (
            <LoadingSpinner>일정을 불러오는 중...</LoadingSpinner>
          ) : (
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              culture='ko'
              onSelectEvent={handleEventSelect}
              views={['month']}
              defaultView="month"
              formats={{
                dateFormat: 'dd',
                monthHeaderFormat: 'yyyy년 MM월'
              }}
              messages={{
                next: "다음",
                previous: "이전",
                today: "오늘",
                month: "월"
              }}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: '#FFB6C1',
                  color: 'white'
                }
              })}
              dayPropGetter={date => {
                const isSunday = date.getDay() === 0;
                if (isSunday) {
                  return {
                    style: {
                      color: '#ff4444'
                    }
                  };
                }
              }}
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
    </UserLayout>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const HomeButton = styled(Link)`
  color: #666;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-size: 1rem;
  
  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const CalendarContainer = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  .rbc-calendar {
    font-family: inherit;
    position: relative;
    z-index: 1;
  }
  
  .rbc-header {
    padding: 10px;
    font-weight: bold;
    
    &:first-child {
      color: #ff4444;
    }
  }
  
  .rbc-event {
    background-color: #FFB6C1;
    border: none;
    border-radius: 3px;
  }

  .rbc-date-cell {
    &.rbc-sun {
      color: #ff4444;
    }
  }

  .rbc-row-content {
    .rbc-row {
      .rbc-date-cell:first-child {
        color: #ff4444;
      }
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
`;

const EventDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5rem 0;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const Label = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const Value = styled.span`
  color: #333;
  font-size: 1rem;
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