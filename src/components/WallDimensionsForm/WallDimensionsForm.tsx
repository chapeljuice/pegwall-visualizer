import React, { useState, useEffect } from 'react';
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
  const [localDimensions, setLocalDimensions] = useState({
    widthFeet: Math.floor(dimensions.width),
    widthInches: Math.round((dimensions.width % 1) * 12),
    heightFeet: Math.floor(dimensions.height),
    heightInches: Math.round((dimensions.height % 1) * 12),
  });

  useEffect(() => {
    setLocalDimensions({
      widthFeet: Math.floor(dimensions.width),
      widthInches: Math.round((dimensions.width % 1) * 12),
      heightFeet: Math.floor(dimensions.height),
      heightInches: Math.round((dimensions.height % 1) * 12),
    });
  }, [dimensions]);

  const handleInputChange = (field: keyof typeof localDimensions, value: number) => {
    const newLocalDimensions = { ...localDimensions, [field]: value };
    setLocalDimensions(newLocalDimensions);

    // Convert to feet and update parent
    const newWidth = newLocalDimensions.widthFeet + (newLocalDimensions.widthInches / 12);
    const newHeight = newLocalDimensions.heightFeet + (newLocalDimensions.heightInches / 12);
    
    onChange({
      width: newWidth,
      height: newHeight,
    });
  };

  const formatDimension = (feet: number, inches: number) => {
    if (inches === 0) {
      return `${feet}'`;
    }
    return `${feet}' ${inches}"`;
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        ⚙️ Wall Dimensions
      </button>
      
      {isOpen && (
        <div className={styles.form}>
          <h3>Edit Wall Dimensions</h3>
          
          <div className={styles.dimensionGroup}>
            <label>Width:</label>
            <div className={styles.inputGroup}>
              <input
                type="number"
                min="1"
                max="20"
                value={localDimensions.widthFeet}
                onChange={(e) => handleInputChange('widthFeet', parseInt(e.target.value) || 0)}
                className={styles.input}
              />
              <span className={styles.unit}>ft</span>
              <input
                type="number"
                min="0"
                max="11"
                value={localDimensions.widthInches}
                onChange={(e) => handleInputChange('widthInches', parseInt(e.target.value) || 0)}
                className={styles.input}
              />
              <span className={styles.unit}>in</span>
            </div>
            <span className={styles.display}>
              {formatDimension(localDimensions.widthFeet, localDimensions.widthInches)}
            </span>
          </div>

          <div className={styles.dimensionGroup}>
            <label>Height:</label>
            <div className={styles.inputGroup}>
              <input
                type="number"
                min="1"
                max="20"
                value={localDimensions.heightFeet}
                onChange={(e) => handleInputChange('heightFeet', parseInt(e.target.value) || 0)}
                className={styles.input}
              />
              <span className={styles.unit}>ft</span>
              <input
                type="number"
                min="0"
                max="11"
                value={localDimensions.heightInches}
                onChange={(e) => handleInputChange('heightInches', parseInt(e.target.value) || 0)}
                className={styles.input}
              />
              <span className={styles.unit}>in</span>
            </div>
            <span className={styles.display}>
              {formatDimension(localDimensions.heightFeet, localDimensions.heightInches)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WallDimensionsForm; 