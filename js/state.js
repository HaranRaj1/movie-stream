// [js/state.js] - Master OTT State Engine v5.0
const INITIAL_CONFIG = {
    appearance: {
        siteName: 'StreamFlix',
        logoDesktop: '',
        logoMobile: '',
        primaryColor: '#E50914',
        secondaryColor: '#ffffff',
        surfaceColor: '#12121a',
        buttonStyle: 'rounded-xl', // rounded-xl | rounded-none | rounded-full
        cardStyle: 'rounded-2xl',
        announcementBar: { text: 'Welcome to the New StreamFlix!', enabled: true }
    },
    layout: {
        homepageRows: ["Trending Now", "Popular on StreamFlix", "Action & Adventure", "Sci-Fi & Fantasy"],
        showTop10: true,
        heroMovies: [0]
    },
    monetization: {
        ads: [
            { id: 'top-banner', name: 'Homepage Top Banner', content: '', link: '', enabled: false },
            { id: 'player-ad', name: 'Under Player Ad', content: '', link: '', enabled: false }
        ]
    },
    security: { adminUser: 'admin', adminPass: 'Haran@stream2026!' }
};

const INITIAL_MOVIES = [
    { id: 0, title: "The Last Horizon", desc: "A cinematic sci-fi epic.", banner: "https://picsum.photos/seed/hero/1920/1080.jpg", type: "Trending Now", embedUrl: "", featured: true }
];

class State {
    constructor() {
        this.movies = JSON.parse(localStorage.getItem('sf_movies')) || INITIAL_MOVIES;
        this.config = JSON.parse(localStorage.getItem('sf_config')) || INITIAL_CONFIG;
        this.applyTheme();
    }
    save() {
        localStorage.setItem('sf_movies', JSON.stringify(this.movies));
        localStorage.setItem('sf_config', JSON.stringify(this.config));
        this.applyTheme();
    }
    applyTheme() {
        const root = document.documentElement;
        const a = this.config.appearance;
        root.style.setProperty('--sf-red', a.primaryColor);
        root.style.setProperty('--sf-surface', a.surfaceColor);
        document.title = a.siteName;
    }
    addMovie(m) { this.movies.push({ ...m, id: Date.now() }); this.save(); }
    deleteMovie(id) { this.movies = this.movies.filter(m => m.id !== id); this.save(); }
}
export const state = new State();
