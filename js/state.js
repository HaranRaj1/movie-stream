// [js/state.js] - Advanced Data Engine
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
    }
];

class State {
    constructor() {
        this.movies = JSON.parse(localStorage.getItem('vela_movies')) || DEFAULT_MOVIES;
        this.continueWatching = JSON.parse(localStorage.getItem('vela_history')) || [];
        this.searchQuery = '';
        this.adminPassword = 'webadmin2008'; // 🔑 CHANGE YOUR PASSWORD HERE
    }

    saveMovies() {
        localStorage.setItem('vela_movies', JSON.stringify(this.movies));
    }

    getMoviesByCategory(category) {
        if (category === 'Trending') return this.movies.filter(m => m.type === 'Trending' || m.rating >= 8.5);
        return this.movies.filter(m => m.type === category || m.genre.includes(category));
    }

    search(query) {
        this.searchQuery = query.toLowerCase();
        return this.movies.filter(m => 
            m.title.toLowerCase().includes(this.searchQuery) || 
            m.genre.some(g => g.toLowerCase().includes(this.searchQuery))
        );
    }

    addMovie(movie) {
        // If this movie is featured, un-feature others
        if (movie.featured) {
            this.movies.forEach(m => m.featured = false);
        }
        const newMovie = {
            ...movie,
            id: Date.now().toString(),
            rating: movie.rating || 0,
            releaseYear: movie.releaseYear || new Date().getFullYear()
        };
        this.movies.push(newMovie);
        this.saveMovies();
    }

    deleteMovie(id) {
        this.movies = this.movies.filter(m => m.id !== id);
        this.saveMovies();
    }

    getFeatured() {
        return this.movies.find(m => m.featured) || this.movies[0];
    }
}

export const state = new State();
