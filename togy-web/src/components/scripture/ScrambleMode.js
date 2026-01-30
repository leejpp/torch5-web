import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/designSystem';

const ScrambleMode = ({ verse, onBack }) => {
    const [wordBank, setWordBank] = useState([]);
    const [selectedWords, setSelectedWords] = useState([]);
    const [checkResult, setCheckResult] = useState(null);

    useEffect(() => {
        initializeGame();
    }, [verse]);

    const initializeGame = () => {
        // Split by space
        const words = verse.content.split(' ').map((text, index) => ({
            id: `word-${index}`,
            text: text
        }));

        // Shuffle
        const shuffled = [...words].sort(() => Math.random() - 0.5);

        setWordBank(shuffled);
        setSelectedWords([]);
        setCheckResult(null);
    };

    const handleSelectWord = (word) => {
        // Remove from bank, add to selected
        setWordBank(prev => prev.filter(w => w.id !== word.id));
        setSelectedWords(prev => [...prev, word]);
        setCheckResult(null); // Reset result when modifying
    };

    const handleDeselectWord = (word) => {
        // Remove from selected, add back to bank
        setSelectedWords(prev => prev.filter(w => w.id !== word.id));
        setWordBank(prev => [...prev, word]);
        setCheckResult(null);
    };

    const checkAnswer = () => {
        const currentSentence = selectedWords.map(w => w.text).join(' ');
        if (currentSentence === verse.content) {
            setCheckResult('success');
        } else {
            setCheckResult('fail');
        }
    };

    return (
        <Container>
            <Header>
                <BackButton onClick={onBack}>⬅︎ 뒤로가기</BackButton>
                <ModeTitle>단어 순서 맞추기</ModeTitle>
            </Header>

            <Description>
                뒤죽박죽 섞인 단어를 순서대로 선택하여 말씀을 완성하세요.
            </Description>

            <GameArea>
                {/* Answer Area */}
                <AnswerArea $status={checkResult}>
                    {selectedWords.length === 0 && <Placeholder>단어를 선택해주세요</Placeholder>}
                    {selectedWords.map((word, index) => {
                        const correctWords = verse.content.split(' ');
                        let status = null;
                        if (checkResult) {
                            if (word.text === correctWords[index]) {
                                status = 'correct';
                            } else {
                                status = 'incorrect';
                            }
                        }

                        return (
                            <WordChip
                                key={word.id}
                                onClick={() => handleDeselectWord(word)}
                                $status={status}
                            >
                                {word.text} {(!checkResult) && '✕'}
                            </WordChip>
                        );
                    })}
                </AnswerArea>

                {/* Word Bank */}
                <WordBank>
                    {wordBank.map(word => (
                        <BankWord key={word.id} onClick={() => handleSelectWord(word)}>
                            {word.text}
                        </BankWord>
                    ))}
                </WordBank>

                <Controls>
                    <ActionButton onClick={checkAnswer} disabled={wordBank.length > 0}>
                        정답 확인
                    </ActionButton>
                    <ResetButton onClick={initializeGame}>
                        다시 하기
                    </ResetButton>
                </Controls>

                {checkResult === 'success' && (
                    <CorrectAnswer>
                        <ResultText $success>🎉 정답입니다!</ResultText>
                        <FullVerse>{verse.content}</FullVerse>
                    </CorrectAnswer>
                )}

                {checkResult === 'fail' && (
                    <CorrectAnswer>
                        <ResultText>🤔 틀렸습니다. 다시 시도해보세요.</ResultText>
                        <AnswerLabel>정답 말씀:</AnswerLabel>
                        <FullVerse>{verse.content}</FullVerse>
                    </CorrectAnswer>
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
`;

const AnswerArea = styled.div`
    min-height: 100px;
    background: ${colors.neutral[50]};
    border: 2px dashed ${props =>
        props.$status === 'success' ? colors.green[500] :
            props.$status === 'fail' ? colors.red[500] :
                colors.neutral[300]
    };
    border-radius: ${borderRadius.lg};
    padding: ${spacing.md};
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: flex-start;
    margin-bottom: ${spacing.xl};
    transition: all 0.3s;
`;

const Placeholder = styled.span`
    color: ${colors.neutral[400]};
    width: 100%;
    text-align: center;
    margin-top: ${spacing.md};
`;

const WordChip = styled.button`
    background: ${props =>
        props.$status === 'correct' ? colors.green[500] + '20' :
            props.$status === 'incorrect' ? colors.red[500] + '20' :
                colors.primary[100]
    };
    color: ${props =>
        props.$status === 'correct' ? '#2dac5c' : // Hardcoded darker green for visibility
            props.$status === 'incorrect' ? colors.red[500] :
                colors.primary[800]
    };
    border: 1px solid ${props =>
        props.$status === 'correct' ? colors.green[500] :
            props.$status === 'incorrect' ? colors.red[500] :
                colors.primary[200]
    };
    padding: 6px 12px;
    border-radius: ${borderRadius.full};
    font-size: ${typography.fontSize.md};
    cursor: pointer;
    animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: ${props => props.$status ? 'bold' : 'normal'};

    &:hover {
        background: ${props =>
        props.$status ? (props.$status === 'correct' ? colors.green[500] + '30' : colors.red[500] + '30')
            : colors.primary[200]
    };
    }

    @keyframes popIn {
        from { transform: scale(0.8); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
`;

const WordBank = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    margin-bottom: ${spacing.xl};
`;

const BankWord = styled.button`
    background: white;
    border: 1px solid ${colors.neutral[300]};
    color: ${colors.neutral[800]};
    padding: 8px 16px;
    border-radius: ${borderRadius.full};
    font-size: ${typography.fontSize.md};
    cursor: pointer;
    box-shadow: ${shadows.sm};
    transition: all 0.2s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${shadows.md};
        border-color: ${colors.primary[400]};
        color: ${colors.primary[700]};
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
    transition: all 0.2s;
    opacity: ${props => props.disabled ? 0.5 : 1};
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};

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

const CorrectAnswer = styled.div`
    margin-top: ${spacing.lg};
    text-align: center;
    padding: ${spacing.lg};
    background-color: ${colors.neutral[50]};
    border-radius: ${borderRadius.lg};
    animation: fadeIn 0.5s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const AnswerLabel = styled.div`
    font-size: ${typography.fontSize.sm};
    font-weight: bold;
    color: ${colors.neutral[500]};
    margin-top: ${spacing.md};
    margin-bottom: ${spacing.xs};
`;

const ResultText = styled.h3`
    color: ${props => props.$success ? colors.green[500] : colors.red[500]};
    font-weight: bold;
    margin-bottom: ${props => props.$success ? spacing.sm : 0};
`;

const FullVerse = styled.p`
    font-family: 'Gowun Batang', serif;
    color: ${colors.neutral[700]};
    font-size: ${typography.fontSize.lg};
`;

export default ScrambleMode;
