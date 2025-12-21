import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  TossContainer,
  TossHeader,
  TossHeaderContent,
  TossPrimaryButton,
  TossSecondaryButton,
  TossTitle,
  TossCard,
  TossCardBody,
  TossColors
} from '../../components/common/TossDesignSystem';
import { loadStudentsFromFirebase, addStudent, deleteStudent } from '../../utils/talantUtils';

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

// 스타일 컴포넌트
const TossStudentsContainer = styled(TossContainer)`
  padding-bottom: 40px;
`;

const TossStudentsHeader = styled(TossHeader)`
  padding: 0 20px;
`;

const TossStudentsTitle = styled(TossTitle)`
  font-size: 20px;
  margin: 0;
  color: ${TossColors.grey900};
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const StudentsListCard = styled(TossCard)`
  margin-bottom: 24px;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const StudentsListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid ${TossColors.grey100};
`;

const StudentsListTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${TossColors.grey900};
  margin: 0;
`;

const StudentsCount = styled.div`
  font-size: 14px;
  color: ${TossColors.grey600};
  background: ${TossColors.grey100};
  padding: 4px 12px;
  border-radius: 12px;
`;

const StudentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
  }
`;

const StudentItem = styled.div`
  background: white;
  border: 2px solid ${TossColors.grey200};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  animation: ${fadeInUp} 0.4s ease-out;
  
  &:hover {
    border-color: ${TossColors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StudentName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${TossColors.grey900};
  flex: 1;
`;

const DeleteButton = styled.button`
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #DC2626;
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AddStudentCard = styled(TossCard)`
  animation: ${fadeInUp} 0.6s ease-out 0.2s both;
`;

const AddStudentForm = styled.form`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const InputGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${TossColors.grey700};
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid ${TossColors.grey200};
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  outline: none;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: ${TossColors.primary};
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: ${TossColors.grey400};
  }
`;

const AddButton = styled.button`
  background: ${TossColors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: ${TossColors.primaryDark};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: ${TossColors.grey600};
  font-size: 16px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${TossColors.grey600};
  
  .empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    animation: ${pulse} 2s ease-in-out infinite;
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
  
  &.confirm {
    background: #EF4444;
    color: white;
    
    &:hover:not(:disabled) {
      background: #DC2626;
    }
  }
`;

const Toast = styled.div`
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(${props => props.$show ? '0' : '100px'});
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 16px 24px;
  border-radius: 12px;
  color: #222;
  font-size: 16px;
  z-index: 1001;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  opacity: ${props => props.$show ? 1 : 0};
`;

const TalantStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStudentName, setNewStudentName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  // 학생 목록 로드
  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const studentList = await loadStudentsFromFirebase();
      setStudents(studentList);
    } catch (error) {
      console.error('학생 목록 로드 실패:', error);
      showToast('학생 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // 토스트 메시지 표시
  const showToast = useCallback((message, duration = 3000) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, duration);
  }, []);

  // 학생 추가
  const handleAddStudent = useCallback(async (e) => {
    e.preventDefault();
    
    if (!newStudentName.trim()) {
      showToast('학생 이름을 입력해주세요.');
      return;
    }

    if (students.includes(newStudentName.trim())) {
      showToast('이미 존재하는 학생입니다.');
      return;
    }

    try {
      setIsAdding(true);
      await addStudent(newStudentName.trim());
      setNewStudentName('');
      await loadStudents();
      showToast(`${newStudentName.trim()} 학생이 추가되었습니다.`);
    } catch (error) {
      console.error('학생 추가 실패:', error);
      showToast(error.message || '학생 추가에 실패했습니다.');
    } finally {
      setIsAdding(false);
    }
  }, [newStudentName, students, loadStudents, showToast]);

  // 학생 삭제 확인 모달 열기
  const handleDeleteClick = useCallback((studentName) => {
    setDeletingStudent(studentName);
    setShowDeleteModal(true);
  }, []);

  // 학생 삭제
  const handleDeleteStudent = useCallback(async () => {
    if (!deletingStudent || isDeleting) return;

    try {
      setIsDeleting(true);
      await deleteStudent(deletingStudent);
      await loadStudents();
      showToast(`${deletingStudent} 학생이 삭제되었습니다.`);
      setShowDeleteModal(false);
      setDeletingStudent(null);
    } catch (error) {
      console.error('학생 삭제 실패:', error);
      showToast(error.message || '학생 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  }, [deletingStudent, isDeleting, loadStudents, showToast]);

  return (
    <TossStudentsContainer>
      <TossStudentsHeader>
        <TossHeaderContent style={{ maxWidth: '1400px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <TossPrimaryButton onClick={() => navigate('/talant')}>
            ← 뒤로
          </TossPrimaryButton>
          
          <TossStudentsTitle>학생 관리</TossStudentsTitle>
          
          <TossSecondaryButton onClick={() => navigate('/talant/input')}>
            📝 입력
          </TossSecondaryButton>
        </TossHeaderContent>
      </TossStudentsHeader>

      <ContentWrapper>
        {/* 학생 추가 폼 */}
        <AddStudentCard>
          <TossCardBody>
            <StudentsListHeader>
              <StudentsListTitle>새 학생 추가</StudentsListTitle>
            </StudentsListHeader>
            <AddStudentForm onSubmit={handleAddStudent}>
              <InputGroup>
                <Label>학생 이름</Label>
                <Input
                  type="text"
                  placeholder="학생 이름을 입력하세요"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  disabled={isAdding}
                />
              </InputGroup>
              <AddButton type="submit" disabled={isAdding || !newStudentName.trim()}>
                {isAdding ? '추가 중...' : '추가하기'}
              </AddButton>
            </AddStudentForm>
          </TossCardBody>
        </AddStudentCard>

        {/* 학생 목록 */}
        <StudentsListCard>
          <TossCardBody>
            <StudentsListHeader>
              <StudentsListTitle>학생 목록</StudentsListTitle>
              <StudentsCount>총 {students.length}명</StudentsCount>
            </StudentsListHeader>
            
            {loading ? (
              <LoadingMessage>로딩 중...</LoadingMessage>
            ) : students.length === 0 ? (
              <EmptyMessage>
                <div className="empty-icon">👥</div>
                <p>등록된 학생이 없습니다.</p>
              </EmptyMessage>
            ) : (
              <StudentsGrid>
                {students.map((student) => (
                  <StudentItem key={student}>
                    <StudentName>{student}</StudentName>
                    <DeleteButton
                      onClick={() => handleDeleteClick(student)}
                    >
                      삭제
                    </DeleteButton>
                  </StudentItem>
                ))}
              </StudentsGrid>
            )}
          </TossCardBody>
        </StudentsListCard>
      </ContentWrapper>

      {/* 삭제 확인 모달 */}
      <ModalBackdrop show={showDeleteModal} onClick={() => {
        setShowDeleteModal(false);
        setDeletingStudent(null);
      }}>
        <Modal onClick={(e) => e.stopPropagation()}>
          <ModalTitle>학생 삭제 확인</ModalTitle>
          <ModalContent>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#222', marginBottom: '12px' }}>
              {deletingStudent} 학생을 정말 삭제하시겠습니까?
            </div>
            <div style={{ fontSize: '14px', color: '#EF4444', lineHeight: '1.6' }}>
              ⚠️ 이 작업은 되돌릴 수 없습니다.
              <br />
              해당 학생의 모든 달란트 기록과 통계가 함께 삭제됩니다.
            </div>
          </ModalContent>
          <ModalButtons>
            <ModalButton
              className="cancel"
              onClick={() => {
                if (!isDeleting) {
                  setShowDeleteModal(false);
                  setDeletingStudent(null);
                }
              }}
              disabled={isDeleting}
            >
              취소
            </ModalButton>
            <ModalButton
              className="confirm"
              onClick={handleDeleteStudent}
              disabled={isDeleting}
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </ModalButton>
          </ModalButtons>
        </Modal>
      </ModalBackdrop>

      {/* 토스트 메시지 */}
      <Toast $show={toast.show}>
        {toast.message}
      </Toast>
    </TossStudentsContainer>
  );
};

export default TalantStudents;

