import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import AdminLayout from '../../layouts/AdminLayout';

const STATUS = {
  PENDING: { value: 'PENDING', label: '접수 대기', color: '#666' },
  ACCEPTED: { value: 'ACCEPTED', label: '접수됨', color: '#4CAF50' },
  HOLD: { value: 'HOLD', label: '보류', color: '#ff9800' },
  COMPLETED: { value: 'COMPLETED', label: '완료', color: '#2196F3' },
  REJECTED: { value: 'REJECTED', label: '반려', color: '#f44336' }
};

const VoicesAdmin = () => {
  const [voices, setVoices] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [statusUpdateModal, setStatusUpdateModal] = useState({
    isOpen: false,
    voiceId: null,
    currentStatus: null
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const q = query(
        collection(db, 'voices'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setVoices(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status: doc.data().status || 'PENDING'
      })));
    } catch (error) {
      console.error("Error fetching voices:", error);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      const voiceRef = doc(db, 'voices', statusUpdateModal.voiceId);
      await updateDoc(voiceRef, {
        status: newStatus,
        statusUpdatedAt: new Date()
      });
      
      await fetchVoices();
      setMessage({ type: 'success', content: '상태가 변경되었습니다.' });
      setTimeout(() => setMessage({ type: '', content: '' }), 3000);
      setStatusUpdateModal({ isOpen: false, voiceId: null, currentStatus: null });
    } catch (error) {
      console.error("Error updating status:", error);
      setMessage({ type: 'error', content: '상태 변경 중 오류가 발생했습니다.' });
      setTimeout(() => setMessage({ type: '', content: '' }), 3000);
    } finally {
      setIsUpdating(false);
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

  const filteredVoices = voices.filter(voice => 
    selectedStatus === 'ALL' || voice.status === selectedStatus
  );

  return (
    <AdminLayout>
      <Header>
        <TitleSection>
          <HomeButton to="/admin">← 홈으로</HomeButton>
          <Title>마음의 소리함</Title>
        </TitleSection>
      </Header>

      <FilterSection>
        <FilterButton 
          $active={selectedStatus === 'ALL'}
          onClick={() => setSelectedStatus('ALL')}
        >
          전체보기
        </FilterButton>
        {Object.values(STATUS).map(status => (
          <FilterButton
            key={status.value}
            $active={selectedStatus === status.value}
            onClick={() => setSelectedStatus(status.value)}
            color={status.color}
          >
            {status.label}
          </FilterButton>
        ))}
      </FilterSection>

      <VoicesList>
        {filteredVoices.map((voice) => (
          <VoiceCard key={voice.id}>
            <VoiceHeader>
              <VoiceDate>{formatDate(voice.createdAt)}</VoiceDate>
              <StatusBadge 
                color={STATUS[voice.status].color}
                onClick={() => setStatusUpdateModal({
                  isOpen: true,
                  voiceId: voice.id,
                  currentStatus: voice.status
                })}
              >
                {STATUS[voice.status].label}
              </StatusBadge>
            </VoiceHeader>
            <VoiceContent>{voice.message}</VoiceContent>
          </VoiceCard>
        ))}
        {filteredVoices.length === 0 && (
          <EmptyMessage>
            {selectedStatus === 'PENDING' 
              ? '아직 전달된 마음의 소리가 없습니다.'
              : '해당하는 마음의 소리가 없습니다.'}
          </EmptyMessage>
        )}
      </VoicesList>

      {message.content && (
        <MessagePopup type={message.type}>
          {message.content}
        </MessagePopup>
      )}

      {statusUpdateModal.isOpen && (
        <StatusModal>
          <ModalContent>
            <ModalTitle>상태 변경</ModalTitle>
            <StatusButtonsContainer>
              {Object.values(STATUS).map(status => (
                <StatusButton
                  key={status.value}
                  color={status.color}
                  active={statusUpdateModal.currentStatus === status.value}
                  onClick={() => handleStatusUpdate(status.value)}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <LoadingSpinner />
                  ) : (
                    status.label
                  )}
                </StatusButton>
              ))}
            </StatusButtonsContainer>
            <CancelButton 
              onClick={() => setStatusUpdateModal({
                isOpen: false,
                voiceId: null,
                currentStatus: null
              })}
              disabled={isUpdating}
            >
              취소
            </CancelButton>
          </ModalContent>
        </StatusModal>
      )}
    </AdminLayout>
  );
};

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HomeButton = styled(Link)`
  color: #666;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-size: 1rem;
  
  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
`;

const VoicesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const VoiceCard = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const VoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const VoiceDate = styled.span`
  color: #888;
  font-size: 0.9rem;
`;

const VoiceContent = styled.p`
  color: #333;
  line-height: 1.6;
  margin-bottom: 1rem;
  white-space: pre-wrap;
`;

const StatusBadge = styled.span`
  background-color: ${props => props.color};
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 0.2rem 0.6rem;
    font-size: 0.85rem;
  }
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: #666;
  padding: 2rem;
`;

const StatusModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 300px;
  animation: slideUp 0.3s ease;
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @media (max-width: 768px) {
    width: 90%;
    padding: 1.5rem;
    margin: 1rem;
  }
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
`;

const StatusButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StatusButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: ${props => props.color};
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 45px;
  
  &:hover {
    background-color: ${props => !props.disabled && (props.active ? '#FF69B4' : '#FFB6C1')};
  }
`;

const CancelButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 5px;
  text-decoration: none;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const FilterSection = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 0.3rem;
  }
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${props => props.$active ? props.color || '#666' : '#f0f0f0'};
  color: ${props => props.$active ? 'white' : '#666'};
  border: none;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.$active ? props.color || '#666' : '#e0e0e0'};
  }
  
  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const MessagePopup = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 2rem;
  border-radius: 5px;
  background-color: ${props => props.type === 'error' ? '#f44336' : '#4CAF50'};
  color: white;
  z-index: 1000;
  animation: slideUp 0.3s ease;
  
  @keyframes slideUp {
    from { transform: translate(-50%, 20px); opacity: 0; }
    to { transform: translate(-50%, 0); opacity: 1; }
  }
`;

export default VoicesAdmin; 