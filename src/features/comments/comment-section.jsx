import { useState, useEffect } from 'react';
import { FaTrash, FaHeart, FaThumbtack, FaUserCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { commentAPI } from '../../entities/comment/api/comment-api';
import { useAuthContext } from '../authentication/auth-provider';
import { UserAvatar } from '../../entities/user/ui/user-avatar';
import { GlassCard } from '../../shared/ui/glass-card';

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

export function CommentSection({ movieId }) {
  const { user } = useAuthContext();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyInputs, setReplyInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!movieId) return;

    const unsubscribe = commentAPI.getComments(movieId, setComments);
    setLoading(false);

    return () => unsubscribe();
  }, [movieId]);

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) {
      if (!user) {
        alert('Izoh qoldirish uchun avval tizimga kiring!');
        return;
      }
      return;
    }

    try {
      setSubmitting(true);
      await commentAPI.addComment(movieId, {
        text: newComment.trim(),
        name: user.name || user.email.split('@')[0],
        uid: user.uid,
        email: user.email,
        photoURL: user.photoURL,
        premium: user.plan === 'premium',
        likes: [],
        pinned: false,
        replies: [],
      });
      setNewComment('');
    } catch (err) {
      console.error('Add comment error:', err);
      alert('Izoh qoldirishda xatolik yuz berdi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async (commentId) => {
    if (!user || !replyInputs[commentId]?.trim()) {
      if (!user) {
        alert('Javob yozish uchun avval tizimga kiring!');
        return;
      }
      return;
    }

    try {
      const comment = comments.find(c => c.id === commentId);
      const replyData = {
        uid: user.uid,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        photoURL: user.photoURL,
        text: replyInputs[commentId].trim(),
        createdAt: new Date(),
      };
      
      await commentAPI.updateComment(commentId, {
        replies: [...(comment?.replies || []), replyData],
      });
      setReplyInputs(prev => ({ ...prev, [commentId]: '' }));
    } catch (err) {
      console.error('Add reply error:', err);
      alert('Javob yozishda xatolik yuz berdi.');
    }
  };

  const handleDelete = async (comment) => {
    if (!user) return;

    const isOwner = user.uid === comment.uid;
    const isAdmin = user.role === 'admin';
    const now = new Date();

    if (!isOwner && !isAdmin) {
      alert('Faqat admin yoki siz o\'chira olasiz!');
      return;
    }
    
    if (isOwner && !comment.premium && now - comment.createdAt > FIVE_DAYS_MS && !isAdmin) {
      alert('Foydalanuvchi 5 kundan oshgan izohni o\'chira olmaydi!');
      return;
    }

    try {
      await commentAPI.deleteComment(comment.id);
    } catch (err) {
      console.error('Delete comment error:', err);
      alert('O\'chirishda xato!');
    }
  };

  const toggleLike = async (comment) => {
    if (!user) {
      alert('Like qo\'shish uchun avval tizimga kiring!');
      return;
    }

    try {
      await commentAPI.likeComment(comment.id, user.uid);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const togglePin = async (comment) => {
    if (user?.role !== 'admin') return;
    try {
      await commentAPI.pinComment(comment.id, !comment.pinned);
    } catch (err) {
      console.error('Pin error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mt-6 max-w-3xl mx-auto">
      <GlassCard className="p-4 mb-6">
        {user ? (
          <div className="flex gap-3">
            <UserAvatar user={user} />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Izoh qoldiring..."
                className="w-full p-3 rounded-lg bg-neutral-800/50 border border-neutral-700 text-white placeholder-neutral-400 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-neutral-400">{newComment.length}/500</span>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submitting}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {submitting ? 'Yuborilmoqda...' : 'Qo\'shish'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <FaUserCircle className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
            <p className="text-neutral-400 mb-3">Izoh qoldirish uchun avval tizimga kiring</p>
          </div>
        )}
      </GlassCard>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">
            <FaHeart className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Hozircha izohlar yo'q. Birinchi izohni siz qoldiring!</p>
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-4 ${c.pinned ? 'border-yellow-400/50' : ''}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3">
                    <UserAvatar user={c} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">
                          {c.name} {c.pinned && '📌'}
                        </p>
                        {c.premium && <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded-full font-semibold">PRO</span>}
                      </div>
                      <p className="text-xs text-neutral-400">
                        {c.email} • {c.createdAt.toLocaleString('uz-UZ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleLike(c)} 
                      className={`flex items-center gap-1 transition-all hover:scale-110 ${
                        c.likes?.includes(user?.uid) ? 'text-red-500' : 'text-neutral-400 hover:text-red-400'
                      }`}
                      disabled={!user}
                    >
                      <FaHeart /> {c.likes?.length || 0}
                    </button>
                    {(user?.uid === c.uid || user?.role === 'admin') && (
                      <button 
                        onClick={() => handleDelete(c)} 
                        className="text-red-500 hover:text-red-400 transition-all hover:scale-110"
                      >
                        <FaTrash />
                      </button>
                    )}
                    {user?.role === 'admin' && (
                      <button 
                        onClick={() => togglePin(c)} 
                        className={`transition-all hover:scale-110 ${
                          c.pinned ? 'text-yellow-400' : 'text-neutral-400 hover:text-yellow-300'
                        }`}
                      >
                        <FaThumbtack />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-neutral-200 mb-3 leading-relaxed">{c.text}</p>

                {(c.replies && c.replies.length > 0) && (
                  <div className="ml-12 space-y-2 mb-3">
                    {c.replies.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-neutral-800/30 rounded-lg">
                        <UserAvatar user={r} size="sm" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white">{r.name}</p>
                            <p className="text-xs text-neutral-400">
                              {new Date(r.createdAt.seconds ? r.createdAt.toDate() : r.createdAt).toLocaleDateString('uz-UZ')}
                            </p>
                          </div>
                          <p className="text-sm text-neutral-300">{r.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {user && (
                  <div className="ml-12 flex gap-2">
                    <UserAvatar user={user} size="sm" />
                    <input
                      type="text"
                      value={replyInputs[c.id] || ''}
                      onChange={(e) => setReplyInputs(prev => ({ ...prev, [c.id]: e.target.value }))}
                      placeholder="Javob yozing..."
                      className="flex-1 p-2 rounded-lg bg-neutral-800/50 border border-neutral-700 text-white placeholder-neutral-400 text-sm focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all"
                      maxLength={200}
                    />
                    <button
                      onClick={() => handleAddReply(c.id)}
                      disabled={!replyInputs[c.id]?.trim()}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Javob
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
