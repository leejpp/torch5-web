import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, Timestamp, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import AdminLayout from '../../layouts/AdminLayout';

const NoticeAdmin = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notices, setNotices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openNoticeId, setOpenNoticeId] = useState(null);
  const [editingNotice, setEditingNotice] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, noticeId: null });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const q = query(collection(db, 'notices'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const noticesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotices(noticesList);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await addDoc(collection(db, 'notices'), {
        title: title.trim(),
        content: content.trim(),
        date: Timestamp.now()
      });
      setSuccessMessage('공지사항이 성공적으로 등록되었습니다.');
      setTitle('');
      setContent('');
      fetchNotices();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError('공지사항 등록 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
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

  const toggleNotice = (id) => {
    setOpenNoticeId(openNoticeId === id ? null : id);
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setTitle(notice.title);
    setContent(notice.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const noticeRef = doc(db, 'notices', editingNotice.id);
      await updateDoc(noticeRef, {
        title: title.trim(),
        content: content.trim(),
        date: Timestamp.now()
      });
      
      setSuccessMessage('공지사항이 성공적으로 수정되었습니다.');
      setTitle('');
      setContent('');
      setEditingNotice(null);
      fetchNotices();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError('공지사항 수정 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noticeId) => {
    try {
      await deleteDoc(doc(db, 'notices', noticeId));
      setSuccessMessage('공지사항이 삭제되었습니다.');
      fetchNotices();
      setDeleteConfirm({ isOpen: false, noticeId: null });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError('공지사항 삭제 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  return (
    <AdminLayout>
      <Header>
        <TitleSection>
          <HomeButton to="/admin">← 홈으로</HomeButton>
          <Title>{editingNotice ? '공지사항 수정' : '공지사항 작성'}</Title>
        </TitleSection>
      </Header>

      <Form onSubmit={editingNotice ? handleUpdate : handleSubmit}>
        <Input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <TextArea
          placeholder="내용을 입력하세요..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
        <ButtonGroup>
          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? '처리 중...' : (editingNotice ? '수정하기' : '등록하기')}
          </SubmitButton>
          <ClearButton
            type="button"
            onClick={() => {
              setTitle('');
              setContent('');
              setError('');
              setEditingNotice(null);
            }}
          >
            {editingNotice ? '취소' : '초기화'}
          </ClearButton>
        </ButtonGroup>
      </Form>

      <NoticeList>
        <ListTitle>공지사항 목록</ListTitle>
        {notices.map(notice => (
          <NoticeItem key={notice.id}>
            <NoticeHeader onClick={() => toggleNotice(notice.id)}>
              <HeaderContent>
                <NoticeTitle>{notice.title}</NoticeTitle>
                <NoticeDate>{formatDate(notice.date)}</NoticeDate>
              </HeaderContent>
              <ActionButtons onClick={e => e.stopPropagation()}>
                <EditButton onClick={() => handleEdit(notice)}>수정</EditButton>
                <DeleteButton onClick={() => setDeleteConfirm({ isOpen: true, noticeId: notice.id })}>
                  삭제
                </DeleteButton>
              </ActionButtons>
              <ToggleIcon isOpen={openNoticeId === notice.id}>▼</ToggleIcon>
            </NoticeHeader>
            <NoticeContent isOpen={openNoticeId === notice.id}>
              {notice.content}
            </NoticeContent>
          </NoticeItem>
        ))}
      </NoticeList>

      {deleteConfirm.isOpen && (
        <DeleteConfirmModal>
          <ModalContent>
            <h3>공지사항 삭제</h3>
            <p>정말 이 공지사항을 삭제하시겠습니까?</p>
            <ModalButtons>
              <DeleteConfirmButton onClick={() => handleDelete(deleteConfirm.noticeId)}>
                삭제
              </DeleteConfirmButton>
              <CancelButton onClick={() => setDeleteConfirm({ isOpen: false, noticeId: null })}>
                취소
              </CancelButton>
            </ModalButtons>
          </ModalContent>
        </DeleteConfirmModal>
      )}
    </AdminLayout>
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const AuthForm = styled(Form)`
  max-width: 400px;
  margin: 0 auto;
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
`;

const TextArea = styled.textarea`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  min-height: 300px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #FFB6C1;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    
    button {
      width: 100%;
    }
  }
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  flex: 1;
`;

const SubmitButton = styled(Button)`
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
  background-color: #f0f0f0;
  color: #666;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const CancelButton = styled(Button)`
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

const NoticeList = styled.div`
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    margin-top: 1.5rem;
  }
`;

const ListTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
`;

const NoticeItem = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 1rem;
    margin-bottom: 1rem;
  }
`;

const NoticeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  cursor: pointer;
  
  &:hover {
    background-color: #f8f8f8;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const NoticeTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin: 0;
`;

const NoticeDate = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const ToggleIcon = styled.span`
  margin-left: 1rem;
  transition: transform 0.3s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0)'};
`;

const NoticeContent = styled.p`
  color: #666;
  white-space: pre-wrap;
  line-height: 1.6;
  margin: 0;
  padding: ${props => props.isOpen ? '1.5rem' : '0'};
  max-height: ${props => props.isOpen ? '1000px' : '0'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  transition: all 0.3s ease;
  overflow: hidden;
  background-color: #f9f9f9;
  
  @media (max-width: 768px) {
    padding: ${props => props.isOpen ? '1rem' : '0'};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    width: 100%;
    
    button {
      flex: 1;
      padding: 0.8rem;
    }
  }
`;

const ActionButton = styled.button`
  padding: 0.3rem 0.8rem;
  border: none;
  border-radius: 3px;
  font-size: 0.9rem;
  cursor: pointer;
  
  @media (max-width: 768px) {
    padding: 0.2rem 0.6rem;
    font-size: 0.8rem;
  }
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

export default NoticeAdmin;