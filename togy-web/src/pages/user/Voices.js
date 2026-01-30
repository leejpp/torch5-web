import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import styled from 'styled-components';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { colors, typography, spacing, borderRadius, media } from '../../styles/designSystem';

const Voices = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'voices'), {
        message: message.trim(),
        createdAt: Timestamp.fromDate(new Date())
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
      <TopControls>
        <BackButton onClick={() => navigate('/togy')}>←</BackButton>
      </TopControls>

      <Header>
        <PageTitle>Voices of Heart</PageTitle>
        <SubTitle>마음의 소리</SubTitle>
      </Header>

      <ContentSection>
        <Description>
          청년부 활동에 대한 의견, 제안, 또는 나누고 싶은 이야기를 자유롭게 남겨주세요.<br />
          익명으로 전달되며 소중히 경청하겠습니다.
        </Description>

        <Form onSubmit={handleSubmit}>
          <TextArea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="여기에 내용을 입력해주세요..."
            maxLength={1000}
            required
          />

          <CharCount>{message.length} / 1000</CharCount>

          <SubmitButton type="submit" disabled={isSubmitting || !message.trim()}>
            {isSubmitting ? '전송 중...' : '마음 전달하기'}
          </SubmitButton>
        </Form>
      </ContentSection>

      {showSuccess && (
        <SuccessMessage>
          소중한 마음이 전달되었습니다. 감사합니다.
        </SuccessMessage>
      )}
    </Container>
  );
};

// Styles
const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
  background: white;
  padding: ${spacing.xl};

  ${media['max-md']} {
    padding: ${spacing.md};
  }
`;

const TopControls = styled.div`
  margin-bottom: ${spacing.lg};
`;

const BackButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid ${colors.neutral[200]};
  border-radius: ${borderRadius.full};
  color: ${colors.neutral[600]};
  font-size: ${typography.fontSize.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${colors.neutral[50]};
    color: ${colors.neutral[900]};
  }
`;

const Header = styled.header`
  margin-bottom: ${spacing.xl};
  padding-bottom: ${spacing.md};
  border-bottom: 2px solid ${colors.neutral[900]};
`;

const PageTitle = styled.h1`
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
`;

const SubTitle = styled.p`
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[500]};
  margin: 0;
`;

const ContentSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xl};
`;

const Description = styled.p`
  color: ${colors.neutral[600]};
  font-size: ${typography.fontSize.base};
  line-height: 1.6;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: ${spacing.lg};
  border: 1px solid ${colors.neutral[200]};
  border-radius: ${borderRadius.lg};
  font-size: ${typography.fontSize.base};
  line-height: 1.6;
  color: ${colors.neutral[900]};
  resize: vertical;
  background: ${colors.neutral[50]};

  &:focus {
    outline: none;
    border-color: ${colors.neutral[400]};
    background: white;
  }
  
  &::placeholder {
    color: ${colors.neutral[400]};
  }
`;

const CharCount = styled.div`
  text-align: right;
  font-size: ${typography.fontSize.xs};
  color: ${colors.neutral[400]};
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: ${spacing.lg};
  background: ${colors.neutral[900]};
  color: white;
  border: none;
  border-radius: ${borderRadius.lg};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.bold};
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: ${colors.neutral[700]};
  }

  &:disabled {
    background: ${colors.neutral[300]};
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: ${colors.neutral[900]};
  color: white;
  padding: ${spacing.md} ${spacing.xl};
  border-radius: ${borderRadius.full};
  font-size: ${typography.fontSize.sm};
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, 10px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }
`;

export default Voices;
