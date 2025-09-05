const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const fetch = require('node-fetch'); // For fetching data from OpenWeatherMap
const SearchHistory = require('./models/SearchHistory');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes

// GET /api/weather/:city - Fetches weather data and saves search history
app.get('/api/weather/:city', async (req, res) => {
  const { city } = req.params;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      return res.status(data.cod).json({ message: data.message });
    }

    // Save search history
    const newSearch = new SearchHistory({ city: city.toLowerCase() });
    await newSearch.save();

    res.json({
      city: data.name,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      weatherCondition: data.weather[0].main,
      weatherIcon: data.weather[0].icon,
      windSpeed: data.wind.speed,
    });

  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ message: 'Server error fetching weather data' });
  }
});

// GET /api/history - Fetches recent search history
app.get('/api/history', async (req, res) => {
  try {
    const history = await SearchHistory.find().sort({ timestamp: -1 }).limit(10); // Get last 10 searches
    res.json(history);
  } catch (error) {
    console.error('Error fetching search history:', error);
    res.status(500).json({ message: 'Server error fetching search history' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});