import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import CryptoJS from 'crypto-js';

const AdminAuth = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container>
        <BackgroundOverlay />
        <AuthCard>
          <IconContainer>
            <LockIcon>🔐</LockIcon>
          </IconContainer>
          
          <Title>관리자 인증</Title>
          <Subtitle>TOGY 관리자 페이지에 접근하려면<br/>인증이 필요합니다</Subtitle>
          
          <AuthForm onSubmit={handlePasswordSubmit}>
            <InputContainer>
              <PasswordInput
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                hasError={!!error}
              />
              <InputIcon>🔑</InputIcon>
            </InputContainer>
            
            {error && (
              <ErrorContainer>
                <ErrorMessage>{error}</ErrorMessage>
              </ErrorContainer>
            )}
            
            <ButtonContainer>
              <SubmitButton type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    인증 중...
                  </>
                ) : (
                  '확인'
                )}
              </SubmitButton>
              <CancelButton type="button" onClick={() => navigate('/')} disabled={isLoading}>
                취소
              </CancelButton>
            </ButtonContainer>
          </AuthForm>
          
          <FooterText>
            보안을 위해 관리자만 접근 가능합니다
          </FooterText>
        </AuthCard>
      </Container>
    );
  }

  return children;
};

// 애니메이션 정의
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
`;

// 스타일 컴포넌트들
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  position: relative;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const BackgroundOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: -1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%);
  }
`;

const AuthCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  animation: ${fadeIn} 0.8s ease-out;
  
  @media (max-width: 768px) {
    padding: 2.5rem 2rem;
    border-radius: 20px;
  }
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const LockIcon = styled.div`
  font-size: 4rem;
  animation: ${float} 3s ease-in-out infinite;
  filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.1));
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  text-align: center;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const Subtitle = styled.p`
  color: #718096;
  text-align: center;
  margin-bottom: 2.5rem;
  line-height: 1.6;
  font-size: 0.95rem;
`;

const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputContainer = styled.div`
  position: relative;
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3.5rem;
  border: 2px solid ${props => props.hasError ? '#e53e3e' : '#e2e8f0'};
  border-radius: 16px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  color: #2d3748;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#e53e3e' : '#667eea'};
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 0 4px ${props => props.hasError ? 'rgba(229, 62, 62, 0.1)' : 'rgba(102, 126, 234, 0.1)'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: #a0aec0;
  }
  
  ${props => props.hasError && `
    animation: ${shake} 0.5s ease-in-out;
  `}
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  opacity: 0.7;
`;

const ErrorContainer = styled.div`
  margin-top: -0.5rem;
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
  color: #c53030;
  padding: 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  text-align: center;
  border: 1px solid #fca5a5;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const SubmitButton = styled(Button)`
  flex: 2;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const CancelButton = styled(Button)`
  flex: 1;
  background: rgba(113, 128, 150, 0.1);
  color: #718096;
  border: 2px solid rgba(113, 128, 150, 0.2);
  
  &:hover:not(:disabled) {
    background: rgba(113, 128, 150, 0.15);
    color: #4a5568;
    transform: translateY(-1px);
  }
`;

const LoadingSpinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const FooterText = styled.p`
  color: #a0aec0;
  text-align: center;
  margin-top: 2rem;
  font-size: 0.85rem;
`;

export default AdminAuth;