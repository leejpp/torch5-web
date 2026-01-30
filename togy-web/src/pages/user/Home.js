import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { colors, typography, spacing, borderRadius, media } from '../../styles/designSystem';

const Home = () => {
  const navigate = useNavigate();
  const [yearlyTheme, setYearlyTheme] = useState({
    theme: '말씀이 삶이 되고, 삶이 예배가 되어\n영적 성장을 이루는 삶',
    year: '2025'
  });
  const [visionItems, setVisionItems] = useState([
    { id: 1, text: '서로를 위해 기도하는 청년 공동체' },
    { id: 2, text: '주님께서 맡겨 주신 사명을 이루어 주 영광 위해 사는 청년부' },
    { id: 3, text: '영,혼,육,가정,경제의 균형 있는 성장으로 예수님을 닮아가는 청년부' },
    { id: 4, text: '천하보다 소중한 한 영혼을 살리는 삶' },
    { id: 5, text: '하나님 안에서의 친목하는 청년부' }
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchYearlyThemes();
  }, []);

  const fetchYearlyThemes = async () => {
    try {
      const q = query(collection(db, 'yearlyThemes'), orderBy('year', 'desc'));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const themes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const latestTheme = themes[0];
        if (latestTheme.theme) {
          setYearlyTheme({
            theme: latestTheme.theme,
            year: latestTheme.year || '2025'
          });
        }

        if (latestTheme.direction && Array.isArray(latestTheme.direction)) {
          const updatedVisionItems = latestTheme.direction.map((item, index) => ({
            id: index + 1,
            text: typeof item === 'string' ? item : item.text || item
          }));
          setVisionItems(updatedVisionItems);
        }
      }
    } catch (error) {
      console.error("Error fetching yearly themes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <ContentWrapper>
        {/* Header Section: Yearly Theme */}
        <HeaderSection>
          {isLoading ? (
            <LoadingText>로딩중...</LoadingText>
          ) : (
            <>
              <YearLabel>{yearlyTheme.year} 주제</YearLabel>
              <MainThemeTitle>
                {yearlyTheme.theme.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < yearlyTheme.theme.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </MainThemeTitle>

              <VisionList>
                {visionItems.map((item) => (
                  <VisionItem key={item.id}>
                    <VisionText>{item.text}</VisionText>
                  </VisionItem>
                ))}
              </VisionList>
            </>
          )}
        </HeaderSection>

      </ContentWrapper>
    </Container>
  );
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background-color: ${colors.neutral[50]}; // Cream White
  display: flex;
  justify-content: center;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 600px; // Mobile friendly width
  padding: ${spacing.xl} ${spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${spacing['3xl']};
  
  ${media['max-md']} {
    padding: ${spacing.lg};
    gap: ${spacing['2xl']};
    align-items: center; /* Center content on mobile */
  }
`;

const HeaderSection = styled.section`
  text-align: center;
  animation: ${fadeIn} 0.8s ease-out;
  width: 100%;
`;

const LoadingText = styled.p`
  color: ${colors.neutral[400]};
  font-size: ${typography.fontSize.sm};
`;

const YearLabel = styled.span`
  display: inline-block;
  background-color: ${colors.primary[50]};
  color: ${colors.primary[700]};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.bold};
  padding: ${spacing.xs} ${spacing.md};
  border-radius: ${borderRadius.full};
  margin-bottom: ${spacing.md};
`;

const MainThemeTitle = styled.h1`
  font-family: ${typography.fontFamily.heading};
  font-size: ${typography.fontSize['2xl']}; // Reduced from 4xl
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
  line-height: ${typography.lineHeight.relaxed};
  margin-bottom: ${spacing.xl};
  white-space: pre-wrap;
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.xl};
  }
`;

const VisionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
  align-items: center;
  width: 100%;
`;

const VisionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: ${colors.neutral[600]};
  font-size: ${typography.fontSize.md}; // Reduced size
  padding: ${spacing.sm};
  
  ${media['max-md']} {
    font-size: ${typography.fontSize.sm};
  }
`;

const VisionText = styled.span`
  line-height: 1.5;
`;

export default Home;