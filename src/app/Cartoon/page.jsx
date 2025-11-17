"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { CartoonSlider } from "../components/SliderBase";

import { motion } from "framer-motion";
import { HiOutlineChevronDoubleLeft, HiOutlineChevronDoubleRight } from "react-icons/hi";
import { FaRegCalendarAlt } from "react-icons/fa";
import { MdMovie } from "react-icons/md";

export default function CartoonPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [cartoons, setCartoons] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const blockedIds = []; // Cartoonlarda kerak bo'lsa filter

  // URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPage(parseInt(params.get("page")) || 1);
    setSelectedCategory(params.get("category") ? parseInt(params.get("category")) : null);
  }, []);

  // Fetch genres
  useEffect(() => {
    async function fetchGenres() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_Project_TmdApi_Api}/genre/movie/list?api_key=${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Key}&language=en-US`
        );
        const data = await res.json();
        setCategories(data.genres || []);
      } catch (error) {
        console.error("Genres olishda xato:", error);
      }
    }
    fetchGenres();
  }, []);

  // Fetch cartoons
  useEffect(() => {
    async function fetchCartoons() {
      try {
        setLoading(true);
        const url = `${process.env.NEXT_PUBLIC_Project_TmdApi_Api}/discover/movie?api_key=${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Key}&language=en-US&page=${page}&with_genres=16${
          selectedCategory ? `&with_genres=${selectedCategory}` : ""
        }`;

        const res = await fetch(url);
        const data = await res.json();

        const filtered = (data.results || []).filter((c) => !blockedIds.includes(c.id));
        setCartoons(filtered);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCartoons();

    router.replace(
      `/Cartoon?page=${page}${selectedCategory ? `&category=${selectedCategory}` : ""}`,
      undefined,
      { scroll: false }
    );
  }, [page, selectedCategory, router]);

  const prevPage = () => setPage((p) => Math.max(p - 1, 1));
  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-surface to-background text-text">
      <Navbar />
      <CartoonSlider />

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-4xl sm:text-5xl font-extrabold mt-10 mb-6 flex items-center justify-center gap-2 text-accent"
      >
        <MdMovie className="text-5xl sm:text-6xl" /> Cartoons
      </motion.h1>

      {/* Categories */}
      <div className="flex flex-wrap gap-3 justify-center mb-12 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => { setSelectedCategory(null); setPage(1); }}
          className={`px-5 py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-200 ${
            selectedCategory === null
              ? "bg-accent text-black shadow-xl"
              : "bg-white/5 hover:bg-accent hover:text-black shadow-sm"
          }`}
        >
          Barchasi
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
            className={`px-5 py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-200 ${
              selectedCategory === cat.id
                ? "bg-accent text-black shadow-xl"
                : "bg-white/5 hover:bg-accent hover:text-black shadow-sm"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Cartoons Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <p className="text-center col-span-full text-muted animate-pulse">Yuklanmoqda...</p>
        ) : cartoons.length > 0 ? (
          cartoons.map((c) => (
            <motion.div
              key={c.id}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="group relative bg-surface rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href={`/Cartoon/${c.id}`}>
                <img
                  src={
                    c.poster_path
                      ? `${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Img}/t/p/w500${c.poster_path}`
                      : "/fallback-poster.png"
                  }
                  alt={c.title || "Cartoon Poster"}
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover group-hover:opacity-80 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-3">
                  <h2 className="font-semibold text-lg sm:text-xl text-accent truncate">
                    {c.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted flex items-center gap-1">
                    <FaRegCalendarAlt /> {c.release_date || "N/A"}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <p className="text-center col-span-full text-muted">Cartoons topilmadi 😕</p>
        )}
      </section>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-12 pb-12">
        <button
          onClick={prevPage}
          disabled={page === 1}
          className="p-3 bg-white/5 rounded-full disabled:opacity-40 hover:bg-accent hover:text-black transition-all duration-200"
        >
          <HiOutlineChevronDoubleLeft className="text-xl sm:text-2xl" />
        </button>
        <span className="text-accent font-bold text-lg sm:text-xl">
          {page} / {totalPages}
        </span>
        <button
          onClick={nextPage}
          disabled={page === totalPages}
          className="p-3 bg-white/5 rounded-full disabled:opacity-40 hover:bg-accent hover:text-black transition-all duration-200"
        >
          <HiOutlineChevronDoubleRight className="text-xl sm:text-2xl" />
        </button>
      </div>
    </main>
  );
}
