"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";

import { FaBookmark } from "react-icons/fa";
import BackButton from "../components/BackButton";
import { motion, AnimatePresence } from "framer-motion";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleDelete = async (id) => {
    if (!user) return;
    if (!confirm("Bu kinoni watchlistdan o‘chirmoqchimisiz?")) return;

    try {
      const movieRef = doc(db, "users", user.uid, "watchlist", id.toString());
      await deleteDoc(movieRef);
      setWatchlist((prev) => prev.filter((movie) => movie.id !== id));
      showToast("Movie watchlistdan o‘chirildi ✅");
    } catch (err) {
      console.error("Error deleting movie:", err);
      setError("Xatolik yuz berdi. Qayta urinib ko‘ring!");
      showToast("Xatolik yuz berdi ❌");
    }
  };

  // Auth check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch watchlist
  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!user) return;
      try {
        const ref = collection(db, "users", user.uid, "watchlist");
        const snapshot = await getDocs(ref);
        setWatchlist(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching watchlist:", err);
        setError("Watchlistni yuklashda xatolik yuz berdi!");
        showToast("Watchlist yuklanmadi ❌");
      }
    };
    fetchWatchlist();
  }, [user]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        Yuklanmoqda...
      </div>
    );

  if (!user)
    return (
      <div className="text-center mt-10 text-lg font-medium text-gray-200">
        Avval login qiling!
      </div>
    );

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 px-6 py-3 rounded-xl shadow-lg text-white font-semibold z-50 ${
              toast.includes("❌") ? "bg-red-500" : "bg-green-500"
            }`}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <BackButton />
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3 text-yellow-400 drop-shadow-lg">
        <FaBookmark /> My Watchlist
      </h1>

      {error && (
        <p className="text-red-400 mb-4 bg-red-900/20 p-2 rounded-lg shadow-inner">
          {error}
        </p>
      )}

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
          <p className="text-5xl mb-3">📭</p>
          <p className="text-lg">Hech qanday kino qo‘shilmagan 😔</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {watchlist.map((movie) => (
            <motion.div
              key={movie.id}
              layout
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-transform transform"
            >
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-80 object-cover rounded-t-2xl"
                />
              ) : (
                <div className="w-full h-80 bg-gray-700 flex items-center justify-center text-gray-400 text-lg">
                  No Image
                </div>
              )}

              <div className="p-4 flex flex-col justify-between h-44">
                <div>
                  <h2 className="text-lg font-bold truncate">{movie.title}</h2>
                  {movie.release_date && (
                    <p className="text-gray-400 text-sm">{movie.release_date.slice(0, 4)}</p>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <a
                    href={`/Movies/${movie.id}`}
                    className="flex-1 text-center px-3 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition"
                  >
                    Details
                  </a>
                  <button
                    onClick={() => handleDelete(movie.id)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-500 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
