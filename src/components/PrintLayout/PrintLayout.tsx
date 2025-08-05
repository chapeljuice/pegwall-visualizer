import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useSearchParams } from 'react-router-dom';
import Wall from '../Wall/Wall';
import Cubby from '../products/Cubby';
import Hook from '../products/Hook';
import Table from '../products/Table';
import MagazineRack from '../products/MagazineRack';
import Bookshelf from '../products/Bookshelf';
import Easel from '../products/Easel';
import { FurnitureItem } from '../../types/furniture';
import { calculateWallPrice, getWallDimensionsFromHoles } from '../../utils/pegHoleUtils';
import styles from './PrintLayout.module.css';

interface PrintLayoutProps {
  wallDimensions?: {
    width: number;
    height: number;
  };
  placedItems?: FurnitureItem[];
}

const PrintLayout: React.FC<PrintLayoutProps> = ({ wallDimensions: propWallDimensions, placedItems: propPlacedItems }) => {
  const cameraRef = useRef<any>(null);
  const [searchParams] = useSearchParams();
  
  // Get data from props, URL params, or localStorage
  const [wallDimensions, setWallDimensions] = useState(() => {
    if (propWallDimensions) return propWallDimensions;
    
    // Try to get from URL params
    const width = searchParams.get('width');
    const height = searchParams.get('height');
    if (width && height) {
      return { width: parseFloat(width), height: parseFloat(height) };
    }
    
    // Try to get from localStorage
    const stored = localStorage.getItem('pegwall_data');
    if (stored) {
      const data = JSON.parse(stored);
      return data.wallDimensions || { width: 3.83, height: 4.33 };
    }
    
    // Default fallback
    return { width: 3.83, height: 4.33 };
  });
  
  const [placedItems, setPlacedItems] = useState(() => {
    if (propPlacedItems) return propPlacedItems;
    
    // Try to get from localStorage
    const stored = localStorage.getItem('pegwall_data');
    if (stored) {
      const data = JSON.parse(stored);
      return data.placedItems || [];
    }
    
    return [];
  });

  // Calculate wall price based on dimensions
  const wallWidthInches = wallDimensions.width * 12;
  const wallHeightInches = wallDimensions.height * 12;
  const horizontalHoles = Math.round((wallWidthInches - 6) / 8);
  const verticalHoles = Math.round((wallHeightInches - 4) / 6);
  const wallPrice = calculateWallPrice(horizontalHoles, verticalHoles);

  // Calculate total furniture cost
  const totalFurnitureCost = placedItems.reduce((sum: number, item: FurnitureItem) => sum + item.price, 0);
  const totalCost = wallPrice + totalFurnitureCost;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get color name from hex code
  const getColorName = (hexCode: string) => {
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
    return colorMap[hexCode] || 'Custom';
  };

  useEffect(() => {
    // Set up print-friendly styles and ensure scrolling works
    const style = document.createElement('style');
    style.textContent = `
      body, html {
        height: auto !important;
        min-height: 100vh;
        overflow-y: auto !important;
        overflow-x: hidden;
        position: relative;
      }
      
      #root {
        height: auto !important;
        min-height: 100vh;
        overflow: visible;
      }
      
      .App {
        height: auto !important;
        min-height: 100vh;
        overflow: visible !important;
        width: 100%;
      }
      
      @media print {
        body { margin: 0; }
        .print-layout { page-break-inside: avoid; }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>PegWall Layout - Custom Design</h1>
        <p className={styles.date}>
          Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </p>
        <button onClick={handlePrint} className={styles.printButton}>
          Send to Printer 
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.visualization}>
          <h2>Wall Layout</h2>
          <div className={styles.canvasContainer}>
            <Canvas
              camera={{ position: [0, 4, 6], fov: 70 }}
              onCreated={({ camera }) => {
                cameraRef.current = camera;
                camera.lookAt(0, wallDimensions.height / 2, -1.9);
              }}
              gl={{ alpha: false }}
            >
              {/* Background */}
              <color attach="background" args={['#F3F2ED']} />
              
              {/* Lighting */}
              <ambientLight intensity={0.6} />
              <directionalLight
                position={[10, 10, 5]}
                intensity={0.8}
                castShadow
              />

              {/* Wall */}
              <Wall dimensions={wallDimensions} />
              
              {/* Camera Controls - Fixed front view with zoom */}
              <OrbitControls
                enablePan={false}
                enableZoom={true}
                enableRotate={false}
                target={[0, wallDimensions.height / 2, -1.9]}
                minDistance={3}
                maxDistance={15}
                zoomSpeed={0.5}
              />
              
              {/* Placed Furniture Items */}
              {placedItems.map((item: FurnitureItem) => {
                if (item.name.includes('Cubby')) {
                  return (
                    <Cubby
                      key={item.id}
                      item={item}
                      isSelected={false}
                      onSelect={() => {}}
                      onMove={() => {}}
                      onDragStart={() => {}}
                      onDragEnd={() => {}}
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
                      isSelected={false}
                      onSelect={() => {}}
                      onMove={() => {}}
                      onDragStart={() => {}}
                      onDragEnd={() => {}}
                      wallDimensions={wallDimensions}
                      placedItems={placedItems}
                      showLabel={false}
                    />
                  );
                }
                
                if (item.name.includes('Table')) {
                  return (
                    <Table
                      key={item.id}
                      item={item}
                      isSelected={false}
                      onSelect={() => {}}
                      onMove={() => {}}
                      onDragStart={() => {}}
                      onDragEnd={() => {}}
                      wallDimensions={wallDimensions}
                      placedItems={placedItems}
                      showLabel={false}
                    />
                  );
                }
                
                if (item.name.includes('Magazine Rack')) {
                  return (
                    <MagazineRack
                      key={item.id}
                      item={item}
                      isSelected={false}
                      onSelect={() => {}}
                      onMove={() => {}}
                      onDragStart={() => {}}
                      onDragEnd={() => {}}
                      wallDimensions={wallDimensions}
                      placedItems={placedItems}
                      showLabel={false}
                    />
                  );
                }
                
                if (item.name.includes('Bookshelf')) {
                  return (
                    <Bookshelf
                      key={item.id}
                      item={item}
                      isSelected={false}
                      onSelect={() => {}}
                      onMove={() => {}}
                      onDragStart={() => {}}
                      onDragEnd={() => {}}
                      wallDimensions={wallDimensions}
                      placedItems={placedItems}
                      showLabel={false}
                    />
                  );
                }
                
                if (item.name.includes('Easel')) {
                  return (
                    <Easel
                      key={item.id}
                      item={item}
                      isSelected={false}
                      onSelect={() => {}}
                      onMove={() => {}}
                      onDragStart={() => {}}
                      onDragEnd={() => {}}
                      wallDimensions={wallDimensions}
                      placedItems={placedItems}
                      showLabel={false}
                    />
                  );
                }
                
                return null;
              })}
            </Canvas>
          </div>
        </div>

        <div className={styles.details}>
          <div className={styles.specifications}>
            <h2>Wall Specifications</h2>
            <div className={styles.specGrid}>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Dimensions:</span>
                <span className={styles.specValue}>
                  {wallDimensions.width.toFixed(1)}' × {wallDimensions.height.toFixed(1)}'
                </span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Peg Hole Grid:</span>
                <span className={styles.specValue}>
                  {horizontalHoles} × {verticalHoles} slots
                </span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Wall Price:</span>
                <span className={styles.specValue}>{formatCurrency(wallPrice)}</span>
              </div>
            </div>
          </div>

          <div className={styles.furnitureList}>
            <h2>Furniture Items ({placedItems.length})</h2>
            {placedItems.length === 0 ? (
              <p className={styles.noItems}>No furniture items placed on the wall.</p>
            ) : (
              <div className={styles.itemList}>
                {placedItems.map((item: FurnitureItem, index: number) => (
                  <div key={item.id} className={styles.itemRow}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemDetails}>
                        {getColorName(item.color)} • {item.material}
                      </span>
                    </div>
                    <span className={styles.itemPrice}>{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.costBreakdown}>
            <h2>Cost Breakdown</h2>
            <div className={styles.costGrid}>
              <div className={styles.costRow}>
                <span className={styles.costLabel}>Wall System:</span>
                <span className={styles.costValue}>{formatCurrency(wallPrice)}</span>
              </div>
              <div className={styles.costRow}>
                <span className={styles.costLabel}>Furniture Items:</span>
                <span className={styles.costValue}>{formatCurrency(totalFurnitureCost)}</span>
              </div>
              <div className={styles.costRowTotal}>
                <span className={styles.costLabel}>Total Cost:</span>
                <span className={styles.costValue}>{formatCurrency(totalCost)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintLayout;
