"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [error, setError] = useState('');
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Function to fetch weather data
  const fetchWeather = async (cityName) => {
    if (!cityName) return;
    setError('');
    setWeatherData(null); // Clear previous weather data

    try {
      const response = await fetch(`${backendUrl}/api/weather/${cityName}`);
      const data = await response.json();

      if (response.ok) {
        setWeatherData(data);
        fetchSearchHistory(); // Refresh history after a new search
      } else {
        setError(data.message || 'City not found or API error.');
      }
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Failed to fetch weather data. Please try again.');
    }
  };

  // Function to fetch search history
  const fetchSearchHistory = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/history`);
      const data = await response.json();
      if (response.ok) {
        setSearchHistory(data);
      } else {
        console.error('Failed to fetch search history:', data.message);
      }
    } catch (err) {
      console.error('Error fetching search history:', err);
    }
  };

  // Initial fetch of search history on component mount
  useEffect(() => {
    fetchSearchHistory();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeather(city);
    setCity(''); // Clear search input
  };

  const handleHistoryClick = (historyCity) => {
    setCity(historyCity);
    fetchWeather(historyCity);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg flex flex-col items-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Weather App</h1>

        <form onSubmit={handleSubmit} className="w-full mb-8 flex space-x-2">
          <input
            type="text"
            className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button
            type="submit"
            className="p-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </form>

        {error && (
          <p className="text-red-500 mb-4 text-center">{error}</p>
        )}

        {weatherData && (
          <div className="w-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg mb-8 text-center">
            <h2 className="text-4xl font-bold mb-2">{weatherData.city}</h2>
            <div className="flex items-center justify-center mb-4">
              <Image
                src={`http://openweathermap.org/img/wn/${weatherData.weatherIcon}@2x.png`}
                alt={weatherData.weatherCondition}
                width={80}
                height={80}
              />
              <p className="text-6xl font-semibold ml-2">{Math.round(weatherData.temperature)}°C</p>
            </div>
            <p className="text-xl capitalize mb-2">{weatherData.weatherCondition}</p>
            <div className="flex justify-around text-lg">
              <p>Humidity: {weatherData.humidity}%</p>
              <p>Wind: {weatherData.windSpeed} m/s</p>
            </div>
          </div>
        )}

        {searchHistory.length > 0 && (
          <div className="w-full">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Recent Searches</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchHistory.map((item) => (
                <button
                  key={item._id}
                  onClick={() => handleHistoryClick(item.city)}
                  className="bg-gray-200 hover:bg-gray-300 p-3 rounded-lg text-left shadow-sm transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <p className="font-medium text-gray-800 capitalize">{item.city}</p>
                  <p className="text-sm text-gray-600">{formatTimestamp(item.timestamp)}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
