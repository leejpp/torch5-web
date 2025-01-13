import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

const Notice = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openNoticeId, setOpenNoticeId] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const q = query(
        collection(db, 'notices'),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const noticeList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotices(noticeList);
    } catch (error) {
      console.error("Error fetching notices:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date.seconds * 1000).toLocaleDateString('ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const toggleNotice = (id) => {
    setOpenNoticeId(openNoticeId === id ? null : id);
  };

  return (
    <Container>
      <Header>
        <TitleSection>
          <HomeButton to="/">← 홈으로</HomeButton>
          <Title>공지사항</Title>
        </TitleSection>
      </Header>

      {loading ? (
        <LoadingMessage>로딩 중...</LoadingMessage>
      ) : (
        <NoticeList>
          {notices.map((notice) => (
            <NoticeItem key={notice.id}>
              <NoticeHeader onClick={() => toggleNotice(notice.id)}>
                <NoticeDate>{formatDate(notice.date)}</NoticeDate>
                <NoticeTitle>{notice.title}</NoticeTitle>
                <ToggleIcon isOpen={openNoticeId === notice.id}>▼</ToggleIcon>
              </NoticeHeader>
              <NoticeContent isOpen={openNoticeId === notice.id}>
                {notice.content}
              </NoticeContent>
            </NoticeItem>
          ))}
        </NoticeList>
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

const LoadingMessage = styled.div`
  text-align: center;
  color: #666;
  padding: 2rem;
`;

const NoticeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NoticeItem = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const NoticeHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  background-color: white;
  
  &:hover {
    background-color: #f8f8f8;
  }
  
  @media (max-width: 768px) {
    padding: 0.8rem;
  }
`;

const NoticeDate = styled.span`
  color: #888;
  font-size: 0.9rem;
  margin-right: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const NoticeTitle = styled.h2`
  margin: 0;
  flex: 1;
  font-size: 1.1rem;
  color: #333;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ToggleIcon = styled.span`
  margin-left: 1rem;
  transition: transform 0.3s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0)'};
`;

const NoticeContent = styled.div`
  padding: ${props => props.isOpen ? '1rem' : '0'};
  max-height: ${props => props.isOpen ? '1000px' : '0'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  transition: all 0.3s ease;
  overflow: hidden;
  background-color: #f9f9f9;
  white-space: pre-wrap;
  
  @media (max-width: 768px) {
    padding: ${props => props.isOpen ? '0.8rem' : '0'};
    font-size: 0.95rem;
  }
`;

export default Notice;