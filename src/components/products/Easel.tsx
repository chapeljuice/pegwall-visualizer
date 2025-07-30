import React from 'react';
import { Box } from '@react-three/drei';
import BaseFurnitureItem from './BaseFurnitureItem';
import { FurnitureItem as FurnitureItemType } from '../../types/furniture';
import { getWoodenTexture } from '../../utils/textureLoader';
import { convertDimensionsToUnits } from '../../utils/pegHoleUtils';

interface EaselProps {
  item: FurnitureItemType;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (id: string, position: [number, number, number]) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  wallDimensions?: {
    width: number;
    height: number;
  };
  placedItems?: FurnitureItemType[];
  showLabel?: boolean;
}

const Easel: React.FC<EaselProps> = ({
  item,
  isSelected,
  onSelect,
  onMove,
  onDragStart,
  onDragEnd,
  wallDimensions,
  placedItems,
  showLabel = true,
}) => {
  const { width, height, depth } = convertDimensionsToUnits(item.dimensions);

  // Get preloaded wooden texture
  const woodenTexture = getWoodenTexture();

  return (
    <BaseFurnitureItem
      item={item}
      isSelected={isSelected}
      onSelect={onSelect}
      onMove={onMove}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      wallDimensions={wallDimensions}
      placedItems={placedItems}
      showLabel={showLabel}
    >
      {/* Main easel structure - simple rectangular shape */}
      <group>
        {/* Back panel (wooden texture) */}
        <Box args={[width, height, 0.05]} position={[width/2, height/2, 0.025]}>
          <meshStandardMaterial
            map={woodenTexture}
            roughness={0.7}
            metalness={0.1}
          />
        </Box>
        
        {/* Angled front panel (colored) - angled at 10 degrees upward */}
        <group rotation={[-0.175, 0, 0]} position={[width/2, height/2, depth - 0.025]}>
          <Box args={[width, height, 0.05]} position={[0, 0, 0]}>
            <meshStandardMaterial
              color={item.color}
              roughness={0.7}
              metalness={0.1}
            />
          </Box>
        </group>
        
        {/* Left side panel (wooden texture) - part of main structure */}
        <Box args={[0.05, height, depth]} position={[0.025, height/2, depth/2]}>
          <meshStandardMaterial
            map={woodenTexture}
            roughness={0.7}
            metalness={0.1}
          />
        </Box>
        
        {/* Right side panel (wooden texture) - part of main structure */}
        <Box args={[0.05, height, depth]} position={[width - 0.025, height/2, depth/2]}>
          <meshStandardMaterial
            map={woodenTexture}
            roughness={0.7}
            metalness={0.1}
          />
        </Box>
        
        {/* Bottom panel (wooden texture) */}
        <Box args={[width, 0.05, depth]} position={[width/2, 0.025, depth/2]}>
          <meshStandardMaterial
            map={woodenTexture}
            roughness={0.7}
            metalness={0.1}
          />
        </Box>
      </group>
    </BaseFurnitureItem>
  );
};

export default Easel; 