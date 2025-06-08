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
    if (!formData.year.trim() || !formData.theme.trim() || isSubmitting) return;

    const filteredDirection = formData.direction.filter(item => item.trim() !== '');
    if (filteredDirection.length === 0) {
      alert('최소 하나의 비전을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const themeData = {
        year: formData.year.trim(),
        theme: formData.theme.trim(),
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
      year: theme.year,
      theme: theme.theme,
      direction: [...theme.direction]
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
      <BackgroundOverlay />
      
      <Header>
        <HeaderContent>
          <AdminBadge>
            <BadgeIcon>👑</BadgeIcon>
            <BadgeText>관리자</BadgeText>
          </AdminBadge>
          
          <TitleSection>
            <HeaderIcon>📅</HeaderIcon>
            <Title>연간 테마 관리</Title>
            <Subtitle>청년부 연간 주제와 비전 관리</Subtitle>
          </TitleSection>
          
          <StatsCard>
            <StatsIcon>📊</StatsIcon>
            <StatsText>총 {themes.length}개의 테마가 등록되어 있습니다</StatsText>
          </StatsCard>
        </HeaderContent>
      </Header>

      <MainContent>
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
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    placeholder="예: 2025"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>연간 주제</Label>
                  <ThemeTextarea
                    value={formData.theme}
                    onChange={(e) => setFormData({...formData, theme: e.target.value})}
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
              정말 이 테마를 삭제하시겠습니까?<br/>
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
    transform: translateY(30px);
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

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
      radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, rgba(236, 72, 153, 0.03) 0%, transparent 50%);
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
      radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  }
`;

const HeaderContent = styled.div`
  position: relative;
  padding: ${spacing['4xl']} ${spacing['2xl']} ${spacing['3xl']};
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  
  ${media['max-md']} {
    padding: ${spacing['3xl']} ${spacing.lg} ${spacing['2xl']};
  }
`;

const AdminBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.sm};
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${borderRadius.full};
  padding: ${spacing.sm} ${spacing.lg};
  margin-bottom: ${spacing.xl};
  animation: ${fadeInUp} 0.8s ease-out;
`;

const BadgeIcon = styled.span`
  font-size: ${typography.fontSize.lg};
`;

const BadgeText = styled.span`
  color: white;
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
`;

const TitleSection = styled.div`
  margin-bottom: ${spacing.xl};
`;

const HeaderIcon = styled.div`
  font-size: ${typography.fontSize['4xl']};
  margin-bottom: ${spacing.lg};
  animation: ${float} 3s ease-in-out infinite, ${fadeInUp} 0.8s ease-out 0.2s both;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  
  ${media['max-md']} {
    font-size: ${typography.fontSize['3xl']};
  }
`;

const Title = styled.h1`
  color: white;
  font-size: ${typography.fontSize['4xl']};
  font-weight: ${typography.fontWeight.extrabold};
  margin-bottom: ${spacing.sm};
  font-family: ${typography.fontFamily.heading};
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  
  ${media['max-md']} {
    font-size: ${typography.fontSize['2xl']};
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.medium};
  animation: ${fadeInUp} 0.8s ease-out 0.6s both;
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.lg};
  }
`;

const StatsCard = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.sm};
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: ${borderRadius.xl};
  padding: ${spacing.lg} ${spacing.xl};
  animation: ${fadeInUp} 0.8s ease-out 0.8s both;
  
  ${media['max-md']} {
    padding: ${spacing.md} ${spacing.lg};
  }
`;

const StatsIcon = styled.span`
  font-size: ${typography.fontSize.lg};
`;

const StatsText = styled.span`
  color: white;
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.medium};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.sm};
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${spacing['3xl']} ${spacing.lg};
  
  ${media['max-md']} {
    padding: ${spacing['2xl']} ${spacing.md};
  }
`;

const FormSection = styled.section`
  margin-bottom: ${spacing['4xl']};
  animation: ${fadeInUp} 0.8s ease-out 1s both;
`;

const ListSection = styled.section`
  animation: ${fadeInUp} 0.8s ease-out 1.2s both;
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.lg};
  color: ${colors.neutral[800]};
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing['2xl']};
  font-family: ${typography.fontFamily.heading};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.xl};
    margin-bottom: ${spacing.xl};
    flex-direction: column;
    align-items: flex-start;
  }
`;

const SectionIcon = styled.span`
  font-size: ${typography.fontSize['2xl']};
  margin-right: ${spacing.md};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.xl};
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.md} ${spacing.lg};
  background: ${colors.gradients.primary};
  color: white;
  border: none;
  border-radius: ${borderRadius.xl};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.lg};
  }
  
  ${media['max-md']} {
    padding: ${spacing.sm} ${spacing.md};
  }
`;

const FormCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${borderRadius['2xl']};
  box-shadow: ${shadows.lg};
  padding: ${spacing['3xl']};
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  ${media['max-md']} {
    padding: ${spacing['2xl']};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing['2xl']};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const Label = styled.label`
  color: ${colors.neutral[700]};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.base};
  }
`;

const Input = styled.input`
  padding: ${spacing.lg};
  border: 2px solid ${colors.neutral[200]};
  border-radius: ${borderRadius.xl};
  font-size: ${typography.fontSize.base};
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  
  &:focus {
    outline: none;
    border-color: ${colors.primary[400]};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background: rgba(255, 255, 255, 0.95);
  }
  
  &::placeholder {
    color: ${colors.neutral[400]};
  }
`;

const ThemeTextarea = styled.textarea`
  padding: ${spacing.lg};
  border: 2px solid ${colors.neutral[200]};
  border-radius: ${borderRadius.xl};
  font-size: ${typography.fontSize.base};
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  line-height: 1.5;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary[400]};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background: rgba(255, 255, 255, 0.95);
  }
  
  &::placeholder {
    color: ${colors.neutral[400]};
  }
`;

const HelpText = styled.p`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.sm};
  margin: -${spacing.md} 0 0 0;
`;

const DirectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const DirectionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  background: rgba(255, 255, 255, 0.6);
  border-radius: ${borderRadius.xl};
  padding: ${spacing.md};
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const DirectionNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${borderRadius.full};
  background: ${colors.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.bold};
  flex-shrink: 0;
`;

const RemoveButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${borderRadius.full};
  border: none;
  background: ${colors.red[500]};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
  
  &:hover {
    background: ${colors.red[600]};
    transform: scale(1.1);
  }
`;

const RemoveIcon = styled.span`
  font-size: ${typography.fontSize.lg};
  font-weight: bold;
`;

const DirectionInput = styled.textarea`
  flex: 1;
  padding: ${spacing.lg};
  border: none;
  border-radius: ${borderRadius.lg};
  font-size: ${typography.fontSize.base};
  background: transparent;
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
  line-height: 1.5;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: ${colors.neutral[400]};
  }
`;

const AddDirectionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.lg};
  border: 2px dashed ${colors.primary[300]};
  border-radius: ${borderRadius.xl};
  background: rgba(59, 130, 246, 0.05);
  color: ${colors.primary[600]};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.medium};
  
  &:hover {
    border-color: ${colors.primary[400]};
    background: rgba(59, 130, 246, 0.1);
    transform: translateY(-2px);
  }
`;

const AddIcon = styled.span`
  font-size: ${typography.fontSize.lg};
  font-weight: bold;
`;

const AddText = styled.span``;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacing.lg};
  
  ${media['max-md']} {
    flex-direction: column;
  }
`;

const SubmitButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  padding: ${spacing.lg} ${spacing.xl};
  background: ${colors.gradients.primary};
  color: white;
  border: none;
  border-radius: ${borderRadius.xl};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${shadows.lg};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  padding: ${spacing.lg} ${spacing.xl};
  background: rgba(255, 255, 255, 0.8);
  color: ${colors.neutral[600]};
  border: 2px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.xl};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.95);
    border-color: ${colors.neutral[400]};
    transform: translateY(-2px);
  }
`;

const ButtonIcon = styled.span`
  font-size: ${typography.fontSize.base};
`;

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
  gap: ${spacing.lg};
  padding: ${spacing['4xl']};
  color: ${colors.neutral[600]};
`;

const LoadingText = styled.p`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.medium};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing['4xl']};
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${borderRadius['2xl']};
  box-shadow: ${shadows.lg};
`;

const EmptyIcon = styled.div`
  font-size: ${typography.fontSize['4xl']};
  margin-bottom: ${spacing.lg};
  animation: ${pulse} 2s ease-in-out infinite;
`;

const EmptyTitle = styled.h3`
  color: ${colors.neutral[700]};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.sm};
  font-family: ${typography.fontFamily.heading};
`;

const EmptyDescription = styled.p`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.base};
`;

const ThemeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xl};
`;

const ThemeCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${borderRadius['2xl']};
  box-shadow: ${shadows.lg};
  overflow: hidden;
  transition: all 0.4s ease;
  ${props => css`
    animation: ${fadeInUp} 0.8s ease-out ${1.4 + props.delay}s both;
  `}
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${shadows['2xl']};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing['2xl']};
  background: rgba(255, 255, 255, 0.5);
  
  ${media['max-md']} {
    padding: ${spacing.xl};
  }
`;

const ThemeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.lg};
`;

const YearBadge = styled.div`
  background: ${colors.gradients.primary};
  color: white;
  padding: ${spacing.sm} ${spacing.lg};
  border-radius: ${borderRadius.full};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.bold};
`;

const ThemeDate = styled.p`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.sm};
  margin: 0;
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const EditButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: ${borderRadius.lg};
  border: none;
  background: rgba(59, 130, 246, 0.1);
  color: ${colors.primary[600]};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(59, 130, 246, 0.2);
    transform: scale(1.1);
  }
`;

const DeleteButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: ${borderRadius.lg};
  border: none;
  background: rgba(239, 68, 68, 0.1);
  color: ${colors.red[600]};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.2);
    transform: scale(1.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ActionIcon = styled.span`
  font-size: ${typography.fontSize.base};
`;

const ThemeContent = styled.div`
  padding: 0 ${spacing['2xl']} ${spacing.xl};
  
  ${media['max-md']} {
    padding: 0 ${spacing.xl} ${spacing.lg};
  }
`;

const ThemeText = styled.p`
  color: ${colors.neutral[700]};
  font-size: ${typography.fontSize.lg};
  line-height: ${typography.lineHeight.relaxed};
  margin: 0;
  white-space: pre-wrap;
  font-weight: ${typography.fontWeight.medium};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.base};
  }
`;

const DirectionList = styled.div`
  padding: 0 ${spacing['2xl']} ${spacing['2xl']};
  
  ${media['max-md']} {
    padding: 0 ${spacing.xl} ${spacing.xl};
  }
`;

const DirectionTitle = styled.h4`
  color: ${colors.neutral[700]};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.semibold};
  margin-bottom: ${spacing.lg};
`;

const DirectionItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.lg};
  padding: ${spacing.lg};
  background: rgba(255, 255, 255, 0.6);
  border-radius: ${borderRadius.xl};
  margin-bottom: ${spacing.lg};
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ItemNumber = styled.div`
  width: 28px;
  height: 28px;
  border-radius: ${borderRadius.full};
  background: ${colors.gradients.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.bold};
  flex-shrink: 0;
`;

const DirectionText = styled.p`
  color: ${colors.neutral[700]};
  font-size: ${typography.fontSize.base};
  line-height: ${typography.lineHeight.relaxed};
  margin: 0;
  flex: 1;
`;

const DeleteModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContent = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${borderRadius['2xl']};
  padding: ${spacing['3xl']};
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: ${shadows['2xl']};
  animation: ${fadeInUp} 0.3s ease-out;
`;

const ModalIcon = styled.div`
  font-size: ${typography.fontSize['4xl']};
  margin-bottom: ${spacing.lg};
`;

const ModalTitle = styled.h3`
  color: ${colors.neutral[800]};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.lg};
  font-family: ${typography.fontFamily.heading};
`;

const ModalDescription = styled.p`
  color: ${colors.neutral[600]};
  font-size: ${typography.fontSize.base};
  line-height: ${typography.lineHeight.relaxed};
  margin-bottom: ${spacing['2xl']};
`;

const ModalButtons = styled.div`
  display: flex;
  gap: ${spacing.lg};
  
  ${media['max-md']} {
    flex-direction: column;
  }
`;

const DeleteConfirmButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  padding: ${spacing.lg};
  background: ${colors.red[500]};
  color: white;
  border: none;
  border-radius: ${borderRadius.xl};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: ${colors.red[600]};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const ModalCancelButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  padding: ${spacing.lg};
  background: rgba(255, 255, 255, 0.8);
  color: ${colors.neutral[600]};
  border: 2px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.xl};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.95);
    border-color: ${colors.neutral[400]};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const DeleteWarning = styled.span`
  color: ${colors.red[600]};
  font-weight: ${typography.fontWeight.semibold};
  font-size: ${typography.fontSize.sm};
`;

export default YearlyThemes; 