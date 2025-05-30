import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path as needed

function AdminCheeringPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const messagesCollectionRef = collection(db, 'cheeringMessages');
    // Fetch messages ordered by creation date (newest first)
    const q = query(messagesCollectionRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() // Convert Timestamp
      }));
      setMessages(messagesList);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching messages: ", err);
      setError('응원 메시지를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('정말로 이 응원 메시지를 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, "cheeringMessages", messageId));
        // No need to manually filter state due to onSnapshot real-time updates
      } catch (err) {
        console.error("Error deleting message: ", err);
        setError('메시지 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const listStyle = {
    listStyle: 'none',
    padding: 0
  };

  const itemStyle = {
    border: '1px solid #ccc',
    marginBottom: '10px',
    padding: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  };

   const contentStyle = {
    flexGrow: 1,
    marginRight: '15px'
   };

  const nameStyle = {
    fontWeight: 'bold'
  };

  const dateStyle = {
    fontSize: '0.8em',
    color: 'gray',
    marginLeft: '10px'
  };

  const messageStyle = {
      marginTop: '5px',
      whiteSpace: 'pre-wrap'
  }

  if (loading) return <div>Loading messages...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>응원 메시지 관리</h2>

      {messages.length === 0 && <p>등록된 응원 메시지가 없습니다.</p>}

      <ul style={listStyle}>
        {messages.map((msg) => (
          <li key={msg.id} style={itemStyle}>
            <div style={contentStyle}>
                <div>
                    <span style={nameStyle}>{msg.name}</span>
                    <span style={dateStyle}>
                         {msg.createdAt ? msg.createdAt.toLocaleString('ko-KR') : ''}
                    </span>
                </div>
               <p style={messageStyle}>{msg.message}</p>
               <p style={{fontSize: '0.9em', color: '#555'}}>❤️ {msg.likeCount || 0}</p>
            </div>
            <div>
              <button onClick={() => handleDeleteMessage(msg.id)}>
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminCheeringPage; 