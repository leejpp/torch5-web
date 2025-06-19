import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import styled from 'styled-components';
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
      year: 'numeric',
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
        <HeaderIcon>📢</HeaderIcon>
        <HeaderContent>
          <Title>공지사항</Title>
          <SubTitle>청년부 소식을 확인하세요</SubTitle>
        </HeaderContent>
      </Header>

      {loading ? (
        <LoadingContainer>
          <LoadingIcon>📄</LoadingIcon>
          <LoadingMessage>공지사항을 불러오는 중...</LoadingMessage>
        </LoadingContainer>
      ) : notices.length === 0 ? (
        <EmptyState>
          <EmptyIcon>📋</EmptyIcon>
          <EmptyTitle>등록된 공지사항이 없습니다</EmptyTitle>
          <EmptyMessage>새로운 소식이 올라오면 알려드릴게요!</EmptyMessage>
        </EmptyState>
      ) : (
        <NoticeList>
          {notices.map((notice) => (
            <NoticeItem key={notice.id}>
              <NoticeHeader onClick={() => toggleNotice(notice.id)}>
                <NoticeInfo>
                  <NoticeDateWrapper>
                    <DateIcon>📅</DateIcon>
                    <NoticeDate>{formatDate(notice.date)}</NoticeDate>
                  </NoticeDateWrapper>
                  <NoticeTitle>{notice.title}</NoticeTitle>
                </NoticeInfo>
                <ToggleIcon isOpen={openNoticeId === notice.id}>
                  {openNoticeId === notice.id ? '🔼' : '🔽'}
                </ToggleIcon>
              </NoticeHeader>
              <NoticeContent isOpen={openNoticeId === notice.id}>
                <ContentWrapper>
                  {notice.content}
                </ContentWrapper>
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
  padding: 1rem 2rem 3rem;
  background-color: #f8f9fa;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 1rem 1rem 2rem;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #4285F4 0%, #1a73e8 100%);
  color: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(66, 133, 244, 0.3);
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    padding: 1.2rem;
    border-radius: 16px;
  }
`;

const HeaderIcon = styled.div`
  font-size: 2.5rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.3rem 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const SubTitle = styled.p`
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 400;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const LoadingIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: pulse 1.5s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const LoadingMessage = styled.div`
  color: #4285F4;
  font-size: 1.1rem;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 1rem;
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

const NoticeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NoticeItem = styled.div`
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    border-color: rgba(66, 133, 244, 0.2);
  }
  
  @media (max-width: 768px) {
    border-radius: 12px;
  }
`;

const NoticeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  cursor: pointer;
  background-color: white;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  @media (max-width: 768px) {
    padding: 1.2rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const NoticeInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const NoticeDateWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DateIcon = styled.span`
  font-size: 0.9rem;
`;

const NoticeDate = styled.span`
  color: #666;
  font-size: 0.9rem;
  background-color: #f1f3f4;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.2rem 0.5rem;
  }
`;

const NoticeTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  color: #333;
  font-weight: 600;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const ToggleIcon = styled.span`
  font-size: 1.2rem;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  
  @media (max-width: 768px) {
    align-self: flex-end;
    font-size: 1rem;
    padding: 0.3rem;
  }
`;

const NoticeContent = styled.div`
  padding: ${props => props.isOpen ? '0 1.5rem 1.5rem' : '0'};
  max-height: ${props => props.isOpen ? '1000px' : '0'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  transition: all 0.3s ease;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: ${props => props.isOpen ? '0 1.2rem 1.2rem' : '0'};
  }
`;

const ContentWrapper = styled.div`
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  white-space: pre-wrap;
  line-height: 1.7;
  color: #333;
  font-size: 1rem;
  border-left: 4px solid #4285F4;
  
  @media (max-width: 768px) {
    padding: 1.2rem;
    border-radius: 10px;
    font-size: 0.95rem;
    line-height: 1.6;
  }
`;

export default Notice;