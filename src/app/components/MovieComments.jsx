"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  deleteDoc,
  onSnapshot,
  doc,
  serverTimestamp,
  getDoc
} from "firebase/firestore";
import { FaTrash } from "react-icons/fa";

export default function MovieComments({ movieId }) {
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const ADMIN_UID = "YOUR_ADMIN_UID"; // Admin UID
  const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

  // 🔹 Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  // 🔹 Realtime comments listener
  useEffect(() => {
    const unsubscribeList = [];

    const listenUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, "users"));
      usersSnapshot.forEach((userDoc) => {
        const commentsRef = collection(db, "users", userDoc.id, "comments");
        const q = query(commentsRef, where("movieId", "==", movieId), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const updatedComments = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            uid: userDoc.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate(),
          }));

          // Merge all comments
          setComments((prev) => {
            const others = prev.filter((c) => c.uid !== userDoc.id);
            return [...others, ...updatedComments].sort((a, b) => b.createdAt - a.createdAt);
          });
        });
        unsubscribeList.push(unsubscribe);
      });
    };

    listenUsers();

    return () => unsubscribeList.forEach((u) => u());
  }, [movieId]);

  // 🔹 Add comment
  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;
    try {
      const commentsRef = collection(db, "users", user.uid, "comments");
      await addDoc(commentsRef, {
        movieId,
        text: newComment,
        name: user.displayName || "Anonymous",
        createdAt: serverTimestamp(),
        premium: false, // Keyin premium userni true qilamiz
      });
      setNewComment("");
    } catch (err) {
      console.error("Add comment error:", err);
    }
  };

  // 🔹 Delete comment
  const handleDelete = async (comment) => {
    if (!user) return;

    const isOwner = user.uid === comment.uid;
    const isAdmin = user.uid === ADMIN_UID;
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
      const commentRef = doc(db, "users", comment.uid, "comments", comment.id);
      await deleteDoc(commentRef);
    } catch (err) {
      console.error("Delete comment error:", err);
    }
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
        {comments.length === 0 && (
          <p className="text-gray-400">Hech qanday izoh yo'q</p>
        )}

        {comments.map((c) => (
          <div
            key={c.id}
            className="p-3 rounded-lg border border-gray-700 bg-gray-900 flex justify-between items-start gap-2"
          >
            <div className="flex-1">
              <p
                className={`font-semibold ${
                  c.uid === user?.uid ? "text-yellow-400" : "text-blue-400"
                }`}
              >
                {c.name}
              </p>
              <p className="text-gray-300">{c.text}</p>
              <p className="text-gray-500 text-xs">
                {c.createdAt?.toLocaleString()}
                {c.premium && " ⭐"}
              </p>
            </div>
            {(user?.uid === c.uid || user?.uid === ADMIN_UID) && (
              <button
                onClick={() => handleDelete(c)}
                className="text-red-500 hover:text-red-600"
              >
                <FaTrash />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
