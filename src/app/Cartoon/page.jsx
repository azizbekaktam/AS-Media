"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import CartoonSlider from "../components/CartoonSlider";
import { motion } from "framer-motion";
import {
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
} from "react-icons/hi";
import { FaRegCalendarAlt, FaRegLaughBeam } from "react-icons/fa";

export default function CartoonsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [cartoons, setCartoons] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(16);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentPage = parseInt(params.get("page")) || 1;
    const currentCategory = parseInt(params.get("category")) || 16;
    setPage(currentPage);
    setSelectedCategory(currentCategory);
  }, []);

  useEffect(() => {
    async function fetchGenres() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Key}&language=en-US`
        );
        const data = await res.json();
        const filtered = data.genres.filter((g) =>
          [16, 35, 10751, 14, 12].includes(g.id)
        );
        setCategories(filtered);
      } catch (error) {
        console.error("Genres olishda xato:", error);
      }
    }
    fetchGenres();
  }, []);

  useEffect(() => {
    async function fetchCartoons() {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_Project_TmdApi_Api}/discover/movie?api_key=${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Key}&with_genres=${selectedCategory}&language=en-US&page=${page}`
        );
        const data = await res.json();
        setCartoons(data.results || []);
        setTotalPages(data.total_pages || 1);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchCartoons();
    router.replace(
      `/Cartoon?page=${page}&category=${selectedCategory}`,
      undefined,
      { scroll: false }
    );
  }, [page, selectedCategory, router]);

  const prevPage = () => setPage((p) => Math.max(p - 1, 1));
  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Navbar />
      <CartoonSlider />

      <div className="text-center mt-10 mb-6">
        <h1 className="text-4xl font-extrabold flex justify-center items-center gap-3 text-red-500">
          <FaRegLaughBeam className="text-red-600" /> Multfilmlar
        </h1>
        <p className="text-gray-400 mt-1">
          Eng yangi va mashhur multfilmlar ro‘yxati
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-3 mb-10 px-4">
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              setSelectedCategory(cat.id);
              setPage(1);
            }}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              selectedCategory === cat.id
                ? "bg-red-600 text-white shadow-md"
                : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
            }`}
          >
            {cat.name}
          </motion.button>
        ))}
      </div>

      {/* Movies Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 px-6">
        {loading ? (
          <p className="text-center col-span-full text-gray-400 text-lg">
            Yuklanmoqda...
          </p>
        ) : cartoons.length > 0 ? (
          cartoons.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.03 }}
              className="bg-neutral-900 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
            >
              <Link href={`/Cartoon/${c.id}`}>
                <img
                  src={`${process.env.NEXT_PUBLIC_Project_TmdApi_Api_Img}/t/p/w500${c.poster_path}`}
                  alt={c.title}
                  className="w-full h-72 object-cover rounded-t-xl"
                />
                <div className="p-3">
                  <h2 className="font-semibold truncate text-gray-200">
                    {c.title}
                  </h2>
                  <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                    <FaRegCalendarAlt className="text-red-500" />{" "}
                    {c.release_date}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <p className="text-center col-span-full text-gray-400 text-lg">
            Multfilmlar topilmadi 😕
          </p>
        )}
      </section>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-10 mb-10">
        <button
          onClick={prevPage}
          disabled={page === 1}
          className="p-3 bg-neutral-800 rounded-full hover:bg-neutral-700 disabled:opacity-40"
        >
          <HiOutlineChevronDoubleLeft className="text-xl text-gray-300" />
        </button>
        <span className="text-gray-300 font-medium">
          Sahifa {page} / {totalPages}
        </span>
        <button
          onClick={nextPage}
          disabled={page === totalPages}
          className="p-3 bg-neutral-800 rounded-full hover:bg-neutral-700 disabled:opacity-40"
        >
          <HiOutlineChevronDoubleRight className="text-xl text-gray-300" />
        </button>
      </div>
    </main>
  );
}
