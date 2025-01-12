import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

const Contacts = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const q = query(collection(db, 'members'), orderBy('role', 'asc'));
      const querySnapshot = await getDocs(q);
      const membersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMembers(membersList);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatBirthday = (date) => {
    if (!date) return '';
    const padZero = (num) => String(num).padStart(2, '0');
    return `${padZero(date.month)}월 ${padZero(date.day)}일`;
  };

  const formatRole = (role) => {
    switch(role) {
      case 'president': return '회장';
      case 'treasurer': return '총무';
      case 'staff': return '임원';
      default: return '';
    }
  };

  return (
    <Container>
      <Header>
        <TitleSection>
          <HomeButton to="/">← 홈으로</HomeButton>
          <Title>비상연락망</Title>
        </TitleSection>
      </Header>

      {loading ? (
        <LoadingMessage>로딩 중...</LoadingMessage>
      ) : (
        <MemberList>
          {members.map(member => (
            <MemberCard key={member.id}>
              <MemberInfo>
                <NameSection>
                  <Name>{member.name}</Name>
                  {member.role && <Role>{formatRole(member.role)}</Role>}
                </NameSection>
                <Contact>{member.phone}</Contact>
                <Birthday>{formatBirthday(member.birthday)}</Birthday>
              </MemberInfo>
            </MemberCard>
          ))}
        </MemberList>
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 800px;
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

const LoadingMessage = styled.div`
  text-align: center;
  color: #666;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
    font-size: 0.9rem;
  }
`;

const MemberList = styled.div`
  display: grid;
  gap: 1rem;
`;

const MemberCard = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const MemberInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
`;

const NameSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const Name = styled.h2`
  font-size: 1.2rem;
  color: #333;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const Role = styled.span`
  background-color: #FFB6C1;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.15rem 0.4rem;
  }
`;

const Contact = styled.span`
  color: #666;
  
  @media (max-width: 768px) {
    width: 100%;
    font-size: 0.95rem;
    padding: 0.2rem 0;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
  }
`;

const Birthday = styled.span`
  color: #888;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

export default Contacts;