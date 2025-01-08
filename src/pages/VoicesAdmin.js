import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { db, verifyPassword } from '../firebase/config';
import { collection, query, orderBy, getDocs, doc, getDoc, addDoc, Timestamp } from 'firebase/firestore';
import CryptoJS from 'crypto-js';

const VoicesAdmin = () => {
  const [voices, setVoices] = useState([]);
  const [passwordCheck, setPasswordCheck] = useState({
    isOpen: false,
    password: '',
    error: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const q = query(
        collection(db, 'voices'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setVoices(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    } catch (error) {
      console.error("Error fetching voices:", error);
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

  const handlePasswordSubmit = async () => {
    try {
      if (!verifyPassword(passwordCheck.password)) {
        throw new Error('비밀번호가 일치하지 않습니다.');
      }

      setPasswordCheck({
        isOpen: false,
        password: '',
        error: ''
      });
      navigate('/voices/admin');
    } catch (error) {
      console.error('Password check error:', error);
      setPasswordCheck(prev => ({
        ...prev,
        error: error.message || '시스템 오류가 발생했습니다.'
      }));
      return false;
    }
  };

  return (
    <Container>
      <Header>
        <TitleSection>
          <HomeButton to="/voices">← 돌아가기</HomeButton>
          <Title>마음의 소리함</Title>
        </TitleSection>
      </Header>

      <VoicesList>
        {voices.map((voice) => (
          <VoiceCard key={voice.id}>
            <VoiceContent>{voice.message}</VoiceContent>
            <VoiceDate>{formatDate(voice.createdAt)}</VoiceDate>
          </VoiceCard>
        ))}
        {voices.length === 0 && (
          <EmptyMessage>아직 전달된 마음의 소리가 없습니다.</EmptyMessage>
        )}
      </VoicesList>

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

const VoicesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const VoiceCard = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const VoiceContent = styled.p`
  color: #333;
  line-height: 1.6;
  margin-bottom: 1rem;
  white-space: pre-wrap;
`;

const VoiceDate = styled.span`
  color: #888;
  font-size: 0.9rem;
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: #666;
  padding: 2rem;
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

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SubmitButton = styled.button`
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

const ErrorMessage = styled.p`
  color: #FF0000;
  margin-bottom: 1rem;
`;

export default VoicesAdmin; 