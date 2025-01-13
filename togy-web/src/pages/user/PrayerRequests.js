import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import UserLayout from '../../layouts/UserLayout';
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
    <UserLayout>
      <Header>
        <TitleSection>
          <HomeButton to="/">← 홈으로</HomeButton>
          <Title>중보기도</Title>
        </TitleSection>
      </Header>

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
    </UserLayout>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const HomeButton = styled(Link)`
  color: #666;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-size: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
  
  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const PrayerList = styled.div`
  display: grid;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const PrayerCard = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
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
  color: #333;
  margin-right: 1rem;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-right: 0;
  }
`;

const UpdatedAt = styled.span`
  color: #888;
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
  background-color: #f9f9f9;
  border-radius: 5px;
  
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
  color: #666;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

export default PrayerRequests;