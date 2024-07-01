const express = require('express');
const requestIp = require('request-ip');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/hello', async (req, res) => {
  const visitorName = req.query.visitor_name;
  let clientIp = requestIp.getClientIp(req);

  // Handle local development IPs
  if (clientIp === '::1' || clientIp === '127.0.0.1') {
    clientIp = '8.8.8.8'; // Example IP address for testing
  }

  try {
    // Get location based on IP address using ipstack
    const geoResponse = await axios.get(`http://api.ipstack.com/${clientIp}?access_key=${process.env.GEO_API_KEY}`);
    const locationData = geoResponse.data;

    if (!locationData.city) {
      throw new Error('Unable to determine location coordinates');
    }

    const city = locationData.city;

    // Get weather information using weatherapi
    const weatherResponse = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`);
    const weatherData = weatherResponse.data;
    const temperature = weatherData.current.temp_c;

    res.json({
      client_ip: clientIp,
      location: city,
      greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // Export the Express app for local development
