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
    directions: ['']
  });

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const q = query(collection(db, 'yearlyThemes'), orderBy('year', 'desc'));
      const querySnapshot = await getDocs(q);
      const themesList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Handle both 'direction' and 'directions' fields for compatibility
        return {
          id: doc.id,
          ...data,
          directions: data.direction || data.directions || []
        };
      });
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

    const filteredDirections = formData.directions.filter(item => item.trim() !== '');
    if (filteredDirections.length === 0) {
      alert('최소 하나의 비전을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const themeData = {
        year: yearStr,
        theme: themeStr,
        direction: filteredDirections, // Use 'direction' to match existing DB schema if needed
        directions: filteredDirections, // Save both or prefer one? Let's save 'direction' as per previous code, or migrate. 
        // valid: previous code used 'direction'. Let's stick to 'direction' for DB consistency but 'directions' for UI state.
        createdAt: new Date()
      };

      if (editingTheme) {
        await updateDoc(doc(db, 'yearlyThemes', editingTheme.id), {
          year: yearStr,
          theme: themeStr,
          direction: filteredDirections,
          updatedAt: new Date()
        });
        alert('테마가 성공적으로 수정되었습니다!');
      } else {
        await addDoc(collection(db, 'yearlyThemes'), {
          year: yearStr,
          theme: themeStr,
          direction: filteredDirections,
          createdAt: new Date()
        });
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
      directions: [...(theme.directions || theme.direction || [''])]
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (themeId) => {
    if (!window.confirm('정말 이 테마를 삭제하시겠습니까?')) return;

    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, 'yearlyThemes', themeId));
      setThemes(prevThemes => prevThemes.filter(theme => theme.id !== themeId));
      alert('테마가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting theme:', error);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addDirection = () => {
    setFormData({
      ...formData,
      directions: [...formData.directions, '']
    });
  };

  const removeDirection = (index) => {
    const newDirections = formData.directions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      directions: newDirections
    });
  };

  const handleDirectionChange = (index, value) => {
    const newDirections = [...formData.directions];
    newDirections[index] = value;
    setFormData({
      ...formData,
      directions: newDirections
    });
  };

  const clearForm = () => {
    setFormData({
      year: '',
      theme: '',
      directions: ['']
    });
    setEditingTheme(null);
    setShowForm(false);
  };

  return (
    <Container>
      <MainContent>
        <HeaderSection>
          <Title>연간 표어 관리</Title>
          <Stats>
            <StatText>총 {themes.length}개</StatText>
          </Stats>
        </HeaderSection>

        <FormSection>
          <FormTitle>{editingTheme ? '표어 수정' : '새 표어 등록'}</FormTitle>
          {!showForm && !editingTheme ? (
            <AddButton onClick={() => setShowForm(true)}>
              + 새 표어 등록하기
            </AddButton>
          ) : (
            <Form onSubmit={handleSubmit}>
              <FormRow>
                <InputGroup style={{ flex: '0 0 100px' }}>
                  <Input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="연도"
                    required
                  />
                </InputGroup>
                <InputGroup style={{ flex: 1 }}>
                  <Input
                    type="text"
                    name="theme"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    placeholder="표어 (예: 믿음으로 승리하는 공동체)"
                    required
                  />
                </InputGroup>
              </FormRow>

              <InputGroup>
                <Label>비전/실천사항</Label>
                <DirectionList>
                  {formData.directions.map((direction, index) => (
                    <DirectionItem key={index}>
                      <DirectionNumber>{index + 1}</DirectionNumber>
                      <DirectionInput
                        value={direction}
                        onChange={(e) => handleDirectionChange(index, e.target.value)}
                        placeholder="비전/실천사항 입력"
                      />
                      {formData.directions.length > 1 && (
                        <RemoveButton type="button" onClick={() => removeDirection(index)}>×</RemoveButton>
                      )}
                    </DirectionItem>
                  ))}
                  <AddDirectionButton type="button" onClick={addDirection}>
                    + 항목 추가
                  </AddDirectionButton>
                </DirectionList>
              </InputGroup>

              <FormActions>
                <CancelButton type="button" onClick={clearForm}>
                  취소
                </CancelButton>
                <SubmitButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '처리 중...' : (editingTheme ? '수정 완료' : '등록하기')}
                </SubmitButton>
              </FormActions>
            </Form>
          )}
        </FormSection>

        <ListSection>
          <ListTitle>등록된 표어</ListTitle>
          {isLoading ? (
            <Message>불러오는 중...</Message>
          ) : themes.length === 0 ? (
            <Message>등록된 표어가 없습니다.</Message>
          ) : (
            <ThemeList>
              {themes.map((theme) => (
                <ThemeItem key={theme.id}>
                  <ThemeHeader>
                    <ThemeYear>{theme.year}</ThemeYear>
                    <ThemeTitle>{theme.theme}</ThemeTitle>
                    <Controls>
                      <IconButton onClick={() => handleEdit(theme)} title="수정">✏️</IconButton>
                      <IconButton onClick={() => handleDelete(theme.id)} title="삭제">🗑️</IconButton>
                    </Controls>
                  </ThemeHeader>
                  <ThemeContent>
                    {theme.directions && theme.directions.map((dir, i) => (
                      <DirectionRow key={i}>
                        <DirectionDot />
                        <DirectionText>{dir}</DirectionText>
                      </DirectionRow>
                    ))}
                  </ThemeContent>
                </ThemeItem>
              ))}
            </ThemeList>
          )}
        </ListSection>
      </MainContent>
    </Container>
  );
};

// Minimal Styles
const Container = styled.div`
  min-height: 100vh;
  background-color: #ffffff;
  padding: ${spacing.xl};
`;

const MainContent = styled.main`
  max-width: 800px;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  margin-bottom: ${spacing.xl};
  border-bottom: 2px solid ${colors.neutral[100]};
  padding-bottom: ${spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const Title = styled.h1`
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
`;

const Stats = styled.div`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.sm};
`;

const StatText = styled.span``;

const FormSection = styled.div`
  background: ${colors.neutral[50]};
  padding: ${spacing.xl};
  border-radius: ${borderRadius.lg};
  margin-bottom: ${spacing['2xl']};
  border: 1px solid ${colors.neutral[100]};
`;

const FormTitle = styled.h2`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[800]};
  margin-bottom: ${spacing.lg};
`;

const AddButton = styled.button`
  width: 100%;
  padding: ${spacing.lg};
  background: white;
  border: 1px dashed ${colors.neutral[300]};
  border-radius: ${borderRadius.lg};
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.base};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${colors.neutral[900]};
    color: ${colors.neutral[900]};
    background: white;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const FormRow = styled.div`
  display: flex;
  gap: ${spacing.md};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

const Label = styled.label`
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[700]};
`;

const Input = styled.input`
  width: 100%;
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSize.base};
  background: white;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${colors.neutral[900]};
  }
`;

const DirectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const DirectionItem = styled.div`
  display: flex;
  gap: ${spacing.sm};
  align-items: center;
`;

const DirectionNumber = styled.span`
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[500]};
  width: 20px;
  text-align: center;
`;

const DirectionInput = styled(Input)`
  flex: 1;
`;

const RemoveButton = styled.button`
  color: ${colors.neutral[400]};
  background: none;
  border: none;
  font-size: ${typography.fontSize.lg};
  padding: 0 ${spacing.sm};
  cursor: pointer;
  
  &:hover {
    color: ${colors.red[500]};
  }
`;

const AddDirectionButton = styled.button`
  align-self: flex-start;
  color: ${colors.neutral[600]};
  background: none;
  border: none;
  font-size: ${typography.fontSize.sm};
  padding: ${spacing.sm} 0;
  cursor: pointer;
  
  &:hover {
    color: ${colors.neutral[900]};
    text-decoration: underline;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${spacing.sm};
  margin-top: ${spacing.md};
`;

const SubmitButton = styled.button`
  background: ${colors.neutral[900]};
  color: white;
  border: none;
  padding: ${spacing.md} ${spacing.xl};
  border-radius: ${borderRadius.md};
  font-weight: ${typography.fontWeight.bold};
  font-size: ${typography.fontSize.sm};
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const CancelButton = styled.button`
  background: white;
  color: ${colors.neutral[600]};
  border: 1px solid ${colors.neutral[300]};
  padding: ${spacing.md} ${spacing.lg};
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSize.sm};
  cursor: pointer;
  
  &:hover {
    background: ${colors.neutral[50]};
  }
`;

const ListSection = styled.div``;

const ListTitle = styled.h2`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[800]};
  margin-bottom: ${spacing.lg};
`;

const ThemeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const ThemeItem = styled.div`
  background: white;
  border: 1px solid ${colors.neutral[200]};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.lg};
  transition: all 0.2s;
  
  &:hover {
    border-color: ${colors.neutral[400]};
  }
`;

const ThemeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  margin-bottom: ${spacing.md};
  padding-bottom: ${spacing.sm};
  border-bottom: 1px solid ${colors.neutral[100]};
`;

const ThemeYear = styled.span`
  background: ${colors.neutral[900]};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: ${typography.fontSize.sm};
  font-weight: bold;
`;

const ThemeTitle = styled.h3`
  flex: 1;
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
`;

const Controls = styled.div`
  display: flex;
  gap: ${spacing.sm};
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

const ThemeContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

const DirectionRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const DirectionDot = styled.div`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${colors.neutral[400]};
`;

const DirectionText = styled.span`
  color: ${colors.neutral[700]};
  font-size: ${typography.fontSize.base};
`;

const Message = styled.p`
  color: ${colors.neutral[500]};
  text-align: center;
  padding: ${spacing.xl};
`;

export default YearlyThemes;
