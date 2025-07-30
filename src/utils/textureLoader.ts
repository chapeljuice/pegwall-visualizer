import * as THREE from 'three';

// Texture paths used throughout the application
export const TEXTURE_PATHS = {
  WOODEN_TEXTURE: '/images/wooden-texture.jpg',
  WOODEN_PLANK_TEXTURE: '/images/wooden-plank-texture.jpg',
} as const;

// Preloaded texture cache
const textureCache = new Map<string, THREE.Texture>();

// Load a texture and cache it
const loadTexture = (path: string): Promise<THREE.Texture> => {
  return new Promise((resolve, reject) => {
    if (textureCache.has(path)) {
      resolve(textureCache.get(path)!);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      path,
      (texture) => {
        // Configure texture properties
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        textureCache.set(path, texture);
        resolve(texture);
      },
      undefined,
      (error) => {
        console.error(`Failed to load texture: ${path}`, error);
        reject(error);
      }
    );
  });
};

// Preload all textures used in the application
export const preloadTextures = async (): Promise<void> => {
  const texturePromises = Object.values(TEXTURE_PATHS).map(path => loadTexture(path));
  
  try {
    await Promise.all(texturePromises);
    console.log('All textures preloaded successfully');
  } catch (error) {
    console.error('Failed to preload some textures:', error);
  }
};

// Get a preloaded texture from cache
export const getTexture = (path: string): THREE.Texture | null => {
  return textureCache.get(path) || null;
};

// Get the wooden texture (most commonly used)
export const getWoodenTexture = (): THREE.Texture | null => {
  return getTexture(TEXTURE_PATHS.WOODEN_TEXTURE);
};

// Get the wooden plank texture (for wall)
export const getWoodenPlankTexture = (): THREE.Texture | null => {
  return getTexture(TEXTURE_PATHS.WOODEN_PLANK_TEXTURE);
};

// Clear texture cache (useful for cleanup)
export const clearTextureCache = (): void => {
  textureCache.forEach(texture => texture.dispose());
  textureCache.clear();
}; 