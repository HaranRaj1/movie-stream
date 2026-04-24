// [js/state.js] - Vela CMS Core Engine
const DEFAULT_SETTINGS = {
    siteName: 'Vela Stream',
    logoUrl: '',
    primaryColor: '#6366f1',
    secondaryColor: '#a855f7',
    fontFamily: 'Outfit',
    seoDescription: 'Premium Cinematic Experience',
    maintenanceMode: false,
    headerLinks: ['Home', 'Movies', 'TV Shows'],
    homepageLayout: ['Trending', 'Anime', 'Tamil Movies', 'New Releases'],
    adPlacements: { header: false, footer: false, player: false }
};

const DEFAULT_MOVIES = [
    {
        id: '1',
        title: 'Interstellar',
        description: 'A team of explorers travel through a wormhole in space...',
        thumbnail: 'https://image.tmdb.org/t/p/w500/gEU2QniE6EwfVnz6nuzpczhbsNQ.jpg',
        banner: 'https://image.tmdb.org/t/p/original/rAiT6vL7v9Lp0vRjI6haasP99uP.jpg',
        genre: ['Sci-Fi'],
        rating: 8.7,
        embedUrl: 'https://abyss.to/e/placeholder1',
        featured: true,
        type: 'Trending',
        episodes: []
    }
];

class State {
    constructor() {
        this.movies = JSON.parse(localStorage.getItem('vela_movies')) || DEFAULT_MOVIES;
        this.settings = JSON.parse(localStorage.getItem('vela_settings')) || DEFAULT_SETTINGS;
        this.adminPassword = 'admin123';
        this.applyTheme();
    }

    save() {
        localStorage.setItem('vela_movies', JSON.stringify(this.movies));
        localStorage.setItem('vela_settings', JSON.stringify(this.settings));
        this.applyTheme();
    }

    applyTheme() {
        const root = document.documentElement;
        root.style.setProperty('--accent-primary', this.settings.primaryColor);
        root.style.setProperty('--accent-secondary', this.settings.secondaryColor);
        root.style.setProperty('--font-heading', `'${this.settings.fontFamily}', sans-serif`);
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

    exportData() {
        const data = { movies: this.movies, settings: this.settings };
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vela_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
    }

    getMoviesByCategory(cat) {
        return this.movies.filter(m => m.type === cat || m.genre.includes(cat));
    }
}

export const state = new State();
