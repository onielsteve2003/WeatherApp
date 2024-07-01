// functions/hello.js

exports.handler = async (event, context) => {
    const { visitor_name } = event.queryStringParameters || { visitor_name: 'Guest' };
  
    return {
      statusCode: 200,
      body: JSON.stringify({
        client_ip: event.headers['client-ip'] || 'Unknown IP',
        location: event.headers['cf-ipcountry'] || 'Unknown Location',
        greeting: `Hello, ${visitor_name}! This is a serverless function on Netlify.`
      })
    };
  };
  