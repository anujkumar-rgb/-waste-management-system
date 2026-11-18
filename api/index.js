/**
 * Vercel Serverless Function Entry Point for Smart Waste Management REST API
 * Handles all /api/* routes on Vercel
 */

const server = require('../server.js');

module.exports = (req, res) => {
  // Ensure the rewritten URL preserves /api prefix
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  // Forward request to the unified REST server handler
  server.emit('request', req, res);
};
