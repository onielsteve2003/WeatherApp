const express = require('express');
const requestIp = require('request-ip');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(requestIp.mw());

app.get('/api/hello', async (req, res) => {
  const visitorName = req.query.visitor_name || 'Guest';
  const clientIp = req.clientIp;

  try {
    // Get location based on IP address using IPStack API
    const geoResponse = await axios.get(`http://api.ipstack.com/${clientIp}?access_key=${process.env.GEO_API_KEY}`);
    const locationData = geoResponse.data;

    if (!locationData.city) {
      throw new Error('Unable to determine location coordinates');
    }

    const city = locationData.city;

    // Get weather information using WeatherAPI
    const weatherResponse = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`);
    const weatherData = weatherResponse.data;
    const temperature = weatherData.current.temp_c;

    // Prepare response object
    const responseObject = {
      client_ip: clientIp,
      location: city,
      greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}`
    };

    res.status(200).json(responseObject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
