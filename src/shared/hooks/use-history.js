'use client';

import { db } from '../../../firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';

export function useHistory() {
  const addToHistory = async (user, content, type) => {
    if (!user || !content) return;
    
    try {
      const historyRef = collection(db, 'users', user.uid, 'history');
      await addDoc(historyRef, {
        movieId: content.id,
        title: content.title,
        poster: content.poster_path,
        type,
        watchedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  };

  const addToHistoryWithDocId = async (user, content, type) => {
    if (!user || !content) return;
    
    try {
      const ref = doc(db, 'users', user.uid, 'history', String(content.id));
      await setDoc(ref, {
        id: content.id,
        title: content.title,
        poster_path: content.poster_path,
        release_date: content.release_date,
        viewedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error adding to history with doc ID:', error);
    }
  };

  return { addToHistory, addToHistoryWithDocId };
}
