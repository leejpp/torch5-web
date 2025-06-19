import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import {
  TossContainer,
  TossHeader,
  TossHeaderContent,
  TossPrimaryButton,
  TossSecondaryButton,
  TossTextButton,
  TossCard,
  TossTitle,
  TossFlex,
  TossColors,
  TossAnimations,
  TossLoadingSpinner
} from '../../components/common/TossDesignSystem';
import { STUDENT_LIST, TALANT_CATEGORIES } from '../../utils/talantUtils';

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

const pulse = keyframes`
  0%, 100% { 
    transform: scale(1); 
    opacity: 1; 
  }
  50% { 
    transform: scale(1.05); 
    opacity: 0.9; 
  }
`;

// 토스 스타일 업데이트된 컴포넌트들
const TossBoardContainer = styled(TossContainer)`
  padding-bottom: 40px;
`;

const TossBoardHeader = styled(TossHeader)`
  padding: 0 20px;
`;

const TossBoardTitle = styled(TossTitle)`
  font-size: 20px;
  margin: 0;
  color: ${TossColors.grey900};
`;

const TossMonthSelector = styled(TossFlex)`
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: center;
  }
`;

const TossCurrentMonth = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${TossColors.grey900};
  min-width: 140px;
  text-align: center;
  padding: 8px 0;
`;

const BoardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px;
  overflow-x: auto;
`;

const BoardWrapper = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  animation: ${fadeInUp} 0.6s ease-out;
  display: flex;
`;

const LeftColumn = styled.div`
  min-width: 140px;
  background: #F8FAFC;
  flex-shrink: 0;
`;

const ReasonHeader = styled.div`
  padding: 12px 8px;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  background: #3182F6;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ReasonCell = styled.div`
  padding: 8px 6px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: #F8FAFC;
  color: #374151;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  
  &:nth-child(even) {
    background: #FAFAFA;
  }
`;

const RightColumn = styled.div`
  flex: 1;
  overflow-x: auto;
`;

const DaysHeader = styled.div`
  display: flex;
  background: #F8FAFC;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const DayHeaderCell = styled.div`
  width: 40px;
  min-width: 40px;
  max-width: 40px;
  height: 46px;
  padding: 8px 4px;
  text-align: center;
  font-weight: 600;
  font-size: 12px;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: #F8FAFC;
  color: #4B5563;
  
  &.saturday {
    background: #FEF3C7;
    color: #D97706;
  }
  
  &.sunday {
    background: #FEE2E2;
    color: #DC2626;
  }
`;

const DaysBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const DaysRow = styled.div`
  display: flex;
  height: 50px;
  
  &:nth-child(even) {
    background: #FAFAFA;
  }
`;

const DayCell = styled.div`
  width: 40px;
  min-width: 40px;
  max-width: 40px;
  height: 50px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: white;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  box-sizing: border-box;
  
  &:hover {
    background: rgba(59, 130, 246, 0.08);
  }
  
  &.saturday {
    background: #FFFBEB;
    
    &:hover {
      background: rgba(217, 119, 6, 0.08);
    }
  }
  
  &.sunday {
    background: #FEF2F2;
    
    &:hover {
      background: rgba(220, 38, 38, 0.08);
    }
  }
`;

const StudentBoard = styled.div`
  margin-bottom: 32px;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const StudentTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #222;
  margin-bottom: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #3182F6 0%, #1D4ED8 100%);
  color: white;
  border-radius: 12px 12px 0 0;
  text-align: center;
`;

const StickerIcon = styled.div`
  font-size: 14px;
  animation: ${pulse} 2s infinite;
  cursor: pointer;
  display: inline-block;
  margin: 1px;
  line-height: 1;
  
  &:hover {
    transform: scale(1.1);
    transition: transform 0.2s ease;
  }
`;

// 모달 스타일
const ModalBackdrop = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 1000;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  animation: ${fadeInUp} 0.3s ease-out;
`;

const ModalTitle = styled.div`
  color: #222;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  text-align: center;
`;

const ModalContent = styled.div`
  margin-bottom: 20px;
  text-align: center;
  color: #666;
  line-height: 1.6;
`;

const ModalButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`;

const ModalButton = styled.button`
  padding: 12px 8px;
  border: none;
  border-radius: 8px;
  background: #3182F6;
  color: white;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
  min-height: 76px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;

  &:hover {
    background: #2B6CB0;
  }

  &.etc {
    background: #F59E0B;
    
    &:hover {
      background: #D97706;
    }
  }
`;

const CustomReasonInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: all 0.2s ease;
  margin-bottom: 16px;
  box-sizing: border-box;

  &:focus {
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #A0AEC0;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &.cancel {
    background: #E5E7EB;
    color: #6B7280;
    
    &:hover:not(:disabled) {
      background: #D1D5DB;
    }
  }
  
  &.delete {
    background: #EF4444;
    color: white;
    
    &:hover:not(:disabled) {
      background: #DC2626;
    }
  }
  
  &:not(.cancel):not(.delete) {
    &:hover:not(:disabled) {
      background: #2B6CB0;
    }
  }
`;

// 공통 유틸에서 가져온 데이터 사용
const STUDENTS = STUDENT_LIST;
const BOARD_TALANT_CATEGORIES = TALANT_CATEGORIES.map(cat => ({ 
  name: cat.reason, 
  value: cat.value, 
  icon: cat.emoji 
}));

const TalantBoard = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [students, setStudents] = useState([]);
  const [talantData, setTalantData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [customReason, setCustomReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 현재 월의 일수 계산
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  // 학생 목록 로드
  useEffect(() => {
    loadStudents();
  }, []);

  // 달란트 데이터 로드
  useEffect(() => {
    if (students.length > 0) {
      loadTalantData();
    }
  }, [students, currentDate]);

  const loadStudents = async () => {
    try {
      // Input 페이지와 동일한 학생 리스트 사용
      setStudents(STUDENTS);
    } catch (error) {
      console.error('학생 목록 로드 실패:', error);
    }
  };

  const loadTalantData = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

      const q = query(
        collection(db, 'talant_history'),
        where('receivedDate', '>=', Timestamp.fromDate(startOfMonth)),
        where('receivedDate', '<=', Timestamp.fromDate(endOfMonth))
      );

      const querySnapshot = await getDocs(q);
      const data = {};

      querySnapshot.forEach((docSnapshot) => {
        const docData = docSnapshot.data();
        const date = docData.receivedDate.toDate();
        const day = date.getDate();
        const key = `${docData.name}-${day}-${docData.reason}`;
        
        if (!data[key]) {
          data[key] = [];
        }
        data[key].push({
          id: docSnapshot.id,
          ...docData,
          day
        });
      });

      setTalantData(data);
    } catch (error) {
      console.error('달란트 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (studentName, day, reason) => {
    if (isProcessing) return; // 처리 중이면 클릭 무시
    
    const key = `${studentName}-${day}-${reason}`;
    const existingData = talantData[key];
    
    setSelectedCell({ studentName, day, reason, existingData });
    setShowModal(true);
    setCustomReason('');
  };

  const handleAddTalant = async () => {
    if (!selectedCell || isProcessing) return;

    try {
      setIsProcessing(true);
      const { studentName, day, reason } = selectedCell;
      const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const categoryData = BOARD_TALANT_CATEGORIES.find(c => c.name === reason);
      
      await addDoc(collection(db, 'talant_history'), {
        name: studentName,
        reason: reason,
        talant: (categoryData?.value || 1).toString(),
        receivedDate: Timestamp.fromDate(selectedDate),
        createdAt: Timestamp.now()
      });

      setShowModal(false);
      await loadTalantData();
    } catch (error) {
      console.error('달란트 추가 실패:', error);
      alert('달란트 추가에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteTalant = async (talantId) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      await deleteDoc(doc(db, 'talant_history', talantId));
      setShowModal(false);
      await loadTalantData();
    } catch (error) {
      console.error('달란트 삭제 실패:', error);
      alert('달란트 삭제에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getWeekendType = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) return 'sunday'; // 일요일
    if (dayOfWeek === 6) return 'saturday'; // 토요일
    return null;
  };
  
  const isWeekend = (day) => {
    const weekendType = getWeekendType(day);
    return weekendType !== null;
  };

  const generateDaysArray = () => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  return (
    <TossBoardContainer>
      <TossBoardHeader>
        <TossHeaderContent style={{ maxWidth: '1400px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          {/* 왼쪽: 뒤로가기 버튼 */}
          <TossPrimaryButton onClick={() => navigate('/talant')}>
            ← 뒤로
          </TossPrimaryButton>
          
          {/* 중앙: 제목 */}
          <TossBoardTitle>달란트 현황판</TossBoardTitle>
          
          {/* 오른쪽: 내역 버튼 */}
          <TossSecondaryButton onClick={() => navigate('/talant/history')}>
            📊 내역
          </TossSecondaryButton>
        </TossHeaderContent>
        
        {/* 월 선택 컨트롤을 별도 행으로 분리 */}
        <TossHeaderContent style={{ maxWidth: '1400px', justifyContent: 'center', paddingTop: '16px' }}>
          <TossMonthSelector>
            <TossTextButton onClick={() => changeMonth(-1)}>
              ← 이전
            </TossTextButton>
            <TossCurrentMonth>
              {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
            </TossCurrentMonth>
            <TossTextButton onClick={() => changeMonth(1)}>
              다음 →
            </TossTextButton>
          </TossMonthSelector>
        </TossHeaderContent>
      </TossBoardHeader>

      <BoardContainer>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            로딩 중...
          </div>
        ) : (
          <div>
            {students.map((student) => (
              <StudentBoard key={student}>
                <BoardWrapper>
                  {/* 왼쪽 고정 컬럼 (사유) */}
                  <LeftColumn>
                    <ReasonHeader>{student}</ReasonHeader>
                    {BOARD_TALANT_CATEGORIES.map((category) => (
                      <ReasonCell key={category.name}>
                        {category.icon} {category.name}
                      </ReasonCell>
                    ))}
                  </LeftColumn>
                  
                  {/* 오른쪽 스크롤 컬럼 (날짜) */}
                  <RightColumn>
                    {/* 날짜 헤더 */}
                    <DaysHeader>
                      {generateDaysArray().map((day) => {
                        const weekendType = getWeekendType(day);
                        return (
                          <DayHeaderCell 
                            key={day} 
                            className={weekendType || ''}
                            title={`${day}일`}
                          >
                            {day}
                          </DayHeaderCell>
                        );
                      })}
                    </DaysHeader>
                    
                    {/* 날짜별 데이터 */}
                    <DaysBody>
                      {BOARD_TALANT_CATEGORIES.map((category) => (
                        <DaysRow key={category.name}>
                          {generateDaysArray().map((day) => {
                            const key = `${student}-${day}-${category.name}`;
                            const cellData = talantData[key];
                            const weekendType = getWeekendType(day);
                            
                            return (
                              <DayCell
                                key={day}
                                className={weekendType || ''}
                                onClick={() => handleCellClick(student, day, category.name)}
                              >
                                {cellData && cellData.map((item, idx) => {
                                  const categoryInfo = BOARD_TALANT_CATEGORIES.find(c => c.name === item.reason);
                                  return (
                                    <StickerIcon key={idx}>
                                      {categoryInfo?.icon || '⭐'}
                                    </StickerIcon>
                                  );
                                })}
                              </DayCell>
                            );
                          })}
                        </DaysRow>
                      ))}
                    </DaysBody>
                  </RightColumn>
                </BoardWrapper>
              </StudentBoard>
            ))}
          </div>
        )}
      </BoardContainer>

      {/* 모달 */}
      <ModalBackdrop show={showModal} onClick={() => setShowModal(false)}>
        <Modal onClick={(e) => e.stopPropagation()}>
          <ModalTitle>
            {selectedCell?.studentName} - {currentDate.getMonth() + 1}월 {selectedCell?.day}일
            <br />
            <span style={{ fontSize: '14px', color: '#666' }}>
              {selectedCell?.reason}
            </span>
          </ModalTitle>
          
          {selectedCell?.existingData && selectedCell.existingData.length > 0 ? (
            <div>
              <ModalContent>
                이미 등록된 달란트가 있습니다.
              </ModalContent>
              <ActionButtons>
                <ActionButton 
                  className="delete"
                  onClick={() => handleDeleteTalant(selectedCell.existingData[0].id)}
                  disabled={isProcessing}
                >
                  {isProcessing ? '삭제 중...' : '삭제'}
                </ActionButton>
                <ActionButton 
                  className="cancel"
                  onClick={() => setShowModal(false)}
                  disabled={isProcessing}
                >
                  취소
                </ActionButton>
              </ActionButtons>
            </div>
          ) : (
            <div>
              <ModalContent>
                이 사유로 달란트를 추가하시겠습니까?
              </ModalContent>
              
              <ActionButtons>
                <ActionButton 
                  className="cancel"
                  onClick={() => setShowModal(false)}
                  disabled={isProcessing}
                >
                  취소
                </ActionButton>
                <ActionButton 
                  style={{ background: '#3182F6', color: 'white' }}
                  onClick={handleAddTalant}
                  disabled={isProcessing}
                >
                  {isProcessing ? '추가 중...' : '추가'}
                </ActionButton>
              </ActionButtons>
            </div>
          )}
        </Modal>
      </ModalBackdrop>
    </TossBoardContainer>
  );
};

export default TalantBoard; 