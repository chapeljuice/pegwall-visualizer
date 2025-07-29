import React, { useState } from 'react';
import { FurnitureItem as FurnitureItemType, FurnitureGroup, SHARED_COLORS } from '../../types/furniture';
import FurnitureGroupCard from './FurnitureGroupCard';
import styles from './FurniturePanel.module.css';

interface FurniturePanelProps {
  onPlaceItem: (item: FurnitureItemType) => void;
  placedItems: FurnitureItemType[];
  selectedItem: FurnitureItemType | null;
  onRemoveItem: (id: string) => void;
  onSelectItem: (item: FurnitureItemType | null) => void;
  onClearWall: () => void;
}

const FurniturePanel: React.FC<FurniturePanelProps> = ({
  onPlaceItem,
  placedItems,
  selectedItem,
  onRemoveItem,
  onSelectItem,
  onClearWall,
}) => {
  const [activeTab, setActiveTab] = useState<'available' | 'placed'>('available');
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
          dimensions: { width: 0.83, height: 0.83, depth: 0.83 },
          price: 0,
          pegHolesToSpan: 2,
        },
        {
          id: '10x16',
          name: '10" × 16"',
          dimensions: { width: 0.83, height: 1.67, depth: 0.83 },
          price: 60,
          pegHolesToSpan: 2,
        },
        {
          id: '20x10',
          name: '20" × 10"',
          dimensions: { width: 1.67, height: 0.83, depth: 0.83 },
          price: 100,
          pegHolesToSpan: 3,
        },
        {
          id: '20x16',
          name: '20" × 16"',
          dimensions: { width: 1.67, height: 1.33, depth: 0.83 },
          price: 165,
          pegHolesToSpan: 3,
        },
        {
          id: '40x10',
          name: '39" × 10"',
          dimensions: { width: 3.33, height: 0.83, depth: 0.83 },
          price: 305,
          pegHolesToSpan: 5,
        },
        {
          id: '39x16',
          name: '40" × 16"',
          dimensions: { width: 3.33, height: 1.33, depth: 0.83 },
          price: 365,
          pegHolesToSpan: 4,
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
          dimensions: { width: 0.083, height: 0.67, depth: 0.42 },
          price: 0,
          pegHolesToSpan: 1,
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
          dimensions: { width: 3.17, height: 2.42, depth: 5.0 },
          price: 0,
          pegHolesToSpan: 4,
        },
      ],
      colors: SHARED_COLORS,
    },
  ];

  const totalPrice = placedItems.reduce((sum, item) => sum + item.price, 0);

  // Function to get the appropriate image for each furniture item
  const getItemImage = (itemName: string): string => {
    if (itemName.includes('Cubby')) {
      return '/images/products/cubby-10x10.jpg';
    } else if (itemName.includes('Hook')) {
      return '/images/products/hook.jpg';
    } else if (itemName.includes('Table')) {
      return '/images/products/table.jpg';
    }
    return '/images/products/cubby-10x10.jpg'; // Default fallback
  };

  // Function to get color name from hex code
  const getColorName = (hexCode: string): string => {
    const color = SHARED_COLORS.find(c => c.hexCode === hexCode);
    return color ? color.name : 'Unknown Color';
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2>Peg Hole Wall Designer</h2>
        <div className={styles.instructions}>
          <p>Click a product group to see customization options. Drag placed items to move them around!</p>
          <p>Furniture snaps to a 16" × 8" grid.</p>
        </div>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'available' ? styles.active : ''}`}
            onClick={() => setActiveTab('available')}
          >
            Available Products
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'placed' ? styles.active : ''}`}
            onClick={() => setActiveTab('placed')}
          >
            View Cart ({placedItems.length})
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {activeTab === 'available' ? (
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
        ) : (
          <div className={styles.placedItems}>
            {placedItems.length === 0 ? (
              <p className={styles.emptyState}>
                No products added yet.<br /><br />Select products from the "Available Products" tab to start designing your space.
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
                      <p>${item.price}</p>
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
                <div className={styles.totalPrice}>
                  <strong>Total: ${totalPrice}</strong>
                </div>
                <button
                  className={styles.clearWallButton}
                  onClick={onClearWall}
                >
                  Clear Wall
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FurniturePanel; 