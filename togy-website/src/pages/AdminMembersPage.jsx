import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  Timestamp,
  deleteDoc,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path as needed

// Form component for adding/editing members
function MemberForm({ initialData, onSubmit, onCancel }) {
  const [name, setName] = useState(initialData?.name || '');
  // HTML date input expects 'YYYY-MM-DD' format
  const initialBirthdate = initialData?.birthdate 
    ? initialData.birthdate.toISOString().split('T')[0]
    : '';
  const [birthdate, setBirthdate] = useState(initialBirthdate);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!name || !birthdate) {
      setFormError('이름과 생년월일을 모두 입력해주세요.');
      return;
    }

    try {
      // Convert 'YYYY-MM-DD' string back to Firestore Timestamp
      // Important: This creates a timestamp at the beginning of the day in UTC.
      // Consider timezone implications if precise time is needed.
      const birthdateTimestamp = Timestamp.fromDate(new Date(birthdate));
      
      const memberData = {
        name: name,
        birthdate: birthdateTimestamp,
      };

      // If initialData exists, it's an update, otherwise it's an add
      await onSubmit(memberData);
    } catch (err) {
      console.error("Error submitting member form: ", err);
      setFormError('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>{initialData ? '회원 정보 수정' : '새 회원 추가'}</h4>
      <div>
        <label htmlFor="name">이름: </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div style={{ marginTop: '10px' }}>
        <label htmlFor="birthdate">생년월일: </label>
        <input
          type="date"
          id="birthdate"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          required
        />
      </div>
      {formError && <p style={{ color: 'red' }}>{formError}</p>}
      <div style={{ marginTop: '15px' }}>
        <button type="submit">저장</button>
        <button type="button" onClick={onCancel} style={{ marginLeft: '10px' }}>
          취소
        </button>
      </div>
    </form>
  );
}

function AdminMembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null); // Member object to edit

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const membersCollectionRef = collection(db, 'memberId');
      const querySnapshot = await getDocs(membersCollectionRef);
      const membersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        birthdate: doc.data().birthdate?.toDate() // Keep as JS Date for the form
      }));
      membersList.sort((a, b) => a.name.localeCompare(b.name));
      setMembers(membersList);
    } catch (err) {
      console.error("Error fetching members: ", err);
      setError('회원 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddMember = async (newMemberData) => {
    try {
      const membersCollectionRef = collection(db, 'memberId');
      await addDoc(membersCollectionRef, {
        ...newMemberData,
        createdAt: serverTimestamp() // Add creation timestamp
      });
      setShowAddForm(false);
      await fetchMembers(); // Refresh list after adding
    } catch (err) {
      console.error("Error adding member: ", err);
      throw err; // Re-throw to be caught by form's error handling
    }
  };

  const handleUpdateMember = async (updatedData) => {
    if (!editingMember) return;
    try {
      const memberDocRef = doc(db, "memberId", editingMember.id);
      await updateDoc(memberDocRef, updatedData);
      setEditingMember(null);
      await fetchMembers(); // Refresh list after updating
    } catch (err) {
      console.error("Error updating member: ", err);
      throw err; // Re-throw to be caught by form's error handling
    }
  };

  const handleDeleteMember = async (memberIdToDelete) => {
    if (window.confirm('정말로 이 회원을 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, "memberId", memberIdToDelete));
        await fetchMembers(); 
      } catch (err) {
        console.error("Error deleting member: ", err);
        setError('회원 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  if (loading) return <div>Loading members...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>회원 관리</h2>
      {!showAddForm && !editingMember && (
         <button onClick={() => setShowAddForm(true)} style={{ marginBottom: '15px' }}>
           새 회원 추가
         </button>
      )}

      {/* Conditionally render Add/Edit form */}
      {showAddForm && (
        <div style={{ border: '1px solid blue', padding: '15px', marginBottom: '15px' }}>
          <MemberForm 
            onSubmit={handleAddMember} 
            onCancel={() => setShowAddForm(false)} 
          />
        </div>
      )}
      {editingMember && (
        <div style={{ border: '1px solid green', padding: '15px', marginBottom: '15px' }}>
          <MemberForm 
            initialData={editingMember} 
            onSubmit={handleUpdateMember} 
            onCancel={() => setEditingMember(null)} 
          />
        </div>
      )}

      {/* Member List Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>이름</th>
            <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>생년월일</th>
            <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>작업</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{member.name}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {member.birthdate
                  ? member.birthdate.toLocaleDateString('ko-KR')
                  : '미입력'}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                <button 
                  onClick={() => {
                      setShowAddForm(false); // Close add form if open
                      setEditingMember(member); // Open edit form
                  }}
                  style={{ marginRight: '5px' }}
                  disabled={editingMember?.id === member.id || showAddForm} // Disable if already editing this or adding new
                >
                  수정
                </button>
                <button 
                  onClick={() => handleDeleteMember(member.id)}
                  disabled={showAddForm || !!editingMember} // Disable delete while form is open
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {members.length === 0 && !loading && <p>등록된 회원이 없습니다.</p>}
    </div>
  );
}

export default AdminMembersPage; 