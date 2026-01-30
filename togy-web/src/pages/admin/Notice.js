import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, Timestamp, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { colors, typography, spacing, borderRadius, shadows, media } from '../../styles/designSystem';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const NoticeAdmin = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notices, setNotices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openNoticeId, setOpenNoticeId] = useState(null);
  const [editingNotice, setEditingNotice] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, noticeId: null });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const q = query(collection(db, 'notices'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const noticesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotices(noticesList);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await addDoc(collection(db, 'notices'), {
        title: title.trim(),
        content: content.trim(),
        date: Timestamp.now()
      });
      setSuccessMessage('공지사항이 등록되었습니다.');
      setTitle('');
      setContent('');
      fetchNotices();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError('오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp) => {
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

  const toggleNotice = (id) => {
    setOpenNoticeId(openNoticeId === id ? null : id);
  };

  const handleEdit = (notice, e) => {
    e.stopPropagation();
    setEditingNotice(notice);
    setTitle(notice.title);
    setContent(notice.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const noticeRef = doc(db, 'notices', editingNotice.id);
      await updateDoc(noticeRef, {
        title: title.trim(),
        content: content.trim(),
        date: Timestamp.now()
      });

      setSuccessMessage('수정되었습니다.');
      setTitle('');
      setContent('');
      setEditingNotice(null);
      fetchNotices();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError('수정 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noticeId) => {
    try {
      await deleteDoc(doc(db, 'notices', noticeId));
      setSuccessMessage('삭제되었습니다.');
      fetchNotices();
      setDeleteConfirm({ isOpen: false, noticeId: null });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError('삭제 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  return (
    <Container>
      <Header>
        <TitleSection>
          <SubHeader>Notice Management</SubHeader>
          <PageTitle>공지사항 관리</PageTitle>
        </TitleSection>
      </Header>

      <ContentGrid>
        {/* Left: Form */}
        <FormSection>
          <SectionHeader>
            <SectionTitle>{editingNotice ? '공지사항 수정' : '새 공지사항 작성'}</SectionTitle>
          </SectionHeader>

          <Form onSubmit={editingNotice ? handleUpdate : handleSubmit}>
            <FormGroup>
              <Label>제목</Label>
              <Input
                type="text"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>내용 (Markdown 지원)</Label>
              <TextArea
                placeholder="# 제목\n**굵게**\n- 리스트"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </FormGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

            <ButtonGroup>
              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? '처리 중...' : (editingNotice ? '수정 완료' : '등록하기')}
              </SubmitButton>
              {(editingNotice || title || content) && (
                <CancelButton
                  type="button"
                  onClick={() => {
                    setTitle('');
                    setContent('');
                    setError('');
                    setEditingNotice(null);
                  }}
                >
                  {editingNotice ? '수정 취소' : '초기화'}
                </CancelButton>
              )}
            </ButtonGroup>
          </Form>
        </FormSection>

        {/* Right: List */}
        <ListSection>
          <SectionHeader>
            <SectionTitle>목록 ({notices.length})</SectionTitle>
          </SectionHeader>

          <NoticeList>
            {notices.map(notice => (
              <NoticeItem key={notice.id} isOpen={openNoticeId === notice.id}>
                <NoticeItemHeader onClick={() => toggleNotice(notice.id)}>
                  <NoticeItemInfo>
                    <NoticeItemTitle>{notice.title}</NoticeItemTitle>
                    <NoticeItemDate>{formatDate(notice.date)}</NoticeItemDate>
                  </NoticeItemInfo>
                  <ActionButtons>
                    <EditButton onClick={(e) => handleEdit(notice, e)}>수정</EditButton>
                    <DeleteButton onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm({ isOpen: true, noticeId: notice.id });
                    }}>삭제</DeleteButton>
                  </ActionButtons>
                </NoticeItemHeader>

                <NoticeContent isOpen={openNoticeId === notice.id}>
                  <MarkdownWrapper>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {notice.content}
                    </ReactMarkdown>
                  </MarkdownWrapper>
                </NoticeContent>
              </NoticeItem>
            ))}
          </NoticeList>
        </ListSection>
      </ContentGrid>

      {deleteConfirm.isOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>공지사항 삭제</ModalTitle>
            <ModalText>정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</ModalText>
            <ModalButtons>
              <DeleteConfirmButton onClick={() => handleDelete(deleteConfirm.noticeId)}>
                삭제하기
              </DeleteConfirmButton>
              <ModalCancelButton onClick={() => setDeleteConfirm({ isOpen: false, noticeId: null })}>
                취소
              </ModalCancelButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

// Styles
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${spacing.xl};
  min-height: 100vh;
  background-color: ${colors.neutral[50]};
  
  ${media['max-md']} {
    padding: ${spacing.md};
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: ${spacing.xl};
  padding-bottom: ${spacing.lg};
  border-bottom: 1px solid ${colors.neutral[200]};
  
  ${media['max-md']} {
    flex-direction: column;
    align-items: flex-start;
    gap: ${spacing.md};
  }
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const SubHeader = styled.span`
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[500]};
  font-weight: ${typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const PageTitle = styled.h1`
  font-size: ${typography.fontSize['2xl']};
  color: ${colors.neutral[900]};
  font-weight: ${typography.fontWeight.bold};
  font-family: ${typography.fontFamily.heading};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.xl};
  
  ${media['max-md']} {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled.section`
  background: white;
  padding: ${spacing.xl};
  border-radius: ${borderRadius.xl};
  border: 1px solid ${colors.neutral[200]};
  height: fit-content;
  
  ${media['max-md']} {
    padding: ${spacing.lg};
  }
`;

const ListSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const SectionHeader = styled.div`
  margin-bottom: ${spacing.lg};
`;

const SectionTitle = styled.h2`
  font-size: ${typography.fontSize.lg};
  color: ${colors.neutral[800]};
  font-weight: ${typography.fontWeight.bold};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

const Label = styled.label`
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[600]};
  font-weight: ${typography.fontWeight.medium};
`;

const Input = styled.input`
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral[200]};
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSize.base};
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary[500]};
    box-shadow: 0 0 0 2px ${colors.primary[100]};
  }
`;

const TextArea = styled.textarea`
  padding: ${spacing.md};
  border: 1px solid ${colors.neutral[200]};
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSize.base};
  min-height: 200px;
  resize: vertical;
  line-height: 1.6;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary[500]};
    box-shadow: 0 0 0 2px ${colors.primary[100]};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacing.md};
  margin-top: ${spacing.sm};
`;

const Button = styled.button`
  flex: 1;
  padding: ${spacing.md};
  border: none;
  border-radius: ${borderRadius.md};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;
`;

const SubmitButton = styled(Button)`
  background-color: ${colors.primary[600]};
  color: white;
  
  &:hover {
    background-color: ${colors.primary[700]};
  }
  
  &:disabled {
    background-color: ${colors.neutral[300]};
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background-color: ${colors.neutral[100]};
  color: ${colors.neutral[600]};
  
  &:hover {
    background-color: ${colors.neutral[200]};
  }
`;

const NoticeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const NoticeItem = styled.div`
  background: white;
  border: 1px solid ${props => props.isOpen ? colors.primary[200] : colors.neutral[200]};
  border-radius: ${borderRadius.lg};
  overflow: hidden;
  transition: all 0.2s;
  box-shadow: ${props => props.isOpen ? shadows.md : 'none'};
`;

const NoticeItemHeader = styled.div`
  padding: ${spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: ${props => props.onClick ? 'white' : 'transparent'}; // Clean background
  
  &:hover {
    background-color: ${colors.neutral[50]};
  }
`;

const NoticeItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NoticeItemTitle = styled.h3`
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
  margin: 0;
`;

const NoticeItemDate = styled.span`
  font-size: ${typography.fontSize.sm};
  color: ${colors.neutral[500]};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${spacing.xs};
`;

const ActionButton = styled.button`
  padding: ${spacing.xs} ${spacing.sm};
  border: 1px solid ${colors.neutral[200]};
  border-radius: ${borderRadius.md};
  background: white;
  font-size: ${typography.fontSize.xs};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${colors.neutral[50]};
  }
`;

const EditButton = styled(ActionButton)`
  color: ${colors.primary[600]};
  &:hover { border-color: ${colors.primary[200]}; }
`;

const DeleteButton = styled(ActionButton)`
  color: ${colors.error[600]};
  &:hover { border-color: ${colors.error[200]}; background: ${colors.error[50]}; }
`;

const NoticeContent = styled.div`
  padding: ${props => props.isOpen ? spacing.lg : 0};
  max-height: ${props => props.isOpen ? '1000px' : 0};
  opacity: ${props => props.isOpen ? 1 : 0};
  border-top: ${props => props.isOpen ? `1px solid ${colors.neutral[100]}` : 'none'};
  transition: all 0.3s;
  overflow: hidden;
  color: ${colors.neutral[700]};
  line-height: 1.6;
`;

const MarkdownWrapper = styled.div`
  font-size: ${typography.fontSize.base};
  color: ${colors.neutral[700]};
  line-height: 1.6;

  /* Markdown Styles - Scaled down slightly for Admin context if needed, but keeping consistent */
  h1, h2, h3, h4, h5, h6 {
    font-weight: ${typography.fontWeight.bold};
    color: ${colors.neutral[900]};
    margin-top: ${spacing.md};
    margin-bottom: ${spacing.xs};
    line-height: 1.3;
  }

  h1 { font-size: ${typography.fontSize.xl}; border-bottom: 1px solid ${colors.neutral[200]}; padding-bottom: ${spacing.xs}; }
  h2 { font-size: ${typography.fontSize.lg}; border-bottom: 1px solid ${colors.neutral[200]}; padding-bottom: ${spacing.xs}; }
  h3 { font-size: ${typography.fontSize.base}; }
  
  p {
    margin-bottom: ${spacing.sm};
    white-space: pre-wrap; 
  }

  ul, ol {
    margin-bottom: ${spacing.sm};
    padding-left: ${spacing.lg};
  }

  li {
    margin-bottom: 2px;
  }

  blockquote {
    border-left: 3px solid ${colors.primary[300]};
    margin: ${spacing.sm} 0;
    padding-left: ${spacing.sm};
    color: ${colors.neutral[600]};
    font-style: italic;
    background: ${colors.neutral[50]};
    padding: ${spacing.sm};
    border-radius: 0 ${borderRadius.md} ${borderRadius.md} 0;
  }

  a {
    color: ${colors.primary[600]};
    text-decoration: underline;
  }
  
  code {
    background-color: ${colors.neutral[100]};
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: monospace;
    color: ${colors.error[600]};
  }
  
  img {
    max-width: 100%;
    border-radius: ${borderRadius.md};
    margin: ${spacing.sm} 0;
  }
`;

const ErrorMessage = styled.p`
  color: ${colors.error[600]};
  font-size: ${typography.fontSize.sm};
  text-align: center;
`;

const SuccessMessage = styled.p`
  color: ${colors.success[600]};
  font-size: ${typography.fontSize.sm};
  text-align: center;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: ${spacing.md};
`;

const ModalContent = styled.div`
  background: white;
  padding: ${spacing.xl};
  border-radius: ${borderRadius.xl};
  max-width: 400px;
  width: 100%;
  text-align: center;
`;

const ModalTitle = styled.h3`
  font-size: ${typography.fontSize.xl};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
  margin-bottom: ${spacing.sm};
`;

const ModalText = styled.p`
  color: ${colors.neutral[600]};
  margin-bottom: ${spacing.xl};
`;

const ModalButtons = styled.div`
  display: flex;
  gap: ${spacing.md};
`;

const DeleteConfirmButton = styled(Button)`
  background-color: ${colors.error[600]};
  color: white;
  
  &:hover { background-color: ${colors.error[700]}; }
`;

const ModalCancelButton = styled(Button)`
  background-color: ${colors.neutral[100]};
  color: ${colors.neutral[700]};
  
  &:hover { background-color: ${colors.neutral[200]}; }
`;

export default NoticeAdmin;