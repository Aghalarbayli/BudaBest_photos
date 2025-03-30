import fs from 'fs/promises';
import path from 'path';

const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

async function findImages(dir) {
  const images = [];
  
  async function scan(currentDir, relativePath = '') {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        await scan(fullPath, relPath);
      } else if (entry.isFile() && supportedExtensions.includes(path.extname(entry.name).toLowerCase())) {
        images.push({
          path: relPath,
          name: entry.name
        });
      }
    }
  }
  
  await scan(dir);
  return images;
}

async function generateHTML(images) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Photo Gallery</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            padding: 20px;
        }
        .image-card {
            background: white;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        .image-card:hover {
            transform: translateY(-5px);
        }
        .image-card img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 4px;
        }
        .image-card p {
            margin: 10px 0 0;
            color: #666;
            font-size: 0.9em;
            word-break: break-all;
        }
        .image-card a {
            text-decoration: none;
            color: inherit;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Photo Gallery</h1>
        <div class="gallery">
            ${images.map(image => `
                <div class="image-card">
                    <a href="${image.path}" target="_blank">
                        <img src="${image.path}" alt="${image.name}">
                        <p>${image.path}</p>
                    </a>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

  await fs.writeFile('gallery.html', html);
}

try {
  console.log('Scanning for images...');
  const images = await findImages('.');
  console.log(`Found ${images.length} images`);
  
  console.log('Generating gallery.html...');
  await generateHTML(images);
  console.log('Gallery generated successfully! Open gallery.html in your browser to view.');
} catch (error) {
  console.error('Error:', error);
}