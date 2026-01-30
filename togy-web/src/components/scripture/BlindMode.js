import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/designSystem';

const BlindMode = ({ verse, onBack }) => {
    const [words, setWords] = useState([]);
    const [inputs, setInputs] = useState({});
    const [checkResult, setCheckResult] = useState(null); // null, 'success', 'fail'

    useEffect(() => {
        initializeGame();
    }, [verse]);

    const initializeGame = () => {
        // Split verse into words, keeping punctuation attached or separate if needed.
        // Simple split by space for now.
        const splitWords = verse.content.split(' ');

        // Randomly select about 40% of words to be blanks
        const newWords = splitWords.map((word, index) => {
            const isBlank = Math.random() < 0.4 && word.length > 1; // Don't blank out single chars usually
            return {
                id: index,
                text: word,
                isBlank: isBlank,
                cleanText: word.replace(/[.,!?]/g, '') // Text to match against (ignoring punctuation for strict check? maybe keep punctuation in display but check clean)
            };
        });

        setWords(newWords);
        setInputs({});
        setCheckResult(null);
    };

    const handleInputChange = (id, value) => {
        setInputs(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const checkAnswers = () => {
        let allCorrect = true;
        words.forEach(word => {
            if (word.isBlank) {
                const userVal = inputs[word.id] || '';
                // Simple check: user input must loosely match the original word
                // To make it easier, we could strip punctuation from both.
                if (userVal.trim() !== word.text) {
                    allCorrect = false;
                }
            }
        });

        setCheckResult(allCorrect ? 'success' : 'fail');
    };

    return (
        <Container>
            <Header>
                <BackButton onClick={onBack}>⬅︎ 뒤로가기</BackButton>
                <ModeTitle>빈칸 채우기</ModeTitle>
            </Header>

            <Description>
                빈칸에 알맞은 단어를 채워 말씀을 완성해보세요.
            </Description>

            <GameArea>
                <VerseContainer>
                    {words.map((word) => (
                        <WordWrapper key={word.id}>
                            {word.isBlank ? (
                                <InputGroup>
                                    <StyledInput
                                        type="text"
                                        value={inputs[word.id] || ''}
                                        onChange={(e) => handleInputChange(word.id, e.target.value)}
                                        placeholder="?"
                                        $width={word.text.length * 20 + 20}
                                        $status={checkResult === 'fail' && (inputs[word.id] || '').trim() !== word.text ? 'error' : 'normal'}
                                    />
                                    {checkResult === 'fail' && (inputs[word.id] || '').trim() !== word.text && (
                                        <CorrectionText>{word.text}</CorrectionText>
                                    )}
                                </InputGroup>
                            ) : (
                                <WordText>{word.text}</WordText>
                            )}
                        </WordWrapper>
                    ))}
                </VerseContainer>

                <Controls>
                    <ActionButton onClick={checkAnswers}>정답 확인</ActionButton>
                    <ResetButton onClick={initializeGame}>새로 고침</ResetButton>
                </Controls>

                {checkResult === 'success' && (
                    <ResultBanner $success>
                        🎉 정답입니다! 참 잘했어요.
                    </ResultBanner>
                )}

                {checkResult === 'fail' && (
                    <ResultBanner>
                        🤔 아쉽네요. 다시 확인해보세요.
                    </ResultBanner>
                )}

                {checkResult && (
                    <CorrectAnswer>
                        <AnswerLabel>정답 말씀:</AnswerLabel>
                        {verse.content}
                    </CorrectAnswer>
                )}
            </GameArea>
        </Container>
    );
};

const CorrectAnswer = styled.div`
    margin-top: ${spacing.xl};
    padding: ${spacing.lg};
    background-color: ${colors.neutral[100]};
    border-radius: ${borderRadius.lg};
    text-align: center;
    font-family: 'Gowun Batang', serif;
    color: ${colors.neutral[700]};
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
    margin-bottom: ${spacing.sm};
`;

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

const VerseContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    line-height: 2.2;
    justify-content: center;
    margin-bottom: ${spacing.xl};
    font-family: 'Gowun Batang', serif;
    font-size: ${typography.fontSize.lg};
`;

const WordWrapper = styled.span`
    display: inline-flex;
    align-items: center;
    vertical-align: top;
    margin: 0 4px;
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const CorrectionText = styled.span`
    font-size: ${typography.fontSize.xs};
    color: ${colors.red[500]};
    font-weight: bold;
    margin-top: 2px;
    animation: fadeIn 0.3s;
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-2px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

const WordText = styled.span`
    color: ${colors.neutral[800]};
`;

const StyledInput = styled.input`
    border: none;
    border-bottom: 2px solid ${props => props.$status === 'error' ? colors.red[500] : colors.primary[300]};
    background: ${colors.neutral[50]};
    font-family: inherit;
    font-size: ${typography.fontSize.base};
    text-align: center;
    width: ${props => props.$width}px;
    min-width: 40px;
    padding: 0 4px;
    color: ${props => props.$status === 'error' ? colors.red[500] : colors.primary[800]};
    font-weight: bold;
    outline: none;
    transition: all 0.2s;

    &:focus {
        border-bottom-color: ${colors.primary[600]};
        background: ${colors.primary[50]};
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

    &:hover {
        background: ${colors.primary[700]};
        transform: translateY(-2px);
    }
`;

const ResetButton = styled(ActionButton)`
    background: white;
    color: ${colors.neutral[600]};
    border: 1px solid ${colors.neutral[300]};

    &:hover {
        background: ${colors.neutral[50]};
        color: ${colors.neutral[800]};
    }
`;

const ResultBanner = styled.div`
    text-align: center;
    padding: ${spacing.md};
    border-radius: ${borderRadius.lg};
    background: ${props => props.$success ? colors.green[500] + '20' : colors.red[500] + '20'};
    color: ${props => props.$success ? colors.green[500] : colors.red[500]};
    font-weight: bold;
    animation: slideIn 0.3s ease-out;

    @keyframes slideIn {
        from { transform: translateY(10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`;

export default BlindMode;
