import React, { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import Wall from '../Wall/Wall';
import Cubby10x10 from '../FurnitureItem/Cubby10x10';
import Cubby20x10 from '../FurnitureItem/Cubby20x10';
import FurniturePanel from '../FurniturePanel/FurniturePanel';
import WallDimensionsForm from '../WallDimensionsForm/WallDimensionsForm';
import { FurnitureItem as FurnitureItemType } from '../../types/furniture';
import styles from './FurnitureVisualizer.module.css';

const FurnitureVisualizer: React.FC = () => {
  const [placedItems, setPlacedItems] = useState<FurnitureItemType[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [wallDimensions, setWallDimensions] = useState({
    width: 8, // 8 feet
    height: 8, // 8 feet
  });
  const cameraRef = useRef<any>(null);

  // Grid constants for positioning
  const GRID_HORIZONTAL_SPACING = 0.67; // 8 inches = 0.67 feet
  const GRID_VERTICAL_SPACING = 0.5;   // 6 inches = 0.5 feet
  const WALL_POSITION = -2; // Z position of the wall

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

  // Function to check if a position conflicts with existing items
  const hasCollision = (newItem: FurnitureItemType, position: [number, number, number]): boolean => {
    const [x, y] = position;
    // Position is now the top-left corner, so the rectangle starts at position
    const newRect = {
      x: x,
      y: y,
      width: newItem.dimensions.width,
      height: newItem.dimensions.height,
    };

    return placedItems.some(existingItem => {
      const [ex, ey] = existingItem.position;
      // Existing items also use top-left corner positioning
      const existingRect = {
        x: ex,
        y: ey,
        width: existingItem.dimensions.width,
        height: existingItem.dimensions.height,
      };

      return rectanglesOverlap(newRect, existingRect);
    });
  };

  // Function to find a non-conflicting position for a new item
  const findNonConflictingPosition = (item: FurnitureItemType): [number, number, number] => {
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

    // Search through all valid peg hole positions
    for (const y of verticalPositions) {
      for (const x of horizontalPositions) {
        const position: [number, number, number] = [x, y, WALL_POSITION];
        
        // Check if position is within wall boundaries (top-left corner positioning)
        if (
          position[0] >= -wallWidth / 2 + GRID_HORIZONTAL_SPACING &&
          position[0] + item.dimensions.width <= wallWidth / 2 - GRID_HORIZONTAL_SPACING &&
          position[1] >= GRID_VERTICAL_SPACING &&
          position[1] + item.dimensions.height <= wallHeight - GRID_VERTICAL_SPACING
        ) {
          // Check for collisions
          if (!hasCollision(item, position)) {
            return position;
          }
        }
      }
    }

    // If no position found, return a fallback position (top-right corner)
    const fallbackPosition: [number, number, number] = [wallWidth / 2 - item.dimensions.width - GRID_HORIZONTAL_SPACING, wallHeight - item.dimensions.height - GRID_VERTICAL_SPACING, WALL_POSITION];
    return fallbackPosition;
  };

  const handleAddItem = (item: FurnitureItemType) => {
    const position = findNonConflictingPosition(item);
    
    const newItem = {
      ...item,
      id: `${item.name}-${Date.now()}`,
      position: position,
    };
    setPlacedItems(prev => [...prev, newItem]);
    setSelectedItemId(newItem.id);
  };

  const handleMoveItem = (id: string, newPosition: [number, number, number]) => {
    setPlacedItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, position: newPosition } : item
      )
    );
  };

  const handleSelectItem = (id: string) => {
    setSelectedItemId(id);
  };

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCameraPreset = (preset: 'front' | 'top' | 'perspective') => {
    if (!cameraRef.current) return;

    const camera = cameraRef.current;
    
    switch (preset) {
      case 'front':
        camera.position.set(0, 6, 10); // Raised height to provide margin above wall
        camera.lookAt(0, 4, -2); // Look at center of wall
        break;
      case 'top':
        camera.position.set(0, 12, 0); // Moved higher from 10 to 12
        camera.lookAt(0, 0, -2);
        break;
      case 'perspective':
        camera.position.set(8, 8, 8); // Moved further out from 6,6,6 to 8,8,8
        camera.lookAt(0, 4, -2);
        break;
    }
  };

  const handleWallDimensionsChange = (newDimensions: { width: number; height: number }) => {
    setWallDimensions(newDimensions);
  };

  return (
    <div className={styles.container}>
      <div className={styles.canvasContainer}>
        <Canvas
          className={styles.canvas}
          camera={{ position: [0, 6, 10], fov: 60 }} // Front view as default
          onCreated={({ camera }) => {
            cameraRef.current = camera;
            // Set the default camera to look at the same position as front view
            camera.lookAt(0, 4, -2);
          }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={0.8}
            castShadow
          />
          <pointLight position={[-10, 10, -10]} intensity={0.3} />

          {/* 3D Scene */}
          <Wall dimensions={wallDimensions} />
          
          {/* Placed Furniture Items */}
          {placedItems.map(item => {
            // Use specific components based on item name
            if (item.name === 'Cubby - 10" x 10"') {
              return (
                <Cubby10x10
                  key={item.id}
                  item={item}
                  isSelected={selectedItemId === item.id}
                  onSelect={() => handleSelectItem(item.id)}
                  onMove={handleMoveItem}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  wallDimensions={wallDimensions}
                  placedItems={placedItems}
                />
              );
            }
            
            if (item.name === 'Cubby - 20" x 10"') {
              return (
                <Cubby20x10
                  key={item.id}
                  item={item}
                  isSelected={selectedItemId === item.id}
                  onSelect={() => handleSelectItem(item.id)}
                  onMove={handleMoveItem}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  wallDimensions={wallDimensions}
                  placedItems={placedItems}
                />
              );
            }
            
            // Fallback - shouldn't happen with current items
            return null;
          })}
        </Canvas>

        {/* Camera Preset Buttons */}
        <div className={styles.cameraPresets}>
          <button
            className={styles.presetButton}
            onClick={() => handleCameraPreset('front')}
          >
            Front View
          </button>
          <button
            className={styles.presetButton}
            onClick={() => handleCameraPreset('top')}
          >
            Top View
          </button>
          <button
            className={styles.presetButton}
            onClick={() => handleCameraPreset('perspective')}
          >
            45° View
          </button>
        </div>
      </div>

      {/* Wall Dimensions Form */}
      <WallDimensionsForm
        dimensions={wallDimensions}
        onChange={handleWallDimensionsChange}
      />

      {/* Furniture Panel */}
      <FurniturePanel
        placedItems={placedItems}
        onPlaceItem={handleAddItem}
        selectedItem={placedItems.find(item => item.id === selectedItemId) || null}
        onRemoveItem={(id) => {
          setPlacedItems(prev => prev.filter(item => item.id !== id));
          if (selectedItemId === id) {
            setSelectedItemId(null);
          }
        }}
        onSelectItem={(item) => setSelectedItemId(item?.id || null)}
      />
    </div>
  );
};

export default FurnitureVisualizer; 