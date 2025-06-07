import React, { useState, useEffect, useRef } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ko from 'date-fns/locale/ko';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';

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
    bgColor: colors.primary[100], 
    color: colors.primary[700],
    gradient: colors.gradients.primary 
  },
  BIRTHDAY: { 
    label: '생일', 
    bgColor: colors.accent[100], 
    color: colors.accent[700],
    gradient: colors.gradients.accent 
  },
  MEETING: { 
    label: '모임', 
    bgColor: colors.secondary[100], 
    color: colors.secondary[700],
    gradient: colors.gradients.secondary 
  },
  ACTIVITY: { 
    label: '활동', 
    bgColor: colors.success[100], 
    color: colors.success[700],
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
  },
  EVENT: { 
    label: '행사', 
    bgColor: colors.warning[100], 
    color: colors.warning[700],
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
  },
  HOLIDAY: { 
    label: '공휴일', 
    bgColor: colors.error[100], 
    color: colors.error[700],
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
  }
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

  const getEventCount = () => {
    const today = new Date();
    const todayEvents = events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === today.toDateString();
    });
    return todayEvents.length;
  };

  return (
    <Container>
      <BackgroundOverlay />
      
      <Header>
        <HeaderContent>
          <NavigationSection>
            <BackButton onClick={() => navigate('/')}>
              <BackIcon>←</BackIcon>
              <BackText>홈으로</BackText>
            </BackButton>
          </NavigationSection>
          
          <TitleSection>
            <HeaderIconContainer>
              <HeaderIcon onClick={handleTitleClick}>📅</HeaderIcon>
              <IconRing />
            </HeaderIconContainer>
            <TitleGroup>
              <Title onClick={handleTitleClick}>일정표</Title>
              <DateDisplay>
                {format(date, 'yyyy년 M월')}
              </DateDisplay>
            </TitleGroup>
          </TitleSection>

          <StatsSection>
            <StatCard>
              <StatNumber>{events.length}</StatNumber>
              <StatLabel>전체 일정</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{getEventCount()}</StatNumber>
              <StatLabel>오늘 일정</StatLabel>
            </StatCard>
          </StatsSection>
        </HeaderContent>
      </Header>

      <MainContent>
        <CalendarSection>
          <CalendarCard>
            <CardGradient />
            <CalendarContainer
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {isLoading ? (
                <LoadingSection>
                  <LoadingIcon>📅</LoadingIcon>
                  <LoadingText>일정을 불러오는 중...</LoadingText>
                  <LoadingDots>
                    <Dot delay={0} />
                    <Dot delay={0.2} />
                    <Dot delay={0.4} />
                  </LoadingDots>
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
                  eventPropGetter={event => {
                    const eventType = EVENT_TYPES[event.type] || EVENT_TYPES.DEFAULT;
                    return {
                      style: {
                        backgroundColor: eventType.bgColor,
                        color: eventType.color,
                        border: `2px solid ${eventType.color}`,
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500'
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
                   selectedEvent.type === 'EVENT' ? '🎉' :
                   selectedEvent.type === 'HOLIDAY' ? '🏖️' : '📅'}
                </EventIcon>
                <EventTitle>{selectedEvent.title}</EventTitle>
              </EventTitleSection>
              <EventTypeTag eventType={selectedEvent.type || 'DEFAULT'}>
                <TagGradient eventType={selectedEvent.type || 'DEFAULT'} />
                <TagText>
                  {EVENT_TYPES[selectedEvent.type]?.label || EVENT_TYPES.DEFAULT.label}
                </TagText>
              </EventTypeTag>
            </ModalHeader>

            <EventDetails>
              <DetailCard>
                <DetailIcon>📅</DetailIcon>
                <DetailContent>
                  <DetailLabel>날짜</DetailLabel>
                  <DetailValue>
                    {format(selectedEvent.start, 'yyyy년 MM월 dd일 (eee)', { locale: ko })}
                    {format(selectedEvent.start, 'yyyy-MM-dd') !== format(selectedEvent.end, 'yyyy-MM-dd') && 
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
                <CloseIcon>✕</CloseIcon>
                <CloseText>닫기</CloseText>
              </CloseButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

// 애니메이션
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const ringPulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
`;

const dotBounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

// 스타일 컴포넌트
const Container = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
`;

const BackgroundOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  z-index: -2;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 70% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 20% 70%, rgba(139, 92, 246, 0.03) 0%, transparent 50%);
  }
`;

const Header = styled.header`
  background: ${colors.gradients.primary};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  }
`;

const HeaderContent = styled.div`
  position: relative;
  padding: ${spacing['3xl']} ${spacing['2xl']} ${spacing['2xl']};
  max-width: 1200px;
  margin: 0 auto;
  
  ${media['max-md']} {
    padding: ${spacing['2xl']} ${spacing.lg};
  }
`;

const NavigationSection = styled.div`
  margin-bottom: ${spacing.xl};
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${borderRadius.lg};
  padding: ${spacing.sm} ${spacing.lg};
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const BackIcon = styled.span`
  font-size: ${typography.fontSize.lg};
`;

const BackText = styled.span`
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: ${spacing['2xl']};
`;

const HeaderIconContainer = styled.div`
  position: relative;
  margin-bottom: ${spacing.lg};
`;

const HeaderIcon = styled.div`
  font-size: ${typography.fontSize['4xl']};
  cursor: pointer;
  animation: ${float} 3s ease-in-out infinite, ${fadeInUp} 0.8s ease-out;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  position: relative;
  z-index: 1;
  
  &:hover {
    animation-play-state: paused;
  }
  
  ${media['max-md']} {
    font-size: ${typography.fontSize['3xl']};
  }
`;

const IconRing = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: ${borderRadius.full};
  animation: ${ringPulse} 2s ease-out infinite;
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.sm};
`;

const Title = styled.h1`
  color: white;
  font-size: ${typography.fontSize['3xl']};
  font-weight: ${typography.fontWeight.extrabold};
  margin: 0;
  font-family: ${typography.fontFamily.heading};
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
  
  ${media['max-md']} {
    font-size: ${typography.fontSize['2xl']};
  }
`;

const DateDisplay = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.medium};
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.lg};
  }
`;

const StatsSection = styled.div`
  display: flex;
  justify-content: center;
  gap: ${spacing.lg};
  animation: ${fadeInUp} 0.8s ease-out 0.6s both;
  
  ${media['max-md']} {
    gap: ${spacing.md};
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${borderRadius.xl};
  padding: ${spacing.lg} ${spacing.xl};
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.25);
  }
  
  ${media['max-md']} {
    padding: ${spacing.md} ${spacing.lg};
  }
`;

const StatNumber = styled.div`
  color: white;
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.xs};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.xl};
  }
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${spacing['2xl']} ${spacing.lg};
  
  ${media['max-md']} {
    padding: ${spacing.xl} ${spacing.md};
  }
`;

const CalendarSection = styled.section`
  animation: ${fadeInUp} 0.8s ease-out 0.8s both;
`;

const CalendarCard = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${borderRadius['2xl']};
  box-shadow: ${shadows.lg};
  overflow: hidden;
  transition: all 0.4s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${shadows['2xl']};
  }
`;

const CardGradient = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: ${colors.gradients.primary};
`;

const CalendarContainer = styled.div`
  padding: ${spacing['2xl']};
  height: 600px;
  touch-action: pan-y pinch-zoom;
  
  ${media['max-md']} {
    padding: ${spacing.lg};
    height: 500px;
  }
  
  .rbc-calendar {
    width: 100%;
    height: 100% !important;
    font-family: ${typography.fontFamily.body};
  }
  
  .rbc-month-view {
    border: none;
    margin: 0;
    width: 100%;
  }
  
  .rbc-month-row {
    min-height: 80px;
    border-bottom: 1px solid ${colors.neutral[200]};
    
    ${media['max-md']} {
      min-height: 60px;
    }
  }
  
  .rbc-row {
    margin: 0;
  }

  .rbc-header {
    padding: ${spacing.md} 0;
    text-align: center;
    font-size: ${typography.fontSize.sm};
    font-weight: ${typography.fontWeight.semibold};
    border: none !important;
    background: ${colors.neutral[50]};
    color: ${colors.neutral[700]};
    
    &:first-child {
      color: ${colors.error[600]};
    }
    &:last-child {
      color: ${colors.primary[600]};
    }
  }
  
  .rbc-date-cell {
    padding: ${spacing.xs};
    text-align: center;
    border-right: 1px solid ${colors.neutral[200]};
    
    > a {
      font-size: ${typography.fontSize.sm};
      font-weight: ${typography.fontWeight.medium};
      margin: 0;
      padding: ${spacing.xs};
      display: inline-block;
      color: ${colors.neutral[700]};
      border-radius: ${borderRadius.sm};
      transition: all 0.2s ease;
      
      &:hover {
        background: ${colors.primary[50]};
        color: ${colors.primary[700]};
      }
    }
    
    &:first-child > a {
      color: ${colors.error[600]};
    }
    &:last-child > a {
      color: ${colors.primary[600]};
    }
  }
  
  .rbc-today > a {
    background: ${colors.primary[100]} !important;
    color: ${colors.primary[700]} !important;
    font-weight: ${typography.fontWeight.bold} !important;
  }
  
  .rbc-event {
    margin: 1px;
    padding: 2px 4px;
    width: calc(100% - 2px) !important;
    font-size: ${typography.fontSize.xs};
    font-weight: ${typography.fontWeight.medium};
    border: none;
    border-radius: ${borderRadius.sm};
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-1px);
      opacity: 0.9;
    }
  }
  
  .rbc-row-segment {
    padding: 0;
  }
  
  .rbc-show-more {
    margin: 0;
    padding: 2px 4px;
    background-color: transparent;
    color: ${colors.neutral[500]};
    text-align: center;
    font-size: ${typography.fontSize.xs};
  }
  
  .rbc-month-view,
  .rbc-month-row,
  .rbc-date-cell,
  .rbc-day-bg {
    border: none !important;
  }
  
  .rbc-toolbar {
    display: none;
  }
`;

const LoadingSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: ${colors.primary[600]};
  gap: ${spacing.lg};
`;

const LoadingIcon = styled.div`
  font-size: ${typography.fontSize['3xl']};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const LoadingText = styled.p`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.medium};
  margin: 0;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: ${spacing.sm};
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  background: ${colors.primary[400]};
  border-radius: ${borderRadius.full};
  animation: ${dotBounce} 1.4s ease-in-out infinite ${props => props.delay}s both;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: ${spacing.lg};
  animation: ${fadeInUp} 0.3s ease;
`;

const ModalContent = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  animation: ${slideUp} 0.4s ease;
`;

const ModalBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${borderRadius['2xl']};
  box-shadow: ${shadows['2xl']};
`;

const ModalHeader = styled.div`
  position: relative;
  z-index: 1;
  padding: ${spacing['2xl']} ${spacing['2xl']} ${spacing.xl};
  border-bottom: 1px solid ${colors.neutral[200]};
  
  ${media['max-md']} {
    padding: ${spacing.xl} ${spacing.xl} ${spacing.lg};
  }
`;

const EventTitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.lg};
  margin-bottom: ${spacing.lg};
`;

const EventIcon = styled.div`
  font-size: ${typography.fontSize['2xl']};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.xl};
  }
`;

const EventTitle = styled.h2`
  color: ${colors.neutral[800]};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  margin: 0;
  flex: 1;
  font-family: ${typography.fontFamily.heading};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.lg};
  }
`;

const EventTypeTag = styled.div`
  position: relative;
  padding: ${spacing.sm} ${spacing.lg};
  border-radius: ${borderRadius.full};
  overflow: hidden;
`;

const TagGradient = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => EVENT_TYPES[props.eventType]?.gradient || EVENT_TYPES.DEFAULT.gradient};
`;

const TagText = styled.span`
  position: relative;
  z-index: 1;
  color: white;
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const EventDetails = styled.div`
  position: relative;
  z-index: 1;
  padding: 0 ${spacing['2xl']} ${spacing.xl};
  
  ${media['max-md']} {
    padding: 0 ${spacing.xl} ${spacing.lg};
  }
`;

const DetailCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.lg};
  padding: ${spacing.lg};
  margin-bottom: ${spacing.lg};
  background: ${colors.neutral[50]};
  border-radius: ${borderRadius.xl};
  border-left: 4px solid ${colors.primary[400]};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${colors.neutral[100]};
    transform: translateX(4px);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
  
  ${media['max-md']} {
    padding: ${spacing.md};
    gap: ${spacing.md};
  }
`;

const DetailIcon = styled.div`
  font-size: ${typography.fontSize.lg};
  margin-top: 2px;
  flex-shrink: 0;
`;

const DetailContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

const DetailLabel = styled.span`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.span`
  color: ${colors.neutral[800]};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.medium};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.sm};
  }
`;

const DetailDescription = styled.p`
  color: ${colors.neutral[700]};
  font-size: ${typography.fontSize.base};
  line-height: ${typography.lineHeight.relaxed};
  white-space: pre-wrap;
  margin: 0;
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.sm};
  }
`;

const ModalFooter = styled.div`
  position: relative;
  z-index: 1;
  padding: ${spacing.xl} ${spacing['2xl']} ${spacing['2xl']};
  border-top: 1px solid ${colors.neutral[200]};
  
  ${media['max-md']} {
    padding: ${spacing.lg} ${spacing.xl} ${spacing.xl};
  }
`;

const CloseButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  padding: ${spacing.lg};
  background: ${colors.gradients.primary};
  color: white;
  border: none;
  border-radius: ${borderRadius.xl};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${shadows.sm};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  ${media['max-md']} {
    padding: ${spacing.md};
  }
`;

const CloseIcon = styled.span`
  font-size: ${typography.fontSize.lg};
`;

const CloseText = styled.span``;

export default Calendar;