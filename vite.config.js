import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  server: {
    watch: {
      usePolling: true
    },
    // Custom middleware to serve JSON files with improved error handling and logging
    middlewares: [
      {
        name: 'serve-json-files',
        configureServer(server) {
          server.middlewares.use('/api', (req, res, next) => {
            // Add cache control headers
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');

            const jsonPath = path.join(
              process.cwd(),
              'public',
              req.url.endsWith('.json') ? req.url : path.join(req.url, 'index.json')
            );

            console.log(`[API Request] ${req.url}`);
            console.log(`[Resolved Path] ${jsonPath}`);

            // Check if file exists in real-time
            if (fs.existsSync(jsonPath)) {
              try {
                // Read file content in real-time
                const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
                // Verify that the content is valid JSON
                JSON.parse(jsonContent);
                
                res.setHeader('Content-Type', 'application/json');
                res.end(jsonContent);
                console.log(`[Success] Served JSON file: ${jsonPath}`);
              } catch (error) {
                console.error(`[Error] Invalid JSON in file: ${jsonPath}`, error);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
              }
            } else {
              console.log(`[Not Found] JSON file does not exist: ${jsonPath}`);
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Not Found' }));
            }
          });

          // Add middleware for photos directory
          server.middlewares.use('/photos', (req, res, next) => {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            next();
          });
        }
      }
    ]
  },
  publicDir: 'public'
});