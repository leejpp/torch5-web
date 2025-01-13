import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import UserLayout from '../../layouts/UserLayout';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const Home = () => {
  const [yearlyTheme, setYearlyTheme] = useState(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchYearlyTheme = async () => {
      try {
        
        const q = query(collection(db, 'yearlyThemes'));
        const querySnapshot = await getDocs(q);
       

        const themeDoc = querySnapshot.docs.find(doc => {
          const data = doc.data();
          return data.year === currentYear || data.year === String(currentYear);
        });

        if (themeDoc) {
          setYearlyTheme(themeDoc.data());
        } else {
          console.log("No theme found for current year");
        }
      } catch (error) {
        console.error("Error fetching theme:", error);
      }
    };

    fetchYearlyTheme();
  }, [currentYear]);

  if (!yearlyTheme) {
    return <LoadingContainer>로딩 중...</LoadingContainer>;
  }

  return (
    <UserLayout>
      <Header>
        <Title>TOGY 청년부</Title>
        <Subtitle>{currentYear}년 청년부</Subtitle>
      </Header>
      
      <ThemeSection>
        <YearlyTheme>{yearlyTheme.theme}</YearlyTheme>
        <DirectionList>
          {yearlyTheme.direction.map((item, index) => (
            <DirectionItem key={index}>
              {index + 1}. {item}
            </DirectionItem>
          ))}
        </DirectionList>
      </ThemeSection>

      <QuickLinks>
        <LinkCard to="/prayer">
          <LinkIcon>🙏</LinkIcon>
          <LinkText>중보기도</LinkText>
        </LinkCard>
        <LinkCard to="/voices">
          <LinkIcon>💌</LinkIcon>
          <LinkText>마음의 소리</LinkText>
        </LinkCard>
        <LinkCard to="/calendar">
          <LinkIcon>📅</LinkIcon>
          <LinkText>TOGY일정</LinkText>
        </LinkCard>
        <LinkCard to="/notice">
          <LinkIcon>📢</LinkIcon>
          <LinkText>공지사항</LinkText>
        </LinkCard>
      </QuickLinks>
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
  color: #666;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  color: #333;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  color: #FFB6C1;
  font-weight: normal;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const ThemeSection = styled.section`
  background-color: #FFF0F5;
  padding: 3rem;
  border-radius: 15px;
  text-align: center;
  margin: 2rem 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin: 1.5rem 0;
  }
`;

const YearlyTheme = styled.h3`
  font-size: 2rem;
  color: #FF69B4;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

const DirectionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const DirectionItem = styled.li`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.6;
  word-break: keep-all;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 0.8rem;
    text-align: left;
    padding: 0 0.5rem;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const QuickLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 2rem;
  }
`;

const LinkCard = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  transition: transform 0.2s ease-in-out;

  @media (max-width: 768px) {
    padding: 1.5rem;
    flex-direction: row;
    justify-content: center;
    gap: 1rem;
  }

  &:hover {
    transform: translateY(-5px);
  }
`;

const LinkIcon = styled.span`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 0;
  }
`;

const LinkText = styled.span`
  color: #333;
  font-size: 1.2rem;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

export default Home;