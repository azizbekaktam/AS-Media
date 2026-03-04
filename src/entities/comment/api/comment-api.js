import { db } from '../../../../firebase';
import { collection, query, orderBy, addDoc, deleteDoc, onSnapshot, getDoc, updateDoc, serverTimestamp, limit, doc } from 'firebase/firestore';

export class CommentAPI {
  async addComment(movieId, commentData) {
    try {
      const commentsRef = collection(db, 'comments');
      await addDoc(commentsRef, {
        movieId,
        ...commentData,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async deleteComment(commentId) {
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  async updateComment(commentId, updates) {
    try {
      await updateDoc(doc(db, 'comments', commentId), updates);
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  async getComments(movieId, callback) {
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs
        .map(docSnap => {
          const data = docSnap.data();
          if (data.movieId !== movieId) return null;
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          };
        })
        .filter(Boolean);

      // Sort pinned comments to top
      comments.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.createdAt - a.createdAt);
      
      callback(comments);
    });

    return unsubscribe;
  }

  async getRecentComments(limitCount = 50) {
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'), limit(limitCount));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    }));
  }

  async likeComment(commentId, userId) {
    try {
      const commentRef = doc(db, 'comments', commentId);
      const commentSnap = await getDoc(commentRef);
      
      if (commentSnap.exists()) {
        const likes = commentSnap.data().likes || [];
        const newLikes = likes.includes(userId)
          ? likes.filter(uid => uid !== userId)
          : [...likes, userId];
        
        await updateDoc(commentRef, { likes: newLikes });
        return newLikes;
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
  }

  async pinComment(commentId, pinned) {
    try {
      await updateDoc(doc(db, 'comments', commentId), { pinned });
    } catch (error) {
      console.error('Error pinning comment:', error);
      throw error;
    }
  }
}

export const commentAPI = new CommentAPI();
