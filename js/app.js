// [js/app.js] - Rebuilt with fail-safe Portal Access
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
        if (window.lucide) lucide.createIcons();
    }

    checkAdminAuth() {
        if (!this.isAdminAuthenticated) {
            const pass = prompt("Admin Portal - Enter Password:");
            if (pass === state.adminPassword) {
                this.isAdminAuthenticated = true;
                this.renderAdmin();
            } else {
                alert("Wrong password!");
                window.location.hash = "#/";
            }
        } else {
            this.renderAdmin();
        }
    }

    renderNavbar() {
        const s = state.settings;
        this.navbar.innerHTML = `
            <div class="container nav-container" style="display:flex; justify-content:space-between; align-items:center; padding: 1.2rem 0;">
                <a href="#/" class="logo" style="text-decoration:none; color:white; font-size:1.8rem; font-weight:900;">
                    ${s.siteName}
                </a>
                <div class="nav-actions">
                    <div class="search-bar" style="background:rgba(255,255,255,0.05); padding:10px 20px; border-radius:50px; display:flex; align-items:center; gap:10px;">
                        <input type="text" placeholder="Search..." style="background:none; border:none; color:white; outline:none;">
                    </div>
                </div>
            </div>
        `;
    }

    renderHome() {
        const featured = state.movies.find(m => m.featured) || state.movies[0];
        const cats = state.settings.homepageLayout;

        this.mainContent.innerHTML = `
            <section class="hero fade-in" style="height:80vh; background-size:cover; background-position:center; background-image: url('${featured.banner}')">
                <div class="hero-overlay" style="position:absolute; inset:0; background: linear-gradient(to top, var(--bg-deep) 10%, transparent 70%);"></div>
                <div class="container hero-content" style="position:relative; z-index:2; height:100%; display:flex; flex-direction:column; justify-content:center;">
                    <h1 style="font-size:5rem;">${featured.title}</h1>
                    <p style="font-size:1.2rem; color:var(--text-muted); margin-bottom:2rem;">${featured.description}</p>
                    <a href="#/watch?id=${featured.id}" class="btn btn-primary">Watch Now</a>
                </div>
            </section>
            <div class="container">
                ${cats.map(cat => {
                    const movies = state.getMoviesByCategory(cat);
                    if (movies.length === 0) return '';
                    return `
                        <section style="margin-top:3rem;">
                            <h2>${cat}</h2>
                            <div class="movie-grid" style="display:flex; gap:20px; overflow-x:auto; padding:20px 0;">
                                ${movies.map(m => `
                                    <div class="movie-card" onclick="window.location.hash='#/watch?id=${m.id}'" style="min-width:260px; cursor:pointer;">
                                        <div class="poster" style="aspect-ratio:16/9; background:#111; border-radius:8px; overflow:hidden;">
                                            <img src="${m.thumbnail}" style="width:100%; height:100%; object-fit:cover;">
                                        </div>
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
            <div class="cms-wrapper" style="display:flex; min-height:100vh; padding-top:80px;">
                <aside style="width:260px; background:#0a0a0a; border-right:1px solid #222; padding:2rem;">
                    <h3>VELA CMS</h3>
                    <div style="display:flex; flex-direction:column; gap:10px; margin-top:2rem;">
                        <button onclick="window.app.setTab('content')" class="btn" style="color:white; background: #222; border: none; padding: 10px; cursor: pointer;">Content</button>
                        <button onclick="window.app.setTab('appearance')" class="btn" style="color:white; background: #222; border: none; padding: 10px; cursor: pointer;">Identity</button>
                        <button onclick="window.location.hash='#/'" class="btn" style="color:white; background: #222; border: none; padding: 10px; cursor: pointer;">Exit</button>
                    </div>
                </aside>
                <main style="flex:1; padding:3rem;">
                    <div id="cms-tab-content">${this.renderTabContent()}</div>
                </main>
            </div>
        `;
        this.attachAdminListeners();
    }

    setTab(tab) {
        this.activeTab = tab;
        this.renderAdmin();
    }

    renderTabContent() {
        const s = state.settings;
        if (this.activeTab === 'appearance') {
            return `
                <h1>Website Identity</h1>
                <form id="appearance-form" style="display:flex; flex-direction:column; gap:1rem; max-width:500px;">
                    <label>Site Name</label><input name="siteName" value="${s.siteName}" style="padding:10px; background:#000; border:1px solid #333; color:white;">
                    <label>Primary Color</label><input type="color" name="primaryColor" value="${s.primaryColor}" style="height:50px;">
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </form>
            `;
        }
        return `
            <h1>Content Manager</h1>
            <form id="add-movie-form" style="display:flex; flex-direction:column; gap:1rem; max-width:500px; margin-bottom:4rem;">
                <input name="title" placeholder="Title" required style="padding:10px; background:#000; border:1px solid #333; color:white;">
                <textarea name="desc" placeholder="Synopsis" required style="padding:10px; background:#000; border:1px solid #333; color:white;"></textarea>
                <input name="thumb" placeholder="Poster URL" required style="padding:10px; background:#000; border:1px solid #333; color:white;">
                <input name="banner" placeholder="Banner URL" required style="padding:10px; background:#000; border:1px solid #333; color:white;">
                <input name="genre" placeholder="Category (e.g. Anime)" required style="padding:10px; background:#000; border:1px solid #333; color:white;">
                <input name="url" placeholder="Abyss.to Link" required style="padding:10px; background:#000; border:1px solid #333; color:white;">
                <button type="submit" class="btn btn-primary">Add Movie</button>
            </form>
            <h3>Existing Library</h3>
            <div style="display:flex; flex-direction:column; gap:10px;">
                ${state.movies.map(m => `<div style="display:flex; justify-content:space-between; background:#111; padding:15px; border-radius:5px;"><span>${m.title}</span><button onclick="window.app.deleteMovie('${m.id}')" style="color:red; background:none; border:none; cursor:pointer;">Delete</button></div>`).join('')}
            </div>
        `;
    }

    attachAdminListeners() {
        const appForm = document.getElementById('appearance-form');
        if (appForm) {
            appForm.onsubmit = (e) => {
                e.preventDefault();
                const f = new FormData(appForm);
                state.updateSettings({ siteName: f.get('siteName'), primaryColor: f.get('primaryColor') });
                alert('Updated!');
                this.renderAdmin();
            };
        }
        const movieForm = document.getElementById('add-movie-form');
        if (movieForm) {
            movieForm.onsubmit = (e) => {
                e.preventDefault();
                const f = new FormData(movieForm);
                state.addMovie({
                    title: f.get('title'), description: f.get('desc'),
                    thumbnail: f.get('thumb'), banner: f.get('banner'),
                    genre: [f.get('genre')], type: f.get('genre'),
                    embedUrl: f.get('url')
                });
                alert('Added!');
                this.renderAdmin();
            };
        }
    }

    deleteMovie(id) {
        state.deleteMovie(id);
        this.renderAdmin();
    }

    renderWatch(id) {
        const m = state.movies.find(x => x.id === id);
        if(!m) return this.renderHome();
        this.mainContent.innerHTML = `<div class="watch-container"><div class="player-wrapper"><iframe src="${m.embedUrl}" frameborder="0" allowfullscreen style="width:100%; height:100%;"></iframe></div><div class="container" style="padding:2rem;"><h1>${m.title}</h1><p>${m.description}</p></div></div>`;
    }

    renderFooter() {
        document.getElementById('footer').innerHTML = `<div class="container" style="padding:4rem 0; opacity:0.5; display:flex; justify-content:space-between;"><span>&copy; 2024 ${state.settings.siteName}</span><a href="#/portal" style="color:inherit; text-decoration:none;">Admin Portal</a></div>`;
    }
}

window.app = new App();
