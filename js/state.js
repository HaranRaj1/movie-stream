// Global State Management for Vela Stream
const DEFAULT_MOVIES = [
    {
        id: '1',
        title: 'Interstellar',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        thumbnail: 'https://image.tmdb.org/t/p/w500/gEU2QniE6EwfVnz6nuzpczhbsNQ.jpg',
        banner: 'https://image.tmdb.org/t/p/original/rAiT6vL7v9Lp0vRjI6haasP99uP.jpg',
        genre: ['Sci-Fi', 'Adventure'],
        rating: 8.7,
        duration: '2h 49m',
        embedUrl: 'https://abyss.to/e/placeholder1',
        featured: true,
        type: 'Trending',
        releaseYear: 2014
    },
    {
        id: '2',
        title: 'Jujutsu Kaisen 0',
        description: 'Yuta Okkotsu, a high schooler who gains control of an extremely powerful, cursed spirit.',
        thumbnail: 'https://image.tmdb.org/t/p/w500/3pTwMUEavTzS6Dm9STjRzsStmGa.jpg',
        banner: 'https://image.tmdb.org/t/p/original/6mX96V8o8ZpSjS77v36XUAtuVuk.jpg',
        genre: ['Anime', 'Action'],
        rating: 7.9,
        duration: '1h 45m',
        embedUrl: 'https://abyss.to/e/placeholder2',
        featured: false,
        type: 'Anime',
        releaseYear: 2021
    },
    {
        id: '3',
        title: 'Leo',
        description: 'A mild-mannered cafe owner becomes a local hero through an act of violence, which also brings forth consequences.',
        thumbnail: 'https://image.tmdb.org/t/p/w500/p9999999.jpg', // Placeholder for Tamil
        thumbnail: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?q=80&w=2070&auto=format&fit=crop',
        banner: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop',
        genre: ['Action', 'Thriller', 'Tamil'],
        rating: 8.2,
        duration: '2h 44m',
        embedUrl: 'https://abyss.to/e/placeholder3',
        featured: false,
        type: 'Tamil Movies',
        releaseYear: 2023
    }
];

class State {
    constructor() {
        this.movies = JSON.parse(localStorage.getItem('vela_movies')) || DEFAULT_MOVIES;
        this.favorites = JSON.parse(localStorage.getItem('vela_favorites')) || [];
        this.continueWatching = JSON.parse(localStorage.getItem('vela_history')) || [];
        this.searchQuery = '';
    }

    saveMovies() {
        localStorage.setItem('vela_movies', JSON.stringify(this.movies));
    }

    // Category filtering
    getMoviesByCategory(category) {
        if (category === 'Trending') return this.movies.sort((a, b) => b.rating - a.rating).slice(0, 6);
        if (category === 'New Releases') return [...this.movies].reverse().slice(0, 6);
        if (category === 'Top Rated') return this.movies.filter(m => m.rating >= 8.5);
        return this.movies.filter(m => m.type === category || m.genre.includes(category));
    }

    search(query) {
        this.searchQuery = query.toLowerCase();
        if (!this.searchQuery) return this.movies;
        return this.movies.filter(m => 
            m.title.toLowerCase().includes(this.searchQuery) || 
            m.genre.some(g => g.toLowerCase().includes(this.searchQuery))
        );
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
