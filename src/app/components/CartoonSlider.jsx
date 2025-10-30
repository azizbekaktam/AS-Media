"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  HiArrowCircleRight,
  HiArrowCircleLeft,
} from "react-icons/hi";

export default function CartoonSlider() {
  const [cartoons, setCartoons] = useState([]);
  const [current, setCurrent] = useState(0);

  // 🔹 API dan multfilmlar olish
  useEffect(() => {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_Project_TmdApi_Api}/discover/movie?api_key=${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Key}&with_genres=16&language=en-US&page=1`
      )
      .then((res) => setCartoons(res.data.results))
      .catch((err) => console.error(err));
  }, []);

  // 🔹 Auto-slide
  useEffect(() => {
    if (cartoons.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % cartoons.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [cartoons]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % cartoons.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + cartoons.length) % cartoons.length);
  };

  if (!cartoons.length)
    return (
      <div className="flex justify-center items-center h-[400px] text-gray-400">
        <p>Loading cartoons...</p>
      </div>
    );

  const currentCartoon = cartoons[current];

  return (
    <section className="relative w-full mt-10">
      {/* 🔸 Section Title */}
      <h2 className="text-3xl md:text-4xl font-extrabold text-yellow-400 mb-6 text-center drop-shadow-lg">
        🎞️ Top Cartoons
      </h2>

      <div className="relative w-full h-[420px] md:h-[520px] overflow-hidden rounded-3xl shadow-2xl group">
        {/* 🔹 Cartoon Image */}
        <img
          src={`${process.env.NEXT_PUBLIC_Project_TmdApi_Api_SliderImg}/t/p/original${currentCartoon.backdrop_path}`}
          alt={currentCartoon.title}
          className="w-full h-full object-cover rounded-3xl transition-transform duration-700 ease-in-out group-hover:scale-105"
        />

        {/* 🔹 Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent rounded-3xl"></div>

        {/* 🔹 Text Info */}
        <div className="absolute bottom-16 left-8 sm:left-12 text-white space-y-3 transition-all duration-700">
          <h3 className="text-2xl md:text-4xl font-bold drop-shadow-2xl animate-fade-in">
            {currentCartoon.title}
          </h3>
          <p className="max-w-md text-gray-200 hidden sm:block">
            {currentCartoon.overview?.slice(0, 100)}...
          </p>

          <button className="mt-3 px-5 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-semibold shadow-md transition-all">
            Watch Now
          </button>
        </div>

        {/* 🔹 Left & Right Buttons */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 -translate-y-1/2 
                 bg-black/50 hover:bg-black/80 
                 text-white p-3 rounded-full 
                 backdrop-blur-sm transition-all shadow-md"
        >
          <HiArrowCircleLeft size={30} />
        </button>

        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 -translate-y-1/2 
                 bg-black/50 hover:bg-black/80 
                 text-white p-3 rounded-full 
                 backdrop-blur-sm transition-all shadow-md"
        >
          <HiArrowCircleRight size={30} />
        </button>

        {/* 🔹 Indicator Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {cartoons.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                i === current
                  ? "bg-yellow-400 scale-125 shadow-lg"
                  : "bg-gray-400 hover:bg-yellow-300"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </section>
  );
}
