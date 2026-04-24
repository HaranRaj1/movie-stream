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
        this.setupInactivityTracker();
        this.router();
    }

    setupInactivityTracker() {
        const resetTimer = () => {
            if (!this.isAuthenticated) return;
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = setTimeout(() => this.logout(), state.config.security.autoLogoutMinutes * 60000);
        };
        window.onmousemove = resetTimer;
        window.onmousedown = resetTimer;
        window.onclick = resetTimer;
        window.onkeydown = resetTimer;
    }

    logout() {
        this.isAuthenticated = false;
        alert("Session expired. You have been logged out for security.");
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
            if (user !== state.config.security.adminUser) return (window.location.hash = "#/");
            
            const pass = prompt("Admin Password:");
            if (pass === state.config.security.adminPass) {
                if (state.config.security.twoStepEnabled) {
                    const pin = prompt("Enter 2-Step PIN:");
                    if (pin !== state.config.security.twoStepPin) return (window.location.hash = "#/");
                }
                this.isAuthenticated = true;
                state.addLog("Admin Login Success");
                this.renderAdmin();
            } else {
                state.addLog("Failed Login Attempt");
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
                <a href="#/" style="text-decoration:none; color:white; font-size:2rem; font-weight:900;">${a.siteName}</a>
                <div style="background:rgba(255,255,255,0.08); padding:10px 20px; border-radius:50px; display:flex; align-items:center; gap:10px;">
                    <i data-lucide="search" style="width:18px;"></i>
                    <input type="text" placeholder="Search..." style="background:none; border:none; color:white; outline:none;">
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
                    <h1>${f.title}</h1>
                    <p style="color:var(--text-muted); margin-bottom:2rem; max-width:650px;">${f.description}</p>
                    <a href="#/watch?id=${f.id}" class="cms-btn" style="text-decoration:none;">Watch Now</a>
                </div>
            </section>
            <div class="container" style="margin-top:-80px; position:relative; z-index:10;">
                ${rows.map(row => {
                    const items = state.getMoviesByCategory(row);
                    if (items.length === 0) return '';
                    return `
                        <section style="margin-bottom:4rem;">
                            <h2 style="font-size:2rem; margin-bottom:1.5rem; font-weight:900;">${row}</h2>
                            <div class="movie-grid" style="display:flex; gap:25px; overflow-x:auto; padding-bottom:20px;">
                                ${items.map(m => `
                                    <div class="ott-card" onclick="window.location.hash='#/watch?id=${m.id}'">
                                        <div class="poster-wrap"><img src="${m.thumbnail}"><div class="play-overlay"><i data-lucide="play" fill="white"></i></div></div>
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
                    <h2 style="color:var(--accent); font-weight:900; margin-bottom:2rem;">SECURE DASH</h2>
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <button onclick="window.app.setAdminTab('overview')" class="cms-btn" style="background:#111; text-align:left;">Overview</button>
                        <button onclick="window.app.setAdminTab('content')" class="cms-btn" style="background:#111; text-align:left;">Library</button>
                        <button onclick="window.app.setAdminTab('security')" class="cms-btn" style="background:#111; text-align:left;">Security</button>
                        <button onclick="window.app.setAdminTab('logs')" class="cms-btn" style="background:#111; text-align:left;">Activity Logs</button>
                        <button onclick="window.app.logout()" class="cms-btn" style="background:#ff4444; margin-top:2rem;">Logout</button>
                    </div>
                </aside>
                <main class="admin-content">
                    ${this.renderAdminTab()}
                </main>
            </div>
        `;
        this.attachAdminEvents();
        lucide.createIcons();
    }

    setAdminTab(t) { this.adminTab = t; this.renderAdmin(); }

    renderAdminTab() {
        const s = state.config.security;
        if (this.adminTab === 'security') {
            return `
                <h1>Security Management</h1>
                <form id="security-form" style="max-width:500px; margin-top:2rem;">
                    <label>Admin Username</label><input class="cms-input" name="user" value="${s.adminUser}">
                    <label>New Password</label><input class="cms-input" type="password" name="pass" value="${s.adminPass}">
                    <label>2-Step PIN</label><input class="cms-input" name="pin" value="${s.twoStepPin}">
                    <label style="display:flex; align-items:center; gap:10px; margin-bottom:1rem;"><input type="checkbox" name="twoStep" ${s.twoStepEnabled ? 'checked' : ''}> Enable Two-Step Auth?</label>
                    <button type="submit" class="cms-btn">Update Security</button>
                </form>
            `;
        }
        if (this.adminTab === 'logs') {
            return `
                <h1>System Activity Logs</h1>
                <div style="margin-top:2rem;">
                    ${state.config.logs.map(l => `<div style="padding:10px; background:#111; border-bottom:1px solid #222;"><strong>${l.time}</strong>: ${l.action}</div>`).join('')}
                </div>
            `;
        }
        if (this.adminTab === 'content') {
            return `
                <h1>Content Manager</h1>
                <form id="add-content-form" style="max-width:500px; margin-top:2rem;">
                    <input class="cms-input" name="title" placeholder="Title" required>
                    <textarea class="cms-input" name="desc" placeholder="Synopsis" required></textarea>
                    <input class="cms-input" name="thumb" placeholder="Thumbnail URL" required>
                    <input class="cms-input" name="banner" placeholder="Banner URL" required>
                    <input class="cms-input" name="genre" placeholder="Genre" required>
                    <input class="cms-input" name="url" placeholder="Embed Link" required>
                    <button type="submit" class="cms-btn">Publish</button>
                </form>
            `;
        }
        return `<h1>Welcome, ${s.adminUser}</h1><p>You are protected by Vela Shield v4.5.</p>`;
    }

    attachAdminEvents() {
        const sForm = document.getElementById('security-form');
        if (sForm) {
            sForm.onsubmit = (e) => {
                e.preventDefault();
                const f = new FormData(sForm);
                state.updateSecurity(f.get('user'), f.get('pass'), f.get('pin'), f.get('twoStep') === 'on');
                alert("Security Credentials Updated!");
            }
        }
        const cForm = document.getElementById('add-content-form');
        if (cForm) {
            cForm.onsubmit = (e) => {
                e.preventDefault();
                const f = new FormData(cForm);
                state.addContent({
                    title: f.get('title'), description: f.get('desc'), thumbnail: f.get('thumb'),
                    banner: f.get('banner'), genre: f.get('genre'), type: 'Trending Now',
                    embedUrl: f.get('url'), featured: false
                });
                alert("Added!"); this.renderAdmin();
            }
        }
    }

    renderWatch(id) {
        const m = state.content.find(x => x.id === id);
        this.viewport.innerHTML = `<div style="padding-top:80px; background:#000;"><iframe src="${m.embedUrl}" style="width:100%; aspect-ratio:16/9; border:none;" allowfullscreen></iframe></div>`;
    }

    renderFooter() {
        document.getElementById('main-footer').innerHTML = `<div class="container" style="padding:5rem 0; display:flex; justify-content:space-between; opacity:0.3;"><a href="#/portal" style="color:inherit; text-decoration:none;">MASTER DASHBOARD</a></div>`;
    }
}
window.app = new App();
