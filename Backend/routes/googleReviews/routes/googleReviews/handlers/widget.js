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

  // Sanitize config values to prevent injection or syntax errors
  const safeThemeColor = (config.themeColor || 'blue').replace(/[^a-zA-Z0-9]/g, '');
  const safeWidgetSize = config.widgetSize || 'medium';
  const safePlaceId = (config.placeId || '').replace(/'/g, "\\'");
  const safeClientId = (clientId || '').replace(/'/g, "\\'");

  const widgetScript = `
(function () {
  const BACKEND_URL = "${process.env.BASE_URL || 'https://default-backend.com'}";
  const WIDGET_SIZE_CLASSES = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg xl:max-w-2xl'
  };

  // Responsive breakpoints
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  };

  function injectCustomStyles() {
    const style = document.createElement('style');
    style.textContent = \`
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(1rem); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes starPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }
      @keyframes likeHeart {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.4); }
      }
      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
      .google-reviews-widget {
        font-size: 12px; /* Base font size */
        line-height: 1.5;
      }
      .review-card {
        animation: fadeInUp 0.5s ease forwards;
        animation-delay: calc(var(--index) * 0.1s);
        border-radius: 0.5rem;
        border: 1px solid #e5e7eb;
        background: #ffffff;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .review-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
      }
      .star:hover {
        animation: starPulse 0.5s ease-in-out;
      }
      .like-btn.liked {
        animation: likeHeart 0.3s ease;
        color: #ef4444 !important;
      }
      .reviews-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
      }
      @media (max-width: \${breakpoints.sm}px) {
        .reviews-container {
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }
        .google-reviews-widget {
          font-size: 11px; /* Slightly smaller on mobile */
        }
        .review-card {
          padding: 0.75rem;
        }
      }
      @media (min-width: \${breakpoints.sm}px) and (max-width: \${breakpoints.md}px) {
        .reviews-container {
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }
      }
      @media (min-width: \${breakpoints.md}px) {
        .reviews-container {
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }
      }
      .skeleton {
        background: linear-gradient(90deg, #f3f3f3 25%, #e0e0e0 50%, #f3f3f3 75%);
        background-size: 2000px 100%;
        animation: shimmer 2s infinite linear;
        border-radius: 0.5rem;
      }
      .text-xxs {
        font-size: 0.65rem;
        line-height: 0.85rem;
      }
      .read-more-btn {
        transition: all 0.2s ease;
      }
      .read-more-btn:hover {
        text-decoration: underline;
        color: #${safeThemeColor}700;
      }
      .rating-bar {
        transition: width 0.8s ease;
      }
      .widget-header {
        transition: all 0.3s ease;
      }
      .scroll-container {
        scrollbar-width: thin;
        scrollbar-color: #${safeThemeColor}400 #f3f4f6;
      }
      .scroll-container::-webkit-scrollbar {
        height: 6px;
      }
      .scroll-container::-webkit-scrollbar-track {
        background: #f3f4f6;
        border-radius: 10px;
      }
      .scroll-container::-webkit-scrollbar-thumb {
        background-color: #${safeThemeColor}400;
        border-radius: 10px;
      }
    \`;
    document.head.appendChild(style);
  }

  function loadDependencies(callback) {
    if (document.querySelector('link[href*="tailwindcss"]')) {
      injectCustomStyles();
      callback();
      return;
    }

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
    let likedReviews = JSON.parse(localStorage.getItem('likedReviews') || '{}');
    let sortOption = localStorage.getItem('sortOption') || 'newest';
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

    function formatDate(timestamp) {
      const date = new Date(timestamp * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    function renderSkeleton() {
      container.className = \`google-reviews-widget p-3 sm:p-4 bg-white rounded-xl shadow-md \${WIDGET_SIZE_CLASSES['${safeWidgetSize}'] || 'max-w-md'}\`;
      container.innerHTML = \`
        <div class="space-y-4">
          <div class="flex items-center gap-3 sm:gap-4">
            <div class="skeleton w-12 h-12 sm:w-14 sm:h-14 rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="skeleton h-5 sm:h-6 w-3/4 rounded"></div>
              <div class="skeleton h-3 sm:h-4 w-1/2 rounded"></div>
            </div>
          </div>
          <div class="space-y-3">
            \${[1, 2, 3].map(() => \`
              <div class="p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2">
                <div class="flex items-center gap-2 sm:gap-3">
                  <div class="skeleton w-8 h-8 sm:w-10 sm:h-10 rounded-full"></div>
                  <div class="flex-1 space-y-1">
                    <div class="skeleton h-2 sm:h-3 w-1/3 rounded"></div>
                    <div class="skeleton h-2 sm:h-3 w-1/2 rounded"></div>
                  </div>
                </div>
                <div class="space-y-1">
                  <div class="skeleton h-2 sm:h-3 w-full rounded"></div>
                  <div class="skeleton h-2 sm:h-3 w-5/6 rounded"></div>
                  <div class="skeleton h-2 sm:h-3 w-2/3 rounded"></div>
                </div>
              </div>
            \`).join('')}
          </div>
        </div>
      \`;
    }

    function render() {
      updateDisplayedReviews();
      const distribution = getRatingDistribution();

      container.className = \`google-reviews-widget p-3 sm:p-4 md:p-6 bg-white rounded-xl shadow-md transition-all duration-300 \${WIDGET_SIZE_CLASSES['${safeWidgetSize}'] || 'max-w-md'}\`;
      container.setAttribute('role', 'region');
      container.setAttribute('aria-label', 'Google Reviews');

      if (isLoading) {
        renderSkeleton();
        return;
      }

      container.innerHTML = \`
        <div class="space-y-4 sm:space-y-6">
          \${error ? \`
            <div class="text-center p-4 sm:p-6 bg-red-50 rounded-lg">
              <div class="text-red-600 font-medium text-xs sm:text-sm">\${error}</div>
              <button onclick="window.location.reload()" class="mt-2 sm:mt-3 text-xs sm:text-sm text-${safeThemeColor}-600 hover:text-${safeThemeColor}-700">
                Try Again
              </button>
            </div>
          \` : place ? \`
            <div class="widget-header">
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                \${place.photos && place.photos[0]?.photo_reference ? \`
                  <img 
                    src="\${BACKEND_URL}/api/google/place-photo?photo_reference=\${place.photos[0].photo_reference}&maxwidth=100" 
                    alt="\${place.name || 'Business'}" 
                    class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover ring-2 ring-${safeThemeColor}-200 shadow-sm"
                    loading="lazy"
                  >
                \` : \`
                  <div class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-${safeThemeColor}-100 flex items-center justify-center text-${safeThemeColor}-600 font-bold text-lg sm:text-xl shadow-sm">
                    \${place.name?.charAt(0) || '?'}
                  </div>
                \`}
                <div class="flex-1">
                  <h3 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">\${place.name || 'Unknown Business'}</h3>
                  <div class="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                    <div class="flex items-center" role="img" aria-label="Rating: \${place.rating?.toFixed(1) || 'N/A'} out of 5">
                      \${[1, 2, 3, 4, 5].map(star => \`
                        <svg class="w-4 h-4 sm:w-5 sm:h-5 star \${star <= Math.floor(place.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24 .588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3 .922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783 .57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81 .588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                        </svg>
                      \`).join('')}
                      <span class="ml-1 text-xs sm:text-sm font-semibold text-gray-700">\${place.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <span class="text-xxs sm:text-xs text-gray-500">• \${place.user_ratings_total || 0} reviews</span>
                    \${place.formatted_address ? \`
                      <span class="text-xxs sm:text-xs text-gray-500 hidden sm:inline">• \${place.formatted_address.split(',')[0]}</span>
                    \` : ''}
                  </div>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 sm:mt-4 gap-2 sm:gap-3">
                <div class="flex items-center gap-2">
                  <select 
                    id="sort-reviews" 
                    class="px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-700 focus:ring-${safeThemeColor}-500 focus:border-${safeThemeColor}-500"
                    aria-label="Sort reviews"
                  >
                    <option value="newest" \${sortOption === 'newest' ? 'selected' : ''}>Newest First</option>
                    <option value="oldest" \${sortOption === 'oldest' ? 'selected' : ''}>Oldest First</option>
                    <option value="highest" \${sortOption === 'highest' ? 'selected' : ''}>Highest Rated</option>
                    <option value="lowest" \${sortOption === 'lowest' ? 'selected' : ''}>Lowest Rated</option>
                  </select>
                </div>
                <a 
                  href="https://www.google.com/maps/place/?q=place_id:${safePlaceId}" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 bg-${safeThemeColor}-600 text-white rounded-lg hover:bg-${safeThemeColor}-700 transition-colors duration-200 text-xs sm:text-sm font-medium"
                  aria-label="Write a review on Google"
                >
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Write a Review
                </a>
              </div>
            </div>

            <div class="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <h4 class="text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">Rating Distribution</h4>
              <div class="space-y-1 sm:space-y-2">
                \${distribution.map(item => \`
                  <div class="flex items-center gap-2 sm:gap-3">
                    <span class="text-xxs sm:text-xs text-gray-600 w-6 sm:w-8">\${item.stars} ★</span>
                    <div class="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div 
                        class="rating-bar bg-${safeThemeColor}-500 h-1.5 sm:h-2 rounded-full" 
                        style="width: \${item.percentage}%"
                        aria-label="\${item.percentage}% of reviews are \${item.stars} stars"
                      ></div>
                    </div>
                    <span class="text-xxs sm:text-xs text-gray-500">\${item.count} (\${item.percentage}%)</span>
                  </div>
                \`).join('')}
              </div>
            </div>

            \${displayedReviews.length > 0 ? \`
              <div class="reviews-container mt-4 sm:mt-6 gap-3 sm:gap-4">
                \${displayedReviews.map((review, index) => {
                  const reviewId = review.time + '-' + (review.author_name || 'anonymous');
                  const isLiked = likedReviews[reviewId];
                  const colors = ['pink', 'orange', 'purple', 'cyan', 'teal', 'amber'];
                  const color = colors[index % colors.length];

                  return \`
                    <div 
                      class="review-card p-3 sm:p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                      style="--index: \${index}"
                    >
                      <div class="flex items-start gap-2 sm:gap-3">
                        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-\${color}-100 flex items-center justify-center text-\${color}-600 font-bold text-sm sm:text-lg mt-1">
                          \${review.author_name?.charAt(0) || '?'}
                        </div>
                        <div class="flex-1">
                          <div class="flex flex-wrap items-center gap-1 sm:gap-1.5">
                            <h4 class="text-xs sm:text-sm font-semibold text-\${color}-600">\${review.author_name || 'Anonymous'}</h4>
                            <span class="text-xxs sm:text-xs text-gray-500">• \${formatDate(review.time)}</span>
                          </div>
                          <div class="flex items-center gap-1 sm:gap-1.5 mt-1">
                            <div class="flex" role="img" aria-label="Review rating: \${review.rating} out of 5">
                              \${[1, 2, 3, 4, 5].map(star => \`
                                <svg class="w-3 h-3 sm:w-4 sm:h-4 star \${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24 .588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3 .922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783 .57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81 .588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                                </svg>
                              \`).join('')}
                            </div>
                            <span class="text-xxs sm:text-xs px-1 py-0.5 rounded-full \${review.rating >= 4 ? 'bg-green-100 text-green-600' : review.rating === 3 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}">
                              \${review.rating}/5
                            </span>
                          </div>
                          <p 
                            class="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-700 leading-relaxed line-clamp-4" 
                            id="review-text-\${index}"
                          >\${review.text || ''}</p>
                          \${review.text && review.text.length > 200 ? \`
                            <button 
                              class="read-more-btn text-${safeThemeColor}-600 text-xs sm:text-sm mt-1" 
                              onclick="toggleReadMore(\${index})"
                              aria-expanded="false"
                            >
                              Read More
                            </button>
                          \` : ''}
                          <button 
                            class="like-btn mt-2 sm:mt-3 text-gray-400 hover:text-red-500 \${isLiked ? 'liked' : ''}" 
                            onclick="toggleLike('\${reviewId}', \${index})"
                            aria-label="\${isLiked ? 'Unlike this review' : 'Like this review'}"
                          >
                            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="\${isLiked ? '#ef4444' : 'currentColor'}" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 .81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  \`;
                }).join('')}
              </div>

              \${reviews.length > reviewsPerPage && currentPage * reviewsPerPage < reviews.length ? \`
                <div class="flex justify-center mt-4 sm:mt-6">
                  <button 
                    id="load-more" 
                    class="inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 bg-${safeThemeColor}-600 text-white rounded-lg hover:bg-${safeThemeColor}-700 transition-colors duration-200 text-xs sm:text-sm font-medium"
                    aria-label="Load more reviews"
                  >
                    Load More
                  </button>
                </div>
              \` : ''}
            \` : \`
              <div class="text-center p-4 sm:p-8 bg-gray-50 rounded-lg">
                <div class="text-gray-500 font-medium text-xs sm:text-sm">No reviews available for this business.</div>
                <a 
                  href="https://www.google.com/maps/place/?q=place_id:${safePlaceId}" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="inline-block mt-2 sm:mt-3 text-xs sm:text-sm text-${safeThemeColor}-600 hover:text-${safeThemeColor}-700"
                >
                  Be the first to review
                </a>
              </div>
            \`}
          \` : \`
            <div class="text-center p-4 sm:p-8 bg-gray-50 rounded-lg">
              <div class="text-gray-500 font-medium text-xs sm:text-sm">No place found. Please check the configuration.</div>
            </div>
          \`}
        </div>
      \`;

      // Add event listeners
      const sortSelect = document.getElementById('sort-reviews');
      if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
          sortOption = e.target.value;
          localStorage.setItem('sortOption', sortOption);
          currentPage = 1;
          render();
        });
      }

      const loadMoreBtn = document.getElementById('load-more');
      if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
          if (currentPage * reviewsPerPage < reviews.length) {
            currentPage++;
            render();
            // Smooth scroll to bottom of container
            container.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }
        });
      }

      window.toggleReadMore = function(index) {
        const textEl = document.getElementById(\`review-text-\${index}\`);
        const btn = textEl.nextElementSibling;
        if (!btn || !btn.classList.contains('read-more-btn')) return;

        if (textEl.classList.contains('line-clamp-4')) {
          textEl.classList.remove('line-clamp-4');
          btn.textContent = 'Read Less';
          btn.setAttribute('aria-expanded', 'true');
        } else {
          textEl.classList.add('line-clamp-4');
          btn.textContent = 'Read More';
          btn.setAttribute('aria-expanded', 'false');
        }
      };

      window.toggleLike = function(reviewId, index) {
        const btn = document.querySelector(\`[onclick="toggleLike('\${reviewId}', \${index})"]\`);
        if (!btn) return;

        if (likedReviews[reviewId]) {
          delete likedReviews[reviewId];
          btn.classList.remove('liked');
          btn.setAttribute('aria-label', 'Like this review');
        } else {
          likedReviews[reviewId] = true;
          btn.classList.add('liked');
          btn.setAttribute('aria-label', 'Unlike this review');
        }

        localStorage.setItem('likedReviews', JSON.stringify(likedReviews));
        render();
      };
    }

    async function fetchPlace() {
      isLoading = true;
      error = '';
      render();

      try {
        const res = await fetch(\`\${BACKEND_URL}/api/google/reviews?clientId=${safeClientId}\`);
        if (!res.ok) throw new Error(\`HTTP error: \${res.status}\`);

        const data = await res.json();
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
      } finally {
        isLoading = false;
        render();
      }
    }

    // Initialize the widget
    loadDependencies(() => {
      if ('${safePlaceId}') {
        fetchPlace();
      } else {
        error = 'Please provide a valid place ID in the configuration';
        render();
      }
    });
  }

  // Start the widget
  if (document.readyState === 'complete') {
    initWidget();
  } else {
    window.addEventListener('load', initWidget);
  }
})();
  `;

  logger.info('Generated widget script for clientId:', clientId);
  res.set('Content-Type', 'application/javascript');
  res.send(widgetScript);
}

module.exports = widget;