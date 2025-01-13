import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import CryptoJS from 'crypto-js';

const AdminAuth = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const hashedInput = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
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
        setIsAuthenticated(true);
        setPassword('');
        setError('');
      } else {
        throw new Error('비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('Password check error:', error);
      setError(error.message || '인증 오류가 발생했습니다.');
    }
  };

  if (!isAuthenticated) {
    return (
      <Container>
        <AuthForm onSubmit={handlePasswordSubmit}>
          <Title>관리자 인증</Title>
          <Input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <ButtonContainer>
            <SubmitButton type="submit">확인</SubmitButton>
            <CancelButton type="button" onClick={() => navigate('/')}>
              취소
            </CancelButton>
          </ButtonContainer>
        </AuthForm>
      </Container>
    );
  }

  return children;
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const AuthForm = styled.form`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 400px;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: #333;
  text-align: center;
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
  gap: 1rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
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

const ErrorMessage = styled.p`
  color: #ff4444;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

export default AdminAuth;