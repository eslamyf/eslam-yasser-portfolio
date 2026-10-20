const app = require('../server/server.js');

module.exports = (req, res) => {
  // Ensure req.url includes the /api prefix for Express routes if rewritten by Vercel
  if (!req.url.startsWith('/api') && !req.url.startsWith('/uploads')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
};
