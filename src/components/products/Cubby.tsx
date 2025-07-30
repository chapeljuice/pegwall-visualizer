import React from 'react';
import { Box } from '@react-three/drei';
import { FurnitureItem as FurnitureItemType } from '../../types/furniture';
import BaseFurnitureItem from './BaseFurnitureItem';
import { getWoodenTexture } from '../../utils/textureLoader';

interface CubbyProps {
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

const Cubby: React.FC<CubbyProps> = (props) => {
  const { item, showLabel = true } = props;
  const { width, height, depth } = item.dimensions;
  const wallThickness = 0.083; // 1 inch = 0.083 feet

  // Get preloaded wooden texture
  const woodenTexture = getWoodenTexture();

  return (
    <BaseFurnitureItem {...props} showLabel={showLabel}>
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

      {/* Outside walls with wooden texture */}
      {/* Left wall (outside) */}
      <Box
        args={[wallThickness, height, depth]}
        position={[wallThickness / 2, height / 2, 0]}
      >
        <meshStandardMaterial
          map={woodenTexture}
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
          map={woodenTexture}
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
          map={woodenTexture}
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
          map={woodenTexture}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>
    </BaseFurnitureItem>
  );
};

export default Cubby; 