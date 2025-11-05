"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";

import { FaBookmark } from "react-icons/fa";
import BackButton from "../components/BackButton";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleDelete = async (id) => {
    if (!user) return;

    try {
      if (!confirm("Bu kinoni watchlistdan o‘chirmoqchimisiz?")) return;

      const movieRef = doc(db, "users", user.uid, "watchlist", id.toString());
      await deleteDoc(movieRef);
      setWatchlist((prev) => prev.filter((movie) => movie.id !== id));
    } catch (err) {
      console.error("Error deleting movie:", err);
      setError("Xatolik yuz berdi. Qayta urinib ko‘ring!");
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
    const fetchWatchlist = async () => {
      if (!user) return;
      try {
        const ref = collection(db, "users", user.uid, "watchlist");
        const snapshot = await getDocs(ref);
        setWatchlist(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching watchlist:", err);
        setError("Watchlistni yuklashda xatolik yuz berdi!");
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
    <div className="p-4 min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
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
        <p className="text-gray-400 text-lg mt-10 text-center">
          Hech qanday kino qo‘shilmagan 😔
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-2">
          {watchlist.map((movie) => (
            <div
              key={movie.id}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105"
            >
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-72 object-cover"
                />
              ) : (
                <div className="w-full h-72 bg-gray-700 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}

              <div className="p-4 space-y-2">
                <h2 className="text-lg font-bold truncate">{movie.title}</h2>
                <p className="text-gray-400 text-sm">{movie.release_date}</p>

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
