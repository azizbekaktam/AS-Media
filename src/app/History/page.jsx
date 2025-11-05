"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import BackButton from "../components/BackButton";
import { FaTrash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // 🔹 Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Real-time tarix olish
  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "users", user.uid, "history");
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const movies = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setHistory(
        movies.sort(
          (a, b) =>
            (b.watchedAt?.toDate?.()?.getTime?.() || 0) -
            (a.watchedAt?.toDate?.()?.getTime?.() || 0)
        )
      );
    });

    return () => unsubscribe();
  }, [user]);

  // 🔹 Bitta kinoni o‘chirish
  const handleDelete = async (id) => {
    if (!user) return;
    try {
      const ref = doc(db, "users", user.uid, "history", id);
      await deleteDoc(ref);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // 🔹 Barcha tarixni o‘chirish
  const handleClearAll = async () => {
    if (!user || history.length === 0) return;
    try {
      const batch = writeBatch(db);
      history.forEach((movie) => {
        const ref = doc(db, "users", user.uid, "history", movie.id);
        batch.delete(ref);
      });
      await batch.commit();
      setConfirmClear(false);
    } catch (err) {
      console.error("Clear all error:", err);
    }
  };

  if (!user)
    return (
      <main className="flex items-center justify-center min-h-screen bg-black text-white">
        <p className="text-lg">Avval login qiling! 🔑</p>
      </main>
    );

  return (
    <main className="p-6 min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
        <BackButton />
        <h1 className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
          🎬 Ko‘rilganlar Tarixi
        </h1>
        {history.length > 0 && (
          <button
            onClick={() => setConfirmClear(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2 font-semibold transition"
          >
            <FaTrash /> Clear All
          </button>
        )}
      </div>

      {/* Agar tarix bo‘sh bo‘lsa */}
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
          <p className="text-5xl mb-3">📭</p>
          <p className="text-lg">Hozircha hech qanday kino ko‘rilmagan 😔</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6 max-w-6xl mx-auto">
          {history.map((movie) => (
            <motion.div
              key={movie.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="group relative overflow-hidden rounded-2xl shadow-lg bg-white/10 backdrop-blur-lg border border-white/10 hover:scale-105 transition-transform duration-300"
            >
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "/no-image.jpg"
                }
                alt={movie.title}
                className="w-full h-72 object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(movie.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2 text-sm font-semibold"
                >
                  <FaTrash /> O‘chirish
                </button>
              </div>
              <div className="p-3 text-center">
                <h2 className="text-white font-semibold truncate">{movie.title}</h2>
                {movie.release_date && (
                  <p className="text-gray-400 text-sm">{movie.release_date.slice(0, 4)}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 🔴 Tasdiqlash modal */}
      <AnimatePresence>
        {confirmClear && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center"
            >
              <h2 className="text-xl font-semibold mb-4">
                Barcha tarixni o‘chirmoqchimisiz?
              </h2>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleClearAll}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
                >
                  Ha, o‘chir
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
                >
                  Yo‘q, bekor
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
