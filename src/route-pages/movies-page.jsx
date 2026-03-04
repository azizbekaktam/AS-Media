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

export function MoviesPage() {
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
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const data = selectedCategory 
          ? await movieAPI.getMoviesByCategory(selectedCategory, page)
          : await movieAPI.getPopularMovies(page);
        
        const filteredMovies = data.results.filter(movie => !blockedIds.includes(movie.id));
        setMovies(filteredMovies);
        setTotalPages(Math.min(data.total_pages, 500));
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [page, selectedCategory]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await movieAPI.getMovieCategories();
        setCategories(data.genres.slice(0, 8));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    router.replace(
      `/Movies?page=${page}${selectedCategory ? `&category=${selectedCategory}` : ''}`,
      undefined,
      { scroll: false }
    );
  }, [page, selectedCategory, router]);

  const prevPage = () => setPage((p) => Math.max(p - 1, 1));
  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));

  return (
    <main className="bg-gradient min-h-screen">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container pt-24 pb-12"
      >
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gradient mb-4 flex items-center justify-center gap-4"
          >
            <MdMovie className="text-5xl sm:text-6xl md:text-7xl" />
            Kinolar
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
          >
            Eng sara kinolar va multfilmlar to'plami
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3 justify-center mb-12"
        >
          <button
            onClick={() => { setSelectedCategory(null); setPage(1); }}
            className={`btn-secondary ${
              selectedCategory === null ? 'btn-primary' : ''
            }`}
          >
            Barchasi
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
              className={`btn-secondary ${
                selectedCategory === cat.id ? 'btn-primary' : ''
              }`}
            >
              {cat.name}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <MovieGrid movies={movies} loading={loading} />
        </motion.div>

        {!loading && movies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex-center gap-6 mt-16"
          >
            <button
              onClick={prevPage}
              disabled={page === 1}
              className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <HiOutlineChevronDoubleLeft className="text-xl" />
            </button>
            
            <div className="text-white font-bold text-xl min-w-[80px] text-center">
              {page} / {totalPages}
            </div>
            
            <button
              onClick={nextPage}
              disabled={page === totalPages}
              className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <HiOutlineChevronDoubleRight className="text-xl" />
            </button>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
