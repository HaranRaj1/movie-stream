import { state } from './state.js';

// Router & Component Management
class App {
    constructor() {
        this.mainContent = document.getElementById('main-content');
        this.navbar = document.getElementById('navbar');
        this.init();
    }

    init() {
        window.addEventListener('popstate', () => this.handleRoute());
        this.handleRoute();
        this.renderNavbar();
        
        // Listen for internal navigation
        document.body.addEventListener('click', e => {
            const link = e.target.closest('[data-link]');
            if (link) {
                e.preventDefault();
                this.navigate(link.getAttribute('href'));
            }
        });
    }

    navigate(path) {
        window.history.pushState({}, '', path);
        this.handleRoute();
    }

    handleRoute() {
        const path = window.location.pathname;
        const searchParams = new URLSearchParams(window.location.search);

        if (path === '/' || path.includes('index.html')) {
            this.renderHome();
        } else if (path.startsWith('/watch')) {
            const id = searchParams.get('id');
            this.renderWatch(id);
        } else if (path.startsWith('/portal')) { // Secret Admin Path
            this.renderAdmin();
        } else {
            this.renderHome();
        }

        this.renderFooter();
        window.scrollTo(0, 0);
        lucide.createIcons();
    }

    renderFooter() {
        const footer = document.getElementById('footer');
        footer.innerHTML = `
            <div class="container">
                <div class="footer-content">
                    <p>&copy; 2024 Vela Stream. Premium Cinematic Experience.</p>
                    <a href="/portal" class="secret-link" data-link>Admin</a>
                </div>
            </div>
        `;
    }

    renderNavbar() {
        this.navbar.innerHTML = `
            <div class="container nav-container">
                <a href="/" class="logo" data-link>
                    <span class="logo-icon"><i data-lucide="zap"></i></span>
                    <span class="logo-text">VELA</span>
                </a>
                <div class="nav-links">
                    <a href="/" data-link>Home</a>
                    <a href="/movies" data-link>Movies</a>
                    <a href="/tv-shows" data-link>TV Shows</a>
                    <a href="/categories" data-link>Categories</a>
                </div>
                <div class="nav-actions">
                    <div class="search-bar">
                        <i data-lucide="search"></i>
                        <input type="text" id="movie-search" placeholder="Search movies..." value="${state.searchQuery}">
                    </div>
                </div>
            </div>
        `;

        const searchInput = document.getElementById('movie-search');
        if (searchInput) {
            searchInput.oninput = (e) => {
                const results = state.search(e.target.value);
                this.renderSearchResults(results);
            };
        }
        lucide.createIcons();
    }

    renderSearchResults(results) {
        if (!state.searchQuery) return this.handleRoute();
        this.mainContent.innerHTML = `
            <div class="container search-results">
                <h2>Search Results for "${state.searchQuery}"</h2>
                <div class="movie-grid">
                    ${results.map(m => this.createMovieCard(m)).join('')}
                </div>
            </div>
        `;
        lucide.createIcons();
    }

    renderHome() {
        const featured = state.getFeatured();
        const categories = ['Trending', 'New Releases', 'Top Rated', 'Anime', 'Tamil Movies'];
        const continueWatching = state.continueWatching.map(item => {
            const m = state.movies.find(movie => movie.id === item.movieId);
            return m ? { ...m, progress: item.progress } : null;
        }).filter(m => m !== null);

        this.mainContent.innerHTML = `
            <!-- Hero Section -->
            <section class="hero" style="background-image: linear-gradient(to top, var(--bg-deep), transparent), url('${featured.banner}')">
                <div class="hero-overlay"></div>
                <div class="container hero-content fade-in">
                    <div class="featured-badge">FEATURED</div>
                    <h1>${featured.title}</h1>
                    <div class="meta">
                        <span class="rating"><i data-lucide="star"></i> ${featured.rating}</span>
                        <span>${featured.releaseYear}</span>
                        <span>${featured.duration}</span>
                    </div>
                    <p>${featured.description}</p>
                    <div class="actions">
                        <a href="/watch?id=${featured.id}" class="btn btn-primary" data-link>
                            <i data-lucide="play"></i> Watch Now
                        </a>
                        <button class="btn btn-secondary">
                            <i data-lucide="info"></i> More Info
                        </button>
                    </div>
                </div>
            </section>

            <div class="carousels container">
                ${continueWatching.length > 0 ? `
                <section class="carousel-section">
                    <h2>Continue Watching</h2>
                    <div class="movie-grid">
                        ${continueWatching.map(m => this.createMovieCard(m, true)).join('')}
                    </div>
                </section>
                ` : ''}

                ${categories.map(cat => {
                    const movies = state.getMoviesByCategory(cat);
                    if (movies.length === 0) return '';
                    return `
                    <section class="carousel-section">
                        <h2>${cat}</h2>
                        <div class="movie-grid">
                            ${movies.map(m => this.createMovieCard(m)).join('')}
                        </div>
                    </section>
                    `;
                }).join('')}
            </div>
        `;
        lucide.createIcons();
    }

    createMovieCard(movie, showProgress = false) {
        return `
            <div class="movie-card" onclick="window.app.navigate('/watch?id=${movie.id}')">
                <div class="poster">
                    <img src="${movie.thumbnail}" alt="${movie.title}" loading="lazy">
                    ${showProgress ? `<div class="progress-bar"><div class="progress" style="width: ${movie.progress}%"></div></div>` : ''}
                    <div class="overlay">
                        <div class="card-preview-info">
                            <div class="play-btn-small"><i data-lucide="play"></i></div>
                            <div class="card-preview-meta">
                                <span class="rating-small"><i data-lucide="star"></i> ${movie.rating}</span>
                                <span>${movie.duration}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-info">
                    <h3>${movie.title}</h3>
                    <div class="card-meta">
                        <span>${movie.releaseYear}</span>
                        <span>•</span>
                        <span>${movie.genre[0]}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderWatch(id) {
        const movie = state.movies.find(m => m.id === id);
        if (!movie) return this.renderHome();

        state.addToHistory(id);

        this.mainContent.innerHTML = `
            <div class="watch-container">
                <div class="player-wrapper">
                    <iframe 
                        src="${movie.embedUrl}" 
                        frameborder="0" 
                        allowfullscreen 
                        scrolling="no">
                    </iframe>
                </div>
                <div class="container movie-details">
                    <div class="details-header">
                        <h1>${movie.title}</h1>
                        <button class="favorite-btn" onclick="state.toggleFavorite('${movie.id}')">
                            <i data-lucide="heart"></i>
                        </button>
                    </div>
                    <div class="meta-row">
                        <span class="rating"><i data-lucide="star"></i> ${movie.rating}</span>
                        <span>${movie.releaseYear}</span>
                        <span>${movie.duration}</span>
                        <div class="genres">
                            ${movie.genre.map(g => `<span class="genre-tag">${g}</span>`).join('')}
                        </div>
                    </div>
                    <p class="synopsis">${movie.description}</p>
                </div>
            </div>
        `;
    }

    renderAdmin() {
        this.mainContent.innerHTML = `
            <div class="container admin-page fade-in">
                <div class="admin-header">
                    <h1>Admin Dashboard</h1>
                    <p>Manage your movie library and featured content.</p>
                </div>

                <div class="admin-grid">
                    <div class="admin-card glass">
                        <h2>Add New Title</h2>
                        <form id="add-movie-form" class="admin-form">
                            <div class="form-group">
                                <label>Movie Title</label>
                                <input type="text" name="title" required placeholder="Enter title">
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea name="description" required placeholder="Enter synopsis"></textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Thumbnail URL</label>
                                    <input type="url" name="thumbnail" required placeholder="https://...">
                                </div>
                                <div class="form-group">
                                    <label>Banner URL</label>
                                    <input type="url" name="banner" required placeholder="https://...">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Genre (comma separated)</label>
                                    <input type="text" name="genre" required placeholder="Action, Sci-Fi">
                                </div>
                                <div class="form-group">
                                    <label>Rating</label>
                                    <input type="number" step="0.1" name="rating" placeholder="8.5">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Abyss.to Embed Link</label>
                                <input type="url" name="embedUrl" required placeholder="https://abyss.to/e/...">
                            </div>
                            <button type="submit" class="btn btn-primary">Publish Movie</button>
                        </form>
                    </div>

                    <div class="admin-card glass">
                        <h2>Manage Content</h2>
                        <div class="movie-list">
                            ${state.movies.map(m => `
                                <div class="list-item">
                                    <span>${m.title}</span>
                                    <div class="item-actions">
                                        <button onclick="window.app.deleteMovie('${m.id}')" class="delete-btn">
                                            <i data-lucide="trash-2"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const form = document.getElementById('add-movie-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const movieData = {
                title: formData.get('title'),
                description: formData.get('description'),
                thumbnail: formData.get('thumbnail'),
                banner: formData.get('banner'),
                genre: formData.get('genre').split(',').map(g => g.trim()),
                rating: parseFloat(formData.get('rating')),
                embedUrl: formData.get('embedUrl')
            };
            state.addMovie(movieData);
            alert('Movie added successfully!');
            this.renderAdmin();
        };
    }

    deleteMovie(id) {
        if (confirm('Are you sure you want to delete this movie?')) {
            state.deleteMovie(id);
            this.renderAdmin();
        }
    }
}

// Initialize the app
window.app = new App();
window.state = state; // Make state accessible globally for inline handlers
