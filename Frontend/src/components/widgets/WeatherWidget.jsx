// src/components/widgets/WeatherWidget.jsx
function WeatherWidget() {
  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded border border-blue-200 dark:border-blue-700">
      <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">Weather</h3>
      <p className="text-base text-blue-700 dark:text-blue-300">Sunny, 25°C</p>
      <p className="text-base text-blue-700 dark:text-blue-300">Location: New York</p>
    </div>
  );
}
export default WeatherWidget;
