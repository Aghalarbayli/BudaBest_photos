import sharp from 'sharp';
import { join, parse, dirname } from 'path';
import { mkdir } from 'fs/promises';
import { config } from '../config.js';

export async function processImage(imagePath, relativeFolder = '') {
  const { name, ext } = parse(imagePath);
  const optimizedDir = config.directories.optimized;
  
  try {
    // Ensure thumbnail directory exists
    const thumbnailDir = join(optimizedDir, 'thumbnails', relativeFolder);
    await mkdir(thumbnailDir, { recursive: true });

    // Ensure regular directory exists
    const regularDir = join(optimizedDir, 'regular', relativeFolder);
    await mkdir(regularDir, { recursive: true });

    // Create thumbnail
    const thumbnailPath = join(thumbnailDir, `${name}-thumb${ext}`);
    await sharp(imagePath)
      .resize(config.imageOptions.thumbnail.width, config.imageOptions.thumbnail.height, {
        fit: config.imageOptions.thumbnail.fit
      })
      .jpeg({ quality: 70 })
      .toFile(thumbnailPath);

    // Create optimized regular size
    const regularPath = join(regularDir, `${name}-optimized${ext}`);
    await sharp(imagePath)
      .resize(config.imageOptions.regular.width, null, {
        withoutEnlargement: true
      })
      .jpeg({ quality: config.imageOptions.regular.quality })
      .toFile(regularPath);

    console.log(`Successfully processed image: ${name}${ext}`);
    
    return {
      original: imagePath,
      thumbnail: thumbnailPath,
      regular: regularPath
    };
  } catch (error) {
    console.error(`Error processing image ${imagePath}:`, error);
    return null;
  }
}
