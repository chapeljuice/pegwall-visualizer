import React, { useMemo } from 'react';
import { Plane } from '@react-three/drei';
import * as THREE from 'three';
import HardwoodFloor from './HardwoodFloor';
import styles from './Wall.module.css';

interface WallProps {
  dimensions: {
    width: number; // in feet
    height: number; // in feet
  };
}

const Wall: React.FC<WallProps> = ({ dimensions }) => {
  const { width, height } = dimensions;
  
  // Convert to Three.js units (1 unit = 1 foot)
  const wallWidth = width;
  const wallHeight = height;
  const wallDepth = 0.1; // 1.2 inches thick

  // Grid constants (in Three.js units)
  const GRID_HORIZONTAL_SPACING = 0.67; // 8 inches = 0.67 feet
  const GRID_VERTICAL_SPACING = 0.5;   // 6 inches = 0.5 feet
  const WALL_POSITION = -2; // Z position of the wall

  // Load texture once and memoize it
  const wallTexture = useMemo(() => {
    const texture = new THREE.TextureLoader().load('/images/wooden-plank-texture.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  // Calculate grid positions
  const horizontalPositions: number[] = [];
  const verticalPositions: number[] = [];

  // Generate horizontal positions (skip first column) - same as FurnitureVisualizer
  const horizontalCount = Math.floor((wallWidth - GRID_HORIZONTAL_SPACING) / GRID_HORIZONTAL_SPACING);
  for (let i = 1; i <= horizontalCount; i++) {
    const x = -wallWidth / 2 + (i * GRID_HORIZONTAL_SPACING);
    horizontalPositions.push(Number(x.toFixed(2)));
  }

  // Generate vertical positions (skip bottom row) - same as FurnitureVisualizer
  const verticalCount = Math.floor((wallHeight - GRID_VERTICAL_SPACING) / GRID_VERTICAL_SPACING);
  for (let i = 1; i <= verticalCount; i++) {
    const y = i * GRID_VERTICAL_SPACING;
    verticalPositions.push(Number(y.toFixed(2)));
  }

  return (
    <>
      {/* Back wall (pegboard) */}
      <Plane
        args={[wallWidth, wallHeight]}
        position={[0, wallHeight / 2, WALL_POSITION]}
        rotation={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.1}
          metalness={0}
          map={wallTexture}
          emissive="#FFFFFF"
          emissiveIntensity={0.1}
        />
      </Plane>

      {/* Peg holes */}
      <group>
        {horizontalPositions.map((x) =>
          verticalPositions.map((y) => (
            <Plane
              key={`hole-${x}-${y}`}
              args={[0.083, 0.25]} // 1" wide x 3" tall
              position={[x, y, WALL_POSITION + 0.01]}
              rotation={[0, 0, 0]}
            >
              <meshStandardMaterial
                color="#000000"
                roughness={1.0}
                metalness={0.0}
              />
            </Plane>
          ))
        )}
      </group>

      {/* Left wall (semi-transparent) */}
      <Plane
        args={[wallDepth, wallHeight]}
        position={[-wallWidth / 2 - wallDepth / 2, wallHeight / 2, WALL_POSITION]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <meshStandardMaterial
          color="#FFF3E0"
          transparent
          opacity={0.4}
          roughness={0.7}
          metalness={0.1}
        />
      </Plane>

      {/* Floor */}
      <HardwoodFloor width={wallWidth} depth={4} />
    </>
  );
};

export default Wall; 