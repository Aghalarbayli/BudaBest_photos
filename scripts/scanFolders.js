import fs from 'node:fs/promises';
import path from 'node:path';

const PHOTOS_DIR = './public/photos';  // Directory containing all photos
const API_DIR = './public/api';  // Directory for API JSON files
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

async function isDirectory(path) {
    try {
        const stat = await fs.stat(path);
        return stat.isDirectory();
    } catch (error) {
        return false;
    }
}

async function cleanDirectory(dir) {
    try {
        await fs.rm(dir, { recursive: true, force: true });
        await fs.mkdir(dir, { recursive: true });
        console.log(`Cleaned directory: ${dir}`);
    } catch (error) {
        console.error(`Error cleaning directory ${dir}:`, error);
    }
}

async function scanDirectory(dirPath) {
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        const result = {
            folders: [],
            images: []
        };

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            const relativePath = path.relative(PHOTOS_DIR, fullPath);

            if (await isDirectory(fullPath)) {
                const folderData = await scanDirectory(fullPath);
                const folderInfo = {
                    name: entry.name,
                    path: relativePath,
                    ...folderData
                };
                result.folders.push(folderInfo);

                // Create JSON file for this folder
                const folderApiPath = path.join(API_DIR, relativePath);
                await fs.mkdir(folderApiPath, { recursive: true });
                await fs.writeFile(
                    path.join(folderApiPath, 'index.json'),
                    JSON.stringify({
                        lastUpdated: new Date().toISOString(),
                        currentPath: relativePath,
                        ...folderData
                    }, null, 2),
                    'utf8'
                );
            } else if (IMAGE_EXTENSIONS.some(ext => entry.name.toLowerCase().endsWith(ext))) {
                result.images.push(path.join('/photos', relativePath, entry.name));
            }
        }

        return result;
    } catch (error) {
        console.error(`Error scanning directory ${dirPath}:`, error);
        return { folders: [], images: [] };
    }
}

async function generateGalleryData() {
    try {
        // Create necessary directories
        await fs.mkdir(PHOTOS_DIR, { recursive: true });
        
        // Clean and recreate API directory to ensure fresh data
        await cleanDirectory(API_DIR);

        // Scan the root directory
        const rootData = await scanDirectory(PHOTOS_DIR);
        
        // Create root index.json
        const rootApiData = {
            lastUpdated: new Date().toISOString(),
            currentPath: '.',
            ...rootData
        };

        await fs.writeFile(
            path.join(API_DIR, 'index.json'),
            JSON.stringify(rootApiData, null, 2),
            'utf8'
        );

        console.log('Gallery data has been generated successfully!');
        console.log('API endpoints created:');
        console.log('- /api/index.json (root gallery)');
        console.log('- /api/{folder_path}/index.json (for each subfolder)');
    } catch (error) {
        console.error('Error generating gallery data:', error);
        process.exit(1);
    }
}

// Ensure the script runs
generateGalleryData();