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
      id: 'shelf-1',
      name: 'Floating Shelf',
      type: 'shelf',
      dimensions: { width: 2, height: 0.2, depth: 0.5 },
      color: '#8B4513',
      material: 'plywood',
      price: 89,
      position: [0, 0, 0],
    },
    {
      id: 'table-1',
      name: 'Coffee Table',
      type: 'table',
      dimensions: { width: 1.2, height: 0.4, depth: 0.6 },
      color: '#D2691E',
      material: 'oak',
      price: 299,
      position: [0, 0, 0],
    },
    {
      id: 'dining-table-1',
      name: 'Wall-Mount Dining Table',
      type: 'table',
      dimensions: { width: 5, height: 2.42, depth: 3.17 }, // 60" x 29" x 38" in feet
      color: '#CD853F',
      material: 'walnut',
      price: 399,
      position: [0, 0, 0],
    },
    {
      id: 'chair-1',
      name: 'Dining Chair',
      type: 'chair',
      dimensions: { width: 0.5, height: 0.9, depth: 0.5 },
      color: '#CD853F',
      material: 'walnut',
      price: 149,
      position: [0, 0, 0],
    },
    {
      id: 'cabinet-1',
      name: 'Storage Cabinet',
      type: 'cabinet',
      dimensions: { width: 0.8, height: 1.8, depth: 0.4 },
      color: '#A0522D',
      material: 'maple',
      price: 399,
      position: [0, 0, 0],
    },
    {
      id: 'desk-1',
      name: 'Work Desk',
      type: 'desk',
      dimensions: { width: 1.4, height: 0.75, depth: 0.7 },
      color: '#8B7355',
      material: 'plywood',
      price: 249,
      position: [0, 0, 0],
    },
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