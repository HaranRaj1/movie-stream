import { state } from './state.js';

class App {
    constructor() {
        this.viewport = document.getElementById('app-viewport');
        this.nav = document.getElementById('navbar');
        this.isAuth = false;
        this.adminTab = 'content';
        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => this.router());
        window.addEventListener('scroll', () => {
            this.nav.classList.toggle('nav-blur', window.scrollY > 40);
        });
        this.router();
    }

    router() {
        const hash = window.location.hash || '#/';
        this.renderNav();
        if (hash === '#/portal') this.handleAuth();
        else if (hash.startsWith('#/watch')) {
            const id = new URLSearchParams(hash.split('?')[1]).get('id');
            this.renderWatch(id);
        } else {
            this.renderHome();
        }
        this.renderFooter();
        if (window.lucide) lucide.createIcons();
    }

    handleAuth() {
        if (!this.isAuth) {
            const u = prompt("Admin Username:");
            const p = prompt("Admin Password:");
            if (u === state.config.security.adminUser && p === state.config.security.adminPass) {
                this.isAuth = true; this.renderAdmin();
            } else { window.location.hash = "#/"; }
        } else { this.renderAdmin(); }
    }

    renderNav() {
        const a = state.config.appearance;
        this.nav.innerHTML = `
            ${a.announcementBar.enabled ? `<div class="bg-sf-red text-white text-[10px] font-bold text-center py-2 uppercase tracking-[3px] animate-pulse">${a.announcementBar.text}</div>` : ''}
            <div class="max-w-[1920px] mx-auto px-12 flex items-center justify-between h-20">
                <a href="#/" class="flex items-center gap-2.5 group">
                    <div class="w-9 h-9 bg-sf-red rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><i data-lucide="play" class="w-4 h-4 text-white fill-white"></i></div>
                    <span class="text-xl font-bold tracking-tight">${a.siteName}</span>
                </a>
                <div class="flex items-center gap-8 text-[13px] font-medium text-sf-muted">
                    <a href="#/" class="text-white">Home</a>
                    <a href="#/portal" class="hover:text-white transition-colors flex items-center gap-2"><i data-lucide="shield" class="w-4 h-4"></i> Admin</a>
                </div>
            </div>`;
    }

    renderHome() {
        // FAIL-SAFE: Check if movies exist
        if (state.movies.length === 0) {
            this.viewport.innerHTML = `
                <div class="h-screen flex flex-col items-center justify-center text-center p-12">
                    <h1 class="text-5xl font-black mb-6">Welcome to ${state.config.appearance.siteName}</h1>
                    <p class="text-sf-muted text-xl mb-10 max-w-xl">Your cinematic library is currently empty. Head over to the Admin Portal to start adding your first movies!</p>
                    <a href="#/portal" class="bg-sf-red px-10 py-4 rounded-xl font-bold hover:scale-105 transition-transform">GO TO ADMIN PORTAL</a>
                </div>`;
            return;
        }

        const ads = state.config.monetization.ads;
        const topAd = ads.find(ad => ad.id === 'top-banner');
        const feat = state.movies.find(m => m.featured) || state.movies[0];
        const rows = state.config.layout.homepageRows;

        this.viewport.innerHTML = `
            ${topAd.enabled ? `<div class="max-w-[1200px] mx-auto mt-24 mb-[-60px] relative z-30 p-4 bg-sf-surface border border-sf-border rounded-xl text-center shadow-2xl"><a href="${topAd.link}" class="text-sm font-bold text-sf-red tracking-widest">${topAd.content || 'ADVERTISEMENT'}</a></div>` : ''}
            <section class="relative h-[85vh] overflow-hidden">
                <img src="${feat.banner}" class="absolute inset-0 w-full h-full object-cover">
                <div class="hero-gradient absolute inset-0"></div>
                <div class="relative z-10 h-full flex items-end pb-32 px-12">
                    <div class="max-w-2xl animate-slide-up">
                        <span class="bg-sf-red text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded mb-4 inline-block">Trending Feature</span>
                        <h1 class="text-7xl font-black mb-4 leading-none">${feat.title}</h1>
                        <p class="text-sf-muted text-lg mb-8 max-w-lg">${feat.desc}</p>
                        <a href="#/watch?id=${feat.id}" class="bg-white text-black px-10 py-4 rounded-xl font-bold inline-flex items-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-white/10"><i data-lucide="play" class="fill-black"></i> WATCH NOW</a>
                    </div>
                </div>
            </section>
            <div class="px-12 -mt-20 relative z-20 pb-20">
                ${rows.map(row => {
                    const rowMovies = state.movies.filter(m => m.type === row);
                    if (rowMovies.length === 0) return '';
                    return `
                        <div class="mb-14">
                            <h2 class="text-xl font-bold mb-6 flex items-center gap-3">${row} <i data-lucide="chevron-right" class="text-sf-red w-5 h-5"></i></h2>
                            <div class="row-scroll flex gap-5 overflow-x-auto pb-4">
                                ${rowMovies.map(m => `
                                    <div class="card-hover w-[240px] flex-shrink-0 cursor-pointer group" onclick="window.location.hash='#/watch?id=${m.id}'">
                                        <div class="aspect-video bg-sf-card rounded-xl overflow-hidden border border-sf-border"><img src="${m.banner}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"></div>
                                        <h3 class="mt-3 text-sm font-semibold">${m.title}</h3>
                                    </div>
                                `).join('')}
                            </div>
                        </div>`;
                }).join('')}
            </div>`;
    }

    renderAdmin() {
        this.viewport.innerHTML = `
            <div class="flex min-h-screen pt-20 bg-sf-dark">
                <aside class="w-72 bg-sf-surface p-10 border-r border-sf-border">
                    <h3 class="text-sf-red font-black text-2xl mb-12 uppercase tracking-tighter">Vela Builder</h3>
                    <nav class="flex flex-col gap-3">
                        <button onclick="window.app.setAdminTab('content')" class="text-left px-5 py-3 rounded-xl transition-all ${this.adminTab === 'content' ? 'bg-sf-red text-white' : 'text-sf-muted hover:bg-white/5'}">Library</button>
                        <button onclick="window.app.setAdminTab('appearance')" class="text-left px-5 py-3 rounded-xl transition-all ${this.adminTab === 'appearance' ? 'bg-sf-red text-white' : 'text-sf-muted hover:bg-white/5'}">Appearance Lab</button>
                        <button onclick="window.app.setAdminTab('money')" class="text-left px-5 py-3 rounded-xl transition-all ${this.adminTab === 'money' ? 'bg-sf-red text-white' : 'text-sf-muted hover:bg-white/5'}">Monetization</button>
                        <button onclick="window.location.hash='#/'" class="text-left px-5 py-3 text-sf-muted mt-8 hover:text-white">Exit Portal</button>
                    </nav>
                </aside>
                <main class="flex-1 p-16 overflow-y-auto h-[90vh]">
                    ${this.renderAdminTab()}
                </main>
            </div>`;
        this.attachAdminListeners();
    }

    setAdminTab(tab) { this.adminTab = tab; this.renderAdmin(); }

    renderAdminTab() {
        const c = state.config;
        if (this.adminTab === 'appearance') {
            return `
                <h1 class="text-4xl font-black mb-2">Appearance Lab</h1>
                <p class="text-sf-muted mb-10">Control your site branding and layout.</p>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <form id="appearance-form" class="flex flex-col gap-6 bg-sf-surface p-8 rounded-2xl border border-sf-border shadow-2xl">
                        <div><label class="text-xs uppercase font-bold text-sf-muted tracking-widest">Brand Name</label><input class="bg-sf-dark border border-sf-border w-full p-4 rounded-xl mt-2 outline-none focus:border-sf-red" name="name" value="${c.appearance.siteName}"></div>
                        <div><label class="text-xs uppercase font-bold text-sf-muted tracking-widest">Primary Accent Color</label><input type="color" class="w-full h-14 rounded-xl mt-2 bg-transparent cursor-pointer" name="primary" value="${c.appearance.primaryColor}"></div>
                        <div><label class="text-xs uppercase font-bold text-sf-muted tracking-widest">Announcement Bar</label><input class="bg-sf-dark border border-sf-border w-full p-4 rounded-xl mt-2 outline-none focus:border-sf-red" name="announce" value="${c.appearance.announcementBar.text}"></div>
                        <label class="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="announceOn" class="accent-sf-red" ${c.appearance.announcementBar.enabled ? 'checked' : ''}> Enable Announcement</label>
                        <button type="submit" class="bg-sf-red p-4 rounded-xl font-bold shadow-lg shadow-sf-red/20">Apply Global Changes</button>
                    </form>
                    <div class="bg-sf-surface p-8 rounded-2xl border border-sf-border">
                        <h3 class="font-bold mb-6 uppercase text-xs tracking-widest text-sf-muted">Homepage Row Order</h3>
                        <div class="flex flex-col gap-3">
                            ${c.layout.homepageRows.map((row, i) => `
                                <div class="flex items-center justify-between p-4 bg-sf-dark border border-sf-border rounded-xl">
                                    <span class="font-bold">${row}</span>
                                    <div class="flex gap-2">
                                        <button onclick="window.app.moveRow(${i}, -1)" class="w-8 h-8 rounded-lg bg-sf-surface flex items-center justify-center hover:bg-sf-red transition-colors">▲</button>
                                        <button onclick="window.app.moveRow(${i}, 1)" class="w-8 h-8 rounded-lg bg-sf-surface flex items-center justify-center hover:bg-sf-red transition-colors">▼</button>
                                    </div>
                                </div>`).join('')}
                        </div>
                    </div>
                </div>`;
        }
        if (this.adminTab === 'money') {
            return `
                <h1 class="text-4xl font-black mb-2">Monetization</h1>
                <p class="text-sf-muted mb-10">Manage your ad placements and promos.</p>
                <div class="grid gap-6">
                    ${c.monetization.ads.map(ad => `
                        <form onsubmit="window.app.saveAd(event, '${ad.id}')" class="bg-sf-surface p-8 rounded-2xl border border-sf-border">
                            <h3 class="font-bold mb-4 uppercase text-sf-red tracking-widest text-xs">${ad.name}</h3>
                            <textarea class="bg-sf-dark border border-sf-border w-full p-4 rounded-xl mb-4 h-24 outline-none focus:border-sf-red" name="content" placeholder="Ad Text or HTML Code">${ad.content}</textarea>
                            <input class="bg-sf-dark border border-sf-border w-full p-4 rounded-xl mb-4 outline-none focus:border-sf-red" name="link" placeholder="Destination URL (Optional)" value="${ad.link}">
                            <label class="flex items-center gap-3 mb-4 cursor-pointer"><input type="checkbox" name="enabled" class="accent-sf-red" ${ad.enabled ? 'checked' : ''}> Placement Active</label>
                            <button type="submit" class="bg-sf-red px-8 py-3 rounded-xl font-bold shadow-lg shadow-sf-red/20">Save Ad</button>
                        </form>`).join('')}
                </div>`;
        }
        return `
            <h1 class="text-4xl font-black mb-2">Library Manager</h1>
            <p class="text-sf-muted mb-10">Total Titles: ${state.movies.length}</p>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <form id="add-movie-form" class="bg-sf-surface p-8 rounded-2xl border border-sf-border flex flex-col gap-4">
                    <h3 class="font-bold mb-2 uppercase text-xs tracking-widest text-sf-muted">Publish New Title</h3>
                    <input class="bg-sf-dark border border-sf-border w-full p-4 rounded-xl" name="title" placeholder="Movie Title" required>
                    <textarea class="bg-sf-dark border border-sf-border w-full p-4 rounded-xl h-32" name="desc" placeholder="Synopsis" required></textarea>
                    <input class="bg-sf-dark border border-sf-border w-full p-4 rounded-xl" name="banner" placeholder="Banner Image URL" required>
                    <label class="text-xs text-sf-muted ml-2">Category Row:</label>
                    <select class="bg-sf-dark border border-sf-border w-full p-4 rounded-xl" name="type">
                        ${c.layout.homepageRows.map(r => `<option value="${r}">${r}</option>`).join('')}
                    </select>
                    <input class="bg-sf-dark border border-sf-border w-full p-4 rounded-xl" name="url" placeholder="Abyss.to Embed Link" required>
                    <button type="submit" class="bg-sf-red w-full p-4 rounded-xl font-bold mt-4 shadow-lg shadow-sf-red/20">PUBLISH TITLE</button>
                </form>
                <div>
                    <h3 class="font-bold mb-6 uppercase text-xs tracking-widest text-sf-muted">Inventory</h3>
                    <div class="grid gap-3">${state.movies.map(m => `<div class="bg-sf-surface p-4 rounded-xl flex justify-between border border-sf-border items-center"><div><span class="font-bold block">${m.title}</span><span class="text-[10px] text-sf-muted uppercase">${m.type}</span></div><button onclick="window.app.deleteTitle(${m.id})" class="text-sf-red font-bold text-xs">REMOVE</button></div>`).reverse().join('')}</div>
                </div>
            </div>`;
    }

    attachAdminListeners() {
        const aForm = document.getElementById('appearance-form');
        if (aForm) {
            aForm.onsubmit = (e) => {
                e.preventDefault(); const f = new FormData(aForm);
                state.config.appearance.siteName = f.get('name');
                state.config.appearance.primaryColor = f.get('primary');
                state.config.appearance.announcementBar.text = f.get('announce');
                state.config.appearance.announcementBar.enabled = f.get('announceOn') === 'on';
                state.save(); alert("Settings Applied!"); this.renderAdmin();
            };
        }
        const mForm = document.getElementById('add-movie-form');
        if (mForm) {
            mForm.onsubmit = (e) => {
                e.preventDefault(); const f = new FormData(mForm);
                state.addMovie({ title: f.get('title'), desc: f.get('desc'), banner: f.get('banner'), type: f.get('type'), embedUrl: f.get('url'), featured: false });
                alert("Published Successfully!"); this.renderAdmin();
            };
        }
    }

    moveRow(index, dir) {
        const rows = state.config.layout.homepageRows;
        const newIndex = index + dir;
        if (newIndex >= 0 && newIndex < rows.length) {
            [rows[index], rows[newIndex]] = [rows[newIndex], rows[index]];
            state.save(); this.renderAdmin();
        }
    }

    saveAd(e, adId) {
        e.preventDefault(); const f = new FormData(e.target);
        const ad = state.config.monetization.ads.find(a => a.id === adId);
        ad.content = f.get('content'); ad.link = f.get('link'); ad.enabled = f.get('enabled') === 'on';
        state.save(); alert("Ad Placement Saved!");
    }

    deleteTitle(id) { if (confirm("Delete this movie?")) { state.deleteMovie(id); this.renderAdmin(); } }

    renderWatch(id) {
        const m = state.movies.find(x => x.id == id);
        if(!m) return this.renderHome();
        const playerAd = state.config.monetization.ads.find(ad => ad.id === 'player-ad');
        this.viewport.innerHTML = `
            <div class="pt-20 bg-black min-h-screen">
                <div class="max-w-[1920px] mx-auto px-12">
                    <iframe src="${m.embedUrl}" class="w-full aspect-video rounded-2xl shadow-2xl border border-white/5" allowfullscreen></iframe>
                    ${playerAd.enabled ? `<div class="mt-8 p-8 bg-sf-surface border border-sf-border rounded-xl text-center shadow-2xl"><a href="${playerAd.link}" class="text-sf-red font-bold tracking-widest uppercase text-xs">${playerAd.content || 'SPONSORED AD'}</a></div>` : ''}
                    <div class="py-12"><h1 class="text-6xl font-black mb-4 tracking-tighter">${m.title}</h1><p class="text-sf-muted text-xl max-w-4xl leading-relaxed">${m.desc}</p></div>
                </div>
            </div>`;
    }

    renderFooter() { document.getElementById('footer').innerHTML = `<footer class="p-20 text-center border-t border-white/5 opacity-10"><span class="text-2xl font-black tracking-tighter italic">STREAMFLIX</span></footer>`; }
}
window.app = new App();
