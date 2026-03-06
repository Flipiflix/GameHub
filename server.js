const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const zlib = require('zlib');

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/gamehub', express.static('public'));

// Flagle Proxy mit Cookie-Banner Entfernung
app.use('/flagle', createProxyMiddleware({
  target: 'https://www.flagle-game.com/unlimited',
  changeOrigin: true,
  pathRewrite: { '^/flagle': '' },
  selfHandleResponse: true,
  on: {
    proxyRes: (proxyRes, req, res) => {
      delete proxyRes.headers['x-frame-options'];
      delete proxyRes.headers['content-security-policy'];
      proxyRes.headers['access-control-allow-origin'] = '*';

      const contentType = proxyRes.headers['content-type'] || '';
      const encoding = proxyRes.headers['content-encoding'];

      // Nur HTML Dateien bearbeiten
      if (!contentType.includes('text/html')) {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
        return;
      }

      // Entpacken falls nötig
      let chunks = [];
      proxyRes.on('data', chunk => chunks.push(chunk));
      proxyRes.on('end', () => {
        const buf = Buffer.concat(chunks);
        const decode = (data) => {
          let html = data.toString('utf8');
          // Cookie Banner entfernen
          html = html.replace(/<div[^>]*cookie[^>]*>[\s\S]*?<\/div>/gi, '');
          html = html.replace(/<div[^>]*consent[^>]*>[\s\S]*?<\/div>/gi, '');
          html = html.replace(/<div[^>]*privacy[^>]*>[\s\S]*?<\/div>/gi, '');
          html = html.replace(/window\.__cmp[\s\S]*?;/g, '');
          html = html.replace(/cookieconsent[\s\S]*?;/g, '');
          // Script Tags mit Cookie-Logik entfernen
          html = html.replace(/<script[^>]*>[\s\S]*?(cookie|consent|gdpr)[\s\S]*?<\/script>/gi, '');
          delete proxyRes.headers['content-encoding'];
          proxyRes.headers['content-length'] = Buffer.byteLength(html);
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          res.end(html);
        };

        if (encoding === 'gzip') {
          zlib.gunzip(buf, (err, decoded) => decode(err ? buf : decoded));
        } else if (encoding === 'br') {
          zlib.brotliDecompress(buf, (err, decoded) => decode(err ? buf : decoded));
        } else {
          decode(buf);
        }
      });
    }
  }
}));

// MCdle – immer ganz unten!
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
