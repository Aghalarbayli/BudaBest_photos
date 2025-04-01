import { mkdir, stat } from 'fs/promises';
import { join } from 'path';
import { config } from '../config.js';

export async function ensureDirectories() {
  // Create main directories
  for (const dir of Object.values(config.directories)) {
    try {
      await stat(dir);
    } catch {
      await mkdir(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  }

  // Create optimized subdirectories
  const optimizedSubDirs = ['thumbnails', 'regular'];
  for (const subDir of optimizedSubDirs) {
    const fullPath = join(config.directories.optimized, subDir);
    try {
      await stat(fullPath);
    } catch {
      await mkdir(fullPath, { recursive: true });
      console.log(`Created optimized subdirectory: ${subDir}`);
    }
  }
}