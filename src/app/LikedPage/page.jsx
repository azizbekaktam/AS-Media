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
      const ref = collection(db, "users", user.uid, "likes");
      const snapshot = await getDocs(ref);
      setLikes(snapshot.docs.map((doc) => doc.data()));
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
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

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

  // 🔹 Genre options (example genres)
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
      <div className="flex items-center justify-between mb-6">
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
          className="p-3 rounded-xl w-full sm:w-1/2 bg-gray-800 border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
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

      {/* Grid with Drag & Drop */}
      {filteredLikes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-[60vh] text-gray-400"
        >
          <FaRegHeart className="text-6xl text-gray-600 mb-4" />
          <p className="text-lg">No liked movies found 😢</p>
        </motion.div>
      ) : (
        <Reorder.Group
          axis="y"
          values={filteredLikes}
          onReorder={setLikes}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          <AnimatePresence>
            {filteredLikes.map((movie) => (
              <Reorder.Item key={movie.id} value={movie}>
                <motion.div
                  layout
                  whileHover={{ scale: 1.03 }}
                  className="relative bg-white/5 hover:bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-lg hover:shadow-red-500/30 border border-white/10 transition-all duration-300"
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

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl text-center"
          >
            <h2 className="text-xl font-semibold mb-4">
              Rostdan o‘chirmoqchimisiz?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
              >
                Ha, o‘chir
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
              >
                Yo‘q, bekor
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
