'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { movieAPI } from '../entities/movie/api/movie-api';
import { useAuthContext } from '../features/authentication/auth-provider';
import { useHistory } from '../shared/hooks/use-history';
import { CommentSection } from '../features/comments/comment-section';
import { LoadingSpinner, GlassCard } from '../shared/ui';
import { Navbar } from '../widgets/navigation/navbar';

export function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useAuthContext();
  const { addToHistoryWithDocId } = useHistory();

  useEffect(() => {
    async function fetchMovieData() {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const movieData = await movieAPI.getDetails(id);
        const movieWithType = { ...movieData, type: 'movie' };
        setMovie(movieWithType);

        const trailer = await movieAPI.getTrailers(id);
        setTrailerKey(trailer);

        if (user && movieData) {
          await addToHistoryWithDocId(user, movieWithType, 'movie');
        }
      } catch (error) {
        console.error('Error fetching movie:', error);
        setError('Filmlarni yuklashda xatolik yuz berdi.');
      } finally {
        setLoading(false);
      }
    }

    fetchMovieData();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-white">
        <LoadingSpinner text="Film yuklanmoqda..." />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-white">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error || 'Film topilmadi'}</div>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition"
          >
            Orqaga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white py-10 px-6">
      <Navbar />
      
      <div className="max-w-6xl mx-auto">
        <GlassCard className="flex flex-col md:flex-row gap-10 mt-10 p-6">
          <div className="w-full md:w-[320px] lg:w-[360px] overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={movieAPI.getImageUrl(movie.poster_path || '')}
              alt={movie.title || 'Movie Poster'}
              className="w-full h-[400px] sm:h-[480px] lg:h-[520px] object-cover rounded-2xl"
            />
          </div>

          <div className="flex-1">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-red-500 mb-4">
              {movie.title}
            </h1>
            <p className="text-gray-400 text-lg mb-4">{movie.release_date || 'N/A'}</p>
            <p className="text-gray-200 leading-relaxed mb-6">{movie.overview || 'Overview mavjud emas.'}</p>

            <div className="flex items-center gap-2 text-red-500 font-semibold text-lg sm:text-xl mb-6">
              <span className="text-yellow-400">★</span> {movie.vote_average?.toFixed(1) || '0.0'} / 10
            </div>

            <div className="flex flex-wrap gap-4">
              <button className="btn-primary">Like</button>
              <button className="btn-secondary">Watchlist</button>
            </div>
          </div>
        </GlassCard>

        {trailerKey && (
          <GlassCard className="mt-14 p-6">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-red-500 flex items-center gap-2">
              🎬 Trailer
            </h2>
            <div className="rounded-2xl overflow-hidden">
              <iframe
                src={movieAPI.getTrailerUrl(trailerKey)}
                title="YouTube trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-[400px] sm:h-[450px] lg:h-[500px]"
              />
            </div>
          </GlassCard>
        )}

        <CommentSection movieId={id} />
      </div>
    </main>
  );
}
