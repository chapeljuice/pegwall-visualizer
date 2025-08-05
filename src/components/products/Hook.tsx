import React from 'react';
import { Box } from '@react-three/drei';
import { FurnitureItem as FurnitureItemType } from '../../types/furniture';
import { convertDimensionsToUnits } from '../../utils/pegHoleUtils';
import { getWoodenTexture } from '../../utils/textureLoader';
import BaseFurnitureItem from './BaseFurnitureItem';

interface HookProps {
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

const Hook: React.FC<HookProps> = (props) => {
  const { item, showLabel = true } = props;
  const { width, height, depth } = convertDimensionsToUnits(item.dimensions);

  // Get preloaded wooden texture
  const woodenTexture = getWoodenTexture();

  return (
    <BaseFurnitureItem {...props} showLabel={showLabel}>
      {/* Main hook body - using wooden texture like cubby exterior */}
      <Box
        args={[width, height, depth]}
        position={[width / 2, height / 2, depth / 2]}
      >
        <meshStandardMaterial
          map={woodenTexture}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Hook curve at the top - using wooden texture */}
      <Box
        args={[width * 3, width, depth]}
        position={[width / 2, height - width / 2, depth / 2]}
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

export default Hook; 