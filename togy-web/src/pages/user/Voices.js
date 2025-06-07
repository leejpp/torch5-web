import React, { useState } from 'react';
import { db } from '../../firebase/config';
import styled, { keyframes } from 'styled-components';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { colors, typography, spacing, shadows, borderRadius, media } from '../../styles/designSystem';

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
      <BackgroundOverlay />
      
      <Header>
        <HeaderContent>
          <HeaderIconContainer>
            <HeaderIcon>💬</HeaderIcon>
            <FloatingBubbles>
              <Bubble delay={0}>💭</Bubble>
              <Bubble delay={0.5}>💝</Bubble>
              <Bubble delay={1}>✨</Bubble>
            </FloatingBubbles>
          </HeaderIconContainer>
          <Title>마음의 소리</Title>
          <Subtitle>청년부에 하고 싶은 소중한 이야기를 들려주세요</Subtitle>
        </HeaderContent>
      </Header>

      <MainContent>
        <ContentSection>
          <SectionHeader>
            <SectionTitle>
              💌 <GradientText>당신의 마음을 전해주세요</GradientText>
            </SectionTitle>
            <SectionDescription>
              발전 아이디어, 개선 사항, 또는 어떤 이야기든 환영합니다
            </SectionDescription>
          </SectionHeader>

          <FormContainer>
            <MessageForm onSubmit={handleSubmit}>
              <FormCard>
                <CardGradient />
                <CardContent>
                  <InputSection>
                    <InputLabel>
                      <LabelIcon>💭</LabelIcon>
                      <LabelText>마음의 소리</LabelText>
                      <RequiredBadge>필수</RequiredBadge>
                    </InputLabel>
                    
                    <InputContainer>
                      <MessageInput 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="• 청년부 활동에 대한 의견이나 제안을 들려주세요&#10;• 함께 하고 싶은 활동이나 개선점을 알려주세요&#10;• 감사한 마음이나 격려의 말씀도 좋아요&#10;• 어떤 이야기든 진심으로 들어드려요 💙"
                        required
                        maxLength={1000}
                      />
                      <InputGlow />
                    </InputContainer>
                    
                    <InputFooter>
                      <CharacterCount isLimit={message.length > 800}>
                        <CountNumber>{message.length}</CountNumber> / 1000
                      </CharacterCount>
                      <InputTips>
                        💡 <TipText>익명으로 안전하게 전달됩니다</TipText>
                      </InputTips>
                    </InputFooter>
                  </InputSection>

                  <SubmitSection>
                    <SubmitButton type="submit" disabled={isSubmitting || !message.trim()}>
                      {isSubmitting ? (
                        <ButtonContent>
                          <LoadingSpinner />
                          <ButtonText>마음을 전달하는 중...</ButtonText>
                        </ButtonContent>
                      ) : (
                        <ButtonContent>
                          <ButtonIcon>💌</ButtonIcon>
                          <ButtonText>소중한 마음 전달하기</ButtonText>
                          <ButtonArrow>→</ButtonArrow>
                        </ButtonContent>
                      )}
                    </SubmitButton>
                    
                    <SubmitNote>
                      전달된 마음의 소리는 청년부 운영진이 소중히 읽어보겠습니다
                    </SubmitNote>
                  </SubmitSection>
                </CardContent>
              </FormCard>
            </MessageForm>
          </FormContainer>

          <GuideSection>
            <GuideCard>
              <GuideHeader>
                <GuideIcon>🌟</GuideIcon>
                <GuideTitle>이런 이야기를 기다려요</GuideTitle>
              </GuideHeader>
              <GuideList>
                <GuideItem>
                  <ItemIcon>💡</ItemIcon>
                  <ItemText>청년부 활동 개선 아이디어</ItemText>
                </GuideItem>
                <GuideItem>
                  <ItemIcon>🎯</ItemIcon>
                  <ItemText>새로운 프로그램 제안</ItemText>
                </GuideItem>
                <GuideItem>
                  <ItemIcon>💙</ItemIcon>
                  <ItemText>감사 인사나 격려의 말씀</ItemText>
                </GuideItem>
                <GuideItem>
                  <ItemIcon>🤝</ItemIcon>
                  <ItemText>함께 하고 싶은 활동</ItemText>
                </GuideItem>
              </GuideList>
            </GuideCard>
          </GuideSection>
        </ContentSection>
      </MainContent>

      {showSuccess && (
        <SuccessOverlay>
          <SuccessModal>
            <SuccessBackground />
            <SuccessContent>
              <SuccessIconContainer>
                <SuccessIcon>✨</SuccessIcon>
                <SuccessRings>
                  <Ring delay={0} />
                  <Ring delay={0.2} />
                  <Ring delay={0.4} />
                </SuccessRings>
              </SuccessIconContainer>
              <SuccessTitle>소중한 마음이 전달되었어요!</SuccessTitle>
              <SuccessMessage>
                진심어린 마음의 소리를 들려주셔서 감사합니다<br/>
                더 나은 청년부를 만들어가겠습니다
              </SuccessMessage>
              <SuccessFooter>💙 TOGY 청년부 일동</SuccessFooter>
            </SuccessContent>
          </SuccessModal>
        </SuccessOverlay>
      )}
    </Container>
  );
};

// 애니메이션
const fadeInUp = keyframes`
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
    transform: translateY(-12px);
  }
`;

const bubbleFloat = keyframes`
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) scale(1.1);
    opacity: 1;
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const slideUp = keyframes`
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const ringExpand = keyframes`
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const glow = keyframes`
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
`;

// 스타일 컴포넌트
const Container = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
`;

const BackgroundOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  z-index: -2;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.03) 0%, transparent 50%);
  }
`;

const Header = styled.header`
  background: ${colors.gradients.secondary};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  }
`;

const HeaderContent = styled.div`
  position: relative;
  padding: ${spacing['4xl']} ${spacing['2xl']} ${spacing['3xl']};
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  
  ${media['max-md']} {
    padding: ${spacing['3xl']} ${spacing.lg} ${spacing['2xl']};
  }
`;

const HeaderIconContainer = styled.div`
  position: relative;
  display: inline-block;
  margin-bottom: ${spacing.xl};
`;

const HeaderIcon = styled.div`
  font-size: ${typography.fontSize['4xl']};
  animation: ${float} 4s ease-in-out infinite, ${fadeInUp} 0.8s ease-out;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1));
  
  ${media['max-md']} {
    font-size: ${typography.fontSize['3xl']};
  }
`;

const FloatingBubbles = styled.div`
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  pointer-events: none;
`;

const Bubble = styled.div`
  position: absolute;
  font-size: ${typography.fontSize.lg};
  animation: ${bubbleFloat} 3s ease-in-out infinite ${props => props.delay}s;
  
  &:nth-child(1) {
    top: 10%;
    left: 20%;
  }
  &:nth-child(2) {
    top: 20%;
    right: 15%;
  }
  &:nth-child(3) {
    bottom: 15%;
    left: 30%;
  }
`;

const Title = styled.h1`
  color: white;
  font-size: ${typography.fontSize['4xl']};
  font-weight: ${typography.fontWeight.extrabold};
  margin-bottom: ${spacing.lg};
  font-family: ${typography.fontFamily.heading};
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  
  ${media['max-md']} {
    font-size: ${typography.fontSize['2xl']};
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.medium};
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;
  line-height: ${typography.lineHeight.relaxed};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.lg};
  }
`;

const MainContent = styled.main`
  max-width: 1000px;
  margin: 0 auto;
  padding: ${spacing['3xl']} ${spacing.lg};
  
  ${media['max-md']} {
    padding: ${spacing['2xl']} ${spacing.md};
  }
`;

const ContentSection = styled.section`
  animation: ${fadeInUp} 0.8s ease-out 0.6s both;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: ${spacing['3xl']};
  
  ${media['max-md']} {
    margin-bottom: ${spacing['2xl']};
  }
`;

const SectionTitle = styled.h2`
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.lg};
  font-family: ${typography.fontFamily.heading};
  color: ${colors.neutral[800]};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.xl};
  }
`;

const GradientText = styled.span`
  background: ${colors.gradients.secondary};
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SectionDescription = styled.p`
  color: ${colors.neutral[600]};
  font-size: ${typography.fontSize.lg};
  line-height: ${typography.lineHeight.relaxed};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.base};
  }
`;

const FormContainer = styled.div`
  margin-bottom: ${spacing['3xl']};
`;

const MessageForm = styled.form`
  width: 100%;
`;

const FormCard = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${borderRadius['2xl']};
  box-shadow: ${shadows.lg};
  transition: all 0.4s ease;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${shadows['2xl']};
  }
`;

const CardGradient = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: ${colors.gradients.secondary};
`;

const CardContent = styled.div`
  padding: ${spacing['3xl']};
  position: relative;
  z-index: 1;
  
  ${media['max-md']} {
    padding: ${spacing['2xl']};
  }
`;

const InputSection = styled.div`
  margin-bottom: ${spacing['2xl']};
`;

const InputLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.lg};
`;

const LabelIcon = styled.span`
  font-size: ${typography.fontSize.lg};
`;

const LabelText = styled.span`
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.neutral[800]};
`;

const RequiredBadge = styled.span`
  background: ${colors.gradients.accent};
  color: white;
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${borderRadius.full};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.bold};
`;

const InputContainer = styled.div`
  position: relative;
  margin-bottom: ${spacing.lg};
`;

const MessageInput = styled.textarea`
  width: 100%;
  height: 280px;
  padding: ${spacing.xl};
  border: 2px solid ${colors.neutral[200]};
  border-radius: ${borderRadius.xl};
  font-size: ${typography.fontSize.base};
  font-family: ${typography.fontFamily.body};
  line-height: ${typography.lineHeight.relaxed};
  resize: vertical;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.8);
  
  ${media['max-md']} {
    height: 240px;
    padding: ${spacing.lg};
    font-size: ${typography.fontSize.sm};
  }
  
  &:focus {
    outline: none;
    border-color: ${colors.secondary[400]};
    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
    background: white;
  }

  &::placeholder {
    color: ${colors.neutral[500]};
    line-height: ${typography.lineHeight.relaxed};
  }
`;

const InputGlow = styled.div`
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: ${colors.gradients.secondary};
  border-radius: ${borderRadius.xl};
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
  animation: ${glow} 2s ease-in-out infinite;
  
  ${MessageInput}:focus + & {
    opacity: 0.3;
  }
`;

const InputFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  ${media['max-md']} {
    flex-direction: column;
    gap: ${spacing.sm};
    align-items: flex-start;
  }
`;

const CharacterCount = styled.div`
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  color: ${props => props.isLimit ? colors.accent[600] : colors.neutral[500]};
`;

const CountNumber = styled.span`
  font-weight: ${typography.fontWeight.bold};
  color: ${props => props.parent?.isLimit ? colors.accent[700] : colors.secondary[600]};
`;

const InputTips = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  font-size: ${typography.fontSize.sm};
`;

const TipText = styled.span`
  color: ${colors.neutral[500]};
  font-style: italic;
`;

const SubmitSection = styled.div`
  text-align: center;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: ${spacing.xl} ${spacing['2xl']};
  background: ${colors.gradients.secondary};
  color: white;
  border: none;
  border-radius: ${borderRadius.xl};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${shadows.md};
  margin-bottom: ${spacing.lg};
  
  ${media['max-md']} {
    padding: ${spacing.lg} ${spacing.xl};
    font-size: ${typography.fontSize.base};
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: ${shadows.xl};
  }
  
  &:disabled {
    background: ${colors.neutral[400]};
    cursor: not-allowed;
    transform: none;
    box-shadow: ${shadows.sm};
  }
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
`;

const ButtonIcon = styled.span`
  font-size: ${typography.fontSize.xl};
`;

const ButtonText = styled.span`
  flex: 1;
`;

const ButtonArrow = styled.span`
  font-size: ${typography.fontSize.xl};
  transition: transform 0.3s ease;
  
  ${SubmitButton}:hover:not(:disabled) & {
    transform: translateX(4px);
  }
`;

const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: ${borderRadius.full};
  animation: ${spin} 1s linear infinite;
`;

const SubmitNote = styled.p`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.sm};
  line-height: ${typography.lineHeight.relaxed};
  font-style: italic;
`;

const GuideSection = styled.div`
  animation: ${fadeInUp} 0.8s ease-out 0.8s both;
`;

const GuideCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: ${borderRadius.xl};
  padding: ${spacing['2xl']};
  box-shadow: ${shadows.sm};
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  ${media['max-md']} {
    padding: ${spacing.xl};
  }
`;

const GuideHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.lg};
`;

const GuideIcon = styled.span`
  font-size: ${typography.fontSize.xl};
`;

const GuideTitle = styled.h3`
  color: ${colors.neutral[800]};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.semibold};
  margin: 0;
`;

const GuideList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${spacing.lg};
  
  ${media['max-md']} {
    grid-template-columns: 1fr;
    gap: ${spacing.md};
  }
`;

const GuideItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.md};
  background: rgba(255, 255, 255, 0.6);
  border-radius: ${borderRadius.lg};
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
  }
`;

const ItemIcon = styled.span`
  font-size: ${typography.fontSize.base};
`;

const ItemText = styled.span`
  color: ${colors.neutral[700]};
  font-size: ${typography.fontSize.sm};
`;

const SuccessOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeInUp} 0.3s ease;
`;

const SuccessModal = styled.div`
  position: relative;
  max-width: 400px;
  margin: ${spacing.lg};
  animation: ${slideUp} 0.4s ease;
`;

const SuccessBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  border-radius: ${borderRadius['2xl']};
  box-shadow: ${shadows['2xl']};
`;

const SuccessContent = styled.div`
  position: relative;
  z-index: 1;
  padding: ${spacing['3xl']} ${spacing['2xl']};
  text-align: center;
  
  ${media['max-md']} {
    padding: ${spacing['2xl']} ${spacing.xl};
  }
`;

const SuccessIconContainer = styled.div`
  position: relative;
  display: inline-block;
  margin-bottom: ${spacing.xl};
`;

const SuccessIcon = styled.div`
  font-size: ${typography.fontSize['4xl']};
  position: relative;
  z-index: 1;
  
  ${media['max-md']} {
    font-size: ${typography.fontSize['3xl']};
  }
`;

const SuccessRings = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const Ring = styled.div`
  position: absolute;
  width: 60px;
  height: 60px;
  border: 2px solid ${colors.secondary[300]};
  border-radius: ${borderRadius.full};
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: ${ringExpand} 2s ease-out infinite ${props => props.delay}s;
`;

const SuccessTitle = styled.h3`
  color: ${colors.neutral[800]};
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  margin-bottom: ${spacing.lg};
  font-family: ${typography.fontFamily.heading};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.lg};
  }
`;

const SuccessMessage = styled.p`
  color: ${colors.neutral[600]};
  font-size: ${typography.fontSize.base};
  line-height: ${typography.lineHeight.relaxed};
  margin-bottom: ${spacing.lg};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.sm};
  }
`;

const SuccessFooter = styled.p`
  color: ${colors.secondary[600]};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  margin: 0;
`;

export default Voices; 