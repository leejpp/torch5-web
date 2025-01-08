import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import CryptoJS from 'crypto-js';

const Voices = () => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [passwordCheck, setPasswordCheck] = useState({
    isOpen: false,
    password: '',
    error: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const docData = {
        message: message.trim(),
        createdAt: Timestamp.fromDate(new Date())
      };
      console.log('Trying to save:', docData);
      
      await addDoc(collection(db, 'voices'), docData);
      setMessage('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error adding voice:", error);
      console.error("Error details:", error.code, error.message);
    } finally {
      setIsSubmitting(false);
    }
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
        setPasswordCheck({
          isOpen: false,
          password: '',
          error: ''
        });
        navigate('/voices/admin');
      } else {
        setPasswordCheck(prev => ({
          ...prev,
          error: '비밀번호가 일치하지 않습니다.'
        }));
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      setPasswordCheck(prev => ({
        ...prev,
        error: '시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      }));
    }
  };

  return (
    <Container>
      <Header>
        <TitleSection>
          <HomeButton to="/">← 홈으로</HomeButton>
          <Title>마음의 소리</Title>
        </TitleSection>
        <AdminButton onClick={() => setPasswordCheck({ isOpen: true, password: '', error: '' })}>
          소리 듣기
        </AdminButton>
      </Header>

      <MessageForm onSubmit={handleSubmit}>
        <Description>
          청년부에 하고 싶은 이야기를 자유롭게 적어주세요.
          (발전 아이디어, 개선 사항 등)
        </Description>
        <MessageInput 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="마음의 소리를 들려주세요..."
          required
        />
        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? '전송 중...' : '보내기'}
        </SubmitButton>
      </MessageForm>

      {showSuccess && (
        <SuccessMessage>
          소중한 마음이 전달되었습니다 💌
        </SuccessMessage>
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
              <ModalSubmitButton type="submit">
                확인
              </ModalSubmitButton>
              <CancelButton type="button" onClick={() => setPasswordCheck({
                isOpen: false,
                password: '',
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
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

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

const AdminButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 5px;
  text-decoration: none;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const MessageForm = styled.form`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Description = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const MessageInput = styled.textarea`
  width: 100%;
  height: 200px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #FFB6C1;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: #FFB6C1;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    background-color: #FF69B4;
  }
  
  &:disabled {
    background-color: #ddd;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: #4CAF50;
  color: white;
  padding: 1rem 2rem;
  border-radius: 5px;
  animation: fadeIn 0.3s ease-in;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, 1rem); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }
`;

const FormOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PasswordModal = styled.form`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 300px;
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #FFB6C1;
  }
`;

const ErrorMessage = styled.p`
  color: #FF0000;
  margin-bottom: 1rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CancelButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 5px;
  text-decoration: none;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const ModalSubmitButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #FFB6C1;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    background-color: #FF69B4;
  }
`;

export default Voices; 