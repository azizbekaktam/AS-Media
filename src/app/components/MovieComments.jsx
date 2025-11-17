"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase";
import {
  collection,
  query,
  orderBy,
  addDoc,
  deleteDoc,
  onSnapshot,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { FaTrash, FaHeart, FaThumbtack } from "react-icons/fa";

export default function MovieComments({ movieId }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyInputs, setReplyInputs] = useState({}); // key: commentId -> reply text

  const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

  // 🔹 Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const docSnap = await getDoc(doc(db, "users", u.uid));
        setUserData(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Real-time comments
  useEffect(() => {
    const commentsRef = collection(db, "comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedComments = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          if (data.movieId !== movieId) return null;
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          };
        })
        .filter(Boolean);

      // pinned commentlarni tepaga chiqarish
      updatedComments.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.createdAt - a.createdAt);
      setComments(updatedComments);
    });

    return () => unsubscribe();
  }, [movieId]);

  // 🔹 Add comment
  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      const commentsRef = collection(db, "comments");
      await addDoc(commentsRef, {
        movieId,
        text: newComment,
        name: user.displayName || "Anonymous",
        uid: user.uid,
        createdAt: serverTimestamp(),
        premium: userData?.plan === "premium",
        likes: [],
        pinned: false,
        replies: [],
      });
      setNewComment("");
    } catch (err) {
      console.error("Add comment error:", err);
    }
  };

  // 🔹 Add reply
  const handleAddReply = async (commentId) => {
    if (!user || !replyInputs[commentId]?.trim()) return;

    try {
      const commentRef = doc(db, "comments", commentId);
      await updateDoc(commentRef, {
        replies: [
          ...(comments.find(c => c.id === commentId)?.replies || []),
          {
            uid: user.uid,
            name: user.displayName || "Anonymous",
            text: replyInputs[commentId],
            createdAt: new Date(),
          },
        ],
      });
      setReplyInputs(prev => ({ ...prev, [commentId]: "" }));
    } catch (err) {
      console.error("Add reply error:", err);
    }
  };

  // 🔹 Delete comment
  const handleDelete = async (comment) => {
    if (!user || !userData) return;

    const isOwner = user.uid === comment.uid;
    const isAdmin = userData.role === "admin";
    const now = new Date();

    if (!isOwner && !isAdmin) return alert("Faqat admin yoki siz o'chira olasiz!");
    if (
      isOwner &&
      !comment.premium &&
      now - comment.createdAt > FIVE_DAYS_MS &&
      !isAdmin
    )
      return alert("Foydalanuvchi 5 kundan oshgan izohni o'chira olmaydi!");

    try {
      const commentRef = doc(db, "comments", comment.id);
      await deleteDoc(commentRef);
    } catch (err) {
      console.error("Delete comment error:", err);
    }
  };

  // 🔹 Like/unlike comment
  const toggleLike = async (comment) => {
    if (!user) return;

    const commentRef = doc(db, "comments", comment.id);
    const likes = comment.likes || [];
    const newLikes = likes.includes(user.uid)
      ? likes.filter(uid => uid !== user.uid)
      : [...likes, user.uid];

    await updateDoc(commentRef, { likes: newLikes });
  };

  // 🔹 Pin/unpin comment (admin only)
  const togglePin = async (comment) => {
    if (!userData || userData.role !== "admin") return;
    const commentRef = doc(db, "comments", comment.id);
    await updateDoc(commentRef, { pinned: !comment.pinned });
  };

  // 🔹 Random color for users
  const getUserColor = (uid) => {
    const colors = ["text-red-400", "text-blue-400", "text-green-400", "text-yellow-400", "text-pink-400"];
    let hash = 0;
    for (let i = 0; i < uid.length; i++) hash = uid.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="mt-6 max-w-3xl mx-auto">
      {/* Add comment */}
      {user && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Izoh qoldiring..."
            className="flex-1 p-2 rounded-lg border border-gray-600 bg-gray-800 text-white"
          />
          <button
            onClick={handleAddComment}
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition"
          >
            Qo'shish
          </button>
        </div>
      )}

      {/* Comments list */}
      <div className="flex flex-col gap-3">
        {comments.length === 0 && <p className="text-gray-400">Hech qanday izoh yo'q</p>}

        {comments.map((c) => (
          <div
            key={c.id}
            className={`p-3 rounded-lg border border-gray-700 bg-gray-900 flex flex-col gap-2 ${c.pinned ? "border-yellow-500" : ""}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className={`font-semibold ${getUserColor(c.uid)}`}>
                  {c.name} {c.pinned && "📌"}
                </p>
                <p className="text-gray-300">{c.text}</p>
                <p className="text-gray-500 text-xs">
                  {c.createdAt.toLocaleString()} {c.premium && "⭐"}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleLike(c)} className={`flex items-center gap-1 ${c.likes?.includes(user?.uid) ? "text-red-500" : "text-gray-400"}`}>
                  <FaHeart /> {c.likes?.length || 0}
                </button>
                {(user?.uid === c.uid || userData?.role === "admin") && (
                  <button onClick={() => handleDelete(c)} className="text-red-500 hover:text-red-600">
                    <FaTrash />
                  </button>
                )}
                {userData?.role === "admin" && (
                  <button onClick={() => togglePin(c)} className="text-yellow-400 hover:text-yellow-300">
                    <FaThumbtack />
                  </button>
                )}
              </div>
            </div>

            {/* Replies */}
            <div className="ml-4 flex flex-col gap-1">
              {(c.replies || []).map((r, i) => (
                <div key={i} className="flex justify-between items-center">
                  <p className={`text-sm ${getUserColor(r.uid)}`}>
                    {r.name}: {r.text}
                  </p>
                  <p className="text-gray-500 text-xs">{new Date(r.createdAt.seconds ? r.createdAt.toDate() : r.createdAt).toLocaleString()}</p>
                </div>
              ))}

              {user && (
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={replyInputs[c.id] || ""}
                    onChange={(e) => setReplyInputs(prev => ({ ...prev, [c.id]: e.target.value }))}
                    placeholder="Reply yozing..."
                    className="flex-1 p-1 rounded-lg border border-gray-600 bg-gray-800 text-white text-sm"
                  />
                  <button
                    onClick={() => handleAddReply(c.id)}
                    className="px-2 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-400 transition"
                  >
                    Javob
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
