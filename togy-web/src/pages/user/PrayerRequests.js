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
          <LoadingSpinner>로딩 중...</LoadingSpinner>
        </LoadingContainer>
      ) : (
        <Container>
          {prayers.length === 0 ? (
            <EmptyMessage>아직 등록된 기도제목이 없습니다.</EmptyMessage>
          ) : (
            <PrayerList>
              {prayers.map((prayer) => (
                <PrayerCard key={prayer.id}>
                  <PrayerHeader>
                    <Name>{prayer.id}</Name>
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
  min-height: 300px;
`;

const LoadingSpinner = styled.div`
  color: #4285F4;
  font-size: 1.2rem;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  padding-bottom: 3rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
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
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PrayerHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const Name = styled.h2`
  font-size: 1.5rem;
  color: #4285F4;
  margin-right: 1rem;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-right: 0;
  }
`;

const UpdatedAt = styled.span`
  color: #666;
  font-size: 0.9rem;
  margin-right: auto;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-right: 0;
  }
`;

const PrayerItemContainer = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  
  @media (max-width: 768px) {
    padding: 0.8rem;
  }
`;

const PrayerItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const PrayerContent = styled.p`
  flex: 1;
  color: #333;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

export default PrayerRequests;