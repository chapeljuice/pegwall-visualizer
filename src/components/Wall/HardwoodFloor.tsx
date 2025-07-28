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
          color="#D2B48C"
          roughness={0.3}
          metalness={0.1}
          transparent={true}
          opacity={0.4}
        />
      </Plane>
      
      {/* Wood grain lines for hardwood effect - semi-transparent */}
      {Array.from({ length: Math.floor(depth * 2) }, (_, i) => (
        <mesh
          key={`grain-${i}`}
          position={[0, 0.01, (i - depth) * 0.5]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <boxGeometry args={[width, 0.02, 0.1]} />
          <meshStandardMaterial 
            color="#B8860B"
            roughness={0.4}
            metalness={0.05}
            transparent={true}
            opacity={0.3}
          />
        </mesh>
      ))}
      
      {/* Floor trim/baseboard - semi-transparent */}
      <mesh position={[0, 0.1, -depth / 2]}>
        <boxGeometry args={[width, 0.2, 0.1]} />
        <meshStandardMaterial 
          color="#B8860B"
          roughness={0.6}
          metalness={0.1}
          transparent={true}
          opacity={0.4}
        />
      </mesh>
      
      <mesh position={[0, 0.1, depth / 2]}>
        <boxGeometry args={[width, 0.2, 0.1]} />
        <meshStandardMaterial 
          color="#B8860B"
          roughness={0.6}
          metalness={0.1}
          transparent={true}
          opacity={0.4}
        />
      </mesh>
      
      <mesh position={[-width / 2, 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[depth, 0.2, 0.1]} />
        <meshStandardMaterial 
          color="#B8860B"
          roughness={0.6}
          metalness={0.1}
          transparent={true}
          opacity={0.4}
        />
      </mesh>
      
      <mesh position={[width / 2, 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[depth, 0.2, 0.1]} />
        <meshStandardMaterial 
          color="#B8860B"
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