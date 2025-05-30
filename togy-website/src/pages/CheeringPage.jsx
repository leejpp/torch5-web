import React, { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path as needed
import LikeButton from '../components/LikeButton'; // Import LikeButton

// Form component for submitting cheering messages
function CheeringForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError('이름과 응원 메시지를 모두 입력해주세요.');
      return;
    }
    if (name.length > 20) { // Basic validation
      setError('이름은 20자 이하로 입력해주세요.');
      return;
    }
     if (message.length > 500) { // Basic validation
      setError('메시지는 500자 이하로 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({ name: name.trim(), message: message.trim() });
      // Clear form after successful submission
      setName('');
      setMessage('');
    } catch (err) {
      console.error("Error submitting message: ", err);
      setError('메시지 전송 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formStyle = {
    position: 'fixed',
    bottom: '60px', // Adjust based on UserLayout nav height
    left: 0,
    right: 0,
    padding: '15px',
    backgroundColor: '#e9ecef', // Light background for form area
    borderTop: '1px solid #ccc',
    boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
    zIndex: 10 // Ensure it stays above content when scrolling
  };

  const inputGroupStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px'
  };

  const inputStyle = {
    flexGrow: 1,
    padding: '8px'
  };
   
  const textareaStyle = {
      ...inputStyle,
      height: '50px', // Adjust height as needed
      resize: 'none'
  }

  const buttonStyle = {
    padding: '10px 15px'
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <div style={inputGroupStyle}>
        <input
          type="text"
          placeholder="이름 (20자 이하)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
          maxLength={20}
          disabled={isSubmitting}
        />
        <textarea
          placeholder="응원 메시지 (500자 이하)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={textareaStyle}
          maxLength={500}
          disabled={isSubmitting}
        />
        <button type="submit" style={buttonStyle} disabled={isSubmitting}>
          {isSubmitting ? '전송 중...' : '남기기'}
        </button>
      </div>
      {error && <p style={{ color: 'red', margin: '5px 0 0 0', fontSize: '0.9em' }}>{error}</p>}
    </form>
  );
}

// Main Cheering Page Component
function CheeringPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null); // Ref to scroll to bottom

  useEffect(() => {
    setLoading(true);
    setError(null);
    const messagesCollectionRef = collection(db, 'cheeringMessages');
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

  // Scroll to bottom when new messages arrive (optional)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAddMessage = async (newMessageData) => {
    try {
      const messagesCollectionRef = collection(db, 'cheeringMessages');
      await addDoc(messagesCollectionRef, {
        ...newMessageData,
        likeCount: 0, // Initialize like count
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error adding message: ", err);
      // Re-throw error to be handled by the form
      throw err; 
    }
  };

  const pageStyle = {
    padding: '20px',
    paddingBottom: '160px' // Add padding to avoid overlap with fixed form and nav
  };

  const listStyle = {
    listStyle: 'none',
    padding: 0,
    marginBottom: '20px'
  };

  const messageItemStyle = {
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  const nameStyle = {
    fontWeight: 'bold',
    color: '#333',
    marginRight: '10px'
  };

  const dateStyle = {
    fontSize: '0.8em',
    color: '#888'
  };

  const messageTextStyle = {
    marginTop: '8px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap'
  };

  const actionsStyle = {
      marginTop: '10px',
      textAlign: 'right'
  }

  return (
    <div style={pageStyle}>
      <h1 style={{ textAlign: 'center', marginBottom: '25px' }}>💬 응원 메시지</h1>

      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {!loading && !error && (
        messages.length > 0 ? (
          <ul style={listStyle}>
            {messages.map((msg) => (
              <li key={msg.id} style={messageItemStyle}>
                <div>
                  <span style={nameStyle}>{msg.name}</span>
                  <span style={dateStyle}>
                    {msg.createdAt ? msg.createdAt.toLocaleString('ko-KR') : ''}
                  </span>
                </div>
                <p style={messageTextStyle}>{msg.message}</p>
                <div style={actionsStyle}>
                  <LikeButton 
                    postId={msg.id} // Pass message ID to LikeButton
                    initialLikeCount={msg.likeCount} 
                    collectionName="cheeringMessages" // Pass collection name ** NEW PROP **
                  />
                </div>
              </li>
            ))}
             <div ref={messagesEndRef} /> {/* Element to scroll to */} 
          </ul>
        ) : (
          <p style={{ textAlign: 'center' }}>아직 응원 메시지가 없습니다.</p>
        )
      )}

      <CheeringForm onSubmit={handleAddMessage} />
    </div>
  );
}

export default CheeringPage; 