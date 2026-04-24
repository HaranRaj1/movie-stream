import { state } from './state.js';

class App {
    constructor() {
        this.mainContent = document.getElementById('main-content');
        this.navbar = document.getElementById('navbar');
        this.activeTab = 'content';
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    }

    handleRoute() {
        const hash = window.location.hash || '#/';
        this.renderNavbar();
        
        if (hash === '#/portal') {
            this.checkAuth();
        } else if (hash.startsWith('#/watch')) {
            const id = new URLSearchParams(hash.split('?')[1]).get('id');
            this.renderWatch(id);
        } else {
            this.renderHome();
        }
        
        this.renderFooter();
        if (window.lucide) lucide.createIcons();
    }

    checkAuth() {
        if (!this.isAuthenticated) {
            const p = prompt("Enter Admin Password:");
            if (p === state.adminPassword) {
                this.isAuthenticated = true;
                this.renderAdmin();
            } else {
                window.location.hash = "#/";
            }
        } else {
            this.renderAdmin();
        }
    }

    renderNavbar() {
        this.navbar.innerHTML = `
            <div class="container nav-container">
                <a href="#/" class="logo">${state.settings.siteName}</a>
                <div class="nav-actions">
                    <div class="search-bar" style="background:rgba(255,255,255,0.05); padding:10px 20px; border-radius:50px; display:flex; align-items:center; gap:10px;">
                        <i data-lucide="search" style="width:18px;"></i>
                        <input type="text" placeholder="Search..." style="background:none; border:none; color:white; outline:none;">
                    </div>
                </div>
            </div>
        `;
    }

    renderHome() {
        const feat = state.movies.find(m => m.featured) || state.movies[0];
        const rows = state.settings.homepageLayout;

        this.mainContent.innerHTML = `
            <section class="hero" style="background-image: url('${feat.banner}')">
                <div class="hero-overlay"></div>
                <div class="container hero-content">
                    <div style="background:var(--accent-primary); padding:5px 15px; border-radius:4px; font-size:0.7rem; font-weight:900; width:fit-content; margin-bottom:1rem;">FEATURED</div>
                    <h1>${feat.title}</h1>
                    <p style="color:var(--text-muted); font-size:1.2rem; margin-bottom:2rem; max-width:600px;">${feat.description}</p>
                    <a href="#/watch?id=${feat.id}" class="btn btn-primary"><i data-lucide="play" fill="white"></i> Watch Now</a>
                </div>
            </section>
            <div class="container" style="margin-top:-80px;">
                ${rows.map(row => {
                    const movies = state.getMoviesByCategory(row);
                    if (movies.length === 0) return '';
                    return `
                        <section style="margin-bottom:3rem;">
                            <h2 style="font-family:var(--font-heading); font-size:1.8rem; margin-bottom:1rem;">${row}</h2>
                            <div class="movie-grid">
                                ${movies.map(m => `
                                    <div class="movie-card" onclick="window.location.hash='#/watch?id=${m.id}'">
                                        <div class="poster"><img src="${m.thumbnail}"><div style="position:absolute; inset:0; background:rgba(0,0,0,0.4); opacity:0; transition:0.3s; display:flex; align-items:center; justify-content:center;" class="hover-overlay"><i data-lucide="play" fill="white"></i></div></div>
                                        <h3 style="margin-top:10px; font-size:1rem;">${m.title}</h3>
                                    </div>
                                `).join('')}
                            </div>
                        </section>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderAdmin() {
        this.mainContent.innerHTML = `
            <div class="cms-wrapper">
                <aside class="cms-sidebar">
                    <h3>VELA CMS</h3>
                    <div style="display:flex; flex-direction:column; gap:10px; margin-top:2rem;">
                        <button onclick="window.app.setTab('content')" class="btn" style="color:white; background:#222;">Content</button>
                        <button onclick="window.app.setTab('identity')" class="btn" style="color:white; background:#222;">Identity</button>
                        <button onclick="window.location.hash='#/'" class="btn" style="color:white; background:#222;">Exit</button>
                    </div>
                </aside>
                <main class="cms-main container">
                    ${this.activeTab === 'identity' ? `
                        <h1>Site Identity</h1>
                        <form id="identity-form" class="admin-form">
                            <label>Site Name</label><input name="name" value="${state.settings.siteName}">
                            <label>Primary Color</label><input type="color" name="color" value="${state.settings.primaryColor}" style="height:50px;">
                            <button type="submit" class="btn btn-primary">Save Settings</button>
                        </form>
                    ` : `
                        <h1>Content Manager</h1>
                        <form id="add-form" class="admin-form">
                            <input name="title" placeholder="Title" required>
                            <textarea name="desc" placeholder="Synopsis" required></textarea>
                            <input name="thumb" placeholder="Poster URL" required>
                            <input name="banner" placeholder="Banner URL" required>
                            <input name="genre" placeholder="Category (e.g. Anime, Tamil Movies)" required>
                            <input name="url" placeholder="Abyss.to Link" required>
                            <label><input type="checkbox" name="feat"> Feature in Spotlight?</label>
                            <button type="submit" class="btn btn-primary">Add Movie</button>
                        </form>
                        <h3>Library</h3>
                        ${state.movies.map(m => `<div style="display:flex; justify-content:space-between; background:#111; padding:15px; border-radius:8px; margin-bottom:10px;"><span>${m.title}</span><button onclick="window.app.deleteMovie('${m.id}')" style="color:red; background:none; border:none; cursor:pointer;">Delete</button></div>`).join('')}
                    `}
                </main>
            </div>
        `;
        this.attachListeners();
    }

    setTab(t) { this.activeTab = t; this.renderAdmin(); }

    attachListeners() {
        const idForm = document.getElementById('identity-form');
        if (idForm) {
            idForm.onsubmit = (e) => {
                e.preventDefault();
                state.settings.siteName = new FormData(idForm).get('name');
                state.settings.primaryColor = new FormData(idForm).get('color');
                state.save(); alert("Identity Updated!"); this.renderAdmin();
            }
        }
        const addForm = document.getElementById('add-form');
        if (addForm) {
            addForm.onsubmit = (e) => {
                e.preventDefault();
                const f = new FormData(addForm);
                state.addMovie({
                    title: f.get('title'), description: f.get('desc'), thumbnail: f.get('thumb'),
                    banner: f.get('banner'), genre: [f.get('genre')], type: f.get('genre'),
                    embedUrl: f.get('url'), featured: f.get('feat') === 'on'
                });
                alert("Movie Added!"); this.renderAdmin();
            }
        }
    }

    deleteMovie(id) { state.deleteMovie(id); this.renderAdmin(); }

    renderWatch(id) {
        const m = state.movies.find(x => x.id === id);
        this.mainContent.innerHTML = `
            <div class="watch-container"><div class="player-wrapper"><iframe src="${m.embedUrl}" frameborder="0" allowfullscreen></iframe></div>
            <div class="container" style="padding:4rem 0;"><h1>${m.title}</h1><p style="color:var(--text-muted); font-size:1.2rem; margin-top:1rem;">${m.description}</p></div></div>
        `;
    }

    renderFooter() {
        document.getElementById('footer').innerHTML = `<div class="container" style="display:flex; justify-content:space-between;"><span>&copy; 2024 ${state.settings.siteName}</span><a href="#/portal" style="color:inherit; text-decoration:none;">Admin</a></div>`;
    }
}
window.app = new App();
