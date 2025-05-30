import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path as needed

function BirthdaySection() {
  const [birthdayMembers, setBirthdayMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // Get current month (1-12)

  useEffect(() => {
    const fetchBirthdayMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        const membersCollectionRef = collection(db, 'memberId');
        const querySnapshot = await getDocs(membersCollectionRef);
        const allMembers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          birthdate: doc.data().birthdate?.toDate() // Convert Timestamp to JS Date
        }));

        // Filter members whose birthday is in the current month
        const filteredMembers = allMembers.filter(member => {
          if (member.birthdate instanceof Date && !isNaN(member.birthdate)) {
            return member.birthdate.getMonth() + 1 === currentMonth;
          }
          return false;
        });

        // Sort by birth date (day of month)
        filteredMembers.sort((a, b) => a.birthdate.getDate() - b.birthdate.getDate());

        setBirthdayMembers(filteredMembers);

      } catch (err) {
        console.error("Error fetching birthday members: ", err);
        setError('생일자 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdayMembers();
  }, [currentMonth]); // Re-fetch if month changes (e.g., for testing or future features)

  const sectionStyle = {
    padding: '20px',
    marginTop: '20px'
  };

  const headingStyle = {
    fontSize: '1.2em',
    marginBottom: '15px'
  };

  const listStyle = {
    listStyle: 'none',
    padding: 0
  };

  const listItemStyle = {
    marginBottom: '8px',
    fontSize: '1em'
  };

  return (
    <div style={sectionStyle}>
      <h3 style={headingStyle}>🎂 {currentMonth}월의 생일자</h3>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        birthdayMembers.length > 0 ? (
          <ul style={listStyle}>
            {birthdayMembers.map(member => (
              <li key={member.id} style={listItemStyle}>
                {member.name} ({member.birthdate.getDate()}일)
              </li>
            ))}
          </ul>
        ) : (
          <p>이번 달 생일자가 없습니다.</p>
        )
      )}
    </div>
  );
}

export default BirthdaySection; 