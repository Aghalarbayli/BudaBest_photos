import { readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { config } from '../config.js';
import { processImage } from './imageProcessor.js';

export async function scanDirectory(dir) {
  const files = await readdir(dir);
  const results = {};
  
  for (const file of files) {
    const path = join(dir, file);
    const stats = await stat(path);
    
    if (stats.isDirectory() && path !== config.directories.optimized) {
      // Recursively scan subdirectories
      const subDirFiles = await scanDirectory(path);
      Object.assign(results, subDirFiles);
    } else {
      // Check if file is an image
      const ext = file.toLowerCase().slice(file.lastIndexOf('.'));
      if (config.allowedExtensions.includes(ext)) {
        const relativePath = relative(config.directories.public, dir);
        if (!results[relativePath]) {
          results[relativePath] = [];
        }
        
        // Process the image and get optimized versions
        const processedImage = await processImage(path);
        if (processedImage) {
          const urlBase = config.baseUrl;
          results[relativePath].push({
            original: `${urlBase}/public/${relative(config.directories.public, processedImage.original)}`,
            thumbnail: `${urlBase}/public/${relative(config.directories.public, processedImage.thumbnail)}`,
            regular: `${urlBase}/public/${relative(config.directories.public, processedImage.regular)}`
          });
        }
      }
    }
  }
  
  return results;
}