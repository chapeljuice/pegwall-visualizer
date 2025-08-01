import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Box, Html } from '@react-three/drei';
import { Mesh, Vector3, Vector2, Raycaster, Plane } from 'three';
import { FurnitureItem as FurnitureItemType } from '../../types/furniture';
import { convertDimensionsToUnits } from '../../utils/pegHoleUtils';
import styles from './FurnitureItem.module.css';

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

// Grid constants (in Three.js units - 1 unit = 1 foot)
const GRID_HORIZONTAL_SPACING = 0.67; // 8 inches = 0.67 feet
const GRID_VERTICAL_SPACING = 0.5;   // 6 inches = 0.5 feet
const WALL_POSITION = -2; // Z position of the wall
const VERTICAL_OFFSET = 0.25; // 3 inches above peg holes

const Hook: React.FC<HookProps> = ({
  item,
  isSelected,
  onSelect,
  onMove,
  onDragStart,
  onDragEnd,
  wallDimensions = { width: 8, height: 8 }, // Default to 8x8 feet
  placedItems = [], // Default to empty array
  showLabel = true,
}) => {
  const meshRef = useRef<Mesh>(null);
  const { camera, gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [isOverlapping, setIsOverlapping] = useState(false);
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector2());

  const { width, height, depth } = convertDimensionsToUnits(item.dimensions);
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

  // Function to snap position to grid (custom for Hook)
  const snapToGrid = useCallback((position: Vector3): [number, number, number] => {
    // Calculate the grid position that the hook should snap to
    const wallWidth = wallDimensions.width;
    const wallHeight = wallDimensions.height;
    
    // Generate the same grid positions as the Wall component
    const horizontalPositions: number[] = [];
    const verticalPositions: number[] = [];

    // Generate horizontal positions (skip first column) - same as Wall component
    const horizontalCount = Math.floor((wallWidth - GRID_HORIZONTAL_SPACING) / GRID_HORIZONTAL_SPACING);
    for (let i = 1; i <= horizontalCount; i++) {
      const x = -wallWidth / 2 + (i * GRID_HORIZONTAL_SPACING);
      horizontalPositions.push(Number(x.toFixed(2)));
    }

    // Generate vertical positions (skip bottom row) - same as Wall component
    const verticalCount = Math.floor((wallHeight - GRID_VERTICAL_SPACING) / GRID_VERTICAL_SPACING);
    for (let i = 1; i <= verticalCount; i++) {
      const y = i * GRID_VERTICAL_SPACING;
      verticalPositions.push(Number(y.toFixed(2)));
    }

    // Find the closest grid position
    // The hook should align its left edge with the left edge of the first peg hole, but 3" above
    const pegHoleWidth = 0.083; // 1 inch
    const pegHoleHeight = 0.25; // 3 inches
    
    let closestX = horizontalPositions[0] - pegHoleWidth / 2;
    let closestY = verticalPositions[0] - pegHoleHeight / 2 + VERTICAL_OFFSET;
    let minDistance = Infinity;

    for (const x of horizontalPositions) {
      for (const y of verticalPositions) {
        // Use the furniture's pegHolesToSpan property or default to 1
        const pegHolesToSpan = item.pegHolesToSpan || 1;
        
        // Calculate the left edge of the first peg hole, but 3" above
        const firstPegHoleLeft = x - pegHoleWidth / 2;
        const pegHoleTopLeftY = y - pegHoleHeight / 2 + VERTICAL_OFFSET;
        
        // Position hook so its left edge aligns with the left edge of the first peg hole
        const hookX = firstPegHoleLeft;
        const hookY = pegHoleTopLeftY;
        
        const distance = Math.sqrt((position.x - hookX) ** 2 + (position.y - hookY) ** 2);
        if (distance < minDistance) {
          minDistance = distance;
          closestX = hookX;
          closestY = hookY;
        }
      }
    }

    return [closestX, closestY, WALL_POSITION];
  }, [wallDimensions, GRID_HORIZONTAL_SPACING, GRID_VERTICAL_SPACING]);

  // Function to constrain position within wall boundaries (custom for Hook)
  const constrainToWall = useCallback((position: [number, number, number]): [number, number, number] => {
    const [x, y, z] = position;
    
    // Generate the same grid positions as the Wall component
    const horizontalPositions: number[] = [];
    const verticalPositions: number[] = [];

    // Generate horizontal positions (skip first column) - same as Wall component
    const horizontalCount = Math.floor((WALL_WIDTH - GRID_HORIZONTAL_SPACING) / GRID_HORIZONTAL_SPACING);
    for (let i = 1; i <= horizontalCount; i++) {
      const gridX = -WALL_WIDTH / 2 + (i * GRID_HORIZONTAL_SPACING);
      horizontalPositions.push(Number(gridX.toFixed(2)));
    }

    // Generate vertical positions (skip bottom row) - same as Wall component
    const verticalCount = Math.floor((WALL_HEIGHT - GRID_VERTICAL_SPACING) / GRID_VERTICAL_SPACING);
    for (let i = 1; i <= verticalCount; i++) {
      const gridY = i * GRID_VERTICAL_SPACING;
      verticalPositions.push(Number(gridY.toFixed(2)));
    }

    // Find the closest valid grid position that keeps the hook within bounds
    // The hook should align its left edge with the left edge of the first peg hole, but 3" above
    const pegHoleWidth = 0.083; // 1 inch
    const pegHoleHeight = 0.25; // 3 inches
    
    let closestX = horizontalPositions[0] - pegHoleWidth / 2;
    let closestY = verticalPositions[0] - pegHoleHeight / 2 + VERTICAL_OFFSET;
    let minDistance = Infinity;

    for (const gridX of horizontalPositions) {
      for (const gridY of verticalPositions) {
        // Use the furniture's pegHolesToSpan property or default to 1
        const pegHolesToSpan = item.pegHolesToSpan || 1;
        
        // Calculate the left edge of the first peg hole, but 3" above
        const firstPegHoleLeft = gridX - pegHoleWidth / 2;
        const pegHoleTopLeftY = gridY - pegHoleHeight / 2 + VERTICAL_OFFSET;
        
        // Position hook so its left edge aligns with the left edge of the first peg hole
        const hookX = firstPegHoleLeft;
        const hookY = pegHoleTopLeftY;
        
        // Check if this position would keep the hook within wall boundaries
        if (
          hookX >= WALL_LEFT + GRID_HORIZONTAL_SPACING &&
          hookX + width <= WALL_RIGHT - GRID_HORIZONTAL_SPACING &&
          hookY >= WALL_BOTTOM + GRID_VERTICAL_SPACING &&
          hookY + height <= WALL_TOP - GRID_VERTICAL_SPACING
        ) {
          const distance = Math.sqrt((x - hookX) ** 2 + (y - hookY) ** 2);
          if (distance < minDistance) {
            minDistance = distance;
            closestX = hookX;
            closestY = hookY;
          }
        }
      }
    }

    return [closestX, closestY, z];
  }, [width, height, WALL_LEFT, WALL_RIGHT, WALL_BOTTOM, WALL_TOP, WALL_WIDTH, WALL_HEIGHT, GRID_HORIZONTAL_SPACING, GRID_VERTICAL_SPACING]);

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
    <group position={[x, y, z]}>
      {/* The visual representation of the hook */}
      <group onPointerDown={handlePointerDown}>
        {/* Main hook body */}
        <Box
          args={[width, height, depth]}
          position={[width / 2, height / 2, depth / 2]}
        >
          <meshStandardMaterial
            color={item.color}
            roughness={0.8}
            metalness={0.0}
          />
        </Box>

        {/* Hook curve at the top */}
        <Box
          args={[width * 3, width, depth]}
          position={[width / 2, height - width / 2, depth / 2]}
        >
          <meshStandardMaterial
            color={item.color}
            roughness={0.8}
            metalness={0.0}
          />
        </Box>
      </group>
      
      {/* Selection indicator */}
      {isSelected && (
        <group position={[width / 2, height / 2, 0]}>
          <mesh>
            <boxGeometry args={[width + 0.05, height + 0.05, depth + 0.05]} />
            <meshStandardMaterial
              color="#00ff00"
              transparent
              opacity={0.3}
              wireframe
            />
          </mesh>
        </group>
      )}
      
      {/* Overlap indicator (red glow when overlapping) */}
      {isOverlapping && (
        <group position={[width / 2, height / 2, 0]}>
          <mesh>
            <boxGeometry args={[width + 0.1, height + 0.1, depth + 0.1]} />
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

export default Hook; 