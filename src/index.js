import { ensureDirectories } from './utils/fileSystem.js';
import { scanDirectory } from './services/directoryScanner.js';
import { generateJsonFiles } from './services/jsonGenerator.js';
import { config } from './config.js';

async function main() {
  try {
    console.log('Starting photo scanner...');
    
    // Ensure all required directories exist
    await ensureDirectories();
    
    // Scan directories and process images
    console.log('Scanning directories and processing images...');
    const scannedFiles = await scanDirectory(config.directories.public);
    
    // Generate JSON files
    console.log('Generating JSON files...');
    await generateJsonFiles(scannedFiles);
    
    console.log('Process complete! Optimized images and JSON files have been created.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();