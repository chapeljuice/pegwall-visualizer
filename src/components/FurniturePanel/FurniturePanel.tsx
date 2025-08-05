import React, { useState } from 'react';
import { FurnitureItem as FurnitureItemType, FurnitureGroup, SHARED_COLORS } from '../../types/furniture';
import FurnitureGroupCard from './FurnitureGroupCard';
import { calculateWallPrice } from '../../utils/pegHoleUtils';
import { Button } from '../shared';
import styles from './FurniturePanel.module.css';

interface FurniturePanelProps {
  onPlaceItem: (item: FurnitureItemType) => void;
  placedItems: FurnitureItemType[];
  selectedItem: FurnitureItemType | null;
  onRemoveItem: (id: string) => void;
  onSelectItem: (item: FurnitureItemType | null) => void;
  onClearWall: () => void;
  wallDimensions: { width: number; height: number };
}

const FurniturePanel: React.FC<FurniturePanelProps> = ({
  onPlaceItem,
  placedItems,
  selectedItem,
  onRemoveItem,
  onSelectItem,
  onClearWall,
  wallDimensions,
}) => {
  const [activeAccordion, setActiveAccordion] = useState<'available' | 'placed'>('available');
  const [sharedSelectedColor, setSharedSelectedColor] = useState(SHARED_COLORS[0]); // Default to first color

  // Sample furniture groups - you can expand this with your 6 cubby sizes and 18 colors
  const furnitureGroups: FurnitureGroup[] = [
    {
      id: 'cubby',
      name: 'Cubby',
      description: 'A little cubby to put things in.',
      type: 'storage',
      material: 'plywood',
      basePrice: 210,
      imagePath: '/images/products/cubby-10x10.jpg',
      variants: [
        {
          id: '10x10',
          name: '10" × 10"',
          dimensions: { width: 10, height: 10, depth: 10 },
          price: 0,
          pegHolesToSpan: { horizontal: 2, vertical: 2 },
        },
        {
          id: '10x16',
          name: '10" × 16"',
          dimensions: { width: 10, height: 16, depth: 10 },
          price: 60,
          pegHolesToSpan: { horizontal: 2, vertical: 3 },
        },
        {
          id: '20x10',
          name: '20" × 10"',
          dimensions: { width: 20, height: 10, depth: 10 },
          price: 100,
          pegHolesToSpan: { horizontal: 3, vertical: 2 },
        },
        {
          id: '20x16',
          name: '20" × 16"',
          dimensions: { width: 20, height: 16, depth: 10 },
          price: 165,
          pegHolesToSpan: { horizontal: 3, vertical: 3 },
        },
        {
          id: '40x10',
          name: '40" × 10"',
          dimensions: { width: 40, height: 10, depth: 10 },
          price: 305,
          pegHolesToSpan: { horizontal: 5, vertical: 2 },
        },
        {
          id: '40x16',
          name: '40" × 16"',
          dimensions: { width: 40, height: 16, depth: 10 },
          price: 365,
          pegHolesToSpan: { horizontal: 5, vertical: 3 },
        },
      ],
      colors: SHARED_COLORS,
    },
    {
      id: 'hook',
      name: 'Hook',
      description: 'A hook for hanging things on.',
      type: 'hook',
      material: 'plywood',
      basePrice: 25,
      imagePath: '/images/products/hook.jpg',
      variants: [
        {
          id: 'standard',
          name: 'Standard',
          dimensions: { width: 1, height: 8, depth: 5 },
          price: 0,
          pegHolesToSpan: { horizontal: 1, vertical: 1 },
        },
      ],
      colors: [
        { id: 'natural', name: 'Natural', hexCode: '#F5F5DC', price: 0 },
      ],
    },
    {
      id: 'table',
      name: 'Table',
      description: 'A sturdy, easy to assemble work table that hooks into the wall panel.',
      type: 'table',
      material: 'plywood',
      basePrice: 1535,
      imagePath: '/images/products/table.jpg',
      variants: [
        {
          id: 'standard',
          name: 'Standard',
          dimensions: { width: 24, height: 18, depth: 24 }, // 24" × 18" × 24"
          price: 0,
          pegHolesToSpan: { horizontal: 3, vertical: 3 },
        },
      ],
      colors: SHARED_COLORS,
    },
    {
      id: 'magazine-rack',
      name: 'Magazine Rack',
      description: 'A shallow niche for magazines, mail, pamphlets, et cetera.',
      type: 'storage',
      material: 'plywood',
      basePrice: 95,
      imagePath: '/images/products/magazine-rack.jpg',
      variants: [
        {
          id: '2-slot',
          name: '2 Slot',
          dimensions: { width: 10, height: 8, depth: 6 }, // 10" × 8" × 6"
          price: 0,
          pegHolesToSpan: { horizontal: 2, vertical: 2 },
        },
        {
          id: '3-slot',
          name: '3 Slot',
          dimensions: { width: 20, height: 8, depth: 6 }, // 20" × 8" × 6"
          price: 60,
          pegHolesToSpan: { horizontal: 3, vertical: 2 },
        },
      ],
      colors: [
        { id: 'natural', name: 'Natural', hexCode: '#F5F5DC', price: 0 },
      ],
    },
    {
      id: 'bookshelf',
      name: 'Bookshelf',
      description: 'A sturdy shelf to hold books and things.',
      type: 'storage',
      material: 'plywood',
      basePrice: 155,
      imagePath: '/images/products/bookshelf.jpg',
      variants: [
        {
          id: '2-slot',
          name: '2 Slot',
          dimensions: { width: 10, height: 10, depth: 10 }, // 10" × 10" × 10"
          price: 0,
          pegHolesToSpan: { horizontal: 2, vertical: 2 },
        },
        {
          id: '3-slot',
          name: '3 Slot',
          dimensions: { width: 20, height: 10, depth: 10 }, // 20" × 10" × 10"
          price: 65,
          pegHolesToSpan: { horizontal: 3, vertical: 2 },
        },
        {
          id: '4-slot',
          name: '4 Slot',
          dimensions: { width: 30, height: 10, depth: 10 }, // 30" × 10" × 10"
          price: 115,
          pegHolesToSpan: { horizontal: 4, vertical: 2 },
        },
      ],
      colors: [
        { id: 'natural', name: 'Natural', hexCode: '#F5F5DC', price: 0 },
      ],
    },
    {
      id: 'easel',
      name: 'Easel',
      description: 'This simple workspace can be hung vertically or horizontally as needed. When horizontal it is a sturdy work surface; When hung vertically it has a small ledger to hold papers or drawing tools. The edge of the worktop overhangs to allow paper to be clipped in place when used in the easel position.',
      type: 'table',
      material: 'plywood',
      basePrice: 565,
      imagePath: '/images/products/easel.jpg',
      variants: [
        {
          id: 'standard',
          name: 'Standard',
          dimensions: { width: 30, height: 26, depth: 5 }, // 30" × 26" × 5"
          price: 0,
          pegHolesToSpan: { horizontal: 4, vertical: 3 },
        },
      ],
      colors: SHARED_COLORS,
    },
  ];

  // Calculate wall price based on current dimensions
  const wallHorizontalHoles = Math.round((wallDimensions.width * 12 - 16) / 8);
  const wallVerticalHoles = Math.round((wallDimensions.height * 12 - 12) / 6);
  const wallPrice = calculateWallPrice(wallHorizontalHoles, wallVerticalHoles);
  
  const totalPrice = placedItems.reduce((sum, item) => sum + item.price, 0) + wallPrice;

  // Function to get the appropriate image for each furniture item
  const getItemImage = (itemName: string): string => {
    if (itemName.includes('Cubby')) {
      return '/images/products/cubby-10x10.jpg';
    } else if (itemName.includes('Hook')) {
      return '/images/products/hook.jpg';
    } else if (itemName.includes('Table')) {
      return '/images/products/table.jpg';
    } else if (itemName.includes('Magazine Rack')) {
      return '/images/products/magazine-rack.jpg';
    } else if (itemName.includes('Bookshelf')) {
      return '/images/products/bookshelf.jpg';
    } else if (itemName.includes('Easel')) {
      return '/images/products/easel.jpg';
    }
    return '/images/products/cubby-10x10.jpg'; // Default fallback
  };

  // Function to get color name from hex code
  const getColorName = (hexCode: string): string => {
    const color = SHARED_COLORS.find(c => c.hexCode === hexCode);
    return color ? color.name : 'Unknown Color';
  };

  // Function to format currency with commas
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2>KERF Wall Designer</h2>
        <div className={styles.instructions}>
          <p>Click a product group to see customization options. Drag placed items to move them around!</p>
          <p>Furniture snaps to a 16" × 8" slot grid.</p>
        </div>
      </div>
      <div className={styles.accordion}>
        <div className={styles.accordionItem}>
          <button
            className={`${styles.accordionHeader} ${activeAccordion === 'available' ? styles.active : ''}`}
            onClick={() => setActiveAccordion(activeAccordion === 'available' ? 'placed' : 'available')}
          >
            <span>Available Products</span>
            <span className={styles.accordionIcon}>
              {activeAccordion === 'available' ? '−' : '+'}
            </span>
          </button>
          {activeAccordion === 'available' && (
            <div className={`${styles.accordionContent} ${styles.active}`}>
              <div className={styles.itemsGrid}>
                {furnitureGroups.map((group) => (
                  <FurnitureGroupCard
                    key={group.id}
                    group={group}
                    onPlaceItem={onPlaceItem}
                    sharedSelectedColor={sharedSelectedColor}
                    onSharedColorChange={setSharedSelectedColor}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className={styles.accordionItem}>
          <button
            className={`${styles.accordionHeader} ${activeAccordion === 'placed' ? styles.active : ''}`}
            onClick={() => setActiveAccordion(activeAccordion === 'placed' ? 'available' : 'placed')}
          >
            <span>Your Cart ({placedItems.length})</span>
            <span className={styles.accordionIcon}>
              {activeAccordion === 'placed' ? '−' : '+'}
            </span>
          </button>
          {activeAccordion === 'placed' && (
            <div className={`${styles.accordionContent} ${styles.active}`}>
              <div className={styles.placedItems}>
                {placedItems.length === 0 ? (
                  <p className={styles.emptyState}>
                    No products added yet.<br /><br />Select products from the "Available Products" section to start designing your space.
                  </p>
                ) : (
                  <>
                    {placedItems.map((item) => (
                      <div
                        key={item.id}
                        className={`${styles.placedItem} ${
                          selectedItem?.id === item.id ? styles.selected : ''
                        }`}
                        onClick={() => onSelectItem(item)}
                      >
                        <div
                          className={styles.itemPreview}
                          style={{ 
                            backgroundImage: `url(${getItemImage(item.name)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            backgroundColor: item.color // Fallback color if image fails to load
                          }}
                        />
                        <div className={styles.itemInfo}>
                          <h4>{item.name}</h4>
                          <div className={styles.itemColor}>
                            <span 
                              className={styles.colorSwatch}
                              style={{ backgroundColor: item.color }}
                            />
                            <span>{getColorName(item.color)}</span>
                          </div>
                          <p>{formatCurrency(item.price)}</p>
                        </div>
                        <button
                          className={styles.removeButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveItem(item.id);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <div className={styles.wallPrice}>
                      <div className={styles.wallPriceInfo}>
                        <strong>Kerf Wall ({wallHorizontalHoles} × {wallVerticalHoles} holes)</strong>
                        <span>{formatCurrency(wallPrice)}</span>
                      </div>
                    </div>
                    <div className={styles.totalPrice}>
                      <strong>Total: {formatCurrency(totalPrice)}</strong>
                    </div>
                    <Button
                      variant="danger"
                      onClick={onClearWall}
                      className={styles.clearWallButton}
                    >
                      Clear Wall
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FurniturePanel; 