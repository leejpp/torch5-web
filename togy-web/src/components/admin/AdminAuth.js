import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Outlet, Navigate } from 'react-router-dom'; // Changed to use Outlet
import { db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';

const AdminAuth = () => {
  // Check sessionStorage for existing session
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('adminAuth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const hashedInput = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
      const adminRef = doc(db, 'admin', 'settings');
      const adminDoc = await getDoc(adminRef);

      if (!adminDoc.exists()) {
        throw new Error('관리자 설정을 찾을 수 없습니다.');
      }

      const adminData = adminDoc.data();
      if (adminData?.passwords && adminData.passwords.includes(hashedInput)) {
        setIsAuthenticated(true);
        sessionStorage.setItem('adminAuth', 'true'); // Persist session
        setPassword('');
        setError('');
      } else {
        setPassword('');
        throw new Error('비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('Password check error:', error);
      setError(error.message || '인증 오류');
      setTimeout(() => {
        const input = document.querySelector('input[type="password"]');
        if (input) input.focus();
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Outlet />;
  }

  return (
    <Container>
      <AuthCard>
        <HeaderSection>
          <IconWrapper>🔒</IconWrapper>
          <Title>관리자 접근 권한</Title>
          <Subtitle>통합 관리자 페이지 접근을 위해<br />비밀번호를 입력해주세요.</Subtitle>
        </HeaderSection>

        <AuthForm onSubmit={handlePasswordSubmit}>
          <InputWrapper>
            <PasswordInput
              type="password"
              placeholder="관리자 비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              hasError={!!error}
              autoFocus
            />
          </InputWrapper>

          {error && <ErrorMessage>⚠️ {error}</ErrorMessage>}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? '확인 중...' : '확인'}
          </Button>
        </AuthForm>

        <FooterText>
          이 페이지는 관계자 외 접근을 금합니다.<br />
          Torch Church Admin Portal
        </FooterText>
      </AuthCard>
    </Container>
  );
};

// Animations
const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styles - Matching AdminPortal.js Aesthetic
const Container = styled.div`
    min-height: 100vh;
    background-color: ${colors.neutral[50]};
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${spacing.md};
    background-image: radial-gradient(${colors.neutral[200]} 1px, transparent 1px);
    background-size: 20px 20px;
`;

const AuthCard = styled.div`
    background: white;
    width: 100%;
    max-width: 400px;
    padding: ${spacing['2xl']};
    border-radius: ${borderRadius.xl};
    box-shadow: ${shadows.lg};
    border: 1px solid ${colors.neutral[200]};
    text-align: center;
    animation: ${fadeIn} 0.5s ease-out;
`;

const HeaderSection = styled.div`
    margin-bottom: ${spacing.xl};
`;

const IconWrapper = styled.div`
    font-size: 3rem;
    margin-bottom: ${spacing.md};
`;

const Title = styled.h2`
    font-size: ${typography.fontSize['2xl']};
    color: ${colors.neutral[800]};
    margin-bottom: ${spacing.sm};
    font-weight: ${typography.fontWeight.bold};
`;

const Subtitle = styled.p`
    color: ${colors.neutral[500]};
    font-size: ${typography.fontSize.sm};
    line-height: 1.5;
`;

const AuthForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: ${spacing.lg};
    margin-bottom: ${spacing.xl};
`;

const InputWrapper = styled.div`
    width: 100%;
`;

const PasswordInput = styled.input`
    width: 100%;
    padding: ${spacing.md};
    border: 2px solid ${props => props.hasError ? colors.error[300] : colors.neutral[300]};
    border-radius: ${borderRadius.lg};
    font-size: ${typography.fontSize.lg};
    text-align: center;
    transition: all 0.2s;
    outline: none;

    &:focus {
        border-color: ${props => props.hasError ? colors.error[500] : colors.primary[500]};
        box-shadow: 0 0 0 3px ${props => props.hasError ? colors.error[100] : colors.primary[100]};
    }

    ${props => props.hasError && css`
        animation: ${shake} 0.4s ease-in-out;
    `}
`;

const ErrorMessage = styled.div`
    color: ${colors.error[600]};
    font-size: ${typography.fontSize.sm};
    margin-top: -${spacing.sm};
    font-weight: 500;
`;

const Button = styled.button`
    width: 100%;
    padding: ${spacing.md};
    background-color: ${colors.primary[600]};
    color: white;
    border: none;
    border-radius: ${borderRadius.lg};
    font-size: ${typography.fontSize.lg};
    font-weight: ${typography.fontWeight.bold};
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover:not(:disabled) {
        background-color: ${colors.primary[700]};
    }

    &:disabled {
        background-color: ${colors.neutral[400]};
        cursor: not-allowed;
    }
`;

const FooterText = styled.p`
    font-size: ${typography.fontSize.xs};
    color: ${colors.neutral[400]};
    line-height: 1.5;
`;

export default AdminAuth;