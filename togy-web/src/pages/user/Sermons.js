import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { SermonService } from '../../services/SermonService';
import { getThumbnailUrl } from '../../utils/youtube';
import VideoModal from '../../components/common/VideoModal';
import { colors, typography, spacing, borderRadius, shadows, media } from '../../styles/designSystem';

const SERVICE_TYPES = ['전체', '주일대예배', '주일오후예배', '수요저녁예배', '금요철야예배', '청년부예배', '주일학교예배', '기타'];

const Sermons = () => {
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState('전체');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    // Date Search State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');

    const loadSermons = useCallback(async (isInitial = false) => {
        if (loading) return;
        setLoading(true);
        try {
            const result = await SermonService.getSermons(
                isInitial ? null : lastDoc,
                12,
                filterType === '전체' ? null : filterType,
                selectedDate || null // Pass date filter
            );

            setSermons(prev => isInitial ? result.sermons : [...prev, ...result.sermons]);
            setLastDoc(result.lastDoc);
            setHasMore(result.hasMore);
        } catch (error) {
            console.error("Failed to load sermons", error);
        } finally {
            setLoading(false);
        }
    }, [filterType, lastDoc, loading, selectedDate]); // Add selectedDate to deps

    // Initial Load or Filter Change
    useEffect(() => {
        setHasMore(true);
        setLastDoc(null);
        loadSermons(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        loadSermons(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterType, selectedDate]); // Trigger on date change too

    // Reset date filter
    const handleResetDate = () => {
        setSelectedDate('');
        setIsSearchOpen(false);
    };

    const handleVideoClick = async (sermon) => {
        setSelectedVideo(sermon);

        // Increment View Count (Local check to prevent spam)
        const viewedKey = `viewed_sermon_${sermon.id}`;
        if (!localStorage.getItem(viewedKey)) {
            await SermonService.incrementViewCount(sermon.id);
            localStorage.setItem(viewedKey, 'true');
        }
    };

    return (
        <Container>
            <Header>

                <PageTitle>설교 방송</PageTitle>
                <SubTitle>말씀의 은혜가 함께하는 시간</SubTitle>
                <SearchButton onClick={() => setIsSearchOpen(!isSearchOpen)}>
                    🔍
                </SearchButton>
            </Header>

            {/* Date Search Bar */}
            <SearchContainer $isOpen={isSearchOpen}>
                <DateInput
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
                <CloseSearchButton onClick={() => setIsSearchOpen(false)}>닫기</CloseSearchButton>
            </SearchContainer>

            {/* Active Date Filter Badge */}
            {selectedDate && (
                <ActiveFilterBar>
                    <FilterBadge>
                        {selectedDate} 조회 중
                        <ResetButton onClick={handleResetDate}>✕</ResetButton>
                    </FilterBadge>
                </ActiveFilterBar>
            )}

            {/* Filter Tabs */}
            <FilterScroll>
                <Tabs>
                    {SERVICE_TYPES.map(type => (
                        <Tab
                            key={type}
                            $active={filterType === type}
                            onClick={() => setFilterType(type)}
                        >
                            {type}
                        </Tab>
                    ))}
                </Tabs>
            </FilterScroll>

            {/* Video Grid */}
            <Grid>
                {sermons.map(sermon => (
                    <Card key={sermon.id} onClick={() => handleVideoClick(sermon)}>
                        <ThumbnailWrapper>
                            <Thumbnail src={getThumbnailUrl(sermon.youtubeId)} loading="lazy" />
                            <PlayOverlay><PlayIcon>▶</PlayIcon></PlayOverlay>
                            <DurationBadge>{sermon.serviceType}</DurationBadge>
                        </ThumbnailWrapper>
                        <CardContent>
                            <DateText>{sermon.date}</DateText>
                            <CardTitle>{sermon.title}</CardTitle>
                            <Preacher>{sermon.preacher} {sermon.scripture && `| ${sermon.scripture}`}</Preacher>
                            <MetaInfo>조회수 {sermon.viewCount || 0}</MetaInfo>
                        </CardContent>
                    </Card>
                ))}
            </Grid>

            {/* Load More Button */}
            {hasMore && (
                <LoadMoreContainer>
                    <LoadMoreButton onClick={() => loadSermons(false)} disabled={loading}>
                        {loading ? '로딩 중...' : '더 보기'}
                    </LoadMoreButton>
                </LoadMoreContainer>
            )}

            {!loading && sermons.length === 0 && (
                <EmptyState>등록된 설교 영상이 없습니다.</EmptyState>
            )}

            {/* Video Player Modal */}
            <VideoModal
                isOpen={!!selectedVideo}
                onClose={() => setSelectedVideo(null)}
                youtubeId={selectedVideo?.youtubeId}
                title={selectedVideo?.title}
                startTime={selectedVideo?.startTime}
            />
        </Container>
    );
};

// Styles
const Container = styled.div`
    max-width: 1200px; margin: 0 auto; padding: ${spacing.xl}; min-height: 80vh;
    ${media['max-md']} { padding: ${spacing.md}; }
`;

const Header = styled.div` 
    text-align: center; margin-bottom: ${spacing.xl}; position: relative;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
`;

const HomeButton = styled(Link)`
    position: absolute; left: 0; top: 0;
    color: ${colors.neutral[500]}; text-decoration: none; font-size: 0.9rem;
    padding: 8px 12px; border-radius: ${borderRadius.full}; border: 1px solid ${colors.neutral[200]};
    transition: all 0.2s;
    &:hover { background: ${colors.neutral[100]}; color: ${colors.neutral[800]}; }

    ${media['max-md']} {
        position: static; margin-bottom: ${spacing.md}; align-self: flex-start;
    }
`;

const PageTitle = styled.h1`
    font-size: 2rem; color: ${colors.primary[800]}; margin-bottom: 8px; font-weight: bold;
    ${media['max-md']} { font-size: 1.5rem; }
`;

const SubTitle = styled.p` color: ${colors.neutral[500]}; font-size: 1rem; `;

const SearchButton = styled.button`
    position: absolute; right: 0; top: 0;
    background: none; border: none; font-size: 1.2rem; cursor: pointer;
    padding: 8px; border-radius: 50%;
    &:hover { background: ${colors.neutral[100]}; }
    ${media['max-md']} { position: absolute; right: 0; top: 0; }
`;

const SearchContainer = styled.div`
    background: white; padding: ${spacing.md}; border-radius: ${borderRadius.lg};
    box-shadow: ${shadows.md}; margin-bottom: ${spacing.lg};
    display: ${props => props.$isOpen ? 'flex' : 'none'};
    justify-content: center; gap: ${spacing.md};
    animation: fadeIn 0.3s ease;
`;

const DateInput = styled.input`
    padding: 8px 12px; border: 1px solid ${colors.neutral[300]}; border-radius: ${borderRadius.md};
    font-family: inherit;
`;

const CloseSearchButton = styled.button`
    padding: 8px 16px; background: ${colors.neutral[100]}; border: none; border-radius: ${borderRadius.md};
    cursor: pointer;
`;

const ActiveFilterBar = styled.div`
    display: flex; justify-content: center; margin-bottom: ${spacing.lg};
`;

const FilterBadge = styled.div`
    background: ${colors.primary[100]}; color: ${colors.primary[800]};
    padding: 6px 16px; border-radius: ${borderRadius.full}; font-weight: 500; font-size: 0.9rem;
    display: flex; align-items: center; gap: 8px;
`;

const ResetButton = styled.button`
    background: white; border: none; border-radius: ${borderRadius.full}; width: 20px; height: 20px;
    font-size: 0.7rem; color: ${colors.primary[600]}; cursor: pointer;
    display: flex; justify-content: center; align-items: center;
`;

const FilterScroll = styled.div`
    overflow-x: auto; -webkit-overflow-scrolling: touch; margin-bottom: ${spacing.xl};
    &::-webkit-scrollbar { display: none; }
`;

const Tabs = styled.div`
    display: flex; gap: 8px; justify-content: center; min-width: max-content;
    ${media['max-md']} { justify-content: flex-start; padding-bottom: 4px; }
`;

const Tab = styled.button`
    padding: 8px 16px; border-radius: ${borderRadius.full}; font-size: 0.95rem; font-weight: 500;
    border: 1px solid ${props => props.$active ? colors.primary[600] : colors.neutral[200]};
    background: ${props => props.$active ? colors.primary[600] : 'white'};
    color: ${props => props.$active ? 'white' : colors.neutral[600]};
    cursor: pointer; transition: all 0.2s;
    &:hover { background: ${props => props.$active ? colors.primary[700] : colors.neutral[100]}; }
`;

const Grid = styled.div`
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: ${spacing.lg};
    ${media['max-md']} { grid-template-columns: 1fr; gap: ${spacing.lg}; }
`;

const Card = styled.div`
    background: white; border-radius: ${borderRadius.lg}; box-shadow: ${shadows.sm}; overflow: hidden;
    cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
    &:hover { transform: translateY(-4px); box-shadow: ${shadows.md}; }
`;

const ThumbnailWrapper = styled.div` position: relative; padding-top: 56.25%; background: #000; `;

const Thumbnail = styled.img`
    position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.9;
`;

const PlayOverlay = styled.div`
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    display: flex; justify-content: center; align-items: center;
    background: rgba(0,0,0,0.2); transition: 0.2s;
    ${Card}:hover & { background: rgba(0,0,0,0.4); }
`;

const PlayIcon = styled.div`
    width: 48px; height: 48px; background: rgba(255,255,255,0.9); border-radius: 50%;
    display: flex; justify-content: center; align-items: center; padding-left: 4px;
    font-size: 1.2rem; color: ${colors.primary[600]}; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
`;

const DurationBadge = styled.div`
    position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.7);
    color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;
`;

const CardContent = styled.div` padding: ${spacing.md}; `;

const DateText = styled.div` font-size: 0.8rem; color: ${colors.neutral[500]}; margin-bottom: 4px; `;

const CardTitle = styled.h3`
    font-size: 1.1rem; font-weight: bold; color: ${colors.neutral[900]}; margin-bottom: 4px;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
`;

const Preacher = styled.div` font-size: 0.9rem; color: ${colors.neutral[600]}; margin-bottom: ${spacing.xs}; `;

const MetaInfo = styled.div` font-size: 0.8rem; color: ${colors.neutral[400]}; text-align: right; margin-top: 8px; `;

const LoadMoreContainer = styled.div` display: flex; justify-content: center; margin-top: ${spacing.xl}; `;

const LoadMoreButton = styled.button`
    padding: 12px 32px; background: white; border: 1px solid ${colors.neutral[200]};
    border-radius: ${borderRadius.full}; color: ${colors.neutral[600]}; font-weight: 500;
    cursor: pointer; transition: 0.2s;
    &:hover:not(:disabled) { background: ${colors.neutral[50]}; border-color: ${colors.neutral[300]}; }
    &:disabled { opacity: 0.6; cursor: default; }
`;

const EmptyState = styled.div`
    text-align: center; padding: ${spacing['4xl']}; color: ${colors.neutral[500]}; background: ${colors.neutral[50]};
    border-radius: ${borderRadius.lg};
`;

export default Sermons;
