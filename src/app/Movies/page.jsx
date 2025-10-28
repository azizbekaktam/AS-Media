"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Spinder from "../components/Spinder";
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

  if (loading) return <Spinder />;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f0f0f] via-[#151515] to-[#0a0a0a] text-white">
      <Navbar />
      <Slider />

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-3xl font-extrabold mt-8 mb-6 flex items-center justify-center gap-2 text-yellow-400"
      >
        <MdMovie className="text-yellow-400" /> Kinolar ({page}/{totalPages})
      </motion.h1>

      {/* Categories */}
      <div className="flex flex-wrap gap-3 justify-center mb-10">
        <button
          onClick={() => {
            setSelectedCategory(null);
            setPage(1);
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            selectedCategory === null
              ? "bg-yellow-400 text-black shadow-lg"
              : "bg-[#222] hover:bg-yellow-400 hover:text-black"
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
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedCategory === cat.id
                ? "bg-yellow-400 text-black shadow-lg"
                : "bg-[#222] hover:bg-yellow-400 hover:text-black"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Movies Grid */}
      <motion.div
        layout
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 px-6"
      >
        {movies.length > 0 ? (
          movies.map((m) => (
            <motion.div
              key={m.id}
              whileHover={{ scale: 1.05 }}
              className="group relative bg-[#1a1a1a]/70 backdrop-blur-md rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition"
            >
              <Link href={`/Movies/${m.id}`}>
                <img
                  src={`${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Img}/t/p/w500${m.poster_path}`}
                  alt={m.title}
                  className="w-full h-80 object-cover group-hover:opacity-80 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-3">
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
          <p className="text-center col-span-full text-gray-400">
            Kinolar topilmadi
          </p>
        )}
      </motion.div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-10 pb-10">
        <button
          onClick={prevPage}
          disabled={page === 1}
          className="px-4 py-2 bg-[#222] rounded-full disabled:opacity-40 hover:bg-yellow-400 hover:text-black transition"
        >
          <HiOutlineChevronDoubleLeft />
        </button>
        <span className="text-yellow-400 font-semibold">
          {page} / {totalPages}
        </span>
        <button
          onClick={nextPage}
          disabled={page === totalPages}
          className="px-4 py-2 bg-[#222] rounded-full disabled:opacity-40 hover:bg-yellow-400 hover:text-black transition"
        >
          <HiOutlineChevronDoubleRight />
        </button>
      </div>
    </main>
  );
}
