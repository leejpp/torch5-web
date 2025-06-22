import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { db } from '../../firebase/config';
import { collection, addDoc, doc, getDoc, setDoc, updateDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { 
  CommonContainer, 
  CommonHeader, 
  HeaderContent, 
  HeaderTop, 
  PrimaryButton, 
  SecondaryButton, 
  PageTitle, 
  LoadingSpinner, 
  ErrorMessage,
  fadeInUp 
} from '../../components/common/TalantStyles';
import { TALANT_CATEGORIES, STUDENT_LIST } from '../../utils/talantUtils';

// Container, Header, HeaderContent, HeaderTop은 TalantStyles에서 import됨

const DateSelect = styled.input`
  padding: 12px 16px;
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-radius: 10px;
  font-size: 16px;
  width: 100%;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', Arial, sans-serif;
  outline: none;
  transition: all 0.2s ease;
  background: white;
  color: #222;

  &:focus {
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 14px;
  }
`;

const LogDisplay = styled.div`
  background: rgba(59, 130, 246, 0.1);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  color: #3B82F6;
  border: 1px solid rgba(59, 130, 246, 0.2);
  margin-top: 12px;
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.5s ease-out;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', Arial, sans-serif;
`;

// ErrorMessage는 TalantStyles에서 import됨

const PersonGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
  
  @media (max-width: 480px) {
    padding: 12px;
    gap: 12px;
    grid-template-columns: 1fr;
  }
`;

const PersonCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  animation: ${fadeInUp} 0.8s ease-out ${props => props.delay}s both;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
`;

const PersonName = styled.div`
  font-weight: 700;
  padding: 16px;
  font-size: 18px;
  background: rgba(59, 130, 246, 0.05);
  color: #222;
  text-align: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', Arial, sans-serif;
  
  @media (max-width: 480px) {
    padding: 12px;
    font-size: 16px;
  }
`;

const ButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 16px;
  
  @media (max-width: 480px) {
    gap: 6px;
    padding: 12px;
  }
`;

const TalantButton = styled.button`
  position: relative;
  padding: 12px 8px;
  border: none;
  border-radius: 8px;
  background: #3182F6;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', Arial, sans-serif;
  min-height: 76px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-align: center;
  line-height: 1.2;

  &:hover:not(:disabled) {
    background: #2B6CB0;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  &.etc {
    background: #F59E0B;
    
    &:hover:not(:disabled) {
      background: #D97706;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    min-height: 68px;
    padding: 10px 4px;
    gap: 1px;
  }
`;

// LoadingSpinner는 TalantStyles에서 import됨

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
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  text-align: center;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', Arial, sans-serif;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', Arial, sans-serif;
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

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ModalButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  font-family: 'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', Arial, sans-serif;
  
  &.cancel {
    background: #E5E7EB;
    color: #6B7280;
    
    &:hover {
      background: #D1D5DB;
    }
  }
  
  &.confirm {
    background: #3182F6;
    color: white;
    
    &:hover {
      background: #2B6CB0;
    }
  }
`;

const ResultModal = styled.div`
  display: ${props => props.show ? 'block' : 'none'};
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing['2xl']};
  box-shadow: ${theme.shadows.xl};
  z-index: 1001;
  width: 90%;
  max-width: 400px;
  text-align: center;
  animation: ${fadeInUp} 0.3s ease-out;
`;

const ResultMessage = styled.div`
  color: ${theme.colors.neutral[1]};
  font-size: ${theme.typography.fontSize.lg};
  line-height: 1.6;
  margin-bottom: ${theme.spacing.xl};
  white-space: pre-line;
`;

const ResultButton = styled.button`
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  color: white;
  border: none;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  transition: ${theme.transitions.default};

  &:hover {
    background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
    transform: translateY(-1px);
  }
`;

const TalantInput = () => {
  const navigate = useNavigate();
  
  // 상태 관리
  const [selectedDate, setSelectedDate] = useState('');
  const [logMessage, setLogMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [currentPerson, setCurrentPerson] = useState(null);
  const [customReason, setCustomReason] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [loadingButtons, setLoadingButtons] = useState(new Set());
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);

  // 데이터 정의 (유틸리티에서 가져옴)
  const people = STUDENT_LIST;
  const categories = [
    ...TALANT_CATEGORIES.map(cat => ({ name: cat.reason, value: cat.value, icon: cat.emoji })),
    { name: '기타', value: 'custom', icon: '➕' }
  ];

  // 초기화
  useEffect(() => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    setSelectedDate(dateStr);
  }, []);

  // 로그 표시 함수
  const addLogEntry = useCallback((name, talant, reason) => {
    setLogMessage(`${name} / ${talant}점 / ${reason}`);
    setTimeout(() => {
      setLogMessage('');
    }, 3000);
  }, []);

  // 에러 표시 함수
  const showError = useCallback((message, duration = 5000) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage('');
    }, duration);
  }, []);

  // 중복 제출 방지
  const preventDuplicateSubmission = useCallback(() => {
    const now = Date.now();
    if (now - lastSubmissionTime < 2000) {
      return false;
    }
    setLastSubmissionTime(now);
    return true;
  }, [lastSubmissionTime]);

  // user_stats 업데이트 함수
  const updateUserStats = useCallback(async (studentName, talantValue) => {
    try {
      const userStatsRef = doc(db, 'user_stats', studentName);
      const userStatsDoc = await getDoc(userStatsRef);
      
      if (userStatsDoc.exists()) {
        // 기존 문서가 있으면 값을 더함
        const currentTotal = userStatsDoc.data().total || 0;
        await updateDoc(userStatsRef, {
          total: currentTotal + talantValue
        });
      } else {
        // 새 문서 생성
        await setDoc(userStatsRef, {
          total: talantValue
        });
      }
    } catch (error) {
      console.error('user_stats 업데이트 오류:', error);
    }
  }, []);

  // 중복 데이터 체크 함수
  const checkDuplicateEntry = useCallback(async (name, reason, selectedDate) => {
    try {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const targetDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // 해당 날짜의 모든 데이터를 가져와서 클라이언트에서 필터링
      const startDate = new Date(year, month - 1, day, 0, 0, 0);
      const endDate = new Date(year, month - 1, day, 23, 59, 59);
      
      const q = query(
        collection(db, 'talant_history'),
        where('receivedDate', '>=', Timestamp.fromDate(startDate)),
        where('receivedDate', '<=', Timestamp.fromDate(endDate))
      );
      
      const querySnapshot = await getDocs(q);
      
      // 클라이언트에서 이름과 사유로 필터링
      const duplicateFound = querySnapshot.docs.some(doc => {
        const data = doc.data();
        return data.name === name && data.reason === reason;
      });
      
      if (duplicateFound) {
        console.log(`🚨 중복 발견: ${name} - ${reason} - ${targetDateStr}`);
      }
      
      return duplicateFound;
    } catch (error) {
      console.error('중복 체크 오류:', error);
      return false; // 오류 시 중복 아님으로 처리
    }
  }, []);

  // 달란트 제출 함수
  const submitTalant = useCallback(async (name, reason, talant, buttonKey = null) => {
    if (!selectedDate) {
      setResultMessage('날짜를 선택해주세요!');
      setShowResultModal(true);
      return;
    }

    if (!preventDuplicateSubmission()) {
      return;
    }

    if (buttonKey) {
      setLoadingButtons(prev => new Set([...prev, buttonKey]));
    }

    try {
      // 중복 데이터 체크
      const isDuplicate = await checkDuplicateEntry(name, reason, selectedDate);
      if (isDuplicate) {
        const [year, month, day] = selectedDate.split('-').map(Number);
        const formattedDate = `${year}년 ${month}월 ${day}일`;
        setResultMessage(`⚠️ 중복 데이터 발견!\n\n${name}님은 ${formattedDate}에\n이미 "${reason}" 달란트를 받았습니다.\n\n중복 입력을 방지했습니다.`);
        setShowResultModal(true);
        return;
      }

      // 선택한 날짜에 현재 시간을 조합하여 정확한 날짜 생성
      const [year, month, day] = selectedDate.split('-').map(Number);
      
      // receivedDate는 선택한 날짜의 시작 시간(00:00:00)
      const receivedDate = new Date(year, month - 1, day, 0, 0, 0);
      
      // createdAt은 현재 시간
      const createdAt = new Date();
      
      const talantData = {
        name: name,
        reason: reason,
        talant: talant.toString(),
        receivedDate: Timestamp.fromDate(receivedDate),
        createdAt: Timestamp.fromDate(createdAt)
      };
      
      // talant_history에 기록 추가
      await addDoc(collection(db, 'talant_history'), talantData);
      
      // user_stats에 누적 개수 업데이트
      await updateUserStats(name, talant);
      
      addLogEntry(name, talant, reason);
      const formattedDate = `${year}년 ${month}월 ${day}일`;
      setResultMessage(`✅ 입력 완료!\n\n이름: ${name}\n사유: ${reason}\n달란트: ${talant}\n날짜: ${formattedDate}`);
      setShowResultModal(true);
    } catch (error) {
      console.error("달란트 저장 오류:", error);
      showError(`데이터 저장 중 오류가 발생했습니다: ${error.message}`);
      setResultMessage('오류가 발생했습니다. 다시 시도해주세요.');
      setShowResultModal(true);
    } finally {
      if (buttonKey) {
        setTimeout(() => {
          setLoadingButtons(prev => {
            const newSet = new Set(prev);
            newSet.delete(buttonKey);
            return newSet;
          });
        }, 1000);
      }
    }
  }, [selectedDate, preventDuplicateSubmission, addLogEntry, showError, updateUserStats, checkDuplicateEntry]);

  // 커스텀 모달 열기
  const openCustomModal = useCallback((person) => {
    setCurrentPerson(person);
    setCustomReason('');
    setCustomValue('');
    setShowCustomModal(true);
  }, []);

  // 커스텀 달란트 제출
  const submitCustomTalant = useCallback(async () => {
    if (!customReason.trim()) {
      return;
    }
    
    if (!customValue || isNaN(customValue)) {
      return;
    }

    await submitTalant(currentPerson, customReason, parseInt(customValue));
    setShowCustomModal(false);
  }, [customReason, customValue, currentPerson, submitTalant]);

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && showCustomModal) {
        submitCustomTalant();
      }
      
      if (e.key === 'Escape') {
        if (showCustomModal) {
          setShowCustomModal(false);
        }
        if (showResultModal) {
          setShowResultModal(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showCustomModal, showResultModal, submitCustomTalant]);

  return (
    <CommonContainer>
      <CommonHeader>
        <HeaderContent>
          <HeaderTop>
            <PrimaryButton onClick={() => navigate('/talant')}>
              ← 대시보드
            </PrimaryButton>
            <PageTitle>달란트 입력</PageTitle>
            <SecondaryButton onClick={() => navigate('/talant/history')}>
              <span>전체 내역</span>
              <span>📋</span>
            </SecondaryButton>
          </HeaderTop>
          
          <DateSelect
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          
          {logMessage && (
            <LogDisplay>{logMessage}</LogDisplay>
          )}
          
          {errorMessage && (
            <ErrorMessage>{errorMessage}</ErrorMessage>
          )}
        </HeaderContent>
      </CommonHeader>

      <PersonGrid>
        {people.map((person, index) => (
          <PersonCard key={person} delay={index * 0.1}>
            <PersonName>{person}</PersonName>
                         <ButtonsGrid>
               {categories.map((category) => {
                 const buttonKey = `${person}-${category.name}`;
                 const isLoading = loadingButtons.has(buttonKey);
                 
                 return (
                   <TalantButton
                     key={category.name}
                     className={category.name === '기타' ? 'etc' : ''}
                     disabled={isLoading}
                     onClick={() => {
                       if (category.value === 'custom') {
                         openCustomModal(person);
                       } else {
                         submitTalant(person, category.name, category.value, buttonKey);
                       }
                     }}
                   >
                     {isLoading ? (
                       <LoadingSpinner />
                     ) : (
                       <>
                         <div>{category.icon}</div>
                         <div>{category.name}</div>
                         {category.value !== 'custom' && (
                           <div style={{ fontSize: '0.8em', opacity: 0.9 }}>
                             {category.value}점
                           </div>
                         )}
                       </>
                     )}
                   </TalantButton>
                 );
               })}
             </ButtonsGrid>
          </PersonCard>
        ))}
      </PersonGrid>

      {/* 커스텀 달란트 모달 */}
      <ModalBackdrop show={showCustomModal}>
        <Modal>
          <ModalTitle>기타 달란트 입력</ModalTitle>
          <ModalInput
            type="text"
            placeholder="달란트 사유"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            autoFocus
          />
          <ModalInput
            type="number"
            placeholder="달란트 수"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
          />
          <ModalButtons>
            <ModalButton 
              className="cancel" 
              onClick={() => setShowCustomModal(false)}
            >
              취소
            </ModalButton>
            <ModalButton 
              className="confirm" 
              onClick={submitCustomTalant}
              disabled={!customReason.trim() || !customValue}
            >
              확인
            </ModalButton>
          </ModalButtons>
        </Modal>
      </ModalBackdrop>

      {/* 결과 모달 */}
      {showResultModal && (
        <>
          <ModalBackdrop show={true} />
          <ResultModal show={showResultModal}>
            <ResultMessage>{resultMessage}</ResultMessage>
            <ResultButton onClick={() => setShowResultModal(false)}>
              확인
            </ResultButton>
          </ResultModal>
        </>
      )}
    </CommonContainer>
  );
};

export default memo(TalantInput); 