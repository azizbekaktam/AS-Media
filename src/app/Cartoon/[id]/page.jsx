"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BackButton from "@/app/components/BackButton";

import LikeButton from "@/app/components/LikeButton";
import WatchlistButton from "@/app/components/Watchlist";
import { db } from "../../../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FaStar } from "react-icons/fa";
import { motion } from "framer-motion";

export default function CartoonDetail({ token }) {
  const { id } = useParams();
  const [cartoon, setCartoon] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch movie & trailer
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
        setTrailerKey(trailer ? trailer.key : null);
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
      <div className="flex justify-center mt-20">

      </div>
    );

  const { poster_path, title, release_date, vote_average, overview } = cartoon;

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-100 via-white to-yellow-50 text-gray-900 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <BackButton />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row gap-10 mt-10"
        >
          {/* Poster */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-full md:w-[320px] overflow-hidden rounded-2xl shadow-lg bg-white"
          >
            <img
              src={`${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Img}${poster_path}`}
              alt={title}
              className="w-full h-[480px] object-cover"
            />
          </motion.div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
              <p className="text-gray-500 text-lg mt-1">{release_date}</p>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed">{overview}</p>

            <div className="flex items-center gap-3 text-xl font-semibold">
              <FaStar className="text-yellow-500" />
              <span>{vote_average?.toFixed(1)} / 10</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4">
              <LikeButton movie={cartoon} />
              <WatchlistButton movie={cartoon} />
            </div>
          </div>
        </motion.div>

        {/* Trailer */}
        {trailerKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="mt-14"
          >
            <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
              🎬 Trailer
            </h2>
            <div className="rounded-xl overflow-hidden shadow-xl border border-gray-200">
              <iframe
                src={`${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Trailer}/embed/${trailerKey}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-[450px]"
              ></iframe>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
