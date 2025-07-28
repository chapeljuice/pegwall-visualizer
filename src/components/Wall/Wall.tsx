import React from 'react';
import { Plane } from '@react-three/drei';
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
  const GRID_HORIZONTAL_SPACING = 0.83; // 10 inches = 0.83 feet
  const GRID_VERTICAL_SPACING = 0.67;   // 8 inches = 0.67 feet
  const WALL_POSITION = -2; // Z position of the wall

  // Calculate grid positions
  const horizontalPositions: number[] = [];
  const verticalPositions: number[] = [];

  // Generate horizontal positions (skip first column)
  for (let x = -wallWidth / 2 + GRID_HORIZONTAL_SPACING; x <= wallWidth / 2 - GRID_HORIZONTAL_SPACING; x += GRID_HORIZONTAL_SPACING) {
    horizontalPositions.push(x);
  }

  // Generate vertical positions (skip bottom row)
  for (let y = GRID_VERTICAL_SPACING; y <= wallHeight - GRID_VERTICAL_SPACING; y += GRID_VERTICAL_SPACING) {
    verticalPositions.push(y);
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
          color="#F5DEB3" // Light tan plywood color
          roughness={0.8}
          metalness={0.1}
        />
      </Plane>

      {/* Grid lines */}
      <group>
        {/* Horizontal grid lines */}
        {verticalPositions.map((y) => (
          <Plane
            key={`h-${y}`}
            args={[wallWidth, 0.01]}
            position={[0, y, WALL_POSITION + 0.001]}
            rotation={[0, 0, 0]}
          >
            <meshStandardMaterial
              color="#8B4513"
              transparent
              opacity={0.3}
            />
          </Plane>
        ))}

        {/* Vertical grid lines */}
        {horizontalPositions.map((x) => (
          <Plane
            key={`v-${x}`}
            args={[0.01, wallHeight]}
            position={[x, wallHeight / 2, WALL_POSITION + 0.001]}
            rotation={[0, 0, 0]}
          >
            <meshStandardMaterial
              color="#8B4513"
              transparent
              opacity={0.3}
            />
          </Plane>
        ))}
      </group>

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
          color="#D2B48C"
          transparent
          opacity={0.4}
          roughness={0.7}
          metalness={0.1}
        />
      </Plane>

      {/* Floor */}
      <HardwoodFloor width={wallWidth} depth={6} />
    </>
  );
};

export default Wall; 