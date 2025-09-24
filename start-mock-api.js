#!/usr/bin/env node

// Simple Mock API Server for Grub Frontend Development
const http = require('http');
const url = require('url');

const PORT = 8520;

// Mock data
const mockResponses = {
  '/health': {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(Math.random() * 86400),
      version: '1.0.0-mock'
    },
    message: 'Health check successful'
  },
  '/health/detailed': {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(Math.random() * 86400),
      version: '1.0.0-mock',
      services: {
        database: 'healthy',
        external: 'healthy',
        memory: 'healthy'
      }
    },
    message: 'Detailed health check successful'
  }
};

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Device-ID, X-Correlation-ID');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  console.log(`${new Date().toISOString()} - ${req.method} ${path}`);

  // Set content type
  res.setHeader('Content-Type', 'application/json');

  // Handle health endpoints
  if (mockResponses[path]) {
    res.writeHead(200);
    res.end(JSON.stringify(mockResponses[path]));
    return;
  }

  // Handle auth endpoints
  if (path === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          data: {
            token: 'mock-jwt-token-' + Date.now(),
            user: {
              id: '1',
              email: data.email,
              name: 'Mock User',
              role: 'distributor'
            }
          },
          message: 'Login successful'
        }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid JSON'
        }));
      }
    });
    return;
  }

  // Handle other API endpoints with generic success response
  if (path.startsWith('/api/')) {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: [],
      message: 'Mock API response'
    }));
    return;
  }

  // 404 for unknown routes
  res.writeHead(404);
  res.end(JSON.stringify({
    success: false,
    message: 'Route not found'
  }));
});

server.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Press Ctrl+C to stop`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please stop the existing server or use a different port.`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});
