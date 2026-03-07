const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const zlib = require('zlib');

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/gamehub', express.static('public'));

app.use('/flagle', createProxyMiddleware({
  target: 'https://www.flaggle.net',
  changeOrigin: true,
  selfHandleResponse: false,
  onProxyRes: (proxyRes) => {
    delete proxyRes.headers['x-frame-options'];
    delete proxyRes.headers['content-security-policy'];
    proxyRes.headers['access-control-allow-origin'] = '*';
  },
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader('Referer', 'https://www.flaggle.net');
    proxyReq.setHeader('Origin', 'https://www.flaggle.net');
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
