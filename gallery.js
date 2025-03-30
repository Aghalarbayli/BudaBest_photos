// Supported image formats
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Function to scan directory for images
async function scanDirectory(path = '.') {
    try {
        const response = await fetch(`${path}`);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const links = Array.from(doc.querySelectorAll('a'));
        
        const items = {
            folders: [],
            images: []
        };

        for (const link of links) {
            const href = link.getAttribute('href');
            if (!href || href === '../' || href === './') continue;

            if (href.endsWith('/')) {
                items.folders.push(href.slice(0, -1));
            } else if (IMAGE_EXTENSIONS.some(ext => href.toLowerCase().endsWith(ext))) {
                items.images.push(href);
            }
        }

        return items;
    } catch (error) {
        console.error('Error scanning directory:', error);
        return { folders: [], images: [] };
    }
}

// Function to get complete gallery data
async function getGalleryData(path = '.') {
    const result = {
        currentPath: path,
        folders: [],
        images: []
    };
    
    const { folders, images } = await scanDirectory(path);
    result.images = images.map(image => `${path}/${image}`);
    
    // Only scan subfolders if we're at the root
    if (path === '.') {
        for (const folder of folders) {
            const folderPath = `${path}/${folder}`;
            const folderData = await scanDirectory(folderPath);
            result.folders.push({
                name: folder,
                path: folderPath,
                images: folderData.images.map(image => `${folderPath}/${image}`)
            });
        }
    } else {
        result.folders = folders.map(folder => ({
            name: folder,
            path: `${path}/${folder}`
        }));
    }
    
    return result;
}

// Function to create gallery HTML
async function createGallery(path = '.') {
    const galleryDiv = document.getElementById('gallery');
    const { folders, images } = await scanDirectory(path);

    // Create folder section
    if (folders.length > 0) {
        for (const folder of folders) {
            const folderDiv = document.createElement('div');
            folderDiv.className = 'folder';
            
            const folderName = document.createElement('div');
            folderName.className = 'folder-name';
            folderName.textContent = folder;
            folderDiv.appendChild(folderName);

            const imageGrid = document.createElement('div');
            imageGrid.className = 'image-grid';
            
            // Scan subfolder for images
            const subItems = await scanDirectory(`${path}/${folder}`);
            
            subItems.images.forEach(image => {
                const imageItem = createImageElement(`${path}/${folder}/${image}`, image);
                imageGrid.appendChild(imageItem);
            });

            folderDiv.appendChild(imageGrid);
            galleryDiv.appendChild(folderDiv);
        }
    }

    // Create main folder images section
    if (images.length > 0) {
        const mainFolder = document.createElement('div');
        mainFolder.className = 'folder';
        
        const folderName = document.createElement('div');
        folderName.className = 'folder-name';
        folderName.textContent = path === '.' ? 'Main Folder' : path;
        mainFolder.appendChild(folderName);

        const imageGrid = document.createElement('div');
        imageGrid.className = 'image-grid';
        
        images.forEach(image => {
            const imageItem = createImageElement(`${path}/${image}`, image);
            imageGrid.appendChild(imageItem);
        });

        mainFolder.appendChild(imageGrid);
        galleryDiv.appendChild(mainFolder);
    }
}

// Function to create image element
function createImageElement(src, name) {
    const imageItem = document.createElement('div');
    imageItem.className = 'image-item';

    const img = document.createElement('img');
    img.src = src;
    img.alt = name;
    img.onclick = () => openModal(src);

    const imageName = document.createElement('div');
    imageName.className = 'image-name';
    imageName.textContent = name;

    imageItem.appendChild(img);
    imageItem.appendChild(imageName);
    return imageItem;
}

// Modal functionality
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-content');
const closeBtn = document.getElementById('modal-close');

function openModal(src) {
    modal.style.display = 'block';
    modalImg.src = src;
}

closeBtn.onclick = () => {
    modal.style.display = 'none';
}

modal.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
}

// Initialize gallery or return JSON data based on URL parameter
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const format = urlParams.get('format');
    const path = urlParams.get('path') || '.';
    
    if (format === 'json') {
        const data = await getGalleryData(path);
        document.body.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } else {
        createGallery(path);
    }
});