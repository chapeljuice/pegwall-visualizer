import React, { useState } from 'react';
import { FurnitureGroup, FurnitureItem, FurnitureColor } from '../../types/furniture';
import styles from './FurniturePanel.module.css';

interface FurnitureGroupCardProps {
  group: FurnitureGroup;
  onPlaceItem: (item: FurnitureItem) => void;
  sharedSelectedColor: FurnitureColor;
  onSharedColorChange: (color: FurnitureColor) => void;
}

const FurnitureGroupCard: React.FC<FurnitureGroupCardProps> = ({
  group,
  onPlaceItem,
  sharedSelectedColor,
  onSharedColorChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(group.variants[0]);
  const [selectedColor, setSelectedColor] = useState(sharedSelectedColor);

  // Update local selected color when shared color changes
  React.useEffect(() => {
    setSelectedColor(sharedSelectedColor);
  }, [sharedSelectedColor]);

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

  const handleColorChange = (color: FurnitureColor) => {
    setSelectedColor(color);
    onSharedColorChange(color); // Update the shared color state
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
          <p className={styles.price}>Starting at {formatCurrency(group.basePrice)}</p>
        </div>
        <div className={styles.expandIcon}>
          {isExpanded ? '−' : '+'}
        </div>
      </div>

      {isExpanded && (
        <div className={styles.customizationPanel}>
          <div className={styles.customizationSection}>
            <h4>Size Options</h4>
            {group.variants.length === 1 ? (
              <div className={styles.oneSizeDisplay}>
                <span className={styles.oneSizeLabel}>One Size</span>
                <span className={styles.oneSizeDimensions}>
                  {Math.round(selectedVariant.dimensions.width * 12)}" × {Math.round(selectedVariant.dimensions.height * 12)}" × {Math.round(selectedVariant.dimensions.depth * 12)}"
                </span>
              </div>
            ) : (
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
                    <span className={styles.variantPrice}>+{formatCurrency(variant.price)}</span>
                  </button>
                ))}
              </div>
            )}
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
                  onClick={() => handleColorChange(color)}
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
              <span className={styles.totalPrice}>{formatCurrency(totalPrice)}</span>
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