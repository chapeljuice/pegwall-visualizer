import React from 'react';
import { Box } from '@react-three/drei';
import { FurnitureItem as FurnitureItemType } from '../../types/furniture';
import BaseFurnitureItem from './BaseFurnitureItem';

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
}

const Table: React.FC<TableProps> = (props) => {
  const { item } = props;
  const { width, height, depth } = item.dimensions;
  
  // Table dimensions
  const tableTopThickness = 0.083; // 1 inch thick
  const legWidth = 0.167; // 2 inches wide
  const legHeight = height - tableTopThickness; // Leg height is table height minus top thickness
  const legDepth = 0.167; // 2 inches deep

  return (
    <BaseFurnitureItem {...props}>
      {/* Table top - thin colored layer (like paint) */}
      <Box
        args={[width, 0.01, depth]} // Very thin layer (0.01 feet = ~1/8 inch)
        position={[width / 2, height - 0.005, 0]} // Positioned at the very top
      >
        <meshStandardMaterial
          color={item.color}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Table top base - plywood color underneath the paint */}
      <Box
        args={[width, tableTopThickness - 0.01, depth]} // Remaining thickness minus paint layer
        position={[width / 2, height - tableTopThickness / 2 - 0.005, 0]}
      >
        <meshStandardMaterial
          color="#F5F5DC" // Plywood color
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Front left leg */}
      <Box
        args={[legWidth, legHeight, legDepth]}
        position={[legWidth / 2, legHeight / 2, depth / 2 - legDepth / 2]}
      >
        <meshStandardMaterial
          color="#F5F5DC" // Plywood color
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Front right leg */}
      <Box
        args={[legWidth, legHeight, legDepth]}
        position={[width - legWidth / 2, legHeight / 2, depth / 2 - legDepth / 2]}
      >
        <meshStandardMaterial
          color="#F5F5DC" // Plywood color
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Back support beam (connects to peg wall) */}
      <Box
        args={[width, legWidth, legDepth]}
        position={[width / 2, legHeight / 2, -depth / 2 + legDepth / 2]}
      >
        <meshStandardMaterial
          color="#F5F5DC" // Plywood color
          roughness={0.7}
          metalness={0.1}
        />
      </Box>
    </BaseFurnitureItem>
  );
};

export default Table; 