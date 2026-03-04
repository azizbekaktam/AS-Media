'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiOutlineChevronDoubleLeft, HiOutlineChevronDoubleRight } from 'react-icons/hi';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { MdMovie } from 'react-icons/md';
import { movieAPI } from '../entities/movie/api/movie-api';
import { MovieGrid } from '../widgets/movie-list/movie-grid';
import { Navbar } from '../widgets/navigation/navbar';

const blockedIds = [
  1280461, 715287, 611251, 259872, 1211373, 1506456, 1365103, 993236, 1127648,
  226674, 1470086, 641284, 147714, 460229, 1476292, 1140142, 1529510, 82023,
  86767, 1212337, 1234720, 1252309, 1501238, 1357459, 1241752,
];

export function CartoonPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [movies, setMovies] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPage(parseInt(params.get('page')) || 1);
    setSelectedCategory(params.get('category') ? parseInt(params.get('category')) : null);
  }, []);

  useEffect(() => {
    async function fetchGenres() {
      try {
        const genres = await movieAPI.getGenres();
        setCategories(genres);
      } catch (error) {
        console.error('Genres olishda xato:', error);
      }
    }
    fetchGenres();
  }, []);

  useEffect(() => {
    async function fetchCartoons() {
      try {
        setLoading(true);
        let data;
        
        if (selectedCategory) {
          data = await movieAPI.getMoviesByCategory(selectedCategory, page);
        } else {
          data = await movieAPI.getPopularCartoons(page);
        }

        const filtered = (data.results || []).filter((m) => !blockedIds.includes(m.id));
        setMovies(filtered);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCartoons();

    router.replace(
      `/Cartoon?page=${page}${selectedCategory ? `&category=${selectedCategory}` : ''}`,
      undefined,
      { scroll: false }
    );
  }, [page, selectedCategory, router]);

  const prevPage = () => setPage((p) => Math.max(p - 1, 1));
  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-surface to-background text-text">
      <Navbar />

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-4xl sm:text-5xl font-extrabold mt-10 mb-6 flex items-center justify-center gap-2 text-accent"
      >
        <MdMovie className="text-5xl sm:text-6xl" /> Multfilmlar
      </motion.h1>

      <div className="flex flex-wrap gap-3 justify-center mb-12 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => { setSelectedCategory(null); setPage(1); }}
          className={`px-5 py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-200 ${
            selectedCategory === null
              ? 'bg-accent text-black shadow-xl'
              : 'bg-white/5 hover:bg-accent hover:text-black shadow-sm'
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
                ? 'bg-accent text-black shadow-xl'
                : 'bg-white/5 hover:bg-accent hover:text-black shadow-sm'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <MovieGrid movies={movies} loading={loading} />

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
