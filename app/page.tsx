'use client';

import { useEffect, useState } from 'react';
import { WiDaySunny, WiRain, WiCloud, WiWindy, WiSnow } from 'react-icons/wi';
import { FaWind, FaSun, FaCloudSun, FaCloudMoon, FaExclamationTriangle } from 'react-icons/fa';

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: {
    main: string;
    description: string;
  }[];
  wind: {
    speed: number;
    deg: number;
  };
  sys: {
    sunrise: number;
    sunset: number;
  };
  alerts?: {
    event: string;
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

export default function Home() {
  const [city, setCity] = useState<string>('');  
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]); 
  const [loading, setLoading] = useState<boolean>(false);
  const [aqi, setAqi] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  
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
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
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
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`
      );
      if (!response.ok) {
        throw new Error('City not found');
      }
      const data = await response.json();
      setWeather(data);
      fetchForecast(cityName);
      fetchAirQuality(data.coord.lat, data.coord.lon);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAirQuality = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
      );
      const data = await response.json();
      setAqi(data.list[0].main.aqi); // Set AQI
    } catch (err) {
      setError('Failed to fetch air quality data.');
    }
  };

  const fetchForecast = async (cityName: string) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${apiKey}`
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
      case 'snow': 
        return <WiSnow size={80} />;
      default:
        return <WiDaySunny size={80} />;
    }
  };

  const getCompassStyle = (deg: number) => {
    return {
      transform: `rotate(${deg}deg)`,
      transition: 'transform 0.5s ease-in-out',
    };
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
      case 'snow': 
        return '/images/snowy.jpg';
      default:
        return '/images/clear.jpg';
    }
  };

  const getAqiDescription = (aqi: number) => {
    switch (aqi) {
      case 1:
        return 'Good';
      case 2:
        return 'Fair';
      case 3:
        return 'Moderate';
      case 4:
        return 'Poor';
      case 5:
        return 'Very Poor';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex sm:flex-row flex-col justify-between px-8 pt-8 min-h-screen font-mono"
    style={{
      backgroundImage: weather
        ? `url(${getBackgroundImage(weather.weather[0].main)})`
        : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      {/* Left Panel: Search Section */}
      <div className='sm:w-[30%] w-full flex flex-col gap-8'>
      <div   className=" w-full h-[30%] p-6 shadow-xl rounded-lg transform hover:scale-105 transition duration-300 ease-in-out"
  style={{
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)', 
  }}>
        <h2 className="text-2xl font-semibold text-black mb-4 text-center font-sans">Search City</h2>
        <form onSubmit={handleSearch} className="mb-6 relative">
  <input
    type="text"
    value={city}
    onChange={(e) => setCity(e.target.value)}
    placeholder="Enter city name"
    className="p-3 rounded-lg font-sans bg-gray-100 w-full focus:ring-4 focus:ring-gray-300 text-gray-700 placeholder-gray-400 shadow-inner pr-12" 
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

        {loading && <p className="text-center text-white font-semibold">Loading...</p>}
        {error && <p className="text-center text-red-800 font-semibold">{error}</p>}
      </div>

      <div
  className="w-full p-6 shadow-xl rounded-lg transform hover:scale-105 transition duration-300 ease-in-out"
  style={{
    background: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background
    backdropFilter: 'blur(90px)', // Blur effect
  }}
>
  {weather && (
    <div className='text-black'>
    <div className='flex flex-row justify-between'>
<div className='flex flex-col gap-4'>
<p className="text-lg mt-2 font-semibold flex items-center">
        <FaWind className="mr-2 text-blue-700" /> Wind Speed: {weather.wind.speed} m/s
      </p>
      <p className="text-lg mt-1 font-semibold flex items-center">
        <FaCloudSun className="mr-2 text-yellow-500" /> Wind Direction: {weather.wind.deg}°
      </p>
</div>


      <div className="flex justify-end mt-4">
        <div
          className="w-24 h-24 flex items-center justify-center relative"
          style={{ border: '2px solid #000', borderRadius: '50%' }} // Circle compass
        >
          {/* Compass Directions */}
          <div className="absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <span className="absolute" style={{ transform: 'rotate(0deg)', top: '-70px', left: '-5px' }}>N</span>
            <span className="absolute" style={{ transform: 'rotate(90deg)', right: '-65px', top: '-10px' }}>E</span>
            <span className="absolute" style={{ transform: 'rotate(180deg)', bottom: '-70px', left: '-5px' }}>S</span>
            <span className="absolute" style={{ transform: 'rotate(-90deg)', left: '-65px', top: '-10px' }}>W</span>
          </div>
          <div
            className="w-1 h-12 bg-red-600 absolute"
            style={getCompassStyle(weather.wind.deg)}
          />
        </div>
      </div>

      </div>




      {/* Sunrise and Sunset */}
      <p className="text-lg mt-2 flex items-center">
        <FaSun className="mr-2 text-orange-600" /> Sunrise: {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}
      </p>
      <p className="text-lg mt-1 flex items-center">
        <FaCloudMoon className="mr-2 text-purple-700" /> Sunset: {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}
      </p>

      {/* Air Quality Index */}
      {aqi ? (
   <p className="text-lg mt-4 flex items-center">
     <span className="mr-2 text-green-500">🟢</span> Air Quality Index: {aqi} ({getAqiDescription(aqi)})
   </p>
 ) : (
   <p className="text-md text-red-500 mt-4 flex items-center">AQI data is unavailable at the moment.</p>
)}
      {weather.alerts && (
        <div className="mt-4">
          <h3 className="text-xl font-bold text-red-700 flex items-center">
            <FaExclamationTriangle className="mr-2" /> ⚠️ Weather Alerts ⚠️
          </h3>
          {weather.alerts.map((alert, index) => (
            <p key={index} className="text-red-500">
              <span className="font-semibold">{alert.event}:</span> {alert.description}
            </p>
          ))}
        </div>
      )}
    </div>
  )}
</div>

      </div>

      {/* Right Panel: Weather Information */}
      <div className="sm:w-[60%] w-full sm:mt-0 mt-4 h-[90%] p-8 flex flex-col items-center justify-center text-white rounded-lg shadow-lg"
            style={{
              background: 'rgba(255, 255, 255, 0.1)', // Semi-transparent background
              backdropFilter: 'blur(20px)', // Blur effect
            }} >
        {weather && (
          <>
            <div className="flex flex-col items-center text-black justify-center">
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
                <h2 className="text-3xl mb-6 text-center text-black font-semibold drop-shadow-md">5-Day Forecast</h2>
                <div className="grid sm:grid-cols-5 grid-cols-3 gap-4">
                  {forecast.map((day, index) => (
                    <div key={index} className="flex flex-col items-center text-center bg-white bg-opacity-90 text-gray-800 p-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl">
                      <p className="font-semibold sm:text-xl text-sm mb-2">{new Date(day.dt_txt).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                      {getWeatherIcon(day.weather[0].main)}
                      <p className="sm:text-lg text-xs font-semibold mt-2">{day.main.temp}°C</p>
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
