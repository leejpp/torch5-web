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
      <BackgroundOverlay />
      
      <Header>
        <HeaderContent>
          <AdminBadge>
            <BadgeIcon>👑</BadgeIcon>
            <BadgeText>관리자</BadgeText>
          </AdminBadge>
          
          <TitleSection>
            <HeaderIcon>🙏</HeaderIcon>
            <Title>중보기도 관리</Title>
            <Subtitle>청년부 기도제목 등록 및 관리</Subtitle>
          </TitleSection>
          
          <StatsContainer>
            <StatsCard>
              <StatsIcon>📊</StatsIcon>
              <StatsText>총 {prayers.length}명의 기도제목이 등록되어 있습니다</StatsText>
            </StatsCard>
            {getPinnedCount() > 0 && (
              <PinStatsCard>
                <PinStatsIcon>📌</PinStatsIcon>
                <PinStatsText>{getPinnedCount()}개 항목이 상단 고정되어 있습니다</PinStatsText>
              </PinStatsCard>
            )}
          </StatsContainer>
        </HeaderContent>
      </Header>

      <MainContent>
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
                    <strong>"{name}"</strong>님의 기도제목을 삭제하시겠습니까?<br/>
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

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
  align-items: center;
  
  ${media['max-md']} {
    gap: ${spacing.md};
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

const PinStatsCard = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.sm};
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: ${borderRadius.xl};
  padding: ${spacing.lg} ${spacing.xl};
  animation: ${fadeInUp} 0.8s ease-out 1s both;
  
  ${media['max-md']} {
    padding: ${spacing.md} ${spacing.lg};
  }
`;

const PinStatsIcon = styled.span`
  font-size: ${typography.fontSize.lg};
`;

const PinStatsText = styled.span`
  color: rgba(245, 158, 11, 1);
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.semibold};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.sm};
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
  gap: ${spacing.lg};
  color: ${colors.neutral[800]};
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing['2xl']};
  font-family: ${typography.fontFamily.heading};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.xl};
    margin-bottom: ${spacing.xl};
  }
`;

const SectionIcon = styled.span`
  font-size: ${typography.fontSize['2xl']};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.xl};
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
  
  &:disabled {
    background: ${colors.neutral[100]};
    color: ${colors.neutral[500]};
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: ${colors.neutral[400]};
  }
`;

const PrayerItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const PrayerItemGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  background: rgba(255, 255, 255, 0.6);
  border-radius: ${borderRadius.xl};
  padding: ${spacing.md};
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const PrayerItemNumber = styled.div`
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

const PrayerInput = styled.textarea`
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

const AddButton = styled.button`
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

const ClearButton = styled.button`
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

const PrayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xl};
`;

const PrayerCard = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${borderRadius['2xl']};
  box-shadow: ${props => props.isPinned ? shadows['2xl'] : shadows.lg};
  overflow: hidden;
  transition: all 0.4s ease;
  ${props => css`
    animation: ${fadeInUp} 0.8s ease-out ${1.4 + props.delay}s both;
  `}
  border: ${props => props.isPinned 
    ? '2px solid rgba(251, 191, 36, 0.5)'
    : '1px solid rgba(255, 255, 255, 0.3)'
  };
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${shadows['2xl']};
  }
  
  ${props => props.isPinned && css`
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      z-index: 10;
    }
  `}
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing['2xl']};
  cursor: pointer;
  transition: background 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.5);
  }
  
  ${media['max-md']} {
    padding: ${spacing.xl};
  }
`;

const PersonInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.lg};
`;

const PersonAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: ${borderRadius.full};
  background: ${props => props.isPinned 
    ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
    : colors.gradients.primary
  };
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: ${props => props.isPinned ? shadows.lg : shadows.sm};
  transition: all 0.3s ease;
  
  ${media['max-md']} {
    width: 40px;
    height: 40px;
  }
`;

const AvatarText = styled.span`
  color: white;
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.base};
  }
`;

const PersonDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

const PersonName = styled.h3`
  color: ${colors.neutral[800]};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  margin: 0;
  font-family: ${typography.fontFamily.heading};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.lg};
  }
`;

const UpdatedDate = styled.p`
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

const ToggleIcon = styled.div`
  font-size: ${typography.fontSize.lg};
  color: ${colors.neutral[500]};
  margin-left: ${spacing.sm};
  transition: transform 0.3s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const PrayerContent = styled.div`
  max-height: ${props => props.isOpen ? '1000px' : '0'};
  overflow: hidden;
  transition: max-height 0.5s ease;
  padding: ${props => props.isOpen ? `0 ${spacing['2xl']} ${spacing['2xl']}` : '0'};
  
  ${media['max-md']} {
    padding: ${props => props.isOpen ? `0 ${spacing.xl} ${spacing.xl}` : '0'};
  }
`;

const PrayerItemCard = styled.div`
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

const PrayerItemText = styled.p`
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
  
  &:hover {
    background: ${colors.red[600]};
    transform: translateY(-2px);
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

const DeletingText = styled.div`
  color: ${colors.primary[600]};
  font-weight: ${typography.fontWeight.medium};
  margin-top: ${spacing.md};
  font-size: ${typography.fontSize.sm};
`;

// 핀 기능을 위한 새로운 스타일 컴포넌트들
const PinButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: ${borderRadius.lg};
  border: none;
  background: ${props => props.isPinned 
    ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
    : 'rgba(156, 163, 175, 0.1)'
  };
  color: ${props => props.isPinned ? 'white' : colors.neutral[500]};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: ${props => props.isPinned ? shadows.md : 'none'};
  
  &:hover:not(:disabled) {
    background: ${props => props.isPinned 
      ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
      : 'rgba(156, 163, 175, 0.2)'
    };
    transform: scale(1.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const PinStatus = styled.span`
  color: #f59e0b;
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.semibold};
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  margin-top: ${spacing.xs};
`;

export default Prayer;
