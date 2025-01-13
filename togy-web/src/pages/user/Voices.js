import React, { useState } from 'react';
import { db } from '../../firebase/config';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import UserLayout from '../../layouts/UserLayout';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const Voices = () => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const docData = {
        message: message.trim(),
        createdAt: Timestamp.fromDate(new Date())
      };
      
      await addDoc(collection(db, 'voices'), docData);
      setMessage('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error adding voice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UserLayout>
      <Header>
        <TitleSection>
          <HomeButton to="/">← 홈으로</HomeButton>
          <Title>마음의 소리</Title>
        </TitleSection>
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
    </UserLayout>
  );
};

const Container = styled.div`
  max-width: 800px;
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

const MessageForm = styled.form`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const Description = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 1rem;
  }
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
  
  @media (max-width: 768px) {
    height: 150px;
    padding: 0.8rem;
    font-size: 0.95rem;
  }
  
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
  
  @media (max-width: 768px) {
    padding: 0.8rem;
  }
  
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
  
  @media (max-width: 768px) {
    width: 90%;
    padding: 0.8rem;
    text-align: center;
    font-size: 0.95rem;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, 1rem); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }
`;

export default Voices; 