import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaRegCalendarAlt, FaStar, FaPlay } from 'react-icons/fa';
import { movieAPI } from '../api/movie-api';

export function MovieCard({ movie, className = '' }) {
  const imageUrl = movie.poster_path 
    ? movieAPI.getImageUrl(movie.poster_path)
    : '/placeholder-movie.jpg';

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`card group cursor-pointer ${className}`}
    >
      <Link href={`/Movies/${movie.id}`}>
        <div className="relative overflow-hidden rounded-xl">
          {/* Movie Poster */}
          <div className="aspect-[2/3] relative overflow-hidden">
            <img
              src={imageUrl}
              alt={movie.title || "Movie Poster"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.src = '/placeholder-movie.jpg';
              }}
            />
            
            {/* Overlay with play button */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 rounded-full bg-yellow-400 flex-center text-black shadow-lg"
              >
                <FaPlay className="text-xl ml-1" />
              </motion.div>
            </div>
            
            {/* Rating badge */}
            {movie.vote_average > 0 && (
              <div className="absolute top-3 right-3 glass px-2 py-1 rounded-lg flex items-center gap-1">
                <FaStar className="text-yellow-400 text-xs" />
                <span className="text-white text-xs font-bold">
                  {movie.vote_average.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          
          {/* Movie Info */}
          <div className="p-4">
            <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors duration-300">
              {movie.title || movie.name}
            </h3>
            
            <div className="flex items-center justify-between text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <FaRegCalendarAlt className="text-yellow-400" />
                <span>
                  {movie.release_date 
                    ? new Date(movie.release_date).getFullYear()
                    : 'N/A'
                  }
                </span>
              </div>
              
              {movie.adult && (
                <span className="glass px-2 py-1 rounded text-xs text-red-400">
                  18+
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
