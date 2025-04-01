import { readdir, writeFile, stat } from 'fs/promises';
import { join, relative } from 'path';
import { mkdir } from 'fs/promises';

const BASE_URL = 'https://photos.budabestapartments.com';
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const PUBLIC_DIR = 'public';

async function ensurePublicDirectory() {
  try {
    await stat(PUBLIC_DIR);
  } catch {
    await mkdir(PUBLIC_DIR);
    console.log('Created public directory');
  }
}

async function scanDirectory(dir) {
  const files = await readdir(dir);
  const results = {};
  
  for (const file of files) {
    const path = join(dir, file);
    const stats = await stat(path);
    
    if (stats.isDirectory()) {
      // Recursively scan subdirectories
      const subDirFiles = await scanDirectory(path);
      const relativePath = relative(PUBLIC_DIR, path);
      const jsonFileName = `${relativePath.replace(/\//g, '-')}.json`;
      
      // Create JSON file for this directory
      const urls = Object.values(subDirFiles).flat();
      await writeFile(jsonFileName, JSON.stringify({
        folder: relativePath,
        files: urls
      }, null, 2));
      
      results[relativePath] = urls;
    } else {
      // Check if file is an image
      const ext = file.toLowerCase().slice(file.lastIndexOf('.'));
      if (ALLOWED_EXTENSIONS.includes(ext)) {
        const relativePath = relative(PUBLIC_DIR, dir);
        if (!results[relativePath]) {
          results[relativePath] = [];
        }
        // Remove 'public/' from the URL path
        const urlPath = relative(PUBLIC_DIR, path);
        results[relativePath].push(`${BASE_URL}/${urlPath}`);
      }
    }
  }
  
  return results;
}

async function main() {
  try {
    console.log('Starting to scan directories...');
    await ensurePublicDirectory();
    const allFiles = await scanDirectory(PUBLIC_DIR);
    
    // Create a master JSON file with all directories
    await writeFile('all-photos.json', JSON.stringify({
      updated: new Date().toISOString(),
      directories: allFiles
    }, null, 2));
    
    console.log('Scan complete! JSON files have been created.');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();