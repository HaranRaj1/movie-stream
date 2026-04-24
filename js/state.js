// [js/state.js] - Vela CMS v4.0 Core
const INITIAL_CONFIG = {
    appearance: {
        siteName: 'VELA STREAM',
        logoUrl: '',
        primaryColor: '#6366f1',
        secondaryColor: '#a855f7',
        font: 'Outfit',
        cardStyle: 'rounded' // rounded | sharp
    },
    layout: {
        homepageOrder: ['Trending Now', 'New Releases', 'Action', 'Anime', 'Tamil Movies'],
        showContinueWatching: true,
        showHeroTrailer: true
    },
    ads: {
        bannerAdUrl: '',
        showAds: false
    },
    seo: {
        description: 'Premium Ad-Free OTT Streaming Platform',
        keywords: 'movies, streaming, ott, watch free'
    }
};

const INITIAL_CONTENT = [
    {
        id: '1',
        title: 'Interstellar',
        description: 'When humanity is on the brink of extinction, a group of astronauts travel through a wormhole...',
        thumbnail: 'https://image.tmdb.org/t/p/w500/gEU2QniE6EwfVnz6nuzpczhbsNQ.jpg',
        banner: 'https://image.tmdb.org/t/p/original/rAiT6vL7v9Lp0vRjI6haasP99uP.jpg',
        genre: 'Sci-Fi',
        type: 'Trending Now',
        isSeries: false,
        embedUrl: 'https://abyss.to/e/placeholder',
        featured: true,
        rating: 8.7
    }
];

class State {
    constructor() {
        this.content = JSON.parse(localStorage.getItem('vela_content')) || INITIAL_CONTENT;
        this.config = JSON.parse(localStorage.getItem('vela_config')) || INITIAL_CONFIG;
        this.adminPass = 'admin123';
        this.applyConfig();
    }

    save() {
        localStorage.setItem('vela_content', JSON.stringify(this.content));
        localStorage.setItem('vela_config', JSON.stringify(this.config));
        this.applyConfig();
    }

    applyConfig() {
        const root = document.documentElement;
        const a = this.config.appearance;
        root.style.setProperty('--accent', a.primaryColor);
        root.style.setProperty('--accent-secondary', a.secondaryColor);
        root.style.setProperty('--card-radius', a.cardStyle === 'rounded' ? '12px' : '2px');
        document.title = a.siteName;
    }

    getContentByRow(row) {
        return this.content.filter(item => item.type === row);
    }

    addContent(item) {
        if (item.featured) this.content.forEach(x => x.featured = false);
        this.content.push({ ...item, id: Date.now().toString() });
        this.save();
    }

    deleteContent(id) {
        this.content = this.content.filter(item => item.id !== id);
        this.save();
    }

    getFeatured() {
        return this.content.find(i => i.featured) || this.content[0];
    }
}

export const state = new State();
