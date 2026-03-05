const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (GameHub)
app.use(express.static('public'));

// Reverse Proxy for MCdle
app.use('/mcdle', createProxyMiddleware({
  target: 'https://www.mcdle.net',
  changeOrigin: true,
  pathRewrite: { '^/mcdle': '' },
  on: {
    proxyRes: (proxyRes) => {
      delete proxyRes.headers['x-frame-options'];
      delete proxyRes.headers['content-security-policy'];
      proxyRes.headers['access-control-allow-origin'] = '*';
    }
  }
}));

app.listen(PORT, () => {
  console.log('Server läuft auf Port ' + PORT);
});
