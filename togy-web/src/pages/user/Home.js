import React from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
// 아이콘 라이브러리 임포트 (예: react-icons)
// import { FaHeart, FaFlask, FaSyncAlt, FaUsers, FaCalendarAlt, FaCommentDots, FaPray, FaPlus } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();

  const visionItems = [
    { id: 1, text: '서로를 위해 기도하는 청년 공동체' }, // FaHeart
    { id: 2, text: '주님께서 맡겨 주신 사명을 이루어 주 영광 위해 사는 청년부'}, // FaFlask
    { id: 3, text: '영,혼,육,가정,경제의 균형 있는 성장으로 예수님을 닮아가는 청년부' }, // FaSyncAlt
    { id: 4, text: '천하보다 소중한 한 영혼을 살리는 삶'}, // FaUsers
    { id: 5, text: '하나님 안에서의 친목하는 청년부' } // FaUsers
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Container>
      <Header>
        <Title>TOGY 청년부 (4/18 21:45)</Title>
        {/* <PlusIcon><FaPlus /></PlusIcon> */}
        <PlusIcon>+</PlusIcon>
      </Header>

      <VisionSection>
        <YearlyTheme>말씀이 삶이 되고, 삶이 예배가 되어 영적 성장을 이루는 삶</YearlyTheme>
        <VisionList>
          {visionItems.map(item => (
            <VisionItem key={item.id}>
              <ItemNumber>{item.id}</ItemNumber>
              <ItemText>{item.text}</ItemText>
            </VisionItem>
          ))}
        </VisionList>
      </VisionSection>

      <QuickLinks>
        <StyledButton onClick={() => navigate('/prayer')}>
          <ButtonIcon>💙</ButtonIcon> 중보기도
        </StyledButton>
        <StyledButton type="secondary" onClick={() => navigate('/voices')}>
          <ButtonIcon>💬</ButtonIcon> 마음의 소리
        </StyledButton>
        <StyledButton type="secondary" onClick={() => navigate('/calendar')}>
          <ButtonIcon>🗓️</ButtonIcon> 캘린더
        </StyledButton>
      </QuickLinks>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f8f9fa; /* Light gray background */
  padding-bottom: 3rem;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding-left: 1rem;
    padding-right: 1rem;
  }
`;

const Header = styled.header`
  background-color: #4285F4; /* Blue background */
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: center; /* Center title */
  align-items: center;
  position: relative; /* Needed for absolute positioning of icon */

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
  }
`;

const Title = styled.h1`
  font-size: 1.8rem; /* Adjusted size */
  font-weight: bold;
  margin: 0; /* Remove default margin */

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const PlusIcon = styled.div`
  font-size: 1.8rem;
  position: absolute;
  right: 2rem;
  cursor: pointer;

  @media (max-width: 768px) {
    right: 1.5rem;
    font-size: 1.5rem;
  }
`;


const VisionSection = styled.section`
  padding: 3rem 2rem;
  text-align: center;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const YearlyTheme = styled.p` /* Changed from h3 */
  font-size: 1.3rem; /* Adjusted size */
  color: #4285F4; /* Blue color for theme */
  margin-bottom: 3rem;
  font-weight: 500;
  line-height: 1.6;
  word-break: keep-all;


  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
`;

const VisionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 auto;
  max-width: 800px; /* Limit width for better readability */
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* Space between items */

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const VisionItem = styled.li`
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    flex-direction: row; /* Keep row layout */
  }
`;

const ItemNumber = styled.span`
  background-color: #e7f0ff; /* Light blue background for number */
  color: #4285F4;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 1.5rem;
  flex-shrink: 0; /* Prevent shrinking */

  @media (max-width: 768px) {
    width: 30px;
    height: 30px;
    margin-right: 1rem;
  }
`;

const ItemText = styled.span`
  flex-grow: 1;
  text-align: left;
  font-size: 1.1rem;
  color: #333;
  line-height: 1.6;
  word-break: keep-all;
  padding-right: 1rem; /* Space before icon */


  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const QuickLinks = styled.div`
  display: flex; /* Use flexbox for centering */
  justify-content: center; /* Center buttons */
  gap: 1.5rem;
  padding: 0 2rem 3rem; /* Add padding */
  flex-wrap: wrap; /* Allow wrapping on smaller screens */


  @media (max-width: 768px) {
     gap: 1rem;
     padding: 0 1rem 2rem;
  }
`;

// Update StyledButton component
const StyledButton = styled.button`
  padding: 0.8rem 1.8rem;
  border-radius: 8px;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  cursor: pointer;
  border: none;
  outline: none;

  ${({ type }) => type === 'secondary' ? `
    background-color: white;
    color: #4285F4;
    border: 1px solid #4285F4;
    &:hover {
      background-color: #f8f9fa;
    }
  ` : `
    background-color: #4285F4;
    color: white;
    border: 1px solid #4285F4;
    &:hover {
      background-color: #357ae8;
    }
  `}

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0.7rem 1.5rem;
    width: calc(50% - 0.5rem);
    min-width: auto;
    &:nth-child(3) {
      margin-top: 1rem;
    }
    @media (max-width: 480px) {
      width: 100%;
      &:nth-child(3) {
        margin-top: 1rem;
      }
    }
  }
`;

const ButtonIcon = styled.span`
  font-size: 1.2rem;
  display: inline-flex;
  align-items: center;
`;

/* 이전 스타일 컴포넌트 - 현재는 사용되지 않음 */
// const LinkCard = styled(Link)`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   padding: 2rem;
//   background-color: white;
//   border-radius: 10px;
//   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//   transition: all 0.3s ease;
//   text-decoration: none;
//   
//   &:hover {
//     transform: translateY(-5px);
//   }
// `;
// 
// const LinkIcon = styled.span`
//   font-size: 2.5rem;
//   margin-bottom: 1rem;
// `;
// 
// const LinkText = styled.span`
//   color: #333;
//   font-size: 1.2rem;
// `;

// 사용되지 않는 모든 스타일 컴포넌트 제거

export default Home;