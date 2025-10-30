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

  // 🔹 Filmni o‘chirish funksiyasi
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

  // 🔹 Auth tekshirish
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Watchlist’ni olish
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

  // 🔹 Yuklanish holati
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">

      </div>
    );

  // 🔹 Login bo‘lmagan holatda
  if (!user)
    return (
      <div className="text-center mt-10 text-lg font-medium">
        Avval login qiling!
      </div>
    );

  return (
    <div className="p-4">
      <BackButton />
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaBookmark className="text-blue-600" /> My Watchlist
      </h1>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      {watchlist.length === 0 ? (
        <p className="text-gray-600 text-lg mt-10 text-center">
          Hech qanday kino qo‘shilmagan 😔
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
          {watchlist.map((movie) => (
            <div
              key={movie.id}
              className="bg-white shadow-md rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300"
            >
              {movie.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-72 object-cover"
                />
              )}

              <div className="p-4">
                <h2 className="text-lg font-bold mb-1 truncate">{movie.title}</h2>
                <p className="text-gray-500 mb-3">{movie.release_date}</p>

                <div className="flex justify-between">
                  <a
                    href={`/Movies/${movie.id}`}
                    className="flex-1 text-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Details
                  </a>
                  <button
                    onClick={() => handleDelete(movie.id)}
                    className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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
