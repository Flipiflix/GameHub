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
  selfHandleResponse: true,
  on: {
    proxyRes: (proxyRes, req, res) => {
      delete proxyRes.headers['x-frame-options'];
      delete proxyRes.headers['content-security-policy'];
      proxyRes.headers['access-control-allow-origin'] = '*';

      if (proxyRes.headers['location']) {
        proxyRes.headers['location'] = proxyRes.headers['location']
          .replace('https://www.flagle-game.com', '/flagle');
      }

      const contentType = proxyRes.headers['content-type'] || '';
      const encoding = proxyRes.headers['content-encoding'];

      if (!contentType.includes('text/html')) {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
        return;
      }

      let chunks = [];
      proxyRes.on('data', chunk => chunks.push(chunk));
      proxyRes.on('end', () => {
        const buf = Buffer.concat(chunks);
        const decode = (data) => {
          let html = data.toString('utf8');
          html = html.replace(/<div[^>]*cookie[^>]*>[\s\S]*?<\/div>/gi, '');
          html = html.replace(/<div[^>]*consent[^>]*>[\s\S]*?<\/div>/gi, '');
          html = html.replace(/<script[^>]*>[\s\S]*?(cookie|consent|gdpr)[\s\S]*?<\/script>/gi, '');
          delete proxyRes.headers['content-encoding'];
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          res.end(html);
        };
        if (encoding === 'gzip') {
          zlib.gunzip(buf, (err, d) => decode(err ? buf : d));
        } else if (encoding === 'br') {
          zlib.brotliDecompress(buf, (err, d) => decode(err ? buf : d));
        } else {
          decode(buf);
        }
      });
    }
  }
}));
```

Nach dem Commit sollten die Logs zeigen:
```
[HPM] Proxy created: /flagle -> https://www.flagle-game.com

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
