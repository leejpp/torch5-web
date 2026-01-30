import React, { useState, useEffect, useCallback, memo } from 'react';
import styled from 'styled-components';
import { collection, query, where, orderBy, limit, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { colors, typography, spacing, borderRadius, shadows, media } from '../../styles/designSystem';
import { loadStudentsFromFirebase } from '../../utils/talantUtils';

const RankPage = () => {
  const navigate = useNavigate();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timestamp, setTimestamp] = useState('');
  const [previousRanking, setPreviousRanking] = useState([]);
  const [popup, setPopup] = useState({ show: false, name: '', history: [], loading: false });

  // 랭킹 순위 변동 계산
  const determineMovement = useCallback((currentRank, name) => {
    if (previousRanking.length === 0) return '-';
    const previousIndex = previousRanking.findIndex(item => item.name === name);
    if (previousIndex === -1) return '-';

    const previousRank = previousIndex + 1;
    if (currentRank < previousRank) return 'up';
    if (currentRank > previousRank) return 'down';
    return '-';
  }, [previousRanking]);

  // user_stats 컬렉션을 활용한 효율적인 랭킹 데이터 계산
  const calculateRanking = useCallback(async () => {
    try {
      const allStudents = await loadStudentsFromFirebase();
      if (allStudents.length === 0) return [];

      const rankingData = [];
      for (const studentName of allStudents) {
        try {
          const userStatsRef = doc(db, 'user_stats', studentName);
          const userStatsDoc = await getDoc(userStatsRef);
          const score = userStatsDoc.exists() ? (userStatsDoc.data().total || 0) : 0;
          rankingData.push({ name: studentName, score });
        } catch (error) {
          console.error(`Error fetching score for ${studentName}:`, error);
          rankingData.push({ name: studentName, score: 0 });
        }
      }
      rankingData.sort((a, b) => b.score - a.score);
      return rankingData;
    } catch (error) {
      console.error('Error calculating rankings:', error);
      throw error;
    }
  }, []);

  const loadInitialRanking = useCallback(async () => {
    try {
      setLoading(true);
      const rankingData = await calculateRanking();
      const now = new Date();
      setTimestamp(`Last updated: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      setPreviousRanking([]);
      setRanking(rankingData);
    } catch (error) {
      console.error('Initial load error:', error);
    } finally {
      setLoading(false);
    }
  }, [calculateRanking]);

  useEffect(() => {
    loadInitialRanking();
  }, [loadInitialRanking]);

  const handleRefresh = async () => {
    if (refreshing) return;
    try {
      setRefreshing(true);
      const rankingData = await calculateRanking();
      const now = new Date();
      setTimestamp(`Last updated: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      setPreviousRanking([...ranking]);
      setRanking(rankingData);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const showStudentPopup = useCallback(async (name) => {
    setPopup({ show: true, name, history: [], loading: true });
    try {
      const q = query(
        collection(db, 'talant_history'),
        where('name', '==', name),
        orderBy('receivedDate', 'desc'),
        limit(5)
      );

      onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          setPopup(prev => ({ ...prev, history: [], loading: false }));
          return;
        }

        const history = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          const d = data.receivedDate?.toDate() || new Date();
          history.push({
            date: `${d.getMonth() + 1}/${d.getDate()}`,
            reason: data.reason || 'No reason',
            amount: data.talant || 0
          });
        });
        setPopup(prev => ({ ...prev, history, loading: false }));
      });
    } catch (error) {
      console.error('History error:', error);
      setPopup(prev => ({ ...prev, loading: false }));
    }
  }, []);

  return (
    <Container>
      <TopControls>
        <BackButton onClick={() => navigate('/')}>←</BackButton>
      </TopControls>

      <Header>
        <TitleGroup>
          <PageTitle>Talant Ranking</PageTitle>
          <SubTitle>교회학교 달란트 현황</SubTitle>
        </TitleGroup>
        <Controls>
          <Timestamp>{timestamp}</Timestamp>
          <RefreshButton onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? '...' : '↻'}
          </RefreshButton>
        </Controls>
      </Header>

      <ListHeader>
        <ColRank>Rank</ColRank>
        <ColName>Name</ColName>
        <ColScore>Score</ColScore>
        <ColTrend></ColTrend>
      </ListHeader>

      {loading ? (
        <LoadingState>불러오는 중...</LoadingState>
      ) : ranking.length === 0 ? (
        <EmptyState>데이터가 없습니다</EmptyState>
      ) : (
        <List>
          {ranking.map((item, index) => {
            const rank = index + 1;
            const movement = determineMovement(rank, item.name);
            return (
              <ListItem key={item.name} onClick={() => showStudentPopup(item.name)}>
                <ColRank rank={rank}>{rank}</ColRank>
                <ColName isTable>{item.name}</ColName>
                <ColScore isTable>{item.score.toLocaleString()}</ColScore>
                <ColTrend>
                  {movement === 'up' && <UpIcon>▲</UpIcon>}
                  {movement === 'down' && <DownIcon>▼</DownIcon>}
                </ColTrend>
              </ListItem>
            );
          })}
        </List>
      )}

      {popup.show && (
        <ModalOverlay onClick={() => setPopup({ ...popup, show: false })}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{popup.name}</ModalTitle>
              <CloseButton onClick={() => setPopup({ ...popup, show: false })}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              {popup.loading ? (
                <ModalLoading>내역을 불러오는 중...</ModalLoading>
              ) : popup.history.length === 0 ? (
                <ModalEmpty>내역이 없습니다.</ModalEmpty>
              ) : (
                <HistoryList>
                  {popup.history.map((h, i) => (
                    <HistoryItem key={i}>
                      <HistoryDate>{h.date}</HistoryDate>
                      <HistoryReason>{h.reason}</HistoryReason>
                      <HistoryAmount isPositive={h.amount > 0}>
                        {h.amount > 0 ? '+' : ''}{h.amount}
                      </HistoryAmount>
                    </HistoryItem>
                  ))}
                </HistoryList>
              )}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
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
    transform: translateX(-2px);
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: ${spacing.xl};
  padding-bottom: ${spacing.md};
  border-bottom: 2px solid ${colors.neutral[900]};
`;

const TitleGroup = styled.div``;

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

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const Timestamp = styled.span`
  font-size: ${typography.fontSize.xs};
  color: ${colors.neutral[400]};
  
  ${media['max-md']} {
    display: none;
  }
`;

const RefreshButton = styled.button`
  background: transparent;
  border: 1px solid ${colors.neutral[200]};
  border-radius: ${borderRadius.full};
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${colors.neutral[600]};
  transition: all 0.2s;

  &:hover {
    background: ${colors.neutral[50]};
    color: ${colors.neutral[900]};
  }
`;

const ListHeader = styled.div`
  display: flex;
  padding: 0 ${spacing.md} ${spacing.sm} ${spacing.md};
  border-bottom: 1px solid ${colors.neutral[200]};
  color: ${colors.neutral[400]};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.bold};
  text-transform: uppercase;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${spacing.md};
  border-bottom: 1px solid ${colors.neutral[100]};
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${colors.neutral[50]};
  }
`;

// Columns
const ColRank = styled.div`
  width: 40px;
  font-weight: ${typography.fontWeight.bold};
  font-size: ${typography.fontSize.lg};
  color: ${props => {
    if (props.rank === 1) return '#D4AF37'; // Gold
    if (props.rank === 2) return '#A0A0A0'; // Silver
    if (props.rank === 3) return '#CD7F32'; // Bronze
    return colors.neutral[400];
  }};
  text-align: center;
`;

const ColName = styled.div`
  flex: 1;
  padding-left: ${spacing.md};
  font-size: ${props => props.isTable ? typography.fontSize.base : 'inherit'};
  font-weight: ${props => props.isTable ? typography.fontWeight.medium : 'inherit'};
  color: ${colors.neutral[900]};
`;

const ColScore = styled.div`
  width: 80px;
  text-align: right;
  font-weight: ${props => props.isTable ? typography.fontWeight.bold : 'inherit'};
  color: ${colors.neutral[900]};
`;

const ColTrend = styled.div`
  width: 30px;
  display: flex;
  justify-content: center;
`;

const UpIcon = styled.span` color: ${colors.success[500]}; font-size: 10px; `;
const DownIcon = styled.span` color: ${colors.error[500]}; font-size: 10px; `;

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

// Modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: ${spacing.lg};
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 400px;
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.xl};
  overflow: hidden;
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const ModalHeader = styled.div`
  padding: ${spacing.lg};
  border-bottom: 1px solid ${colors.neutral[100]};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${typography.fontSize.xl};
  color: ${colors.neutral[400]};
  cursor: pointer;
  padding: 0;
  line-height: 1;
`;

const ModalBody = styled.div`
  padding: 0;
  max-height: 60vh;
  overflow-y: auto;
`;

const ModalLoading = styled.div`
  padding: ${spacing.xl};
  text-align: center;
  color: ${colors.neutral[500]};
`;

const ModalEmpty = styled.div`
  padding: ${spacing.xl};
  text-align: center;
  color: ${colors.neutral[400]};
`;

const HistoryList = styled.div``;

const HistoryItem = styled.div`
  padding: ${spacing.md} ${spacing.lg};
  border-bottom: 1px solid ${colors.neutral[50]};
  display: flex;
  align-items: center;
  gap: ${spacing.md};

  &:last-child { border-bottom: none; }
`;

const HistoryDate = styled.div`
  font-size: ${typography.fontSize.xs};
  color: ${colors.neutral[400]};
  width: 40px;
`;

const HistoryReason = styled.div`
  flex: 1;
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[800]};
`;

const HistoryAmount = styled.div`
  font-weight: ${typography.fontWeight.bold};
  color: ${props => props.isPositive ? colors.success[600] : colors.error[600]};
  font-size: ${typography.fontSize.sm};
`;

export default memo(RankPage);
