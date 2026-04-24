import { state } from './state.js';

class App {
    constructor() {
        this.viewport = document.getElementById('view-port');
        this.nav = document.getElementById('main-nav');
        this.isAuthenticated = false;
        this.adminTab = 'overview';
        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => this.router());
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) this.nav.classList.add('scrolled');
            else this.nav.classList.remove('scrolled');
        });
        this.router();
    }

    router() {
        const hash = window.location.hash || '#/';
        this.renderNav();
        
        if (hash === '#/portal') {
            this.handleAdminAuth();
        } else if (hash.startsWith('#/watch')) {
            const id = new URLSearchParams(hash.split('?')[1]).get('id');
            this.renderWatch(id);
        } else {
            this.renderHome();
        }
        
        this.renderFooter();
        if (window.lucide) lucide.createIcons();
    }

    handleAdminAuth() {
        if (!this.isAuthenticated) {
            const p = prompt("Vela Master Login:");
            if (p === state.adminPass) {
                this.isAuthenticated = true;
                this.renderAdmin();
            } else {
                window.location.hash = "#/";
            }
        } else {
            this.renderAdmin();
        }
    }

    renderNav() {
        const a = state.config.appearance;
        this.nav.innerHTML = `
            <div class="container" style="display:flex; justify-content:space-between; align-items:center;">
                <a href="#/" style="text-decoration:none; color:white; font-size:2rem; font-weight:900;">${a.siteName}</a>
                <div style="display:flex; gap:30px; font-weight:600; font-size:0.9rem;">
                    <a href="#/" style="text-decoration:none; color:white;">Home</a>
                    <a href="#/" style="text-decoration:none; color:var(--text-muted);">Movies</a>
                    <a href="#/" style="text-decoration:none; color:var(--text-muted);">Series</a>
                </div>
                <div style="background:rgba(255,255,255,0.08); padding:10px 20px; border-radius:50px; display:flex; align-items:center; gap:10px;">
                    <i data-lucide="search" style="width:18px;"></i>
                    <input type="text" placeholder="Search titles..." style="background:none; border:none; color:white; outline:none;">
                </div>
            </div>
        `;
    }

    renderHome() {
        const f = state.getFeatured();
        const rows = state.config.layout.homepageOrder;

        this.viewport.innerHTML = `
            <section class="hero-v4" style="background-image: url('${f.banner}')">
                <div class="container content fade-in">
                    <span style="color:var(--accent); font-weight:900; letter-spacing:3px; font-size:0.8rem;">SPOTLIGHT</span>
                    <h1>${f.title}</h1>
                    <p style="color:var(--text-muted); font-size:1.3rem; margin-bottom:2.5rem; line-height:1.6; max-width:650px;">${f.description}</p>
                    <div style="display:flex; gap:15px;">
                        <a href="#/watch?id=${f.id}" class="cms-btn" style="text-decoration:none; display:flex; align-items:center; gap:10px; border-radius:50px;"><i data-lucide="play" fill="white"></i> Play Now</a>
                    </div>
                </div>
            </section>
            <div class="container" style="margin-top:-80px; position:relative; z-index:10;">
                ${rows.map(row => {
                    const items = state.getContentByRow(row);
                    if (items.length === 0) return '';
                    return `
                        <section style="margin-bottom:4rem;">
                            <h2 style="font-size:2rem; margin-bottom:1.5rem; font-weight:900;">${row}</h2>
                            <div class="movie-grid" style="display:flex; gap:25px; overflow-x:auto; padding-bottom:20px;">
                                ${items.map(m => `
                                    <div class="ott-card" onclick="window.location.hash='#/watch?id=${m.id}'">
                                        <div class="poster-wrap">
                                            <img src="${m.thumbnail}">
                                            <div class="play-overlay"><i data-lucide="play" style="width:48px; height:48px; color:white;" fill="white"></i></div>
                                        </div>
                                        <div class="info">
                                            <h3>${m.title}</h3>
                                            <span>${m.genre} • 2024</span>
                                        </div>
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
        this.viewport.innerHTML = `
            <div class="admin-layout">
                <aside class="admin-sidebar">
                    <h2 style="color:var(--accent); font-weight:900; margin-bottom:3rem;">CMS V4.0</h2>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <button onclick="window.app.setAdminTab('overview')" class="cms-btn" style="background:#111; text-align:left;">Dashboard</button>
                        <button onclick="window.app.setAdminTab('content')" class="cms-btn" style="background:#111; text-align:left;">Content Manager</button>
                        <button onclick="window.app.setAdminTab('appearance')" class="cms-btn" style="background:#111; text-align:left;">Site Identity</button>
                        <button onclick="window.app.setAdminTab('homepage')" class="cms-btn" style="background:#111; text-align:left;">Home Builder</button>
                        <button onclick="window.location.hash='#/'" class="cms-btn" style="background:none; border:1px solid #333; margin-top:2rem;">Exit Portal</button>
                    </div>
                </aside>
                <main class="admin-content">
                    ${this.renderAdminTab()}
                </main>
            </div>
        `;
        this.attachAdminEvents();
    }

    setAdminTab(tab) { this.adminTab = tab; this.renderAdmin(); }

    renderAdminTab() {
        const c = state.config;
        if (this.adminTab === 'appearance') {
            return `
                <h1>Appearance Settings</h1>
                <form id="appearance-form" style="max-width:600px; margin-top:2rem;">
                    <label>Site Name</label><input class="cms-input" name="siteName" value="${c.appearance.siteName}">
                    <label>Primary Brand Color</label><input class="cms-input" type="color" name="primary" value="${c.appearance.primaryColor}">
                    <label>Secondary Accent</label><input class="cms-input" type="color" name="secondary" value="${c.appearance.secondaryColor}">
                    <label>Card Style</label>
                    <select class="cms-input" name="style">
                        <option value="rounded" ${c.appearance.cardStyle === 'rounded' ? 'selected' : ''}>Rounded Corner</option>
                        <option value="sharp" ${c.appearance.cardStyle === 'sharp' ? 'selected' : ''}>Sharp Corner</option>
                    </select>
                    <button type="submit" class="cms-btn">Save Identity</button>
                </form>
            `;
        }
        if (this.adminTab === 'content') {
            return `
                <h1>Library Manager</h1>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:4rem; margin-top:2rem;">
                    <form id="add-content-form">
                        <h3>Publish Title</h3>
                        <input class="cms-input" name="title" placeholder="Title" required>
                        <textarea class="cms-input" name="desc" placeholder="Synopsis" required></textarea>
                        <input class="cms-input" name="thumb" placeholder="Thumbnail URL (16:9)" required>
                        <input class="cms-input" name="banner" placeholder="Banner URL (Wide)" required>
                        <input class="cms-input" name="genre" placeholder="Genre" required>
                        <select class="cms-input" name="type">
                            ${c.layout.homepageOrder.map(r => `<option value="${r}">${r}</option>`).join('')}
                        </select>
                        <input class="cms-input" name="url" placeholder="Abyss.to Embed Link" required>
                        <label><input type="checkbox" name="feat"> Spotlight on Home?</label>
                        <button type="submit" class="cms-btn" style="width:100%; margin-top:1rem;">Add to Database</button>
                    </form>
                    <div>
                        <h3>Current Titles</h3>
                        ${state.content.map(m => `
                            <div style="padding:15px; background:#111; margin-bottom:10px; border-radius:8px; display:flex; justify-content:space-between;">
                                <span>${m.title} (${m.type})</span>
                                <button onclick="window.app.deleteTitle('${m.id}')" style="color:red; background:none; border:none; cursor:pointer;">Delete</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        return `<h1>Dashboard Overview</h1><p>Watch stats and server status coming soon.</p>`;
    }

    attachAdminEvents() {
        const aForm = document.getElementById('appearance-form');
        if (aForm) {
            aForm.onsubmit = (e) => {
                e.preventDefault();
                const f = new FormData(aForm);
                state.config.appearance = {
                    siteName: f.get('siteName'),
                    primaryColor: f.get('primary'),
                    secondaryColor: f.get('secondary'),
                    cardStyle: f.get('style')
                };
                state.save();
                alert("Site Identity Updated!");
            }
        }
        const cForm = document.getElementById('add-content-form');
        if (cForm) {
            cForm.onsubmit = (e) => {
                e.preventDefault();
                const f = new FormData(cForm);
                state.addContent({
                    title: f.get('title'), description: f.get('desc'), thumbnail: f.get('thumb'),
                    banner: f.get('banner'), genre: f.get('genre'), type: f.get('type'),
                    embedUrl: f.get('url'), featured: f.get('feat') === 'on'
                });
                alert("Published!");
                this.renderAdmin();
            }
        }
    }

    deleteTitle(id) { state.deleteContent(id); this.renderAdmin(); }

    renderWatch(id) {
        const m = state.content.find(x => x.id === id);
        if(!m) return this.renderHome();
        this.viewport.innerHTML = `
            <div style="padding-top:80px; background:#000;">
                <div style="width:100%; aspect-ratio:16/9; background:#000;">
                    <iframe src="${m.embedUrl}" style="width:100%; height:100%; border:none;" allowfullscreen></iframe>
                </div>
                <div class="container" style="padding:5rem 0;">
                    <h1 style="font-size:4rem; font-weight:900;">${m.title}</h1>
                    <p style="font-size:1.4rem; color:var(--text-muted); margin-top:1rem; max-width:900px; line-height:1.8;">${m.description}</p>
                </div>
            </div>
        `;
    }

    renderFooter() {
        document.getElementById('main-footer').innerHTML = `
            <div class="container" style="padding:5rem 0; display:flex; justify-content:space-between; opacity:0.5; border-top:1px solid #222;">
                <span>&copy; 2024 ${state.config.appearance.siteName} Premium OTT</span>
                <a href="#/portal" style="color:inherit; text-decoration:none; font-weight:bold;">MASTER DASHBOARD</a>
            </div>
        `;
    }
}

window.app = new App();
