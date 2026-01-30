import React, { useState } from 'react';
import styled from 'styled-components';
import { colors, typography, spacing, shadows, borderRadius } from '../../styles/designSystem';

const FlashCardMode = ({ verse, onBack }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <Container>
            <Header>
                <BackButton onClick={onBack}>⬅︎ 뒤로가기</BackButton>
                <ModeTitle>플래시 카드</ModeTitle>
            </Header>

            <Description>
                카드를 터치하여 앞면(주소)과 뒷면(말씀)을 확인하며 암송해보세요.
            </Description>

            <Scene>
                <CardContainer $isFlipped={isFlipped} onClick={handleFlip}>
                    <CardFace $front>
                        <Label>말씀 주소</Label>
                        <FrontContent>{verse.reference}</FrontContent>
                        <HintText>터치해서 말씀 확인하기 👆</HintText>
                    </CardFace>
                    <CardFace $back>
                        <Label>말씀 내용</Label>
                        <BackContent>{verse.content}</BackContent>
                        <HintText>터치해서 주소 확인하기 👆</HintText>
                    </CardFace>
                </CardContainer>
            </Scene>
        </Container>
    );
};

// Styles
const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: ${spacing.lg};
    position: relative;
`;

const BackButton = styled.button`
    background: none;
    border: none;
    color: ${colors.neutral[600]};
    font-weight: bold;
    cursor: pointer;
    font-size: ${typography.fontSize.md};
`;

const ModeTitle = styled.h2`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: ${typography.fontSize.lg};
    font-weight: bold;
    color: ${colors.primary[800]};
    margin: 0;
`;

const Description = styled.p`
    text-align: center;
    color: ${colors.neutral[500]};
    margin-bottom: ${spacing.xl};
`;

const Scene = styled.div`
    width: 100%;
    height: 400px;
    perspective: 1000px;
`;

const CardContainer = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
    transition: transform 0.6s;
    transform-style: preserve-3d;
    cursor: pointer;
    transform: ${props => props.$isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};
`;

const CardFace = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: ${borderRadius.xl};
    box-shadow: ${shadows.lg};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${spacing.xl};
    background: white;
    border: 2px solid ${colors.primary[100]};
    transform: ${props => props.$back ? 'rotateY(180deg)' : 'rotateY(0deg)'};
`;

const Label = styled.span`
    position: absolute;
    top: ${spacing.lg};
    background: ${colors.primary[50]};
    color: ${colors.primary[600]};
    padding: 4px 12px;
    border-radius: ${borderRadius.full};
    font-size: ${typography.fontSize.sm};
    font-weight: bold;
`;

const FrontContent = styled.h3`
    font-size: ${typography.fontSize['3xl']};
    font-weight: bold;
    color: ${colors.primary[800]};
    text-align: center;
`;

const BackContent = styled.p`
    font-family: 'Gowun Batang', serif;
    font-size: ${typography.fontSize.xl};
    line-height: 1.6;
    color: ${colors.neutral[800]};
    text-align: center;
    white-space: pre-wrap;
    word-break: keep-all;
`;

const HintText = styled.span`
    position: absolute;
    bottom: ${spacing.lg};
    color: ${colors.neutral[400]};
    font-size: ${typography.fontSize.sm};
    animation: bounce 2s infinite;

    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
        40% {transform: translateY(-5px);}
        60% {transform: translateY(-3px);}
    }
`;

export default FlashCardMode;
