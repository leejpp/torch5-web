import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../../firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, setDoc } from 'firebase/firestore';
import AdminLayout from '../../layouts/AdminLayout';
import { Link } from 'react-router-dom';

const ROLES = {
  '회장': { label: '회장', order: 1 },
  '총무': { label: '총무', order: 2 },
  '임원': { label: '임원', order: 3 },
  '청년': { label: '청년', order: 4 }
};

const Members = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    birthday: '',
    phone: '',
    role: '청년'
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, memberId: null });
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const q = query(collection(db, 'members'), orderBy('__name__'));
      const snapshot = await getDocs(q);
      const membersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => {
        const roleOrderA = ROLES[a.role]?.order || 999;
        const roleOrderB = ROLES[b.role]?.order || 999;
        
        if (roleOrderA !== roleOrderB) {
          return roleOrderA - roleOrderB;
        }
        
        return a.id.localeCompare(b.id);
      });
      
      setMembers(membersList);
    } catch (error) {
      console.error("Error fetching members:", error);
      showMessage('error', '멤버 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.birthday || !formData.phone.trim()) {
      showMessage('error', '모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      const [year, month, day] = formData.birthday.split('-').map(num => parseInt(num));
      
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        showMessage('error', '올바른 날짜 형식이 아닙니다.');
        return;
      }

      const memberData = {
        birthday: [year, month, day],
        phone: formData.phone,
        role: formData.role,
        updatedAt: new Date()
      };

      if (editingMember) {
        await updateDoc(doc(db, 'members', formData.name), memberData);
        showMessage('success', '멤버 정보가 수정되었습니다.');
      } else {
        await setDoc(doc(db, 'members', formData.name), memberData);
        showMessage('success', '새 멤버가 추가되었습니다.');
      }
      resetForm();
      fetchMembers();
    } catch (error) {
      console.error("Error saving member:", error);
      showMessage('error', '저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (memberId) => {
    try {
      await deleteDoc(doc(db, 'members', memberId));
      showMessage('success', '멤버가 삭제되었습니다.');
      fetchMembers();
      setDeleteConfirm({ isOpen: false, memberId: null });
    } catch (error) {
      console.error("Error deleting member:", error);
      showMessage('error', '삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (member) => {
    const birthday = member.birthday && Array.isArray(member.birthday) 
      ? `${String(member.birthday[0])}-${String(member.birthday[1]).padStart(2, '0')}-${String(member.birthday[2]).padStart(2, '0')}`
      : '';

    setEditingMember(member);
    setFormData({
      name: member.id,
      birthday: birthday,
      phone: member.phone || '',
      role: member.role || '청년'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      birthday: '',
      phone: '',
      role: '청년'
    });
    setEditingMember(null);
  };

  const showMessage = (type, content) => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 3000);
  };

  const formatBirthday = (birthday) => {
    if (!birthday || !Array.isArray(birthday) || birthday.length !== 3) return '';
    
    const [year, month, day] = birthday.map(num => Number(num));
    const age = new Date().getFullYear() - year + 1; // 한국식 나이
    
    return `${month}월 ${day}일 (${age}세)`;
  };

  return (
    <AdminLayout>
      <Header>
        <TitleSection>
          <HomeButton to="/admin">← 홈으로</HomeButton>
          <Title>{editingMember ? '멤버 수정' : '멤버 추가'}</Title>
        </TitleSection>
      </Header>

      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label>이름</Label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="이름"
            required
          />
        </InputGroup>
        <InputGroup>
          <Label>생일</Label>
          <Input
            type="date"
            value={formData.birthday}
            onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
            required
          />
        </InputGroup>
        <InputGroup>
          <Label>전화번호</Label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="010-0000-0000"
            required
          />
        </InputGroup>
        <InputGroup>
          <Label>역할</Label>
          <Select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            {Object.entries(ROLES).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </Select>
        </InputGroup>
        <ButtonContainer>
          <SubmitButton type="submit">
            {editingMember ? '수정하기' : '추가하기'}
          </SubmitButton>
          {editingMember && (
            <CancelButton type="button" onClick={resetForm}>
              취소
            </CancelButton>
          )}
        </ButtonContainer>
      </Form>

      <MembersList>
        <ListTitle>멤버 목록</ListTitle>
        {members.map(member => (
          <MemberCard key={member.id}>
            <MemberInfo>
              <Name>{member.id}</Name>
              <Details>
                <Detail>{formatBirthday(member.birthday)}</Detail>
                <Detail>{member.phone}</Detail>
                <RoleBadge>{ROLES[member.role]?.label || '청년'}</RoleBadge>
              </Details>
            </MemberInfo>
            <Actions>
              <EditButton onClick={() => handleEdit(member)}>
                수정
              </EditButton>
              <DeleteButton onClick={() => setDeleteConfirm({ 
                isOpen: true, 
                memberId: member.id 
              })}>
                삭제
              </DeleteButton>
            </Actions>
          </MemberCard>
        ))}
      </MembersList>

      {message.content && (
        <MessagePopup type={message.type}>
          {message.content}
        </MessagePopup>
      )}

      {deleteConfirm.isOpen && (
        <DeleteConfirmModal>
          <ModalContent>
            <h3>멤버 삭제</h3>
            <p>정말 이 멤버를 삭제하시겠습니까?</p>
            <ModalButtons>
              <DeleteConfirmButton onClick={() => handleDelete(deleteConfirm.memberId)}>
                삭제
              </DeleteConfirmButton>
              <CancelButton onClick={() => setDeleteConfirm({ isOpen: false, memberId: null })}>
                취소
              </CancelButton>
            </ModalButtons>
          </ModalContent>
        </DeleteConfirmModal>
      )}
    </AdminLayout>
  );
};

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
`;

const Form = styled.form`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #FFB6C1;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #FFB6C1;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const SubmitButton = styled(Button)`
  background-color: #FFB6C1;
  color: white;
  
  &:hover {
    background-color: #FF69B4;
  }
`;

const CancelButton = styled(Button)`
  background-color: #f0f0f0;
  color: #666;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const MembersList = styled.div`
  margin-top: 2rem;
`;

const ListTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
`;

const MemberCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const MemberInfo = styled.div`
  flex: 1;
`;

const Name = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin: 0 0 0.5rem 0;
`;

const Details = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const Detail = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const RoleBadge = styled.span`
  background-color: #FFB6C1;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 15px;
  font-size: 0.8rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
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

const MessagePopup = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 2rem;
  border-radius: 5px;
  background-color: ${props => props.type === 'error' ? '#f44336' : '#4CAF50'};
  color: white;
  z-index: 1000;
  animation: slideUp 0.3s ease;
  
  @keyframes slideUp {
    from { transform: translate(-50%, 20px); opacity: 0; }
    to { transform: translate(-50%, 0); opacity: 1; }
  }
`;

export default Members;