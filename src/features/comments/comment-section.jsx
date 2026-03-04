'use client';

import { useState, useEffect } from 'react';
import { FaTrash, FaHeart, FaThumbtack, FaUserCircle, FaReply } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { commentAPI } from '../../entities/comment/api/comment-api';
import { useAuthContext } from '../authentication/auth-provider';
import { UserAvatar } from '../../entities/user/ui/user-avatar';

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

export function CommentSection({ movieId }) {
  const { user } = useAuthContext();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyInputs, setReplyInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const fetchedComments = await commentAPI.getComments(movieId);
        const sortedComments = fetchedComments.sort((a, b) => {
          // Pinned comments first
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          // Then by date
          return b.createdAt.toDate() - a.createdAt.toDate();
        });
        setComments(sortedComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [movieId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      setSubmitting(true);
      const comment = {
        text: newComment.trim(),
        uid: user.uid,
        name: user.displayName || 'Anonymous',
        email: user.email,
        createdAt: new Date(),
        likes: [],
        pinned: false,
        premium: user.plan === 'premium'
      };

      const addedComment = await commentAPI.addComment(movieId, comment);
      setComments(prev => [addedComment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (comment) => {
    if (!user || (user.uid !== comment.uid && user.role !== 'admin')) return;

    try {
      await commentAPI.deleteComment(movieId, comment.id);
      setComments(prev => prev.filter(c => c.id !== comment.id));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const toggleLike = async (comment) => {
    if (!user) return;

    try {
      await commentAPI.likeComment(comment.id, user.uid);
      setComments(prev => prev.map(c => 
        c.id === comment.id 
          ? { 
              ...c, 
              likes: c.likes?.includes(user.uid) 
                ? c.likes.filter(uid => uid !== user.uid)
                : [...(c.likes || []), user.uid]
            }
          : c
      ));
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const togglePin = async (comment) => {
    if (user?.role !== 'admin') return;
    try {
      await commentAPI.pinComment(comment.id, !comment.pinned);
      setComments(prev => prev.map(c => 
        c.id === comment.id ? { ...c, pinned: !c.pinned } : c
      ));
    } catch (error) {
      console.error('Error pinning comment:', error);
    }
  };

  const handleAddReply = async (commentId) => {
    const replyText = replyInputs[commentId];
    if (!replyText?.trim() || !user) return;

    try {
      const reply = {
        text: replyText.trim(),
        uid: user.uid,
        name: user.displayName || 'Anonymous',
        createdAt: new Date()
      };

      await commentAPI.addReply(movieId, commentId, reply);
      setReplyInputs(prev => ({ ...prev, [commentId]: '' }));
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, replies: [...(c.replies || []), reply] }
          : c
      ));
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-center py-12">
        <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      {/* Add Comment Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card mb-8"
      >
        {user ? (
          <div className="flex gap-4">
            <UserAvatar user={user} />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Izoh qoldiring..."
                className="input-primary w-full resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-white/60 text-sm">
                  {newComment.length}/500
                </span>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Yuborilmoqda...' : 'Qo\'shish'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FaUserCircle className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Izoh qoldirish uchun tizimga kiring
            </h3>
            <p className="text-white/60">
              Fikringizni boshqalar bilan ulashing
            </p>
          </div>
        )}
      </motion.div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <FaHeart className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Hozircha izohlar yo'q
            </h3>
            <p className="text-white/60">
              Birinchi izohni siz qoldiring!
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`card ${comment.pinned ? 'ring-2 ring-yellow-400/50' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <UserAvatar user={comment} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">
                          {comment.name}
                          {comment.pinned && (
                            <span className="ml-2 text-yellow-400">📌</span>
                          )}
                        </h4>
                        {comment.premium && (
                          <span className="glass px-2 py-1 rounded text-xs text-yellow-400 font-bold">
                            PRO
                          </span>
                        )}
                      </div>
                      <p className="text-white/60 text-sm">
                        {comment.email} • {comment.createdAt.toLocaleDateString('uz-UZ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleLike(comment)} 
                      className={`flex items-center gap-1 transition-all hover:scale-110 ${
                        comment.likes?.includes(user?.uid) 
                          ? 'text-red-500' 
                          : 'text-white/40 hover:text-red-400'
                      }`}
                      disabled={!user}
                    >
                      <FaHeart /> 
                      <span className="text-sm">{comment.likes?.length || 0}</span>
                    </button>
                    
                    {(user?.uid === comment.uid || user?.role === 'admin') && (
                      <button 
                        onClick={() => handleDelete(comment)} 
                        className="text-red-500 hover:text-red-400 transition-all hover:scale-110"
                      >
                        <FaTrash />
                      </button>
                    )}
                    
                    {user?.role === 'admin' && (
                      <button 
                        onClick={() => togglePin(comment)} 
                        className={`transition-all hover:scale-110 ${
                          comment.pinned 
                            ? 'text-yellow-400' 
                            : 'text-white/40 hover:text-yellow-300'
                        }`}
                      >
                        <FaThumbtack />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-white/90 mb-4 leading-relaxed">
                  {comment.text}
                </p>

                {/* Replies */}
                {(comment.replies && comment.replies.length > 0) && (
                  <div className="ml-16 space-y-3 mb-4">
                    {comment.replies.map((reply, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-sm p-3 rounded-xl"
                      >
                        <div className="flex items-start gap-2">
                          <UserAvatar user={reply} size="sm" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="text-sm font-medium text-white">
                                {reply.name}
                              </h5>
                              <span className="text-white/60 text-xs">
                                {new Date(reply.createdAt.seconds ? reply.createdAt.toDate() : reply.createdAt).toLocaleDateString('uz-UZ')}
                              </span>
                            </div>
                            <p className="text-white/80 text-sm">
                              {reply.text}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                {user && (
                  <div className="ml-16 flex gap-2">
                    <UserAvatar user={user} size="sm" />
                    <input
                      type="text"
                      value={replyInputs[comment.id] || ''}
                      onChange={(e) => setReplyInputs(prev => ({ 
                        ...prev, 
                        [comment.id]: e.target.value 
                      }))}
                      placeholder="Javob yozing..."
                      className="input-primary flex-1 text-sm"
                      maxLength={200}
                    />
                    <button
                      onClick={() => handleAddReply(comment.id)}
                      disabled={!replyInputs[comment.id]?.trim()}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2"
                    >
                      <FaReply className="text-sm" />
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
