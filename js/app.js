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
        // This ensures the page refreshes properly when you click Admin
        window.addEventListener('hashchange', () => {
            this.handleRoute();
            window.scrollTo(0,0);
        });
        this.handleRoute();
    }

    handleRoute() {
        const hash = window.location.hash || '#/';
        this.renderNavbar();
        
        // Fix: Explicitly check for portal
        if (hash.includes('portal')) {
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
            // Delay slightly to ensure the browser is ready
            setTimeout(() => {
                const p = prompt("Vela CMS - Enter Password (Default is admin123):");
                if (p === 'admin123' || p === state.adminPassword) {
                    this.isAuthenticated = true;
                    this.renderAdmin();
                } else {
                    alert("Access Denied.");
                    window.location.hash = "#/";
                }
            }, 100);
        } else {
            this.renderAdmin();
        }
    }

    renderNavbar() {
        const s = state.settings;
        this.navbar.innerHTML = `
            <div class="container" style="display:flex; justify-content:space-between; align-items:center; padding: 1.5rem 0;">
                <a href="#/" style="text-decoration:none; color:white; font-size:2rem; font-weight:900; letter-spacing:-1px;">${s.siteName}</a>
                <div style="display:flex; gap:20px; align-items:center;">
                    <div style="background:rgba(255,255,255,0.05); padding:8px 20px; border-radius:50px; border:1px solid rgba(255,255,255,0.1);">
                        <input type="text" placeholder="Search..." style="background:none; border:none; color:white; outline:none;">
                    </div>
                </div>
            </div>
        `;
    }

    renderHome() {
        const feat = state.movies.find(m => m.featured) || state.movies[0];
        const rows = state.settings.homepageLayout || ['Trending'];

        this.mainContent.innerHTML = `
            <section class="hero" style="height:85vh; background-size:cover; background-position:center; background-image: url('${feat.banner}')">
                <div class="hero-overlay" style="position:absolute; inset:0; background: linear-gradient(to top, var(--bg-deep) 10%, transparent 70%), linear-gradient(to right, var(--bg-deep) 20%, transparent);"></div>
                <div class="container" style="position:relative; z-index:2; height:100%; display:flex; flex-direction:column; justify-content:center;">
                    <span style="background:var(--accent-primary); color:white; padding:4px 12px; border-radius:4px; font-size:0.7rem; font-weight:900; width:fit-content; margin-bottom:1rem;">SPOTLIGHT</span>
                    <h1 style="font-size:5rem; font-weight:900; margin-bottom:1rem; line-height:1;">${feat.title}</h1>
                    <p style="color:var(--text-muted); font-size:1.2rem; margin-bottom:2.5rem; max-width:600px;">${feat.description}</p>
                    <div style="display:flex; gap:15px;">
                        <a href="#/watch?id=${feat.id}" class="btn-primary" style="padding:15px 40px; border-radius:50px; text-decoration:none; font-weight:bold; display:flex; align-items:center; gap:10px;"><i data-lucide="play" fill="white"></i> Watch Now</a>
                    </div>
                </div>
            </section>
            <div class="container" style="margin-top:-60px; position:relative; z-index:10;">
                ${rows.map(row => {
                    const movies = state.getMoviesByCategory(row);
                    if (movies.length === 0) return '';
                    return `
                        <section style="margin-bottom:4rem;">
                            <h2 style="font-size:2rem; margin-bottom:1.5rem; font-weight:900;">${row}</h2>
                            <div class="movie-grid" style="display:flex; gap:25px; overflow-x:auto; padding-bottom:20px; scrollbar-width:none;">
                                ${movies.map(m => `
                                    <div class="movie-card" onclick="window.location.hash='#/watch?id=${m.id}'" style="min-width:320px; cursor:pointer;">
                                        <div class="poster" style="aspect-ratio:16/9; border-radius:15px; overflow:hidden; border:1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
                                            <img src="${m.thumbnail}" style="width:100%; height:100%; object-fit:cover;">
                                        </div>
                                        <h3 style="margin-top:15px; font-size:1.1rem; font-weight:600;">${m.title}</h3>
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
            <div class="cms-wrapper" style="display:flex; min-height:100vh; padding-top:80px; background:#000;">
                <aside style="width:260px; background:#0a0a0a; border-right:1px solid #222; padding:3rem 2rem;">
                    <h2 style="color:var(--accent-primary); font-weight:900;">VELA CMS</h2>
                    <div style="display:flex; flex-direction:column; gap:12px; margin-top:3rem;">
                        <button onclick="window.app.setTab('content')" style="background:#111; border:none; color:white; padding:15px; text-align:left; border-radius:10px; cursor:pointer;">Manage Content</button>
                        <button onclick="window.app.setTab('identity')" style="background:#111; border:none; color:white; padding:15px; text-align:left; border-radius:10px; cursor:pointer;">Site Identity</button>
                        <button onclick="window.location.hash='#/'" style="background:none; border:1px solid #333; color:white; padding:15px; border-radius:10px; cursor:pointer; margin-top:2rem;">Exit Admin</button>
                    </div>
                </aside>
                <main style="flex:1; padding:4rem;">
                    ${this.activeTab === 'identity' ? this.renderIdentityTab() : this.renderContentTab()}
                </main>
            </div>
        `;
        this.attachListeners();
    }

    renderIdentityTab() {
        const s = state.settings;
        return `
            <h1 style="font-size:3rem; margin-bottom:2rem;">Site Identity</h1>
            <form id="identity-form" style="display:flex; flex-direction:column; gap:1.5rem; max-width:500px;">
                <div><label>Website Name</label><input name="name" value="${s.siteName}" style="width:100%; padding:15px; background:#111; border:1px solid #333; color:white; border-radius:8px; margin-top:10px;"></div>
                <div><label>Brand Theme Color</label><input type="color" name="color" value="${s.primaryColor}" style="width:100%; height:60px; background:none; border:none; margin-top:10px;"></div>
                <button type="submit" class="btn-primary" style="padding:15px; border:none; border-radius:8px; font-weight:bold;">Save Global Settings</button>
            </form>
        `;
    }

    renderContentTab() {
        return `
            <h1 style="font-size:3rem; margin-bottom:2rem;">Content Manager</h1>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:4rem;">
                <form id="add-form" style="display:flex; flex-direction:column; gap:1rem;">
                    <h3>Add New Title</h3>
                    <input name="title" placeholder="Movie Title" required style="padding:12px; background:#111; border:1px solid #333; color:white; border-radius:8px;">
                    <textarea name="desc" placeholder="Synopsis" required style="padding:12px; background:#111; border:1px solid #333; color:white; border-radius:8px; height:100px;"></textarea>
                    <input name="thumb" placeholder="Poster URL (16:9)" required style="padding:12px; background:#111; border:1px solid #333; color:white; border-radius:8px;">
                    <input name="banner" placeholder="Banner URL (Wide)" required style="padding:12px; background:#111; border:1px solid #333; color:white; border-radius:8px;">
                    <input name="genre" placeholder="Category (e.g. Anime, Tamil Movies)" required style="padding:12px; background:#111; border:1px solid #333; color:white; border-radius:8px;">
                    <input name="url" placeholder="Abyss.to Embed Link" required style="padding:12px; background:#111; border:1px solid #333; color:white; border-radius:8px;">
                    <label style="display:flex; align-items:center; gap:10px;"><input type="checkbox" name="feat"> Spotlight on Homepage?</label>
                    <button type="submit" class="btn-primary" style="padding:15px; border:none; border-radius:8px; font-weight:bold;">Publish to Website</button>
                </form>
                <div>
                    <h3>Current Library</h3>
                    <div style="max-height:600px; overflow-y:auto; display:flex; flex-direction:column; gap:10px;">
                        ${state.movies.map(m => `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                                <span>${m.title}</span>
                                <button onclick="window.app.deleteMovie('${m.id}')" style="color:#ff4444; background:none; border:none; cursor:pointer; font-weight:bold;">Remove</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    setTab(t) { this.activeTab = t; this.renderAdmin(); }

    attachListeners() {
        const idForm = document.getElementById('identity-form');
        if (idForm) {
            idForm.onsubmit = (e) => {
                e.preventDefault();
                const f = new FormData(idForm);
                state.settings.siteName = f.get('name');
                state.settings.primaryColor = f.get('color');
                state.save(); alert("Site Identity Updated!"); this.renderAdmin();
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
                alert("Movie Successfully Added!"); this.renderAdmin();
            }
        }
    }

    deleteMovie(id) { if(confirm("Are you sure?")) { state.deleteMovie(id); this.renderAdmin(); } }

    renderWatch(id) {
        const m = state.movies.find(x => x.id === id);
        if(!m) return this.renderHome();
        this.mainContent.innerHTML = `
            <div class="watch-container" style="background:#000;">
                <div class="player-wrapper"><iframe src="${m.embedUrl}" frameborder="0" allowfullscreen></iframe></div>
                <div class="container" style="padding:4rem 0;">
                    <h1 style="font-size:3.5rem; font-weight:900;">${m.title}</h1>
                    <p style="color:var(--text-muted); font-size:1.3rem; margin-top:1.5rem; line-height:1.8; max-width:850px;">${m.description}</p>
                </div>
            </div>
        `;
    }

    renderFooter() {
        document.getElementById('footer').innerHTML = `
            <div class="container" style="padding:5rem 0; display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.05);">
                <span style="font-weight:700;">&copy; 2024 ${state.settings.siteName}</span>
                <a href="#/portal" style="color:var(--text-muted); text-decoration:none; font-size:0.9rem; font-weight:600; opacity:0.6; transition:0.3s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">Admin Access</a>
            </div>
        `;
    }
}
window.app = new App();
