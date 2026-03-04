import { MovieCard } from '../../entities/movie/ui/movie-card';
import { LoadingSpinner } from '../../shared/ui/loading-spinner';

export function MovieGrid({ movies, loading, className = '' }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner text="Yuklanmoqda..." />
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-400">Kinolar topilmadi 😕</p>
      </div>
    );
  }

  return (
    <section className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8 ${className}`}>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </section>
  );
}
