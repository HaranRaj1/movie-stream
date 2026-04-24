// [js/state.js] - The Brain of StreamFlix
const INITIAL_MOVIES = [
    { id: 0, title: "The Last Horizon", genre: "scifi", year: 2024, duration: "2h 34m", maturity: "TV-MA", desc: "In a world where simulation blurs with reality...", cast: "Emma Stone, Oscar Isaac", banner: "https://picsum.photos/seed/hero/1920/1080.jpg", type: "Trending Now", embedUrl: "" }
];

const INITIAL_CONFIG = {
    appearance: { siteName: "StreamFlix", primaryColor: "#E50914", grainIntensity: 0.03 },
    security: { adminUser: 'admin', adminPass: 'Haran@stream2026!' },
    layout: { homepageRows: ["Trending Now", "Popular on StreamFlix", "Action & Adventure"], top10Ids: [0] }
};

class State {
    constructor() {
        this.movies = JSON.parse(localStorage.getItem('sf_movies')) || INITIAL_MOVIES;
        this.config = JSON.parse(localStorage.getItem('sf_config')) || INITIAL_CONFIG;
        this.save();
    }
    save() {
        localStorage.setItem('sf_movies', JSON.stringify(this.movies));
        localStorage.setItem('sf_config', JSON.stringify(this.config));
    }
    addMovie(m) { this.movies.push({ ...m, id: Date.now() }); this.save(); }
    deleteMovie(id) { this.movies = this.movies.filter(m => m.id !== id); this.save(); }
}
export const state = new State();
