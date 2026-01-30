import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

import { db } from '../../firebase/config';
import { colors, typography, spacing, borderRadius, media } from '../../styles/designSystem';

const PrayerRequests = () => {

  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchPrayers();
  }, []);

  const fetchPrayers = async () => {
    try {
      const q = query(collection(db, 'prayerRequests'), orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const prayerList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const sortedPrayers = prayerList.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        if (a.isPinned && b.isPinned) {
          const aPinnedAt = a.pinnedAt?.seconds || 0;
          const bPinnedAt = b.pinnedAt?.seconds || 0;
          return bPinnedAt - aPinnedAt;
        }

        const aUpdatedAt = a.updatedAt?.seconds || 0;
        const bUpdatedAt = b.updatedAt?.seconds || 0;
        return bUpdatedAt - aUpdatedAt;
      });

      setPrayers(sortedPrayers);
    } catch (error) {
      console.error("Error fetching prayers:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp.seconds * 1000);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}일 전`;
    return date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
  };

  return (
    <Container>


      <Header>
        <PageTitle>Prayer Requests</PageTitle>
        <SubTitle>중보기도</SubTitle>
      </Header>

      <MainContent>
        {loading ? (
          <LoadingState>불러오는 중...</LoadingState>
        ) : prayers.length === 0 ? (
          <EmptyState>기도제목이 없습니다</EmptyState>
        ) : (
          <List>
            {prayers.map((prayer) => (
              <ListItem
                key={prayer.id}
                $isExpanded={expandedId === prayer.id}
                $isPinned={prayer.isPinned}
                onClick={() => toggleExpand(prayer.id)}
              >
                <ItemHeader>
                  <HeaderMain>
                    <NameWrapper>
                      <Name>{prayer.id}</Name>
                      {prayer.isPinned && <PinBadge>PIN</PinBadge>}
                    </NameWrapper>
                    <MetaInfo>
                      <Time>{getTimeAgo(prayer.updatedAt)}</Time>
                      <Separator>•</Separator>
                      <Count>{prayer.prayerItems.length}개의 기도제목</Count>
                    </MetaInfo>
                  </HeaderMain>
                </ItemHeader>

                <ContentArea $isExpanded={expandedId === prayer.id}>
                  <PrayerItems>
                    {prayer.prayerItems.map((item, index) => (
                      <PrayerItem key={index}>
                        <ItemNumber>{index + 1}.</ItemNumber>
                        <ItemText>{item}</ItemText>
                      </PrayerItem>
                    ))}
                  </PrayerItems>
                  {prayer.description && (
                    <Description>
                      {prayer.description}
                    </Description>
                  )}
                </ContentArea>
              </ListItem>
            ))}
          </List>
        )}
      </MainContent>
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

const MainContent = styled.main``;

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const ListItem = styled.div`
  border-bottom: 1px solid ${colors.neutral[100]};
  transition: background-color 0.2s;
  cursor: pointer;
  
  ${props => props.isPinned && css`
    background: ${colors.neutral[50]};
  `}

  &:hover {
    background: ${colors.neutral[50]};
  }
`;

const ItemHeader = styled.div`
  padding: ${spacing.lg} ${spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const HeaderMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

const NameWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const Name = styled.span`
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
`;

const PinBadge = styled.span`
  font-size: 10px;
  font-weight: ${typography.fontWeight.bold};
  background: ${colors.neutral[900]};
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[500]};
`;

const Time = styled.span``;
const Separator = styled.span` color: ${colors.neutral[300]}; `;
const Count = styled.span` color: ${colors.neutral[700]}; `;

const ContentArea = styled.div`
  max-height: ${props => props.$isExpanded ? '2000px' : '0'};
  opacity: ${props => props.$isExpanded ? '1' : '0'};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  padding-bottom: ${props => props.$isExpanded ? spacing.lg : '0'};
  padding-left: ${spacing.md};
  padding-right: ${spacing.md};
`;

const PrayerItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  margin-top: ${spacing.sm};
  padding-top: ${spacing.md};
  border-top: 1px dashed ${colors.neutral[200]};
`;

const PrayerItem = styled.div`
  display: flex;
  gap: ${spacing.sm};
  font-size: ${typography.fontSize.base};
  line-height: 1.6;
  color: ${colors.neutral[800]};
`;

const ItemNumber = styled.span`
  color: ${colors.neutral[400]};
  font-weight: ${typography.fontWeight.medium};
  min-width: 24px;
`;

const ItemText = styled.p`
  margin: 0;
  white-space: pre-wrap;
`;

const Description = styled.div`
  margin-top: ${spacing.lg};
  padding: ${spacing.md};
  background: ${colors.neutral[50]};
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[600]};
  line-height: 1.6;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${spacing['4xl']};
  color: ${colors.neutral[400]};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing['4xl']};
  color: ${colors.neutral[400]};
`;

export default PrayerRequests;