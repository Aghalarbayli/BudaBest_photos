export const config = {
  baseUrl: 'https://photos.budabestapartments.com',
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  directories: {
    public: 'public',
    json: 'json',
    optimized: 'public/optimized'
  },
  imageOptions: {
    thumbnail: {
      width: 300,
      height: 300,
      fit: 'cover'
    },
    regular: {
      width: 1200,
      quality: 80
    }
  }
};