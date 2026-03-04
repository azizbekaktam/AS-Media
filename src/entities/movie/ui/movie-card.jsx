import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { movieAPI } from '../api/movie-api';

export function MovieCard({ movie, className = '' }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group relative bg-neutral-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <Link href={`/Movies/${movie.id}`}>
        <img
          src={movieAPI.getImageUrl(movie.poster_path || '')}
          alt={movie.title || "Movie Poster"}
          className="w-full h-64 sm:h-80 lg:h-96 object-cover group-hover:opacity-80 transition duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-3">
          <h2 className="font-semibold text-lg sm:text-xl text-yellow-400 truncate">
            {movie.title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 flex items-center gap-1">
            <FaRegCalendarAlt /> {movie.release_date || "N/A"}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
