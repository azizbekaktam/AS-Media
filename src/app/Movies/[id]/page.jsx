"use client";

import { motion } from "framer-motion";
import BackButton from "@/app/components/BackButton";
import LikeButton from "@/app/components/LikeButton";
import WatchlistButton from "@/app/components/Watchlist";
import MovieComments from "@/app/components/MovieComments";


import axios from "axios";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { auth, db } from "../../../../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function MovieDetail({ token }) {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((c) => setUser(c));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_Project_TmdApi_Api}/movie/${id}?api_key=${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Key}&language=en-US`
        );

        const movieData = { ...data, type: "movie" };
        setMovie(movieData);

        // Save history
        if (user) {
          const ref = doc(db, "users", user.uid, "history", String(movieData.id));
          await setDoc(ref, {
            id: movieData.id,
            title: movieData.title,
            poster_path: movieData.poster_path,
            release_date: movieData.release_date,
            viewedAt: new Date().toISOString(),
          });
        }

        // Fetch trailer
        const v = await axios.get(
          `${process.env.NEXT_PUBLIC_Project_TmdApi_Api}/movie/${id}/videos?api_key=${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Key}&language=en-US`
        );
        setTrailer(
          v.data.results.find((vid) => vid.type === "Trailer" && vid.site === "YouTube")
        );
      } catch (err) {
        console.error("API xatolik:", err);
      }
    };

    if (id) fetchMovie();
  }, [id, user]);

  if (!movie)
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-text">
        <div className="text-accent text-lg animate-pulse">Yuklanmoqda...</div>
      </div>
    );

  const { poster_path, title, release_date, vote_average, overview } = movie;

  return (
    <main className="min-h-screen bg-background text-text px-4 sm:px-6 lg:px-10 py-10">
      <div className="max-w-6xl mx-auto">

        <BackButton />

        {/* TOP SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row gap-10 mt-10"
        >
          {/* Poster */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-full md:w-[320px] lg:w-[360px] overflow-hidden rounded-2xl shadow-xl bg-surface border border-white/10"
          >
            <img
              src={
                poster_path
                  ? `${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Img}${poster_path}`
                  : "/fallback-poster.png"
              }
              alt={title}
              className="w-full h-[420px] sm:h-[480px] lg:h-[520px] object-cover"
            />
          </motion.div>

          {/* Details */}
          <div className="flex-1 bg-surface/70 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-accent mb-2">
              {title}
            </h1>
            <p className="text-muted mb-3">{release_date || "N/A"}</p>

            <p className="text-text leading-relaxed mb-4">
              {overview || "Overview mavjud emas."}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2 text-primary font-semibold text-lg sm:text-xl mb-4">
              <FaStar className="text-accent" />
              {vote_average?.toFixed(1) || "0.0"} / 10
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-4 mt-4">
              <LikeButton movie={movie} token={token} />
              <WatchlistButton movie={movie} />
            </div>
            <div className="mt-14">
  <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-accent">
    💬 Comments
  </h2>
  <MovieComments movieId={movie.id} />
</div>
          </div>
        </motion.div>

        {/* TRAILER */}
        {trailer?.key && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mt-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-accent">
              🎬 Trailer
            </h2>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-surface">
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
