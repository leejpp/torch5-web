import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

const PrayerRequests = () => {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setPrayers(prayerList);
    } catch (error) {
      console.error("Error fetching prayers:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <>
      {loading ? (
        <LoadingContainer>
          <LoadingSpinner>
            <LoadingIcon>🙏</LoadingIcon>
            기도제목을 불러오는 중...
          </LoadingSpinner>
        </LoadingContainer>
      ) : (
        <Container>
          {prayers.length === 0 ? (
            <EmptyState>
              <EmptyIcon>💙</EmptyIcon>
              <EmptyTitle>등록된 기도제목이 없습니다</EmptyTitle>
              <EmptyMessage>첫 번째 기도제목을 등록해보세요!</EmptyMessage>
            </EmptyState>
          ) : (
            <PrayerList>
              {prayers.map((prayer) => (
                <PrayerCard key={prayer.id}>
                  <PrayerHeader>
                    <Name>💙 {prayer.id}</Name>
                    <UpdatedAt>
                      마지막 수정: {formatDateTime(prayer.updatedAt)}
                    </UpdatedAt>
                  </PrayerHeader>
                  {prayer.prayerItems.map((item, index) => (
                    <PrayerItemContainer key={index}>
                      <PrayerItem>
                        <PrayerContent>{item}</PrayerContent>
                      </PrayerItem>
                    </PrayerItemContainer>
                  ))}
                </PrayerCard>
              ))}
            </PrayerList>
          )}
        </Container>
      )}
    </>
  );
};

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #4285F4;
  font-size: 1.1rem;
  font-weight: 500;
`;

const LoadingIcon = styled.div`
  font-size: 2rem;
  animation: pulse 1.5s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem 2rem;
  
  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const EmptyTitle = styled.h2`
  color: #4285F4;
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const EmptyMessage = styled.p`
  color: #666;
  font-size: 1rem;
  margin: 0;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem 2rem 3rem;
  background-color: #f8f9fa;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 1rem 1rem 2rem;
  }
`;

const PrayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const PrayerCard = styled.div`
  background-color: white;
  padding: 1.8rem;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    border-color: rgba(66, 133, 244, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 1.3rem;
    border-radius: 12px;
  }
`;

const PrayerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f3f4;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.8rem;
    margin-bottom: 1.2rem;
    padding-bottom: 0.8rem;
  }
`;

const Name = styled.h2`
  font-size: 1.3rem;
  color: #4285F4;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const UpdatedAt = styled.span`
  color: #666;
  font-size: 0.85rem;
  background-color: #f8f9fa;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
    align-self: flex-start;
  }
`;

const PrayerItemContainer = styled.div`
  margin-bottom: 0.8rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PrayerItem = styled.div`
  padding: 1.2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border-left: 4px solid #4285F4;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
    transform: translateX(4px);
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 10px;
  }
`;

const PrayerContent = styled.p`
  color: #333;
  line-height: 1.7;
  margin: 0;
  white-space: pre-wrap;
  font-size: 1rem;
  font-weight: 400;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    line-height: 1.6;
  }
`;

export default PrayerRequests;