const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const zlib = require('zlib');

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/gamehub', express.static('public'));

app.use('/flagle', createProxyMiddleware({
  target: 'https://www.flagle-game.com',
  changeOrigin: true,
  pathRewrite: { '^/flagle': '' },
  selfHandleResponse: false,
  autoRewrite: true,
  cookieDomainRewrite: '',
  on: {
    proxyRes: (proxyRes) => {
      delete proxyRes.headers['x-frame-options'];
      delete proxyRes.headers['content-security-policy'];
      proxyRes.headers['access-control-allow-origin'] = '*';

      if (proxyRes.headers['location']) {
        proxyRes.headers['location'] = proxyRes.headers['location']
          .replace('https://www.flagle-game.com', '')
          .replace('http://www.flagle-game.com', '');
      }
    }
  }
}));

app.use('/', createProxyMiddleware({
  target: 'https://www.mcdle.net',
  changeOrigin: true,
  selfHandleResponse: false,
  onProxyRes: (proxyRes) => {
    delete proxyRes.headers['x-frame-options'];
    delete proxyRes.headers['content-security-policy'];
    proxyRes.headers['access-control-allow-origin'] = '*';
  }
}));

app.listen(PORT, () => {
  console.log('Server läuft auf Port ' + PORT);
});
