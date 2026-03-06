const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/gamehub', express.static('public'));
app.use('/flagle', createProxyMiddleware({
  target: 'https://flagleunlimited.fun',
  changeOrigin: true,
  pathRewrite: { '^/flagle': '' },
  selfHandleResponse: false,
  on: {
    proxyRes: (proxyRes) => {
      delete proxyRes.headers['x-frame-options'];
      delete proxyRes.headers['content-security-policy'];
      proxyRes.headers['access-control-allow-origin'] = '*';
    }
  }
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
