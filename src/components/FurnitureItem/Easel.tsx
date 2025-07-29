import React from 'react';
import { Box } from '@react-three/drei';
import BaseFurnitureItem from './BaseFurnitureItem';
import { FurnitureItem as FurnitureItemType } from '../../types/furniture';

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
  const { width, height, depth } = item.dimensions;

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
      {/* Main easel structure */}
      <group>
        {/* Back panel (plywood color) */}
        <Box args={[width, height, 0.05]} position={[0, 0, -depth/2 + 0.025]}>
          <meshStandardMaterial color="#F5F5DC" />
        </Box>
        
        {/* Angled front panel (colored) - angled at 10 degrees forward */}
        <group rotation={[-0.175, 0, 0]} position={[0, 0, depth/2 - 0.025]}>
          <Box args={[width, height, 0.05]} position={[0, 0, 0]}>
            <meshStandardMaterial color={item.color} />
          </Box>
        </group>
        
        {/* Side supports (plywood color) */}
        <Box args={[0.05, height, depth]} position={[-width/2 + 0.025, 0, 0]}>
          <meshStandardMaterial color="#F5F5DC" />
        </Box>
        <Box args={[0.05, height, depth]} position={[width/2 - 0.025, 0, 0]}>
          <meshStandardMaterial color="#F5F5DC" />
        </Box>
        
        {/* Bottom support (plywood color) */}
        <Box args={[width, 0.05, depth]} position={[0, -height/2 + 0.025, 0]}>
          <meshStandardMaterial color="#F5F5DC" />
        </Box>
      </group>
    </BaseFurnitureItem>
  );
};

export default Easel; 