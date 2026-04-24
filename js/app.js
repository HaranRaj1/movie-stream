import { state } from './state.js';

class App {
    constructor() {
        this.viewport = document.getElementById('view-port');
        this.nav = document.getElementById('main-nav');
        this.isAuthenticated = false;
        this.adminTab = 'overview';
        this.inactivityTimer = null;
        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => this.router());
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) this.nav.classList.add('scrolled');
            else this.nav.classList.remove('scrolled');
        });
        this.setupInactivityTracker();
        this.router();
    }

    setupInactivityTracker() {
        const resetTimer = () => {
            if (!this.isAuthenticated) return;
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = setTimeout(() => this.logout(), state.config.security.autoLogoutMinutes * 60000);
        };
        ['mousemove', 'mousedown', 'click', 'keydown', 'touchstart'].forEach(e => window.addEventListener(e, resetTimer));
    }

    logout() {
        this.isAuthenticated = false;
        alert("Session expired for security.");
        window.location.hash = "#/";
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
            const user = prompt("Admin Username:");
            if (!user) return (window.location.hash = "#/");
            if (user !== state.config.security.adminUser) {
                alert("Invalid User");
                return (window.location.hash = "#/");
            }
            
            const pass = prompt("Admin Password:");
            if (pass === state.config.security.adminPass) {
                this.isAuthenticated = true;
                state.addLog("Admin Logged In");
                this.renderAdmin();
            } else {
                alert("Invalid Password");
                window.location.hash = "#/";
            }
        } else {
            this.renderAdmin();
        }
    }

    renderNav() {
        const a = state.config.appearance;
        this.nav.innerHTML = `
            <div class="container" style="display:flex; justify-content:space-between; align-items:center; padding: 1.5rem 0;">
                <a href="#/" style="text-decoration:none; color:white; font-size:2.2rem; font-weight:900; letter-spacing:-1px;">${a.siteName}</a>
                <div style="background:rgba(255,255,255,0.08); padding:10px 24px; border-radius:50px; display:flex; align-items:center; gap:12px; border:1px solid rgba(255,255,255,0.1);" class="nav-actions">
                    <i data-lucide="search" style="width:18px; opacity:0.6;"></i>
                    <input type="text" placeholder="Search..." style="background:none; border:none; color:white; outline:none; font-size:1rem;">
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
                    <span style="background:var(--accent); color:white; padding:4px 12px; border-radius:4px; font-size:0.7rem; font-weight:900; width:fit-content; margin-bottom:1rem; letter-spacing:2px;">SPOTLIGHT</span>
                    <h1>${f.title}</h1>
                    <p style="color:var(--text-muted); font-size:1.3rem; margin-bottom:2.5rem; max-width:700px; line-height:1.6;">${f.description}</p>
                    <div style="display:flex; gap:15px;">
                        <a href="#/watch?id=${f.id}" class="cms-btn" style="text-decoration:none; display:inline-flex; align-items:center; gap:10px; border-radius:50px; padding: 16px 40px;"><i data-lucide="play" fill="white"></i> WATCH NOW</a>
                    </div>
                </div>
            </section>
            <div class="container" style="margin-top:-100px; position:relative; z-index:10;">
                ${rows.map(row => {
                    const items = state.getMoviesByCategory(row);
                    if (items.length === 0) return '';
                    return `
                        <section style="margin-bottom:5rem;">
                            <h2 style="font-size:2.2rem; margin-bottom:1.8rem; font-weight:900; display:flex; align-items:center; gap:15px;">${row} <i data-lucide="chevron-right" style="color:var(--accent); width:30px;"></i></h2>
                            <div class="movie-grid">
                                ${items.map(m => `
                                    <div class="ott-card" onclick="window.location.hash='#/watch?id=${m.id}'">
                                        <div class="poster-wrap"><img src="${m.thumbnail}"><div class="play-overlay"><i data-lucide="play" style="width:50px; height:50px;" fill="white"></i></div></div>
                                        <div class="info"><h3>${m.title}</h3><span>${m.genre}</span></div>
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
                    <h2 style="color:var(--accent); font-weight:900; margin-bottom:2.5rem;">CMS MASTER</h2>
                    <div style="display:flex; flex-direction:column; gap:12px;">
                        <button onclick="window.app.setAdminTab('overview')" class="cms-btn" style="background:#111; text-align:left; border-radius:12px;">Dashboard</button>
                        <button onclick="window.app.setAdminTab('content')" class="cms-btn" style="background:#111; text-align:left; border-radius:12px;">Library</button>
                        <button onclick="window.app.setAdminTab('security')" class="cms-btn" style="background:#111; text-align:left; border-radius:12px;">Security</button>
                        <button onclick="window.app.logout()" class="cms-btn" style="background:rgba(255,68,68,0.1); color:#ff4444; border:1px solid rgba(255,68,68,0.2); margin-top:2rem;">LOGOUT</button>
                    </div>
                </aside>
                <main class="admin-content">
                    ${this.renderAdminTab()}
                </main>
            </div>
        `;
        
        if (window.innerWidth <= 1024) {
            document.querySelector('.admin-content').style.marginLeft = "0";
        }

        this.attachAdminEvents();
        if (window.lucide) lucide.createIcons();
    }

    setAdminTab(t) { this.adminTab = t; this.renderAdmin(); }

    renderAdminTab() {
        const c = state.config;
        if (this.adminTab === 'content') {
            return `
                <h1 style="font-size:3rem; margin-bottom:2rem;">Content</h1>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:4rem;">
                    <form id="add-content-form" style="background:#0a0a0a; padding:2.5rem; border-radius:20px; border:1px solid #1a1a1a;">
                        <h3 style="margin-bottom:1.5rem;">Add Movie</h3>
                        <input class="cms-input" name="title" placeholder="Title" required>
                        <textarea class="cms-input" name="desc" placeholder="Synopsis" required></textarea>
                        <input class="cms-input" name="thumb" placeholder="Poster (16:9)" required>
                        <input class="cms-input" name="banner" placeholder="Banner (Wide)" required>
                        <label>Row/Category:</label>
                        <select class="cms-input" name="type">
                            ${c.layout.homepageOrder.map(r => `<option value="${r}">${r}</option>`).join('')}
                        </select>
                        <input class="cms-input" name="genre" placeholder="Display Genre" required>
                        <input class="cms-input" name="url" placeholder="Abyss.to Link" required>
                        <label style="display:flex; align-items:center; gap:10px;"><input type="checkbox" name="feat"> Spotlight?</label>
                        <button type="submit" class="cms-btn" style="width:100%; margin-top:2rem;">PUBLISH</button>
                    </form>
                    <div>
                        <h3>Library</h3>
                        <div style="max-height:600px; overflow-y:auto; display:flex; flex-direction:column; gap:10px;">
                            ${state.content.map(m => `
                                <div style="padding:15px; background:#0a0a0a; border:1px solid #1a1a1a; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                                    <span>${m.title}</span>
                                    <button onclick="window.app.deleteTitle('${m.id}')" style="color:#ff4444; background:none; border:none; cursor:pointer;">Delete</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
        if (this.adminTab === 'security') {
            return `
                <h1>Security</h1>
                <form id="security-form" style="max-width:500px; background:#0a0a0a; padding:2.5rem; border-radius:20px;">
                    <label>Admin Username</label><input class="cms-input" name="user" value="${c.security.adminUser}">
                    <label>Admin Password</label><input class="cms-input" type="password" name="pass" value="${c.security.adminPass}">
                    <button type="submit" class="cms-btn">Update</button>
                </form>
            `;
        }
        return `<h1>Welcome Back</h1><p>Movies: ${state.content.length}</p>`;
    }

    attachAdminEvents() {
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
        const sForm = document.getElementById('security-form');
        if (sForm) {
            sForm.onsubmit = (e) => {
                e.preventDefault();
                const f = new FormData(sForm);
                state.config.security.adminUser = f.get('user');
                state.config.security.adminPass = f.get('pass');
                state.save();
                alert("Security Updated!");
            }
        }
    }

    deleteTitle(id) { if(confirm("Delete title?")) { state.deleteContent(id); this.renderAdmin(); } }

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
            <div class="container" style="padding:6rem 0; display:flex; justify-content:space-between; opacity:0.1;">
                <span style="font-weight:900;">VELA ENGINE</span>
                <a href="#/portal" style="color:inherit; text-decoration:none;">MASTER DASHBOARD</a>
            </div>
        `;
    }
}

window.app = new App();
