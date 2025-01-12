import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db, verifyPassword } from '../firebase/config';
import { collection, query, getDocs, setDoc, doc, deleteDoc, updateDoc, Timestamp, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import CryptoJS from 'crypto-js';

const PrayerRequests = () => {
  const [prayers, setPrayers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    items: ['']
  });
  const [editingContent, setEditingContent] = useState('');
  const [loading, setLoading] = useState({
    submit: false,
    edit: false,
    delete: false,
    addItem: false
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    prayerId: null,
    itemIndex: null,
    isFullDelete: false
  });
  const [passwordCheck, setPasswordCheck] = useState({
    isOpen: false,
    password: '',
    action: null,  // 'edit' 또는 'add'
    error: ''
  });

  useEffect(() => {
    fetchPrayers();
  }, []);

  const fetchPrayers = async () => {
    try {
      const q = query(collection(db, 'prayerRequests'));
      const querySnapshot = await getDocs(q);
      const prayerList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('가져온 기도목 목록:', prayerList);
      setPrayers(prayerList);
    } catch (error) {
      console.error("Error fetching prayers:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submit: true }));
    try {
      const name = formData.name.trim();
      if (!name) {
        console.log('이름이 비어있습니다');
        return;
      }

      const filteredItems = formData.items.filter(item => item.trim() !== '');
      if (filteredItems.length === 0) {
        console.log('기도제목이 비어있습니다');
        return;
      }

      console.log('제출할 데이터:', {
        name,
        prayerItems: filteredItems,
        updatedAt: Timestamp.fromDate(new Date())
      });

      await setDoc(doc(db, 'prayerRequests', name), {
        prayerItems: filteredItems,
        updatedAt: Timestamp.fromDate(new Date())
      });
      
      console.log('데이터 저장 성공');
      setFormData({ name: '', items: [''] });
      setIsAdding(false);
      await fetchPrayers();
    } catch (error) {
      console.error("Error adding prayer:", error);
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleEdit = async (prayerId, itemIndex, newValue) => {
    setEditingContent(newValue);
  };

  const handleSave = async (prayerId, itemIndex) => {
    setLoading(prev => ({ ...prev, edit: true }));
    try {
      const docRef = doc(db, 'prayerRequests', prayerId);
      const prayerDoc = prayers.find(p => p.id === prayerId);
      
      if (prayerDoc) {
        const updatedPrayerItems = [...prayerDoc.prayerItems];
        updatedPrayerItems[itemIndex] = editingContent;
        
        await updateDoc(docRef, {
          prayerItems: updatedPrayerItems,
          updatedAt: Timestamp.fromDate(new Date())
        });
        
        await fetchPrayers();
        setEditMode(false);
        setEditingContent('');
      }
    } catch (error) {
      console.error("Error updating prayer:", error);
    } finally {
      setLoading(prev => ({ ...prev, edit: false }));
    }
  };

  const handleDelete = async (prayerId, itemIndex = null) => {
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      const docRef = doc(db, 'prayerRequests', prayerId);
      
      if (itemIndex !== null) {
        const prayerDoc = prayers.find(p => p.id === prayerId);
        if (prayerDoc) {
          const updatedPrayerItems = prayerDoc.prayerItems.filter((_, index) => index !== itemIndex);
          await updateDoc(docRef, {
            prayerItems: updatedPrayerItems,
            updatedAt: Timestamp.fromDate(new Date())
          });
        }
      } else {
        await deleteDoc(docRef);
      }
      await fetchPrayers();
    } catch (error) {
      console.error("Error deleting prayer:", error);
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleNameChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handleItemChange = (index, value) => {
    const newItems = [...formData.items];
    newItems[index] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addNewItem = () => {
    setFormData({ ...formData, items: [...formData.items, ''] });
  };

  const handleAddPrayerItem = async (prayerId) => {
    const prayerDoc = prayers.find(p => p.id === prayerId);
    if (prayerDoc) {
      const updatedPrayerItems = [...prayerDoc.prayerItems, ''];
      await updateDoc(doc(db, 'prayerRequests', prayerId), {
        prayerItems: updatedPrayerItems,
        updatedAt: Timestamp.fromDate(new Date())
      });
      await fetchPrayers();
      
      setSelectedPrayer({ 
        id: prayerId, 
        itemIndex: updatedPrayerItems.length - 1 
      });
      setEditingContent('');
      setEditMode(true);
    }
  };

  const confirmDelete = (prayerId, itemIndex = null) => {
    setDeleteConfirm({
      isOpen: true,
      prayerId,
      itemIndex,
      isFullDelete: itemIndex === null
    });
  };

  const executeDelete = async () => {
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      const { prayerId, itemIndex } = deleteConfirm;
      await handleDelete(prayerId, itemIndex);
      setDeleteConfirm({ isOpen: false, prayerId: null, itemIndex: null, isFullDelete: false });
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const formatDateTime = (timestamp) => {
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

  const handlePasswordCheck = (action) => {
    setPasswordCheck({
      isOpen: true,
      password: '',
      action,
      error: ''
    });
  };

  const handlePasswordSubmit = async () => {
    try {
      const hashedInput = CryptoJS.SHA256(passwordCheck.password).toString(CryptoJS.enc.Hex);
      const adminRef = doc(db, 'admin', 'settings');
      const adminDoc = await getDoc(adminRef);
      
      if (!adminDoc.exists()) {
        throw new Error('Admin settings not found');
      }

      const adminData = adminDoc.data();
      if (!adminData?.passwords || !Array.isArray(adminData.passwords)) {
        throw new Error('Invalid admin configuration');
      }

      if (adminData.passwords.includes(hashedInput)) {
        // 비밀번호가 일치할 때 작업 수행
        if (passwordCheck.action === 'edit') {
          setIsEditMode(prev => !prev);
        } else if (passwordCheck.action === 'add') {
          setIsAdding(true);
        }

        // 모달 닫기
        setPasswordCheck({
          isOpen: false,
          password: '',
          action: null,
          error: ''
        });
      } else {
        throw new Error('비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('Password check error:', error);
      setPasswordCheck(prev => ({
        ...prev,
        error: error.message || '시스템 오류가 발생했습니다.'
      }));
    }
  };

  return (
    <Container>
      <Header>
        <TitleSection>
          <HomeButton to="/">← 홈으로</HomeButton>
          <Title>중보기도</Title>
        </TitleSection>
        <ButtonGroup>
          <AddButton onClick={() => handlePasswordCheck('add')}>
            기도제목 작성
          </AddButton>
          <EditModeButton 
            isActive={isEditMode}
            onClick={() => {
              if (isEditMode) {
                // 편집 완료 시에는 바로 상태 변경
                setIsEditMode(false);
              } else {
                // 편집 시작 시에 비밀번호 확인
                handlePasswordCheck('edit');
              }
            }}
          >
            {isEditMode ? '편집 완료' : '편집'}
          </EditModeButton>
        </ButtonGroup>
      </Header>

      {isAdding && (
        <FormOverlay>
          <FormContainer onSubmit={handleSubmit}>
            <FormTitle>기도제목 작성</FormTitle>
            <Input
              type="text"
              placeholder="이름"
              value={formData.name}
              onChange={handleNameChange}
              required
            />
            {formData.items.map((item, index) => (
              <TextArea
                key={index}
                placeholder={`기도제목 ${index + 1}`}
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
                required
              />
            ))}
            <ButtonContainer>
              <AddItemButton
                type="button"
                onClick={addNewItem}
              >
                + 기도제목 추가
              </AddItemButton>
              <SubmitButton 
                type="submit" 
                disabled={loading.submit}
              >
                {loading.submit ? '저장 중...' : '작성완료'}
              </SubmitButton>
              <CancelButton 
                type="button" 
                onClick={() => {
                  setFormData({ name: '', items: [''] });
                  setIsAdding(false);
                }}
              >
                취소
              </CancelButton>
            </ButtonContainer>
          </FormContainer>
        </FormOverlay>
      )}

      <PrayerList>
        {prayers.map((prayer) => (
          <PrayerCard key={prayer.id}>
            <PrayerHeader>
              <Name>{prayer.id}</Name>
              <UpdatedAt>
                마지막 수정: {formatDateTime(prayer.updatedAt)}
              </UpdatedAt>
              {isEditMode && (
                <DeleteButton 
                  onClick={() => confirmDelete(prayer.id)}
                  disabled={loading.delete}
                >
                  {loading.delete ? '삭제 중...' : '전체 삭제'}
                </DeleteButton>
              )}
            </PrayerHeader>
            {prayer.prayerItems.map((item, index) => (
              <PrayerItemContainer key={index}>
                {editMode && selectedPrayer?.id === prayer.id && selectedPrayer?.itemIndex === index ? (
                  <EditContainer>
                    <TextArea
                      value={editingContent}
                      onChange={(e) => handleEdit(prayer.id, index, e.target.value)}
                    />
                    <ButtonContainer>
                      <SaveButton 
                        onClick={() => handleSave(prayer.id, index)}
                        disabled={loading.edit}
                      >
                        {loading.edit ? '저장 중...' : '저장'}
                      </SaveButton>
                      <CancelButton onClick={() => {
                        setEditMode(false);
                        setEditingContent('');
                      }}>취소</CancelButton>
                    </ButtonContainer>
                  </EditContainer>
                ) : (
                  <PrayerItem>
                    <PrayerContent>{item}</PrayerContent>
                    {isEditMode && (
                      <ItemButtons>
                        <EditButton onClick={() => {
                          setSelectedPrayer({ id: prayer.id, itemIndex: index });
                          setEditingContent(item);
                          setEditMode(true);
                        }}>수정</EditButton>
                        <DeleteItemButton onClick={() => confirmDelete(prayer.id, index)}>
                          삭제
                        </DeleteItemButton>
                      </ItemButtons>
                    )}
                  </PrayerItem>
                )}
              </PrayerItemContainer>
            ))}
            {isEditMode && (
              <AddPrayerItemButton
                onClick={() => handleAddPrayerItem(prayer.id)}
                disabled={loading.addItem}
              >
                {loading.addItem ? '추가 중...' : '+ 기도제목 추가'}
              </AddPrayerItemButton>
            )}
          </PrayerCard>
        ))}
      </PrayerList>

      {deleteConfirm.isOpen && (
        <ConfirmOverlay>
          <ConfirmModal>
            <ConfirmTitle>삭제 확인</ConfirmTitle>
            <ConfirmMessage>
              {deleteConfirm.isFullDelete 
                ? '모든 기도제목이 삭제됩니다. 계속하시겠습니까?' 
                : '선택한 기도제목이 삭제됩니다. 계속하시겠습니까?'}
            </ConfirmMessage>
            <ConfirmButtons>
              <ConfirmButton 
                onClick={executeDelete}
                disabled={loading.delete}
              >
                {loading.delete ? '삭제 중...' : '삭제'}
              </ConfirmButton>
              <CancelButton 
                onClick={() => setDeleteConfirm({ 
                  isOpen: false, 
                  prayerId: null, 
                  itemIndex: null, 
                  isFullDelete: false 
                })}
                disabled={loading.delete}
              >
                취소
              </CancelButton>
            </ConfirmButtons>
          </ConfirmModal>
        </ConfirmOverlay>
      )}

      {passwordCheck.isOpen && (
        <FormOverlay>
          <PasswordModal onSubmit={(e) => {
            e.preventDefault();
            handlePasswordSubmit();
          }}>
            <FormTitle>관리자 확인</FormTitle>
            <Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={passwordCheck.password}
              onChange={(e) => setPasswordCheck(prev => ({
                ...prev,
                password: e.target.value,
                error: ''
              }))}
              required
            />
            {passwordCheck.error && (
              <ErrorMessage>{passwordCheck.error}</ErrorMessage>
            )}
            <ButtonContainer>
              <SubmitButton type="submit">
                확인
              </SubmitButton>
              <CancelButton type="button" onClick={() => setPasswordCheck({
                isOpen: false,
                password: '',
                action: null,
                error: ''
              })}>
                취소
              </CancelButton>
            </ButtonContainer>
          </PasswordModal>
        </FormOverlay>
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const HomeButton = styled(Link)`
  color: #666;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-size: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
  
  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const AddButton = styled.button`
  background-color: #FFB6C1;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  
  @media (max-width: 768px) {
    width: 45%;
    padding: 0.7rem;
  }
  
  &:hover {
    background-color: #FF69B4;
  }
`;

const PrayerList = styled.div`
  display: grid;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const PrayerCard = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PrayerHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const Name = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-right: 1rem;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-right: 0;
  }
`;

const UpdatedAt = styled.span`
  color: #888;
  font-size: 0.9rem;
  margin-right: auto;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-right: 0;
  }
`;

const PrayerItemContainer = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 5px;
  
  @media (max-width: 768px) {
    padding: 0.8rem;
  }
`;

const PrayerItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const PrayerContent = styled.p`
  flex: 1;
  color: #666;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const ItemButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const EditButton = styled.button`
  padding: 0.3rem 0.8rem;
  background-color: #FFB6C1;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
  }
  
  &:hover {
    background-color: #FF69B4;
  }
`;

const DeleteButton = styled(EditButton)`
  background-color: #ff6666;
  margin-left: 1rem;
  
  &:hover {
    background-color: #ff4444;
  }
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const EditModeButton = styled.button`
  background-color: ${props => props.isActive ? '#FF69B4' : '#ddd'};
  color: ${props => props.isActive ? 'white' : '#666'};
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  
  @media (max-width: 768px) {
    width: 45%;
    padding: 0.7rem;
  }
  
  &:hover {
    background-color: ${props => props.isActive ? '#FF1493' : '#ccc'};
  }
`;

const FormOverlay = styled.div`
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

const FormContainer = styled.form`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  
  @media (max-width: 768px) {
    width: 95%;
    padding: 1.5rem;
    margin: 1rem;
  }
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  
  @media (max-width: 768px) {
    padding: 0.6rem;
    font-size: 0.9rem;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 150px;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  resize: vertical;
  
  @media (max-width: 768px) {
    height: 120px;
    padding: 0.6rem;
    font-size: 0.9rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 0.8rem;
  background-color: #FFB6C1;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  
  &:hover {
    background-color: #FF69B4;
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 0.8rem;
  background-color: #ddd;
  color: #666;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  
  &:hover {
    background-color: #ccc;
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem;
  }
`;

const ErrorMessage = styled.p`
  color: #ff4444;
  margin: -0.5rem 0 1rem;
  font-size: 0.9rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;
const AddItemButton = styled(EditButton)`
  width: 100%;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    padding: 0.6rem;
  }
`;

const EditContainer = styled.div`
  width: 100%;
`;

const SaveButton = styled(EditButton)`
  background-color: #4CAF50;
  
  &:hover {
    background-color: #45a049;
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem;
  }
`;

const DeleteItemButton = styled(EditButton)`
  background-color: #ff9999;
  
  &:hover {
    background-color: #ff6666;
  }
`;

const AddPrayerItemButton = styled.button`
  width: 100%;
  padding: 0.8rem;
  margin-top: 1rem;
  background-color: #f0f0f0;
  color: #666;
  border: 1px dashed #ccc;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  
  @media (max-width: 768px) {
    padding: 0.6rem;
  }
  
  &:hover {
    background-color: #e0e0e0;
    color: #333;
  }
`;

const ConfirmOverlay = styled(FormOverlay)``;

const ConfirmModal = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  
  @media (max-width: 768px) {
    width: 95%;
    padding: 1.5rem;
    margin: 1rem;
  }
`;

const ConfirmTitle = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const ConfirmMessage = styled.p`
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }
`;

const ConfirmButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ConfirmButton = styled.button`
  padding: 0.8rem 2rem;
  background-color: #ff6666;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  
  @media (max-width: 768px) {
    padding: 0.6rem;
  }
  
  &:hover {
    background-color: #ff4444;
  }
`;

const PasswordModal = styled(FormContainer)`
  max-width: 400px;
`;


export default PrayerRequests;