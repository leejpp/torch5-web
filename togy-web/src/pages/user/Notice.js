import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import styled from 'styled-components';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { colors, typography, spacing, borderRadius, media } from '../../styles/designSystem';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Notice = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

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
    const d = new Date(date.seconds * 1000);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Container>


      <MainContent>
        {loading ? (
          <LoadingSection>
            <LoadingText>소식을 불러오는 중...</LoadingText>
          </LoadingSection>
        ) : notices.length === 0 ? (
          <EmptySection>
            <EmptyIcon>📢</EmptyIcon>
            <EmptyTitle>등록된 공지사항이 없습니다</EmptyTitle>
            <EmptyMessage>새로운 소식이 올라오면 알려드릴게요</EmptyMessage>
          </EmptySection>
        ) : (
          <NoticeList>
            <SectionTitle>
              교회 소식 <Count>{notices.length}</Count>
            </SectionTitle>

            {notices.map((notice) => (
              <AccordionItem
                key={notice.id}
                onClick={() => toggleExpand(notice.id)}
              >
                <HeaderRow>
                  <LeftInfo>
                    <IconWrapper>📢</IconWrapper>
                    <TitleGroup>
                      <NoticeTitle>{notice.title}</NoticeTitle>
                      <NoticeDate>{formatDate(notice.date)}</NoticeDate>
                    </TitleGroup>
                  </LeftInfo>
                </HeaderRow>

                <ContentArea $isExpanded={expandedId === notice.id}>
                  <MarkdownWrapper>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {notice.content}
                    </ReactMarkdown>
                  </MarkdownWrapper>
                </ContentArea>
              </AccordionItem>
            ))}
          </NoticeList>
        )}
      </MainContent>
    </Container>
  );
};

// Styles
const Container = styled.div`
  min-height: 100vh;
  background-color: white;
`;

const TopControls = styled.div`
  padding: ${spacing.md};
  background: white;
  border-bottom: 1px solid ${colors.neutral[200]};
  display: flex;
  align-items: center;
`;

const BackButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid ${colors.neutral[200]};
  border-radius: ${borderRadius.full};
  color: ${colors.neutral[600]};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${colors.neutral[50]};
    color: ${colors.neutral[900]};
    transform: translateX(-2px);
  }
`;

const BackIcon = styled.span`
  font-size: ${typography.fontSize.lg};
`;

const MainContent = styled.main`
  max-width: 600px;
  margin: 0 auto;
  padding: ${spacing.xl};
  
  ${media['max-md']} {
    padding: ${spacing.md};
  }
`;

const SectionTitle = styled.h2`
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
  margin-bottom: ${spacing.lg};
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const Count = styled.span`
  font-size: ${typography.fontSize.lg};
  color: ${colors.primary[600]};
  font-weight: ${typography.fontWeight.medium};
`;

const NoticeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const AccordionItem = styled.div`
  background: white;
  border-bottom: 1px solid ${colors.neutral[100]};
  transition: background-color 0.2s;
  cursor: pointer;
  padding: ${spacing.md} 0;

  &:hover {
    background-color: ${colors.neutral[50]};
  }
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start; // Align to top because title might wrap
`;

const LeftInfo = styled.div`
  display: flex;
  gap: ${spacing.md};
  flex: 1;
`;

const IconWrapper = styled.div`
  font-size: ${typography.fontSize.lg};
  margin-top: 2px; // Visual alignment
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NoticeTitle = styled.h3`
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
  margin: 0;
  line-height: 1.4;
`;

const NoticeDate = styled.span`
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[500]};
`;

const ContentArea = styled.div`
  max-height: ${props => props.$isExpanded ? '2000px' : '0'}; // Large max-height for text
  opacity: ${props => props.$isExpanded ? '1' : '0'};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  margin-top: ${props => props.$isExpanded ? spacing.md : '0'};
`;

const MarkdownWrapper = styled.div`
  padding-left: 40px; // Align with title (Icon width + gap)
  font-size: ${typography.fontSize.base};
  color: ${colors.neutral[700]};
  line-height: 1.7;
  
  ${media['max-md']} {
    padding-left: ${spacing.sm}; // Reduce padding on mobile
  }

  /* Markdown Styles */
  h1, h2, h3, h4, h5, h6 {
    font-weight: ${typography.fontWeight.bold};
    color: ${colors.neutral[900]};
    margin-top: ${spacing.lg};
    margin-bottom: ${spacing.sm};
    line-height: 1.3;
  }

  h1 { font-size: ${typography.fontSize['2xl']}; border-bottom: 2px solid ${colors.neutral[200]}; padding-bottom: ${spacing.xs}; }
  h2 { font-size: ${typography.fontSize.xl}; border-bottom: 1px solid ${colors.neutral[200]}; padding-bottom: ${spacing.xs}; }
  h3 { font-size: ${typography.fontSize.lg}; }
  
  p {
    margin-bottom: ${spacing.md};
    white-space: pre-wrap; // Preserve line breaks if basic text is used
  }

  ul, ol {
    margin-bottom: ${spacing.md};
    padding-left: ${spacing.xl};
  }

  li {
    margin-bottom: ${spacing.xs};
  }

  blockquote {
    border-left: 4px solid ${colors.primary[300]};
    margin: ${spacing.md} 0;
    padding-left: ${spacing.md};
    color: ${colors.neutral[600]};
    font-style: italic;
    background: ${colors.neutral[50]};
    padding: ${spacing.md};
    border-radius: 0 ${borderRadius.md} ${borderRadius.md} 0;
  }

  a {
    color: ${colors.primary[600]};
    text-decoration: underline;
    &:hover {
      color: ${colors.primary[800]};
    }
  }
  
  code {
    background-color: ${colors.neutral[100]};
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: monospace;
    color: ${colors.error[600]};
  }
  
  pre {
    background-color: ${colors.neutral[900]};
    color: ${colors.neutral[100]};
    padding: ${spacing.md};
    border-radius: ${borderRadius.md};
    overflow-x: auto;
    margin-bottom: ${spacing.md};
    
    code {
      background-color: transparent;
      color: inherit;
      padding: 0;
    }
  }
  
  img {
    max-width: 100%;
    border-radius: ${borderRadius.md};
    margin: ${spacing.md} 0;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: ${spacing.md};
    
    th, td {
      border: 1px solid ${colors.neutral[300]};
      padding: ${spacing.sm};
      text-align: left;
    }
    
    th {
      background-color: ${colors.neutral[100]};
      font-weight: bold;
    }
  }
  
  hr {
    border: none;
    border-top: 1px solid ${colors.neutral[200]};
    margin: ${spacing.xl} 0;
  }
`;

const LoadingSection = styled.div`
  text-align: center;
  padding: ${spacing['4xl']} 0;
`;

const LoadingText = styled.p`
  color: ${colors.neutral[500]};
  font-size: ${typography.fontSize.sm};
`;

const EmptySection = styled.div`
  text-align: center;
  padding: ${spacing['4xl']} 0;
  color: ${colors.neutral[400]};
`;

const EmptyIcon = styled.div`
  font-size: ${typography.fontSize['3xl']};
  margin-bottom: ${spacing.md};
  filter: grayscale(1);
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: ${typography.fontSize.lg};
  color: ${colors.neutral[600]};
  margin-bottom: ${spacing.xs};
`;

const EmptyMessage = styled.p`
  font-size: ${typography.fontSize.sm};
`;

export default Notice;