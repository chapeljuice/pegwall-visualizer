import React from 'react';
import { Recommendation } from '../../utils/recommendationEngine';
import styles from './Recommendations.module.css';
import { Button } from '../shared';

interface RecommendationsProps {
  recommendations: Recommendation[];
  onApplyRecommendation: (recommendation: Recommendation) => void;
  onDismiss: (recommendationId: string) => void;
  onClose: () => void;
}

const Recommendations: React.FC<RecommendationsProps> = ({
  recommendations,
  onApplyRecommendation,
  onDismiss,
  onClose,
}) => {
  if (recommendations.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h3 className={styles.title}>
              🧠 Smart Suggestions
            </h3>
            <p className={styles.subtitle}>
              Based on your layout and preferences
            </p>
          </div>
          <Button variant="ghost" size="small" onClick={onClose} className={styles.closeButton}>
            ×
          </Button>
        </div>
        
        <div className={styles.recommendationsList}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💡</div>
            <h4 className={styles.emptyTitle}>No suggestions yet</h4>
            <p className={styles.emptyDescription}>
              Add some furniture items to your wall to see personalized recommendations!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'suggestion':
        return '💡';
      case 'combination':
        return '🔗';
      case 'layout':
        return '📐';
      case 'color':
        return '🎨';
      default:
        return '💡';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#4CAF50'; // Green
    if (confidence >= 0.6) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h3 className={styles.title}>
            🧠 Smart Suggestions
          </h3>
          <p className={styles.subtitle}>
            Based on your layout and preferences
          </p>
        </div>
        <Button variant="ghost" size="small" onClick={onClose} className={styles.closeButton}>
          ×
        </Button>
      </div>
      
      <div className={styles.recommendationsList}>
        {recommendations.slice(0, 3).map((recommendation) => (
          <div key={recommendation.id} className={styles.recommendationCard}>
            <div className={styles.recommendationHeader}>
              <span className={styles.icon}>
                {getRecommendationIcon(recommendation.type)}
              </span>
              <div className={styles.confidenceBar}>
                <div 
                  className={styles.confidenceFill}
                  style={{ 
                    width: `${recommendation.confidence * 100}%`,
                    backgroundColor: getConfidenceColor(recommendation.confidence)
                  }}
                />
              </div>
            </div>
            
            <h4 className={styles.recommendationTitle}>
              {recommendation.title}
            </h4>
            
            <p className={styles.recommendationDescription}>
              {recommendation.description}
            </p>
            
            <div className={styles.recommendationActions}>
              <Button
                variant="primary"
                onClick={() => onApplyRecommendation(recommendation)}
                className={styles.applyButton}
              >
                Try This
              </Button>
              <Button
                variant="ghost"
                onClick={() => onDismiss(recommendation.id)}
                className={styles.dismissButton}
              >
                Dismiss
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations; 