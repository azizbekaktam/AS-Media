"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { HiArrowCircleRight, HiArrowCircleLeft } from "react-icons/hi";

export default function Slider() {
  const [movies, setMovies] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_Project_TmdApi_Api}/movie/popular?api_key=${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Key}&language=en-US&page=1`
      )
      .then((res) => setMovies(res.data.results))
      .catch((err) => console.error(err));
  }, []);

  const nextSlide = () => {
    if (movies.length > 0) {
      setCurrent((prev) => (prev + 1) % movies.length);
    }
  };

  const prevSlide = () => {
    if (movies.length > 0) {
      setCurrent((prev) => (prev - 1 + movies.length) % movies.length);
    }
  };

  if (!movies.length)
    return (
      <div className="w-full h-[450px] flex items-center justify-center text-gray-400">
        Yuklanmoqda...
      </div>
    );

  const currentMovie = movies[current];

  return (
    <div className="relative w-full h-[480px] mt-6 overflow-hidden rounded-3xl shadow-2xl transition-all duration-700">
      {/* 🔹 Movie Image */}
      <img
        src={`${process.env.NEXT_PUBLIC_Project_TmdApi_Api_SliderImg}/t/p/original${currentMovie.backdrop_path}`}
        alt={currentMovie.title}
        className="w-full h-full object-cover brightness-[0.8] transition-transform duration-700 ease-in-out scale-105 hover:scale-110"
      />

      {/* 🔹 Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

      {/* 🔹 Movie Info */}
      <div className="absolute bottom-16 left-6 md:left-12 text-white space-y-3 max-w-[70%]">
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight drop-shadow-xl leading-tight">
          {currentMovie.title}
        </h2>
        <p className="hidden md:block text-gray-300 text-sm md:text-base max-w-lg line-clamp-2">
          {currentMovie.overview || "No description available."}
        </p>
        <button className="px-5 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-md transition-all hover:scale-105">
          ▶ Watch Now
        </button>
      </div>

      {/* 🔹 Left Button */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/40 hover:bg-black/70 hover:scale-110 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 shadow-lg"
      >
        <HiArrowCircleLeft size={32} />
      </button>

      {/* 🔹 Right Button */}
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/40 hover:bg-black/70 hover:scale-110 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 shadow-lg"
      >
        <HiArrowCircleRight size={32} />
      </button>

      {/* 🔹 Indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {movies.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
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
