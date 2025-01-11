import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const Home = () => {
  const [yearlyTheme, setYearlyTheme] = useState(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchYearlyTheme = async () => {
      try {
        console.log('Fetching yearly theme for year:', currentYear);
        
        const q = query(collection(db, 'yearlyThemes'));
        const querySnapshot = await getDocs(q);
        
        console.log('All documents:', querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        const themeDoc = querySnapshot.docs.find(doc => {
          const data = doc.data();
          return data.year === currentYear || data.year === String(currentYear);
        });

        if (themeDoc) {
          console.log('Found theme:', themeDoc.data());
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
    <Container>
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
        <LinkCard to="/contacts">
          <LinkIcon>📞</LinkIcon>
          <LinkText>비상연락망</LinkText>
        </LinkCard>
        <LinkCard to="/voices">
          <LinkIcon>💌</LinkIcon>
          <LinkText>마음의 소리</LinkText>
        </LinkCard>
      </QuickLinks>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
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
`;

const Title = styled.h1`
  font-size: 3rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  color: #FFB6C1;
  font-weight: normal;
`;

const ThemeSection = styled.section`
  background-color: #FFF0F5;
  padding: 3rem;
  border-radius: 15px;
  text-align: center;
  margin: 3rem 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const YearlyTheme = styled.h3`
  font-size: 2rem;
  color: #FF69B4;
  margin-bottom: 2rem;
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
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const QuickLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
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

  &:hover {
    transform: translateY(-5px);
  }
`;

const LinkIcon = styled.span`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const LinkText = styled.span`
  color: #333;
  font-size: 1.2rem;
`;

export default Home; 