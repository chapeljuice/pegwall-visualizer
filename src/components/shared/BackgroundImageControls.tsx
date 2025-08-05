import React from 'react';
import styles from './BackgroundImageControls.module.css';

interface BackgroundImageControlsProps {
  onPositionChange: (x: number, y: number, z: number) => void;
  onScaleChange: (scale: number) => void;
  onOpacityChange: (opacity: number) => void;
  position: [number, number, number];
  scale: number;
  opacity: number;
  isVisible: boolean;
}

const BackgroundImageControls: React.FC<BackgroundImageControlsProps> = ({
  onPositionChange,
  onScaleChange,
  onOpacityChange,
  position,
  scale,
  opacity,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Background Image Controls</h4>
      
      <div className={styles.section}>
        <label className={styles.label}>Position X: {position[0].toFixed(1)}</label>
        <input
          type="range"
          min="-10"
          max="10"
          step="0.1"
          value={position[0]}
          onChange={(e) => onPositionChange(parseFloat(e.target.value), position[1], position[2])}
          className={styles.slider}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Position Y: {position[1].toFixed(1)}</label>
        <input
          type="range"
          min="-5"
          max="15"
          step="0.1"
          value={position[1]}
          onChange={(e) => onPositionChange(position[0], parseFloat(e.target.value), position[2])}
          className={styles.slider}
        />
      </div>



      <div className={styles.section}>
        <label className={styles.label}>Scale: {scale.toFixed(1)}</label>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={scale}
          onChange={(e) => onScaleChange(parseFloat(e.target.value))}
          className={styles.slider}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Opacity: {opacity.toFixed(1)}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={opacity}
          onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
          className={styles.slider}
        />
      </div>

      <div className={styles.presetButtons}>
        <button 
          onClick={() => onPositionChange(0, 4, position[2])}
          className={styles.presetButton}
        >
          Center
        </button>
        <button 
          onClick={() => onScaleChange(1)}
          className={styles.presetButton}
        >
          Reset Scale
        </button>
      </div>
    </div>
  );
};

export default BackgroundImageControls; 