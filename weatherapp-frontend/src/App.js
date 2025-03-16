import React, { useState, useEffect } from 'react';
import './App.css';


const backgrounds = {
  clear: "url('https://images.unsplash.com/photo-1527683662655-2f752c3d9002?q=80&w=1920')",
  clouds: "url('https://images.unsplash.com/photo-1594156596782-656c93e4d504?q=80&w=1920')",
  rain: "url('https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=1920')",
  snow: "url('https://images.unsplash.com/photo-1516431883659-655d43070a54?q=80&w=1920')",
  thunderstorm: "url('https://images.unsplash.com/photo-1551234250-d98ae5f26b49?q=80&w=1920')",
  mist: "url('https://images.unsplash.com/photo-1603799816218-3fb9f4e12c39?q=80&w=1920')",
  default: "url('https://images.unsplash.com/photo-1530908295418-a12e326966ba?q=80&w=1920')"
};

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [background, setBackground] = useState(backgrounds.default);

  useEffect(() => {
    if (weather && weather.weather && weather.weather[0]) {
      const condition = weather.weather[0].main.toLowerCase();
      
      if (condition.includes('clear')) {
        setBackground(backgrounds.clear);
      } else if (condition.includes('cloud')) {
        setBackground(backgrounds.clouds);
      } else if (condition.includes('rain') || condition.includes('drizzle')) {
        setBackground(backgrounds.rain);
      } else if (condition.includes('snow')) {
        setBackground(backgrounds.snow);
      } else if (condition.includes('thunder')) {
        setBackground(backgrounds.thunderstorm);
      } else if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze')) {
        setBackground(backgrounds.mist);
      } else {
        setBackground(backgrounds.default);
      }
    }
  }, [weather]);


  const processForecastData = (forecastData) => {
    if (!forecastData || !forecastData.list) {
      return [];
    }

    const dailyData = {};
    
    
    forecastData.list.forEach(item => {
      
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          high: item.main.temp_max,
          low: item.main.temp_min,
          description: item.weather[0].main,
          icon: item.weather[0].icon
        };
      } else {
        
        if (item.main.temp_max > dailyData[date].high) {
          dailyData[date].high = item.main.temp_max;
        }
        if (item.main.temp_min < dailyData[date].low) {
          dailyData[date].low = item.main.temp_min;
        }
      }
    });
    
    
    return Object.values(dailyData).slice(0, 5);
  };

  const fetchWeatherData = async (e) => {
    e.preventDefault();
    
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      
      const weatherResponse = await fetch(`http://localhost:8080/api/weather/${city}`);
      const weatherData = await weatherResponse.json();
      
      if (!weatherResponse.ok) {
        setError(weatherData.error || 'Failed to fetch weather data');
        setWeather(null);
        setForecast(null);
        setLoading(false);
        return;
      }
      
      setWeather(weatherData);
      
      
      const forecastResponse = await fetch(`http://localhost:8080/api/weather/forecast/${city}`);
      const forecastData = await forecastResponse.json();
      
      if (forecastResponse.ok) {
        setForecast(processForecastData(forecastData));
      } else {
        setError('Current weather available, but forecast data could not be loaded');
        setForecast(null);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="app" style={{ backgroundImage: background }}>
      <div className="container">
        <h1>Weather App</h1>
        
        <form onSubmit={fetchWeatherData}>
          <div className="search-box">
            <input
              type="text"
              placeholder="Enter city name..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
        
        {error && <div className="error-message">{error}</div>}
        
        {weather && (
          <div className="weather-info">
            <div className="city-name">
              <h2>{weather.name}, {weather.sys.country}</h2>
            </div>
            
            <div className="weather-main">
              <img 
                src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
                alt={weather.weather[0].description}
              />
              <div className="temperature">
                <h1>{Math.round(weather.main.temp)}°C</h1>
                <p>{weather.weather[0].main}</p>
                <p className="description">{weather.weather[0].description}</p>
              </div>
            </div>
            
            <div className="weather-details">
              <div className="detail">
                <p>Feels Like</p>
                <p className="value">{Math.round(weather.main.feels_like)}°C</p>
              </div>
              <div className="detail">
                <p>Humidity</p>
                <p className="value">{weather.main.humidity}%</p>
              </div>
              <div className="detail">
                <p>Wind</p>
                <p className="value">{Math.round(weather.wind.speed * 3.6)} km/h</p>
              </div>
            </div>
          </div>
        )}
        
        {forecast && forecast.length > 0 && (
          <div className="forecast">
            <h3>5-Day Forecast</h3>
            <div className="forecast-container">
              {forecast.map((day, index) => (
                <div key={index} className="forecast-day">
                  <p className="forecast-date">{formatDate(day.date)}</p>
                  <img 
                    src={`http://openweathermap.org/img/wn/${day.icon}.png`} 
                    alt={day.description}
                    className="forecast-icon"
                  />
                  <p className="forecast-desc">{day.description}</p>
                  <div className="forecast-temp">
                    <span className="high">{Math.round(day.high)}°</span>
                    <span className="low">{Math.round(day.low)}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;