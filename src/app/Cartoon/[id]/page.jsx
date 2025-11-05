"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BackButton from "@/app/components/BackButton";
import LikeButton from "@/app/components/LikeButton";
import WatchlistButton from "@/app/components/Watchlist";
import { FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import { db } from "../../../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CartoonDetail({ token }) {
  const { id } = useParams();
  const [cartoon, setCartoon] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch cartoon & trailer
  useEffect(() => {
    async function fetchCartoon() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_Project_TmdApi_Api}/movie/${id}?api_key=${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Key}&language=en-US`
        );
        const data = await res.json();
        setCartoon({ ...data, type: "multfilm" });

        // 🔹 Save to history
        if (token && data) {
          const historyRef = collection(db, "users", token, "history");
          await addDoc(historyRef, {
            movieId: id,
            title: data.title,
            poster: data.poster_path,
            type: "multfilm",
            watchedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error("Error fetching cartoon:", error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchTrailer() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_Project_TmdApi_Api}/movie/${id}/videos?api_key=${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Key}&language=en-US`
        );
        const data = await res.json();
        const trailer = data.results.find(
          (vid) => vid.type === "Trailer" && vid.site === "YouTube"
        );
        setTrailerKey(trailer?.key || null);
      } catch (error) {
        console.error("Error fetching trailer:", error);
      }
    }

    if (id) {
      fetchCartoon();
      fetchTrailer();
    }
  }, [id, token]);

  if (loading || !cartoon)
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-white">
        <div className="text-red-500 text-lg animate-pulse">Yuklanmoqda...</div>
      </div>
    );

  const { poster_path, title, release_date, vote_average, overview } = cartoon;

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white px-4 sm:px-6 lg:px-10 py-10">
      <div className="max-w-6xl mx-auto">
        <BackButton />

        {/* Cartoon info */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row gap-10 mt-10"
        >
          {/* Poster */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-full md:w-[320px] lg:w-[360px] overflow-hidden rounded-2xl shadow-lg bg-neutral-900"
          >
            <img
              src={poster_path ? `${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Img}/t/p/w500${poster_path}` : "/fallback-poster.png"}
              alt={title || "Cartoon Poster"}
              className="w-full h-[400px] sm:h-[480px] lg:h-[520px] object-cover rounded-2xl"
            />
          </motion.div>

          {/* Details */}
          <div className="flex-1 bg-neutral-900/70 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-md hover:shadow-xl transition-shadow duration-300 space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-red-500">{title}</h1>
            <p className="text-gray-400 text-lg">{release_date || "N/A"}</p>
            <p className="text-gray-200 leading-relaxed">{overview || "Overview mavjud emas."}</p>

            <div className="flex items-center gap-2 text-red-500 font-semibold text-lg sm:text-xl">
              <FaStar /> {vote_average?.toFixed(1) || "0.0"} / 10
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              <LikeButton movie={cartoon} token={token} />
              <WatchlistButton movie={cartoon} />
            </div>
          </div>
        </motion.div>

        {/* Trailer */}
        {trailerKey && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mt-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-red-500 flex items-center gap-2">
              🎬 Trailer
            </h2>
            <div className="rounded-xl overflow-hidden shadow-xl border border-white/10">
              <iframe
                src={`${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Trailer}/embed/${trailerKey}`}
                title="YouTube trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-[400px] sm:h-[450px] lg:h-[500px]"
              ></iframe>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
