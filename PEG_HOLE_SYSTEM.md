# Peg Hole System Documentation

## Overview

The peg hole system has been redesigned to provide better precision and more intuitive furniture placement. The new system uses inches as the base unit and provides clearer alignment between furniture and peg holes.

## Key Improvements

### 1. Consistent Units
- **Base Unit**: Inches (instead of mixing feet and inches)
- **Furniture Dimensions**: All furniture dimensions are now in inches
- **Peg Hole Spacing**: 8 inches horizontally, 6 inches vertically
- **Peg Hole Size**: 1 inch wide × 3 inches tall

### 2. Enhanced Peg Hole Data
Each furniture item now has:
```typescript
pegHolesToSpan: {
  horizontal: number; // How many peg holes this furniture spans horizontally
  vertical: number;   // How many peg holes this furniture spans vertically
}
```

### 3. Improved Snapping Logic
- Furniture now snaps to peg hole positions more accurately
- Each furniture item aligns its edges with the peg hole edges
- The system calculates the optimal position based on the furniture's peg hole requirements

## Technical Details

### Peg Hole Grid Calculation
```typescript
// Grid spacing in inches
const PEG_HOLE_SPACING = {
  horizontal: 8, // 8 inches between peg holes horizontally
  vertical: 6,   // 6 inches between peg holes vertically
};

// Peg hole size in inches
const PEG_HOLE_SIZE = {
  width: 1,   // 1 inch wide
  height: 3,  // 3 inches tall
};
```

### Furniture Positioning
1. **Convert Units**: All calculations are done in inches for precision
2. **Calculate Grid**: Generate peg hole positions based on wall dimensions
3. **Find Optimal Position**: Calculate where furniture should be placed to align with peg holes
4. **Validate Position**: Ensure the position is within wall boundaries and doesn't overlap with other furniture
5. **Convert Back**: Convert final position back to Three.js units

### Example Furniture Data
```typescript
{
  id: '10x10',
  name: '10" × 10"',
  dimensions: { width: 10, height: 10, depth: 10 }, // in inches
  price: 0,
  pegHolesToSpan: { horizontal: 2, vertical: 2 }, // Spans 2×2 peg holes
}
```

## Benefits

1. **More Accurate**: Furniture now aligns precisely with peg holes
2. **Easier to Understand**: All dimensions in inches make it more intuitive
3. **Better Visualization**: Peg holes are more clearly visible and aligned
4. **Flexible**: Easy to add new furniture types with different peg hole requirements
5. **Consistent**: All components use the same peg hole calculation logic

## Migration Notes

- All furniture dimensions have been converted from feet to inches
- `pegHolesToSpan` is now an object with `horizontal` and `vertical` properties
- The snapping system is more precise and predictable
- Wall peg hole rendering uses the same calculation logic as furniture positioning 