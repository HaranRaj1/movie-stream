// [js/state.js] - Security & State Engine v4.5
const INITIAL_CONFIG = {
    appearance: {
        siteName: 'VELA STREAM',
        logoUrl: '',
        primaryColor: '#6366f1',
        secondaryColor: '#a855f7',
        font: 'Outfit',
        cardStyle: 'rounded'
    },
    security: {
        adminUser: 'admin',
        adminPass: 'Haran@stream2026!',
        twoStepEnabled: false,
        twoStepPin: '0000',
        autoLogoutMinutes: 15
    },
    layout: {
        homepageOrder: ['Trending Now', 'New Releases', 'Action', 'Anime', 'Tamil Movies'],
        showContinueWatching: true
    },
    logs: []
};

const INITIAL_CONTENT = [
    {
        id: '1',
        title: 'Vela Premium',
        description: 'Your secure streaming platform is ready. Access the Master Dashboard to begin.',
        thumbnail: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2070&auto=format&fit=crop',
        banner: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2070&auto=format&fit=crop',
        genre: 'Welcome',
        type: 'Trending Now',
        featured: true,
        embedUrl: ''
    }
];

class State {
    constructor() {
        this.content = JSON.parse(localStorage.getItem('vela_content')) || INITIAL_CONTENT;
        this.config = JSON.parse(localStorage.getItem('vela_config')) || INITIAL_CONFIG;
        this.applyConfig();
    }

    save() {
        localStorage.setItem('vela_content', JSON.stringify(this.content));
        localStorage.setItem('vela_config', JSON.stringify(this.config));
        this.applyConfig();
    }

    addLog(action) {
        const entry = { action, time: new Date().toLocaleString() };
        this.config.logs.unshift(entry);
        if (this.config.logs.length > 50) this.config.logs.pop();
        this.save();
    }

    applyConfig() {
        const root = document.documentElement;
        const a = this.config.appearance;
        root.style.setProperty('--accent', a.primaryColor);
        root.style.setProperty('--accent-secondary', a.secondaryColor);
        root.style.setProperty('--card-radius', a.cardStyle === 'rounded' ? '12px' : '2px');
        document.title = a.siteName;
    }

    updateSecurity(user, pass, pin, twoStep) {
        this.config.security.adminUser = user;
        this.config.security.adminPass = pass;
        this.config.security.twoStepPin = pin;
        this.config.security.twoStepEnabled = twoStep;
        this.addLog("Security settings updated");
        this.save();
    }

    addContent(item) {
        if (item.featured) this.content.forEach(x => x.featured = false);
        this.content.push({ ...item, id: Date.now().toString() });
        this.addLog(`Added content: ${item.title}`);
        this.save();
    }

    deleteContent(id) {
        const item = this.content.find(i => i.id === id);
        this.content = this.content.filter(i => i.id !== id);
        this.addLog(`Deleted content: ${item?.title || id}`);
        this.save();
    }

    getMoviesByCategory(cat) { return this.content.filter(i => i.type === cat); }
    getFeatured() { return this.content.find(i => i.featured) || this.content[0]; }
}

export const state = new State();
