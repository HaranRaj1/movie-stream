import { state } from './state.js';

class App {
    constructor() {
        this.viewport = document.getElementById('app-viewport');
        this.nav = document.getElementById('navbar');
        this.isAuth = false;
        this.adminTab = 'overview';
        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => this.router());
        window.addEventListener('scroll', () => {
            this.nav.classList.toggle('nav-blur', window.scrollY > 40);
            this.nav.classList.toggle('bg-sf-dark/80', window.scrollY > 40);
        });
        this.router();
    }

    router() {
        const hash = window.location.hash || '#/';
        this.renderNav();
        if (hash === '#/portal') this.handleAuth();
        else if (hash.startsWith('#/watch')) this.renderWatch(new URLSearchParams(hash.split('?')[1]).get('id'));
        else this.renderHome();
        this.renderFooter();
        if (window.lucide) lucide.createIcons();
    }

    handleAuth() {
        if (!this.isAuth) {
            const u = prompt("Username:");
            const p = prompt("Password:");
            if (u === state.config.security.adminUser && p === state.config.security.adminPass) {
                this.isAuth = true; this.renderAdmin();
            } else { window.location.hash = "#/"; }
        } else { this.renderAdmin(); }
    }

    renderNav() {
        this.nav.innerHTML = `
            <div class="max-w-[1920px] mx-auto px-12 flex items-center justify-between h-20">
                <a href="#/" class="flex items-center gap-2.5">
                    <div class="w-9 h-9 bg-sf-red rounded-xl flex items-center justify-center"><i data-lucide="play" class="w-4 h-4 text-white fill-white"></i></div>
                    <span class="text-xl font-bold">${state.config.appearance.siteName}</span>
                </a>
                <div class="flex items-center gap-6 text-sm text-sf-muted">
                    <a href="#/" class="text-white">Home</a>
                    <span>Movies</span><span>TV Shows</span>
                    <a href="#/portal" class="hover:text-white">Admin</a>
                </div>
            </div>`;
    }

    renderHome() {
        const feat = state.movies[0];
        this.viewport.innerHTML = `
            <section class="relative h-[90vh] overflow-hidden">
                <img src="${feat.banner}" class="absolute inset-0 w-full h-full object-cover">
                <div class="hero-gradient absolute inset-0"></div>
                <div class="relative z-10 h-full flex items-end pb-36 px-12">
                    <div class="max-w-2xl animate-slide-up">
                        <h1 class="text-8xl font-bold mb-6">${feat.title}</h1>
                        <p class="text-sf-muted mb-8">${feat.desc}</p>
                        <a href="#/watch?id=${feat.id}" class="bg-white text-black px-10 py-4 rounded-xl font-bold">Play Now</a>
                    </div>
                </div>
            </section>
            <div class="px-12 -mt-20 relative z-20">
                ${state.config.layout.homepageRows.map(row => `
                    <div class="mb-12">
                        <h2 class="text-xl font-bold mb-6">${row}</h2>
                        <div class="row-scroll flex gap-4 overflow-x-auto">
                            ${state.movies.filter(m => m.type === row).map(m => `
                                <div class="card-hover w-[200px] flex-shrink-0 cursor-pointer" onclick="window.location.hash='#/watch?id=${m.id}'">
                                    <div class="aspect-[2/3] bg-sf-card rounded-xl overflow-hidden">
                                        <img src="${m.banner}" class="w-full h-full object-cover">
                                    </div>
                                    <h3 class="mt-3 text-sm font-semibold">${m.title}</h3>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>`;
    }

    renderAdmin() {
        this.viewport.innerHTML = `
            <div class="flex min-h-screen pt-20">
                <aside class="w-64 bg-sf-surface p-8 border-r border-sf-border">
                    <h3 class="text-sf-red font-bold mb-8">MASTER DASHBOARD</h3>
                    <div class="flex flex-col gap-4">
                        <button onclick="window.app.setAdminTab('content')" class="text-left py-2">Library</button>
                        <button onclick="window.app.setAdminTab('appearance')" class="text-left py-2">Appearance</button>
                        <button onclick="window.location.hash='#/'" class="text-left py-2 text-sf-muted">Exit</button>
                    </div>
                </aside>
                <main class="flex-1 p-12">
                    ${this.adminTab === 'content' ? this.renderContentTab() : this.renderAppearanceTab()}
                </main>
            </div>`;
    }

    setAdminTab(t) { this.adminTab = t; this.renderAdmin(); }

    renderContentTab() {
        return `
            <h1 class="text-4xl font-bold mb-8">Manage Library</h1>
            <form id="add-movie-form" class="grid gap-4 max-w-xl mb-12">
                <input class="bg-sf-dark border border-sf-border p-4 rounded-xl" name="title" placeholder="Movie Title" required>
                <textarea class="bg-sf-dark border border-sf-border p-4 rounded-xl" name="desc" placeholder="Synopsis"></textarea>
                <input class="bg-sf-dark border border-sf-border p-4 rounded-xl" name="banner" placeholder="Image URL">
                <select class="bg-sf-dark border border-sf-border p-4 rounded-xl" name="type">
                    ${state.config.layout.homepageRows.map(r => `<option value="${r}">${r}</option>`).join('')}
                </select>
                <input class="bg-sf-dark border border-sf-border p-4 rounded-xl" name="url" placeholder="Abyss Link">
                <button type="submit" class="bg-sf-red p-4 rounded-xl font-bold">Publish Movie</button>
            </form>
        `;
    }

    renderAppearanceTab() {
        return `<h1>Appearance Settings</h1><p>Edit colors and branding here.</p>`;
    }

    renderWatch(id) {
        const m = state.movies.find(x => x.id == id);
        this.viewport.innerHTML = `<div class="pt-20"><iframe src="${m.embedUrl}" class="w-full aspect-video"></iframe></div>`;
    }

    renderFooter() {
        document.getElementById('footer').innerHTML = `<div class="p-20 text-center opacity-20">© 2024 ${state.config.appearance.siteName}</div>`;
    }
}
window.app = new App();
