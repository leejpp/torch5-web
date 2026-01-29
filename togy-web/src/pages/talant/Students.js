import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { loadStudentsFromFirebase, addStudent, deleteStudent } from '../../utils/talantUtils';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';

const TalantStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStudentName, setNewStudentName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Toast Function
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  }, []);

  // Load Students
  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const studentList = await loadStudentsFromFirebase();
      setStudents(studentList);
    } catch (error) {
      console.error('학생 목록 로드 실패:', error);
      showToast('학생 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Add Student
  const handleAddStudent = useCallback(async (e) => {
    e.preventDefault();

    if (!newStudentName.trim()) {
      showToast('학생 이름을 입력해주세요.', 'error');
      return;
    }

    if (students.includes(newStudentName.trim())) {
      showToast('이미 존재하는 학생입니다.', 'error');
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
      showToast(error.message || '학생 추가에 실패했습니다.', 'error');
    } finally {
      setIsAdding(false);
    }
  }, [newStudentName, students, loadStudents, showToast]);

  // Open Delete Modal
  const handleDeleteClick = useCallback((studentName) => {
    setDeletingStudent(studentName);
    setShowDeleteModal(true);
  }, []);

  // Delete Student
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
      showToast(error.message || '학생 삭제에 실패했습니다.', 'error');
    } finally {
      setIsDeleting(false);
    }
  }, [deletingStudent, isDeleting, loadStudents, showToast]);

  return (
    <PageContainer>
      <ContentArea>
        {/* Add Student Form */}
        <Section $delay="0.1s">
          <SectionHeader>
            <SectionTitle>새 학생 추가</SectionTitle>
          </SectionHeader>
          <Card>
            <AddForm onSubmit={handleAddStudent}>
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
            </AddForm>
          </Card>
        </Section>

        {/* Student List */}
        <Section $delay="0.2s">
          <SectionHeader>
            <SectionTitle>학생 목록</SectionTitle>
            <CountBadge>총 {students.length}명</CountBadge>
          </SectionHeader>

          <Card>
            {loading ? (
              <LoadingState>로딩 중...</LoadingState>
            ) : students.length === 0 ? (
              <EmptyState>
                <div className="icon">👥</div>
                <p>등록된 학생이 없습니다.</p>
              </EmptyState>
            ) : (
              <Grid>
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
              </Grid>
            )}
          </Card>
        </Section>
      </ContentArea>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ModalBackdrop onClick={() => !isDeleting && setShowDeleteModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>학생 삭제 확인</ModalTitle>
            <ModalContent>
              <p className="confirm-text">
                <strong>{deletingStudent}</strong> 학생을 정말 삭제하시겠습니까?
              </p>
              <p className="warning-text">
                ⚠️ 이 작업은 되돌릴 수 없습니다.<br />
                해당 학생의 모든 달란트 기록과 통계가 함께 삭제됩니다.
              </p>
            </ModalContent>
            <ModalButtons>
              <ModalButton
                $variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                취소
              </ModalButton>
              <ModalButton
                $variant="danger"
                onClick={handleDeleteStudent}
                disabled={isDeleting}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </ModalButton>
            </ModalButtons>
          </Modal>
        </ModalBackdrop>
      )}

      {/* Toast */}
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

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: ${colors.neutral[50]};
`;



const ContentArea = styled.main`
  padding: ${spacing.xl};
  width: 100%;
  
  ${media['max-md']} {
    padding: ${spacing.md};
  }
`;

const Section = styled.section`
  margin-bottom: ${spacing.xl};
  animation: ${fadeIn} 0.5s ease-out ${props => props.$delay || '0s'} both;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.md};
`;

const SectionTitle = styled.h2`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[800]};
  margin: 0;
`;

const CountBadge = styled.span`
  background: ${colors.neutral[200]};
  color: ${colors.neutral[600]};
  padding: 2px 8px;
  border-radius: ${borderRadius.full};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.bold};
`;

const Card = styled.div`
  background: white;
  border-radius: ${borderRadius.xl};
  padding: ${spacing.lg};
  box-shadow: ${shadows.sm};
  border: 1px solid ${colors.neutral[200]};
`;

const AddForm = styled.form`
  display: flex;
  gap: ${spacing.md};
  align-items: flex-end;
  
  ${media['max-md']} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const InputGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

const Label = styled.label`
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.neutral[600]};
`;

const Input = styled.input`
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.lg};
  font-size: ${typography.fontSize.base};
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary[500]};
    box-shadow: 0 0 0 3px ${colors.primary[100]};
  }
  
  &:disabled {
    background: ${colors.neutral[50]};
    cursor: not-allowed;
  }
`;

const AddButton = styled.button`
  padding: ${spacing.md} ${spacing.xl};
  background: ${colors.primary[600]};
  color: white;
  border: none;
  border-radius: ${borderRadius.lg};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.bold};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: ${colors.primary[700]};
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: ${colors.neutral[300]};
    cursor: not-allowed;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${spacing.md};
  
  ${media['max-md']} {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
`;

const StudentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.md};
  background: ${colors.neutral[50]};
  border: 1px solid ${colors.neutral[200]};
  border-radius: ${borderRadius.lg};
  transition: all 0.2s;
  
  &:hover {
    border-color: ${colors.primary[300]};
    background: white;
    box-shadow: ${shadows.sm};
  }
`;

const StudentName = styled.span`
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.neutral[800]};
`;

const DeleteButton = styled.button`
  padding: 4px 8px;
  background: ${colors.error[50]};
  color: ${colors.error[600]};
  border: 1px solid ${colors.error[100]};
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.bold};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${colors.error[100]};
    border-color: ${colors.error[200]};
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${spacing['4xl']};
  color: ${colors.neutral[500]};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing['4xl']};
  color: ${colors.neutral[500]};
  
  .icon {
    font-size: ${typography.fontSize['4xl']};
    margin-bottom: ${spacing.md};
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: white;
  border-radius: ${borderRadius.xl};
  padding: ${spacing.xl};
  width: 90%;
  max-width: 400px;
  box-shadow: ${shadows.xl};
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalTitle = styled.h3`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
  margin: 0 0 ${spacing.md} 0;
`;

const ModalContent = styled.div`
  margin-bottom: ${spacing.xl};
  
  .confirm-text {
    font-size: ${typography.fontSize.base};
    color: ${colors.neutral[800]};
    margin-bottom: ${spacing.md};
  }
  
  .warning-text {
    font-size: ${typography.fontSize.sm};
    color: ${colors.error[600]};
    background: ${colors.error[50]};
    padding: ${spacing.md};
    border-radius: ${borderRadius.lg};
    line-height: 1.5;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: ${spacing.md};
`;

const ModalButton = styled.button`
  flex: 1;
  padding: ${spacing.md};
  border: none;
  border-radius: ${borderRadius.lg};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.bold};
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.$variant === 'secondary' && `
    background: ${colors.neutral[100]};
    color: ${colors.neutral[700]};
    &:hover { background: ${colors.neutral[200]}; }
  `}
  
  ${props => props.$variant === 'danger' && `
    background: ${colors.error[600]};
    color: white;
    &:hover { background: ${colors.error[700]}; }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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

export default TalantStudents;
