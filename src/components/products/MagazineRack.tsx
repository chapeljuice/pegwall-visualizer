import React from 'react';
import { Box } from '@react-three/drei';
import { FurnitureItem as FurnitureItemType } from '../../types/furniture';
import BaseFurnitureItem from './BaseFurnitureItem';
import { getWoodenTexture } from '../../utils/textureLoader';
import { convertDimensionsToUnits } from '../../utils/pegHoleUtils';

interface MagazineRackProps {
  item: FurnitureItemType;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (id: string, position: [number, number, number]) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  wallDimensions?: {
    width: number; // in feet
    height: number; // in feet
  };
  placedItems?: FurnitureItemType[]; // All placed items for collision detection
  showLabel?: boolean;
}

const MagazineRack: React.FC<MagazineRackProps> = (props) => {
  const { item, showLabel = true } = props;
  const { width, height, depth } = convertDimensionsToUnits(item.dimensions);

  // Get preloaded wooden texture
  const woodenTexture = getWoodenTexture();

  return (
    <BaseFurnitureItem {...props} showLabel={showLabel}>
      {/* Bottom panel */}
      <Box
        args={[width, 0.083, depth]}
        position={[width / 2, 0.0415, depth / 2]}
      >
        <meshStandardMaterial
          map={woodenTexture}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Left side panel */}
      <Box
        args={[0.083, height, depth]}
        position={[0.0415, height / 2, depth / 2]}
      >
        <meshStandardMaterial
          map={woodenTexture}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Right side panel */}
      <Box
        args={[0.083, height, depth]}
        position={[width - 0.0415, height / 2, depth / 2]}
      >
        <meshStandardMaterial
          map={woodenTexture}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Back panel */}
      <Box
        args={[width, height, 0.083]}
        position={[width / 2, height / 2, 0.0415]}
      >
        <meshStandardMaterial
          map={woodenTexture}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Front panel */}
      <Box
        args={[width, height, 0.083]}
        position={[width / 2, height / 2, depth - 0.0415]}
      >
        <meshStandardMaterial
          map={woodenTexture}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>
    </BaseFurnitureItem>
  );
};

export default MagazineRack; 