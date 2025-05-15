import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaStar, FaWhatsapp, FaCommentDots } from 'react-icons/fa';
// import { WiDaySunny } from 'react-icons/wi';
// import WeatherWidget from './widgets/WeatherWidget';
import WhatsAppWidget from '../components/widgets/WhatsAppWidget';
import GoogleReviewsWidget from '../components/widgets/GoogleReviewsWidget';

function Widget() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const widgets = [
    {
      id: 'google-reviews',
      name: 'Google Reviews',
      icon: <FaCommentDots className="text-3xl text-blue-600" />,
      component: GoogleReviewsWidget,
      description: 'Display Google Reviews for your business',
      badge: 'New',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: <FaWhatsapp className="text-3xl text-green-600" />,
      component: WhatsAppWidget,
      description: 'Configure and use WhatsApp chat widget',
      badge: 'Trusted',
    },
  ];

  const handleCardClick = (widget) => {
    if (widget.id === 'whatsapp') {
      navigate('/whatsapp', {
        state: {
          selectedWidget: {
            id: widget.id,
            name: widget.name,
            description: widget.description,
            phoneNumber: '+919876543210',
            welcomeMessage: 'Hi! How can we help you today?',
            widgetId: 'wa-' + Math.random().toString(36).substr(2, 9),
          },
        },
      });
    } else if (widget.id === 'google-reviews') {
      navigate('/google-reviews', {
        state: {
          selectedWidget: {
            id: widget.id,
            name: widget.name,
            description: widget.description,
          },
        },
      });
    } else {
      navigate(`/dashboard`, {
        state: {
          selectedWidget: {
            id: widget.id,
            name: widget.name,
            description: widget.description,
          },
        },
      });
    }
  };

  const filteredWidgets = widgets.filter((widget) =>
    widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    widget.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-10 dark:bg-gray-900 min-h-screen w-full text-sm">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-8">
        Explore Our Widgets
      </h1>

      <div className="mb-8 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search widgets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWidgets.length > 0 ? (
          filteredWidgets.map((widget) => (
            <div
              key={widget.id}
              onClick={() => handleCardClick(widget)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm cursor-pointer"
            >
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-t-2xl px-4 py-3 flex justify-between items-center">
                <span className="text-white font-semibold">{widget.name}</span>
                {widget.icon}
              </div>
              <div className="p-4">
                <span className="inline-block mb-2 text-xs bg-yellow-400 text-black font-semibold px-2 py-1 rounded-full">
                  {widget.badge}
                </span>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                  {widget.description}
                </p>
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-xs" />
                  ))}
                  <span className="ml-1 text-xs text-gray-500">(5.0)</span>
                </div>
                <button
                  className="w-full text-xs py-2 bg-yellow-400 text-black font-medium rounded-lg"
                  aria-label={`Open ${widget.name}`}
                >
                  Open {widget.name}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 col-span-full">
            No widgets found.
          </p>
        )}
      </div>
    </div>
  );
}

export default Widget;