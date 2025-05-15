import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import WeatherWidget from '../components/widgets/WeatherWidget';
// import NewsWidget from '../components/widgets/NewsWidget';
// import TodoWidget from '../components/widgets/TodoWidget';
import WhatsAppWidget from '../components/widgets/WhatsAppWidget';

function Dashboard() {
  const location = useLocation();
  const selectedWidget = location.state?.selectedWidget || null;
  const [widgetId, setWidgetId] = useState('');

  // Map widget ID to component
  const widgetComponents = {
    weather: WeatherWidget,

    whatsapp: WhatsAppWidget,
  };

  // Generate widget ID for WhatsApp widget
  useEffect(() => {
    if (selectedWidget?.id === 'whatsapp') {
      const newId = 'wa-' + Math.random().toString(36).substr(2, 9);
      setWidgetId(newId);
    }
  }, [selectedWidget]);

  if (!selectedWidget) {
    return null; // Hide everything if no widget is selected
  }

  const Component = widgetComponents[selectedWidget.id];

  return (
    <div className="min-h-screen w-full bg-white text-white flex justify-center items-center px-4 py-10">
      <div className="w-full max-w-4xl bg-gray-900 p-6 rounded-lg">
        <Component
          {...(selectedWidget.id === 'whatsapp'
            ? {
                widgetId,
                phoneNumber: '+919876543210',
                welcomeMessage: 'Hi! How can we help you today?',
              }
            : {})}
        />
      </div>
    </div>
  );
}

export default Dashboard;
