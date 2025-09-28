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

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);

  // 🔹 Userni kuzatish
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Real-time history olish
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
            (b.watchedAt?.toDate?.() || 0) -
            (a.watchedAt?.toDate?.() || 0)
        )
      );
    });

    return () => unsubscribe();
  }, [user]);

  // 🔹 Bitta o‘chirish
  const handleDelete = async (id) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "history", id);
    await deleteDoc(ref);
  };

  // 🔹 Hammasini o‘chirish
  const handleClearAll = async () => {
    if (!user || history.length === 0) return;
    if (!confirm("Barcha tarixni o‘chirishni xohlaysizmi?")) return;

    const batch = writeBatch(db);
    history.forEach((movie) => {
      const ref = doc(db, "users", user.uid, "history", movie.id);
      batch.delete(ref);
    });

    await batch.commit();
  };

  if (!user)
    return (
      <main className="p-6">
        <p className="text-center text-gray-600 dark:text-gray-300">
          Avval login qiling! 🔑
        </p>
      </main>
    );

  return (
    <main className="p-6 bg-gray-50 dark:bg-black min-h-screen">
      <BackButton />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          📺 Ko‘rilganlar Tarixi
        </h1>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
          >
            <FaTrash /> Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Hozircha hech qanday kino ko‘rilmagan 😔
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {history.map((movie) => (
            <div
              key={movie.id}
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-transform hover:scale-105"
            >
              {movie.poster && (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster}`}
                  alt={movie.title}
                  className="w-full h-72 object-cover rounded-2xl"
                />
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(movie.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg flex items-center gap-2"
                >
                  <FaTrash /> O‘chirish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
