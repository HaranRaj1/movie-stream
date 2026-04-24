import { state } from './state.js';

class App {
    constructor() {
        this.mainContent = document.getElementById('main-content');
        this.navbar = document.getElementById('navbar');
        this.isAdminAuthenticated = false;
        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
        this.renderNavbar();
    }

    handleRoute() {
        const hash = window.location.hash || '#/';
        
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
            const pass = prompt("Please enter the Admin Password:");
            if (pass === state.adminPassword) {
                this.isAdminAuthenticated = true;
                this.renderAdmin();
            } else {
                alert("Incorrect Password!");
                window.location.hash = "#/";
            }
        } else {
            this.renderAdmin();
        }
    }

    renderNavbar() {
        this.navbar.innerHTML = `
            <div class="container nav-container">
                <a href="#/" class="logo"><i data-lucide="zap"></i> VELA</a>
                <div class="nav-links">
                    <a href="#/">Home</a>
                    <a href="#/movies">Movies</a>
                </div>
                <div class="nav-actions">
                    <div class="search-bar">
                        <i data-lucide="search"></i>
                        <input type="text" id="movie-search" placeholder="Search movies...">
                    </div>
                </div>
            </div>
        `;
        const searchInput = document.getElementById('movie-search');
        if (searchInput) {
            searchInput.oninput = (e) => {
                state.search(e.target.value);
                this.renderSearchResults();
            };
        }
    }

    renderFooter() {
        document.getElementById('footer').innerHTML = `
            <div class="container footer-content">
                <p>&copy; 2024 Vela Stream. Premium Cinematic Experience.</p>
                <a href="#/portal" class="secret-link">Admin</a>
            </div>
        `;
    }

    renderHome() {
        const featured = state.getFeatured();
        const categories = ['Trending', 'Anime', 'Tamil Movies', 'Action'];

        this.mainContent.innerHTML = `
            <section class="hero" style="background-image: linear-gradient(to top, var(--bg-deep), transparent), url('${featured.banner}')">
                <div class="hero-overlay"></div>
                <div class="container hero-content fade-in">
                    <div class="featured-badge">SPOTLIGHT</div>
                    <h1>${featured.title}</h1>
                    <p>${featured.description}</p>
                    <div class="actions">
                        <a href="#/watch?id=${featured.id}" class="btn btn-primary">Watch Now</a>
                    </div>
                </div>
            </section>
            <div class="carousels container">
                ${categories.map(cat => {
                    const movies = state.getMoviesByCategory(cat);
                    if (movies.length === 0) return '';
                    return `
                    <section style="margin-top: 3rem;">
                        <h2>${cat}</h2>
                        <div class="movie-grid">
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
            <div class="movie-card" onclick="window.location.hash = '#/watch?id=${m.id}'">
                <div class="poster">
                    <img src="${m.thumbnail}" alt="${m.title}">
                    <div class="overlay"><h3>${m.title}</h3></div>
                </div>
            </div>
        `;
    }

    renderWatch(id) {
        const movie = state.movies.find(m => m.id === id);
        this.mainContent.innerHTML = `
            <div class="watch-container">
                <div class="player-wrapper">
                    <iframe src="${movie.embedUrl}" frameborder="0" allowfullscreen></iframe>
                </div>
                <div class="container" style="padding-top: 2rem;">
                    <h1>${movie.title}</h1>
                    <p>${movie.description}</p>
                </div>
            </div>
        `;
    }

    renderAdmin() {
        this.mainContent.innerHTML = `
            <div class="container admin-page">
                <h1 style="margin-bottom:2rem;">Premium Admin Dashboard</h1>
                <div class="admin-grid">
                    <div class="admin-card glass">
                        <h2>Add New Movie</h2>
                        <form id="add-form" class="admin-form">
                            <input name="title" placeholder="Movie Title" required>
                            <textarea name="desc" placeholder="Synopsis/Description" required></textarea>
                            <input name="thumb" placeholder="Poster URL (Vertical)" required>
                            <input name="banner" placeholder="Banner URL (Horizontal/Featured)" required>
                            <input name="genre" placeholder="Row/Category (e.g. Anime, Tamil Movies)" required>
                            <input name="url" placeholder="Abyss.to Embed Link" required>
                            <div style="margin-bottom:1rem; display:flex; align-items:center; gap:10px;">
                                <input type="checkbox" name="featured" style="width:auto; margin:0;">
                                <label>Feature on Homepage spotlight?</label>
                            </div>
                            <button type="submit" class="btn btn-primary">Publish to Site</button>
                        </form>
                    </div>
                    <div class="admin-card glass">
                        <h2>Manage Your Library</h2>
                        <div style="max-height:500px; overflow-y:auto;">
                            ${state.movies.map(m => `
                                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:rgba(255,255,255,0.05); margin-bottom:5px; border-radius:5px;">
                                    <span>${m.title} ${m.featured ? '⭐' : ''}</span>
                                    <button onclick="window.app.deleteMovie('${m.id}')" style="color:#ff4444; background:none; border:none; cursor:pointer;">Delete</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('add-form').onsubmit = (e) => {
            e.preventDefault();
            const f = new FormData(e.target);
            state.addMovie({
                title: f.get('title'),
                description: f.get('desc'),
                thumbnail: f.get('thumb'),
                banner: f.get('banner'),
                genre: [f.get('genre')],
                type: f.get('genre'),
                embedUrl: f.get('url'),
                featured: f.get('featured') === 'on'
            });
            this.renderAdmin();
        };
    }

    deleteMovie(id) {
        if(confirm("Are you sure you want to delete this movie?")) {
            state.deleteMovie(id);
            this.renderAdmin();
        }
    }
}

window.app = new App();
