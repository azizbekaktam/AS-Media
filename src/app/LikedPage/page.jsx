"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { auth, db } from "../../../firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { FaRegHeart } from "react-icons/fa";
import { HiOutlineTrash } from "react-icons/hi";
import BackButton from "../components/BackButton";

export default function LikesPage() {
  const [likes, setLikes] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [toast, setToast] = useState("");

  // 🔹 Auth check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Fetch liked movies
  useEffect(() => {
    const fetchLikes = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const ref = collection(db, "users", user.uid, "likes");
        const snapshot = await getDocs(ref);
        setLikes(snapshot.docs.map((doc) => doc.data()));
      } catch (err) {
        console.error("Fetch likes error:", err);
        showToast("Liked movies yuklanmadi ❌");
      } finally {
        setLoading(false);
      }
    };
    fetchLikes();
  }, [user]);

  // 🔹 Delete movie
  const handleDelete = async (id) => {
    if (!user) return;
    try {
      const movieRef = doc(db, "users", user.uid, "likes", id.toString());
      await deleteDoc(movieRef);
      setLikes((prev) => prev.filter((m) => m.id !== id));
      setConfirmDelete(null);
      showToast("Movie o‘chirildi ✅");
    } catch (err) {
      console.error("Delete error:", err);
      showToast("O‘chirishda xato ❌");
    }
  };

  // 🔹 Toast helper
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // 🔹 ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setConfirmDelete(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white text-lg">
        Yuklanmoqda...
      </div>
    );

  if (!user)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-black text-white">
        <p className="text-lg mb-4">Avval login qiling!</p>
      </div>
    );

  // 🔹 Filtered likes
  const filteredLikes = likes.filter((m) => {
    const q = search.toLowerCase();
    const matchTitle = m.title.toLowerCase().includes(q);
    const matchGenre =
      genreFilter === "all" ||
      (m.genre_ids && m.genre_ids.includes(parseInt(genreFilter)));
    return matchTitle && matchGenre;
  });

  // 🔹 Genre options
  const genres = [
    { id: "all", name: "All" },
    { id: "16", name: "Animation" },
    { id: "28", name: "Action" },
    { id: "35", name: "Comedy" },
    { id: "12", name: "Adventure" },
    { id: "10751", name: "Family" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-6">
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

      {/* Header */}
      <div className="flex items-center justify-between mb-6 max-w-6xl mx-auto">
        <BackButton />
        <h1 className="text-3xl font-extrabold flex items-center gap-3 text-red-500">
          <FaRegHeart className="text-red-400" /> My Liked Movies
        </h1>
      </div>

      {/* Search & Genre Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center max-w-6xl mx-auto">
        <input
          type="text"
          placeholder="🔍 Search by title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3 rounded-xl w-full sm:w-1/2 bg-gray-800 border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
        />
        <div className="flex gap-2 flex-wrap justify-center">
          {genres.map((g) => (
            <button
              key={g.id}
              onClick={() => setGenreFilter(g.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                genreFilter === g.id
                  ? "bg-red-500 text-black shadow-lg"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Likes Grid */}
      {likes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
          <FaRegHeart className="text-6xl text-gray-600 mb-4" />
          <p className="text-lg">Hech qanday liked movies yo‘q 😢</p>
        </div>
      ) : filteredLikes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
          <FaRegHeart className="text-6xl text-gray-600 mb-4" />
          <p className="text-lg">Qidiruv bo‘yicha hech narsa topilmadi 😐</p>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={filteredLikes}
          onReorder={setLikes}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-6xl mx-auto"
        >
          <AnimatePresence>
            {filteredLikes.map((movie) => (
              <Reorder.Item key={movie.id} value={movie}>
                <motion.div
                  layout
                  whileHover={{ scale: 1.05 }}
                  className="relative bg-gradient-to-t from-gray-900/80 to-transparent rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : "/fallback-poster.png"
                    }
                    alt={movie.title}
                    className="w-full h-72 object-cover rounded-t-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <h2 className="font-bold text-white text-lg truncate">{movie.title}</h2>
                    <p className="text-gray-300 text-sm">{movie.release_date}</p>
                    <div className="flex gap-2 mt-2">
                      <a
                        href={`/Movies/${movie.id}`}
                        className="flex-1 bg-red-500/90 hover:bg-red-600 text-white text-center py-1.5 rounded-lg font-medium transition shadow-md hover:shadow-red-500/40"
                      >
                        Details
                      </a>
                      <button
                        onClick={() => setConfirmDelete(movie.id)}
                        className="p-2 bg-gray-700/60 hover:bg-gray-800 text-white rounded-lg transition"
                      >
                        <HiOutlineTrash size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900/90 backdrop-blur-lg p-6 rounded-2xl border border-gray-700 shadow-2xl text-center"
            >
              <h2 className="text-xl font-bold mb-4 text-white">Rostdan o‘chirmoqchimisiz?</h2>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
                >
                  Ha, o‘chir
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg transition"
                >
                  Bekor
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
