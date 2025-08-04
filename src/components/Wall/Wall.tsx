import React from 'react';
import { Plane, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import HardwoodFloor from './HardwoodFloor';
import styles from './Wall.module.css';
import { getWoodenPlankTexture } from '../../utils/textureLoader';
import { calculatePegHoleGrid, inchesToUnits, PEG_HOLE_SIZE } from '../../utils/pegHoleUtils';

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

  const WALL_POSITION = -2; // Z position of the wall

  // Get preloaded texture
  const wallTexture = getWoodenPlankTexture();

  // Convert wall dimensions to inches and calculate peg hole grid
  const wallWidthInches = wallWidth * 12;
  const wallHeightInches = wallHeight * 12;
  const { horizontalPositions, verticalPositions } = calculatePegHoleGrid(wallWidthInches, wallHeightInches);
  
  // Convert peg hole positions to Three.js units
  const horizontalPositionsUnits = horizontalPositions.map(inchesToUnits);
  const verticalPositionsUnits = verticalPositions.map(inchesToUnits);

  return (
    <>
      {/* Back wall (Kerf wall) */}
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
        {horizontalPositionsUnits.map((x) =>
          verticalPositionsUnits.map((y) => (
            <RoundedBox
              key={`hole-${x}-${y}`}
              args={[inchesToUnits(PEG_HOLE_SIZE.width), inchesToUnits(PEG_HOLE_SIZE.height), 0.02]} // 1" wide x 3" tall x 0.02" deep
              position={[x, y, WALL_POSITION + 0.01]}
              radius={0.02} // Small border radius for rounded corners
            >
              <meshStandardMaterial
                color="#000000"
                roughness={1.0}
                metalness={0.0}
              />
            </RoundedBox>
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
      {/* <HardwoodFloor width={wallWidth} depth={4} /> */}
    </>
  );
};

export default Wall; 