/**
 * Vercel Serverless Function Entry Point for Smart Waste Management REST API
 * Handles all /api/* routes on Vercel
 */

const handleRequest = require('../server.js');

module.exports = async (req, res) => {
  // Ensure the rewritten URL preserves /api prefix
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  try {
    if (typeof handleRequest === 'function') {
      await handleRequest(req, res);
    } else if (handleRequest && typeof handleRequest.emit === 'function') {
      handleRequest.emit('request', req, res);
    } else if (handleRequest && handleRequest.server && typeof handleRequest.server.emit === 'function') {
      handleRequest.server.emit('request', req, res);
    }
  } catch (err) {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Serverless Function Error', message: err.message }));
    }
  }
};
