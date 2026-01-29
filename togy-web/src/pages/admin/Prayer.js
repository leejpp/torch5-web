import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { db } from '../../firebase/config';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, orderBy, setDoc, deleteField } from 'firebase/firestore';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';

const Prayer = () => {
  const [name, setName] = useState('');
  const [prayerItems, setPrayerItems] = useState(['']);
  const [prayers, setPrayers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [openPrayerId, setOpenPrayerId] = useState(null);
  const [editingPrayer, setEditingPrayer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, prayerId: null });
  const [isPinning, setIsPinning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPrayers();
  }, []);

  const fetchPrayers = async () => {
    try {
      const q = query(collection(db, 'prayerRequests'), orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const prayerList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPrayers(prayerList);
    } catch (error) {
      console.error("Error fetching prayers:", error);
      alert('기도제목을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    const filteredItems = prayerItems.filter(item => item.trim() !== '');
    if (filteredItems.length === 0) {
      alert('최소 하나의 기도제목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'prayerRequests', name.trim()), {
        prayerItems: filteredItems,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setName('');
      setPrayerItems(['']);
      fetchPrayers();
      alert('기도제목이 성공적으로 등록되었습니다!');
    } catch (error) {
      console.error("Error adding prayer:", error);
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingPrayer) return;

    const filteredItems = prayerItems.filter(item => item.trim() !== '');
    if (filteredItems.length === 0) {
      alert('최소 하나의 기도제목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'prayerRequests', editingPrayer.id), {
        prayerItems: filteredItems,
        updatedAt: new Date()
      });

      setName('');
      setPrayerItems(['']);
      setEditingPrayer(null);
      fetchPrayers();
      alert('기도제목이 성공적으로 수정되었습니다!');
    } catch (error) {
      console.error("Error updating prayer:", error);
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (prayerId) => {
    if (isDeleting) return;

    const prayerToDelete = prayers.find(p => p.id === prayerId);
    if (!prayerToDelete) {
      alert('삭제할 기도제목을 찾을 수 없습니다.');
      setDeleteConfirm({ isOpen: false, prayerId: null });
      return;
    }

    setIsDeleting(true);
    try {
      // Firestore에서 문서 삭제
      await deleteDoc(doc(db, 'prayerRequests', prayerId));

      // 로컬 상태에서 즉시 제거 (UI 응답성 향상)
      setPrayers(prevPrayers => prevPrayers.filter(prayer => prayer.id !== prayerId));

      // 관련 상태 초기화
      if (editingPrayer && editingPrayer.id === prayerId) {
        clearForm();
      }
      if (openPrayerId === prayerId) {
        setOpenPrayerId(null);
      }

      setDeleteConfirm({ isOpen: false, prayerId: null });
      alert(`"${prayerToDelete.id}"님의 기도제목이 성공적으로 삭제되었습니다.`);
    } catch (error) {
      console.error("Error deleting prayer:", error);

      // 구체적인 에러 메시지 제공
      let errorMessage = '삭제 중 오류가 발생했습니다.';
      if (error.code === 'permission-denied') {
        errorMessage = '삭제 권한이 없습니다. 관리자 권한을 확인해주세요.';
      } else if (error.code === 'not-found') {
        errorMessage = '삭제할 기도제목을 찾을 수 없습니다.';
      } else if (error.code === 'unavailable') {
        errorMessage = '네트워크 연결을 확인하고 다시 시도해주세요.';
      }

      alert(errorMessage);

      // 실패 시 데이터 다시 가져오기
      fetchPrayers();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (prayer) => {
    setEditingPrayer(prayer);
    setName(prayer.id);
    setPrayerItems([...prayer.prayerItems]);
  };

  const addPrayerItem = () => {
    setPrayerItems([...prayerItems, '']);
  };

  const removePrayerItem = (index) => {
    setPrayerItems(prayerItems.filter((_, i) => i !== index));
  };

  const handlePrayerItemChange = (index, value) => {
    const newItems = [...prayerItems];
    newItems[index] = value;
    setPrayerItems(newItems);
  };

  const togglePrayer = (id) => {
    setOpenPrayerId(openPrayerId === id ? null : id);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearForm = () => {
    setName('');
    setPrayerItems(['']);
    setEditingPrayer(null);
  };

  // 핀 기능 관련 함수들
  const getPinnedCount = () => {
    return prayers.filter(prayer => prayer.isPinned).length;
  };

  const handleTogglePin = async (prayerId) => {
    if (isPinning) return;

    const prayer = prayers.find(p => p.id === prayerId);
    if (!prayer) return;

    const currentlyPinned = prayer.isPinned;
    const pinnedCount = getPinnedCount();

    // 핀을 추가하려는데 이미 3개가 고정되어 있다면
    if (!currentlyPinned && pinnedCount >= 3) {
      alert('최대 3개의 기도제목만 고정할 수 있습니다.');
      return;
    }

    setIsPinning(true);
    try {
      let updateData;

      // 핀을 설정하는 경우
      if (!currentlyPinned) {
        updateData = {
          isPinned: true,
          pinnedAt: new Date(),
          updatedAt: new Date()
        };
      } else {
        // 핀을 해제하는 경우 - pinnedAt 필드 완전 삭제
        updateData = {
          isPinned: false,
          pinnedAt: deleteField(),
          updatedAt: new Date()
        };
      }

      await updateDoc(doc(db, 'prayerRequests', prayerId), updateData);

      // 로컬 상태 업데이트
      setPrayers(prevPrayers =>
        prevPrayers.map(p => {
          if (p.id === prayerId) {
            const updatedPrayer = { ...p };
            updatedPrayer.isPinned = !currentlyPinned;
            updatedPrayer.updatedAt = new Date();

            if (!currentlyPinned) {
              // 핀 설정
              updatedPrayer.pinnedAt = new Date();
            } else {
              // 핀 해제 - pinnedAt 필드 제거
              delete updatedPrayer.pinnedAt;
            }

            return updatedPrayer;
          }
          return p;
        })
      );

      const action = !currentlyPinned ? '고정' : '고정 해제';
      alert(`기도제목이 성공적으로 ${action}되었습니다.`);
    } catch (error) {
      console.error("Error toggling pin:", error);

      // 구체적인 에러 메시지 제공
      let errorMessage = '핀 설정 중 오류가 발생했습니다.';
      if (error.code === 'permission-denied') {
        errorMessage = '핀 설정 권한이 없습니다. 관리자 권한을 확인해주세요.';
      } else if (error.code === 'not-found') {
        errorMessage = '해당 기도제목을 찾을 수 없습니다.';
      } else if (error.code === 'unavailable') {
        errorMessage = '네트워크 연결을 확인하고 다시 시도해주세요.';
      }

      alert(errorMessage);

      // 실패 시 데이터 다시 가져오기
      fetchPrayers();
    } finally {
      setIsPinning(false);
    }
  };

  return (
    <Container>
      <MainContent>
        <HeaderSection>
          <StatsRow>
            <StatBadge>
              <span>📊</span>
              <span>총 {prayers.length}명</span>
            </StatBadge>
            {getPinnedCount() > 0 && (
              <StatBadge $isPinned>
                <span>📌</span>
                <span>고정 {getPinnedCount()}개</span>
              </StatBadge>
            )}
          </StatsRow>
        </HeaderSection>

        <FormSection>
          <SectionTitle>
            <SectionIcon>✍️</SectionIcon>
            {editingPrayer ? '기도제목 수정' : '새 기도제목 등록'}
          </SectionTitle>

          <FormCard>
            <Form onSubmit={editingPrayer ? handleUpdate : handleSubmit}>
              <FormGroup>
                <Label>이름</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="기도 받을 분의 이름을 입력하세요"
                  required
                  disabled={editingPrayer}
                />
              </FormGroup>

              <FormGroup>
                <Label>기도제목</Label>
                <PrayerItemsContainer>
                  {prayerItems.map((item, index) => (
                    <PrayerItemGroup key={index}>
                      <PrayerItemNumber>{index + 1}</PrayerItemNumber>
                      {prayerItems.length > 1 && (
                        <RemoveButton type="button" onClick={() => removePrayerItem(index)}>
                          <RemoveIcon>×</RemoveIcon>
                        </RemoveButton>
                      )}
                      <PrayerInput
                        value={item}
                        onChange={(e) => handlePrayerItemChange(index, e.target.value)}
                        placeholder={`기도제목 ${index + 1}을 입력하세요`}
                        required
                      />
                    </PrayerItemGroup>
                  ))}

                  <AddButton type="button" onClick={addPrayerItem}>
                    <AddIcon>+</AddIcon>
                    <AddText>기도제목 추가</AddText>
                  </AddButton>
                </PrayerItemsContainer>
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
                      <ButtonIcon>{editingPrayer ? '✏️' : '📝'}</ButtonIcon>
                      {editingPrayer ? '수정하기' : '등록하기'}
                    </>
                  )}
                </SubmitButton>

                <ClearButton type="button" onClick={clearForm}>
                  <ButtonIcon>🗑️</ButtonIcon>
                  {editingPrayer ? '취소' : '초기화'}
                </ClearButton>
              </ButtonGroup>
            </Form>
          </FormCard>
        </FormSection>

        <ListSection>
          <SectionTitle>
            <SectionIcon>📋</SectionIcon>
            등록된 기도제목
          </SectionTitle>

          {isLoading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>기도제목을 불러오는 중...</LoadingText>
            </LoadingContainer>
          ) : prayers.length === 0 ? (
            <EmptyState>
              <EmptyIcon>🤲</EmptyIcon>
              <EmptyTitle>등록된 기도제목이 없습니다</EmptyTitle>
              <EmptyDescription>첫 번째 기도제목을 등록해보세요!</EmptyDescription>
            </EmptyState>
          ) : (
            <PrayerList>
              {prayers.map((prayer, index) => (
                <PrayerCard key={prayer.id} delay={index * 0.1} isPinned={prayer.isPinned}>
                  <CardHeader onClick={() => togglePrayer(prayer.id)}>
                    <PersonInfo>
                      <PersonAvatar isPinned={prayer.isPinned}>
                        <AvatarText>{prayer.id.charAt(0)}</AvatarText>
                      </PersonAvatar>
                      <PersonDetails>
                        <PersonName>{prayer.id}</PersonName>
                        <UpdatedDate>{formatDate(prayer.updatedAt)}</UpdatedDate>
                        {prayer.isPinned && <PinStatus>📌 상단 고정</PinStatus>}
                      </PersonDetails>
                    </PersonInfo>

                    <CardActions>
                      <PinButton
                        onClick={(e) => { e.stopPropagation(); handleTogglePin(prayer.id); }}
                        isPinned={prayer.isPinned}
                        disabled={isPinning}
                        title={prayer.isPinned ? '고정 해제' : '고정하기 (최대 3개)'}
                      >
                        <ActionIcon>{prayer.isPinned ? '📌' : '📍'}</ActionIcon>
                      </PinButton>
                      <EditButton onClick={(e) => { e.stopPropagation(); handleEdit(prayer); }}>
                        <ActionIcon>✏️</ActionIcon>
                      </EditButton>
                      <DeleteButton
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, prayerId: prayer.id }); }}
                        disabled={isDeleting || isPinning}
                      >
                        <ActionIcon>🗑️</ActionIcon>
                      </DeleteButton>
                      <ToggleIcon isOpen={openPrayerId === prayer.id}>
                        {openPrayerId === prayer.id ? '▲' : '▼'}
                      </ToggleIcon>
                    </CardActions>
                  </CardHeader>

                  <PrayerContent isOpen={openPrayerId === prayer.id}>
                    {prayer.prayerItems && prayer.prayerItems.map((item, itemIndex) => (
                      <PrayerItemCard key={itemIndex}>
                        <ItemNumber>{itemIndex + 1}</ItemNumber>
                        <PrayerItemText>{item}</PrayerItemText>
                      </PrayerItemCard>
                    ))}
                  </PrayerContent>
                </PrayerCard>
              ))}
            </PrayerList>
          )}
        </ListSection>
      </MainContent>

      {deleteConfirm.isOpen && (
        <DeleteModal onClick={() => !isDeleting && setDeleteConfirm({ isOpen: false, prayerId: null })}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalIcon>{isDeleting ? '⏳' : '⚠️'}</ModalIcon>
            <ModalTitle>기도제목 삭제</ModalTitle>
            <ModalDescription>
              {(() => {
                const prayer = prayers.find(p => p.id === deleteConfirm.prayerId);
                const name = prayer?.id || '선택된 항목';
                return (
                  <>
                    <strong>"{name}"</strong>님의 기도제목을 삭제하시겠습니까?<br />
                    <DeleteWarning>삭제된 데이터는 복구할 수 없습니다.</DeleteWarning>
                    {isDeleting && <DeletingText>삭제 중입니다...</DeletingText>}
                  </>
                );
              })()}
            </ModalDescription>
            <ModalButtons>
              <DeleteConfirmButton
                onClick={() => handleDelete(deleteConfirm.prayerId)}
                disabled={isDeleting}
              >
                {isDeleting ? (
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
                onClick={() => setDeleteConfirm({ isOpen: false, prayerId: null })}
                disabled={isDeleting}
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

const StatsRow = styled.div`
  display: flex;
  gap: ${spacing.md};
`;

const StatBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: ${spacing.sm} ${spacing.md};
  background-color: ${props => props.$isPinned ? 'rgba(245, 158, 11, 0.1)' : 'white'};
  border: 1px solid ${props => props.$isPinned ? 'rgba(245, 158, 11, 0.3)' : colors.neutral[200]};
  border-radius: ${borderRadius.full};
  font-size: ${typography.fontSize.sm};
  color: ${props => props.$isPinned ? '#d97706' : colors.neutral[600]};
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
`;

const SectionIcon = styled.span`
  font-size: ${typography.fontSize['2xl']};
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
  
  &:disabled {
    background: ${colors.neutral[100]};
    color: ${colors.neutral[500]};
  }
`;

const PrayerItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const PrayerItemGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.sm};
`;

const PrayerItemNumber = styled.div`
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

const PrayerInput = styled.textarea`
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

const AddButton = styled.button`
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

const ClearButton = styled.button`
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

const PrayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const PrayerCard = styled.div`
  background: white;
  border-radius: ${borderRadius.xl};
  box-shadow: ${shadows.sm};
  border: 1px solid ${props => props.isPinned ? colors.amber[200] : colors.neutral[200]};
  overflow: hidden;
  transition: all 0.2s;
  background-color: ${props => props.isPinned ? colors.amber[50] : 'white'};
  
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
  cursor: pointer;
`;

const PersonInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
`;

const PersonAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${borderRadius.full};
  background: ${props => props.isPinned ? colors.amber[100] : colors.primary[100]};
  color: ${props => props.isPinned ? colors.amber[600] : colors.primary[600]};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const AvatarText = styled.span`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
`;

const PersonDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const PersonName = styled.h3`
  color: ${colors.neutral[900]};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
`;

const UpdatedDate = styled.p`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.xs};
`;

const PinStatus = styled.span`
  font-size: ${typography.fontSize.xs};
  color: ${colors.amber[600]};
  font-weight: ${typography.fontWeight.medium};
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
`;

const PinButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${borderRadius.lg};
  border: none;
  background: ${props => props.isPinned ? colors.amber[100] : 'transparent'};
  color: ${props => props.isPinned ? colors.amber[600] : colors.neutral[400]};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: ${colors.amber[50]};
    color: ${colors.amber[600]};
  }
`;

const EditButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${borderRadius.lg};
  border: none;
  background: transparent;
  color: ${colors.neutral[400]};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: ${colors.blue[50]};
    color: ${colors.blue[600]};
  }
`;

const DeleteButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${borderRadius.lg};
  border: none;
  background: transparent;
  color: ${colors.neutral[400]};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: ${colors.red[50]};
    color: ${colors.red[600]};
  }
`;

const ActionIcon = styled.span``;

const ToggleIcon = styled.div`
  color: ${colors.neutral[400]};
  margin-left: ${spacing.xs};
  transition: transform 0.2s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const PrayerContent = styled.div`
  max-height: ${props => props.isOpen ? '1000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  padding: ${props => props.isOpen ? `0 ${spacing.lg} ${spacing.lg}` : '0'};
  border-top: ${props => props.isOpen ? `1px solid ${colors.neutral[100]}` : 'none'};
`;

const PrayerItemCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.md};
  padding-top: ${spacing.md};
`;

const ItemNumber = styled.div`
  width: 20px;
  height: 20px;
  border-radius: ${borderRadius.full};
  background: ${colors.neutral[200]};
  color: ${colors.neutral[600]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.bold};
  flex-shrink: 0;
  margin-top: 2px;
`;

const PrayerItemText = styled.p`
  color: ${colors.neutral[800]};
  font-size: ${typography.fontSize.base};
  line-height: 1.6;
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

const DeletingText = styled.div`
  color: ${colors.blue[500]};
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

export default Prayer;
