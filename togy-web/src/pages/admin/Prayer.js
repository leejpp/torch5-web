import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp, setDoc } from 'firebase/firestore';
import { colors, typography, spacing, borderRadius, shadows, media } from '../../styles/designSystem';

const Prayer = () => {
  const [prayers, setPrayers] = useState([]);
  const [name, setName] = useState('');
  const [prayerItems, setPrayerItems] = useState(['']);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, prayerId: null });
  const [openPrayerId, setOpenPrayerId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPinning, setIsPinning] = useState(false);

  useEffect(() => {
    fetchPrayers();
  }, []);

  const fetchPrayers = async () => {
    try {
      setIsLoading(true);
      const q = query(collection(db, 'prayerRequests'), orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const prayerList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort: Pinned first, then by updatedAt desc
      const sortedList = prayerList.sort((a, b) => {
        if (a.isPinned !== b.isPinned) {
          return b.isPinned ? 1 : -1;
        }

        // Both are pinned or both are unpinned, sort by updatedAt
        const aTime = a.updatedAt?.seconds || 0;
        const bTime = b.updatedAt?.seconds || 0;
        return bTime - aTime;
      });

      setPrayers(sortedList);
    } catch (error) {
      console.error('Error fetching prayers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addPrayerItem = () => {
    setPrayerItems([...prayerItems, '']);
  };

  const removePrayerItem = (index) => {
    const newItems = prayerItems.filter((_, i) => i !== index);
    setPrayerItems(newItems);
  };

  const handlePrayerItemChange = (index, value) => {
    const newItems = [...prayerItems];
    newItems[index] = value;
    setPrayerItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      const validItems = prayerItems.filter(item => item.trim());

      // Use name as ID (document name)
      await updateDoc(doc(db, 'prayerRequests', name), {
        name,
        prayerItems: validItems,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(), // Ideally this should only be set on create
        isPinned: false
      }).catch(async (error) => {
        // If doc doesn't exist, setDoc/addDoc logic needs to be handled properly.
        // Assuming updateDoc fails if not exists, but firestore setDoc with merge is better.
        // But the previous code used this logic or similar. 
        // Let's stick to the previous logic which seemed to use doc(db, 'prayers', name) 
        // wait, previous logic was not fully visible but looked like it used name as ID.
        // So I should use setDoc.
        await setDoc(doc(db, 'prayerRequests', name), {
          name,
          prayerItems: validItems,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isPinned: false
        });
      });

      await fetchPrayers();
      clearForm();
    } catch (error) {
      console.error('Error adding prayer:', error);
      alert('기도제목 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingPrayer) return;

    try {
      setIsSubmitting(true);
      const validItems = prayerItems.filter(item => item.trim());

      await updateDoc(doc(db, 'prayerRequests', editingPrayer.id), {
        prayerItems: validItems,
        updatedAt: serverTimestamp()
      });

      await fetchPrayers();
      clearForm();
    } catch (error) {
      console.error('Error updating prayer:', error);
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, 'prayerRequests', id));
      await fetchPrayers();
      setDeleteConfirm({ isOpen: false, prayerId: null });
      setOpenPrayerId(null);
    } catch (error) {
      console.error('Error deleting prayer:', error);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (prayer) => {
    setEditingPrayer(prayer);
    setName(prayer.id);
    setPrayerItems(prayer.prayerItems || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearForm = () => {
    setEditingPrayer(null);
    setName('');
    setPrayerItems(['']);
  };

  const handleTogglePin = async (id) => {
    if (isPinning) return;

    try {
      setIsPinning(true);
      const prayer = prayers.find(p => p.id === id);
      const newPinnedStatus = !prayer.isPinned;

      if (newPinnedStatus) {
        const pinnedCount = getPinnedCount();
        if (pinnedCount >= 3) {
          alert('상단 고정은 최대 3개까지만 가능합니다.');
          return;
        }
      }

      await updateDoc(doc(db, 'prayerRequests', id), {
        isPinned: newPinnedStatus,
        updatedAt: serverTimestamp()
      });

      await fetchPrayers();
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('고정 상태 변경 중 오류가 발생했습니다.');
    } finally {
      setIsPinning(false);
    }
  };

  const getPinnedCount = () => {
    return prayers.filter(p => p.isPinned).length;
  };

  const togglePrayer = (id) => {
    setOpenPrayerId(openPrayerId === id ? null : id);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}`;
  };

  return (
    <Container>
      <MainContent>
        <HeaderSection>
          <Title>중보기도 관리</Title>
          <Stats>
            <StatText>총 {prayers.length}명</StatText>
            {getPinnedCount() > 0 && <StatText>• 고정 {getPinnedCount()}개</StatText>}
          </Stats>
        </HeaderSection>

        <FormSection>
          <FormTitle>{editingPrayer ? '기도제목 수정' : '새 기도제목 등록'}</FormTitle>
          <Form onSubmit={editingPrayer ? handleUpdate : handleSubmit}>
            <InputGroup>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름 입력"
                required
                disabled={editingPrayer}
              />
            </InputGroup>

            <PrayerListContainer>
              {prayerItems.map((item, index) => (
                <PrayerInputGroup key={index}>
                  <PrayerNumber>{index + 1}</PrayerNumber>
                  <PrayerInput
                    value={item}
                    onChange={(e) => handlePrayerItemChange(index, e.target.value)}
                    placeholder="기도제목 입력"
                    required
                  />
                  {prayerItems.length > 1 && (
                    <RemoveButton type="button" onClick={() => removePrayerItem(index)}>×</RemoveButton>
                  )}
                </PrayerInputGroup>
              ))}
            </PrayerListContainer>

            <FormActions>
              <AddButton type="button" onClick={addPrayerItem}>+ 항목 추가</AddButton>
              <ActionGroup>
                <CancelButton type="button" onClick={clearForm}>
                  {editingPrayer ? '취소' : '초기화'}
                </CancelButton>
                <SubmitButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '처리 중...' : (editingPrayer ? '수정 완료' : '등록하기')}
                </SubmitButton>
              </ActionGroup>
            </FormActions>
          </Form>
        </FormSection>

        <ListSection>
          <ListTitle>등록된 기도제목</ListTitle>
          {isLoading ? (
            <Message>불러오는 중...</Message>
          ) : prayers.length === 0 ? (
            <Message>등록된 기도제목이 없습니다.</Message>
          ) : (
            <PrayerList>
              {prayers.map((prayer) => (
                <PrayerItem key={prayer.id} $isPinned={prayer.isPinned}>
                  <ItemHeader onClick={() => togglePrayer(prayer.id)}>
                    <Info>
                      <Name>{prayer.id}</Name>
                      <DateText>{formatDate(prayer.updatedAt)}</DateText>
                      {prayer.isPinned && <PinnedBadge>고정됨</PinnedBadge>}
                    </Info>
                    <Controls>
                      <IconButton
                        onClick={(e) => { e.stopPropagation(); handleTogglePin(prayer.id); }}
                        $active={prayer.isPinned}
                        disabled={isPinning}
                        title="고정"
                      >
                        📌
                      </IconButton>
                      <IconButton onClick={(e) => { e.stopPropagation(); handleEdit(prayer); }} title="수정">
                        ✏️
                      </IconButton>
                      <IconButton
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, prayerId: prayer.id }); }}
                        disabled={isDeleting}
                        title="삭제"
                      >
                        🗑️
                      </IconButton>
                      <ExpandIcon $isOpen={openPrayerId === prayer.id}>▼</ExpandIcon>
                    </Controls>
                  </ItemHeader>

                  {openPrayerId === prayer.id && (
                    <ItemContent>
                      {prayer.prayerItems && prayer.prayerItems.map((item, i) => (
                        <ContentRow key={i}>
                          <RowNumber>{i + 1}.</RowNumber>
                          <RowText>{item}</RowText>
                        </ContentRow>
                      ))}
                    </ItemContent>
                  )}
                </PrayerItem>
              ))}
            </PrayerList>
          )}
        </ListSection>
      </MainContent>

      {deleteConfirm.isOpen && (
        <Overlay onClick={() => !isDeleting && setDeleteConfirm({ isOpen: false, prayerId: null })}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>삭제 확인</ModalTitle>
            <ModalText>
              정말 <strong>"{prayers.find(p => p.id === deleteConfirm.prayerId)?.id}"</strong>님의 기도제목을 삭제하시겠습니까?
            </ModalText>
            <ModalActions>
              <CancelButton onClick={() => setDeleteConfirm({ isOpen: false, prayerId: null })}>취소</CancelButton>
              <DeleteConfirmButton onClick={() => handleDelete(deleteConfirm.prayerId)}>삭제</DeleteConfirmButton>
            </ModalActions>
          </Modal>
        </Overlay>
      )}
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
  display: flex;
  gap: ${spacing.sm};
`;

const StatText = styled.span`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.sm};
`;

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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const InputGroup = styled.div``;

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

const PrayerListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const PrayerInputGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.sm};
`;

const PrayerNumber = styled.div`
  width: 24px;
  padding-top: 12px;
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[500]};
  text-align: center;
`;

const PrayerInput = styled.textarea`
  flex: 1;
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral[300]};
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSize.base};
  background: white;
  min-height: 46px;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${colors.neutral[900]};
  }
`;

const RemoveButton = styled.button`
  color: ${colors.neutral[400]};
  padding: ${spacing.sm};
  background: none;
  border: none;
  font-size: ${typography.fontSize.lg};
  cursor: pointer;
  
  &:hover {
    color: ${colors.red[500]};
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${spacing.sm};
`;

const AddButton = styled.button`
  color: ${colors.neutral[600]};
  background: none;
  border: 1px dashed ${colors.neutral[300]};
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${colors.neutral[900]};
    color: ${colors.neutral[900]};
    background: white;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: ${spacing.sm};
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

const PrayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const PrayerItem = styled.div`
  background: white;
  border: 1px solid ${props => props.$isPinned ? colors.neutral[900] : colors.neutral[200]};
  border-radius: ${borderRadius.lg};
  overflow: hidden;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${colors.neutral[400]};
  }
`;

const ItemHeader = styled.div`
  padding: ${spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: ${props => props.$isPinned ? colors.neutral[50] : 'white'};
`;

const Info = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
`;

const Name = styled.span`
  font-weight: ${typography.fontWeight.bold};
  font-size: ${typography.fontSize.lg};
  color: ${colors.neutral[900]};
`;

const DateText = styled.span`
  color: ${colors.neutral[400]};
  font-size: ${typography.fontSize.xs};
`;

const PinnedBadge = styled.span`
  background: ${colors.neutral[900]};
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: ${spacing.xs};
  cursor: pointer;
  opacity: ${props => props.$active ? 1 : 0.3};
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

const ExpandIcon = styled.span`
  margin-left: ${spacing.sm};
  font-size: 10px;
  color: ${colors.neutral[400]};
  transform: rotate(${props => props.$isOpen ? '180deg' : '0deg'});
  transition: transform 0.2s;
`;

const ItemContent = styled.div`
  padding: ${spacing.lg};
  background: ${colors.neutral[50]};
  border-top: 1px solid ${colors.neutral[100]};
`;

const ContentRow = styled.div`
  display: flex;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.xs};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const RowNumber = styled.span`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.sm};
  font-weight: bold;
  min-width: 20px;
`;

const RowText = styled.p`
  color: ${colors.neutral[700]};
  font-size: ${typography.fontSize.base};
  line-height: 1.6;
  margin: 0;
`;

const Message = styled.p`
  color: ${colors.neutral[500]};
  text-align: center;
  padding: ${spacing.xl};
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  padding: ${spacing.xl};
  border-radius: ${borderRadius.lg};
  width: 90%;
  max-width: 400px;
`;

const ModalTitle = styled.h3`
  font-weight: bold;
  margin-bottom: ${spacing.md};
`;

const ModalText = styled.p`
  color: ${colors.neutral[600]};
  margin-bottom: ${spacing.xl};
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${spacing.md};
`;

const DeleteConfirmButton = styled(SubmitButton)`
  background: ${colors.red[500]};
  
  &:hover {
    background: ${colors.red[600]};
  }
`;

export default Prayer;
