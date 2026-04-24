import { state } from './state.js';

class App {
    constructor() {
        this.mainContent = document.getElementById('main-content');
        this.navbar = document.getElementById('navbar');
        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
        this.renderNavbar();
    }

    handleRoute() {
        const hash = window.location.hash || '#/';
        if (hash.startsWith('#/watch')) {
            const params = new URLSearchParams(hash.split('?')[1]);
            this.renderWatch(params.get('id'));
        } else if (hash === '#/portal') {
            this.renderAdmin();
        } else {
            this.renderHome();
        }
        this.renderFooter();
        lucide.createIcons();
    }

    renderNavbar() {
        this.navbar.innerHTML = `
            <div class="container nav-container">
                <a href="#/" class="logo"><i data-lucide="zap"></i> VELA</a>
                <div class="nav-links">
                    <a href="#/">Home</a>
                    <a href="#/movies">Movies</a>
                    <a href="#/tv-shows">TV Shows</a>
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
        lucide.createIcons();
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
        const featured = state.movies.find(m => m.featured) || state.movies[0];
        const categories = ['Trending', 'Anime', 'Tamil Movies'];

        this.mainContent.innerHTML = `
            <section class="hero" style="background-image: linear-gradient(to top, var(--bg-deep), transparent), url('${featured.banner}')">
                <div class="hero-overlay"></div>
                <div class="container hero-content fade-in">
                    <div class="featured-badge">FEATURED</div>
                    <h1>${featured.title}</h1>
                    <p>${featured.description}</p>
                    <div class="actions">
                        <a href="#/watch?id=${featured.id}" class="btn btn-primary">
                            <i data-lucide="play"></i> Watch Now
                        </a>
                    </div>
                </div>
            </section>
            <div class="carousels container">
                ${categories.map(cat => {
                    const movies = state.getMoviesByCategory(cat);
                    if (movies.length === 0) return '';
                    return `
                    <section class="carousel-section" style="margin-top: 3rem;">
                        <h2>${cat}</h2>
                        <div class="movie-grid">
                            ${movies.map(m => this.createMovieCard(m)).join('')}
                        </div>
                    </section>
                    `;
                }).join('')}
            </div>
        `;
    }

    createMovieCard(movie) {
        return `
            <div class="movie-card" onclick="window.location.hash = '#/watch?id=${movie.id}'">
                <div class="poster">
                    <img src="${movie.thumbnail}" alt="${movie.title}">
                    <div class="overlay">
                        <div class="play-btn-small"><i data-lucide="play"></i></div>
                    </div>
                </div>
                <div class="card-info">
                    <h3>${movie.title}</h3>
                </div>
            </div>
        `;
    }

    renderWatch(id) {
        const movie = state.movies.find(m => m.id === id);
        if (!movie) return this.renderHome();
        this.mainContent.innerHTML = `
            <div class="watch-container">
                <div class="player-wrapper">
                    <iframe src="${movie.embedUrl}" frameborder="0" allowfullscreen></iframe>
                </div>
                <div class="container movie-details" style="padding-top: 2rem;">
                    <h1>${movie.title}</h1>
                    <p>${movie.description}</p>
                </div>
            </div>
        `;
    }

    renderAdmin() {
        this.mainContent.innerHTML = `
            <div class="container admin-page">
                <h1>Admin Portal</h1>
                <div class="admin-grid">
                    <div class="admin-card">
                        <h2>Add Movie</h2>
                        <form id="add-movie-form" class="admin-form">
                            <input name="title" placeholder="Title" required>
                            <textarea name="desc" placeholder="Description" required></textarea>
                            <input name="thumb" placeholder="Poster URL" required>
                            <input name="banner" placeholder="Banner URL" required>
                            <input name="genre" placeholder="Genre (e.g. Anime)" required>
                            <input name="url" placeholder="Abyss.to Link" required>
                            <button type="submit" class="btn btn-primary">Publish</button>
                        </form>
                    </div>
                    <div class="admin-card">
                        <h2>Manage Library</h2>
                        ${state.movies.map(m => `
                            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                                <span>${m.title}</span>
                                <button onclick="window.app.deleteMovie('${m.id}')" style="color:red; background:none; border:none; cursor:pointer;">Delete</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.getElementById('add-movie-form').onsubmit = (e) => {
            e.preventDefault();
            const f = new FormData(e.target);
            state.addMovie({
                title: f.get('title'), description: f.get('desc'),
                thumbnail: f.get('thumb'), banner: f.get('banner'),
                genre: [f.get('genre')], type: f.get('genre'),
                embedUrl: f.get('url')
            });
            this.renderAdmin();
        };
    }

    deleteMovie(id) {
        state.deleteMovie(id);
        this.renderAdmin();
    }
}

window.app = new App();
