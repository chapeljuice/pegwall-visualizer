import React, { useState } from 'react';
import { FurnitureGroup, FurnitureItem } from '../../types/furniture';
import styles from './FurniturePanel.module.css';

interface FurnitureGroupCardProps {
  group: FurnitureGroup;
  onPlaceItem: (item: FurnitureItem) => void;
}

const FurnitureGroupCard: React.FC<FurnitureGroupCardProps> = ({
  group,
  onPlaceItem,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(group.variants[0]);
  const [selectedColor, setSelectedColor] = useState(group.colors[0]);

  const handlePlaceItem = () => {
    const item: FurnitureItem = {
      id: `${group.id}-${selectedVariant.id}-${selectedColor.id}`,
      name: `${group.name} - ${selectedVariant.name}`,
      type: group.type,
      dimensions: selectedVariant.dimensions,
      color: selectedColor.hexCode,
      material: group.material,
      price: group.basePrice + selectedVariant.price + selectedColor.price,
      position: [0, 0, 0],
      pegHolesToSpan: selectedVariant.pegHolesToSpan,
    };
    onPlaceItem(item);
  };

  const totalPrice = group.basePrice + selectedVariant.price + selectedColor.price;

  return (
    <div className={styles.groupCard}>
      <div 
        className={styles.groupCardHeader}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div
          className={styles.groupPreview}
          style={{ 
            backgroundImage: `url(${group.imagePath})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'white'
          }}
        />
        <div className={styles.groupInfo}>
          <h3>{group.name}</h3>
          <p className={styles.description}>{group.description}</p>
          <p className={styles.material}>{group.material}</p>
          <p className={styles.price}>Starting at ${group.basePrice}</p>
        </div>
        <div className={styles.expandIcon}>
          {isExpanded ? '−' : '+'}
        </div>
      </div>

      {isExpanded && (
        <div className={styles.customizationPanel}>
          <div className={styles.customizationSection}>
            <h4>Size Options</h4>
            <div className={styles.variantGrid}>
              {group.variants.map((variant) => (
                <button
                  key={variant.id}
                  className={`${styles.variantOption} ${
                    selectedVariant.id === variant.id ? styles.selected : ''
                  }`}
                  onClick={() => setSelectedVariant(variant)}
                >
                  <span className={styles.variantName}>{variant.name}</span>
                  <span className={styles.variantPrice}>+${variant.price}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.customizationSection}>
            <h4>Color Options</h4>
            <div className={styles.colorGrid}>
              {group.colors.map((color) => (
                <button
                  key={color.id}
                  className={`${styles.colorOption} ${
                    selectedColor.id === color.id ? styles.selected : ''
                  }`}
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color.hexCode }}
                  title={color.name}
                >
                  {selectedColor.id === color.id && (
                    <span className={styles.checkmark}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.selectedOptions}>
            <div className={styles.selectedInfo}>
              <span>Selected: {selectedVariant.name} in {selectedColor.name}</span>
            </div>
            <div className={styles.priceAndButton}>
              <span className={styles.totalPrice}>${totalPrice}</span>
              <button
                className={styles.addToWallButton}
                onClick={handlePlaceItem}
              >
                Add to Wall
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FurnitureGroupCard; 