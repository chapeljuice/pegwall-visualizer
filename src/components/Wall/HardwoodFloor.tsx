import React from 'react';
import { Plane } from '@react-three/drei';

interface HardwoodFloorProps {
  width: number; // in feet
  depth: number; // in feet
}

const HardwoodFloor: React.FC<HardwoodFloorProps> = ({ width, depth }) => {
  return (
    <group>
      {/* Main floor plane - semi-transparent */}
      <Plane
        args={[width, depth]}
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial 
          color="lightgray"
          roughness={0.3}
          metalness={0.1}
          transparent={true}
          opacity={0.4}
        />
      </Plane>
      
      <mesh position={[0, 0.1, depth / 2]}>
        <boxGeometry args={[width, 0.2, 0.1]} />
        <meshStandardMaterial 
          color="white"
          roughness={0.6}
          metalness={0.1}
          transparent={true}
          opacity={0.4}
        />
      </mesh>
      
      <mesh position={[-width / 2, 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[depth, 0.2, 0.1]} />
        <meshStandardMaterial 
          color="white"
          roughness={0.6}
          metalness={0.1}
          transparent={true}
          opacity={0.4}
        />
      </mesh>
      
      <mesh position={[width / 2, 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[depth, 0.2, 0.1]} />
        <meshStandardMaterial 
          color="white"
          roughness={0.6}
          metalness={0.1}
          transparent={true}
          opacity={0.4}
        />
      </mesh>
    </group>
  );
};

export default HardwoodFloor; 