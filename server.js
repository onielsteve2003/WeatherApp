const express = require('express');
const requestIp = require('request-ip');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/hello', async (req, res) => {
  const visitorName = req.query.visitor_name;
  const clientIp = requestIp.getClientIp(req);

  try {
    if (clientIp === '::1' || clientIp === '127.0.0.1') {
      // Handle localhost IP case
      throw new Error('Cannot determine location for localhost IP');
    }

    // Get location based on IP address using ip-api.com
    const geoResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
    const locationData = geoResponse.data;

    if (locationData.status === 'fail' && locationData.message === 'reserved range') {
      throw new Error('IP address is in reserved range');
    }

    const city = locationData.city || 'Unknown Location';
    const lat = locationData.lat;
    const lon = locationData.lon;

    if (!lat || !lon) {
      throw new Error('Unable to determine location coordinates');
    }

    // Get weather information from Weatherbit
    const weatherResponse = await axios.get(`https://api.weatherbit.io/v2.0/current`, {
      params: {
        lat: lat,
        lon: lon,
        key: process.env.WEATHERBIT_API_KEY,
        units: 'M' // Metric units
      }
    });
    const weatherData = weatherResponse.data.data[0];
    const temperature = weatherData.temp;

    res.json({
      client_ip: clientIp,
      location: city,
      greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}`
    });
  } catch (error) {
    console.error('Error occurred:', error.message);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
