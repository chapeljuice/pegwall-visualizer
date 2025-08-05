import React, { useRef, useState, useCallback, useEffect, ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Mesh, Vector3, Vector2, Raycaster, Plane } from 'three';
import { FurnitureItem as FurnitureItemType } from '../../types/furniture';
import { calculateFurniturePosition, isValidFurniturePosition, inchesToUnits, convertDimensionsToUnits, calculateFurnitureWidth, calculateFurnitureHeight } from '../../utils/pegHoleUtils';
import styles from './FurnitureItem.module.css';

interface BaseFurnitureItemProps {
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
  children: ReactNode; // The visual representation of the furniture
  showLabel?: boolean; // Whether to show the item label
}

// Grid constants (in Three.js units - 1 unit = 1 foot)
const GRID_HORIZONTAL_SPACING = 0.67; // 8 inches = 0.67 feet
const GRID_VERTICAL_SPACING = 0.5;   // 6 inches = 0.5 feet
const WALL_POSITION = -2; // Z position of the wall

const BaseFurnitureItem: React.FC<BaseFurnitureItemProps> = ({
  item,
  isSelected,
  onSelect,
  onMove,
  onDragStart,
  onDragEnd,
  wallDimensions = { width: 6, height: 8 }, // Default to 6x8 feet
  placedItems = [], // Default to empty array
  children,
  showLabel = true,
}) => {
  const meshRef = useRef<Mesh>(null);
  const { camera, gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [isOverlapping, setIsOverlapping] = useState(false);
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector2());

  // Calculate the actual dimensions based on peg hole spans
  const actualWidthInches = calculateFurnitureWidth(item.pegHolesToSpan.horizontal);
  const actualHeightInches = calculateFurnitureHeight(item.pegHolesToSpan.vertical, item.pegHolesToSpan.horizontal, item.dimensions.height);
  const { width, height, depth } = {
    width: inchesToUnits(actualWidthInches),
    height: inchesToUnits(actualHeightInches),
    depth: convertDimensionsToUnits(item.dimensions).depth
  };
  const [x, y, z] = item.position;

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
      // Convert other item dimensions to Three.js units for collision detection
      const otherItemDimensions = convertDimensionsToUnits(otherItem.dimensions);
      
      // Other items also use top-left corner positioning
      const otherRect = {
        x: ox,
        y: oy,
        width: otherItemDimensions.width,
        height: otherItemDimensions.height,
      };

      return rectanglesOverlap(currentRect, otherRect);
    });
  };

  // Function to snap position to grid using new peg hole utilities
  const snapToGrid = useCallback((position: Vector3): [number, number, number] => {
    // Convert wall dimensions from feet to inches
    const wallWidthInches = wallDimensions.width * 12;
    const wallHeightInches = wallDimensions.height * 12;
    
    // Use the new peg hole utilities to calculate optimal position
    const [snappedX, snappedY] = calculateFurniturePosition(
      item.pegHolesToSpan,
      [position.x, position.y],
      wallWidthInches,
      wallHeightInches
    );
    
    return [snappedX, snappedY, WALL_POSITION];
  }, [wallDimensions, item.pegHolesToSpan]);

  // Function to constrain position within wall boundaries using new peg hole utilities
  const constrainToWall = useCallback((position: [number, number, number]): [number, number, number] => {
    const [x, y, z] = position;
    
    // Convert wall dimensions from feet to inches
    const wallWidthInches = WALL_WIDTH * 12;
    const wallHeightInches = WALL_HEIGHT * 12;
    
    // Convert other furniture positions to the format expected by isValidFurniturePosition
    const otherFurniture = placedItems
      .filter(other => other.id !== item.id)
      .map(other => ({
        position: [other.position[0], other.position[1]] as [number, number], // Only use x, y coordinates
        dimensions: {
          width: calculateFurnitureWidth(other.pegHolesToSpan.horizontal), // Use calculated width
          height: calculateFurnitureHeight(other.pegHolesToSpan.vertical, other.pegHolesToSpan.horizontal, other.dimensions.height), // Use calculated height
        }
      }));
    
    // Calculate the actual furniture dimensions based on peg hole spans
    const furnitureWidthInches = calculateFurnitureWidth(item.pegHolesToSpan.horizontal);
    const furnitureHeightInches = calculateFurnitureHeight(item.pegHolesToSpan.vertical, item.pegHolesToSpan.horizontal, item.dimensions.height);
    
    // Check if current position is valid
    if (isValidFurniturePosition(
      item.pegHolesToSpan,
      [x, y],
      wallWidthInches,
      wallHeightInches,
      furnitureHeightInches,
      otherFurniture
    )) {
      return [x, y, z];
    }
    
    // If not valid, find the closest valid position
    const [constrainedX, constrainedY] = calculateFurniturePosition(
      item.pegHolesToSpan,
      [x, y],
      wallWidthInches,
      wallHeightInches
    );
    
    return [constrainedX, constrainedY, WALL_POSITION];
  }, [WALL_WIDTH, WALL_HEIGHT, item.pegHolesToSpan, placedItems, item.id]);

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
        // The furniture is positioned by its top-left corner, so use the intersection point directly
        // No offset needed - furniture should snap to top-left corners of slots
        const adjustedIntersection = intersection;
        
        // Snap to grid
        const snappedPosition = snapToGrid(adjustedIntersection);
        
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
    <group position={[x, y, z]}>
      {/* The visual representation of the furniture */}
      <group onPointerDown={handlePointerDown}>
        {children}
      </group>
      
      {/* Selection indicator - positioned at center to match furniture bounds */}
      {isSelected && (
        <group position={[width / 2, height / 2, depth / 2]}>
          <mesh>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial
              color="#00ff00"
              transparent
              opacity={0.3}
              wireframe
            />
          </mesh>
        </group>
      )}
      
      {/* Overlap indicator (red glow when overlapping) - positioned at center to match furniture bounds */}
      {isOverlapping && (
        <group position={[width / 2, height / 2, depth / 2]}>
          <mesh>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial
              color="#ff0000"
              transparent
              opacity={0.4}
              wireframe
            />
          </mesh>
        </group>
      )}
      
      {/* Item label */}
      {showLabel && (
        <Html
          position={[width / 2, height + 0.3, 0]}
          center
          distanceFactor={10}
          occlude
        >
          <div className={styles.label}>
            <span className={styles.name}>{item.name}</span>
            <span className={styles.price}>${item.price}</span>
          </div>
        </Html>
      )}
    </group>
  );
};

export default BaseFurnitureItem; 