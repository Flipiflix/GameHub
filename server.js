const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/gamehub', express.static('public'));

app.use('/flagle', createProxyMiddleware({
  target: 'https://flagle-game.com',
  changeOrigin: true,
  pathRewrite: { '^/flagle': '' },
  on: { proxyRes: (proxyRes) => { delete proxyRes.headers['x-frame-options']; delete proxyRes.headers['content-security-policy']; }}
}));

app.use('/', createProxyMiddleware({
  target: 'https://www.mcdle.net',
  changeOrigin: true,
  selfHandleResponse: false,
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
