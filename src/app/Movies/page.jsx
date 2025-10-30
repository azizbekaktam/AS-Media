"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Slider from "../components/Slider";
import { motion } from "framer-motion";
import { HiOutlineChevronDoubleLeft, HiOutlineChevronDoubleRight } from "react-icons/hi";
import { FaRegCalendarAlt } from "react-icons/fa";
import { MdMovie } from "react-icons/md";

export default function MoviesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [movies, setMovies] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const blockedIds = [
    1280461, 715287, 611251, 259872, 1211373, 1506456, 1365103, 993236, 1127648,
    226674, 1470086, 641284, 147714, 460229, 1476292, 1140142, 1529510, 82023,
    86767, 1212337, 1234720, 1252309, 1501238, 1357459, 1241752,
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentPage = parseInt(params.get("page")) || 1;
    const currentCategory = params.get("category")
      ? parseInt(params.get("category"))
      : null;
    setPage(currentPage);
    setSelectedCategory(currentCategory);
  }, []);

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

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        const url = `${process.env.NEXT_PUBLIC_Project_TmdApi_Api}/discover/movie?api_key=${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Key}&language=en-US&page=${page}${
          selectedCategory ? `&with_genres=${selectedCategory}` : ""
        }`;

        const res = await fetch(url);
        const data = await res.json();

        const filtered = (data.results || []).filter(
          (m) => !blockedIds.includes(m.id)
        );

        setMovies(filtered);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();

    router.replace(
      `/Movies?page=${page}${selectedCategory ? `&category=${selectedCategory}` : ""}`,
      undefined,
      { scroll: false }
    );
  }, [page, selectedCategory, router]);

  const prevPage = () => setPage((p) => Math.max(p - 1, 1));
  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-white">
      <Navbar />
      <Slider />

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-4xl font-extrabold mt-10 mb-6 flex items-center justify-center gap-2 text-yellow-400"
      >
        <MdMovie className="text-yellow-400 text-5xl" /> Kinolar
      </motion.h1>

      {/* Categories */}
      <div className="flex flex-wrap gap-3 justify-center mb-12 px-4">
        <button
          onClick={() => {
            setSelectedCategory(null);
            setPage(1);
          }}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            selectedCategory === null
              ? "bg-yellow-400 text-black shadow-lg"
              : "bg-white/5 hover:bg-yellow-400 hover:text-black"
          }`}
        >
          Barchasi
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setPage(1);
            }}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              selectedCategory === cat.id
                ? "bg-yellow-400 text-black shadow-lg"
                : "bg-white/5 hover:bg-yellow-400 hover:text-black"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Movies Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 px-6">
        {loading ? (
          <p className="text-center col-span-full text-gray-400 animate-pulse">Yuklanmoqda...</p>
        ) : movies.length > 0 ? (
          movies.map((m) => (
            <motion.div
              key={m.id}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="group relative bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(255,255,255,0.08)] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all duration-300"
            >
              <Link href={`/Movies/${m.id}`}>
                <img
                  src={`${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Img}/t/p/w500${m.poster_path}`}
                  alt={m.title}
                  className="w-full h-80 object-cover group-hover:opacity-75 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-3">
                  <h2 className="font-semibold text-lg text-yellow-400 truncate">
                    {m.title}
                  </h2>
                  <p className="text-xs text-gray-300 flex items-center gap-1">
                    <FaRegCalendarAlt /> {m.release_date}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <p className="text-center col-span-full text-gray-400">Kinolar topilmadi 😕</p>
        )}
      </section>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-12 pb-12">
        <button
          onClick={prevPage}
          disabled={page === 1}
          className="p-3 bg-white/5 rounded-full disabled:opacity-40 hover:bg-yellow-400 hover:text-black transition-all duration-200"
        >
          <HiOutlineChevronDoubleLeft className="text-xl" />
        </button>
        <span className="text-yellow-400 font-semibold">
          {page} / {totalPages}
        </span>
        <button
          onClick={nextPage}
          disabled={page === totalPages}
          className="p-3 bg-white/5 rounded-full disabled:opacity-40 hover:bg-yellow-400 hover:text-black transition-all duration-200"
        >
          <HiOutlineChevronDoubleRight className="text-xl" />
        </button>
      </div>
    </main>
  );
}
