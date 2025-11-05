"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { HiArrowCircleRight, HiArrowCircleLeft } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

export default function Slider() {
  const [movies, setMovies] = useState([]);
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // API dan ma'lumot olish
  useEffect(() => {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_Project_TmdApi_Api}/movie/popular?api_key=${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Key}&language=en-US&page=1`
      )
      .then((res) => setMovies(res.data.results))
      .catch((err) => console.error(err));
  }, []);

  // Auto-slide
  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % movies.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [movies]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % movies.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + movies.length) % movies.length);

  // Touch events for mobile swipe
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.touches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    if (touchStart - touchEnd > 50) nextSlide(); // swipe left
    if (touchEnd - touchStart > 50) prevSlide(); // swipe right
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (!movies.length)
    return (
      <div className="w-full h-[480px] flex items-center justify-center text-gray-400">
        Loading movies...
      </div>
    );

  const currentMovie = movies[current];

  return (
    <div
      className="relative w-full h-[480px] mt-6 overflow-hidden rounded-3xl shadow-2xl"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={currentMovie.id}
          src={`https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`}
          alt={currentMovie.title}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.8 }}
          className="absolute w-full h-full object-cover brightness-75 rounded-3xl"
        />
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-3xl"></div>

      {/* Movie Info */}
      <div className="absolute bottom-16 left-6 md:left-12 text-white max-w-[70%] space-y-3">
        <motion.h2
          key={currentMovie.id + "title"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05, color: "#FACC15" }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-4xl font-extrabold drop-shadow-xl leading-tight cursor-pointer"
        >
          {currentMovie.title}
        </motion.h2>
        <motion.p
          key={currentMovie.id + "desc"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden md:block text-gray-300 text-sm md:text-base line-clamp-2"
        >
          {currentMovie.overview || "No description available."}
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-5 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-md transition-all"
        >
          ▶ Watch Now
        </motion.button>
      </div>

      {/* Navigation buttons */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 hover:bg-black/80 p-3 rounded-full shadow-lg backdrop-blur-sm text-white transition-all duration-300 hover:scale-110"
      >
        <HiArrowCircleLeft size={32} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 hover:bg-black/80 p-3 rounded-full shadow-lg backdrop-blur-sm text-white transition-all duration-300 hover:scale-110"
      >
        <HiArrowCircleRight size={32} />
      </button>

      {/* Indicator dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {movies.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
              i === current
                ? "bg-yellow-400 shadow-md scale-125"
                : "bg-gray-400/70 hover:bg-yellow-300"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}
