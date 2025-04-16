import React, { useState } from 'react';
import { db } from '../../firebase/config';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
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

      const discordMessage = {
        embeds: [{
          title: "💌 새로운 마음의 소리가 도착했습니다!",
          description: message.trim(),
          color: 0x4285F4,
          footer: {
            text: "TOGY 청년부"
          }
        }]
      };

      await fetch("https://discord.com/api/webhooks/1328644931329331232/TpYknhG9Ch6UN9uApn9Gman6bHdhlb3E2DwxkZLJ9FSCA6XPay7y8tCc6kq5TMWuy9lt", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discordMessage)
      });

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
    <Container>
      <MessageForm onSubmit={handleSubmit}>
        <FormTitle>마음의 소리</FormTitle>
        <Description>
          청년부에 하고 싶은 이야기를 자유롭게 적어주세요.
          <br />(발전 아이디어, 개선 사항 등)
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

const MessageForm = styled.form`
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const FormTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
  color: #4285F4;
  text-align: center;
  margin: 0 0 1.5rem 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
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
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  
  @media (max-width: 768px) {
    height: 150px;
    padding: 0.8rem;
    font-size: 0.95rem;
  }
  
  &:focus {
    outline: none;
    border-color: #4285F4;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: #4285F4;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  @media (max-width: 768px) {
    padding: 0.8rem;
  }
  
  &:hover {
    background-color: ${props => props.disabled ? '#888' : '#357ae8'};
  }
  
  &:disabled {
    background-color: #888;
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
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
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