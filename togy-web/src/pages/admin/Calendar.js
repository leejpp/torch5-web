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
import { db } from '../../firebase/config';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch, where } from 'firebase/firestore';

const locales = { 'ko': ko };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// 반복 유형 상수 수정
const REPEAT_TYPES = {
  NONE: 'NONE',
  YEARLY: 'YEARLY'      // 매년 반복만 남김
};

// 상수 추가
const EVENT_TYPES = {
  DEFAULT: { label: '기본', bgColor: '#FFB6C1', color: 'white' },
  BIRTHDAY: { label: '생일', bgColor: '#E6E6FA', color: '#6A5ACD' },  // 보라색
  MEETING: { label: '모임', bgColor: '#E0F4FF', color: '#0066FF' },   // 파란색
  ACTIVITY: { label: '활동', bgColor: '#E8F5E9', color: '#2E7D32' },  // 초록색 (기존 행사)
  EVENT: { label: '행사', bgColor: '#FFF3CD', color: '#856404' },     // 노란색 (새로 추가)
  HOLIDAY: { label: '공휴일', bgColor: '#FFEBEE', color: '#D32F2F' }  // 빨간색
};

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    description: '',
    location: '',
    type: 'DEFAULT',  // 기본 타입 추가
    repeat: {
      type: REPEAT_TYPES.NONE
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showMoreEvents, setShowMoreEvents] = useState({ isOpen: false, date: null, events: [] });
  const [deleteOption, setDeleteOption] = useState('single'); // 'single' or 'all'
  const [date, setDate] = useState(new Date());
  const [touchStart, setTouchStart] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
  }, [isModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        const newDate = new Date(date);
        newDate.setMonth(date.getMonth() - 1);
        setDate(newDate);
      } else if (e.key === 'ArrowRight') {
        const newDate = new Date(date);
        newDate.setMonth(date.getMonth() + 1);
        setDate(newDate);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [date]);

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

  const handleSelect = ({ start }) => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      start: format(new Date(start), "yyyy-MM-dd"),
      end: format(new Date(start), "yyyy-MM-dd"),
      description: '',
      location: '',
      type: 'DEFAULT',
      repeat: {
        type: REPEAT_TYPES.NONE
      }
    });
    setIsModalOpen(true);
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      start: format(event.start, "yyyy-MM-dd"),
      end: format(event.end, "yyyy-MM-dd"),
      description: event.description || '',
      location: event.location || '',
      type: event.type || 'DEFAULT',
      repeat: event.repeat || { type: REPEAT_TYPES.NONE }
    });
    setIsModalOpen(true);
  };

  // 반복 일정 생성 함수 수정 (매년 반복만 처리)
  const generateRecurringEvents = (baseEvent, repeat, until) => {
    const repeatGroupId = crypto.randomUUID();
    
    // 첫 번째 일정에도 반복 속성 추가
    const firstEvent = {
      ...baseEvent,
      repeatGroupId,
      isRecurring: true
    };
    
    const events = [firstEvent];  // 수정된 첫 번째 일정 추가
    const startDate = new Date(baseEvent.start);
    const endDate = new Date(baseEvent.end);
    const duration = endDate - startDate;

    // 매년 반복 처리
    for (let year = startDate.getFullYear() + 1; year <= until.getFullYear() + 5; year++) {
      const newStart = new Date(startDate);
      newStart.setFullYear(year);
      const newEnd = new Date(newStart.getTime() + duration);
      events.push({ 
        ...baseEvent, 
        start: newStart, 
        end: newEnd,
        repeatGroupId,
        isRecurring: true
      });
    }
    return events;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const eventData = {
        title: formData.title,
        start: new Date(formData.start.split('T')[0]),
        end: new Date(formData.end.split('T')[0]),
        allDay: true,
        description: formData.description,
        location: formData.location,
        type: formData.type,  // 타입 추가
        repeat: formData.repeat
      };

      if (formData.repeat.type !== REPEAT_TYPES.NONE) {
        // 1년치 반복복 일정 생성
        const until = new Date();
        until.setFullYear(until.getFullYear() + 1);
        
        const recurringEvents = generateRecurringEvents(eventData, formData.repeat, until);
        
        // 모든 반복 일정을 Firebase에 저장
        const batch = writeBatch(db);
        recurringEvents.forEach(event => {
          const docRef = doc(collection(db, 'events'));
          batch.set(docRef, event);
        });
        await batch.commit();
        showMessage('success', '반복 일정이 생성되었습니다.');
      } else {
        if (selectedEvent) {
          await updateDoc(doc(db, 'events', selectedEvent.id), eventData);
          showMessage('success', '일정이 수정되었습니다.');
        } else {
          await addDoc(collection(db, 'events'), eventData);
          showMessage('success', '새 일정이 추가되었습니다.');
        }
      }

      await fetchEvents();
      setIsModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
      showMessage('error', '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    try {
      if (selectedEvent?.isRecurring && deleteOption === 'all') {
        // 모든 반복 일정 삭제
        const q = query(
          collection(db, 'events'), 
          where('repeatGroupId', '==', selectedEvent.repeatGroupId)
        );
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        showMessage('success', '모든 반복 일정이 삭제되었습니다.');
      } else {
        // 단일 일정 삭제
        await deleteDoc(doc(db, 'events', selectedEvent.id));
        showMessage('success', '일정이 삭제되었습니다.');
      }
      await fetchEvents();
      setIsModalOpen(false);
      setIsDeleteModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      showMessage('error', '삭제 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showMessage = (type, content) => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 3000);
  };

  // 일정 더보기 핸들러 추가
  const handleShowMore = (events, date) => {
    setShowMoreEvents({
      isOpen: true,
      date,
      events
    });
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

  const CustomToolbar = ({ onNavigate }) => (
    <ToolbarWrapper>
      <ToolbarButton onClick={() => onNavigate('PREV')}>◀</ToolbarButton>
      <ToolbarButton onClick={() => onNavigate('NEXT')}>▶</ToolbarButton>
    </ToolbarWrapper>
  );

  const ToolbarWrapper = styled.div`
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
  `;

  const ToolbarButton = styled.button`
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 5px;
    background-color: #f0f0f0;
    cursor: pointer;
    
    &:hover {
      background-color: #e0e0e0;
    }
  `;

  return (
    <Container>
      <Header>
        <TitleSection>
          <HomeButton to="/admin">← 홈으로</HomeButton>
          <TitleWrapper>
            <Title onClick={handleTitleClick}>일정 관리</Title>
            <CurrentDate>{format(date, 'yyyy년 M월')}</CurrentDate>
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
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            culture='ko'
            selectable={true}
            onSelectSlot={handleSelect}
            onSelectEvent={handleEventSelect}
            views={['month']}
            defaultView="month"
            toolbar={true}
            formats={{
              monthHeaderFormat: 'yyyy년 MM월',
              dayHeaderFormat: 'eee',
              dayRangeHeaderFormat: ({ start, end }) =>
                `${format(start, 'MM월 dd일')} - ${format(end, 'MM월 dd일')}`,
            }}
            messages={{
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
              const isSaturday = date.getDay() === 6;
              
              return {
                style: {
                  cursor: 'pointer',
                  backgroundColor: isToday ? '#FFF9F9' : 'white',
                  color: isSunday ? '#ff4444' : isSaturday ? '#0066ff' : '#333'  // 일요일, 토요일 날짜 색상
                }
              };
            }}
            date={date}
            onNavigate={newDate => setDate(newDate)}
            draggableAccessor={() => false}  // 드래그 비활성화
            longPressThreshold={20}  // 터치 감지 시간을 매우 짧게 설정
            components={{
              dateCellWrapper: props => (
                <div
                  onClick={() => handleSelect({ start: props.value })}
                  style={{ height: '100%' }}
                >
                  {props.children}
                </div>
              )
            }}
          />
        )}
      </CalendarContainer>

      {isModalOpen && (
        <Modal onClick={(e) => {
          e.stopPropagation();
        }}>
          <ModalContent>
            <h2>{selectedEvent ? '일정 수정' : '새 일정'}</h2>
            <Form onSubmit={handleSubmit}>
              <InputGroup>
                <Label>제목</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </InputGroup>
              <InputGroup>
                <Label>시작 날짜</Label>
                <Input
                  type="date"
                  value={formData.start}
                  onChange={(e) => setFormData({...formData, start: e.target.value})}
                  required
                />
              </InputGroup>
              <InputGroup>
                <Label>종료 날짜</Label>
                <Input
                  type="date"
                  value={formData.end}
                  onChange={(e) => setFormData({...formData, end: e.target.value})}
                  required
                />
              </InputGroup>
              <InputGroup>
                <Label>설명</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </InputGroup>
              <InputGroup>
                <Label>장소</Label>
                <Input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </InputGroup>
              <InputGroup>
                <Label>일정 타입</Label>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  {Object.entries(EVENT_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </Select>
              </InputGroup>
              <InputGroup>
                <Label>반복</Label>
                <Select
                  value={formData.repeat.type}
                  onChange={(e) => setFormData({
                    ...formData,
                    repeat: { type: e.target.value }
                  })}
                >
                  <option value={REPEAT_TYPES.NONE}>반복 안함</option>
                  <option value={REPEAT_TYPES.YEARLY}>매년</option>
                </Select>
              </InputGroup>
              <ButtonGroup>
                <SubmitButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <LoadingSpinnerSmall />
                  ) : (
                    selectedEvent ? '수정' : '추가'
                  )}
                </SubmitButton>
                {selectedEvent && (
                  <DeleteButton 
                    type="button" 
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <LoadingSpinnerSmall /> : '삭제'}
                  </DeleteButton>
                )}
                <CancelButton 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  취소
                </CancelButton>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmModal>
          <DeleteModalContent>
            <h3>일정 삭제</h3>
            <p>정말 이 일정을 삭제하시겠습니까?</p>
            <p><strong>{selectedEvent?.title}</strong></p>
            
            {selectedEvent?.isRecurring && (
              <DeleteOptions>
                <RadioGroup>
                  <RadioOption>
                    <input
                      type="radio"
                      id="single"
                      name="deleteOption"
                      value="single"
                      checked={deleteOption === 'single'}
                      onChange={(e) => setDeleteOption(e.target.value)}
                    />
                    <label htmlFor="single">이 일정만 삭제</label>
                  </RadioOption>
                  <RadioOption>
                    <input
                      type="radio"
                      id="all"
                      name="deleteOption"
                      value="all"
                      checked={deleteOption === 'all'}
                      onChange={(e) => setDeleteOption(e.target.value)}
                    />
                    <label htmlFor="all">모든 반복 일정 삭제</label>
                  </RadioOption>
                </RadioGroup>
              </DeleteOptions>
            )}

            <DeleteModalButtons>
              <DeleteConfirmButton 
                onClick={confirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? <LoadingSpinnerSmall /> : '삭제'}
              </DeleteConfirmButton>
              <CancelButton 
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isSubmitting}
              >
                취소
              </CancelButton>
            </DeleteModalButtons>
          </DeleteModalContent>
        </DeleteConfirmModal>
      )}

      {message.content && (
        <MessagePopup type={message.type}>
          {message.content}
        </MessagePopup>
      )}

      {showMoreEvents.isOpen && (
        <Modal onClick={() => setShowMoreEvents({ isOpen: false, date: null, events: [] })}>
          <MoreEventsModalContent onClick={e => e.stopPropagation()}>
            <h2>{format(showMoreEvents.date, 'yyyy년 MM월 dd일')} 일정</h2>
            <EventsList>
              {showMoreEvents.events.map((event, index) => (
                <EventItem key={index} onClick={() => {
                  handleEventSelect(event);
                  setShowMoreEvents({ isOpen: false, date: null, events: [] });
                }}>
                  <EventTitle>{event.title}</EventTitle>
                  {event.location && <EventLocation>{event.location}</EventLocation>}
                </EventItem>
              ))}
            </EventsList>
            <CloseButton onClick={() => setShowMoreEvents({ isOpen: false, date: null, events: [] })}>
              닫기
            </CloseButton>
          </MoreEventsModalContent>
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
  background-color: white;
  
  @media (max-width: 768px) {
    padding: 0;
  }
`;

const Header = styled.header`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  
  @media (max-width: 768px) {
    padding: 0.8rem 1rem;
  }
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
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

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex: 1;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: #333;
  margin: 0;
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:active {
    opacity: 0.6;
  }
`;

const CurrentDate = styled.span`
  color: #666;
  font-size: 1.2rem;
`;

const CalendarContainer = styled.div`
  flex: 1;
  background-color: white;
  
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
      color: #ff4444;  // 일요일 헤더
    }
    &:last-child {
      color: #0066ff;  // 토요일 헤더
    }
  }
  
  .rbc-date-cell {
    cursor: pointer;
    padding: 4px;
    text-align: center;
    
    > a {
      font-size: 0.9rem;
      margin: 0;
      padding-top: 4px;
      display: inline-block;
    }
    
    &:hover {
      background-color: rgba(255, 182, 193, 0.1);
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

  .rbc-date-cell {
    cursor: pointer;
    
    &:hover {
      background-color: #f8f8f8;
    }
  }

  .rbc-selectable {
    .rbc-day-bg {
      cursor: pointer;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: rgba(255, 182, 193, 0.1);
      }
      
      &.rbc-selected {
        background-color: rgba(255, 182, 193, 0.2);
      }
    }
  }

  .rbc-day-bg {
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: rgba(255, 182, 193, 0.1);
    }
  }

  .rbc-today {
    background-color: #FFF9F9;  // 오늘 날짜 배경색
  }

  .rbc-off-range-bg {
    background-color: transparent;
  }

  .rbc-off-range {
    color: #ccc;
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
  padding: 20px;
  box-sizing: border-box;  // 패딩을 너비에 포함
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  margin: auto;
  position: relative;
  box-sizing: border-box;  // 패딩을 너비에 포함

  @media (max-width: 768px) {
    width: 95%;
    padding: 1rem;
    margin: 10px;
  }

  // 스크롤바 스타일링
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #FFB6C1;
    border-radius: 3px;
  }

  // 폼 요소들의 너비 조정
  input, textarea, select {
    width: 100%;
    box-sizing: border-box;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    gap: 0.8rem;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
`;

const Label = styled.label`
  color: #666;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #FFB6C1;
  }
`;

const TextArea = styled.textarea`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #FFB6C1;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  position: sticky;
  bottom: 0;
  background: white;
  padding: 1rem 0;
  border-top: 1px solid #eee;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
    
    button {
      width: 100%;
    }
  }
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.7 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
`;

const SubmitButton = styled(Button)`
  background-color: #FFB6C1;
  color: white;
  flex: 1;
  
  &:hover {
    background-color: #FF69B4;
  }
`;

const DeleteButton = styled(Button)`
  background-color: #ff4444;
  color: white;
  
  &:hover {
    background-color: #cc0000;
  }
`;

const CancelButton = styled(Button)`
  background-color: #f0f0f0;
  color: #666;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const Select = styled.select`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  background-color: white;
  color: #666;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23333' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 16px 12px;
  padding-right: 2rem;
  
  &:focus {
    outline: none;
    border-color: #FFB6C1;
  }
`;

const LoadingSpinnerSmall = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const MessagePopup = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 2rem;
  border-radius: 5px;
  background-color: ${props => props.type === 'error' ? '#f44336' : '#4CAF50'};
  color: white;
  z-index: 1000;
  animation: slideUp 0.3s ease;
  
  @keyframes slideUp {
    from { transform: translate(-50%, 20px); opacity: 0; }
    to { transform: translate(-50%, 0); opacity: 1; }
  }
`;

const DeleteConfirmModal = styled(Modal)`
  z-index: 1100;
`;

const DeleteModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  width: 90%;
  max-width: 400px;
  
  h3 {
    margin-top: 0;
    color: #333;
  }
  
  p {
    margin: 1rem 0;
    color: #666;
    
    strong {
      color: #333;
    }
  }
`;

const DeleteModalButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const DeleteConfirmButton = styled(DeleteButton)`
  width: 120px;
`;

const MoreEventsModalContent = styled(ModalContent)`
  max-width: 400px;
  
  h2 {
    text-align: center;
    margin-bottom: 1.5rem;
  }
`;

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 1.5rem;
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #FFB6C1;
    border-radius: 3px;
  }
`;

const EventItem = styled.div`
  padding: 1rem;
  background-color: #f8f8f8;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f0f0f0;
    transform: translateX(2px);
  }
`;

const EventTitle = styled.div`
  font-weight: bold;
  color: #333;
  margin-bottom: 0.3rem;
`;

const EventLocation = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const CloseButton = styled.button`
  background-color: #f0f0f0;
  color: #666;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.7 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const DeleteOptions = styled.div`
  margin: 1.5rem 0;
  padding: 1rem;
  background-color: #f8f8f8;
  border-radius: 5px;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const RadioOption = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  input[type="radio"] {
    accent-color: #FFB6C1;
  }
  
  label {
    color: #333;
    cursor: pointer;
  }
`;

export default AdminCalendar;