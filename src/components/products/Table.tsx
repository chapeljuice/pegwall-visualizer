import React from 'react';
import { Box } from '@react-three/drei';
import { FurnitureItem as FurnitureItemType } from '../../types/furniture';
import BaseFurnitureItem from './BaseFurnitureItem';
import { getWoodenTexture } from '../../utils/textureLoader';

interface TableProps {
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

const Table: React.FC<TableProps> = (props) => {
  const { item, showLabel = true } = props;
  const { width, height, depth } = item.dimensions;

  // Get preloaded wooden texture
  const woodenTexture = getWoodenTexture();

  return (
    <BaseFurnitureItem {...props} showLabel={showLabel}>
      {/* Table top - thin colored layer on top of plywood base */}
      {/* Plywood base */}
      <Box
        args={[width, 0.5, depth]}
        position={[width / 2, height - 0.25, 0]}
      >
        <meshStandardMaterial
          map={woodenTexture}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>
      
      {/* Colored top layer - made thicker to prevent see-through */}
      <Box
        args={[width, 0.1, depth]}
        position={[width / 2, height - 0.05, 0]}
      >
        <meshStandardMaterial
          color={item.color}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Front table legs - one on each corner */}
      <Box
        args={[0.25, height - 0.5, 0.25]}
        position={[0.125, (height - 0.5) / 2, depth / 2 - 0.125]}
      >
        <meshStandardMaterial
          map={woodenTexture}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      <Box
        args={[0.25, height - 0.5, 0.25]}
        position={[width - 0.125, (height - 0.5) / 2, depth / 2 - 0.125]}
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

export default Table; 