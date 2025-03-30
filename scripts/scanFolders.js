import fs from 'node:fs/promises';
import path from 'node:path';

const PHOTOS_DIR = './public/photos';  // Directory containing all photos
const OUTPUT_FILE = './public/gallery-data.json';
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

async function isDirectory(path) {
    try {
        const stat = await fs.stat(path);
        return stat.isDirectory();
    } catch (error) {
        return false;
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
                result.folders.push({
                    name: entry.name,
                    path: relativePath,
                    images: folderData.images.map(img => path.join(relativePath, img))
                });
            } else if (IMAGE_EXTENSIONS.some(ext => entry.name.toLowerCase().endsWith(ext))) {
                result.images.push(entry.name);
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
        // Create photos directory if it doesn't exist
        await fs.mkdir(PHOTOS_DIR, { recursive: true });

        const data = await scanDirectory(PHOTOS_DIR);
        const galleryData = {
            lastUpdated: new Date().toISOString(),
            root: data
        };

        // Ensure public directory exists
        await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
        
        // Write the gallery data to a JSON file
        await fs.writeFile(
            OUTPUT_FILE,
            JSON.stringify(galleryData, null, 2),
            'utf8'
        );

        console.log('Gallery data has been generated successfully!');
    } catch (error) {
        console.error('Error generating gallery data:', error);
        process.exit(1);
    }
}

generateGalleryData();