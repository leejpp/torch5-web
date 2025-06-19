import React, { useState, useEffect, useCallback, memo } from 'react';
import styled, { keyframes } from 'styled-components';
import { collection, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { theme } from '../../styles/theme';
import {
  TossContainer,
  TossPrimaryButton,
  TossCard,
  TossTitle,
  TossSubtitle,
  TossFlex,
  TossColors,
  TossAnimations
} from '../../components/common/TossDesignSystem';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;



const slideUp = keyframes`
  from { transform: translateY(100px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const crown = keyframes`
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
`;

// 토스 스타일 랭킹 컴포넌트들
const TossRankContainer = styled(TossContainer)`
  padding: 20px;
  padding-bottom: 100px;
`;

const TossRankHeader = styled(TossCard)`
  text-align: center;
  margin-bottom: 30px;
  animation: ${TossAnimations.fadeInUp} 0.8s ease-out;
`;

const TossGradientTitle = styled(TossTitle)`
  background: linear-gradient(135deg, ${TossColors.primary} 0%, #9F77FF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const TossRankControls = styled(TossFlex)`
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  margin: 20px 0;
`;

const Timestamp = styled.div`
  color: ${theme.colors.neutral[3]};
  font-size: ${theme.typography.fontSize.sm};
  margin-top: 15px;
  padding: 8px 16px;
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  display: inline-block;
`;

const FirstPlaceContainer = styled.div`
  margin-bottom: 30px;
  animation: ${fadeIn} 0.8s ease-out 0.2s both;
`;

const FirstPlaceCard = styled.div`
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: ${theme.borderRadius.xl};
  padding: 30px;
  text-align: center;
  box-shadow: ${theme.shadows.xl};
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  max-width: 400px;
  margin: 0 auto;

  &:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 20px 40px rgba(255, 215, 0, 0.3);
  }

  &::before {
    content: '✨';
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 2rem;
    animation: ${float} 3s ease-in-out infinite;
  }

  &::after {
    content: '✨';
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 2rem;
    animation: ${float} 3s ease-in-out infinite 1.5s;
  }
`;

const FirstPlaceHeader = styled.div`
  color: #8B4513;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const FirstPlaceName = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;

  .crown-icon {
    font-size: 2.5rem;
    animation: ${crown} 2s ease-in-out infinite;
  }

  .name {
    color: #8B4513;
    font-size: ${theme.typography.fontSize['2xl']};
    font-weight: ${theme.typography.fontWeight.bold};
    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

const FirstPlaceScore = styled.div`
  color: #8B4513;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const RankingContainer = styled.div`
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.md};
  overflow: hidden;
  animation: ${fadeIn} 0.8s ease-out 0.4s both;
`;

const RankingHeader = styled.div`
  background: ${theme.colors.surface};
  padding: 20px 25px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  h2 {
    color: ${theme.colors.neutral[1]};
    font-size: ${theme.typography.fontSize.xl};
    font-weight: ${theme.typography.fontWeight.semibold};
    margin: 0;
  }
`;

const RankingList = styled.div`
  padding: 0;
`;

const RankingItem = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr 120px 60px;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  transition: ${theme.transitions.default};
  animation: ${slideUp} 0.5s ease-out;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  @media (max-width: 768px) {
    grid-template-columns: 50px 1fr 100px 50px;
    padding: 15px 20px;
  }
`;

const RankNumber = styled.div`
  color: ${props => {
    if (props.rank === 2) return '#C0C0C0';
    if (props.rank === 3) return '#CD7F32';
    return theme.colors.neutral[1];
  }};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  text-align: center;

  ${props => props.rank <= 3 && `
    background: ${props.rank === 2 ? 'linear-gradient(135deg, #C0C0C0, #E8E8E8)' : 'linear-gradient(135deg, #CD7F32, #DEB887)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  `}
`;

const Name = styled.div`
  color: ${theme.colors.neutral[1]};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: ${theme.transitions.default};

  &:hover {
    color: ${theme.colors.primary};
    transform: translateX(5px);
  }
`;

const Score = styled.div`
  color: ${theme.colors.neutral[1]};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  text-align: right;
`;

const Movement = styled.div`
  text-align: center;
  font-size: 1.2rem;

  .up {
    color: ${theme.colors.success};
    animation: ${float} 2s ease-in-out infinite;
  }

  .down {
    color: ${theme.colors.error};
    animation: ${float} 2s ease-in-out infinite reverse;
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${theme.colors.neutral[3]};
  animation: ${fadeIn} 0.8s ease-out;

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    animation: ${float} 3s ease-in-out infinite;
  }

  p {
    font-size: ${theme.typography.fontSize.base};
    margin: 0;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: ${theme.colors.neutral[3]};
  font-size: ${theme.typography.fontSize.base};
  
  .loading-icon {
    font-size: 2rem;
    margin-bottom: 15px;
    animation: ${pulse} 1.5s ease-in-out infinite;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const Popup = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.xl};
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  animation: ${slideUp} 0.3s ease-out;
  position: relative;

  h3 {
    color: ${theme.colors.neutral[1]};
    font-size: ${theme.typography.fontSize.xl};
    font-weight: ${theme.typography.fontWeight.semibold};
    margin: 0 0 20px 0;
    text-align: center;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${theme.colors.neutral[3]};
  transition: ${theme.transitions.default};

  &:hover {
    color: ${theme.colors.neutral[1]};
    transform: scale(1.1);
  }
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid rgba(0, 0, 0, 0.1);

  .history-info {
    flex: 1;
  }

  .history-date {
    color: ${theme.colors.neutral[3]};
    font-size: ${theme.typography.fontSize.sm};
    margin-bottom: 5px;
  }

  .history-reason {
    color: ${theme.colors.neutral[1]};
    font-size: ${theme.typography.fontSize.base};
    font-weight: ${theme.typography.fontWeight.medium};
  }

  .history-amount {
    color: ${theme.colors.success};
    font-size: ${theme.typography.fontSize.base};
    font-weight: ${theme.typography.fontWeight.semibold};
  }
`;

const Toast = styled.div`
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(${props => props.$show ? '0' : '100px'});
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: ${theme.shadows.xl};
  padding: 16px 24px;
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.neutral[1]};
  font-size: ${theme.typography.fontSize.base};
  z-index: 1001;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  opacity: ${props => props.$show ? 1 : 0};
`;

const RankPage = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timestamp, setTimestamp] = useState('');
  const [previousRanking, setPreviousRanking] = useState([]);
  const [popup, setPopup] = useState({ show: false, name: '', history: [], loading: false });
  const [toast, setToast] = useState({ show: false, message: '' });

  // 토스트 메시지 표시
  const showToast = useCallback((message, duration = 3000) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, duration);
  }, []);

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

  // 랭킹 데이터 계산 (한 번만 호출하는 방식으로 변경)
  const calculateRanking = useCallback(async () => {
    try {
      const q = query(collection(db, 'talant_history'));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return [];
      }

      const userScores = {};
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const name = data.name;
        const talant = parseInt(data.talant) || 0;
        
        if (!userScores[name]) {
          userScores[name] = 0;
        }
        
        userScores[name] += talant;
      });

      const rankingData = Object.entries(userScores)
        .map(([name, score]) => ({ name, score }))
        .sort((a, b) => b.score - a.score);
      
      return rankingData;
    } catch (error) {
      console.error('랭킹 계산 에러:', error);
      throw error;
    }
  }, []);

  // 랭킹 업데이트 (초기 로드용)
  const loadInitialRanking = useCallback(async () => {
    try {
      setLoading(true);
      
      const rankingData = await calculateRanking();
      
      // 타임스탬프 업데이트
      const now = new Date();
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      const timestampText = `집계 기준일: ${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} (${days[now.getDay()]}) ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      setTimestamp(timestampText);
      setPreviousRanking([]); // 초기 로드시에는 이전 랭킹 없음
      setRanking(rankingData);
      setLoading(false);
    } catch (error) {
      console.error('랭킹 로드 에러:', error);
      setLoading(false);
    }
  }, [calculateRanking]);

  // 랭킹 새로고침 (버튼 클릭용)
  const updateRanking = useCallback(async () => {
    if (refreshing) return;
    
    try {
      setRefreshing(true);
      
      const rankingData = await calculateRanking();
      
      // 타임스탬프 업데이트
      const now = new Date();
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      const timestampText = `집계 기준일: ${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} (${days[now.getDay()]}) ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      setTimestamp(timestampText);
      setPreviousRanking([...ranking]); // 이전 랭킹 저장
      setRanking(rankingData);
      
      showToast('랭킹이 업데이트되었습니다.');
    } catch (error) {
      console.error('랭킹 업데이트 에러:', error);
      showToast('랭킹 업데이트 중 오류가 발생했습니다.');
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, calculateRanking, showToast, ranking]);

  // 학생 상세 정보 팝업
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
          const receivedDate = data.receivedDate?.toDate() || new Date();
          
          history.push({
            date: `${receivedDate.getFullYear()}-${String(receivedDate.getMonth() + 1).padStart(2, '0')}-${String(receivedDate.getDate()).padStart(2, '0')}`,
            reason: data.reason || '사유 없음',
            amount: data.talant || '0'
          });
        });
        
        setPopup(prev => ({ ...prev, history, loading: false }));
      });
    } catch (error) {
      console.error('내역 조회 에러:', error);
      setPopup(prev => ({ ...prev, loading: false }));
      showToast('내역을 불러오는 중 오류가 발생했습니다.');
    }
  }, [showToast]);

  // 초기 로드
  useEffect(() => {
    loadInitialRanking();
  }, [loadInitialRanking]);

  return (
    <TossRankContainer>
      <TossRankHeader>
        <TossGradientTitle>🏆 달란트 랭킹</TossGradientTitle>
        <TossSubtitle>주일학교 학생들의 달란트 점수 순위를 확인하세요</TossSubtitle>
        
        <TossRankControls>
          <TossPrimaryButton 
            onClick={updateRanking}
            disabled={refreshing}
          >
            <span className="icon">🔄</span>
            {refreshing ? '로딩 중...' : '랭킹 새로고침'}
          </TossPrimaryButton>
        </TossRankControls>
        
        {timestamp && <Timestamp>{timestamp}</Timestamp>}
      </TossRankHeader>

      <div>
        {loading ? (
          <LoadingMessage>
            <div className="loading-icon">⏳</div>
            데이터를 불러오는 중...
          </LoadingMessage>
        ) : ranking.length === 0 ? (
          <EmptyMessage>
            <div className="empty-icon">📊</div>
            <p>표시할 랭킹 데이터가 없습니다.</p>
          </EmptyMessage>
        ) : (
          <>
            {/* 1등 카드 */}
            <FirstPlaceContainer>
              <FirstPlaceCard onClick={() => showStudentPopup(ranking[0].name)}>
                <FirstPlaceHeader>🏆 1등</FirstPlaceHeader>
                <FirstPlaceName>
                  <span className="crown-icon">👑</span>
                  <span className="name">{ranking[0].name}</span>
                </FirstPlaceName>
                <FirstPlaceScore>
                  {ranking[0].score.toLocaleString()} 달란트
                </FirstPlaceScore>
              </FirstPlaceCard>
            </FirstPlaceContainer>

            {/* 나머지 순위 */}
            {ranking.length > 1 && (
              <RankingContainer>
                <RankingHeader>
                  <h2>🎯 전체 순위</h2>
                </RankingHeader>
                
                <RankingList>
                  {ranking.slice(1).map((item, index) => {
                    const currentRank = index + 2;
                    const movement = determineMovement(currentRank, item.name);
                    
                    return (
                      <RankingItem key={item.name}>
                        <RankNumber rank={currentRank}>{currentRank}</RankNumber>
                        <Name onClick={() => showStudentPopup(item.name)}>
                          {item.name}
                        </Name>
                        <Score>{item.score.toLocaleString()}</Score>
                        <Movement>
                          {movement === 'up' && <span className="up">↑</span>}
                          {movement === 'down' && <span className="down">↓</span>}
                          {movement === '-' && '-'}
                        </Movement>
                      </RankingItem>
                    );
                  })}
                </RankingList>
              </RankingContainer>
            )}
          </>
        )}
      </div>

      {/* 학생 상세 정보 팝업 */}
      <Overlay show={popup.show} onClick={() => setPopup({ show: false, name: '', history: [], loading: false })}>
        <Popup onClick={(e) => e.stopPropagation()}>
          <CloseButton onClick={() => setPopup({ show: false, name: '', history: [], loading: false })}>
            ×
          </CloseButton>
          
          <h3>{popup.name}님의 달란트 내역</h3>
          
          {popup.loading ? (
            <LoadingMessage>
              <div className="loading-icon">⏳</div>
              데이터를 불러오는 중...
            </LoadingMessage>
          ) : popup.history.length === 0 ? (
            <EmptyMessage>
              <div className="empty-icon">📋</div>
              <p>내역이 없습니다.</p>
            </EmptyMessage>
          ) : (
            <HistoryList>
              {popup.history.map((item, index) => (
                <HistoryItem key={index}>
                  <div className="history-info">
                    <div className="history-date">{item.date}</div>
                    <div className="history-reason">{item.reason}</div>
                  </div>
                  <div className="history-amount">+{item.amount} 달란트</div>
                </HistoryItem>
              ))}
            </HistoryList>
          )}
        </Popup>
      </Overlay>

      {/* 토스트 메시지 */}
      <Toast $show={toast.show}>
        {toast.message}
      </Toast>
    </TossRankContainer>
  );
};

export default memo(RankPage); 