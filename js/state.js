// Global State Management for Vela Stream
const DEFAULT_MOVIES = [
    {
        id: '1',
        title: 'Interstellar Odyssey',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop',
        banner: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop',
        genre: ['Sci-Fi', 'Adventure'],
        rating: 9.2,
        duration: '2h 49m',
        embedUrl: 'https://abyss.to/e/placeholder1',
        featured: true,
        type: 'movie',
        releaseYear: 2024
    },
    {
        id: '2',
        title: 'Neon Nights',
        description: 'In a dystopian future, a hacker discovers a conspiracy that could bring down the entire virtual world.',
        thumbnail: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=2070&auto=format&fit=crop',
        banner: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop',
        genre: ['Cyberpunk', 'Thriller'],
        rating: 8.5,
        duration: '1h 55m',
        embedUrl: 'https://abyss.to/e/placeholder2',
        featured: false,
        type: 'movie',
        releaseYear: 2024
    }
];

class State {
    constructor() {
        this.movies = JSON.parse(localStorage.getItem('vela_movies')) || DEFAULT_MOVIES;
        this.favorites = JSON.parse(localStorage.getItem('vela_favorites')) || [];
        this.continueWatching = JSON.parse(localStorage.getItem('vela_history')) || [];
        this.adminMode = true; // For demonstration, admin is always active
    }

    saveMovies() {
        localStorage.setItem('vela_movies', JSON.stringify(this.movies));
    }

    addMovie(movie) {
        const newMovie = {
            ...movie,
            id: Date.now().toString(),
            featured: movie.featured || false,
            rating: movie.rating || 0,
            releaseYear: movie.releaseYear || new Date().getFullYear()
        };
        this.movies.push(newMovie);
        this.saveMovies();
        return newMovie;
    }

    updateMovie(id, updatedData) {
        const index = this.movies.findIndex(m => m.id === id);
        if (index !== -1) {
            this.movies[index] = { ...this.movies[index], ...updatedData };
            this.saveMovies();
        }
    }

    deleteMovie(id) {
        this.movies = this.movies.filter(m => m.id !== id);
        this.saveMovies();
    }

    toggleFavorite(movieId) {
        if (this.favorites.includes(movieId)) {
            this.favorites = this.favorites.filter(id => id !== movieId);
        } else {
            this.favorites.push(movieId);
        }
        localStorage.setItem('vela_favorites', JSON.stringify(this.favorites));
    }

    addToHistory(movieId, progress = 0) {
        const entry = { movieId, progress, timestamp: Date.now() };
        this.continueWatching = this.continueWatching.filter(e => e.movieId !== movieId);
        this.continueWatching.unshift(entry);
        localStorage.setItem('vela_history', JSON.stringify(this.continueWatching.slice(0, 10)));
    }

    getFeatured() {
        return this.movies.find(m => m.featured) || this.movies[0];
    }

    getTrending() {
        return [...this.movies].sort((a, b) => b.rating - a.rating);
    }
}

export const state = new State();
