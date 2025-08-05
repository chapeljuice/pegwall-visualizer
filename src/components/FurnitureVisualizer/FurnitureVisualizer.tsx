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
import { convertDimensionsToUnits, calculatePegHoleGrid, inchesToUnits, calculateWallPrice } from '../../utils/pegHoleUtils';
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
    width: 3.83, // 3.83 feet (5 horizontal slots × 8" + 6" margin = 46" = 3.83')
    height: 4.33, // 4.33 feet (8 vertical slots × 6" + 4" margin = 52" = 4.33')
  });
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundTexture, setBackgroundTexture] = useState<THREE.Texture | null>(null);
  const [backgroundPosition, setBackgroundPosition] = useState<[number, number, number]>([0, 4, -2]);
  const [backgroundScale, setBackgroundScale] = useState<number>(1);
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(0.6);
  const [showBackgroundControls, setShowBackgroundControls] = useState<boolean>(false);
  const [isUploadMinimized, setIsUploadMinimized] = useState<boolean>(false);
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
    // Convert dimensions to Three.js units for collision detection
    const newItemDimensions = convertDimensionsToUnits(newItem.dimensions);
    
    // Position is now the top-left corner, so the rectangle starts at position
    const newRect = {
      x: x,
      y: y,
      width: newItemDimensions.width,
      height: newItemDimensions.height,
    };

    const collision = placedItems.some(existingItem => {
      const [ex, ey] = existingItem.position;
      // Convert existing item dimensions to Three.js units
      const existingItemDimensions = convertDimensionsToUnits(existingItem.dimensions);
      
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
    
    // Convert furniture dimensions to Three.js units for positioning
    const furnitureDimensions = convertDimensionsToUnits(item.dimensions);
    
    // Generate peg hole grid using the new utilities
    const { horizontalPositions, verticalPositions } = calculatePegHoleGrid(wallWidthInches, wallHeightInches);
    
    // Convert peg hole positions to Three.js units
    const horizontalPositionsUnits = horizontalPositions.map(inchesToUnits);
    const verticalPositionsUnits = verticalPositions.map(inchesToUnits);
    
    // Search through all valid peg hole positions
    for (const y of verticalPositionsUnits) {
      for (const x of horizontalPositionsUnits) {
        // Position furniture so its back face touches the wall
        const position: [number, number, number] = [x, y, WALL_POSITION];
        
        // Check if position is within wall boundaries (top-left corner positioning)
        if (
          position[0] >= -wallWidth / 2 + 0.5 && // 6 inches margin
          position[0] + furnitureDimensions.width <= wallWidth / 2 - 0.5 &&
          position[1] >= 0.5 && // 6 inches margin
          position[1] + furnitureDimensions.height <= wallHeight - 0.5
        ) {
                  // Check for collisions using converted dimensions
        if (!hasCollision({ ...item, dimensions: furnitureDimensions }, position)) {
          return position;
        }
        }
      }
    }

    // If no position found, return a fallback position (top-right corner)
    const fallbackPosition: [number, number, number] = [
      wallWidth / 2 - furnitureDimensions.width - 0.5, 
      wallHeight - furnitureDimensions.height - 0.5, 
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
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formatCurrency = (amount: number): string => {
      return amount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    };

    const getColorName = (hexCode: string): string => {
      const colorMap: { [key: string]: string } = {
          '#FA623B': 'Poppy',
        '#F5F5DC': 'Natural',
        '#FFFFFF': 'White',
        '#74B9FF': 'Sky',
        '#2D3436': 'Space',
        '#FDCB6E': 'Ochre',
        '#636E72': 'Charcoal',
        '#B2BEC3': 'Ash',
        '#DFE6E9': 'Dove',
        '#FF8A65': 'Tangerine',
        '#D63031': 'Sienna',
        '#E17055': 'Rust',
        '#00B894': 'Mint',
        '#A29BFE': 'Pear',
        '#6C5CE7': 'Sage',
        '#00CEA9': 'Kiwi',
        '#55A3FF': 'Avocado',
      };
      return colorMap[hexCode] || 'Unknown Color';
    };

    // Calculate wall price based on current dimensions
    const wallHorizontalHoles = Math.round((wallDimensions.width * 12 - 16) / 8);
    const wallVerticalHoles = Math.round((wallDimensions.height * 12 - 12) / 6);
    const wallPrice = calculateWallPrice(wallHorizontalHoles, wallVerticalHoles);
    
    const totalPrice = placedItems.reduce((sum, item) => sum + item.price, 0) + wallPrice;

    // Generate peg holes HTML
    const generatePegHoles = () => {
      const pegHoles = [];
      for (let x = 1; x <= 7; x++) {
        for (let y = 1; y <= 7; y++) {
          const left = (x * 80) + 20;
          const top = (y * 80) + 20;
          pegHoles.push(`<div class="peg-hole" style="left: ${left}px; top: ${top}px;"></div>`);
        }
      }
      return pegHoles.join('');
    };

    // Generate furniture items HTML
    const generateFurnitureItems = () => {
      return placedItems.map(item => {
        const [x, y] = item.position;
        const width = item.dimensions.width;
        const height = item.dimensions.height;
        
        // Convert 3D coordinates to print coordinates
        const printX = ((x + wallDimensions.width / 2) / wallDimensions.width) * 560 + 20;
        const printY = ((wallDimensions.height - y - height) / wallDimensions.height) * 560 + 20;
        const printWidth = (width / wallDimensions.width) * 560;
        const printHeight = (height / wallDimensions.height) * 560;
        
        // Determine furniture type for styling
        let furnitureType = 'cubby';
        if (item.name.includes('Hook')) furnitureType = 'hook';
        else if (item.name.includes('Table')) furnitureType = 'table';
        else if (item.name.includes('Magazine Rack')) furnitureType = 'magazine-rack';
        else if (item.name.includes('Bookshelf')) furnitureType = 'bookshelf';
        else if (item.name.includes('Easel')) furnitureType = 'easel';
        
        return `<div class="furniture-item-print ${furnitureType}" style="left: ${printX}px; top: ${printY}px; width: ${printWidth}px; height: ${printHeight}px;">${item.name.split(' - ')[0]}</div>`;
      }).join('');
    };

    // Generate furniture list HTML
    const generateFurnitureList = () => {
      return placedItems.map(item => `
        <div class="furniture-item">
          <div class="item-details">
            <strong>${item.name}</strong><br>
            <small>
              <span class="color-swatch" style="background-color: ${item.color}"></span>
              ${getColorName(item.color)} • 
              ${Math.round(item.dimensions.width * 12)}" × ${Math.round(item.dimensions.height * 12)}" × ${Math.round(item.dimensions.depth * 12)}"
            </small>
          </div>
          <div class="item-price">${formatCurrency(item.price)}</div>
        </div>
      `).join('');
    };

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>KerfWall Design - ${new Date().toLocaleDateString()}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .layout-section { margin-bottom: 30px; }
          .layout-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
          .wall-dimensions { margin-bottom: 20px; }
          .furniture-list { margin-bottom: 30px; }
          .furniture-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .item-details { flex: 1; }
          .item-price { font-weight: bold; }
          .total-section { margin-top: 30px; padding-top: 20px; border-top: 2px solid #333; font-size: 18px; font-weight: bold; }
          .color-swatch { display: inline-block; width: 12px; height: 12px; border-radius: 50%; border: 1px solid #ccc; margin-right: 5px; }
          .wall-container { position: relative; width: 600px; height: 600px; border: 3px solid #8B4513; background: linear-gradient(45deg, #DEB887 25%, transparent 25%), linear-gradient(-45deg, #DEB887 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #DEB887 75%), linear-gradient(-45deg, transparent 75%, #DEB887 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0px; margin: 20px auto; overflow: hidden; }
          .peg-hole { position: absolute; width: 8px; height: 24px; background: #2D3436; border-radius: 2px; }
          .furniture-item-print { position: absolute; border: 2px solid #333; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: white; text-shadow: 1px 1px 1px rgba(0,0,0,0.8); overflow: hidden; }
          .furniture-item-print.cubby { background: linear-gradient(135deg, #4CAF50, #45a049); }
          .furniture-item-print.hook { background: linear-gradient(135deg, #FF9800, #F57C00); }
          .furniture-item-print.table { background: linear-gradient(135deg, #2196F3, #1976D2); }
          .furniture-item-print.magazine-rack { background: linear-gradient(135deg, #9C27B0, #7B1FA2); }
          .furniture-item-print.bookshelf { background: linear-gradient(135deg, #607D8B, #455A64); }
          .furniture-item-print.easel { background: linear-gradient(135deg, #E91E63, #C2185B); }
          @media print { body { margin: 0; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>KerfWall Design</h1>
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>

        <div class="layout-section">
          <div class="layout-title">Wall Layout (Front View)</div>
          <div class="wall-dimensions">
            <strong>Wall Dimensions:</strong> ${wallDimensions.width}' × ${wallDimensions.height}'
          </div>
          <div class="wall-container">
            ${generatePegHoles()}
            ${generateFurnitureItems()}
          </div>
          <p><small>Front view showing actual furniture placement on the Kerf wall. Dark rectangles are slots.</small></p>
        </div>

        <div class="layout-section">
          <div class="layout-title">Furniture Items</div>
          <div class="furniture-list">
            ${generateFurnitureList()}
          </div>
        </div>

        <div class="furniture-item">
          <div class="item-details">
            <strong>Kerf Wall</strong><br>
            <small>${wallHorizontalHoles} × ${wallVerticalHoles} holes</small>
          </div>
          <div class="item-price">${formatCurrency(wallPrice)}</div>
        </div>
        <div class="total-section">
          <div class="furniture-item">
            <div class="item-details">Total Cost</div>
            <div class="item-price">${formatCurrency(totalPrice)}</div>
          </div>
        </div>

        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()">Print This Layout</button>
          <button onclick="window.close()">Close</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
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