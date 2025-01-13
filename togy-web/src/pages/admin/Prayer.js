// src/pages/admin/Prayer.js 생성
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, getDocs, query, orderBy, doc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import AdminLayout from '../../layouts/AdminLayout';

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
    <AdminLayout>
      <Header>
        <TitleSection>
          <HomeButton to="/admin">← 홈으로</HomeButton>
          <Title>{editingPrayer ? '기도제목 수정' : '기도제목 작성'}</Title>
        </TitleSection>
      </Header>

      <Form onSubmit={editingPrayer ? handleUpdate : handleSubmit}>
        <Input
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={editingPrayer}
        />
        {prayerItems.map((item, index) => (
          <ItemContainer key={index}>
            <TextArea
              placeholder={`기도제목 ${index + 1}`}
              value={item}
              onChange={(e) => handlePrayerItemChange(index, e.target.value)}
              required
            />
            {prayerItems.length > 1 && (
              <RemoveButton type="button" onClick={() => removePrayerItem(index)}>
                삭제
              </RemoveButton>
            )}
          </ItemContainer>
        ))}
        <AddButton type="button" onClick={addPrayerItem}>
          + 기도제목 추가
        </AddButton>
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

      <PrayerList>
        <ListTitle>기도제목 목록</ListTitle>
        {prayers.map(prayer => (
          <PrayerItem key={prayer.id}>
            <PrayerHeader onClick={() => togglePrayer(prayer.id)}>
              <HeaderContent>
                <PrayerName>{prayer.id}</PrayerName>
                <UpdatedDate>{formatDate(prayer.updatedAt)}</UpdatedDate>
              </HeaderContent>
              <ActionButtons onClick={e => e.stopPropagation()}>
                <EditButton onClick={() => handleEdit(prayer)}>수정</EditButton>
                <DeleteButton onClick={() => setDeleteConfirm({ isOpen: true, prayerId: prayer.id })}>
                  삭제
                </DeleteButton>
              </ActionButtons>
              <ToggleIcon isOpen={openPrayerId === prayer.id}>▼</ToggleIcon>
            </PrayerHeader>
            <PrayerContent isOpen={openPrayerId === prayer.id}>
              {prayer.prayerItems.map((item, index) => (
                <PrayerItemText key={index}>
                  {item}
                </PrayerItemText>
              ))}
            </PrayerContent>
          </PrayerItem>
        ))}
      </PrayerList>

      {deleteConfirm.isOpen && (
        <DeleteConfirmModal>
          <ModalContent>
            <h3>기도제목 삭제</h3>
            <p>정말 이 기도제목을 삭제하시겠습니까?</p>
            <ModalButtons>
              <DeleteConfirmButton onClick={() => handleDelete(deleteConfirm.prayerId)}>
                삭제
              </DeleteConfirmButton>
              <CancelButton onClick={() => setDeleteConfirm({ isOpen: false, prayerId: null })}>
                취소
              </CancelButton>
            </ModalButtons>
          </ModalContent>
        </DeleteConfirmModal>
      )}
    </AdminLayout>
  );
};

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 2rem;
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HomeButton = styled(Link)`
  color: #666;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-size: 1rem;
  
  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #FFB6C1;
  }
  
  &:disabled {
    background-color: #f5f5f5;
  }
`;

const ItemContainer = styled.div`
  position: relative;
  display: flex;
  gap: 1rem;
`;

const TextArea = styled.textarea`
  flex: 1;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #FFB6C1;
  }
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
`;

const AddButton = styled(Button)`
  background-color: #f0f0f0;
  color: #666;
  width: 100%;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const RemoveButton = styled(Button)`
  background-color: #ff4444;
  color: white;
  padding: 0.4rem 0.8rem;
  
  &:hover {
    background-color: #cc0000;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const SubmitButton = styled(Button)`
  flex: 1;
  background-color: #FFB6C1;
  color: white;
  
  &:hover {
    background-color: #FF69B4;
  }
  
  &:disabled {
    background-color: #ddd;
    cursor: not-allowed;
  }
`;

const ClearButton = styled(Button)`
  flex: 1;
  background-color: #f0f0f0;
  color: #666;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const ErrorMessage = styled.p`
  color: #ff4444;
  margin: 0.5rem 0;
  text-align: center;
`;

const SuccessMessage = styled.p`
  color: #4CAF50;
  margin: 0.5rem 0;
  text-align: center;
`;

const PrayerList = styled.div`
  margin-top: 2rem;
`;

const ListTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
`;

const PrayerItem = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: hidden;
`;

const PrayerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  cursor: pointer;
  
  &:hover {
    background-color: #f8f8f8;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const PrayerName = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin: 0;
`;

const UpdatedDate = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-right: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.3rem 0.8rem;
  border: none;
  border-radius: 3px;
  font-size: 0.9rem;
  cursor: pointer;
`;

const EditButton = styled(ActionButton)`
  background-color: #4CAF50;
  color: white;
  
  &:hover {
    background-color: #45a049;
  }
`;

const DeleteButton = styled(ActionButton)`
  background-color: #ff4444;
  color: white;
  
  &:hover {
    background-color: #cc0000;
  }
`;

const ToggleIcon = styled.span`
  margin-left: 1rem;
  transition: transform 0.3s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0)'};
`;

const PrayerContent = styled.div`
  padding: ${props => props.isOpen ? '1.5rem' : '0'};
  max-height: ${props => props.isOpen ? '1000px' : '0'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  transition: all 0.3s ease;
  overflow: hidden;
  background-color: #f9f9f9;
  white-space: pre-wrap;
`;

const PrayerItemText = styled.p`
  color: #666;
  margin: 0.5rem 0;
  line-height: 1.6;
  white-space: pre-wrap;
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
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  
  h3 {
    margin-top: 0;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const DeleteConfirmButton = styled(Button)`
  background-color: #ff4444;
  color: white;
  
  &:hover {
    background-color: #cc0000;
  }
`;

const CancelButton = styled(Button)`
  background-color: #f0f0f0;
  color: #666;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const ItemNumber = styled.span`
  color: #999;
  margin-right: 0.5rem;
  font-size: 0.9rem;
`;

export default Prayer;