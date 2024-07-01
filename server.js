const express = require('express')
const axios = require('axios')
const dotenv = require('dotenv')
const ipValidator = require('ip')

// const axios = require('axios')

const app = express()
dotenv.config()
app.set('trust procy', true)

app.use((req, res, next) => {
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

  // If x-forwarded-for contains multiple IPs, take the first one
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim()
  }

  // Check for IPv6-mapped IPv4 address
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '')
  }

  // Validate the IP address
  if (!ipValidator.isV4Format(ip) && !ipValidator.isV6Format(ip)) {
    return res.status(400).json({ error: 'Invalid IP address' })
  }

  console.log('Client IP:', ip)
  req.clientIp = ip
  next()
})

app.get('/', async (req, res) => {
  res.json({msg: "Hello there"})
})

app.get('/api/hello', async (req, res) => {
  const visitorName = req.query.visitor_name
  const ip = req.clientIp

  const accessKey = process.env.ACCESS_KEY
  const weatherApiKey = process.env.WEATHER_API_KEY

  const url = 'https://apiip.net/api/check?ip=' + ip + '&accessKey=' + accessKey

  try {
    // Make a request and store the response
    const response = await axios.get(url)
    const result = response.data

    const country = result.countryName
    const city = result.city
    const long = result.longitude
    const lat = result.latitude

    const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${long}&appid=${weatherApiKey}&units=metric`
    const weatherResponse = await axios.get(weatherUrl)
    const waetherResult = weatherResponse.data.current.temp

    console.log(result)

    const jsonResponse = {
      "client_ip": ip,
      "location": city,
      "greeting": `Hello, ${visitorName}!, the temperature is ${waetherResult} degrees Celcius in ${city}`,
    }

    // Return the JSON response
    res.json(jsonResponse)
  } catch (error) {
    console.error(error)
    res.status(500).send('An error occurred')
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})