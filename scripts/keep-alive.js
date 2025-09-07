// This script helps prevent cold starts by keeping the application warm
const https = require('https');
const http = require('http');

// Configuration
const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'https://your-app-url.vercel.app';
const PING_INTERVAL = process.env.PING_INTERVAL || 5 * 60 * 1000; // 5 minutes by default

const pingService = () => {
  console.log(`Pinging ${DEPLOYMENT_URL} at ${new Date().toISOString()}`);
  
  // Choose protocol based on URL
  const requester = DEPLOYMENT_URL.startsWith('https') ? https : http;
  
  const req = requester.get(DEPLOYMENT_URL, (res) => {
    const { statusCode } = res;
    console.log(`Received status code: ${statusCode}`);
    
    // Consume response data to free up memory
    res.resume();
  });
  
  req.on('error', (e) => {
    console.error(`Error pinging service: ${e.message}`);
  });
  
  req.end();
};

// Initial ping
pingService();

// Set up interval for regular pings
setInterval(pingService, PING_INTERVAL);

console.log(`Keep-alive service started. Pinging ${DEPLOYMENT_URL} every ${PING_INTERVAL/1000} seconds.`);