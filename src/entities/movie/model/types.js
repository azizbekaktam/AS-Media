// Movie entity types
export const MovieTypes = {
  // Base movie interface
  movie: {
    id: 'number',
    title: 'string',
    overview: 'string',
    poster_path: 'string?',
    backdrop_path: 'string?',
    release_date: 'string?',
    vote_average: 'number?',
    vote_count: 'number?',
    genre_ids: 'array<number>',
    adult: 'boolean?',
    original_language: 'string?',
    original_title: 'string?',
    popularity: 'number?',
    video: 'boolean?',
    type: 'movie|multfilm'
  },

  // Movie details interface
  movieDetails: {
    ...this.movie,
    genres: 'array<{id: number, name: string}>',
    runtime: 'number?',
    status: 'string?',
    tagline: 'string?',
    belongs_to_collection: 'any',
    budget: 'number?',
    revenue: 'number?',
    imdb_id: 'string?',
    homepage: 'string?',
    production_companies: 'array<{id: number, logo_path?: string, name: string, origin_country: string}>',
    production_countries: 'array<{iso_3166_1: string, name: string}>',
    spoken_languages: 'array<{english_name: string, iso_639_1: string, name: string}>'
  },

  // Genre interface
  genre: {
    id: 'number',
    name: 'string'
  },

  // Video interface
  video: {
    id: 'string',
    iso_639_1: 'string',
    iso_3166_1: 'string',
    key: 'string',
    name: 'string',
    official: 'boolean',
    published_at: 'string',
    site: 'string',
    size: 'number',
    type: 'string'
  }
};

// Validation helpers
export const validateMovie = (movie) => {
  return movie && typeof movie.id === 'number' && typeof movie.title === 'string';
};

export const validateMovieDetails = (movie) => {
  return validateMovie(movie) && typeof movie.overview === 'string';
};
