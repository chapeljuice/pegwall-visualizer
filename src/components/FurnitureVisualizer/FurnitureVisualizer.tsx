import React, { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import Wall from '../Wall/Wall';
import FurnitureItem from '../FurnitureItem/FurnitureItem';
import Cubby from '../FurnitureItem/Cubby';
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
  const GRID_HORIZONTAL_SPACING = 0.83; // 10 inches = 0.83 feet
  const GRID_VERTICAL_SPACING = 0.67;   // 8 inches = 0.67 feet
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

  // Function to snap position to grid (top-left corner)
  const snapToGrid = (position: [number, number, number]): [number, number, number] => {
    const [x, y, z] = position;
    const snappedX = Math.round(x / GRID_HORIZONTAL_SPACING) * GRID_HORIZONTAL_SPACING;
    const snappedY = Math.round(y / GRID_VERTICAL_SPACING) * GRID_VERTICAL_SPACING;
    const snappedZ = WALL_POSITION;
    
    return [snappedX, snappedY, snappedZ];
  };

  // Function to find a non-conflicting position for a new item
  const findNonConflictingPosition = (item: FurnitureItemType): [number, number, number] => {
    const wallWidth = wallDimensions.width;
    const wallHeight = wallDimensions.height;
    
    // Start from the top-left corner of the wall
    const startX = -wallWidth / 2 + GRID_HORIZONTAL_SPACING;
    const startY = wallHeight - GRID_VERTICAL_SPACING;
    
    // Define search pattern (top-left to bottom-right)
    const searchPositions: [number, number][] = [];
    
    // Generate positions from top-left to bottom-right
    for (let y = startY; y >= GRID_VERTICAL_SPACING; y -= GRID_VERTICAL_SPACING) {
      for (let x = startX; x <= wallWidth / 2 - item.dimensions.width; x += GRID_HORIZONTAL_SPACING) {
        searchPositions.push([x, y]);
      }
    }

    // Check each position
    for (const [x, y] of searchPositions) {
      const snappedPosition = snapToGrid([x, y, WALL_POSITION]);
      
      // Check if position is within wall boundaries (top-left corner positioning)
      if (
        snappedPosition[0] >= -wallWidth / 2 &&
        snappedPosition[0] + item.dimensions.width <= wallWidth / 2 &&
        snappedPosition[1] >= 0 &&
        snappedPosition[1] + item.dimensions.height <= wallHeight
      ) {
        // Check for collisions
        if (!hasCollision(item, snappedPosition)) {
          return snappedPosition;
        }
      }
    }

    // If no position found, return a fallback position (top-right corner)
    return [wallWidth / 2 - item.dimensions.width, wallHeight - item.dimensions.height, WALL_POSITION];
  };

  const handleAddItem = (item: FurnitureItemType) => {
    const newItem = {
      ...item,
      id: `${item.name}-${Date.now()}`,
      position: findNonConflictingPosition(item),
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
            // Use Cubby component for cubby items, regular FurnitureItem for others
            if (item.type === 'storage') {
              return (
                <Cubby
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
            
            return (
              <FurnitureItem
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