import React from 'react';
import { useGLTF } from '@react-three/drei';
import { FurnitureItem } from '../../types/furniture';
import BaseFurnitureItem from './BaseFurnitureItem';

// Preload the model immediately when this module loads
useGLTF.preload('/images/products/models/paper-towels.glb');

interface PaperTowelsProps {
  item: FurnitureItem;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (id: string, position: [number, number, number]) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  wallDimensions?: {
    width: number;
    height: number;
  };
  placedItems?: FurnitureItem[];
}

// Load the GLB model (preloaded above)
const PaperTowelsModel: React.FC<{ color: string }> = ({ color }) => {
  const { scene } = useGLTF('/images/products/models/paper-towels.glb');

  return (
    <group>
      <primitive 
        object={scene.clone()} 
        scale={[1, 1, 1]}
        rotation={[0, 0, 0]}
        position={[0.75, 0.33, 0.25]} // Center the model: width/2, height/2, depth/2 in feet
      />
    </group>
  );
};



const PaperTowels: React.FC<PaperTowelsProps> = ({
  item,
  isSelected,
  onSelect,
  onMove,
  onDragStart,
  onDragEnd,
  wallDimensions,
  placedItems,
}) => {
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
    >
      <PaperTowelsModel color={item.color} />
    </BaseFurnitureItem>
  );
};

export default PaperTowels; 