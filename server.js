const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Alle MCdle Pfade abfangen (/, /crafting_bee, /blocks, /mobs, usw.)
app.use(['/', '/mcdle', '/crafting_bee', '/blocks', '/mobs', '/items'], createProxyMiddleware({
  target: 'https://www.mcdle.net',
  changeOrigin: true,
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
