"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { HiArrowCircleRight, HiArrowCircleLeft } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

export default function CartoonSlider() {
  const [cartoons, setCartoons] = useState([]);
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

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
    if (!cartoons.length) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % cartoons.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [cartoons]);

  if (!cartoons.length)
    return (
      <div className="flex justify-center items-center h-[400px] text-gray-400">
        Loading cartoons...
      </div>
    );

  const nextSlide = () => setCurrent((prev) => (prev + 1) % cartoons.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + cartoons.length) % cartoons.length);

  // 🔹 Swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const deltaX = touchEndX.current - touchStartX.current;
    if (deltaX > 50) prevSlide(); // swipe right → previous
    else if (deltaX < -50) nextSlide(); // swipe left → next
  };

  return (
    <section className="relative w-full mt-10">
      <h2 className="text-3xl md:text-4xl font-extrabold text-yellow-400 mb-6 text-center drop-shadow-lg">
        🎞️ Top Cartoons
      </h2>

      <div
        className="relative w-full h-[420px] md:h-[520px] overflow-hidden rounded-3xl shadow-2xl group bg-gray-900"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={cartoons[current].id}
            src={
              cartoons[current].backdrop_path ||
              cartoons[current].poster_path
                ? `https://image.tmdb.org/t/p/original${
                    cartoons[current].backdrop_path ||
                    cartoons[current].poster_path
                  }`
                : "/no-image.jpg"
            }
            alt={cartoons[current].title}
            className="w-full h-full object-cover rounded-3xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8 }}
          />
        </AnimatePresence>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent rounded-3xl"></div>

        {/* Text Info */}
        <div className="absolute bottom-16 left-6 sm:left-12 text-white max-w-[70%] space-y-2">
          <h3 className="text-2xl md:text-4xl font-bold drop-shadow-lg">
            {cartoons[current].title}
          </h3>
          <p className="text-gray-300 text-sm sm:text-base line-clamp-3">
            {cartoons[current].overview || "No description available."}
          </p>
          <button className="mt-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-md transition-all">
            Watch Now
          </button>
        </div>

        {/* Left & Right Buttons */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm transition-shadow shadow-lg"
        >
          <HiArrowCircleLeft size={30} />
        </button>

        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm transition-shadow shadow-lg"
        >
          <HiArrowCircleRight size={30} />
        </button>

        {/* Indicator Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {cartoons.map((_, i) => (
            <motion.div
              key={i}
              onClick={() => setCurrent(i)}
              className="w-3 h-3 rounded-full cursor-pointer"
              animate={{
                backgroundColor:
                  i === current ? "#FACC15" : "rgba(156,163,175,1)",
                scale: i === current ? 1.2 : 1,
              }}
              transition={{ duration: 0.3 }}
            ></motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
