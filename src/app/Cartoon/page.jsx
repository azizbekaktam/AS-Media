"use client";

import { motion } from "framer-motion";
import BackButton from "@/app/components/BackButton";
import LikeButton from "@/app/components/LikeButton";
import WatchlistButton from "@/app/components/Watchlist";
import axios from "axios";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { auth, db } from "../../../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function CartoonDetail({ token }) {
  const { id } = useParams();
  const [cartoon, setCartoon] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [user, setUser] = useState(null);

  // User auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  // Fetch cartoon data
  useEffect(() => {
    const fetchCartoon = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_Project_TmdApi_Api}/movie/${id}?api_key=${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Key}&language=en-US`
        );
        const cartoonData = { ...data, type: "cartoon" };
        setCartoon(cartoonData);

        // Save to history
        if (user) {
          const ref = doc(db, "users", user.uid, "history", String(cartoonData.id));
          await setDoc(ref, {
            id: cartoonData.id,
            title: cartoonData.title,
            poster_path: cartoonData.poster_path,
            release_date: cartoonData.release_date,
            viewedAt: new Date().toISOString(),
          });
        }

        // Fetch trailer
        const videoRes = await axios.get(
          `${process.env.NEXT_PUBLIC_Project_TmdApi_Api}/movie/${id}/videos?api_key=${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Key}&language=en-US`
        );
        const foundTrailer = videoRes.data.results.find(
          (vid) => vid.type === "Trailer" && vid.site === "YouTube"
        );
        setTrailer(foundTrailer);
      } catch (err) {
        console.error("API xatolik:", err);
      }
    };

    if (id) fetchCartoon();
  }, [id, user]);

  if (!cartoon)
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
          <div className="flex-1 bg-neutral-900/70 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-md hover:shadow-xl transition-shadow duration-300">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-red-500 mb-2">{title}</h1>
            <p className="text-gray-400 mb-3">{release_date || "N/A"}</p>
            <p className="text-gray-200 leading-relaxed mb-4">{overview || "Overview mavjud emas."}</p>

            <div className="flex items-center gap-2 text-red-500 font-semibold text-lg sm:text-xl mb-4">
              <FaStar /> {vote_average?.toFixed(1) || "0.0"} / 10
            </div>

            <div className="flex items-center gap-4 mt-4">
              <LikeButton movie={cartoon} token={token} />
              <WatchlistButton movie={cartoon} />
            </div>
          </div>
        </motion.div>

        {/* Trailer */}
        {trailer?.key && (
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
                src={`${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Trailer}/embed/${trailer.key}`}
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
