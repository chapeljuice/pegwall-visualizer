import React, { useState } from 'react';
import { FurnitureItem as FurnitureItemType } from '../../types/furniture';
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

  const availableItems: FurnitureItemType[] = [
    {
      id: 'cubby-1',
      name: 'Cubby - 10" x 10"',
      type: 'storage',
      dimensions: { width: 0.83, height: 0.83, depth: 0.83 }, // 10" x 10" x 10" in feet
      color: '#F5F5DC',
      material: 'plywood',
      price: 210,
      position: [0, 0, 0],
      pegHolesToSpan: 2, // Spans 2 peg holes (8" + 2" = 10")
    },
    {
      id: 'cubby-2',
      name: 'Cubby - 20" x 10"',
      type: 'storage',
      dimensions: { width: 1.67, height: 0.83, depth: 0.83 }, // 20" x 10" x 10" in feet
      color: '#F5F5DC',
      material: 'plywood',
      price: 310,
      position: [0, 0, 0],
      pegHolesToSpan: 3, // Spans 3 peg holes (8" + 8" + 4" = 20")
    },
    {
      id: 'hook-1',
      name: 'Hook',
      type: 'hook',
      dimensions: { width: 0.083, height: 0.67, depth: 0.42 }, // 1" x 8" x 5" in feet
      color: '#F5F5DC',
      material: 'plywood',
      price: 25,
      position: [0, 0, 0],
      pegHolesToSpan: 1, // Spans 1 peg hole (1" wide)
    },
    {
      id: 'table-1',
      name: 'Table',
      type: 'table',
      dimensions: { width: 3.17, height: 2.42, depth: 5.0 }, // 38" x 29" x 60" in feet (rotated)
      color: '#8B4513',
      material: 'oak',
      price: 1535,
      position: [0, 0, 0],
      pegHolesToSpan: 4, // Spans 4 peg holes
    },
  ];

  const totalPrice = placedItems.reduce((sum, item) => sum + item.price, 0);

  // Function to get the appropriate image for each furniture item
  const getItemImage = (itemName: string): string => {
    switch (itemName) {
      case 'Cubby - 10" x 10"':
        return '/images/products/cubby-10x10.jpg';
      case 'Cubby - 20" x 10"':
        return '/images/products/cubby-20x10.jpg';
      case 'Hook':
        return '/images/products/hook.jpg';
      case 'Table':
        return '/images/products/table.jpg';
      default:
        return '/images/products/cubby-10x10.jpg'; // Default fallback
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2>Peg Hole Wall Designer</h2>
        <div className={styles.instructions}>
          <p>Click a product to place it on the wall. Drag to move them around!</p>
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
            {availableItems.map((item) => (
              <div
                key={item.id}
                className={styles.itemCard}
                onClick={() => onPlaceItem(item)}
              >
                <div
                  className={styles.itemPreview}
                  style={{ 
                    backgroundImage: `url(${getItemImage(item.name)})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: 'white'
                  }}
                >
                </div>
                <div className={styles.itemInfo}>
                  <h3>{item.name}</h3>
                  <p className={styles.material}>{item.material}</p>
                  <p className={styles.price}>${item.price}</p>
                </div>
              </div>
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