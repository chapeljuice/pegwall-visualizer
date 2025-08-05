import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Plane } from '@react-three/drei';
import * as THREE from 'three';
import Wall from '../Wall/Wall';
import Cubby from '../products/Cubby';
import Hook from '../products/Hook';
import Table from '../products/Table';
import MagazineRack from '../products/MagazineRack';
import Bookshelf from '../products/Bookshelf';
import Easel from '../products/Easel';
import FurniturePanel from '../FurniturePanel/FurniturePanel';
import WallDimensionsForm from '../WallDimensionsForm/WallDimensionsForm';
import Recommendations from '../Recommendations/Recommendations';
import { FurnitureItem as FurnitureItemType } from '../../types/furniture';
import { convertDimensionsToUnits, calculatePegHoleGrid, inchesToUnits, calculateWallPrice, calculateFurnitureWidth, calculateFurnitureHeight } from '../../utils/pegHoleUtils';
import { useTextureLoader } from '../../hooks/useTextureLoader';
import { generateRecommendations, trackUserAction } from '../../utils/recommendationEngine';
import { Button, ImageUpload, BackgroundImageControls } from '../shared';
import styles from './FurnitureVisualizer.module.css';

const FurnitureVisualizer: React.FC = () => {
  const [placedItems, setPlacedItems] = useState<FurnitureItemType[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [wallDimensions, setWallDimensions] = useState({
    width: 6.0, // 6.0 feet (5 horizontal slots × 8" + 16" margin = 56" = 6.0')
    height: 4.33, // 4.33 feet (8 vertical slots × 6" + 4" margin = 52" = 4.33')
  });
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundTexture, setBackgroundTexture] = useState<THREE.Texture | null>(null);
  const [backgroundPosition, setBackgroundPosition] = useState<[number, number, number]>([0, 4, -2]);
  const [backgroundScale, setBackgroundScale] = useState<number>(1);
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(0.6);
  const [showBackgroundControls, setShowBackgroundControls] = useState<boolean>(false);
  const [isUploadMinimized, setIsUploadMinimized] = useState<boolean>(true);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  
    // Load textures
  const { texturesLoaded, loadingError } = useTextureLoader();
  
  // Available colors for recommendations
  const availableColors = [
    '#F5F5DC', '#FFFFFF', '#FA623B', '#74B9FF', '#2D3436', '#FDCB6E', 
    '#636E72', '#B2BEC3', '#DFE6E9', '#FF8A65', '#D63031', '#E17055', 
    '#00B894', '#A29BFE', '#6C5CE7', '#00CEA9', '#55A3FF'
  ];
  
  // Get the currently selected color from FurniturePanel (default to first color)
  const currentSelectedColor = '#FA623B'; // Default to Poppy, but this should come from FurniturePanel
  
  // Generate recommendations
  const recommendations = generateRecommendations(placedItems, wallDimensions, availableColors, currentSelectedColor);
  
  // Grid constants for positioning
  const GRID_HORIZONTAL_SPACING = 0.67; // 8 inches = 0.67 feet
  const GRID_VERTICAL_SPACING = 0.5;   // 6 inches = 0.5 feet
  const WALL_POSITION = -2; // Z position of the wall

  // Function to check if two rectangles overlap
  const rectanglesOverlap = (
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): boolean => {
    const noOverlap = (
      rect1.x + rect1.width <= rect2.x ||
      rect2.x + rect2.width <= rect1.x ||
      rect1.y + rect1.height <= rect2.y ||
      rect2.y + rect2.height <= rect1.y
    );
    
    return !noOverlap;
  };

  // Function to check if a position conflicts with existing items
  const hasCollision = (newItem: FurnitureItemType, position: [number, number, number]): boolean => {
    const [x, y] = position;
    
    // Calculate the actual furniture dimensions based on peg hole spans
    const furnitureWidthInches = calculateFurnitureWidth(newItem.pegHolesToSpan.horizontal);
    const furnitureHeightInches = calculateFurnitureHeight(newItem.pegHolesToSpan.vertical, newItem.pegHolesToSpan.horizontal, newItem.dimensions.height);
    
    // Convert calculated dimensions to Three.js units for collision detection
    const newItemDimensions = {
      width: furnitureWidthInches / 12, // Convert back to feet
      height: furnitureHeightInches / 12,
    };
    
    // Position is now the top-left corner, so the rectangle starts at position
    const newRect = {
      x: x,
      y: y,
      width: newItemDimensions.width,
      height: newItemDimensions.height,
    };

    const collision = placedItems.some(existingItem => {
      const [ex, ey] = existingItem.position;
      
      // Calculate the actual dimensions for existing items based on peg hole spans
      const existingFurnitureWidthInches = calculateFurnitureWidth(existingItem.pegHolesToSpan.horizontal);
      const existingFurnitureHeightInches = calculateFurnitureHeight(existingItem.pegHolesToSpan.vertical, existingItem.pegHolesToSpan.horizontal, existingItem.dimensions.height);
      
      // Convert calculated dimensions to Three.js units
      const existingItemDimensions = {
        width: existingFurnitureWidthInches / 12, // Convert back to feet
        height: existingFurnitureHeightInches / 12,
      };
      
      // Existing items also use top-left corner positioning
      const existingRect = {
        x: ex,
        y: ey,
        width: existingItemDimensions.width,
        height: existingItemDimensions.height,
      };

      return rectanglesOverlap(newRect, existingRect);
    });

    return collision;
  };

  // Function to find a non-conflicting position for a new item
  const findNonConflictingPosition = (item: FurnitureItemType): [number, number, number] => {
    const wallWidth = wallDimensions.width;
    const wallHeight = wallDimensions.height;
    
    // Convert wall dimensions to inches
    const wallWidthInches = wallWidth * 12;
    const wallHeightInches = wallHeight * 12;
    
    // Generate peg hole grid using the new utilities
    const { horizontalPositions, verticalPositions } = calculatePegHoleGrid(wallWidthInches, wallHeightInches);
    
    // Convert peg hole positions to Three.js units
    const horizontalPositionsUnits = horizontalPositions.map(inchesToUnits);
    const verticalPositionsUnits = verticalPositions.map(inchesToUnits);
    
    // Use the same boundary logic as pegHoleUtils - based on actual peg hole positions
    const effectiveWallLeft = inchesToUnits(horizontalPositions[0] - 0.5); // 0.5 inches (half of 1" peg hole)
    const effectiveWallRight = inchesToUnits(horizontalPositions[horizontalPositions.length - 1] + 0.5);
    const effectiveWallBottom = inchesToUnits(verticalPositions[0] - 1.5); // 1.5 inches (half of 3" peg hole)
    const effectiveWallTop = inchesToUnits(verticalPositions[verticalPositions.length - 1] + 1.5);
    
    // Calculate the actual furniture dimensions based on peg hole spans
    const furnitureWidthInches = calculateFurnitureWidth(item.pegHolesToSpan.horizontal);
            const furnitureHeightInches = calculateFurnitureHeight(item.pegHolesToSpan.vertical, item.pegHolesToSpan.horizontal, item.dimensions.height);
    
    // Search through all valid peg hole positions
    for (const y of verticalPositionsUnits) {
      for (const x of horizontalPositionsUnits) {
        // Position furniture so its back face touches the wall
        const position: [number, number, number] = [x, y, WALL_POSITION];
        
        // Convert position to inches for boundary checking
        const positionXInches = position[0] * 12;
        const positionYInches = position[1] * 12;
        
        // Check if position is within reasonable bounds
        // Allow furniture to extend slightly beyond the peg hole grid for larger items
        // But be more restrictive for very large items
        const margin = Math.min(2.0, Math.max(0.5, (horizontalPositions[horizontalPositions.length - 1] - horizontalPositions[0] - furnitureWidthInches) / 4));
        if (
          positionXInches >= horizontalPositions[0] - margin &&
          positionXInches + furnitureWidthInches <= horizontalPositions[horizontalPositions.length - 1] + margin &&
          positionYInches >= verticalPositions[0] - 2.5 &&
          positionYInches + furnitureHeightInches <= verticalPositions[verticalPositions.length - 1] + 2.5
        ) {
          // Check for collisions using the calculated dimensions
          const furnitureDimensions = {
            width: furnitureWidthInches / 12, // Convert back to feet
            height: furnitureHeightInches / 12,
            depth: item.dimensions.depth
          };
          
          if (!hasCollision({ ...item, dimensions: furnitureDimensions }, position)) {
            return position;
          }
        }
      }
    }

    // If no position found, return a fallback position using the same margin logic
    const fallbackPosition: [number, number, number] = [
      effectiveWallRight - furnitureWidthInches / 12, // Position at right edge
      effectiveWallTop - furnitureHeightInches / 12, // Position at top edge
      WALL_POSITION
    ];
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
    
    // Track user action for ML
    trackUserAction({
      type: 'place_item',
      itemType: item.name.split(' - ')[0],
      color: item.color,
      wallDimensions: wallDimensions,
    });
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

  const handleCameraPreset = (preset: 'front' | 'top' | 'perspective' | 'side') => {
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
      case 'side':
        camera.position.set(10, 6, -2); // Side view from the right
        camera.lookAt(0, 4, 0);
        break;
    }
  };

  const handleWallDimensionsChange = (newDimensions: { width: number; height: number }) => {
    setWallDimensions(newDimensions);
  };

  const handleZoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(1.2);
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(1.2);
      controlsRef.current.update();
    }
  };

  const handleClearWall = () => {
    setPlacedItems([]);
    setSelectedItemId(null);
    
    // Track user action for ML
    trackUserAction({
      type: 'view_layout',
      wallDimensions: wallDimensions,
    });
  };

  const handleBackgroundImageUpload = (imageUrl: string) => {
    console.log('Background image uploaded:', imageUrl.substring(0, 100) + '...');
    setBackgroundImage(imageUrl);
  };

  const handleRemoveBackgroundImage = () => {
    setBackgroundImage(null);
    setBackgroundTexture(null);
  };

  const handleBackgroundPositionChange = (x: number, y: number, z: number) => {
    setBackgroundPosition([x, y, z]);
  };

  const handleBackgroundScaleChange = (scale: number) => {
    setBackgroundScale(scale);
  };

  const handleBackgroundOpacityChange = (opacity: number) => {
    setBackgroundOpacity(opacity);
  };

  // Load background texture when image changes
  useEffect(() => {
    if (!backgroundImage) {
      setBackgroundTexture(null);
      return;
    }

    console.log('Loading background texture for Canvas');
    const loader = new THREE.TextureLoader();
    loader.load(
      backgroundImage,
      (texture) => {
        console.log('Background texture loaded successfully for Canvas');
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        setBackgroundTexture(texture);
      },
      undefined,
      (error) => {
        console.error('Failed to load background texture for Canvas:', error);
        setBackgroundTexture(null);
      }
    );
  }, [backgroundImage]);

  const handleApplyRecommendation = (recommendation: any) => {
    // Handle applying recommendations
    if (recommendation.furnitureType) {
      // Create proper furniture items based on the actual furniture definitions
      let defaultItem: FurnitureItemType;
      
      switch (recommendation.furnitureType) {
        case 'cubby':
          defaultItem = {
            id: `Cubby-10x10-${Date.now()}`,
            name: 'Cubby - 10x10',
            type: 'storage',
            dimensions: { width: 10, height: 10, depth: 10 }, // in inches
            color: recommendation.color || '#F5F5DC',
            material: 'plywood',
            price: 210,
            position: [0, 0, 0],
            pegHolesToSpan: { horizontal: 2, vertical: 2 },
          };
          break;
          
        case 'hook':
          defaultItem = {
            id: `Hook-standard-${Date.now()}`,
            name: 'Hook - Standard',
            type: 'hook',
            dimensions: { width: 1, height: 8, depth: 5 }, // in inches
            color: recommendation.color || '#F5F5DC',
            material: 'plywood',
            price: 25,
            position: [0, 0, 0],
            pegHolesToSpan: { horizontal: 1, vertical: 1 },
          };
          break;
          
        case 'table':
          defaultItem = {
            id: `Table-standard-${Date.now()}`,
            name: 'Table - Standard',
            type: 'table',
            dimensions: { width: 38, height: 29, depth: 60 }, // in inches
            color: recommendation.color || '#F5F5DC',
            material: 'plywood',
            price: 1535,
            position: [0, 0, 0],
            pegHolesToSpan: { horizontal: 5, vertical: 4 },
          };
          break;
          
        case 'magazine-rack':
          defaultItem = {
            id: `Magazine Rack-2-slot-${Date.now()}`,
            name: 'Magazine Rack - 2-slot',
            type: 'storage',
            dimensions: { width: 8, height: 8, depth: 6 }, // in inches
            color: recommendation.color || '#F5F5DC',
            material: 'plywood',
            price: 95,
            position: [0, 0, 0],
            pegHolesToSpan: { horizontal: 2, vertical: 2 },
          };
          break;
          
        case 'bookshelf':
          defaultItem = {
            id: `Bookshelf-2-slot-${Date.now()}`,
            name: 'Bookshelf - 2-slot',
            type: 'storage',
            dimensions: { width: 8, height: 10, depth: 10 }, // in inches
            color: recommendation.color || '#F5F5DC',
            material: 'plywood',
            price: 155,
            position: [0, 0, 0],
            pegHolesToSpan: { horizontal: 2, vertical: 2 },
          };
          break;
          
        case 'easel':
          defaultItem = {
            id: `Easel-standard-${Date.now()}`,
            name: 'Easel - Standard',
            type: 'table',
            dimensions: { width: 30, height: 26, depth: 5 }, // in inches
            color: recommendation.color || '#F5F5DC',
            material: 'plywood',
            price: 565,
            position: [0, 0, 0],
            pegHolesToSpan: { horizontal: 4, vertical: 3 },
          };
          break;
          
        default:
          return; // Unknown furniture type
      }
      
      handleAddItem(defaultItem);
    }
  };

  const handleDismissRecommendation = (recommendationId: string) => {
    // Store dismissed recommendations to avoid showing them again
    const dismissed = JSON.parse(localStorage.getItem('dismissed_recommendations') || '[]');
    if (!dismissed.includes(recommendationId)) {
      dismissed.push(recommendationId);
      localStorage.setItem('dismissed_recommendations', JSON.stringify(dismissed));
      
      // Force re-render to hide dismissed recommendations
      setPlacedItems(prev => [...prev]);
    }
  };

  const handlePrint = () => {
    // Save current state to localStorage
    const dataToSave = {
      wallDimensions,
      placedItems,
      timestamp: Date.now()
    };
    localStorage.setItem('pegwall_data', JSON.stringify(dataToSave));
    
    // Open print layout in new tab
    window.open('/print', '_blank');
  };

  // Show loading state while textures are loading
  if (!texturesLoaded) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingMessage}>
            {loadingError ? (
              <div>
                <p>Error loading textures: {loadingError}</p>
                <p>Please refresh the page to try again.</p>
              </div>
            ) : (
              <div>
                <p>Loading textures...</p>
                <div className={styles.loadingSpinner}></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.canvasContainer}>
        <Canvas
          className={styles.canvas}
          camera={{ position: [0, 6, 10], fov: 60 }} // Front view as default
          onCreated={({ camera }) => {
            cameraRef.current = camera;
            // Set the default camera to look at the same position as front view
            camera.lookAt(0, 4, -1.9);
          }}
          gl={{ alpha: false }}
        >
          {/* Background */}
          <color attach="background" args={['#F3F2ED']} />
          
          {/* Background wall image (behind everything) */}
          {backgroundImage && backgroundTexture && (
            <Plane
              args={[20 * backgroundScale, 20 * backgroundScale]} // Scale the plane
              position={backgroundPosition}
              rotation={[0, 0, 0]}
            >
              <meshBasicMaterial
                map={backgroundTexture}
                transparent
                opacity={backgroundOpacity}
              />
            </Plane>
          )}
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
          
          {/* Camera Controls */}
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom={false}
            enableRotate={false}
            minDistance={2}
            maxDistance={20}
            target={[0, wallDimensions.height / 2, -1.9]}
          />
          
          {/* Placed Furniture Items */}
          {placedItems.map(item => {
            // Use specific components based on item name patterns
            if (item.name.includes('Cubby')) {
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
                  showLabel={false}
                />
              );
            }
            
            if (item.name.includes('Hook')) {
              return (
                <Hook
                  key={item.id}
                  item={item}
                  isSelected={selectedItemId === item.id}
                  onSelect={() => handleSelectItem(item.id)}
                  onMove={handleMoveItem}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  wallDimensions={wallDimensions}
                  placedItems={placedItems}
                  showLabel={false}
                />
              );
            }
            
            if (item.name.includes('Table')) {
              console.log('Rendering as Table');
              return (
                <Table
                  key={item.id}
                  item={item}
                  isSelected={selectedItemId === item.id}
                  onSelect={() => handleSelectItem(item.id)}
                  onMove={handleMoveItem}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  wallDimensions={wallDimensions}
                  placedItems={placedItems}
                  showLabel={false}
                />
              );
            }
            
            if (item.name.includes('Magazine Rack')) {
              console.log('Rendering as MagazineRack');
              return (
                <MagazineRack
                  key={item.id}
                  item={item}
                  isSelected={selectedItemId === item.id}
                  onSelect={() => handleSelectItem(item.id)}
                  onMove={handleMoveItem}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  wallDimensions={wallDimensions}
                  placedItems={placedItems}
                  showLabel={false}
                />
              );
            }
            
            if (item.name.includes('Bookshelf')) {
              console.log('Rendering as Bookshelf');
              return (
                <Bookshelf
                  key={item.id}
                  item={item}
                  isSelected={selectedItemId === item.id}
                  onSelect={() => handleSelectItem(item.id)}
                  onMove={handleMoveItem}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  wallDimensions={wallDimensions}
                  placedItems={placedItems}
                  showLabel={false}
                />
              );
            }
            
            if (item.name.includes('Easel')) {
              console.log('Rendering as Easel');
              return (
                <Easel
                  key={item.id}
                  item={item}
                  isSelected={selectedItemId === item.id}
                  onSelect={() => handleSelectItem(item.id)}
                  onMove={handleMoveItem}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  wallDimensions={wallDimensions}
                  placedItems={placedItems}
                  showLabel={false}
                />
              );
            }
            
            // Fallback - render a simple red cube for debugging
            return (
              <mesh key={item.id} position={item.position}>
                <boxGeometry args={[item.dimensions.width, item.dimensions.height, item.dimensions.depth]} />
                <meshStandardMaterial color="red" />
              </mesh>
            );
          })}
        </Canvas>

        {/* Zoom Buttons */}
        <div className={styles.zoomControls}>
          <Button
            variant="secondary"
            size="small"
            onClick={handleZoomIn}
            className={styles.zoomButton}
          >
            +
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={handleZoomOut}
            className={styles.zoomButton}
          >
            -
          </Button>
        </div>

        {/* Camera Preset Buttons */}
        <div className={styles.cameraPresets}>
          <Button
            variant="secondary"
            onClick={() => handleCameraPreset('front')}
            className={styles.presetButton}
          >
            Front View
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleCameraPreset('top')}
            className={styles.presetButton}
          >
            Top View
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleCameraPreset('perspective')}
            className={styles.presetButton}
          >
            45° View
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleCameraPreset('side')}
            className={styles.presetButton}
          >
            Side View
          </Button>
          <Button
            variant="primary"
            onClick={handlePrint}
            className={styles.presetButton}
          >
            Print Layout
          </Button>
          {!showRecommendations && (
            <Button
              variant="secondary"
              onClick={() => setShowRecommendations(true)}
              title={recommendations.length > 0 ? "Show Smart Suggestions" : "Smart Suggestions (add items to see recommendations)"}
              className={styles.brainButton}
            >
              🧠
            </Button>
          )}
        </div>

        {/* Wall Dimensions Form */}
        <div className={styles.wallDimensionsContainer}>
          <WallDimensionsForm
            dimensions={wallDimensions}
            onChange={handleWallDimensionsChange}
          />
        </div>
      </div>

              {/* Recommendations */}
        {showRecommendations && (
          <Recommendations
            recommendations={recommendations}
            onApplyRecommendation={handleApplyRecommendation}
            onDismiss={handleDismissRecommendation}
            onClose={() => setShowRecommendations(false)}
          />
        )}



      {/* Background Image Upload */}
      <div className={`${styles.imageUploadContainer} ${isUploadMinimized ? styles.minimized : ''}`}>
        <ImageUpload
          onImageUpload={handleBackgroundImageUpload}
          currentImage={backgroundImage || undefined}
          onRemoveImage={handleRemoveBackgroundImage}
          showControls={showBackgroundControls}
          onToggleControls={() => setShowBackgroundControls(!showBackgroundControls)}
          isMinimized={isUploadMinimized}
          onToggleMinimize={() => setIsUploadMinimized(!isUploadMinimized)}
        />
        
        {backgroundImage && showBackgroundControls && (
          <BackgroundImageControls
            onPositionChange={handleBackgroundPositionChange}
            onScaleChange={handleBackgroundScaleChange}
            onOpacityChange={handleBackgroundOpacityChange}
            position={backgroundPosition}
            scale={backgroundScale}
            opacity={backgroundOpacity}
            isVisible={true}
          />
        )}
      </div>

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
        onClearWall={handleClearWall}
        wallDimensions={wallDimensions}
      />
    </div>
  );
};

export default FurnitureVisualizer; 