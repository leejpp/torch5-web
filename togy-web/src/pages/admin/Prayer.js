// src/pages/admin/Prayer.js 생성
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, getDocs, query, orderBy, doc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

const Prayer = () => {
  const [name, setName] = useState('');
  const [prayerItems, setPrayerItems] = useState(['']);
  const [prayers, setPrayers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openPrayerId, setOpenPrayerId] = useState(null);
  const [editingPrayer, setEditingPrayer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, prayerId: null });

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    const filteredItems = prayerItems.filter(item => item.trim() !== '');
    if (filteredItems.length === 0) {
      setError('기도제목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await setDoc(doc(db, 'prayerRequests', name.trim()), {
        prayerItems: filteredItems,
        updatedAt: Timestamp.now()
      });
      
      setSuccessMessage('기도제목이 등록되었습니다.');
      setName('');
      setPrayerItems(['']);
      fetchPrayers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError('기도제목 등록 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingPrayer) return;

    const filteredItems = prayerItems.filter(item => item.trim() !== '');
    if (filteredItems.length === 0) {
      setError('기도제목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await updateDoc(doc(db, 'prayerRequests', editingPrayer.id), {
        prayerItems: filteredItems,
        updatedAt: Timestamp.now()
      });
      
      setSuccessMessage('기도제목이 수정되었습니다.');
      setName('');
      setPrayerItems(['']);
      setEditingPrayer(null);
      fetchPrayers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError('기도제목 수정 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (prayerId) => {
    try {
      await deleteDoc(doc(db, 'prayerRequests', prayerId));
      setSuccessMessage('기도제목이 삭제되었습니다.');
      fetchPrayers();
      setDeleteConfirm({ isOpen: false, prayerId: null });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError('기도제목 삭제 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  const handleEdit = (prayer) => {
    setEditingPrayer(prayer);
    setName(prayer.id);
    setPrayerItems([...prayer.prayerItems]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <Container>
      <Header>
        <Title>중보기도 관리</Title>
      </Header>

      <FormSection>
        <FormTitle>{editingPrayer ? '기도제목 수정' : '새 기도제목 등록'}</FormTitle>
        <Form onSubmit={editingPrayer ? handleUpdate : handleSubmit}>
          <InputGroup>
            <Label>이름</Label>
            <Input
              type="text"
              placeholder="기도받을 분의 이름을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={editingPrayer}
            />
          </InputGroup>
          
          <ItemsSection>
            <Label>기도제목</Label>
            {prayerItems.map((item, index) => (
              <ItemContainer key={index}>
                <ItemHeader>
                  <ItemNumber>{index + 1}</ItemNumber>
                  {prayerItems.length > 1 && (
                    <RemoveButton type="button" onClick={() => removePrayerItem(index)}>
                      ×
                    </RemoveButton>
                  )}
                </ItemHeader>
                <TextArea
                  placeholder="기도제목을 입력하세요..."
                  value={item}
                  onChange={(e) => handlePrayerItemChange(index, e.target.value)}
                  required
                />
              </ItemContainer>
            ))}
            <AddButton type="button" onClick={addPrayerItem}>
              <AddIcon>+</AddIcon>
              기도제목 추가
            </AddButton>
          </ItemsSection>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
          
          <ButtonContainer>
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? '처리 중...' : (editingPrayer ? '수정하기' : '등록하기')}
            </SubmitButton>
            <ClearButton
              type="button"
              onClick={() => {
                setName('');
                setPrayerItems(['']);
                setError('');
                setEditingPrayer(null);
              }}
            >
              {editingPrayer ? '취소' : '초기화'}
            </ClearButton>
          </ButtonContainer>
        </Form>
      </FormSection>

      <ListSection>
        <ListTitle>등록된 기도제목</ListTitle>
        {prayers.length === 0 ? (
          <EmptyState>
            <EmptyIcon>🙏</EmptyIcon>
            <EmptyText>등록된 기도제목이 없습니다</EmptyText>
          </EmptyState>
        ) : (
          prayers.map(prayer => (
            <PrayerCard key={prayer.id}>
              <CardHeader onClick={() => togglePrayer(prayer.id)}>
                <PersonInfo>
                  <PersonName>{prayer.id}</PersonName>
                  <UpdatedDate>{formatDate(prayer.updatedAt)}</UpdatedDate>
                </PersonInfo>
                <CardActions onClick={e => e.stopPropagation()}>
                  <EditButton onClick={() => handleEdit(prayer)}>
                    ✏️
                  </EditButton>
                  <DeleteButton onClick={() => setDeleteConfirm({ isOpen: true, prayerId: prayer.id })}>
                    🗑️
                  </DeleteButton>
                </CardActions>
                <ToggleIcon isOpen={openPrayerId === prayer.id}>
                  {openPrayerId === prayer.id ? '▲' : '▼'}
                </ToggleIcon>
              </CardHeader>
              <PrayerContent isOpen={openPrayerId === prayer.id}>
                {prayer.prayerItems && prayer.prayerItems.map((item, index) => (
                  <PrayerItemCard key={index}>
                    <ItemBadge>{index + 1}</ItemBadge>
                    <PrayerItemText>{item}</PrayerItemText>
                  </PrayerItemCard>
                ))}
              </PrayerContent>
            </PrayerCard>
          ))
        )}
      </ListSection>

      {deleteConfirm.isOpen && (
        <DeleteConfirmModal onClick={() => setDeleteConfirm({ isOpen: false, prayerId: null })}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalIcon>⚠️</ModalIcon>
            <h3>기도제목 삭제</h3>
            <p>정말 이 기도제목을 삭제하시겠습니까?<br/>삭제된 내용은 복구할 수 없습니다.</p>
            <ModalButtons>
              <DeleteConfirmButton onClick={() => handleDelete(deleteConfirm.prayerId)}>
                삭제하기
              </DeleteConfirmButton>
              <CancelButton onClick={() => setDeleteConfirm({ isOpen: false, prayerId: null })}>
                취소
              </CancelButton>
            </ModalButtons>
          </ModalContent>
        </DeleteConfirmModal>
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f8f9fa;
  padding-bottom: 3rem;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding-left: 1rem;
    padding-right: 1rem;
    padding-bottom: 2rem;
  }
`;

const Header = styled.header`
  background-color: #4285F4;
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
  }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const FormSection = styled.section`
  background-color: white;
  margin: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  @media (max-width: 768px) {
    margin: 1rem;
    border-radius: 8px;
  }
`;

const FormTitle = styled.h2`
  background-color: #f8f9fa;
  padding: 1.5rem 2rem;
  margin: 0;
  font-size: 1.3rem;
  color: #333;
  border-bottom: 1px solid #e9ecef;

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    font-size: 1.1rem;
  }
`;

const Form = styled.form`
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #4285F4;
    box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
  }
  
  &:disabled {
    background-color: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const ItemsSection = styled.div`
  margin-bottom: 1.5rem;
`;

const ItemContainer = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 2px solid transparent;
  transition: all 0.2s ease;

  &:hover {
    border-color: #e9ecef;
  }

  @media (max-width: 768px) {
    padding: 0.8rem;
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
`;

const ItemNumber = styled.span`
  background-color: #4285F4;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 500;
`;

const RemoveButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: #c82333;
    transform: scale(1.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.95rem;
  min-height: 80px;
  resize: vertical;
  transition: all 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #4285F4;
    box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const AddButton = styled.button`
  width: 100%;
  padding: 0.8rem;
  border: 2px dashed #4285F4;
  background-color: transparent;
  color: #4285F4;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(66, 133, 244, 0.05);
    border-color: #1a73e8;
    color: #1a73e8;
  }
`;

const AddIcon = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SubmitButton = styled.button`
  background-color: #4285F4;
  color: white;
  border: none;
  padding: 0.9rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  flex: 1;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #1a73e8;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(66, 133, 244, 0.3);
  }
  
  &:disabled {
    background-color: #adb5bd;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ClearButton = styled.button`
  background-color: transparent;
  color: #6c757d;
  border: 2px solid #e9ecef;
  padding: 0.9rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  flex: 1;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #adb5bd;
    color: #495057;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  margin: 1rem 0;
  border: 1px solid #f5c6cb;
  font-size: 0.95rem;
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  margin: 1rem 0;
  border: 1px solid #c3e6cb;
  font-size: 0.95rem;
`;

const ListSection = styled.section`
  margin: 2rem;

  @media (max-width: 768px) {
    margin: 1rem;
  }
`;

const ListTitle = styled.h2`
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 1.5rem;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 2rem 1rem;
    border-radius: 8px;
  }
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const EmptyText = styled.p`
  color: #6c757d;
  font-size: 1.1rem;
  margin: 0;
`;

const PrayerCard = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    border-radius: 8px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
`;

const PersonInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PersonName = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin: 0 0 0.3rem 0;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const UpdatedDate = styled.span`
  color: #6c757d;
  font-size: 0.85rem;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 0 1rem;

  @media (max-width: 768px) {
    margin: 0;
    order: 3;
    width: 100%;
    justify-content: flex-end;
  }
`;

const EditButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: #218838;
    transform: scale(1.05);
  }
`;

const DeleteButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: #c82333;
    transform: scale(1.05);
  }
`;

const ToggleIcon = styled.span`
  color: #6c757d;
  font-size: 1.2rem;
  transition: transform 0.3s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0)'};

  @media (max-width: 768px) {
    order: 2;
  }
`;

const PrayerContent = styled.div`
  padding: ${props => props.isOpen ? '0 1.5rem 1.5rem 1.5rem' : '0'};
  max-height: ${props => props.isOpen ? '2000px' : '0'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  transition: all 0.3s ease;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: ${props => props.isOpen ? '0 1rem 1rem 1rem' : '0'};
  }
`;

const PrayerItemCard = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.8rem;
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    padding: 0.8rem;
    gap: 0.6rem;
  }
`;

const ItemBadge = styled.span`
  background-color: #4285F4;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 500;
  flex-shrink: 0;
`;

const PrayerItemText = styled.p`
  color: #495057;
  margin: 0;
  line-height: 1.6;
  flex: 1;
  font-size: 0.95rem;
`;

const DeleteConfirmModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  
  h3 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.3rem;
  }

  p {
    color: #6c757d;
    margin: 0 0 1.5rem 0;
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 8px;
    margin: 1rem;

    h3 {
      font-size: 1.2rem;
    }
  }
`;

const ModalIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const DeleteConfirmButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #c82333;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const CancelButton = styled.button`
  background-color: transparent;
  color: #6c757d;
  border: 2px solid #e9ecef;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #adb5bd;
    color: #495057;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export default Prayer;