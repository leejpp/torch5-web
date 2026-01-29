import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { loadStudentsFromFirebase, TALANT_CATEGORIES } from '../../utils/talantUtils';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';

const TalantBoard = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [students, setStudents] = useState([]);
  const [talantData, setTalantData] = useState({});
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Month navigation
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  // Load students
  const loadStudents = useCallback(async () => {
    try {
      const studentList = await loadStudentsFromFirebase();
      setStudents(studentList);
    } catch (error) {
      console.error('학생 목록 로드 실패:', error);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Load Talant Data for the month
  const loadTalantData = useCallback(async () => {
    if (students.length === 0) return;

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
  }, [currentDate, students]);

  useEffect(() => {
    loadTalantData();
  }, [loadTalantData]);

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getWeekendType = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) return 'sunday';
    if (dayOfWeek === 6) return 'saturday';
    return null;
  };

  const generateDaysArray = () => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  // Interaction
  const handleCellClick = (studentName, day, reason) => {
    if (isProcessing) return;
    const key = `${studentName}-${day}-${reason}`;
    const existingData = talantData[key];
    setSelectedCell({ studentName, day, reason, existingData });
    setShowModal(true);
  };

  // Sync with user_stats
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
        await setDoc(userStatsRef, {
          name: studentName,
          total: talantValue
        });
      }
    } catch (error) {
      console.error('user_stats update error:', error);
    }
  };

  const handleAddTalant = async () => {
    if (!selectedCell || isProcessing) return;

    try {
      setIsProcessing(true);
      const { studentName, day, reason } = selectedCell;
      const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

      const categoryData = TALANT_CATEGORIES.find(c => c.reason === reason);
      const talantValue = categoryData?.value || 1;

      await addDoc(collection(db, 'talant_history'), {
        name: studentName,
        reason: reason,
        talant: talantValue.toString(),
        receivedDate: Timestamp.fromDate(selectedDate),
        createdAt: Timestamp.now()
      });

      await updateUserStats(studentName, talantValue);

      setShowModal(false);
      await loadTalantData();
    } catch (error) {
      console.error('Failed to add talant:', error);
      alert('달란트 추가에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteTalant = async (talantId) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      const talantDocRef = doc(db, 'talant_history', talantId);
      const talantDoc = await getDoc(talantDocRef);

      if (talantDoc.exists()) {
        const data = talantDoc.data();
        const talantValue = parseInt(data.talant) || 0;

        await deleteDoc(talantDocRef);
        await updateUserStats(data.name, -talantValue);
      }

      setShowModal(false);
      await loadTalantData();
    } catch (error) {
      console.error('Failed to delete talant:', error);
      alert('달란트 삭제에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PageContainer>
      <Header>
        <HeaderContent>
          <BackButton onClick={() => navigate('/admin/talant')}>
            ← 대시보드
          </BackButton>
          <PageTitle>달란트 현황판</PageTitle>
          <HistoryLink onClick={() => navigate('/admin/talant/history')}>
            <span>전체 내역</span>
            <span>📊</span>
          </HistoryLink>
        </HeaderContent>
      </Header>

      <ContentArea>
        <Controls>
          <MonthNav>
            <NavBtn onClick={() => changeMonth(-1)}>← 이전</NavBtn>
            <CurrentMonth>
              {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
            </CurrentMonth>
            <NavBtn onClick={() => changeMonth(1)}>다음 →</NavBtn>
          </MonthNav>
        </Controls>

        {loading ? (
          <LoadingState>데이터를 불러오는 중...</LoadingState>
        ) : (
          <BoardsContainer>
            {students.map(student => (
              <StudentBoardSection key={student}>
                <BoardWrapper>
                  {/* Left Column: Reasons */}
                  <LeftColumn>
                    <StudentNameHeader>{student}</StudentNameHeader>
                    {TALANT_CATEGORIES.map((cat) => (
                      <ReasonCell key={cat.reason}>
                        <span className="icon">{cat.emoji}</span>
                        <span className="name">{cat.reason}</span>
                      </ReasonCell>
                    ))}
                  </LeftColumn>

                  {/* Right Column: Scrollable Days */}
                  <RightColumn>
                    <DaysHeader>
                      {generateDaysArray().map(day => {
                        const type = getWeekendType(day);
                        return (
                          <DayHeaderCell key={day} $type={type}>
                            {day}
                          </DayHeaderCell>
                        );
                      })}
                    </DaysHeader>

                    <DaysBody>
                      {TALANT_CATEGORIES.map(cat => (
                        <DaysRow key={cat.reason}>
                          {generateDaysArray().map(day => {
                            const key = `${student}-${day}-${cat.reason}`;
                            const cellData = talantData[key];
                            const type = getWeekendType(day);

                            return (
                              <DayCell
                                key={day}
                                $type={type}
                                onClick={() => handleCellClick(student, day, cat.reason)}
                                $hasData={!!cellData}
                              >
                                {cellData && cellData.map((item, i) => (
                                  <Sticker key={i}>{cat.emoji}</Sticker>
                                ))}
                              </DayCell>
                            );
                          })}
                        </DaysRow>
                      ))}
                    </DaysBody>
                  </RightColumn>
                </BoardWrapper>
              </StudentBoardSection>
            ))}
          </BoardsContainer>
        )}
      </ContentArea>

      {/* Modal */}
      {showModal && (
        <ModalBackdrop onClick={() => setShowModal(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalTitle>
              {selectedCell?.studentName} - {selectedCell?.day}일 ({selectedCell?.reason})
            </ModalTitle>

            <ModalContent>
              {selectedCell?.existingData && selectedCell.existingData.length > 0 ? (
                <>
                  <p>이미 스티커가 붙어있습니다.</p>
                  <ButtonGroup>
                    <Button
                      $variant="delete"
                      onClick={() => handleDeleteTalant(selectedCell.existingData[0].id)}
                      disabled={isProcessing}
                    >
                      스티커 떼기 (삭제)
                    </Button>
                  </ButtonGroup>
                </>
              ) : (
                <>
                  <p>이 날짜에 스티커를 붙이시겠습니까?</p>
                  <ButtonGroup>
                    <Button
                      $variant="primary"
                      onClick={handleAddTalant}
                      disabled={isProcessing}
                    >
                      스티커 붙이기 (추가)
                    </Button>
                  </ButtonGroup>
                </>
              )}
            </ModalContent>

            <CancelButton onClick={() => setShowModal(false)} disabled={isProcessing}>
              취소
            </CancelButton>
          </Modal>
        </ModalBackdrop>
      )}
    </PageContainer>
  );
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pop = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

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
  z-index: 20;
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[600]};
  cursor: pointer;
  padding: ${spacing.sm};
  
  &:hover { color: ${colors.neutral[900]}; }
`;

const PageTitle = styled.h1`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
  margin: 0;
  
  ${media['max-sm']} {
    font-size: ${typography.fontSize.base};
  }
`;

const HistoryLink = styled.button`
  background: ${colors.neutral[100]};
  border: none;
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.full};
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[700]};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover { background: ${colors.neutral[200]}; }
`;

const ContentArea = styled.main`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 70px);
  overflow: hidden;
`;

const Controls = styled.div`
  background: white;
  padding: ${spacing.md};
  border-bottom: 1px solid ${colors.neutral[200]};
  display: flex;
  justify-content: center;
`;

const MonthNav = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.lg};
  background: ${colors.neutral[50]};
  padding: ${spacing.xs} ${spacing.md};
  border-radius: ${borderRadius.full};
  border: 1px solid ${colors.neutral[200]};
`;

const NavBtn = styled.button`
  background: none;
  border: none;
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[600]};
  font-weight: ${typography.fontWeight.semibold};
  cursor: pointer;
  padding: ${spacing.xs} ${spacing.sm};
  
  &:hover { color: ${colors.primary[600]}; }
`;

const CurrentMonth = styled.span`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
  min-width: 100px;
  text-align: center;
`;

const LoadingState = styled.div`
  padding: 40px;
  text-align: center;
  color: ${colors.neutral[500]};
`;

const BoardsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${spacing.xl};
`;

const StudentBoardSection = styled.div`
  animation: ${fadeIn} 0.5s ease-out;
`;

const BoardWrapper = styled.div`
  display: flex;
  background: white;
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.sm};
  border: 1px solid ${colors.neutral[200]};
  overflow: hidden;
`;

const LeftColumn = styled.div`
  width: 120px;
  flex-shrink: 0;
  background: ${colors.neutral[50]};
  border-right: 1px solid ${colors.neutral[200]};
  z-index: 10;
  
  ${media['max-sm']} {
    width: 100px;
  }
`;

const StudentNameHeader = styled.div`
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.primary[700]};
  background: ${colors.primary[50]};
  border-bottom: 1px solid ${colors.neutral[200]};
  font-size: ${typography.fontSize.base};
`;

const ReasonCell = styled.div`
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 ${spacing.sm};
  border-bottom: 1px solid ${colors.neutral[200]};
  font-size: ${typography.fontSize.xs};
  color: ${colors.neutral[700]};
  background: white;
  
  .icon {
    font-size: 16px;
    margin-right: 4px;
    width: 20px;
    text-align: center;
  }
  
  .name {
    font-weight: ${typography.fontWeight.medium};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  &:last-child { border-bottom: none; }
`;

const RightColumn = styled.div`
  flex: 1;
  overflow-x: auto;
`;

const DaysHeader = styled.div`
  display: flex;
  height: 48px;
  border-bottom: 1px solid ${colors.neutral[200]};
`;

const DayHeaderCell = styled.div`
  min-width: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.bold};
  border-right: 1px solid ${colors.neutral[100]};
  background: ${props =>
    props.$type === 'sunday' ? colors.error[50] :
      props.$type === 'saturday' ? colors.warning[50] :
        'white'};
  color: ${props =>
    props.$type === 'sunday' ? colors.error[600] :
      props.$type === 'saturday' ? colors.warning[600] :
        colors.neutral[500]};
`;

const DaysBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const DaysRow = styled.div`
  display: flex;
  height: 44px;
`;

const DayCell = styled.div`
  min-width: 40px;
  width: 40px;
  border-right: 1px solid ${colors.neutral[100]};
  border-bottom: 1px solid ${colors.neutral[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: ${props => {
    if (props.$hasData) return colors.success[50];
    if (props.$type === 'sunday') return '#FFF5F5';
    if (props.$type === 'saturday') return '#FFFAF0';
    return 'white';
  }};
  transition: background 0.1s;
  
  &:hover {
    background: ${colors.primary[50]};
  }
`;

const Sticker = styled.div`
  font-size: 20px;
  animation: ${pop} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  line-height: 1;
`;

// Modal Components
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: white;
  border-radius: ${borderRadius.xl};
  padding: ${spacing.xl};
  width: 90%;
  max-width: 320px;
  box-shadow: ${shadows.xl};
  animation: ${fadeIn} 0.2s ease-out;
  text-align: center;
`;

const ModalTitle = styled.h3`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
  margin-bottom: ${spacing.md};
`;

const ModalContent = styled.div`
  margin-bottom: ${spacing.lg};
  color: ${colors.neutral[600]};
  
  p { margin-bottom: ${spacing.md}; }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const Button = styled.button`
  width: 100%;
  padding: ${spacing.md};
  border-radius: ${borderRadius.lg};
  border: none;
  font-weight: ${typography.fontWeight.bold};
  cursor: pointer;
  font-size: ${typography.fontSize.base};
  transition: all 0.2s;
  
  ${props => props.$variant === 'primary' && css`
    background: ${colors.primary[600]};
    color: white;
    &:hover:not(:disabled) { background: ${colors.primary[700]}; }
  `}
  
  ${props => props.$variant === 'delete' && css`
    background: ${colors.error[500]};
    color: white;
    &:hover:not(:disabled) { background: ${colors.error[600]}; }
  `}
  
  &:disabled { opacity: 0.6; cursor: wait; }
`;

const CancelButton = styled.button`
  background: none;
  border: none;
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.sm};
  margin-top: ${spacing.md};
  cursor: pointer;
  text-decoration: underline;
  
  &:hover { color: ${colors.neutral[800]}; }
`;

export default TalantBoard;