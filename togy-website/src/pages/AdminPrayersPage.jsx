import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  writeBatch 
} from 'firebase/firestore';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { db } from '../firebase'; // Adjust path as needed

// Sortable Item Component
function SortablePrayerItem({ id, prayer, index, onEdit, onDelete, isEditingOrAdding }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // Optional: style while dragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: '1px solid #ccc', 
    marginBottom: '10px', 
    padding: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: isDragging ? '#f0f0f0' : 'white', // Example dragging style
    opacity: isDragging ? 0.8 : 1,
    cursor: 'grab', // Indicate draggable
    touchAction: 'none', // Recommended for pointer sensor on touch devices
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes}>
      <div style={{ flexGrow: 1 }}>
         {/* Drag Handle (Optional: could make only a part of the item draggable) */}
         <span {...listeners} style={{ cursor: 'grab', marginRight: '10px', touchAction: 'none' }}>☰</span> 
         <strong style={{ marginRight: '10px' }}>{index + 1}. {prayer.name}</strong>
         <p style={{ margin: '5px 0 0 25px', whiteSpace: 'pre-wrap' }}>{prayer.request}</p>
      </div>
      <div>
        <button 
          onClick={() => onEdit(prayer)} 
          style={{ marginRight: '5px' }}
          disabled={isEditingOrAdding} 
        >
          수정
        </button>
        <button 
          onClick={() => onDelete(prayer.id)}
          disabled={isEditingOrAdding}
        >
          삭제
        </button>
      </div>
    </li>
  );
}

// Form component for adding/editing prayers
function PrayerForm({ initialData, onSubmit, onCancel }) {
  const [name, setName] = useState(initialData?.name || '');
  const [request, setRequest] = useState(initialData?.request || '');
  const [isAnonymous, setIsAnonymous] = useState(initialData?.name === '익명' || false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    // If anonymous is checked, force name to '익명'
    if (isAnonymous) {
      setName('익명');
    }
  }, [isAnonymous]);

  const handleNameChange = (e) => {
    if (!isAnonymous) {
      setName(e.target.value);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!name || !request) {
      setFormError('이름(또는 익명 체크)과 기도제목을 모두 입력해주세요.');
      return;
    }

    try {
      const prayerData = {
        name: name,
        request: request,
        // order will be handled by the parent component
      };
      await onSubmit(prayerData);
    } catch (err) {
      console.error("Error submitting prayer form: ", err);
      setFormError('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>{initialData ? '기도제목 수정' : '새 기도제목 추가'}</h4>
      <div>
        <label>
          <input 
            type="checkbox" 
            checked={isAnonymous} 
            onChange={(e) => setIsAnonymous(e.target.checked)} 
          />
          익명
        </label>
      </div>
      <div style={{ marginTop: '10px' }}>
        <label htmlFor="name">이름: </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={handleNameChange}
          required
          disabled={isAnonymous} // Disable name input if anonymous
          style={isAnonymous ? { backgroundColor: '#eee' } : {}}
        />
      </div>
      <div style={{ marginTop: '10px' }}>
        <label htmlFor="request">기도제목: </label>
        <textarea
          id="request"
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          required
          rows={3}
          style={{ width: '95%', verticalAlign: 'top' }} 
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

function AdminPrayersPage() {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState(null); // Prayer object to edit
  const [isSavingOrder, setIsSavingOrder] = useState(false); // State for saving indicator

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Allow drag only after moving 5px
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Function to determine the next order value
  const getNextOrder = () => {
    if (prayers.length === 0) {
      return 1; // Start with 1 if list is empty
    }
    // Find the maximum current order and add 1
    const maxOrder = Math.max(...prayers.map(p => p.order || 0));
    return maxOrder + 1;
  };

  const fetchPrayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const prayersCollectionRef = collection(db, 'prayerId');
      const q = query(prayersCollectionRef, orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      const prayersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPrayers(prayersList);
    } catch (err) {
      console.error("Error fetching prayers: ", err);
      setError('기도제목을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayers();
  }, []);

  const handleAddPrayer = async (newPrayerData) => {
    try {
      const prayersCollectionRef = collection(db, 'prayerId');
      const nextOrder = getNextOrder();
      await addDoc(prayersCollectionRef, {
        ...newPrayerData,
        order: nextOrder,
        createdAt: serverTimestamp()
      });
      setShowAddForm(false);
      await fetchPrayers();
    } catch (err) {
      console.error("Error adding prayer: ", err);
      throw err;
    }
  };

  const handleUpdatePrayer = async (updatedData) => {
    if (!editingPrayer) return;
    try {
      const prayerDocRef = doc(db, "prayerId", editingPrayer.id);
      await updateDoc(prayerDocRef, {
        ...updatedData,
      });
      setEditingPrayer(null);
      await fetchPrayers();
    } catch (err) {
      console.error("Error updating prayer: ", err);
      throw err;
    }
  };

  const handleDeletePrayer = async (prayerIdToDelete) => {
    if (window.confirm('정말로 이 기도제목을 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, "prayerId", prayerIdToDelete));
        await fetchPrayers();
      } catch (err) {
        console.error("Error deleting prayer: ", err);
        setError('기도제목 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      // 1. Update local state for immediate UI feedback
      const oldIndex = prayers.findIndex((p) => p.id === active.id);
      const newIndex = prayers.findIndex((p) => p.id === over.id);
      const newPrayersArray = arrayMove(prayers, oldIndex, newIndex);
      setPrayers(newPrayersArray);

      // 2. Update Firestore order using batched write
      setIsSavingOrder(true);
      setError(null);
      const batch = writeBatch(db);
      newPrayersArray.forEach((prayer, index) => {
        const prayerRef = doc(db, "prayerId", prayer.id);
        batch.update(prayerRef, { order: index + 1 });
      });

      try {
        await batch.commit();
        console.log("Prayer order updated successfully in Firestore.");
        // Optional: Refetch to ensure sync, though local state is updated
        // await fetchPrayers(); 
      } catch (err) {
        console.error("Error updating prayer order: ", err);
        setError('기도제목 순서 저장 중 오류가 발생했습니다. 페이지를 새로고침 해주세요.');
        // Optionally revert local state if batch fails
        // fetchPrayers(); 
      } finally {
        setIsSavingOrder(false);
      }
    }
  };

  if (loading) return <div>Loading prayers...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>중보기도 관리</h2>
       {!showAddForm && !editingPrayer && (
         <button onClick={() => setShowAddForm(true)} style={{ marginBottom: '15px' }} disabled={isSavingOrder}>
           {isSavingOrder ? '저장 중...' : '새 기도제목 추가'}
         </button>
       )}

      {/* Add/Edit Form */} 
      {showAddForm && (
        <div style={{ border: '1px solid blue', padding: '15px', marginBottom: '15px' }}>
          <PrayerForm 
            onSubmit={handleAddPrayer} 
            onCancel={() => setShowAddForm(false)} 
          />
        </div>
      )}
      {editingPrayer && (
        <div style={{ border: '1px solid green', padding: '15px', marginBottom: '15px' }}>
          <PrayerForm 
            initialData={editingPrayer} 
            onSubmit={handleUpdatePrayer} 
            onCancel={() => setEditingPrayer(null)} 
          />
        </div>
      )}

      {/* Prayer List with Drag & Drop */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={prayers.map(p => p.id)} // Pass array of IDs
          strategy={verticalListSortingStrategy}
        >
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {prayers.map((prayer, index) => (
              <SortablePrayerItem 
                key={prayer.id} 
                id={prayer.id} 
                prayer={prayer} 
                index={index} 
                onEdit={() => { setShowAddForm(false); setEditingPrayer(prayer); }}
                onDelete={handleDeletePrayer}
                isEditingOrAdding={showAddForm || !!editingPrayer || isSavingOrder}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
       {prayers.length === 0 && !loading && <p>등록된 기도제목이 없습니다.</p>}
    </div>
  );
}

export default AdminPrayersPage; 