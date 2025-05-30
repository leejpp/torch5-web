import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path as needed

// Component to display a single prayer item with show more/less functionality
function PrayerItem({ prayer }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LENGTH = 100; // Character limit before showing "more"

  const needsTruncation = prayer.request.length > MAX_LENGTH;
  const displayText = isExpanded ? prayer.request : prayer.request.slice(0, MAX_LENGTH);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const itemStyle = {
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
    backgroundColor: 'white'
  };

  const nameStyle = {
    fontWeight: 'bold',
    color: '#333'
  };

  const requestStyle = {
    marginTop: '8px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap', // Preserve line breaks
    color: '#555'
  };

  const toggleButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    padding: '5px 0',
    marginTop: '5px',
    fontSize: '0.9em'
  };

  return (
    <li style={itemStyle}>
      <p style={nameStyle}>{prayer.name}</p>
      <p style={requestStyle}>
        {displayText}
        {needsTruncation && !isExpanded && '...'}
      </p>
      {needsTruncation && (
        <button onClick={toggleExpand} style={toggleButtonStyle}>
          {isExpanded ? '간략히' : '더보기'}
        </button>
      )}
    </li>
  );
}

function PrayersPage() {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const prayersCollectionRef = collection(db, 'prayerId');
    const q = query(prayersCollectionRef, orderBy("order", "asc"));

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const prayersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPrayers(prayersList);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching prayers with snapshot: ", err);
      setError('기도제목을 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs once on mount

  const pageStyle = {
    padding: '20px',
    backgroundColor: '#f0f2f5' // Light background for the page
  };

  const listStyle = {
    listStyle: 'none',
    padding: 0
  };

  return (
    <div style={pageStyle}>
      <h1 style={{ textAlign: 'center', marginBottom: '25px' }}>🙏 중보기도</h1>
      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {!loading && !error && (
        prayers.length > 0 ? (
          <ul style={listStyle}>
            {prayers.map((prayer) => (
              <PrayerItem key={prayer.id} prayer={prayer} />
            ))}
          </ul>
        ) : (
          <p style={{ textAlign: 'center' }}>등록된 기도제목이 없습니다.</p>
        )
      )}
    </div>
  );
}

export default PrayersPage; 