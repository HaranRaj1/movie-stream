import { state } from './state.js';

class App {
    constructor() {
        this.viewport = document.getElementById('app-viewport');
        this.nav = document.getElementById('navbar');
        this.isAuth = false;
        this.adminTab = 'content';
        this.editingMovieId = null;
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
        else if (hash.startsWith('#/watch')) this.renderWatch(new URLSearchParams(hash.split('?')[1]).get('id'));
        else this.renderHome();
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
            ${a.announcementBar.enabled ? `<div class="bg-sf-red text-white text-[11px] font-bold text-center py-2 uppercase tracking-widest">${a.announcementBar.text}</div>` : ''}
            <div class="max-w-[1920px] mx-auto px-12 flex items-center justify-between h-20">
                <a href="#/" class="flex items-center gap-2.5">
                    <div class="w-9 h-9 bg-sf-red rounded-xl flex items-center justify-center"><i data-lucide="play" class="w-4 h-4 text-white fill-white"></i></div>
                    <span class="text-xl font-bold tracking-tight">${a.siteName}</span>
                </a>
                <div class="flex items-center gap-8 text-[13px] font-medium text-sf-muted">
                    <a href="#/" class="text-white">Home</a>
                    <a href="#/portal" class="hover:text-white transition-colors">Admin</a>
                </div>
            </div>`;
    }

    renderHome() {
        const ads = state.config.monetization.ads;
        const topAd = ads.find(ad => ad.id === 'top-banner');
        const feat = state.movies.find(m => m.featured) || state.movies[0];

        this.viewport.innerHTML = `
            ${topAd.enabled ? `<div class="max-w-[1200px] mx-auto mt-24 mb-[-60px] relative z-30 p-4 bg-sf-surface border border-sf-border rounded-xl text-center"><a href="${topAd.link}">${topAd.content || 'Your Ad Here'}</a></div>` : ''}
            <section class="relative h-[85vh] overflow-hidden">
                <img src="${feat.banner}" class="absolute inset-0 w-full h-full object-cover">
                <div class="hero-gradient absolute inset-0"></div>
                <div class="relative z-10 h-full flex items-end pb-32 px-12">
                    <div class="max-w-2xl animate-slide-up">
                        <h1 class="text-7xl font-black mb-4 leading-none">${feat.title}</h1>
                        <p class="text-sf-muted text-lg mb-8">${feat.desc}</p>
                        <a href="#/watch?id=${feat.id}" class="bg-white text-black px-10 py-4 rounded-xl font-bold inline-flex items-center gap-2"><i data-lucide="play" class="fill-black"></i> Watch Now</a>
                    </div>
                </div>
            </section>
            <div class="px-12 -mt-20 relative z-20 pb-20">
                ${state.config.layout.homepageRows.map(row => {
                    const rowMovies = state.movies.filter(m => m.type === row);
                    if (rowMovies.length === 0) return '';
                    return `
                        <div class="mb-14">
                            <h2 class="text-xl font-bold mb-6">${row}</h2>
                            <div class="row-scroll flex gap-5 overflow-x-auto pb-4">
                                ${rowMovies.map(m => `
                                    <div class="card-hover w-[240px] flex-shrink-0 cursor-pointer" onclick="window.location.hash='#/watch?id=${m.id}'">
                                        <div class="aspect-video bg-sf-card rounded-xl overflow-hidden border border-sf-border"><img src="${m.banner}" class="w-full h-full object-cover"></div>
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
                        <button onclick="window.app.setAdminTab('content')" class="text-left px-5 py-3 rounded-xl ${this.adminTab === 'content' ? 'bg-sf-red' : ''}">Content</button>
                        <button onclick="window.app.setAdminTab('appearance')" class="text-left px-5 py-3 rounded-xl ${this.adminTab === 'appearance' ? 'bg-sf-red' : ''}">Appearance Lab</button>
                        <button onclick="window.app.setAdminTab('money')" class="text-left px-5 py-3 rounded-xl ${this.adminTab === 'money' ? 'bg-sf-red' : ''}">Monetization</button>
                        <button onclick="window.location.hash='#/'" class="text-left px-5 py-3 text-sf-muted mt-8">View Site</button>
                    </nav>
                </aside>
                <main class="flex-1 p-16 overflow-y-auto h-[90vh]">
                    ${this.renderAdminTab()}
                </main>
            </div>`;
        this.attachAdminListeners();
    }

    setAdminTab(t) { this.adminTab = t; this.renderAdmin(); }

    renderAdminTab() {
        const c = state.config;
        if (this.adminTab === 'appearance') {
            return `
                <h1 class="text-4xl font-black mb-10">Appearance Lab</h1>
                <div class="grid grid-cols-2 gap-12">
                    <form id="appearance-form" class="flex flex-col gap-6 bg-sf-surface p-8 rounded-2xl border border-sf-border">
                        <div><label>Brand Name</label><input class="bg-sf-dark border border-sf-border w-full p-4 rounded-xl mt-2" name="name" value="${c.appearance.siteName}"></div>
                        <div><label>Primary Theme Color</label><input type="color" class="w-full h-14 rounded-xl mt-2" name="primary" value="${c.appearance.primaryColor}"></div>
                        <div><label>Announcement Bar Text</label><input class="bg-sf-dark border border-sf-border w-full p-4 rounded-xl mt-2" name="announce" value="${c.appearance.announcementBar.text}"></div>
                        <label class="flex items-center gap-3"><input type="checkbox" name="announceOn" ${c.appearance.announcementBar.enabled ? 'checked' : ''}> Enable Announcement Bar</label>
                        <button type="submit" class="bg-sf-red p-4 rounded-xl font-bold">Apply Changes</button>
                    </form>
                    <div class="bg-sf-surface p-8 rounded-2xl border border-sf-border">
                        <h3 class="font-bold mb-6">Homepage Row Order</h3>
                        <div class="flex flex-col gap-2">
                            ${c.layout.homepageRows.map((row, i) => `
                                <div class="flex items-center justify-between p-3 bg-sf-dark border border-sf-border rounded-lg">
                                    <span>${row}</span>
                                    <div class="flex gap-2">
                                        <button onclick="window.app.moveRow(${i}, -1)" class="p-1 hover:text-sf-red">▲</button>
                                        <button onclick="window.app.moveRow(${i}, 1)" class="p-1 hover:text-sf-red">▼</button>
                                    </div>
                                </div>`).join('')}
                        </div>
                    </div>
                </div>`;
        }
        if (this.adminTab === 'money') {
            return `
                <h1 class="text-4xl font-black mb-10">Monetization</h1>
                <div class="grid gap-6">
                    ${c.monetization.ads.map(ad => `
                        <form onsubmit="window.app.saveAd(event, '${ad.id}')" class="bg-sf-surface p-8 rounded-2xl border border-sf-border">
                            <h3 class="font-bold mb-4">${ad.name}</h3>
                            <textarea class="bg-sf-dark border border-sf-border w-full p-4 rounded-xl mb-4" name="content" placeholder="Paste Ad HTML or Text here">${ad.content}</textarea>
                            <input class="bg-sf-dark border border-sf-border w-full p-4 rounded-xl mb-4" name="link" placeholder="Destination Link" value="${ad.link}">
                            <label class="flex items-center gap-3 mb-4"><input type="checkbox" name="enabled" ${ad.enabled ? 'checked' : ''}> Ad Active</label>
                            <button type="submit" class="bg-sf-red px-8 py-3 rounded-xl font-bold">Save Ad Placement</button>
                        </form>`).join('')}
                </div>`;
        }
        // Default to content
        return `
            <h1 class="text-4xl font-black mb-10">Library Manager</h1>
            <form id="add-movie-form" class="bg-sf-surface p-8 rounded-2xl border border-sf-border max-w-xl mb-10">
                <input class="bg-sf-dark border border-sf-border w-full p-4 rounded-xl mb-4" name="title" placeholder="Movie Title" required>
                <textarea class="bg-sf-dark border border-sf-border w-full p-4 rounded-xl mb-4 h-32" name="desc" placeholder="Synopsis" required></textarea>
                <input class="bg-sf-dark border border-sf-border w-full p-4 rounded-xl mb-4" name="banner" placeholder="Banner URL" required>
                <select class="bg-sf-dark border border-sf-border w-full p-4 rounded-xl mb-4" name="type">
                    ${c.layout.homepageRows.map(r => `<option value="${r}">${r}</option>`).join('')}
                </select>
                <input class="bg-sf-dark border border-sf-border w-full p-4 rounded-xl mb-4" name="url" placeholder="Embed Link" required>
                <button type="submit" class="bg-sf-red w-full p-4 rounded-xl font-bold">Publish Now</button>
            </form>
            <h3 class="font-bold mb-4">Inventory</h3>
            <div class="grid gap-2">${state.movies.map(m => `<div class="bg-sf-surface p-4 rounded-xl flex justify-between border border-sf-border"><span>${m.title}</span><button onclick="window.app.deleteTitle(${m.id})" class="text-sf-red">Delete</button></div>`).reverse().join('')}</div>
        `;
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
                alert("Published!"); this.renderAdmin();
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
        state.save(); alert("Ad Saved!");
    }

    deleteTitle(id) { if (confirm("Delete?")) { state.deleteMovie(id); this.renderAdmin(); } }

    renderWatch(id) {
        const m = state.movies.find(x => x.id == id);
        const playerAd = state.config.monetization.ads.find(ad => ad.id === 'player-ad');
        this.viewport.innerHTML = `
            <div class="pt-20 bg-black min-h-screen">
                <div class="max-w-[1920px] mx-auto px-12">
                    <iframe src="${m.embedUrl}" class="w-full aspect-video rounded-2xl shadow-2xl border border-white/5" allowfullscreen></iframe>
                    ${playerAd.enabled ? `<div class="mt-8 p-8 bg-sf-surface border border-sf-border rounded-xl text-center"><a href="${playerAd.link}">${playerAd.content || 'Sponsored Content'}</a></div>` : ''}
                    <div class="py-12"><h1 class="text-5xl font-black mb-4">${m.title}</h1><p class="text-sf-muted text-xl max-w-4xl">${m.desc}</p></div>
                </div>
            </div>`;
    }

    renderFooter() { document.getElementById('footer').innerHTML = `<footer class="p-12 text-center opacity-20"><span class="text-xl font-bold">${state.config.appearance.siteName}</span></footer>`; }
}
window.app = new App();
