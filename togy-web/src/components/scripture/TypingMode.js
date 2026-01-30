import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/designSystem';

const TypingMode = ({ verse, onBack }) => {
    const [userInput, setUserInput] = useState('');
    const [showHint, setShowHint] = useState(false);
    const [checkResult, setCheckResult] = useState(null); // null, 'success', 'fail'

    useEffect(() => {
        setUserInput('');
        setShowHint(false);
        setCheckResult(null);
    }, [verse]);

    const handleCheck = () => {
        // Remove spaces and punctuation for loose comparison if strict is too hard
        // But for scripture memory, exact match is usually desired.
        // Let's do a strict trim comparison first.

        const cleanTarget = verse.content.trim().replace(/\s+/g, ' ');
        const cleanInput = userInput.trim().replace(/\s+/g, ' ');

        if (cleanTarget === cleanInput) {
            setCheckResult('success');
        } else {
            setCheckResult('fail');
        }
    };

    return (
        <Container>
            <Header>
                <BackButton onClick={onBack}>⬅︎ 뒤로가기</BackButton>
                <ModeTitle>타이핑 연습</ModeTitle>
            </Header>

            <Description>
                말씀 전체를 암송하여 적어보세요.
            </Description>

            <GameArea>
                <VerseReference>{verse.reference}</VerseReference>

                <HintSection>
                    <HintButton onClick={() => setShowHint(!showHint)}>
                        {showHint ? '🙈 힌트 숨기기' : '👀 힌트 보기'}
                    </HintButton>
                    {showHint && <HintText>{verse.content}</HintText>}
                </HintSection>

                <TypingArea>
                    <StyledTextarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="이곳에 말씀을 적어주세요..."
                        spellCheck="false"
                        $status={checkResult}
                    />
                </TypingArea>

                <Controls>
                    <ActionButton onClick={handleCheck} disabled={userInput.length === 0}>
                        정답 확인
                    </ActionButton>
                    <ResetButton onClick={() => { setUserInput(''); setCheckResult(null); }}>
                        지우기
                    </ResetButton>
                </Controls>

                {checkResult === 'success' && (
                    <ResultArea>
                        <ResultText $success>🎉 완벽합니다! 말씀을 마음에 새기셨네요.</ResultText>
                    </ResultArea>
                )}

                {checkResult === 'fail' && (
                    <ResultArea>
                        <ResultText>🤔 조금 다르네요. 오타나 띄어쓰기를 확인해보세요.</ResultText>
                        <CorrectionBox>
                            <Label>정답:</Label>
                            <CorrectText>{verse.content}</CorrectText>
                        </CorrectionBox>
                        {/* Optional: Diff display could involve complex logic, for now simple stack is okay */}
                    </ResultArea>
                )}
            </GameArea>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
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

const GameArea = styled.div`
    width: 100%;
    background: white;
    padding: ${spacing.xl};
    border-radius: ${borderRadius.xl};
    box-shadow: ${shadows.md};
    border: 1px solid ${colors.neutral[200]};
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const VerseReference = styled.h3`
    color: ${colors.primary[700]};
    margin-bottom: ${spacing.lg};
    font-size: ${typography.fontSize.xl};
`;

const HintSection = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: ${spacing.lg};
`;

const HintButton = styled.button`
    background: ${colors.neutral[100]};
    border: none;
    padding: 6px 12px;
    border-radius: ${borderRadius.lg};
    font-size: ${typography.fontSize.sm};
    color: ${colors.neutral[600]};
    cursor: pointer;
    margin-bottom: ${spacing.sm};
    
    &:hover {
        background: ${colors.neutral[200]};
    }
`;

const HintText = styled.p`
    font-family: 'Gowun Batang', serif;
    color: ${colors.neutral[500]};
    text-align: center;
    background: ${colors.neutral[50]};
    padding: ${spacing.md};
    border-radius: ${borderRadius.md};
    width: 100%;
`;

const TypingArea = styled.div`
    width: 100%;
    margin-bottom: ${spacing.lg};
`;

const StyledTextarea = styled.textarea`
    width: 100%;
    min-height: 120px;
    padding: ${spacing.md};
    border: 2px solid ${props =>
        props.$status === 'success' ? colors.green :
            props.$status === 'fail' ? colors.red :
                colors.neutral[300]
    };
    border-radius: ${borderRadius.lg};
    font-family: 'Gowun Batang', serif;
    font-size: ${typography.fontSize.lg};
    line-height: 1.6;
    resize: vertical;
    outline: none;
    
    &:focus {
        border-color: ${colors.primary[500]};
    }
`;

const Controls = styled.div`
    display: flex;
    justify-content: center;
    gap: ${spacing.md};
    margin-bottom: ${spacing.lg};
`;

const ActionButton = styled.button`
    background: ${colors.primary[600]};
    color: white;
    border: none;
    padding: ${spacing.md} ${spacing.xl};
    border-radius: ${borderRadius.full};
    font-weight: bold;
    font-size: ${typography.fontSize.md};
    box-shadow: ${shadows.sm};
    cursor: pointer;
    opacity: ${props => props.disabled ? 0.5 : 1};
    
    &:hover:not(:disabled) {
        background: ${colors.primary[700]};
        transform: translateY(-2px);
    }
`;

const ResetButton = styled(ActionButton)`
    background: white;
    color: ${colors.neutral[600]};
    border: 1px solid ${colors.neutral[300]};
    opacity: 1;

    &:hover {
        background: ${colors.neutral[50]};
        color: ${colors.neutral[800]};
    }
`;

const ResultArea = styled.div`
    width: 100%;
    text-align: center;
    animation: fadeIn 0.5s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ResultText = styled.h3`
    color: ${props => props.$success ? colors.green : colors.red};
    font-weight: bold;
    margin-bottom: ${spacing.md};
`;

const CorrectionBox = styled.div`
    background: ${colors.neutral[100]};
    padding: ${spacing.md};
    border-radius: ${borderRadius.md};
    text-align: left;
`;

const Label = styled.span`
    display: block;
    font-size: ${typography.fontSize.sm};
    color: ${colors.neutral[500]};
    margin-bottom: 4px;
    font-weight: bold;
`;

const CorrectText = styled.p`
    font-family: 'Gowun Batang', serif;
    color: ${colors.neutral[800]};
    font-size: ${typography.fontSize.md};
`;

export default TypingMode;
