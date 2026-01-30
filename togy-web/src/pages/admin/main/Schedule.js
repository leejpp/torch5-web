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
import { db } from '../../../firebase/config';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch, where } from 'firebase/firestore';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../../styles/designSystem';
import { processCalendarEvents } from '../../../utils/lunarCalendar';

const locales = { 'ko': ko };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const REPEAT_TYPES = {
  NONE: 'NONE',
  YEARLY: 'YEARLY'
};

const EVENT_TYPES = {
  DEFAULT: { label: '기본', bgColor: '#F5F5F5', color: '#616161' },
  BIRTHDAY: { label: '생일', bgColor: '#E1BEE7', color: '#6A1B9A' },
  MEETING: { label: '모임', bgColor: '#BBDEFB', color: '#1565C0' },
  ACTIVITY: { label: '활동', bgColor: '#C8E6C9', color: '#2E7D32' },
  EVENT: { label: '행사', bgColor: '#FFF9C4', color: '#F57F17' },
  HOLIDAY: { label: '공휴일', bgColor: '#FFD1D1', color: '#C62828' }
};

const Schedule = () => {
  const [rawEvents, setRawEvents] = useState([]);
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
    type: 'DEFAULT',
    isLunar: false, // Add isLunar state
    repeat: { type: REPEAT_TYPES.NONE }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteOption, setDeleteOption] = useState('single');
  const [date, setDate] = useState(new Date());
  const calendarRef = useRef(null);

  // Filters
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

  const handleSelect = ({ start }) => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      start: format(new Date(start), "yyyy-MM-dd"),
      end: format(new Date(start), "yyyy-MM-dd"),
      description: '',
      location: '',
      type: 'DEFAULT',
      isLunar: false,
      repeat: { type: REPEAT_TYPES.NONE }
    });
    setIsModalOpen(true);
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);

    // Find original event data to get correct date (Lunar or Solar)
    const originalEvent = rawEvents.find(e => e.id === (event.originalId || event.id));
    const eventData = originalEvent || event;

    const startDate = eventData.start instanceof Date ? eventData.start : event.start;
    const endDate = eventData.end instanceof Date ? eventData.end : event.end;

    setFormData({
      title: eventData.title,
      start: format(startDate, "yyyy-MM-dd"),
      end: format(endDate, "yyyy-MM-dd"),
      description: eventData.description || '',
      location: eventData.location || '',
      type: eventData.type || 'DEFAULT',
      isLunar: eventData.isLunar || false,
      repeat: eventData.repeat || { type: REPEAT_TYPES.NONE }
    });
    setIsModalOpen(true);
  };

  const generateRecurringEvents = (baseEvent, repeat, until) => {
    const repeatGroupId = crypto.randomUUID();
    const firstEvent = { ...baseEvent, repeatGroupId, isRecurring: true };
    const events = [firstEvent];
    const startDate = new Date(baseEvent.start);
    const endDate = new Date(baseEvent.end);
    const duration = endDate - startDate;

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
        type: formData.type,
        isLunar: formData.isLunar,
        repeat: formData.repeat
      };

      // SAVE AS SINGLE EVENT (Read-time expansion handles recurrence)
      if (selectedEvent) {
        const docId = selectedEvent.originalId || selectedEvent.id;
        await updateDoc(doc(db, 'events', docId), eventData);
        showMessage('success', '일정이 수정되었습니다.');
      } else {
        // Add random repeatGroupId if it's a new recurring event
        if (eventData.repeat && eventData.repeat.type !== REPEAT_TYPES.NONE) {
          eventData.repeat.repeatGroupId = crypto.randomUUID();
          eventData.isRecurring = true;
        }
        await addDoc(collection(db, 'events'), eventData);
        showMessage('success', '새 일정이 추가되었습니다.');
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
        const repeatGroupId = selectedEvent.repeat?.repeatGroupId || selectedEvent.repeatGroupId;
        const q = query(
          collection(db, 'events'),
          where('repeat.repeatGroupId', '==', repeatGroupId)
        );
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        showMessage('success', '모든 반복 일정이 삭제되었습니다.');
      } else {
        const docId = selectedEvent.originalId || selectedEvent.id;
        await deleteDoc(doc(db, 'events', docId));
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
      <Header>
        <HeaderContent>
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
        </HeaderContent>
      </Header>

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
                  selectable={true}
                  onSelectSlot={handleSelect}
                  onSelectEvent={handleEventSelect}
                  views={['month']}
                  defaultView="month"
                  toolbar={false}
                  draggableAccessor={() => false}
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
                      style: {
                        backgroundColor: eventType.bgColor,
                        color: eventType.color,
                        border: `1px solid ${eventType.color}`,
                        borderRadius: '2px', // More compact radius
                        fontSize: '10px', // Smaller font like reference
                        fontWeight: '600',
                        padding: '0px 2px', // Tighter padding
                        // lineHeight: '1.2', // Removed line-height in favor of flex
                        display: 'flex', // Use flexbox
                        alignItems: 'center', // Vertically center
                        whiteSpace: 'nowrap', // Keep on one line for density like reference
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        height: '16px', // Fixed small height
                        marginTop: '1px'
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

      {isModalOpen && (
        <Modal onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2>{selectedEvent ? '일정 수정' : '새 일정'}</h2>
            <Form onSubmit={handleSubmit}>
              <InputGroup>
                <Label>제목</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </InputGroup>
              <InputGroup>
                <Label>시작 날짜</Label>
                <Input
                  type="date"
                  value={formData.start}
                  onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                  required
                />
              </InputGroup>
              <InputGroup>
                <Label>종료 날짜</Label>
                <Input
                  type="date"
                  value={formData.end}
                  onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                  required
                />
              </InputGroup>
              <InputGroup>
                <Label>장소</Label>
                <Input
                  type="text"
                  placeholder="장소를 입력하세요 (선택)"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </InputGroup>
              <InputGroup>
                <Label>설명</Label>
                <TextArea
                  placeholder="일정에 대한 설명을 입력하세요"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </InputGroup>

              {/* Lunar Toggle */}
              <InputGroup>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="isLunar"
                    checked={formData.isLunar}
                    onChange={(e) => setFormData({ ...formData, isLunar: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: colors.primary[600] }}
                  />
                  <Label htmlFor="isLunar" style={{ margin: 0, cursor: 'pointer' }}>음력 날짜로 저장</Label>
                </div>
                {formData.isLunar && (
                  <div style={{ fontSize: '12px', color: colors.neutral[500], marginLeft: '24px' }}>
                    * 체크하면 입력한 날짜를 음력으로 간주하여 매년(반복 시) 또는 해당 연도의 양력 날짜로 자동 변환되어 표시됩니다.
                  </div>
                )}
              </InputGroup>
              <InputGroup>
                <Label>일정 타입</Label>
                <SelectInput
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {Object.entries(EVENT_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </SelectInput>
              </InputGroup>
              <InputGroup>
                <Label>반복</Label>
                <SelectInput
                  value={formData.repeat.type}
                  onChange={(e) => setFormData({
                    ...formData,
                    repeat: { type: e.target.value }
                  })}
                >
                  <option value={REPEAT_TYPES.NONE}>반복 안함</option>
                  <option value={REPEAT_TYPES.YEARLY}>매년</option>
                </SelectInput>
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
    </Container>
  );
};

// Animations
const slideUp = keyframes`
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background-color: ${colors.neutral[50]};
`;

const Header = styled.header`
  background: white;
  position: relative;
  z-index: 10;
  box-shadow: ${shadows.sm};
  border-bottom: 1px solid ${colors.neutral[200]};
`;

const HeaderContent = styled.div`
  padding: ${spacing.md} ${spacing.lg};
  max-width: 100%;
  margin: 0 auto;
  
  ${media['max-md']} {
    padding: ${spacing.md};
  }
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
  max-width: 100%;
  margin: 0 auto;
  padding: ${spacing.md};
  padding-bottom: 80px;
  
  ${media['max-md']} {
    padding: ${spacing.sm};
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
    
    position: relative;
    z-index: 1;
    
    &:first-child { color: ${colors.error[500]}; }
    &:last-child { color: ${colors.primary[500]}; }
  }
  
  .rbc-day-bg {
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: ${colors.primary[50]};
    }
  }

  .rbc-today {
    background-color: ${colors.primary[50]} !important;
  }
  
  .rbc-today > .rbc-date-cell > a {
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
    border-radius: 3px;
    margin: 1px 2px;
    box-shadow: none;
    transition: transform 0.1s;
    
    &:hover {
      transform: scale(1.02);
      z-index: 10;
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
  max-width: 500px;
  border-radius: ${borderRadius.xl};
  box-shadow: ${shadows['2xl']};
  padding: ${spacing.xl};
  animation: ${slideUp} 0.3s ease-out;
  max-height: 90vh;
  overflow-y: auto;

  h2 {
      margin-top: 0;
      margin-bottom: ${spacing.lg};
      font-size: ${typography.fontSize.xl};
      color: ${colors.neutral[900]};
      text-align: center;
  }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: ${spacing.md};
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.label`
    font-size: ${typography.fontSize.sm};
    font-weight: ${typography.fontWeight.bold};
    color: ${colors.neutral[700]};
`;

const Input = styled.input`
    padding: ${spacing.md};
    border: 1px solid ${colors.neutral[300]};
    border-radius: ${borderRadius.md};
    font-size: ${typography.fontSize.base};
    
    &:focus {
        outline: none;
        border-color: ${colors.primary[500]};
        box-shadow: 0 0 0 2px ${colors.primary[100]};
    }
`;

const SelectInput = styled.select`
    padding: ${spacing.md};
    border: 1px solid ${colors.neutral[300]};
    border-radius: ${borderRadius.md};
    font-size: ${typography.fontSize.base};
    background-color: white;

    &:focus {
        outline: none;
        border-color: ${colors.primary[500]};
        box-shadow: 0 0 0 2px ${colors.primary[100]};
    }
`;

const TextArea = styled.textarea`
    padding: ${spacing.md};
    border: 1px solid ${colors.neutral[300]};
    border-radius: ${borderRadius.md};
    font-size: ${typography.fontSize.base};
    min-height: 100px;
    resize: vertical;

    &:focus {
        outline: none;
        border-color: ${colors.primary[500]};
        box-shadow: 0 0 0 2px ${colors.primary[100]};
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: ${spacing.md};
    margin-top: ${spacing.md};
`;

const Button = styled.button`
    flex: 1;
    padding: ${spacing.md};
    border-radius: ${borderRadius.lg};
    font-weight: ${typography.fontWeight.bold};
    font-size: ${typography.fontSize.base};
    transition: all 0.2s;
    cursor: pointer;

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

const SubmitButton = styled(Button)`
    background: ${colors.primary[600]};
    color: white;
    border: none;

    &:hover:not(:disabled) {
        background: ${colors.primary[700]};
        transform: translateY(-1px);
    }
`;

const DeleteButton = styled(Button)`
    background: ${colors.error[50]};
    color: ${colors.error[600]};
    border: 1px solid ${colors.error[200]};

    &:hover:not(:disabled) {
        background: ${colors.error[100]};
    }
`;

const CancelButton = styled(Button)`
    background: ${colors.neutral[100]};
    color: ${colors.neutral[600]};
    border: none;

    &:hover:not(:disabled) {
        background: ${colors.neutral[200]};
    }
`;

const LoadingSpinnerSmall = styled.div`
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

const DeleteConfirmModal = styled(Modal)`
    z-index: 1100;
`;

const DeleteModalContent = styled(ModalContent)`
    max-width: 400px;
    text-align: center;

    h3 {
        margin-bottom: ${spacing.md};
        color: ${colors.error[600]};
    }

    p {
        margin-bottom: ${spacing.sm};
        color: ${colors.neutral[600]};
    }
`;

const DeleteOptions = styled.div`
    margin: ${spacing.lg} 0;
    text-align: left;
    background: ${colors.neutral[50]};
    padding: ${spacing.md};
    border-radius: ${borderRadius.lg};
`;

const RadioGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing.sm};
`;

const RadioOption = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.sm};

    input {
        accent-color: ${colors.error[600]};
    }

    label {
        font-size: ${typography.fontSize.sm};
        color: ${colors.neutral[700]};
        cursor: pointer;
    }
`;

const DeleteModalButtons = styled(ButtonGroup)`
    margin-top: ${spacing.xl};
`;

const DeleteConfirmButton = styled(SubmitButton)`
    background: ${colors.error[600]};

    &:hover:not(:disabled) {
        background: ${colors.error[700]};
    }
`;

const MessagePopup = styled.div`
    position: fixed;
    bottom: ${spacing.xl};
    left: 50%;
    transform: translateX(-50%);
    padding: ${spacing.md} ${spacing.xl};
    background: ${props => props.type === 'error' ? colors.error[600] : colors.success[600]};
    color: white;
    border-radius: ${borderRadius.full};
    box-shadow: ${shadows.lg};
    font-weight: ${typography.fontWeight.medium};
    z-index: 2000;
    animation: slideUp 0.3s ease-out;

    @keyframes slideUp {
        from { transform: translate(-50%, 100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
`;

export default Schedule;
