const logger = require('../config/logger');
const { getClients } = require('../utils/clientManager');

function widget(req, res) {
  const { clientId } = req.params;
  logger.info('Widget script request for clientId:', clientId);
  const config = getClients()[clientId];

  if (!config) {
    logger.error('Configuration not found for clientId:', clientId);
    return res.status(404).send(`console.error("Configuration not found for clientId:", "${clientId}");`);
  }

  const widgetScript = `
(function () {
  const BACKEND_URL = "${process.env.BASE_URL}";
  const WIDGET_SIZE_CLASSES = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg'
  };

  function injectCustomStyles() {
    const style = document.createElement('style');
    style.textContent = \`
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes starPulse {
        0% { transform: scale(1); filter: brightness(1); }
        50% { transform: scale(1.15); filter: brightness(1.3); }
        100% { transform: scale(1); filter: brightness(1); }
      }
      @keyframes likeHeart {
        0% { transform: scale(1); }
        50% { transform: scale(1.5); }
        100% { transform: scale(1); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .review-card {
        background: white;
        border: 2px solid transparent;
        border-image: linear-gradient(45deg, \${['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'][Math.floor(Math.random() * 4)]}, \${['#ffcc5c', '#d4a5a5', '#9b59b6', '#3498db'][Math.floor(Math.random() * 4)]}) 1;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        animation: fadeInUp 0.5s ease forwards;
        animation-delay: calc(var(--index) * 0.2s);
        opacity: 0;
        flex: 0 0 90%;
        max-width: 90%;
        border-radius: 0.5rem;
      }
      @media (min-width: 640px) {
        .review-card {
          flex: 0 0 320px;
          max-width: 320px;
        }
      }
      @media (min-width: 1024px) {
        .review-card {
          flex: 0 0 400px;
          max-width: 400px;
        }
      }
      .review-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      }
      .star:hover {
        animation: starPulse 0.5s ease-in-out;
      }
      .like-btn.liked {
        color: #ff4757;
        animation: likeHeart 0.3s ease;
      }
      .rating-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
      }
      .reviews-row {
        display: flex;
        flex-direction: row;
        overflow-x: auto;
        gap: 1rem;
        padding: 0.5rem 0;
        scrollbar-width: thin;
        scrollbar-color: ${config.themeColor}-500 #e5e7eb;
      }
      .reviews-row::-webkit-scrollbar {
        height: 8px;
      }
      .reviews-row::-webkit-scrollbar-track {
        background: #e5e7eb;
        border-radius: 4px;
      }
      .reviews-row::-webkit-scrollbar-thumb {
        background: ${config.themeColor}-500;
        border-radius: 4px;
      }
      @media (max-width: 639px) {
        .reviews-row {
          flex-direction: column;
          align-items: center;
          overflow-x: hidden;
        }
        .review-card {
          width: 100%;
          max-width: 100%;
        }
      }
      .sort-select {
        transition: all 0.2s ease;
      }
      .sort-select:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
      }
      .write-review-btn {
        transition: all 0.3s ease;
      }
      .widget-header {
        transition: opacity 0.3s ease;
      }
      .rating-bar {
        height: 0.5rem;
        border-radius: 0.25rem;
        transition: width 0.5s ease;
      }
      .fade-transition {
        transition: opacity 0.3s ease;
      }
    \`;
    document.head.appendChild(style);
  }

  function loadDependencies(callback) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
    link.onload = () => {
      injectCustomStyles();
      callback();
    };
    link.onerror = () => console.error('Failed to load Tailwind CSS');
    document.head.appendChild(link);
  }

  function initWidget() {
    const container = document.getElementById('google-reviews');
    if (!container) {
      console.error('Google Reviews container not found. Add <div id="google-reviews">');
      return;
    }

    let place = null;
    let reviews = [];
    let displayedReviews = [];
    let isLoading = false;
    let error = '';
    let likedReviews = new Set();
    let sortOption = 'newest';
    const reviewsPerPage = 5;
    let currentPage = 1;

    function getRatingDistribution() {
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach(review => {
        if (review.rating) distribution[review.rating]++;
      });
      const total = reviews.length;
      return Object.entries(distribution).map(([stars, count]) => ({
        stars: parseInt(stars),
        count,
        percentage: total ? ((count / total) * 100).toFixed(1) : 0
      })).sort((a, b) => b.stars - a.stars);
    }

    function sortReviews() {
      const sorted = [...reviews];
      switch (sortOption) {
        case 'highest':
          sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'lowest':
          sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
          break;
        case 'newest':
          sorted.sort((a, b) => (b.time || 0) - (a.time || 0));
          break;
        case 'oldest':
          sorted.sort((a, b) => (a.time || 0) - (b.time || 0));
          break;
      }
      return sorted;
    }

    function updateDisplayedReviews() {
      const sorted = sortReviews();
      const start = (currentPage - 1) * reviewsPerPage;
      displayedReviews = sorted.slice(start, start + reviewsPerPage);
    }

    function render() {
      updateDisplayedReviews();
      const distribution = getRatingDistribution();
      container.className = 'google-reviews-widget p-6 bg-gradient-to-br from-${config.themeColor}-50 to-white rounded-2xl shadow-xl transition-all duration-300 ' + WIDGET_SIZE_CLASSES['${config.widgetSize}'];
      container.setAttribute('role', 'region');
      container.setAttribute('aria-label', 'Google Reviews');
      container.innerHTML = \`
        <div class="space-y-6">
          \${isLoading ? \`
            <div class="animate-pulse space-y-6">
              <div class="flex items-center gap-4">
                <div class="h-16 w-16 rounded-full bg-gray-200"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-8 w-3/4 bg-gray-200 rounded-lg"></div>
                  <div class="h-4 w-1/2 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
              <div class="space-y-4">
                \${[1, 2, 3].map(() => \`
                  <div class="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div class="flex items-center gap-4">
                      <div class="h-12 w-12 rounded-full bg-gray-200"></div>
                      <div class="flex-1 space-y-2">
                        <div class="h-4 w-1/3 bg-gray-200 rounded-lg"></div>
                        <div class="h-3 w-1/2 bg-gray-200 rounded-lg"></div>
                      </div>
                    </div>
                    <div class="h-3 w-5/6 bg-gray-200 rounded-lg"></div>
                  </div>
                \`).join('')}
              </div>
            </div>
          \` : error ? \`
            <div class="text-center text-red-600 p-8 font-medium" role="alert">\${error}</div>
          \` : place ? \`
            <div class="widget-header fade-transition">
              <div class="flex items-center gap-4">
                \${place.photos && place.photos[0]?.photo_reference ? \`
                  <img src="\${BACKEND_URL}/api/google/place-photo?photo_reference=\${place.photos[0].photo_reference}&maxwidth=64" alt="\${place.name} logo" class="w-16 h-16 rounded-full object-cover ring-2 ring-${config.themeColor}-200">
                \` : \`
                  <div class="w-16 h-16 rounded-full bg-${config.themeColor}-200 flex items-center justify-center text-${config.themeColor}-600 font-bold text-2xl">
                    \${place.name?.charAt(0) || '?'}
                  </div>
                \`}
                <div class="flex-1">
                  <h3 class="text-2xl font-extrabold text-${config.themeColor}-900 tracking-tight">\${place.name}</h3>
                  <div class="flex items-center gap-3 mt-2">
                    <div class="flex" role="img" aria-label="Rating: \${place.rating?.toFixed(1)} out of 5">
                      \${[1, 2, 3, 4, 5].map(star => \`
                        <svg class="w-5 h-5 star \${star <= Math.floor(place.rating) ? 'text-yellow-400' : 'text-gray-300'} cursor-pointer" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24 .588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3 .922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783 .57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81 .588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                        </svg>
                      \`).join('')}
                    </div>
                    <span class="text-sm font-semibold text-${config.themeColor}-700">\${place.rating?.toFixed(1)} / 5</span>
                    <span class="text-xs text-gray-500">(\${place.user_ratings_total || 0} reviews)</span>
                  </div>
                </div>
              </div>
              \${place.formatted_address ? \`
                <p class="mt-3 text-sm text-gray-600">\${place.formatted_address}</p>
              \` : ''}
              <div class="flex justify-between items-center mt-4">
                <a href="https://www.google.com/maps/place/?q=place_id:${config.placeId}" target="_blank" rel="noopener noreferrer" class="write-review-btn inline-flex items-center bg-gradient-to-r from-${config.themeColor}-500 to-${config.themeColor}-600 text-white px-4 py-2 rounded-lg hover:from-${config.themeColor}-600 hover:to-${config.themeColor}-700 transition-all duration-200 font-medium" aria-label="Write a review on Google">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.828l-5.657 1.414 1.414-5.657L18.414 2.586z" />
                  </svg>
                  Write a Review
                </a>
                <select id="sort-reviews" class="sort-select px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-${config.themeColor}-500" aria-label="Sort reviews">
                  <option value="newest" \${sortOption === 'newest' ? 'selected' : ''}>Newest First</option>
                  <option value="oldest" \${sortOption === 'oldest' ? 'selected' : ''}>Oldest First</option>
                  <option value="highest" \${sortOption === 'highest' ? 'selected' : ''}>Highest Rated</option>
                  <option value="lowest" \${sortOption === 'lowest' ? 'selected' : ''}>Lowest Rated</option>
                </select>
              </div>
            </div>
            <div class="rating-summary bg-gray-50 p-4 rounded-lg fade-transition">
              <h4 class="text-sm font-semibold text-gray-800 mb-3">Rating Distribution</h4>
              <div class="space-y-2">
                \${distribution.map(item => \`
                  <div class="flex items-center gap-3">
                    <span class="text-xs text-gray-600 w-8">\${item.stars} ★</span>
                    <div class="flex-1 bg-gray-200 rounded-full h-2">
                      <div class="rating-bar bg-${config.themeColor}-500 h-2 rounded-full" style="width: \${item.percentage}%"></div>
                    </div>
                    <span class="text-xs text-gray-500">\${item.count} (\${item.percentage}%)</span>
                  </div>
                \`).join('')}
              </div>
            </div>
            \${displayedReviews.length > 0 ? \`
              <div class="reviews-row mt-6">
                \${displayedReviews.map((review, index) => \`
                  <div class="review-card p-4" style="--index: \${index}">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-\${['pink', 'orange', 'purple', 'cyan'][index % 4]}-200 flex items-center justify-center text-\${['pink', 'orange', 'purple', 'cyan'][index % 4]}-600 font-bold text-lg ring-2 ring-\${['pink', 'orange', 'purple', 'cyan'][index % 4]}-300">
                        \${review.author_name?.charAt(0) || '?'}
                      </div>
                      <div class="flex-1">
                        <h4 class="text-sm font-semibold text-\${['pink', 'orange', 'purple', 'cyan'][index % 4]}-600">\${review.author_name || 'Anonymous'}</h4>
                        <div class="flex items-center gap-2 mt-1">
                          <div class="flex" role="img" aria-label="Review rating: \${review.rating} out of 5">
                            \${[1, 2, 3, 4, 5].map(star => \`
                              <svg class="w-4 h-4 star \${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'} cursor-pointer" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24 .588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3 .922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783 .57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81 .588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                              </svg>
                            \`).join('')}
                          </div>
                          <span class="rating-badge \${review.rating >= 4 ? 'bg-green-100 text-green-600' : review.rating === 3 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}">\${review.rating}/5</span>
                          <span class="text-xs text-gray-500">\${new Date(review.time * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <p class="mt-3 text-sm text-gray-700 leading-relaxed line-clamp-4" id="review-text-\${index}">\${review.text || ''}</p>
                    \${review.text && review.text.length > 120 ? \`
                      <button class="read-more-btn text-${config.themeColor}-600 text-sm font-medium mt-2 hover:text-${config.themeColor}-700" onclick="toggleReadMore(\${index})">Read More</button>
                    \` : ''}
                    <button class="like-btn mt-2 text-gray-400 hover:text-red-500 \${likedReviews.has(index) ? 'liked' : ''}" onclick="toggleLike(\${index})" aria-label="Like review">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 .81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </button>
                  </div>
                \`).join('')}
              </div>
              \${reviews.length > reviewsPerPage ? \`
                <div class="flex justify-center mt-6">
                  <button id="load-more" class="inline-flex items-center bg-gradient-to-r from-${config.themeColor}-500 to-${config.themeColor}-600 text-white px-4 py-2 rounded-lg hover:from-${config.themeColor}-600 hover:to-${config.themeColor}-700 transition-all duration-200 font-medium \${currentPage * reviewsPerPage >= reviews.length ? 'opacity-50 cursor-not-allowed' : ''}" \${currentPage * reviewsPerPage >= reviews.length ? 'disabled' : ''} aria-label="Load more reviews">
                    Load More
                  </button>
                </div>
              \` : ''}
            \` : \`
              <div class="text-center text-gray-500 p-8 font-medium">No reviews available for this business.</div>
            \`}
          \` : \`
            <div class="text-center text-gray-500 p-8 font-medium">No place found. Please check the configuration.</div>
          \`}
        </div>
      \`;

      const sortSelect = document.getElementById('sort-reviews');
      if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
          sortOption = e.target.value;
          currentPage = 1;
          container.style.opacity = '0.5';
          setTimeout(() => {
            render();
            container.style.opacity = '1';
          }, 300);
        });
      }

      const loadMoreBtn = document.getElementById('load-more');
      if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
          if (currentPage * reviewsPerPage < reviews.length) {
            currentPage++;
            render();
          }
        });
      }

      window.toggleReadMore = function(index) {
        const textEl = document.getElementById(\`review-text-\${index}\`);
        const btn = textEl.nextElementSibling;
        if (textEl.classList.contains('line-clamp-4')) {
          textEl.classList.remove('line-clamp-4');
          btn.textContent = 'Read Less';
        } else {
          textEl.classList.add('line-clamp-4');
          btn.textContent = 'Read More';
        }
      };

      window.toggleLike = function(index) {
        const btn = document.querySelector(\`#review-text-\${index}\`).parentElement.querySelector('.like-btn');
        if (likedReviews.has(index)) {
          likedReviews.delete(index);
          btn.classList.remove('liked');
        } else {
          likedReviews.add(index);
          btn.classList.add('liked');
        }
      };
    }

    async function fetchPlace() {
      isLoading = true;
      error = '';
      render();
      try {
        console.log('Fetching reviews for clientId:', "${clientId}");
        const res = await fetch(\`\${BACKEND_URL}/api/google/reviews?clientId=${clientId}\`);
        if (!res.ok) throw new Error(\`HTTP error: \${res.status}\`);
        const data = await res.json();
        console.log('Reviews response:', data);
        if (data.result) {
          place = data.result;
          reviews = data.result.reviews || [];
        } else {
          throw new Error(data.error || 'Failed to fetch place details');
        }
      } catch (err) {
        error = err.message || 'Failed to fetch place details';
        console.error('Fetch error:', err);
        place = null;
        reviews = [];
      }
      isLoading = false;
      render();
    }

    loadDependencies(() => {
      const query = '${config.placeId}' ? 'place_id:${config.placeId}' : '${config.placeName}';
      if (query) fetchPlace();
      else {
        error = 'Please provide a valid place name or ID';
        render();
      }
    });
  }

  initWidget();
})();
  `;

  logger.info('Generated widget script for clientId:', clientId);
  res.set('Content-Type', 'application/javascript');
  res.send(widgetScript);
}

module.exports = widget;