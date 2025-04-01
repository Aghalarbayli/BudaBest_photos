import { readdir, writeFile, stat } from 'fs/promises';
import { join, relative } from 'path';
import { mkdir } from 'fs/promises';

const BASE_URL = 'https://photos.budabestapartments.com';
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const PUBLIC_DIR = 'public';
const JSON_DIR = 'json';

async function ensureDirectories() {
  try {
    await stat(PUBLIC_DIR);
  } catch {
    await mkdir(PUBLIC_DIR);
    console.log('Created public directory');
  }

  try {
    await stat(JSON_DIR);
  } catch {
    await mkdir(JSON_DIR);
    console.log('Created json directory');
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
      
      // Create JSON file for this directory
      const jsonFileName = join(JSON_DIR, `${relativePath.replace(/\//g, '-') || 'root'}.json`);
      const urls = Object.values(subDirFiles).flat();
      
      await writeFile(jsonFileName, JSON.stringify({
        folder: relativePath || 'root',
        updated: new Date().toISOString(),
        files: urls
      }, null, 2));
      
      console.log(`Created JSON file for folder: ${relativePath || 'root'}`);
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
    await ensureDirectories();
    const allFiles = await scanDirectory(PUBLIC_DIR);
    
    // Create a master index JSON file
    await writeFile(join(JSON_DIR, 'index.json'), JSON.stringify({
      updated: new Date().toISOString(),
      folders: Object.keys(allFiles).map(folder => ({
        name: folder || 'root',
        jsonFile: `${(folder || 'root').replace(/\//g, '-')}.json`
      }))
    }, null, 2));
    
    console.log('Scan complete! JSON files have been created in the json directory.');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();