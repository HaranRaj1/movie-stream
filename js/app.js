import { state } from './state.js';

class App {
    constructor() {
        this.mainContent = document.getElementById('main-content');
        this.navbar = document.getElementById('navbar');
        this.isAdminAuthenticated = false;
        this.activeTab = 'overview';
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
            this.checkAdminAuth();
        } else if (hash.startsWith('#/watch')) {
            const params = new URLSearchParams(hash.split('?')[1]);
            this.renderWatch(params.get('id'));
        } else {
            this.renderHome();
        }
        
        this.renderFooter();
        lucide.createIcons();
    }

    checkAdminAuth() {
        if (!this.isAdminAuthenticated) {
            const pass = prompt("Enter Admin CMS Password:");
            if (pass === state.adminPassword) {
                this.isAdminAuthenticated = true;
                this.renderAdmin();
            } else {
                window.location.hash = "#/";
            }
        } else {
            this.renderAdmin();
        }
    }

    renderNavbar() {
        const s = state.settings;
        this.navbar.innerHTML = `
            <div class="container nav-container">
                <a href="#/" class="logo">
                    ${s.logoUrl ? `<img src="${s.logoUrl}" height="30">` : `<i data-lucide="zap"></i> ${s.siteName}`}
                </a>
                <div class="nav-links">
                    ${s.headerLinks.map(l => `<a href="#/">${l}</a>`).join('')}
                </div>
                <div class="nav-actions">
                    <div class="search-bar"><i data-lucide="search"></i><input type="text" placeholder="Search..."></div>
                </div>
            </div>
        `;
    }

    renderHome() {
        const featured = state.movies.find(m => m.featured) || state.movies[0];
        const cats = state.settings.homepageLayout;

        this.mainContent.innerHTML = `
            <section class="hero" style="background-image: url('${featured.banner}')">
                <div class="hero-overlay"></div>
                <div class="container hero-content">
                    <h1>${featured.title}</h1>
                    <p>${featured.description}</p>
                    <a href="#/watch?id=${featured.id}" class="btn btn-primary">Watch Now</a>
                </div>
            </section>
            <div class="container">
                ${cats.map(cat => `
                    <section class="carousel-section">
                        <h2>${cat}</h2>
                        <div class="movie-grid">
                            ${state.getMoviesByCategory(cat).map(m => this.createCard(m)).join('')}
                        </div>
                    </section>
                `).join('')}
            </div>
        `;
    }

    createCard(m) {
        return `
            <div class="movie-card" onclick="window.location.hash = '#/watch?id=${m.id}'">
                <div class="poster"><img src="${m.thumbnail}"><div class="overlay"><i data-lucide="play"></i></div></div>
                <div class="card-info"><h3>${m.title}</h3></div>
            </div>
        `;
    }

    renderAdmin() {
        this.mainContent.innerHTML = `
            <div class="cms-wrapper">
                <aside class="cms-sidebar">
                    <div class="sidebar-header"><h3>VELA CMS</h3></div>
                    <nav class="sidebar-nav">
                        <button onclick="window.app.setTab('overview')"><i data-lucide="layout"></i> Overview</button>
                        <button onclick="window.app.setTab('content')"><i data-lucide="film"></i> Content</button>
                        <button onclick="window.app.setTab('appearance')"><i data-lucide="palette"></i> Appearance</button>
                        <button onclick="window.app.setTab('settings')"><i data-lucide="settings"></i> System</button>
                        <button onclick="state.exportData()"><i data-lucide="download"></i> Backup</button>
                    </nav>
                </aside>
                <main class="cms-main container">
                    <div id="cms-tab-content">${this.renderTabContent()}</div>
                </main>
            </div>
        `;
        lucide.createIcons();
        this.attachAdminListeners();
    }

    setTab(tab) {
        this.activeTab = tab;
        this.renderAdmin();
    }

    renderTabContent() {
        const s = state.settings;
        if (this.activeTab === 'overview') {
            return `
                <h1>Dashboard</h1>
                <div class="stats-grid">
                    <div class="stat-card"><h3>Total Titles</h3><p>${state.movies.length}</p></div>
                    <div class="stat-card"><h3>Categories</h3><p>${s.homepageLayout.length}</p></div>
                    <div class="stat-card"><h3>System Status</h3><p>Online</p></div>
                </div>
            `;
        }
        if (this.activeTab === 'appearance') {
            return `
                <h1>Site Appearance</h1>
                <form id="appearance-form" class="cms-form">
                    <label>Site Name</label><input name="siteName" value="${s.siteName}">
                    <label>Logo URL</label><input name="logoUrl" value="${s.logoUrl}">
                    <label>Primary Color</label><input type="color" name="primaryColor" value="${s.primaryColor}">
                    <label>Secondary Color</label><input type="color" name="secondaryColor" value="${s.secondaryColor}">
                    <label>Font Family</label>
                    <select name="fontFamily">
                        <option value="Outfit" ${s.fontFamily === 'Outfit' ? 'selected' : ''}>Outfit (Modern)</option>
                        <option value="Inter" ${s.fontFamily === 'Inter' ? 'selected' : ''}>Inter (Clean)</option>
                    </select>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </form>
            `;
        }
        if (this.activeTab === 'content') {
            return `
                <h1>Manage Library</h1>
                <div class="admin-grid">
                    <form id="add-movie-form" class="cms-form">
                        <h3>Add New Movie</h3>
                        <input name="title" placeholder="Title" required>
                        <textarea name="desc" placeholder="Synopsis" required></textarea>
                        <input name="thumb" placeholder="Poster URL" required>
                        <input name="banner" placeholder="Banner URL" required>
                        <input name="genre" placeholder="Category (e.g. Anime)" required>
                        <input name="url" placeholder="Abyss.to Link" required>
                        <label><input type="checkbox" name="featured"> Spotlight Featured?</label>
                        <button type="submit" class="btn btn-primary">Add Title</button>
                    </form>
                    <div class="movie-list">
                        <h3>All Titles</h3>
                        ${state.movies.map(m => `<div class="list-item"><span>${m.title}</span> <button onclick="window.app.deleteMovie('${m.id}')" class="delete-btn">Delete</button></div>`).join('')}
                    </div>
                </div>
            `;
        }
        return `<h1>System Settings</h1><p>Maintenance mode and advanced SEO controls coming in v3.1</p>`;
    }

    attachAdminListeners() {
        const appForm = document.getElementById('appearance-form');
        if (appForm) {
            appForm.onsubmit = (e) => {
                e.preventDefault();
                const f = new FormData(appForm);
                state.updateSettings({
                    siteName: f.get('siteName'),
                    logoUrl: f.get('logoUrl'),
                    primaryColor: f.get('primaryColor'),
                    secondaryColor: f.get('secondaryColor'),
                    fontFamily: f.get('fontFamily')
                });
                alert('Theme updated successfully!');
                this.renderAdmin();
            };
        }
        
        const contentForm = document.getElementById('add-movie-form');
        if (contentForm) {
            contentForm.onsubmit = (e) => {
                e.preventDefault();
                const f = new FormData(contentForm);
                state.addMovie({
                    title: f.get('title'), description: f.get('desc'),
                    thumbnail: f.get('thumb'), banner: f.get('banner'),
                    genre: [f.get('genre')], type: f.get('genre'),
                    embedUrl: f.get('url'), featured: f.get('featured') === 'on'
                });
                alert('Movie Added!');
                this.renderAdmin();
            };
        }
    }

    deleteMovie(id) {
        if(confirm("Delete this title?")) {
            state.deleteMovie(id);
            this.renderAdmin();
        }
    }

    renderWatch(id) {
        const m = state.movies.find(x => x.id === id);
        this.mainContent.innerHTML = `<div class="watch-container"><div class="player-wrapper"><iframe src="${m.embedUrl}" frameborder="0" allowfullscreen></iframe></div><div class="container" style="padding:2rem;"><h1>${m.title}</h1><p>${m.description}</p></div></div>`;
    }

    renderFooter() {
        document.getElementById('footer').innerHTML = `<div class="container footer-content"><p>&copy; 2024 ${state.settings.siteName}</p><a href="#/portal" class="secret-link">CMS Admin</a></div>`;
    }
}

window.app = new App();
