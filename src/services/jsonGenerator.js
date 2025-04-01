import { writeFile } from 'fs/promises';
import { join, relative } from 'path';
import { config } from '../config.js';

export async function generateJsonFiles(scannedFiles) {
  const jsonDir = config.directories.json;
  
  // Initialize main grouped structure
  const groupedImages = {
    updated: new Date().toISOString(),
    original_files: [],
    thumbnail_files: [],
    regular_files: []
  };

  // Generate individual folder JSON files with grouped structure
  for (const [folder, files] of Object.entries(scannedFiles)) {
    const folderGrouped = {
      updated: new Date().toISOString(),
      folder: folder || 'root',
      original_files: [],
      thumbnail_files: [],
      regular_files: []
    };

    // Group files for both folder-specific and main JSON
    for (const file of files) {
      // Add to folder-specific groups
      folderGrouped.original_files.push(file.original);
      folderGrouped.thumbnail_files.push(file.thumbnail);
      folderGrouped.regular_files.push(file.regular);

      // Add to main groups
      groupedImages.original_files.push(file.original);
      groupedImages.thumbnail_files.push(file.thumbnail);
      groupedImages.regular_files.push(file.regular);
    }

    // Write folder-specific JSON file
    const jsonFileName = join(jsonDir, `${(folder || 'root').replace(/\//g, '-')}.json`);
    await writeFile(jsonFileName, JSON.stringify(folderGrouped, null, 2));
    console.log(`Created JSON file for folder: ${folder || 'root'}`);
  }

  // Generate the main grouped JSON file
  const groupedJsonPath = join(jsonDir, 'all-photos.json');
  await writeFile(groupedJsonPath, JSON.stringify(groupedImages, null, 2));
  console.log('Created grouped JSON file with all photos');

  // Generate index file with basic folder structure
  await writeFile(join(jsonDir, 'index.json'), JSON.stringify({
    updated: new Date().toISOString(),
    directories: Object.keys(scannedFiles).reduce((acc, folder) => {
      acc[folder || 'root'] = scannedFiles[folder].length;
      return acc;
    }, {})
  }, null, 2));
}