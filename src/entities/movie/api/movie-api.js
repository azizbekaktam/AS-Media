// Movie API class with TMDB integration

const API_BASE = process.env.NEXT_PUBLIC_Project_TmdApi_Api;
const API_KEY = process.env.NEXT_PUBLIC_Project_TmdApi_Api_Key;
const IMG_BASE = process.env.NEXT_PUBLIC_Project_TmdApi_Api_Img;
const TRAILER_BASE = process.env.NEXT_PUBLIC_Project_TmdApi_Api_Trailer;

class MovieAPI {
  constructor() {
    this.baseUrl = API_BASE || '';
    this.apiKey = API_KEY || '';
    this.imgBase = IMG_BASE || '';
    this.trailerBase = TRAILER_BASE || '';
  }

  async getDetails(id) {
    const response = await fetch(
      `${this.baseUrl}/movie/${id}?api_key=${this.apiKey}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch movie details: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getTrailers(id) {
    const response = await fetch(
      `${this.baseUrl}/movie/${id}/videos?api_key=${this.apiKey}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch trailers: ${response.statusText}`);
    }
    
    const data = await response.json();
    const trailer = data.results.find(
      (vid) => vid.type === 'Trailer' && vid.site === 'YouTube'
    );
    
    return trailer?.key || null;
  }

  async getPopularMovies(page = 1) {
    const response = await fetch(
      `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&language=en-US&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch popular movies: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getPopularCartoons(page = 1) {
    const response = await fetch(
      `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&language=en-US&with_genres=16&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch popular cartoons: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getMoviesByCategory(categoryId, page = 1) {
    const response = await fetch(
      `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&language=en-US&with_genres=${categoryId}&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch movies by category: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getGenres() {
    const response = await fetch(
      `${this.baseUrl}/genre/movie/list?api_key=${this.apiKey}&language=en-US`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch genres: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.genres || [];
  }

  async searchMovies(query, page = 1) {
    const response = await fetch(
      `${this.baseUrl}/search/movie?api_key=${this.apiKey}&language=en-US&query=${encodeURIComponent(query)}&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to search movies: ${response.statusText}`);
    }
    
    return response.json();
  }

  getImageUrl(path, size = 'w500') {
    if (!path) return '/fallback-poster.png';
    return `${this.imgBase}${size}${path}`;
  }

  getTrailerUrl(key) {
    return `${this.trailerBase}/embed/${key}`;
  }
}

export const movieAPI = new MovieAPI();
