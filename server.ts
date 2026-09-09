import express from 'express';
import path from 'path';
import fs from 'fs';
import app from './api/index';

const PORT = 3000;

async function startServer() {
  const distPath = path.resolve(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.npm_lifecycle_event === 'start' ||
    hasDist;

  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
      app.use(vite.middlewares);
    } catch (err) {
      console.error('Failed to start Vite middleware:', err);
    }
  } else {
    const resolvedDist =
      [path.resolve(process.cwd(), 'dist'), process.cwd()].find((p) =>
        fs.existsSync(path.join(p, 'index.html'))
      ) || path.resolve(process.cwd(), 'dist');

    app.use(express.static(resolvedDist));
    app.all('/api/*', (_req, res) => res.status(404).json({ error: 'API route not found' }));
    app.get('*', (req, res) => {
      const indexPath = path.join(resolvedDist, 'index.html');
      fs.existsSync(indexPath) ? res.sendFile(indexPath) : res.status(404).send('index.html not found.');
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
