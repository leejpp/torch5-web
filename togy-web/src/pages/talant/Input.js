import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, getDoc, doc, setDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { loadStudentsFromFirebase, TALANT_CATEGORIES } from '../../utils/talantUtils';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';

const TalantInput = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingButtons, setLoadingButtons] = useState(new Set());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Custom Input Modal State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [customAmount, setCustomAmount] = useState('');

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Load students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const loadedStudents = await loadStudentsFromFirebase();
        setStudents(loadedStudents);
      } catch (error) {
        console.error("Error fetching students:", error);
        showToast('학생 목록을 불러오는데 실패했습니다.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleTalantSubmit = async (studentName, reason, amount, isCustom = false) => {
    const buttonId = `${studentName}-${reason}`;
    setLoadingButtons(prev => new Set(prev).add(buttonId));

    try {
      // 0. Check for duplicates (optional, based on logic)
      // For now, allow multiple entries as per original logic, 
      // but maybe strict check for daily fixed items if needed?
      // Original logic had checkDuplicateEntry. Let's implement a simple version if needed.
      // For simplicity and speed, we'll proceed similar to the original reliable logic.

      // 1. Add to talant_history
      const dateParts = selectedDate.split('-');
      const targetDate = new Date(
        parseInt(dateParts[0]),
        parseInt(dateParts[1]) - 1,
        parseInt(dateParts[2]),
        0, 0, 0
      );

      await addDoc(collection(db, 'talant_history'), {
        name: studentName,
        reason: reason,
        talant: parseInt(amount),
        createdAt: serverTimestamp(),
        type: 'credit',
        receivedDate: Timestamp.fromDate(targetDate)
      });

      // 2. Update user_stats
      const userStatsRef = doc(db, 'user_stats', studentName);
      const userStatsDoc = await getDoc(userStatsRef);

      if (userStatsDoc.exists()) {
        const currentTotal = userStatsDoc.data().total || 0;
        await setDoc(userStatsRef, {
          total: currentTotal + parseInt(amount),
          lastUpdated: serverTimestamp()
        }, { merge: true });
      } else {
        await setDoc(userStatsRef, {
          name: studentName,
          total: parseInt(amount),
          lastUpdated: serverTimestamp()
        });
      }

      showToast(`${studentName}에게 ${amount}달란트 (${reason}) 지급 완료!`);

    } catch (error) {
      console.error("Error submitting talant:", error);
      showToast('달란트 지급 중 오류가 발생했습니다.', 'error');
    } finally {
      setLoadingButtons(prev => {
        const next = new Set(prev);
        next.delete(buttonId);
        return next;
      });
      if (isCustom) setShowCustomModal(false);
    }
  };

  const openCustomModal = (studentName) => {
    setCurrentStudent(studentName);
    setCustomReason('');
    setCustomAmount('');
    setShowCustomModal(true);
  };

  const handleCustomSubmit = () => {
    if (!customReason || !customAmount) {
      showToast('사유와 달란트를 모두 입력해주세요.', 'error');
      return;
    }
    handleTalantSubmit(currentStudent, customReason, customAmount, true);
  };

  // Categories + 'Others'
  const categories = [
    ...TALANT_CATEGORIES,
    { reason: '기타', value: 0, emoji: '✨' }
  ];

  return (
    <PageContainer>
      <Header>
        <HeaderContent>
          <BackButton onClick={() => navigate('/admin/talant')}>
            ← 대시보드
          </BackButton>
          <PageTitle>달란트 입력</PageTitle>
          <HistoryLink onClick={() => navigate('/admin/talant/history')}>
            <span>전체 내역</span>
            <span>📋</span>
          </HistoryLink>
        </HeaderContent>
      </Header>

      <ContentArea>
        <Controls>
          <DateLabel>날짜 선택</DateLabel>
          <DateInput
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </Controls>

        {loading ? (
          <LoadingState>학생 목록을 불러오는 중...</LoadingState>
        ) : (
          <Grid>
            {students.map((student) => (
              <StudentCard key={student}>
                <CardHeader>
                  <StudentName>{student}</StudentName>
                </CardHeader>
                <ButtonsGrid>
                  {categories.map((cat) => (
                    <TalantButton
                      key={cat.reason}
                      $isCustom={cat.reason === '기타'}
                      disabled={loadingButtons.has(`${student}-${cat.reason}`)}
                      onClick={() => {
                        if (cat.reason === '기타') {
                          openCustomModal(student);
                        } else {
                          handleTalantSubmit(student, cat.reason, cat.value);
                        }
                      }}
                    >
                      {loadingButtons.has(`${student}-${cat.reason}`) ? (
                        <Spinner />
                      ) : (
                        <>
                          <Emoji>{cat.emoji}</Emoji>
                          <Label>{cat.reason}</Label>
                          {cat.value > 0 && <Value>{cat.value}</Value>}
                        </>
                      )}
                    </TalantButton>
                  ))}
                </ButtonsGrid>
              </StudentCard>
            ))}
          </Grid>
        )}
      </ContentArea>

      {/* Custom Modal */}
      {showCustomModal && (
        <ModalBackdrop onClick={() => setShowCustomModal(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalTitle>{currentStudent} - 기타 입력</ModalTitle>
            <ModalContent>
              <InputGroup>
                <InputLabel>사유</InputLabel>
                <Input
                  placeholder="예: 심부름, 특별활동"
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  autoFocus
                />
              </InputGroup>
              <InputGroup>
                <InputLabel>달란트</InputLabel>
                <Input
                  type="number"
                  placeholder="0"
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                />
              </InputGroup>
            </ModalContent>
            <ModalActions>
              <ModalButton onClick={() => setShowCustomModal(false)}>취소</ModalButton>
              <ModalButton $primary onClick={handleCustomSubmit}>지급하기</ModalButton>
            </ModalActions>
          </Modal>
        </ModalBackdrop>
      )}

      <Toast $show={toast.show} $type={toast.type}>
        {toast.message}
      </Toast>
    </PageContainer>
  );
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
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
  z-index: 10;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: ${spacing.xl} ${spacing.lg};
  
  ${media['max-md']} { padding: ${spacing.lg} ${spacing.md}; }
`;

const Controls = styled.div`
  margin-bottom: ${spacing.lg};
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  background: white;
  padding: ${spacing.md};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.sm};
  width: fit-content;
`;

const DateLabel = styled.label`
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[700]};
  font-size: ${typography.fontSize.sm};
`;

const DateInput = styled.input`
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSize.base};
  color: ${colors.neutral[900]};
  outline: none;
  
  &:focus { border-color: ${colors.primary[500]}; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${spacing.lg};
  
  ${media['max-sm']} { grid-template-columns: 1fr; }
`;

const StudentCard = styled.div`
  background: white;
  border-radius: ${borderRadius.xl};
  box-shadow: ${shadows.sm};
  border: 1px solid ${colors.neutral[200]};
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.md};
  }
`;

const CardHeader = styled.div`
  padding: ${spacing.md} ${spacing.lg};
  background: ${colors.neutral[50]};
  border-bottom: 1px solid ${colors.neutral[100]};
`;

const StudentName = styled.h3`
  margin: 0;
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[800]};
`;

const ButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${spacing.xs};
  padding: ${spacing.md};
`;

const TalantButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: ${props => props.$isCustom ? colors.primary[50] : 'white'};
  border: 1px solid ${props => props.$isCustom ? colors.primary[200] : colors.neutral[200]};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.sm};
  cursor: pointer;
  transition: all 0.1s;
  min-height: 80px;
  
  &:hover {
    background: ${props => props.$isCustom ? colors.primary[100] : colors.neutral[50]};
    border-color: ${colors.primary[300]};
    transform: scale(1.02);
  }
  
  &:active { transform: scale(0.98); }
  
  &:disabled {
    opacity: 0.7;
    cursor: wait;
  }
`;

const Emoji = styled.span`
  font-size: 24px;
  line-height: 1.2;
`;

const Label = styled.span`
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.neutral[700]};
`;

const Value = styled.span`
  font-size: 10px;
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.primary[600]};
  background: ${colors.primary[50]};
  padding: 1px 4px;
  border-radius: ${borderRadius.sm};
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${colors.primary[200]};
  border-top-color: ${colors.primary[600]};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

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
  max-width: 360px;
  box-shadow: ${shadows.xl};
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalTitle = styled.h3`
  margin: 0 0 ${spacing.lg} 0;
  font-size: ${typography.fontSize.lg};
  text-align: center;
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
  margin-bottom: ${spacing.xl};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

const InputLabel = styled.label`
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[500]};
`;

const Input = styled.input`
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.lg};
  width: 100%;
  font-size: ${typography.fontSize.base};
  &:focus { outline: none; border-color: ${colors.primary[500]}; }
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${spacing.md};
`;

const ModalButton = styled.button`
  flex: 1;
  padding: ${spacing.md};
  border-radius: ${borderRadius.lg};
  border: none;
  font-weight: ${typography.fontWeight.bold};
  cursor: pointer;
  
  ${props => props.$primary ? `
    background: ${colors.primary[600]};
    color: white;
    &:hover { background: ${colors.primary[700]}; }
  ` : `
    background: ${colors.neutral[100]};
    color: ${colors.neutral[700]};
    &:hover { background: ${colors.neutral[200]}; }
  `}
`;

const Toast = styled.div`
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(${props => props.$show ? '0' : '100px'});
  background: ${props => props.$type === 'error' ? colors.error[500] : colors.neutral[800]};
  color: white;
  padding: ${spacing.md} ${spacing.xl};
  border-radius: ${borderRadius.full};
  box-shadow: ${shadows.xl};
  font-weight: ${typography.fontWeight.medium};
  opacity: ${props => props.$show ? 1 : 0};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${colors.neutral[500]};
`;

export default TalantInput;