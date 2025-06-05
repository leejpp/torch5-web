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
      <Header>
        <HeaderIcon>💬</HeaderIcon>
        <HeaderTitle>마음의 소리</HeaderTitle>
        <HeaderSubtitle>청년부에 하고 싶은 이야기를 자유롭게 적어주세요</HeaderSubtitle>
      </Header>

      <MessageForm onSubmit={handleSubmit}>
        <FormCard>
          <InputLabel>
            💭 마음의 소리
            <RequiredMark>*</RequiredMark>
          </InputLabel>
          <MessageInput 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="• 발전 아이디어나 개선 사항을 공유해주세요&#10;• 청년부 활동에 대한 의견을 들려주세요&#10;• 어떤 이야기든 환영합니다!"
            required
          />
          <CharacterCount>
            {message.length} / 1000
          </CharacterCount>
          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoadingSpinner />
                전송 중...
              </>
            ) : (
              <>
                💌 마음 전달하기
              </>
            )}
          </SubmitButton>
        </FormCard>
      </MessageForm>

      {showSuccess && (
        <SuccessOverlay>
          <SuccessMessage>
            <SuccessIcon>✨</SuccessIcon>
            <SuccessText>소중한 마음이 전달되었습니다!</SuccessText>
            <SuccessSubtext>감사합니다 💙</SuccessSubtext>
          </SuccessMessage>
        </SuccessOverlay>
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem 2rem 3rem;
  background-color: #f8f9fa;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 1rem 1rem 2rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const HeaderIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 0.8rem;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #4285F4;
  margin: 0 0 0.8rem 0;
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
    margin: 0 0 0.6rem 0;
  }
`;

const HeaderSubtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
  font-weight: 400;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const MessageForm = styled.form`
  width: 100%;
`;

const FormCard = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(66, 133, 244, 0.2);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12);
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 16px;
  }
`;

const InputLabel = styled.label`
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.8rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const RequiredMark = styled.span`
  color: #ff4444;
  margin-left: 0.2rem;
`;

const MessageInput = styled.textarea`
  width: 100%;
  height: 240px;
  padding: 1.2rem;
  margin-bottom: 0.5rem;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    height: 200px;
    padding: 1rem;
    border-radius: 12px;
    font-size: 0.95rem;
  }
  
  &:focus {
    outline: none;
    border-color: #4285F4;
    box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
  }

  &::placeholder {
    color: #999;
    line-height: 1.6;
  }
`;

const CharacterCount = styled.div`
  text-align: right;
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 1.5rem;
  font-weight: 500;
  
  @media (max-width: 768px) {
    margin-bottom: 1.2rem;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1.2rem 2rem;
  background: linear-gradient(135deg, #4285F4 0%, #1a73e8 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    border-radius: 12px;
    font-size: 1rem;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(66, 133, 244, 0.3);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #ccc 0%, #999 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SuccessOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const SuccessMessage = styled.div`
  background-color: white;
  padding: 2.5rem;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 320px;
  margin: 1rem;
  animation: slideUp 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 2rem;
    margin: 1rem;
    border-radius: 16px;
  }
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const SuccessIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const SuccessText = styled.h3`
  color: #4285F4;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const SuccessSubtext = styled.p`
  color: #666;
  margin: 0;
  font-size: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

export default Voices; 