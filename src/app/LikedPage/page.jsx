"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../../../firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { FaRegHeart } from "react-icons/fa";
import BackButton from "../components/BackButton";
import { HiOutlineTrash } from "react-icons/hi";

export default function LikesPage() {
  const [likes, setLikes] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // 🔥 Delete function (frontend + firestore)
  const handleDelete = async (id) => {
    if (!user) return;

    try {
      const movieRef = doc(db, "users", user.uid, "likes", id.toString());
      await deleteDoc(movieRef);
      setLikes((prevLikes) => prevLikes.filter((movie) => movie.id !== id));
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLikes = async () => {
      if (!user) return;
      const ref = collection(db, "users", user.uid, "likes");
      const snapshot = await getDocs(ref);
      setLikes(snapshot.docs.map((doc) => doc.data()));
    };
    fetchLikes();
  }, [user]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">

      </div>
    );

  if (!user)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-black">
        <p className="text-lg mb-4">Avval login qiling!</p>
      </div>
    );

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <BackButton />
        <h1 className="text-3xl font-bold flex items-center gap-2 text-yellow-400">
          <FaRegHeart className="text-red-500" /> Liked Movies
        </h1>
      </div>

      {likes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center text-gray-400">
          <FaRegHeart className="text-6xl text-gray-600 mb-4" />
          <p className="text-lg">Hech qanday like qilingan kino yo‘q 😢</p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          <AnimatePresence>
            {likes.map((movie) => (
              <motion.div
                key={movie.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/10"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-72 object-cover rounded-t-2xl"
                />

                <div className="p-4 flex flex-col justify-between h-32">
                  <div>
                    <h2 className="font-semibold text-white truncate">
                      {movie.title}
                    </h2>
                    <p className="text-gray-400 text-sm">{movie.release_date}</p>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <a
                      href={`/Movies/${movie.id}`}
                      className="flex-1 bg-yellow-400 text-black text-center py-1.5 rounded-lg font-medium hover:bg-yellow-300 transition"
                    >
                      Details
                    </a>
                    <button
                      onClick={() => setConfirmDelete(movie.id)}
                      className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition"
                    >
                      <HiOutlineTrash size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* 🗑 Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-white/10 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Rostdan o‘chirmoqchimisiz?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
              >
                Ha, o‘chir
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg"
              >
                Yo‘q, bekor
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
