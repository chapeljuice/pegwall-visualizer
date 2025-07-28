import React, { useState } from 'react';
import { FurnitureItem as FurnitureItemType } from '../../types/furniture';
import styles from './FurniturePanel.module.css';

interface FurniturePanelProps {
  onPlaceItem: (item: FurnitureItemType) => void;
  placedItems: FurnitureItemType[];
  selectedItem: FurnitureItemType | null;
  onRemoveItem: (id: string) => void;
  onSelectItem: (item: FurnitureItemType | null) => void;
}

const FurniturePanel: React.FC<FurniturePanelProps> = ({
  onPlaceItem,
  placedItems,
  selectedItem,
  onRemoveItem,
  onSelectItem,
}) => {
  const [activeTab, setActiveTab] = useState<'available' | 'placed'>('available');

  const availableItems: FurnitureItemType[] = [
    {
      id: 'cubby-1',
      name: 'Cubby - 10" x 10"',
      type: 'storage',
      dimensions: { width: 0.83, height: 0.83, depth: 0.83 }, // 10" x 10" x 10" in feet
      color: '#8B4513',
      material: 'plywood',
      price: 79,
      position: [0, 0, 0],
    },
    {
      id: 'cubby-2',
      name: 'Cubby - 20" x 10"',
      type: 'storage',
      dimensions: { width: 1.67, height: 0.83, depth: 0.83 }, // 20" x 10" x 10" in feet
      color: '#8B4513',
      material: 'plywood',
      price: 129,
      position: [0, 0, 0],
    },
  ];

  const totalPrice = placedItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2>PegWall Designer</h2>
        <div className={styles.instructions}>
          <p>Click items to place them on the wall. Drag to move them around!</p>
          <p>Furniture snaps to a 16" × 8" grid.</p>
        </div>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'available' ? styles.active : ''}`}
            onClick={() => setActiveTab('available')}
          >
            Available Items
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'placed' ? styles.active : ''}`}
            onClick={() => setActiveTab('placed')}
          >
            Placed Items ({placedItems.length})
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
                  style={{ backgroundColor: item.color }}
                >
                  <div className={styles.itemDimensions}>
                    {item.dimensions.width}×{item.dimensions.height}×{item.dimensions.depth}m
                  </div>
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
                No items placed yet. Select items from the "Available Items" tab to start designing your space.
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
                      style={{ backgroundColor: item.color }}
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FurniturePanel; 