import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Box, Html } from '@react-three/drei';
import { Mesh, Vector3, Vector2, Raycaster, Plane } from 'three';
import { FurnitureItem as FurnitureItemType } from '../../types/furniture';
import styles from './FurnitureItem.module.css';

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
}

// Grid constants (in Three.js units - 1 unit = 1 foot)
const GRID_HORIZONTAL_SPACING = 0.83; // 10 inches = 0.83 feet
const GRID_VERTICAL_SPACING = 0.67;   // 8 inches = 0.67 feet
const WALL_POSITION = -2; // Z position of the wall

const Cubby: React.FC<CubbyProps> = ({
  item,
  isSelected,
  onSelect,
  onMove,
  onDragStart,
  onDragEnd,
  wallDimensions = { width: 8, height: 8 }, // Default to 8x8 feet
  placedItems = [], // Default to empty array
}) => {
  const meshRef = useRef<Mesh>(null);
  const { camera, gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [isOverlapping, setIsOverlapping] = useState(false);
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector2());

  const { width, height, depth } = item.dimensions;
  const [x, y, z] = item.position;
  const wallThickness = 0.083; // 1 inch = 0.083 feet

  // Wall boundaries (in Three.js units)
  const WALL_WIDTH = wallDimensions.width;
  const WALL_HEIGHT = wallDimensions.height;
  const WALL_LEFT = -WALL_WIDTH / 2; // -4 feet
  const WALL_RIGHT = WALL_WIDTH / 2; // 4 feet
  const WALL_BOTTOM = 0; // 0 feet (floor)
  const WALL_TOP = WALL_HEIGHT; // 8 feet

  // Function to check if two rectangles overlap
  const rectanglesOverlap = (
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): boolean => {
    return !(
      rect1.x + rect1.width <= rect2.x ||
      rect2.x + rect2.width <= rect1.x ||
      rect1.y + rect1.height <= rect2.y ||
      rect2.y + rect2.height <= rect1.y
    );
  };

  // Function to check if a position conflicts with other items
  const hasCollision = (position: [number, number, number]): boolean => {
    const [x, y] = position;
    // Position is now the top-left corner
    const currentRect = {
      x: x,
      y: y,
      width: width,
      height: height,
    };

    return placedItems.some(otherItem => {
      if (otherItem.id === item.id) return false; // Skip self
      
      const [ox, oy] = otherItem.position;
      // Other items also use top-left corner positioning
      const otherRect = {
        x: ox,
        y: oy,
        width: otherItem.dimensions.width,
        height: otherItem.dimensions.height,
      };

      return rectanglesOverlap(currentRect, otherRect);
    });
  };

  // Function to snap position to grid
  const snapToGrid = useCallback((position: Vector3): [number, number, number] => {
    const snappedX = Math.round(position.x / GRID_HORIZONTAL_SPACING) * GRID_HORIZONTAL_SPACING;
    const snappedY = Math.round(position.y / GRID_VERTICAL_SPACING) * GRID_VERTICAL_SPACING;
    const snappedZ = WALL_POSITION; // Always snap to wall
    
    return [snappedX, snappedY, snappedZ];
  }, []);

  // Function to constrain position within wall boundaries
  const constrainToWall = useCallback((position: [number, number, number]): [number, number, number] => {
    const [x, y, z] = position;
    
    // Constrain X position (left/right boundaries) - top-left corner positioning
    const minX = WALL_LEFT;
    const maxX = WALL_RIGHT - width;
    const constrainedX = Math.max(minX, Math.min(maxX, x));
    
    // Constrain Y position (bottom/top boundaries) - top-left corner positioning
    const minY = WALL_BOTTOM;
    const maxY = WALL_TOP - height;
    const constrainedY = Math.max(minY, Math.min(maxY, y));
    
    return [constrainedX, constrainedY, z];
  }, [width, height, WALL_LEFT, WALL_RIGHT, WALL_BOTTOM, WALL_TOP]);

  // Function to get intersection with wall plane
  const getWallIntersection = useCallback((mouseX: number, mouseY: number): Vector3 | null => {
    // Convert mouse coordinates to normalized device coordinates
    mouse.current.x = (mouseX / gl.domElement.clientWidth) * 2 - 1;
    mouse.current.y = -(mouseY / gl.domElement.clientHeight) * 2 + 1;
    
    raycaster.current.setFromCamera(mouse.current, camera);
    
    // Create a plane at the wall position
    const wallPlane = new Plane(new Vector3(0, 0, 1), -WALL_POSITION);
    const intersection = new Vector3();
    
    if (raycaster.current.ray.intersectPlane(wallPlane, intersection)) {
      return intersection;
    }
    
    return null;
  }, [camera, gl]);

  const handlePointerDown = useCallback((event: any) => {
    event.stopPropagation();
    
    setIsDragging(true);
    setIsOverlapping(false);
    onSelect();
    onDragStart?.();
    
    // Change cursor
    document.body.style.cursor = 'grabbing';
  }, [onSelect, onDragStart]);

  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setIsOverlapping(false);
      onDragEnd?.();
      
      // Reset cursor
      document.body.style.cursor = '';
    }
  }, [isDragging, onDragEnd]);

  // Handle global mouse events for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;
      
      // Get the wall intersection for the current mouse position
      const intersection = getWallIntersection(event.clientX, event.clientY);
      if (intersection) {
        // Snap to grid
        const snappedPosition = snapToGrid(intersection);
        
        // Constrain to wall boundaries
        const constrainedPosition = constrainToWall(snappedPosition);
        
        // Check for collisions
        const hasCollisionAtPosition = hasCollision(constrainedPosition);
        setIsOverlapping(hasCollisionAtPosition);
        
        // Only move if there's no collision
        if (!hasCollisionAtPosition) {
          onMove(item.id, constrainedPosition);
        }
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setIsOverlapping(false);
        onDragEnd?.();
        document.body.style.cursor = '';
      }
    };

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDragging) {
        setIsDragging(false);
        setIsOverlapping(false);
        onDragEnd?.();
        document.body.style.cursor = '';
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('keydown', handleGlobalKeyDown);
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('keydown', handleGlobalKeyDown);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, onMove, item.id, getWallIntersection, snapToGrid, constrainToWall, onDragEnd, hasCollision]);

  return (
    <group position={[x + width / 2, y + height / 2, z]}>
      {/* Back wall */}
      <Box
        args={[width, height, wallThickness]}
        position={[0, 0, -depth / 2 + wallThickness / 2]}
        onPointerDown={handlePointerDown}
      >
        <meshStandardMaterial
          color={item.color}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Left wall */}
      <Box
        args={[wallThickness, height, depth]}
        position={[-width / 2 + wallThickness / 2, 0, 0]}
      >
        <meshStandardMaterial
          color={item.color}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Right wall */}
      <Box
        args={[wallThickness, height, depth]}
        position={[width / 2 - wallThickness / 2, 0, 0]}
      >
        <meshStandardMaterial
          color={item.color}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Top wall */}
      <Box
        args={[width, wallThickness, depth]}
        position={[0, height / 2 - wallThickness / 2, 0]}
      >
        <meshStandardMaterial
          color={item.color}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>

      {/* Bottom wall */}
      <Box
        args={[width, wallThickness, depth]}
        position={[0, -height / 2 + wallThickness / 2, 0]}
      >
        <meshStandardMaterial
          color={item.color}
          roughness={0.7}
          metalness={0.1}
        />
      </Box>
      
      {/* Selection indicator */}
      {isSelected && (
        <Box
          args={[width + 0.05, height + 0.05, depth + 0.05]}
          position={[0, 0, 0]}
        >
          <meshStandardMaterial
            color="#00ff00"
            transparent
            opacity={0.3}
            wireframe
          />
        </Box>
      )}
      
      {/* Overlap indicator (red glow when overlapping) */}
      {isOverlapping && (
        <Box
          args={[width + 0.1, height + 0.1, depth + 0.1]}
          position={[0, 0, 0]}
        >
          <meshStandardMaterial
            color="#ff0000"
            transparent
            opacity={0.4}
            wireframe
          />
        </Box>
      )}
      
      {/* Item label */}
      <Html
        position={[0, height / 2 + 0.3, 0]}
        center
        distanceFactor={10}
        occlude
      >
        <div className={styles.label}>
          <span className={styles.name}>{item.name}</span>
          <span className={styles.price}>${item.price}</span>
        </div>
      </Html>
    </group>
  );
};

export default Cubby; 