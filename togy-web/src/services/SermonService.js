import { db } from '../firebase/config';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    increment,
    startAfter,
    where
} from 'firebase/firestore';

const COLLECTION_NAME = 'sermons';

export const SermonService = {
    // Create
    createSermon: async (sermonData) => {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...sermonData,
                viewCount: 0,
                createdAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error creating sermon:", error);
            throw error;
        }
    },

    // Read (List with options)
    getSermons: async (lastDoc = null, itemsPerPage = 10, filterType = null, dateFilter = null) => {
        try {
            let q = collection(db, COLLECTION_NAME);
            let constraints = [];

            // 1. Basic Filters
            if (filterType && filterType !== '전체') {
                constraints.push(where('serviceType', '==', filterType));
            }

            if (dateFilter) {
                constraints.push(where('date', '==', dateFilter));
            }

            // 2. Sorting
            // If filtering by date, we don't need to sort by date (it's all the same date)
            // We sort by createdAt to show latest uploaded for that date
            if (dateFilter) {
                constraints.push(orderBy('createdAt', 'desc'));
            } else {
                // Default sort
                constraints.push(orderBy('date', 'desc'));
                constraints.push(orderBy('createdAt', 'desc'));
            }

            // 3. Pagination & Limit
            if (lastDoc) {
                constraints.push(startAfter(lastDoc));
            }
            constraints.push(limit(itemsPerPage));

            const qFinal = query(q, ...constraints);

            const snapshot = await getDocs(qFinal);
            const sermons = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return {
                sermons,
                lastDoc: snapshot.docs[snapshot.docs.length - 1],
                hasMore: snapshot.docs.length === itemsPerPage
            };
        } catch (error) {
            console.error("Error getting sermons:", error);
            throw error;
        }
    },

    // Update
    updateSermon: async (id, sermonData) => {
        try {
            const sermonRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(sermonRef, {
                ...sermonData,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error updating sermon:", error);
            throw error;
        }
    },

    // Delete
    deleteSermon: async (id) => {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
        } catch (error) {
            console.error("Error deleting sermon:", error);
            throw error;
        }
    },

    // Increment View Count
    incrementViewCount: async (id) => {
        try {
            const sermonRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(sermonRef, {
                viewCount: increment(1)
            });
        } catch (error) {
            console.error("Error incrementing view count:", error);
            // Fail silently for view counts
        }
    }
};
