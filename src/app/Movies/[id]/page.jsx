"use client";

import { motion } from "framer-motion";
import BackButton from "@/app/components/BackButton";
import LikeButton from "@/app/components/LikeButton";
import WatchlistButton from "@/app/components/Watchlist";
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
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const movieRes = await axios.get(
          `${process.env.NEXT_PUBLIC_Project_TmdApi_Api}/movie/${id}?api_key=${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Key}&language=en-US`
        );
        const movieData = { ...movieRes.data, type: "movie" };
        setMovie(movieData);

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

    if (id) fetchMovie();
  }, [id, user]);

  if (!movie)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      </div>
    );

  const { poster_path, title, release_date, vote_average, overview } = movie;

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white px-6 py-10">
      <BackButton />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 mt-8"
      >
        <motion.img
          src={`${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Img}${poster_path}`}
          alt={title}
          className="rounded-2xl shadow-2xl w-full md:w-[350px] object-cover hover:scale-105 transition-transform duration-300"
          whileHover={{ scale: 1.05 }}
        />

        <div className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/10">
          <h1 className="text-4xl font-extrabold mb-3 text-yellow-400">{title}</h1>
          <p className="text-gray-300 text-sm mb-2">{release_date}</p>
          <p className="text-gray-200 leading-relaxed">{overview}</p>

          <div className="flex items-center gap-2 mt-4 text-yellow-400 font-semibold">
            <FaStar /> {vote_average?.toFixed(1)} / 10
          </div>

          <div className="flex items-center gap-4 mt-6">
            <LikeButton movie={movie} token={token} />
            <WatchlistButton movie={movie} />
          </div>
        </div>
      </motion.div>

      {trailer && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto mt-10"
        >
          <h2 className="text-2xl font-semibold mb-3 text-center text-yellow-400">🎬 Trailer</h2>
          <div className="aspect-video rounded-2xl overflow-hidden shadow-xl border border-white/10">
            <iframe
              src={`${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Trailer}/embed/${trailer.key}`}
              title="YouTube trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </motion.div>
      )}
    </main>
  );
}
