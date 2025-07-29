import React from 'react';
import { Box } from '@react-three/drei';
import { FurnitureItem as FurnitureItemType } from '../../types/furniture';
import BaseFurnitureItem from './BaseFurnitureItem';

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
}

const Bookshelf: React.FC<BookshelfProps> = (props) => {
  const { item } = props;
  const { width, height, depth } = item.dimensions;
  const wallThickness = 0.083; // 1 inch = 0.083 feet

  return (
    <BaseFurnitureItem {...props}>
      {/* Bottom panel */}
      <Box
        args={[width, wallThickness, depth]}
        position={[width / 2, wallThickness / 2, 0]}
      >
        <meshStandardMaterial
          color="#F5F5DC" // Plywood color
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Left panel */}
      <Box
        args={[wallThickness, height, depth]}
        position={[wallThickness / 2, height / 2, 0]}
      >
        <meshStandardMaterial
          color="#F5F5DC" // Plywood color
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Right panel */}
      <Box
        args={[wallThickness, height, depth]}
        position={[width - wallThickness / 2, height / 2, 0]}
      >
        <meshStandardMaterial
          color="#F5F5DC" // Plywood color
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* No front panel - open for easy access */}
      {/* No top panel - open for easy access */}
    </BaseFurnitureItem>
  );
};

export default Bookshelf; 