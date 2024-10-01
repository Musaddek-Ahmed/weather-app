'use client';

import { useEffect, useState } from 'react';
import { WiDaySunny, WiRain, WiCloud, WiWindy } from 'react-icons/wi'; // Import weather icons

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;  // Add humidity
  };
  weather: {
    main: string;
    description: string;
  }[];
  name: string;
}

interface ForecastData {
  dt_txt: string;
  main: {
    temp: number;
  };
  weather: {
    main: string;
  }[];
}

const Weather = () => {
  const [city, setCity] = useState<string>('');  // Store the city name
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]); // Store 5-day forecast
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get user location weather
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
      });
    }
  }, []);

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
      );
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError('Failed to fetch weather data for your location.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    setError(null);
    setWeather(null);
    setForecast([]);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
      );
      if (!response.ok) {
        throw new Error('City not found');
      }
      const data = await response.json();
      setWeather(data);
      fetchForecast(cityName);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async (cityName: string) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
      );
      const data = await response.json();
      setForecast(data.list.filter((item: ForecastData, index: number) => index % 8 === 0)); // Filter to get 5 days' forecast
    } catch (err) {
      setError('Failed to fetch forecast data.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
    } else {
      setError('Please enter a valid city name');
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <WiDaySunny size={80} />;
      case 'rain':
        return <WiRain size={80} />;
      case 'clouds':
        return <WiCloud size={80} />;
      case 'wind':
        return <WiWindy size={80} />;
      default:
        return <WiDaySunny size={80} />;
    }
  };

  const getBackgroundImage = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return '/images/clear.jpg';
      case 'rain':
        return '/images/rainy.jpg';
      case 'clouds':
        return '/images/cloudy.jpg';
      case 'wind':
        return '/images/windy.jpg';
      default:
        return '/images/clear.jpg';
    }
  };

  return (
    <div className="flex flex-row justify-between px-8 min-h-screen">
      {/* Left Panel: Search Section */}
      <div className="w-[30%] h-[30%] p-6 shadow-xl rounded-lg transform hover:scale-105 transition duration-300 ease-in-out">
        <h2 className="text-2xl font-semibold text-gray-300 mb-4 text-center">Search City</h2>
        <form onSubmit={handleSearch} className="mb-6 relative">
  <input
    type="text"
    value={city}
    onChange={(e) => setCity(e.target.value)}
    placeholder="Enter city name"
    className="p-3 rounded-lg bg-gray-100 w-full focus:ring-4 focus:ring-blue-300 text-gray-700 placeholder-gray-400 shadow-inner pr-12" // Added padding to the right to avoid overlap with the icon
  />
  <button
    type="submit"
    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-blue-600 focus:outline-none"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  </button>
</form>

        {loading && <p className="text-center text-blue-500 font-semibold">Loading...</p>}
        {error && <p className="text-center text-red-500 font-semibold">{error}</p>}
      </div>

      {/* Right Panel: Weather Information */}
      <div className="w-[60%] h-[90%] p-8 flex flex-col items-center justify-center text-white rounded-lg shadow-lg"
           style={{
             backgroundImage: weather
               ? `url(${getBackgroundImage(weather.weather[0].main)})`
               : 'none',
             backgroundSize: 'cover',
             backgroundPosition: 'center',
           }}>
        {weather && (
          <>
            <div className="flex flex-col items-center justify-center">
              <div className="animate-pulse">{getWeatherIcon(weather.weather[0].main)}</div>
              <h1 className="text-4xl font-bold mt-3 drop-shadow-lg">{weather.name}</h1>
              <p className="text-2xl mt-2 font-light tracking-wider">
                {weather.main.temp}°C
                <span className="text-lg font-normal"> (Feels like {weather.main.feels_like}°C)</span>
              </p>
              <h2 className="text-lg font-semibold mb-2">Humidity {weather.main.humidity}%</h2>
              
              <p className="text-lg capitalize mt-1 opacity-80">{weather.weather[0].description}</p>
            </div>



            {/* 5-Day Forecast */}
            {forecast.length > 0 && (
              <div className="mt-8 w-full">
                <h2 className="text-3xl mb-6 text-center font-semibold drop-shadow-md">5-Day Forecast</h2>
                <div className="grid grid-cols-5 gap-4">
                  {forecast.map((day, index) => (
                    <div key={index} className="text-center bg-white bg-opacity-90 text-gray-800 p-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl">
                      <p className="font-semibold text-xl mb-2">{new Date(day.dt_txt).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                      {getWeatherIcon(day.weather[0].main)}
                      <p className="text-lg font-semibold mt-2">{day.main.temp}°C</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Weather;
