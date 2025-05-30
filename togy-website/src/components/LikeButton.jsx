import React, { useState, useEffect } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path as needed

// Accept collectionName prop, default to 'postId' for backward compatibility (optional)
function LikeButton({ postId, initialLikeCount, collectionName = 'postId' }) {
  const [likeCount, setLikeCount] = useState(initialLikeCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use postId and collectionName in the key for uniqueness
  const localStorageKey = `liked_${collectionName}_${postId}`;

  useEffect(() => {
    const likedStatus = localStorage.getItem(localStorageKey);
    setIsLiked(likedStatus === 'true');
    // Ensure likeCount reflects the initial prop value when component mounts/prop changes
    setLikeCount(initialLikeCount || 0); 
  }, [localStorageKey, initialLikeCount]); 

  const handleLike = async () => {
    if (loading) return; // Prevent action while processing

    setLoading(true);
    const postRef = doc(db, collectionName, postId);
    const incrementValue = isLiked ? -1 : 1; // Decrement if already liked, else increment
    const newLikedState = !isLiked;

    // Optimistic UI update
    setIsLiked(newLikedState);
    setLikeCount(prevCount => prevCount + incrementValue);
    if (newLikedState) {
        localStorage.setItem(localStorageKey, 'true');
    } else {
        localStorage.removeItem(localStorageKey);
    }

    try {
      // Update Firestore
      await updateDoc(postRef, {
        likeCount: increment(incrementValue)
      });
      // Firestore update successful
    } catch (error) {
      console.error("Error updating like count: ", error);
      // Revert UI changes if Firestore update fails
      setIsLiked(!newLikedState);
      setLikeCount(prevCount => prevCount - incrementValue); 
      if (!newLikedState) {
        localStorage.setItem(localStorageKey, 'true'); // Put it back
      } else {
          localStorage.removeItem(localStorageKey);
      }
      // Optionally show an error message to the user
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle = {
    background: 'none',
    border: 'none',
    cursor: loading ? 'default' : 'pointer', // Change cursor while loading
    padding: '5px',
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '1em',
    color: isLiked ? 'red' : '#555' // Red if liked
  };

  return (
    <button onClick={handleLike} disabled={loading} style={buttonStyle}>
      {isLiked ? '❤️' : '♡'} {/* Filled heart if liked */} 
      <span style={{ marginLeft: '5px' }}>{likeCount}</span>
    </button>
  );
}

export default LikeButton; 