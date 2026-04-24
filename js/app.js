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
            <div class="container nav-container" style="display:flex; justify-content:space-between; align-items:center; padding: 1.2rem 0;">
                <a href="#/" class="logo" style="text-decoration:none; color:white; font-size:1.8rem; font-weight:900; font-family:var(--font-heading); display:flex; align-items:center; gap:10px;">
                    ${s.logoUrl ? `<img src="${s.logoUrl}" height="35">` : `<div style="width:35px; height:35px; background:linear-gradient(var(--accent-primary), var(--accent-secondary)); border-radius:8px; display:flex; align-items:center; justify-content:center;"><i data-lucide="zap" style="color:white; width:20px;"></i></div> ${s.siteName}`}
                </a>
                <div class="nav-links" style="display:flex; gap:3rem;">
                    ${s.headerLinks.map(l => `<a href="#/" style="text-decoration:none; color:var(--text-muted); font-weight:600; font-size:0.9rem; transition:0.3s;">${l}</a>`).join('')}
                </div>
                <div class="nav-actions">
                    <div class="search-bar" style="background:rgba(255,255,255,0.05); padding:10px 20px; border-radius:50px; border:1px solid var(--glass-border); display:flex; align-items:center; gap:10px;">
                        <i data-lucide="search" style="width:18px; color:var(--text-muted);"></i>
                        <input type="text" placeholder="Search title..." style="background:none; border:none; color:white; outline:none; font-size:0.9rem;">
                    </div>
                </div>
            </div>
        `;
    }

    renderHome() {
        const featured = state.movies.find(m => m.featured) || state.movies[0] || {
            title: "Welcome to Vela",
            description: "Start your journey by adding your first movie in the Admin Portal.",
            banner: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2070&auto=format&fit=crop"
        };
        
        const cats = state.settings.homepageLayout;

        this.mainContent.innerHTML = `
            <section class="hero fade-in" style="height:90vh; background-size:cover; background-position:center; background-image: url('${featured.banner}')">
                <div class="hero-overlay" style="position:absolute; inset:0; background: linear-gradient(to right, var(--bg-deep) 15%, transparent 80%), linear-gradient(to top, var(--bg-deep) 10%, transparent 40%);"></div>
                <div class="container hero-content" style="position:relative; z-index:2; height:100%; display:flex; flex-direction:column; justify-content:center; max-width:800px;">
                    <div style="background:var(--accent-primary); color:white; padding:5px 15px; border-radius:4px; font-size:0.7rem; font-weight:900; width:fit-content; margin-bottom:1rem; letter-spacing:2px;">SPOTLIGHT</div>
                    <h1 style="font-size:5.5rem; line-height:0.9; margin-bottom:1.5rem; font-family:var(--font-heading); text-shadow:0 10px 30px rgba(0,0,0,0.5);">${featured.title}</h1>
                    <p style="font-size:1.3rem; color:var(--text-muted); margin-bottom:2.5rem; line-height:1.6; max-width:600px;">${featured.description}</p>
                    <div class="actions">
                        <a href="#/watch?id=${featured.id || '0'}" class="btn btn-primary"><i data-lucide="play" fill="white"></i> Watch Now</a>
                        <button class="btn" style="background:rgba(255,255,255,0.1); color:white; backdrop-filter:blur(10px); margin-left:15px;"><i data-lucide="info"></i> Details</button>
                    </div>
                </div>
            </section>
            
            <div class="container" style="margin-top:-100px; position:relative; z-index:5;">
                ${state.movies.length === 0 ? `
                    <div style="text-align:center; padding:5rem; background:rgba(255,255,255,0.03); border-radius:20px; border:1px dashed var(--glass-border);">
                        <h2 style="color:var(--text-muted);">No Content Yet</h2>
                        <p>Go to the Admin Portal to populate your library.</p>
                    </div>
                ` : cats.map(cat => {
                    const movies = state.getMoviesByCategory(cat);
                    if (movies.length === 0) return '';
                    return `
                        <section style="margin-bottom:4rem;">
                            <h2 style="font-size:1.8rem; margin-bottom:1.5rem; font-family:var(--font-heading); display:flex; align-items:center; gap:10px;">${cat} <i data-lucide="chevron-right" style="color:var(--accent-primary);"></i></h2>
                            <div class="movie-grid" style="display:flex; gap:20px; overflow-x:auto; padding-bottom:20px; scrollbar-width:none;">
                                ${movies.map(m => this.createCard(m)).join('')}
                            </div>
                        </section>
                    `;
                }).join('')}
            </div>
        `;
    }

    createCard(m) {
        return `
            <div class="movie-card" onclick="window.location.hash = '#/watch?id=${m.id}'" style="min-width:300px; cursor:pointer; transition:0.4s cubic-bezier(0.4, 0, 0.2, 1); position:relative;">
                <div class="poster" style="aspect-ratio:16/9; border-radius:12px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.4); border:1px solid var(--glass-border);">
                    <img src="${m.thumbnail}" style="width:100%; height:100%; object-fit:cover; transition:0.5s;">
                    <div class="overlay" style="position:absolute; inset:0; background:rgba(0,0,0,0.5); opacity:0; transition:0.3s; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px);">
                        <div style="width:60px; height:60px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; color:black;"><i data-lucide="play" fill="black"></i></div>
                    </div>
                </div>
                <div class="card-info" style="padding:1rem 0;">
                    <h3 style="font-size:1rem; font-weight:600;">${m.title}</h3>
                </div>
            </div>
        `;
    }

    // [Keep the rest of your app.js the same as before...]
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
                    <div id="cms-tab-content" class="fade-in">${this.renderTabContent()}</div>
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
                <h1 style="font-size:3rem; margin-bottom:2rem;">Dashboard</h1>
                <div class="stats-grid">
                    <div class="stat-card"><h3>Total Movies</h3><p style="font-size:3rem; font-weight:900; color:var(--accent-primary);">${state.movies.length}</p></div>
                    <div class="stat-card"><h3>Active Theme</h3><p>${s.primaryColor}</p></div>
                    <div class="stat-card"><h3>Server Status</h3><p style="color:#10b981;">Online</p></div>
                </div>
            `;
        }
        if (this.activeTab === 'appearance') {
            return `
                <h1>Site Appearance</h1>
                <form id="appearance-form" class="cms-form">
                    <div class="form-row"><label>Site Name</label><input name="siteName" value="${s.siteName}"></div>
                    <div class="form-row"><label>Logo URL</label><input name="logoUrl" value="${s.logoUrl}"></div>
                    <div class="form-row" style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                        <div><label>Primary Accent</label><input type="color" name="primaryColor" value="${s.primaryColor}" style="height:50px;"></div>
                        <div><label>Secondary Accent</label><input type="color" name="secondaryColor" value="${s.secondaryColor}" style="height:50px;"></div>
                    </div>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </form>
            `;
        }
        if (this.activeTab === 'content') {
            return `
                <h1>Content Management</h1>
                <div class="admin-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:3rem;">
                    <form id="add-movie-form" class="cms-form">
                        <h3>Publish New Movie</h3>
                        <input name="title" placeholder="Title" required>
                        <textarea name="desc" placeholder="Synopsis" required></textarea>
                        <input name="thumb" placeholder="Poster URL (16:9)" required>
                        <input name="banner" placeholder="Banner URL (Featured)" required>
                        <input name="genre" placeholder="Category (e.g. Anime)" required>
                        <input name="url" placeholder="Abyss.to Embed Link" required>
                        <label style="display:flex; align-items:center; gap:10px;"><input type="checkbox" name="featured" style="width:auto;"> Feature this in spotlight?</label>
                        <button type="submit" class="btn btn-primary">Publish Title</button>
                    </form>
                    <div class="movie-list">
                        <h3>Library</h3>
                        <div style="max-height:600px; overflow-y:auto;">
                            ${state.movies.map(m => `
                                <div style="padding:15px; background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); border-radius:10px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                                    <span>${m.title}</span>
                                    <button onclick="window.app.deleteMovie('${m.id}')" style="background:none; border:none; color:#ff4444; cursor:pointer;">Delete</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
        return `<h1>System</h1><p>Vela CMS v3.5 is running.</p>`;
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
                    secondaryColor: f.get('secondaryColor')
                });
                alert('Website Identity Updated!');
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
                alert('Published!');
                this.renderAdmin();
            };
        }
    }

    deleteMovie(id) {
        if(confirm("Delete forever?")) {
            state.deleteMovie(id);
            this.renderAdmin();
        }
    }

    renderWatch(id) {
        const m = state.movies.find(x => x.id === id);
        if(!m) return this.renderHome();
        this.mainContent.innerHTML = `
            <div class="watch-container" style="padding-top:80px; background:#000;">
                <div class="player-wrapper" style="width:100%; aspect-ratio:16/9; max-height:80vh; background:#000; box-shadow:0 30px 60px rgba(0,0,0,0.8);">
                    <iframe src="${m.embedUrl}" frameborder="0" allowfullscreen style="width:100%; height:100%;"></iframe>
                </div>
                <div class="container" style="padding:4rem 0;">
                    <h1 style="font-size:3rem; font-family:var(--font-heading); margin-bottom:1rem;">${m.title}</h1>
                    <p style="font-size:1.2rem; color:var(--text-muted); max-width:800px; line-height:1.8;">${m.description}</p>
                </div>
            </div>
        `;
    }

    renderFooter() {
        document.getElementById('footer').innerHTML = `
            <div class="container footer-content" style="display:flex; justify-content:space-between; align-items:center; opacity:0.6;">
                <p>&copy; 2024 ${state.settings.siteName}. All Rights Reserved.</p>
                <a href="#/portal" class="secret-link" style="text-decoration:none; color:inherit; font-size:0.8rem;">Admin Portal</a>
            </div>
        `;
    }
}

window.app = new App();
