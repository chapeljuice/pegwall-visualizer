import React, { useState, useEffect } from 'react';
import { calculateWallPrice } from '../../utils/pegHoleUtils';
import { Button } from '../shared';
import styles from './WallDimensionsForm.module.css';

interface WallDimensionsFormProps {
  dimensions: {
    width: number; // in feet
    height: number; // in feet
  };
  onChange: (dimensions: { width: number; height: number }) => void;
}

const WallDimensionsForm: React.FC<WallDimensionsFormProps> = ({ dimensions, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Calculate current peg hole counts from wall dimensions
  // Wall width = (horizontal holes × 8") + 6" margin (3" on each side)
  // Wall height = (vertical holes × 6") + 4" margin (2" on top and bottom)
  // So: horizontal holes = (wall width inches - 6) / 8
  // And: vertical holes = (wall height inches - 4) / 6
  const wallWidthInches = dimensions.width * 12;
  const wallHeightInches = dimensions.height * 12;
  const horizontalHoles = Math.max(3, Math.round((wallWidthInches - 6) / 8));
  const verticalHoles = Math.max(4, Math.round((wallHeightInches - 4) / 6));
  
  const [localDimensions, setLocalDimensions] = useState({
    horizontalHoles: horizontalHoles,
    verticalHoles: verticalHoles,
  });

  useEffect(() => {
    const wallWidthInches = dimensions.width * 12;
    const wallHeightInches = dimensions.height * 12;
    const horizontalHoles = Math.max(3, Math.round((wallWidthInches - 6) / 8));
    const verticalHoles = Math.max(4, Math.round((wallHeightInches - 4) / 6));
    
    setLocalDimensions({
      horizontalHoles: horizontalHoles,
      verticalHoles: verticalHoles,
    });
  }, [dimensions]);

  const handleInputChange = (field: keyof typeof localDimensions, value: number) => {
    const newLocalDimensions = { ...localDimensions, [field]: value };
    setLocalDimensions(newLocalDimensions);

    // Convert peg holes back to wall dimensions
    // Each peg hole is 8 inches apart horizontally, 6 inches apart vertically
    // Add some margin for the wall edges
    const newWidthInches = (newLocalDimensions.horizontalHoles * 8) + 6; // 6" margin (3" on each side)
    const newHeightInches = (newLocalDimensions.verticalHoles * 6) + 4; // 4" margin (2" on top and bottom)
    
    const newWidth = newWidthInches / 12; // Convert to feet
    const newHeight = newHeightInches / 12; // Convert to feet
    
    onChange({
      width: newWidth,
      height: newHeight,
    });
  };

  // Calculate wall price based on current grid size
  const wallPrice = calculateWallPrice(localDimensions.horizontalHoles, localDimensions.verticalHoles);

  const formatPegHoles = (horizontal: number, vertical: number) => {
    return `${horizontal} × ${vertical} slots`;
  };

  return (
    <div className={styles.container}>
                    <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className={styles.toggleButton}
      >
        ⚙️ Peg Wall Grid
      </Button>
      
      {isOpen && (
        <div className={styles.form}>
          <h3>Edit Peg Wall Grid</h3>
          <p>This is the basic building block of the Peg Wall system. Panels are hung on the wall using metal strut, creating a sturdy, modular platform to hang the Peg Wall accessories from. All hardware is included.<br /><br />Panels sizes are based on the spacing of the slots, and all of our standard size combinations are represented on this page. Of course, DIYers are encouraged to make modifications on their own. The panels are just plywood and can be cut on site as needed. For example, the edges of panels can be trimmed to precisely fit your space and holes can be cut to access outlets that would otherwise get covered up.</p>
          <div className={styles.dimensionGroup}>
            <label>Horizontal Slots:</label>
            <div className={styles.inputGroup}>
              <input
                type="number"
                min="3"
                max="25"
                value={localDimensions.horizontalHoles}
                onChange={(e) => handleInputChange('horizontalHoles', parseInt(e.target.value) || 3)}
                className={styles.input}
              />
              <span className={styles.unit}>slots</span>
            </div>
          </div>

          <div className={styles.dimensionGroup}>
            <label>Vertical Slots:</label>
            <div className={styles.inputGroup}>
              <input
                type="number"
                min="4"
                max="16"
                value={localDimensions.verticalHoles}
                onChange={(e) => handleInputChange('verticalHoles', parseInt(e.target.value) || 4)}
                className={styles.input}
              />
              <span className={styles.unit}>slots</span>
            </div>
            <span className={styles.display}>
              {formatPegHoles(localDimensions.horizontalHoles, localDimensions.verticalHoles)}
            </span>
          </div>
          
          <div className={styles.priceDisplay}>
            <span className={styles.priceLabel}>Price:</span>
            <span className={styles.priceValue}>${wallPrice.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WallDimensionsForm; 