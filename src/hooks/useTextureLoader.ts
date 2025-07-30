import { useState, useEffect } from 'react';
import { preloadTextures, getWoodenTexture, getWoodenPlankTexture } from '../utils/textureLoader';

export const useTextureLoader = () => {
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    const loadTextures = async () => {
      try {
        setLoadingError(null);
        await preloadTextures();
        setTexturesLoaded(true);
      } catch (error) {
        setLoadingError(error instanceof Error ? error.message : 'Failed to load textures');
        console.error('Texture loading error:', error);
      }
    };

    loadTextures();
  }, []);

  return {
    texturesLoaded,
    loadingError,
    getWoodenTexture,
    getWoodenPlankTexture,
  };
}; 