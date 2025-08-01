import React from 'react';
import { Box } from '@react-three/drei';
import { FurnitureItem as FurnitureItemType } from '../../types/furniture';
import BaseFurnitureItem from './BaseFurnitureItem';
import { getWoodenTexture } from '../../utils/textureLoader';
import { convertDimensionsToUnits } from '../../utils/pegHoleUtils';

interface BookshelfProps {
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

const Bookshelf: React.FC<BookshelfProps> = (props) => {
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

      {/* No front or top panels - open for books */}
    </BaseFurnitureItem>
  );
};

export default Bookshelf; 