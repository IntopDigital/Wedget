
import React, { memo, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

// ConfigForm Component
const ConfigForm = memo(({ config, setConfig, handleSubmit, handleSuggestionSelect, isLoading, error, onRetry, activeTab, setActiveTab, clientId, backendUrl }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [inputValue, setInputValue] = useState(config.placeName);

  const debounce = useCallback((func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }, []);

  const fetchSuggestions = useCallback(async (input) => {
    if (!input || input.length < 2 || /[^a-zA-Z0-9\s]/.test(input)) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await axios.get(`${backendUrl}/api/google/autocomplete`, {
        params: { input },
        timeout: 5000,
      });
      setSuggestions(res.data || []);
      setShowSuggestions(true);
    } catch (err) {
      setSuggestions([]);
      setShowSuggestions(false);
      setConfig((prev) => ({
        ...prev,
        error: err.response?.data?.error || 'Failed to fetch autocomplete suggestions',
      }));
    }
  }, [backendUrl, setConfig]);

  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 500), [debounce, fetchSuggestions]);

  const handleInputChange = (e) => {
    const value = e.target.value.trim();
    setInputValue(value);
    if (value) {
      debouncedFetchSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleBlur = () => {
    setShowSuggestions(false);
    setConfig((prev) => ({ ...prev, placeName: inputValue }));
  };

  const handleSuggestionClick = useCallback(
    (suggestion) => {
      setInputValue(suggestion.description);
      handleSuggestionSelect(suggestion);
      setShowSuggestions(false);
    },
    [handleSuggestionSelect]
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (autoSave && name !== 'placeName') {
      handleSubmit(new Event('submit'));
    }
  };

  const resetForm = () => {
    setConfig({
      placeName: '',
      placeId: '',
      enableSearch: false,
      themeColor: 'teal',
      widgetSize: 'medium',
      error: '',
    });
    setInputValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    setAutoSave(false);
    setActiveTab('settings');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.suggestions-container')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-gray-900/80 rounded-lg p-4 shadow-md text-white">
      <div className="flex border-b border-white/20 mb-4">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-1 text-sm font-medium rounded-t-md transition ${
            activeTab === 'settings' ? 'bg-yellow-400 text-black' : 'text-white/50 hover:text-cyan-400'
          }`}
        >
          Settings
        </button>
        {clientId && (
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-1 text-sm font-medium rounded-t-md transition ${
              activeTab === 'code' ? 'bg-cyan-400 text-white' : 'text-white/50 hover:text-cyan-400'
            }`}
          >
            Embed Code
          </button>
        )}
      </div>

      {activeTab === 'settings' ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative suggestions-container">
            <label htmlFor="placeName" className="block mb-1 text-xs font-medium text-white">
              Business Name
            </label>
            <input
              type="text"
              id="placeName"
              name="placeName"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="w-full p-2 bg-gray-900/50 text-white border border-white/30 rounded-md focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 text-sm"
              placeholder="e.g., Starbucks Times Square"
              autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-20 w-full mt-2 bg-gray-900/80 border border-white/20 rounded-md shadow-lg max-h-64 overflow-y-auto text-sm">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.place_id}
                    className="p-2 hover:bg-gray-800 cursor-pointer border-b border-white/10 last:border-0"
                    onMouseDown={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.description}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label htmlFor="placeId" className="block mb-1 text-xs font-medium text-white">
              Google Place ID (Optional)
            </label>
            <input
              type="text"
              id="placeId"
              name="placeId"
              value={config.placeId}
              onChange={handleChange}
              className="w-full p-2 bg-gray-900/50 text-white border border-white/30 rounded-md focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 text-sm"
              placeholder="e.g., ChIJ8eM4y9gXwokR8c8a3Q8XwBA"
            />
            <div className="text-[10px] text-white/50 mt-1">
              Find Place ID at{' '}
              <a
                href="https://developers.google.com/places/place-id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                Google Place ID Finder
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label htmlFor="enableSearch" className="flex items-center text-xs font-medium text-white">
              <input
                type="checkbox"
                id="enableSearch"
                name="enableSearch"
                checked={config.enableSearch}
                onChange={handleChange}
                className="mr-2 h-4 w-4 text-cyan-400 border-white/30 rounded focus:ring-cyan-400"
              />
              Enable Search Bar
            </label>
            <label htmlFor="autoSave" className="flex items-center text-xs font-medium text-white">
              <input
                type="checkbox"
                id="autoSave"
                name="autoSave"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="mr-2 h-4 w-4 text-cyan-400 border-white/30 rounded focus:ring-cyan-400"
              />
              Auto Save
            </label>
          </div>
          <div>
            <label htmlFor="themeColor" className="block mb-1 text-xs font-medium text-white">
              Theme Color
            </label>
            <select
              id="themeColor"
              name="themeColor"
              value={config.themeColor}
              onChange={handleChange}
              className="w-full p-2 bg-gray-900/50 text-white border border-white/30 rounded-md focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 text-sm"
            >
              <option value="teal">Teal</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
            </select>
          </div>
          <div>
            <label htmlFor="widgetSize" className="block mb-1 text-xs font-medium text-white">
              Widget Size
            </label>
            <select
              id="widgetSize"
              name="widgetSize"
              value={config.widgetSize}
              onChange={handleChange}
              className="w-full p-2 bg-gray-900/50 text-white border border-white/30 rounded-md focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 text-sm"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          {(error || config.error) && (
            <div className="p-2 bg-orange-400/20 text-orange-400 rounded-md text-center border border-orange-400/50 text-xs">
              {error || config.error}
              <button
                onClick={onRetry}
                className="ml-2 underline text-orange-400 hover:text-orange-500"
              >
                Retry
              </button>
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 p-2 bg-yellow-400 text-black rounded-md font-medium hover:bg-orange-400 hover:text-white transition text-sm disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Generate Widget'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 p-2 bg-gray-900/50 text-white border border-white/30 rounded-md font-medium hover:bg-gray-900/70 transition text-sm"
            >
              Reset Form
            </button>
          </div>
        </form>
      ) : (
        <div>
          <h3 className="text-base text-white mb-3">Your Embed Code</h3>
          <p className="text-xs text-white/70 mb-4">
            Copy and paste this code into your website's HTML.
          </p>
          <div className="relative bg-gray-900/50 rounded-md p-3 border border-white/20">
            <textarea
              value={`
<div id="google-reviews" data-client-id="${clientId}" data-backend-url="${backendUrl}"></div>
<script src="${backendUrl}/api/google/widget/${clientId}.js" async></script>
              `.trim()}
              readOnly
              className="w-full h-24 p-2 bg-gray-900/30 text-white border border-white/30 rounded-md font-mono text-xs resize-none"
            />
            <button
              onClick={() => navigator.clipboard.writeText(`
<div id="google-reviews" data-client-id="${clientId}" data-backend-url="${backendUrl}"></div>
<script src="${backendUrl}/api/google/widget/${clientId}.js" async></script>
              `.trim()).then(() => alert('Code copied to clipboard!'))}
              className="absolute top-2 right-2 px-2 py-1 bg-cyan-400 text-white rounded-md flex items-center gap-1 hover:bg-cyan-400/80 transition text-xs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V13h-1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
              </svg>
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

ConfigForm.displayName = 'ConfigForm';

ConfigForm.propTypes = {
  config: PropTypes.object.isRequired,
  setConfig: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleSuggestionSelect: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onRetry: PropTypes.func.isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  clientId: PropTypes.string,
  backendUrl: PropTypes.string.isRequired,
};

// WidgetPreview Component
const WidgetPreview = memo(({ place, reviews, isLoading, themeColor, widgetSize }) => {
  const BACKEND_URL = 'http://www.dash.intopdigital.com/api/google';

  const sizeStyles = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg',
  };

  const RatingStars = ({ rating }) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-600'}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
        </svg>
      ))}
    </div>
  );

  const ReviewCard = ({ review }) => (
    <div className="p-3 bg-gray-900/50 rounded-md border border-white/20">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm font-medium">
          {review.author_name?.charAt(0) || '?'}
        </div>
        <div className="flex-1">
          <h4 className="text-sm text-white font-medium">{review.author_name || 'Anonymous'}</h4>
          <div className="mt-1">
            <RatingStars rating={review.rating} />
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-white/80 line-clamp-3">{review.text || ''}</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className={`bg-gray-900/80 rounded-lg p-4 ${sizeStyles[widgetSize]}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-800 rounded w-3/4"></div>
          <div className="h-32 bg-gray-800 rounded-md"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-800 rounded w-1/2"></div>
            <div className="h-3 bg-gray-800 rounded w-1/4"></div>
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 bg-gray-800/50 rounded-md space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-800"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-gray-800 rounded w-1/3"></div>
                    <div className="h-2 bg-gray-800 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-2 bg-gray-800 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className={`bg-gray-900/80 rounded-lg p-4 ${sizeStyles[widgetSize]}`}>
        <div className="text-center py-8">
          <p className="text-xs text-white/70">Enter a business name or Place ID to preview the widget.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900/80 rounded-lg p-4 ${sizeStyles[widgetSize]}`}>
      <div className="space-y-4">
        {/* <div className="relative overflow-hidden rounded-md">
          <img
            src={
              place.photos?.[0]?.photo_reference
                ? `${BACKEND_URL}/api/place-photo?photo_reference=${encodeURIComponent(place.photos[0].photo_reference)}&maxwidth=800`
                : 'https://via.placeholder.com/800x400?text=No+Image+Available'
            }
            alt={place.name}
            className="w-full h-32 object-cover"
          />
        </div> */}
        <div>
          <h3 className="text-base text-white font-semibold">{place.name}</h3>
          <div className="flex items-center mt-1 gap-2">
            <RatingStars rating={place.rating || 0} />
            <span className="text-xs text-white/70">{place.rating?.toFixed(1)} ({place.user_ratings_total || 0} reviews)</span>
          </div>
          {place.formatted_address && (
            <p className="mt-2 text-xs text-white/80">{place.formatted_address}</p>
          )}
          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-cyan-400 hover:underline text-xs"
            >
              Visit Website
            </a>
          )}
        </div>
        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.slice(0, 3).map((review) => (
              <ReviewCard key={review.time || review.author_name} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-white/70">No reviews available for this business.</p>
          </div>
        )}
      </div>
    </div>
  );
});

WidgetPreview.displayName = 'WidgetPreview';

WidgetPreview.propTypes = {
  place: PropTypes.object,
  reviews: PropTypes.array,
  isLoading: PropTypes.bool,
  themeColor: PropTypes.string,
  widgetSize: PropTypes.string,
};

WidgetPreview.defaultProps = {
  reviews: [],
  isLoading: false,
  themeColor: 'teal',
  widgetSize: 'medium',
};

// Main GoogleReviewsWidget Component
const GoogleReviewsWidget = () => {
  const BACKEND_URL = 'https://widgetbackend.onrender.com';
  const [config, setConfig] = useState({
    placeName: '',
    placeId: '',
    enableSearch: false,
    themeColor: 'teal',
    widgetSize: 'medium',
    error: '',
  });
  const [clientId, setClientId] = useState('');
  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('settings');

  const generateClientId = useCallback(() => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }, []);

  const fetchPlace = useCallback(async (query) => {
    if (!query) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.get(`${BACKEND_URL}/api/google/search-place`, {
        params: { query },
        timeout: 8000,
      });
      setPlace(res.data.result);
      setReviews(res.data.result.reviews || []);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch place details. Please try again.';
      setError(errorMessage);
      setPlace(null);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveConfig = useCallback(async () => {
    try {
      const id = clientId || generateClientId();
      if (!config.placeId || !config.placeName) {
        throw new Error('Place ID and Place Name are required');
      }
      const response = await axios.post(`${BACKEND_URL}/api/google/generate-client`, {
        placeId: config.placeId,
        placeName: config.placeName,
        themeColor: config.themeColor,
        widgetSize: config.widgetSize,
      });
      setClientId(response.data.clientId);
      return true; // Indicate success
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to save configuration. Please try again.';
      setError(errorMessage);
      setConfig((prev) => ({ ...prev, error: errorMessage }));
      return false; // Indicate failure
    }
  }, [clientId, config, generateClientId]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const success = await saveConfig();
      if (success) {
        setActiveTab('code'); // Redirect to Embed Code tab on success
      }
      const query = config.placeId ? `place_id:${config.placeId}` : config.placeName;
      fetchPlace(query);
    },
    [config, saveConfig, fetchPlace]
  );

  const handleSuggestionSelect = useCallback(
    (suggestion) => {
      setConfig((prev) => ({
        ...prev,
        placeName: suggestion.description,
        placeId: suggestion.place_id,
        error: '',
      }));
      fetchPlace(`place_id:${suggestion.place_id}`);
    },
    [fetchPlace]
  );

  const handleRetry = useCallback(() => {
    setError('');
    setConfig((prev) => ({ ...prev, error: '' }));
    const query = config.placeId ? `place_id:${config.placeId}` : config.placeName;
    fetchPlace(query);
  }, [config, fetchPlace]);

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-900 text-white rounded-lg shadow-xl">
      <header className="text-center mb-6 pb-4 border-b border-white/20">
        <h1 className="text-xl font-semibold text-yellow-400">Google Reviews Widget</h1>
        <p className="mt-1 text-xs text-white/70">Customize your Google Reviews widget</p>
      </header>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <ConfigForm
            config={config}
            setConfig={setConfig}
            handleSubmit={handleSubmit}
            handleSuggestionSelect={handleSuggestionSelect}
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            clientId={clientId}
            backendUrl={BACKEND_URL}
          />
        </div>
        <div className="w-full lg:w-64">
          <WidgetPreview
            place={place}
            reviews={reviews}
            isLoading={isLoading}
            themeColor={config.themeColor}
            widgetSize={config.widgetSize}
          />
          <div className="bg-orange-400/20 rounded-lg p-3 border border-orange-400/50 mt-4">
            <h4 className="text-xs text-orange-400 mb-2">Quick Tips</h4>
            <ul className="list-disc pl-4 text-[10px] text-white/80">
              <li>Test your widget before deploying</li>
              <li>Place code before &lt;/body&gt;</li>
              <li>Ensure Place ID is correct</li>
              <li>Keep Place Name clear</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleReviewsWidget;
