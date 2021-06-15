const { createProxyMiddleware } = require('http-proxy-middleware');


let env = process.env.NODE_ENV === "development" ? 'http://localhost:8000' : 'https://mindlessprogression-backend.herokuapp.com';

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: env,
      changeOrigin: true,
    })
  );
};