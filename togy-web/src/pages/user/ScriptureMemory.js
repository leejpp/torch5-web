import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../../firebase/config';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { colors, typography, spacing, shadows, borderRadius } from '../../styles/designSystem';
import FlashCardMode from '../../components/scripture/FlashCardMode';
import BlindMode from '../../components/scripture/BlindMode'; // [NEW] Import
import ScrambleMode from '../../components/scripture/ScrambleMode'; // [NEW] Import
import TypingMode from '../../components/scripture/TypingMode'; // [NEW] Import

const ScriptureMemory = () => {
    const [viewingVerse, setViewingVerse] = useState(null); // The verse currently being practiced
    const [latestVerse, setLatestVerse] = useState(null);   // This month's verse (pinned)
    const [futureVerses, setFutureVerses] = useState([]); // [NEW] Future verses
    const [pastVerses, setPastVerses] = useState([]);       // List of past verses
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('card'); // 'card', 'flashcard', 'blind', 'scramble', 'typing'

    useEffect(() => {
        fetchVerses();
    }, []);

    const fetchVerses = async () => {
        try {
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1;

            const q = query(collection(db, 'monthly_verses'));
            const querySnapshot = await getDocs(q);
            const allVerses = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => {
                    if (a.year !== b.year) return b.year - a.year; // Descending year
                    return b.month - a.month; // Descending month
                });

            // Categorize Verses
            const future = [];
            const past = [];
            let current = null;

            allVerses.forEach(v => {
                if (v.year > currentYear || (v.year === currentYear && v.month > currentMonth)) {
                    future.push(v);
                } else if (v.year === currentYear && v.month === currentMonth) {
                    current = v;
                } else {
                    past.push(v);
                }
            });

            // Fallback: If no current verse found, maybe use the most recent past one as 'latest' for display if desired?
            // For now, let's keep it null if strictly no current month verse exists, 
            // OR if user wants, we can default to the absolute latest available verse (even if past/future).
            // But strict 'This Month' is better for the concept.

            setFutureVerses(future);
            setLatestVerse(current);
            setViewingVerse(current || future[0] || past[0]); // Default to current, or first available
            setPastVerses(past);
        } catch (error) {
            console.error("Error fetching verses:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerseClick = (verse) => {
        setViewingVerse(verse);
        setViewMode('card');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleReturnToLatest = () => {
        setViewingVerse(latestVerse);
        setViewMode('card');
    };

    if (isLoading) return <Container><Loading>말씀을 불러오는 중...</Loading></Container>;

    // [NEW] Render FlashCard Mode
    if (viewMode === 'flashcard' && viewingVerse) {
        return (
            <Container>
                <FlashCardMode verse={viewingVerse} onBack={() => setViewMode('card')} />
            </Container>
        );
    }

    // [NEW] Render Blind Mode
    if (viewMode === 'blind' && viewingVerse) {
        return (
            <Container>
                <BlindMode verse={viewingVerse} onBack={() => setViewMode('card')} />
            </Container>
        );
    }

    // [NEW] Render Scramble Mode
    if (viewMode === 'scramble' && viewingVerse) {
        return (
            <Container>
                <ScrambleMode verse={viewingVerse} onBack={() => setViewMode('card')} />
            </Container>
        );
    }

    // [NEW] Render Typing Mode
    if (viewMode === 'typing' && viewingVerse) {
        return (
            <Container>
                <TypingMode verse={viewingVerse} onBack={() => setViewMode('card')} />
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <Title>암송 말씀 연습</Title>
                <SubTitle>말씀을 마음에 새겨보세요 🙏</SubTitle>
            </Header>

            {/* [NEW] Show shortcut to Latest Verse if we are viewing a past verse */}
            {latestVerse && viewingVerse?.id !== latestVerse.id && (
                <ReturnBanner onClick={handleReturnToLatest}>
                    <ReturnText>👈 <strong>이번 달 말씀</strong>({latestVerse.reference})으로 돌아가기</ReturnText>
                </ReturnBanner>
            )}

            {viewingVerse ? (
                <MainCard $isPast={viewingVerse.id !== latestVerse?.id} $isFuture={futureVerses.some(v => v.id === viewingVerse.id)}>
                    {viewingVerse.id !== latestVerse?.id && (
                        <Badge $isFuture={futureVerses.some(v => v.id === viewingVerse.id)}>
                            {futureVerses.some(v => v.id === viewingVerse.id) ? '미리 보는 다음 달 말씀' : '지난 말씀 복습 중'}
                        </Badge>
                    )}
                    <VerseHeader>
                        <DateBadge>{viewingVerse.year}년 {viewingVerse.month}월</DateBadge>
                        <Reference>{viewingVerse.reference}</Reference>
                    </VerseHeader>
                    <VerseContent>{viewingVerse.content}</VerseContent>

                    <ActionButtons>
                        <ActionButton onClick={() => setViewMode('flashcard')}>🧐 플래시 카드</ActionButton>
                        <ActionButton onClick={() => setViewMode('blind')} style={{ backgroundColor: colors.secondary[500] }}>📝 빈칸 채우기</ActionButton>
                        <ActionButton onClick={() => setViewMode('scramble')} style={{ backgroundColor: colors.neutral[600] }}>🧩 순서 맞추기</ActionButton>
                        <ActionButton onClick={() => setViewMode('typing')} style={{ backgroundColor: colors.primary[800] }}>⌨️ 전체 쓰기</ActionButton>
                    </ActionButtons>
                </MainCard>
            ) : (
                <EmptyState>
                    등록된 말씀이 없습니다.
                </EmptyState>
            )}

            {futureVerses.length > 0 && (
                <ArchiveSection>
                    <SectionTitle>🔜 미리 보는 다음 달 말씀</SectionTitle>
                    <ArchiveGrid>
                        {futureVerses.map(verse => (
                            <ArchiveCard
                                key={verse.id}
                                onClick={() => handleVerseClick(verse)}
                                $active={viewingVerse?.id === verse.id}
                                $isFuture
                            >
                                <ArchiveDate>{verse.year}.{verse.month}</ArchiveDate>
                                <ArchiveRef>{verse.reference}</ArchiveRef>
                            </ArchiveCard>
                        ))}
                    </ArchiveGrid>
                </ArchiveSection>
            )}

            {pastVerses.length > 0 && (
                <ArchiveSection>
                    <SectionTitle>📜 지난 말씀 보기</SectionTitle>
                    <ArchiveGrid>
                        {pastVerses.map(verse => (
                            <ArchiveCard
                                key={verse.id}
                                onClick={() => handleVerseClick(verse)}
                                $active={viewingVerse?.id === verse.id}
                            >
                                <ArchiveDate>{verse.year}.{verse.month}</ArchiveDate>
                                <ArchiveRef>{verse.reference}</ArchiveRef>
                            </ArchiveCard>
                        ))}
                    </ArchiveGrid>
                </ArchiveSection>
            )}
        </Container>
    );
};


const Container = styled.div`
    min-height: 100vh;
    padding: ${spacing.lg};
    max-width: 600px;
    margin: 0 auto;
    background-color: ${colors.neutral[50]};
`;

const Header = styled.div`
    margin-bottom: ${spacing.xl};
    text-align: center;
`;

const Title = styled.h1`
    font-size: ${typography.fontSize['2xl']};
    font-weight: bold;
    color: ${colors.primary[800]};
    margin-bottom: ${spacing.xs};
`;

const SubTitle = styled.p`
    color: ${colors.neutral[500]};
`;

const Loading = styled.div`
    text-align: center;
    padding: ${spacing.xl};
    color: ${colors.neutral[500]};
`;

const MainCard = styled.div`
    background: white;
    padding: ${spacing.xl};
    border-radius: ${borderRadius.xl};
    box-shadow: ${shadows.lg};
    margin-bottom: ${spacing['2xl']};
    border: 1px solid ${colors.primary[100]};
    position: relative;
    overflow: hidden;

    &::before {
        content: '"';
        position: absolute;
        top: -10px;
        left: 20px;
        font-size: 100px;
        color: ${colors.primary[50]};
        font-family: serif;
        z-index: 0;
    }
`;

const VerseHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${spacing.lg};
    position: relative;
    z-index: 1;
`;

const DateBadge = styled.span`
    background: ${colors.secondary[100]};
    color: ${colors.secondary[700]};
    padding: 4px 12px;
    border-radius: ${borderRadius.full};
    font-size: ${typography.fontSize.sm};
    font-weight: bold;
`;

const Reference = styled.h2`
    font-size: ${typography.fontSize.lg};
    font-weight: bold;
    color: ${colors.primary[700]};
`;

const VerseContent = styled.p`
    font-family: 'Gowun Batang', serif;
    font-size: ${typography.fontSize.xl};
    line-height: 1.8;
    color: ${colors.neutral[800]};
    word-break: keep-all;
    text-align: center;
    margin-bottom: ${spacing.xl};
    position: relative;
    z-index: 1;
`;

const ActionButtons = styled.div`
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: ${spacing.md};
    position: relative;
    z-index: 1;
`;

const ActionButton = styled.button`
    background: ${colors.primary[600]};
    color: white;
    border: none;
    padding: ${spacing.md} ${spacing.lg};
    border-radius: ${borderRadius.full};
    font-weight: bold;
    font-size: ${typography.fontSize.sm};
    box-shadow: ${shadows.md};
    cursor: pointer;
    transition: transform 0.2s;
    white-space: nowrap;

    &:hover {
        transform: scale(1.05);
        filter: brightness(1.1);
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: ${spacing.xl};
    color: ${colors.neutral[500]};
    background: white;
    border-radius: ${borderRadius.lg};
`;

const ArchiveSection = styled.div`
    margin-top: ${spacing['3xl']};
`;

const SectionTitle = styled.h3`
    font-size: ${typography.fontSize.lg};
    font-weight: bold;
    color: ${colors.neutral[700]};
    margin-bottom: ${spacing.md};
    padding-left: ${spacing.xs};
`;

const ArchiveGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: ${spacing.md};
`;

// Update ArchiveCard style for interactivity
const ReturnBanner = styled.div`
    background: ${colors.primary[50]};
    border: 1px solid ${colors.primary[200]};
    color: ${colors.primary[700]};
    padding: ${spacing.md};
    border-radius: ${borderRadius.lg};
    margin-bottom: ${spacing.lg};
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;
    box-shadow: ${shadows.sm};

    &:hover {
        background: ${colors.primary[100]};
        transform: translateY(-1px);
    }
`;

const ReturnText = styled.p`
    margin: 0;
    font-size: ${typography.fontSize.md};
`;

const Badge = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    background: ${props => props.$isFuture ? colors.primary[600] : colors.neutral[600]};
    color: white;
    font-size: ${typography.fontSize.xs};
    padding: 4px 12px;
    border-bottom-left-radius: ${borderRadius.lg};
    font-weight: bold;
`;

const ArchiveCard = styled.div`
    background: ${props => props.$active ? colors.primary[50] : 'white'};
    padding: ${spacing.lg};
    border-radius: ${borderRadius.lg};
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: ${props => props.$active ? shadows.md : shadows.sm};
    border: 1px solid ${props =>
        props.$active ? colors.primary[300] :
            props.$isFuture ? colors.secondary[200] :
                colors.neutral[200]
    };
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${shadows.md};
        border-color: ${colors.primary[300]};
        background: ${colors.primary[50]};
    }
`;

const ArchiveDate = styled.span`
    color: ${colors.neutral[500]};
    font-size: ${typography.fontSize.sm};
`;

const ArchiveRef = styled.span`
    font-weight: bold;
    color: ${colors.neutral[800]};
`;

export default ScriptureMemory;
