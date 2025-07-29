import React from 'react';
import { Box } from '@react-three/drei';
import { FurnitureItem as FurnitureItemType } from '../../types/furniture';
import BaseFurnitureItem from './BaseFurnitureItem';

interface Cubby10x10Props {
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

const Cubby10x10: React.FC<Cubby10x10Props> = (props) => {
  const { item } = props;
  const { width, height, depth } = item.dimensions;
  const wallThickness = 0.083; // 1 inch = 0.083 feet

  return (
    <BaseFurnitureItem {...props}>
      {/* Interior surfaces - using the selected color */}
      {/* Left interior surface */}
      <Box
        args={[0.01, height - wallThickness * 2, depth]}
        position={[wallThickness, height / 2, 0]}
      >
        <meshStandardMaterial
          color={item.color}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Right interior surface */}
      <Box
        args={[0.01, height - wallThickness * 2, depth]}
        position={[width - wallThickness, height / 2, 0]}
      >
        <meshStandardMaterial
          color={item.color}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Top interior surface */}
      <Box
        args={[width - wallThickness * 2, 0.01, depth]}
        position={[width / 2, height - wallThickness, 0]}
      >
        <meshStandardMaterial
          color={item.color}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Bottom interior surface */}
      <Box
        args={[width - wallThickness * 2, 0.01, depth]}
        position={[width / 2, wallThickness, 0]}
      >
        <meshStandardMaterial
          color={item.color}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Back interior surface */}
      <Box
        args={[width - wallThickness * 2, height - wallThickness * 2, 0.01]}
        position={[width / 2, height / 2, -depth / 2 + wallThickness - 0.005]}
      >
        <meshStandardMaterial
          color={item.color}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Outside walls with plywood color */}
      {/* Back wall (outside) */}
      <Box
        args={[width, height, wallThickness]}
        position={[width / 2, height / 2, -depth / 2 + wallThickness / 2]}
      >
        <meshStandardMaterial
          color="#F5F5DC"
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Left wall (outside) */}
      <Box
        args={[wallThickness, height, depth]}
        position={[wallThickness / 2, height / 2, 0]}
      >
        <meshStandardMaterial
          color="#F5F5DC"
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Right wall (outside) */}
      <Box
        args={[wallThickness, height, depth]}
        position={[width - wallThickness / 2, height / 2, 0]}
      >
        <meshStandardMaterial
          color="#F5F5DC"
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Top wall (outside) */}
      <Box
        args={[width, wallThickness, depth]}
        position={[width / 2, height - wallThickness / 2, 0]}
      >
        <meshStandardMaterial
          color="#F5F5DC"
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Bottom wall (outside) */}
      <Box
        args={[width, wallThickness, depth]}
        position={[width / 2, wallThickness / 2, 0]}
      >
        <meshStandardMaterial
          color="#F5F5DC"
          roughness={0.7}
          metalness={0.1}
        />
      </Box>
    </BaseFurnitureItem>
  );
};

export default Cubby10x10; 