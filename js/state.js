// [js/state.js] - Updated with Password Engine
const DEFAULT_SETTINGS = {
    siteName: 'Vela Stream',
    logoUrl: '',
    primaryColor: '#6366f1',
    secondaryColor: '#a855f7',
    fontFamily: 'Outfit',
    homepageLayout: ['Trending', 'Anime', 'Tamil Movies', 'Action']
};

const DEFAULT_MOVIES = [
    {
        id: '1',
        title: 'Welcome to Vela',
        description: 'Open the Admin Portal to start adding your own movies.',
        thumbnail: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2070&auto=format&fit=crop',
        banner: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2070&auto=format&fit=crop',
        genre: ['Trending'],
        type: 'Trending',
        featured: true,
        embedUrl: ''
    }
];

class State {
    constructor() {
        this.movies = JSON.parse(localStorage.getItem('vela_movies')) || DEFAULT_MOVIES;
        this.settings = JSON.parse(localStorage.getItem('vela_settings')) || DEFAULT_SETTINGS;
        this.adminPassword = 'admin123'; // 🔑 YOUR PASSWORD
        this.applyTheme();
    }

    save() {
        localStorage.setItem('vela_movies', JSON.stringify(this.movies));
        localStorage.setItem('vela_settings', JSON.stringify(this.settings));
        this.applyTheme();
    }

    applyTheme() {
        const root = document.documentElement;
        root.style.setProperty('--accent-primary', this.settings.primaryColor || '#6366f1');
        root.style.setProperty('--accent-secondary', this.settings.secondaryColor || '#a855f7');
        document.title = this.settings.siteName;
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.save();
    }

    addMovie(movie) {
        if (movie.featured) this.movies.forEach(m => m.featured = false);
        this.movies.push({ ...movie, id: Date.now().toString() });
        this.save();
    }

    deleteMovie(id) {
        this.movies = this.movies.filter(m => m.id !== id);
        this.save();
    }

    getMoviesByCategory(cat) {
        return this.movies.filter(m => m.type === cat || m.genre.includes(cat));
    }
}

export const state = new State();
