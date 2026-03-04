import { MovieCard } from '../../entities/movie/ui/movie-card';
import { LoadingSpinner } from '../../shared/ui/loading-spinner';

export function MovieGrid({ movies, loading, className = '' }) {
  if (loading) {
    return (
      <div className="flex-center py-20">
        <LoadingSpinner text="Kinolar yuklanmoqda..." size="lg" />
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="flex-center py-20 flex-col gap-4">
        <div className="text-6xl mb-4">🎬</div>
        <h3 className="text-2xl font-bold text-white mb-2">Kinolar topilmadi</h3>
        <p className="text-white/60 text-center max-w-md">
          Kechirasur, hozircha kinolar mavjud emas. Iltimos, keyinroq urinib ko'ring.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 ${className}`}
    >
      {movies.map((movie, index) => (
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: index * 0.1,
            ease: "easeOut"
          }}
        >
          <MovieCard movie={movie} />
        </motion.div>
      ))}
    </motion.div>
  );
}
