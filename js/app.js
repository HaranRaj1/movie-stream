import { state } from './state.js';

class App {
    constructor() {
        this.viewport = document.getElementById('app-viewport');
        this.nav = document.getElementById('navbar');
        this.isAuth = false;
        this.adminTab = 'content';
        this.editingMovieId = null; // Tracks if we are editing a movie
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
        if (hash === '#/portal') {
            this.handleAuth();
        } else if (hash.startsWith('#/watch')) {
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
            const u = prompt("Username:");
            const p = prompt("Password:");
            if (u === state.config.security.adminUser && p === state.config.security.adminPass) {
                this.isAuth = true;
                this.renderAdmin();
            } else {
                alert("Access Denied");
                window.location.hash = "#/";
            }
        } else {
            this.renderAdmin();
        }
    }

    renderNav() {
        this.nav.innerHTML = `
            <div class="max-w-[1920px] mx-auto px-12 flex items-center justify-between h-20">
                <a href="#/" class="flex items-center gap-2.5">
                    <div class="w-9 h-9 bg-sf-red rounded-xl flex items-center justify-center shadow-lg shadow-sf-red/20">
                        <i data-lucide="play" class="w-4 h-4 text-white fill-white"></i>
                    </div>
                    <span class="text-xl font-bold tracking-tight">Stream<span class="text-sf-red">Flix</span></span>
                </a>
                <div class="flex items-center gap-8 text-[13px] font-medium text-sf-muted">
                    <a href="#/" class="text-white">Home</a>
                    <a href="#/portal" class="hover:text-white transition-colors flex items-center gap-2">
                        <i data-lucide="shield" class="w-4 h-4"></i> Admin
                    </a>
                </div>
            </div>`;
    }

    renderHome() {
        const feat = state.movies.find(m => m.featured) || state.movies[0];
        const rows = state.config.layout.homepageRows;

        this.viewport.innerHTML = `
            <section class="relative h-[85vh] overflow-hidden">
                <img src="${feat.banner}" class="absolute inset-0 w-full h-full object-cover">
                <div class="hero-gradient absolute inset-0"></div>
                <div class="relative z-10 h-full flex items-end pb-32 px-12">
                    <div class="max-w-2xl animate-slide-up">
                        <h1 class="text-7xl font-black mb-4 leading-none">${feat.title}</h1>
                        <p class="text-sf-muted text-lg mb-8 max-w-lg">${feat.desc}</p>
                        <a href="#/watch?id=${feat.id}" class="bg-white text-black px-10 py-4 rounded-xl font-bold hover:scale-105 transition-transform inline-flex items-center gap-2">
                            <i data-lucide="play" class="fill-black w-5 h-5"></i> Watch Now
                        </a>
                    </div>
                </div>
            </section>

            <div class="px-12 -mt-20 relative z-20 pb-20">
                ${rows.map(row => {
                    const rowMovies = state.movies.filter(m => m.type === row);
                    if (rowMovies.length === 0) return '';
                    return `
                        <div class="mb-14">
                            <h2 class="text-xl font-bold mb-6">${row}</h2>
                            <div class="row-scroll flex gap-5 overflow-x-auto pb-4">
                                ${rowMovies.map(m => `
                                    <div class="card-hover w-[240px] flex-shrink-0 cursor-pointer group" onclick="window.location.hash='#/watch?id=${m.id}'">
                                        <div class="aspect-video bg-sf-card rounded-xl overflow-hidden border border-sf-border">
                                            <img src="${m.banner}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                                        </div>
                                        <h3 class="mt-3 text-sm font-semibold">${m.title}</h3>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>`;
    }

    renderAdmin() {
        this.viewport.innerHTML = `
            <div class="flex min-h-screen pt-20 bg-sf-dark">
                <aside class="w-72 bg-sf-surface p-10 border-r border-sf-border">
                    <h3 class="text-sf-red font-black text-2xl mb-12 uppercase">Master Admin</h3>
                    <nav class="flex flex-col gap-3">
                        <button onclick="window.app.setAdminTab('content')" class="text-left px-5 py-3 rounded-xl transition-all ${this.adminTab === 'content' ? 'bg-sf-red text-white' : 'text-sf-muted hover:bg-white/5'}">Manage Movies</button>
                        <button onclick="window.app.setAdminTab('appearance')" class="text-left px-5 py-3 rounded-xl transition-all ${this.adminTab === 'appearance' ? 'bg-sf-red text-white' : 'text-sf-muted hover:bg-white/5'}">Site Settings</button>
                        <button onclick="window.location.hash='#/'" class="text-left px-5 py-3 text-sf-muted mt-8">Exit Admin</button>
                    </nav>
                </aside>
                <main class="flex-1 p-16">
                    ${this.adminTab === 'content' ? this.renderContentTab() : this.renderAppearanceTab()}
                </main>
            </div>`;
        this.attachAdminListeners();
    }

    setAdminTab(t) { this.adminTab = t; this.editingMovieId = null; this.renderAdmin(); }

    renderContentTab() {
        const editMovie = this.editingMovieId ? state.movies.find(m => m.id == this.editingMovieId) : null;

        return `
            <div class="max-w-5xl">
                <h1 class="text-4xl font-black mb-10">${this.editingMovieId ? 'Edit Movie' : 'Library Manager'}</h1>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <form id="add-movie-form" class="bg-sf-surface p-8 rounded-2xl border border-sf-border flex flex-col gap-4">
                        <h3 class="text-lg font-bold mb-2">${this.editingMovieId ? 'Editing: ' + editMovie.title : 'Publish New Title'}</h3>
                        <input class="bg-sf-dark border border-sf-border p-4 rounded-xl" name="title" placeholder="Movie Title" value="${editMovie ? editMovie.title : ''}" required>
                        <textarea class="bg-sf-dark border border-sf-border p-4 rounded-xl h-32" name="desc" placeholder="Synopsis" required>${editMovie ? editMovie.desc : ''}</textarea>
                        <input class="bg-sf-dark border border-sf-border p-4 rounded-xl" name="banner" placeholder="Banner Image URL" value="${editMovie ? editMovie.banner : ''}" required>
                        <label class="text-xs text-sf-muted">Row/Category:</label>
                        <select class="bg-sf-dark border border-sf-border p-4 rounded-xl" name="type">
                            ${state.config.layout.homepageRows.map(r => `<option value="${r}" ${editMovie && editMovie.type === r ? 'selected' : ''}>${r}</option>`).join('')}
                        </select>
                        <input class="bg-sf-dark border border-sf-border p-4 rounded-xl" name="url" placeholder="Abyss Link" value="${editMovie ? editMovie.embedUrl : ''}" required>
                        <label class="flex items-center gap-3"><input type="checkbox" name="feat" ${editMovie && editMovie.featured ? 'checked' : ''}> Spotlight?</label>
                        
                        <div class="flex gap-3 mt-4">
                            <button type="submit" class="flex-1 bg-sf-red text-white p-4 rounded-xl font-bold">${this.editingMovieId ? 'UPDATE MOVIE' : 'PUBLISH NOW'}</button>
                            ${this.editingMovieId ? `<button type="button" onclick="window.app.cancelEdit()" class="bg-white/10 p-4 rounded-xl font-bold">Cancel</button>` : ''}
                        </div>
                    </form>

                    <div>
                        <h3 class="text-lg font-bold mb-6">Inventory</h3>
                        <div class="flex flex-col gap-3">
                            ${state.movies.map(m => `
                                <div class="bg-sf-surface p-4 rounded-xl border border-sf-border flex justify-between items-center ${this.editingMovieId == m.id ? 'border-sf-red ring-1 ring-sf-red' : ''}">
                                    <div class="truncate pr-4"><span class="block font-bold truncate">${m.title}</span><span class="text-[10px] text-sf-muted uppercase">${m.type}</span></div>
                                    <div class="flex gap-4">
                                        <button onclick="window.app.startEdit(${m.id})" class="text-white hover:text-sf-red text-xs font-bold">EDIT</button>
                                        <button onclick="window.app.deleteTitle(${m.id})" class="text-sf-red hover:text-red-400 text-xs font-bold">DELETE</button>
                                    </div>
                                </div>
                            `).reverse().join('')}
                        </div>
                    </div>
                </div>
            </div>`;
    }

    renderAppearanceTab() {
        return `
            <div class="max-w-xl">
                <h1 class="text-4xl font-black mb-10">Site Settings</h1>
                <form id="identity-form" class="bg-sf-surface p-8 rounded-2xl border border-sf-border flex flex-col gap-4">
                    <label>Brand Name</label>
                    <input class="bg-sf-dark border border-sf-border p-4 rounded-xl" name="name" value="${state.config.appearance.siteName}">
                    <button type="submit" class="bg-sf-red p-4 rounded-xl font-bold mt-4">Save Settings</button>
                </form>
            </div>`;
    }

    startEdit(id) {
        this.editingMovieId = id;
        this.renderAdmin();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    cancelEdit() {
        this.editingMovieId = null;
        this.renderAdmin();
    }

    attachAdminListeners() {
        const mForm = document.getElementById('add-movie-form');
        if (mForm) {
            mForm.onsubmit = (e) => {
                e.preventDefault();
                const f = new FormData(mForm);
                const movieData = {
                    title: f.get('title'),
                    desc: f.get('desc'),
                    banner: f.get('banner'),
                    type: f.get('type'),
                    embedUrl: f.get('url'),
                    featured: f.get('feat') === 'on'
                };

                if (this.editingMovieId) {
                    // Update existing
                    const idx = state.movies.findIndex(m => m.id == this.editingMovieId);
                    state.movies[idx] = { ...state.movies[idx], ...movieData };
                    state.save();
                    alert("Movie Updated Successfully!");
                    this.editingMovieId = null;
                } else {
                    // Add new
                    state.addMovie(movieData);
                    alert("New Movie Published!");
                }
                this.renderAdmin();
            };
        }
        const iForm = document.getElementById('identity-form');
        if (iForm) {
            iForm.onsubmit = (e) => {
                e.preventDefault();
                state.config.appearance.siteName = new FormData(iForm).get('name');
                state.save();
                alert("Site Updated!");
                this.renderAdmin();
            };
        }
    }

    deleteTitle(id) {
        if (confirm("Permanently delete this?")) {
            state.deleteMovie(id);
            if (this.editingMovieId == id) this.editingMovieId = null;
            this.renderAdmin();
        }
    }

    renderWatch(id) {
        const m = state.movies.find(x => x.id == id);
        if (!m) return this.renderHome();
        this.viewport.innerHTML = `
            <div class="pt-20 bg-black min-h-screen">
                <div class="max-w-[1920px] mx-auto px-4 lg:px-12">
                    <div class="aspect-video w-full bg-sf-card rounded-2xl overflow-hidden shadow-2xl">
                        <iframe src="${m.embedUrl}" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
                    </div>
                    <div class="py-12">
                        <h1 class="text-5xl font-black mb-4">${m.title}</h1>
                        <p class="text-sf-muted text-xl leading-relaxed max-w-4xl">${m.desc}</p>
                    </div>
                </div>
            </div>`;
    }

    renderFooter() {
        document.getElementById('footer').innerHTML = `
            <footer class="p-12 text-center border-t border-white/5 opacity-20">
                <span class="text-xl font-bold">Stream<span class="text-sf-red">Flix</span></span>
            </footer>`;
    }
}

window.app = new App();
