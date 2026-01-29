import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { db } from '../../firebase/config';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy, addDoc } from 'firebase/firestore';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';

const YearlyThemes = () => {
  const [themes, setThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    year: '',
    theme: '',
    direction: ['']
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, themeId: null });

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const q = query(collection(db, 'yearlyThemes'), orderBy('year', 'desc'));
      const querySnapshot = await getDocs(q);
      const themesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setThemes(themesList);
    } catch (error) {
      console.error('Error fetching themes:', error);
      alert('테마를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const yearStr = String(formData.year || '').trim();
    const themeStr = String(formData.theme || '').trim();

    if (!yearStr || !themeStr || isSubmitting) return;

    const filteredDirection = formData.direction.filter(item => item.trim() !== '');
    if (filteredDirection.length === 0) {
      alert('최소 하나의 비전을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const themeData = {
        year: yearStr,
        theme: themeStr,
        direction: filteredDirection,
        createdAt: new Date()
      };

      if (editingTheme) {
        await updateDoc(doc(db, 'yearlyThemes', editingTheme.id), {
          ...themeData,
          updatedAt: new Date()
        });
        alert('테마가 성공적으로 수정되었습니다!');
      } else {
        await addDoc(collection(db, 'yearlyThemes'), themeData);
        alert('새 테마가 성공적으로 등록되었습니다!');
      }

      clearForm();
      fetchThemes();
    } catch (error) {
      console.error('Error saving theme:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (theme) => {
    setEditingTheme(theme);
    setFormData({
      year: String(theme.year || ''),
      theme: theme.theme || '',
      direction: [...(theme.direction || [''])]
    });
    setShowForm(true);
  };

  const handleDelete = async (themeId) => {
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, 'yearlyThemes', themeId));
      setThemes(prevThemes => prevThemes.filter(theme => theme.id !== themeId));
      setDeleteConfirm({ isOpen: false, themeId: null });
      alert('테마가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting theme:', error);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addDirectionItem = () => {
    setFormData({
      ...formData,
      direction: [...formData.direction, '']
    });
  };

  const removeDirectionItem = (index) => {
    const newDirection = formData.direction.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      direction: newDirection
    });
  };

  const handleDirectionChange = (index, value) => {
    const newDirection = [...formData.direction];
    newDirection[index] = value;
    setFormData({
      ...formData,
      direction: newDirection
    });
  };

  const clearForm = () => {
    setFormData({
      year: '',
      theme: '',
      direction: ['']
    });
    setEditingTheme(null);
    setShowForm(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container>
      <MainContent>
        <HeaderSection>
          <StatBadge>
            <span>📊</span>
            <span>총 {themes.length}개</span>
          </StatBadge>
        </HeaderSection>

        <FormSection>
          <SectionTitle>
            <SectionIcon>{editingTheme ? '✏️' : '➕'}</SectionIcon>
            {editingTheme ? '테마 수정' : '새 테마 등록'}
            {!showForm && !editingTheme && (
              <AddButton onClick={() => setShowForm(true)}>
                <ButtonIcon>➕</ButtonIcon>
                새 테마 추가
              </AddButton>
            )}
          </SectionTitle>

          {(showForm || editingTheme) && (
            <FormCard>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>연도</Label>
                  <Input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="예: 2025"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>연간 주제</Label>
                  <ThemeTextarea
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    placeholder="연간 주제를 입력하세요. 줄바꿈은 \n으로 표시됩니다."
                    required
                  />
                  <HelpText>줄바꿈이 필요한 경우 Enter 키를 눌러주세요</HelpText>
                </FormGroup>

                <FormGroup>
                  <Label>비전 (Direction)</Label>
                  <DirectionContainer>
                    {formData.direction.map((item, index) => (
                      <DirectionGroup key={index}>
                        <DirectionNumber>{index + 1}</DirectionNumber>
                        {formData.direction.length > 1 && (
                          <RemoveButton type="button" onClick={() => removeDirectionItem(index)}>
                            <RemoveIcon>×</RemoveIcon>
                          </RemoveButton>
                        )}
                        <DirectionInput
                          value={item}
                          onChange={(e) => handleDirectionChange(index, e.target.value)}
                          placeholder={`비전 ${index + 1}을 입력하세요`}
                          required
                        />
                      </DirectionGroup>
                    ))}

                    <AddDirectionButton type="button" onClick={addDirectionItem}>
                      <AddIcon>+</AddIcon>
                      <AddText>비전 추가</AddText>
                    </AddDirectionButton>
                  </DirectionContainer>
                </FormGroup>

                <ButtonGroup>
                  <SubmitButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner />
                        처리 중...
                      </>
                    ) : (
                      <>
                        <ButtonIcon>{editingTheme ? '✏️' : '📝'}</ButtonIcon>
                        {editingTheme ? '수정하기' : '등록하기'}
                      </>
                    )}
                  </SubmitButton>

                  <CancelButton type="button" onClick={clearForm}>
                    <ButtonIcon>❌</ButtonIcon>
                    취소
                  </CancelButton>
                </ButtonGroup>
              </Form>
            </FormCard>
          )}
        </FormSection>

        <ListSection>
          <SectionTitle>
            <SectionIcon>📋</SectionIcon>
            등록된 테마 목록
          </SectionTitle>

          {isLoading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>테마를 불러오는 중...</LoadingText>
            </LoadingContainer>
          ) : themes.length === 0 ? (
            <EmptyState>
              <EmptyIcon>📅</EmptyIcon>
              <EmptyTitle>등록된 테마가 없습니다</EmptyTitle>
              <EmptyDescription>첫 번째 연간 테마를 등록해보세요!</EmptyDescription>
            </EmptyState>
          ) : (
            <ThemeList>
              {themes.map((theme, index) => (
                <ThemeCard key={theme.id} delay={index * 0.1}>
                  <CardHeader>
                    <ThemeInfo>
                      <YearBadge>{theme.year}년</YearBadge>
                      <ThemeDate>{formatDate(theme.createdAt)}</ThemeDate>
                    </ThemeInfo>
                    <CardActions>
                      <EditButton onClick={() => handleEdit(theme)}>
                        <ActionIcon>✏️</ActionIcon>
                      </EditButton>
                      <DeleteButton
                        onClick={() => setDeleteConfirm({ isOpen: true, themeId: theme.id })}
                        disabled={isSubmitting}
                      >
                        <ActionIcon>🗑️</ActionIcon>
                      </DeleteButton>
                    </CardActions>
                  </CardHeader>

                  <ThemeContent>
                    <ThemeText>{theme.theme}</ThemeText>
                  </ThemeContent>

                  <DirectionList>
                    <DirectionTitle>비전 ({theme.direction?.length || 0}개)</DirectionTitle>
                    {theme.direction && theme.direction.map((item, itemIndex) => (
                      <DirectionItem key={itemIndex}>
                        <ItemNumber>{itemIndex + 1}</ItemNumber>
                        <DirectionText>{item}</DirectionText>
                      </DirectionItem>
                    ))}
                  </DirectionList>
                </ThemeCard>
              ))}
            </ThemeList>
          )}
        </ListSection>
      </MainContent>

      {deleteConfirm.isOpen && (
        <DeleteModal onClick={() => !isSubmitting && setDeleteConfirm({ isOpen: false, themeId: null })}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalIcon>⚠️</ModalIcon>
            <ModalTitle>테마 삭제</ModalTitle>
            <ModalDescription>
              정말 이 테마를 삭제하시겠습니까?<br />
              <DeleteWarning>삭제된 데이터는 복구할 수 없습니다.</DeleteWarning>
            </ModalDescription>
            <ModalButtons>
              <DeleteConfirmButton
                onClick={() => handleDelete(deleteConfirm.themeId)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner />
                    삭제 중...
                  </>
                ) : (
                  <>
                    <ButtonIcon>🗑️</ButtonIcon>
                    삭제
                  </>
                )}
              </DeleteConfirmButton>
              <ModalCancelButton
                onClick={() => setDeleteConfirm({ isOpen: false, themeId: null })}
                disabled={isSubmitting}
              >
                <ButtonIcon>❌</ButtonIcon>
                취소
              </ModalCancelButton>
            </ModalButtons>
          </ModalContent>
        </DeleteModal>
      )}
    </Container>
  );
};

// 애니메이션
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// 스타일 컴포넌트
const Container = styled.div`
  min-height: 100vh;
  background-color: ${colors.background};
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${spacing['3xl']} ${spacing.lg};
  
  ${media['max-md']} {
    padding: ${spacing['2xl']} ${spacing.md};
  }
`;

const HeaderSection = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: ${spacing['3xl']};
  padding-bottom: ${spacing.xl};
  border-bottom: 1px solid ${colors.neutral[200]};
  animation: ${fadeInUp} 0.6s ease-out;

  ${media['max-md']} {
    flex-direction: column;
    align-items: flex-start;
    gap: ${spacing.lg};
  }
`;

const Title = styled.h1`
  font-size: ${typography.fontSize['3xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
  margin-bottom: ${spacing.xs};
  font-family: ${typography.fontFamily.heading};
`;

const Subtitle = styled.p`
  font-size: ${typography.fontSize.lg};
  color: ${colors.neutral[500]};
`;

const StatBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.sm} ${spacing.md};
  background-color: white;
  border: 1px solid ${colors.neutral[200]};
  border-radius: ${borderRadius.full};
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[600]};
  font-weight: ${typography.fontWeight.medium};
`;

const FormSection = styled.section`
  margin-bottom: ${spacing['4xl']};
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
`;

const ListSection = styled.section`
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  color: ${colors.neutral[800]};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.xl};
  font-family: ${typography.fontFamily.heading};
  justify-content: space-between;
`;

const SectionIcon = styled.span`
  font-size: ${typography.fontSize['2xl']};
  margin-right: ${spacing.sm};
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  background: ${colors.primary[50]};
  color: ${colors.primary[600]};
  border: 1px solid ${colors.primary[200]};
  border-radius: ${borderRadius.lg};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${colors.primary[100]};
    transform: translateY(-1px);
  }
`;

const FormCard = styled.div`
  background: white;
  border-radius: ${borderRadius.xl};
  box-shadow: ${shadows.md};
  padding: ${spacing['2xl']};
  border: 1px solid ${colors.neutral[200]};
  
  ${media['max-md']} {
    padding: ${spacing.xl};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xl};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const Label = styled.label`
  color: ${colors.neutral[700]};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.semibold};
`;

const Input = styled.input`
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.lg};
  font-size: ${typography.fontSize.base};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary[500]};
    box-shadow: 0 0 0 2px ${colors.primary[100]};
  }
`;

const ThemeTextarea = styled.textarea`
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.lg};
  font-size: ${typography.fontSize.base};
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary[500]};
    box-shadow: 0 0 0 2px ${colors.primary[100]};
  }
`;

const HelpText = styled.p`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.xs};
  margin-left: ${spacing.xs};
`;

const DirectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const DirectionGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.sm};
`;

const DirectionNumber = styled.div`
  width: 24px;
  height: 24px;
  border-radius: ${borderRadius.full};
  background: ${colors.primary[100]};
  color: ${colors.primary[700]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.bold};
  margin-top: 10px;
  flex-shrink: 0;
`;

const RemoveButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: ${borderRadius.full};
  border: none;
  background: ${colors.neutral[200]};
  color: ${colors.neutral[600]};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-top: 10px;
  
  &:hover {
    background: ${colors.red[100]};
    color: ${colors.red[600]};
  }
`;

const RemoveIcon = styled.span`
  line-height: 1;
`;

const DirectionInput = styled.textarea`
  flex: 1;
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.lg};
  font-size: ${typography.fontSize.base};
  resize: vertical;
  min-height: 48px;
  line-height: 1.5;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary[500]};
    box-shadow: 0 0 0 2px ${colors.primary[100]};
  }
`;

const AddDirectionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  padding: ${spacing.md};
  border: 1px dashed ${colors.neutral[300]};
  border-radius: ${borderRadius.lg};
  background: white;
  color: ${colors.neutral[600]};
  cursor: pointer;
  transition: all 0.2s;
  font-size: ${typography.fontSize.sm};
  
  &:hover {
    border-color: ${colors.primary[500]};
    color: ${colors.primary[600]};
    background: ${colors.primary[50]};
  }
`;

const AddIcon = styled.span``;
const AddText = styled.span``;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacing.md};
`;

const SubmitButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  padding: ${spacing.md};
  background: ${colors.primary[600]};
  color: white;
  border: none;
  border-radius: ${borderRadius.lg};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover:not(:disabled) {
    background: ${colors.primary[700]};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: ${spacing.md} ${spacing.xl};
  background: white;
  color: ${colors.neutral[600]};
  border: 1px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.lg};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${colors.neutral[50]};
    border-color: ${colors.neutral[400]};
  }
`;

const ButtonIcon = styled.span``;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: ${borderRadius.full};
  animation: ${spin} 1s linear infinite;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing['4xl']};
  color: ${colors.neutral[500]};
`;

const LoadingText = styled.p``;

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing['4xl']};
  background: white;
  border-radius: ${borderRadius.xl};
  border: 1px dashed ${colors.neutral[300]};
`;

const EmptyIcon = styled.div`
  font-size: ${typography.fontSize['4xl']};
  margin-bottom: ${spacing.md};
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  color: ${colors.neutral[800]};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.xs};
`;

const EmptyDescription = styled.p`
  color: ${colors.neutral[500]};
`;

const ThemeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const ThemeCard = styled.div`
  background: white;
  border-radius: ${borderRadius.xl};
  box-shadow: ${shadows.sm};
  border: 1px solid ${colors.neutral[200]};
  overflow: hidden;
  transition: all 0.2s;
  ${props => css`
    animation: ${fadeInUp} 0.5s ease-out ${props.delay}s both;
  `}
  
  &:hover {
    box-shadow: ${shadows.md};
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.lg};
  border-bottom: 1px solid ${colors.neutral[100]};
  background: ${colors.neutral[50]};
`;

const ThemeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
`;

const YearBadge = styled.div`
  background: ${colors.primary[600]};
  color: white;
  padding: 4px 12px;
  border-radius: ${borderRadius.full};
  font-weight: ${typography.fontWeight.bold};
  font-size: ${typography.fontSize.sm};
`;

const ThemeDate = styled.span`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.xs};
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
`;

const EditButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${borderRadius.lg};
  border: none;
  background: white;
  color: ${colors.neutral[400]};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border: 1px solid ${colors.neutral[200]};
  
  &:hover {
    background: ${colors.blue[50]};
    color: ${colors.blue[600]};
    border-color: ${colors.blue[200]};
  }
`;

const DeleteButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${borderRadius.lg};
  border: none;
  background: white;
  color: ${colors.neutral[400]};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border: 1px solid ${colors.neutral[200]};
  
  &:hover {
    background: ${colors.red[50]};
    color: ${colors.red[600]};
    border-color: ${colors.red[200]};
  }
`;

const ActionIcon = styled.span`
  font-size: ${typography.fontSize.sm};
`;

const ThemeContent = styled.div`
  padding: ${spacing.lg};
  border-bottom: 1px solid ${colors.neutral[100]};
`;

const ThemeText = styled.h3`
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[800]};
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.4;
`;

const DirectionList = styled.div`
  padding: ${spacing.lg};
  background: ${colors.neutral[50]};
`;

const DirectionTitle = styled.h4`
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[500]};
  margin-bottom: ${spacing.md};
  font-weight: ${typography.fontWeight.bold};
`;

const DirectionItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.md};
  margin-bottom: ${spacing.md};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ItemNumber = styled.div`
  width: 20px;
  height: 20px;
  border-radius: ${borderRadius.full};
  background: ${colors.primary[100]};
  color: ${colors.primary[700]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.bold};
  flex-shrink: 0;
  margin-top: 2px;
`;

const DirectionText = styled.p`
  color: ${colors.neutral[700]};
  font-size: ${typography.fontSize.base};
  line-height: 1.5;
  margin: 0;
`;

const DeleteModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: ${borderRadius.xl};
  padding: ${spacing['2xl']};
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: ${shadows.xl};
`;

const ModalIcon = styled.div`
  font-size: ${typography.fontSize['3xl']};
  margin-bottom: ${spacing.md};
`;

const ModalTitle = styled.h3`
  color: ${colors.neutral[900]};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.sm};
`;

const ModalDescription = styled.div`
  color: ${colors.neutral[600]};
  margin-bottom: ${spacing.xl};
`;

const DeleteWarning = styled.div`
  color: ${colors.red[500]};
  font-size: ${typography.fontSize.sm};
  margin-top: ${spacing.sm};
`;

const ModalButtons = styled.div`
  display: flex;
  gap: ${spacing.md};
`;

const DeleteConfirmButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  padding: ${spacing.md};
  background: ${colors.red[500]};
  color: white;
  border: none;
  border-radius: ${borderRadius.lg};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background: ${colors.red[600]};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ModalCancelButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  padding: ${spacing.md};
  background: white;
  color: ${colors.neutral[700]};
  border: 1px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.lg};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background: ${colors.neutral[50]};
  }
`;

export default YearlyThemes;
