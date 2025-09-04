// Peg hole grid constants (in inches)
export const PEG_HOLE_SPACING = {
  horizontal: 8, // 8 inches between peg holes horizontally
  vertical: 6,   // 6 inches between peg holes vertically
};

export const PEG_HOLE_SIZE = {
  width: 1,   // 1 inch wide
  height: 3,  // 3 inches tall
};

// Convert inches to Three.js units (1 unit = 1 foot = 12 inches)
export const inchesToUnits = (inches: number): number => {
  return inches / 12;
};

// Convert Three.js units to inches
export const unitsToInches = (units: number): number => {
  return units * 12;
};

// Convert inch dimensions to Three.js units for rendering
export const convertDimensionsToUnits = (dimensions: { width: number; height: number; depth: number }) => {
  return {
    width: inchesToUnits(dimensions.width),
    height: inchesToUnits(dimensions.height),
    depth: inchesToUnits(dimensions.depth),
  };
};

// Calculate peg hole grid positions for a given wall size
export const calculatePegHoleGrid = (wallWidthInches: number, wallHeightInches: number) => {
  const horizontalPositions: number[] = [];
  const verticalPositions: number[] = [];

  // Calculate number of peg holes based on wall dimensions
  // Wall width = (horizontal holes × 8") + 6" margin (3" on each side)
  // Wall height = (vertical holes × 6") + 4" margin (2" on top and bottom)
  const horizontalCount = Math.round((wallWidthInches - 6) / 8);
  const verticalCount = Math.round((wallHeightInches - 4) / 6);

  // Calculate margins to center the peg holes on the wall
  const totalHorizontalSpace = horizontalCount * PEG_HOLE_SPACING.horizontal;
  const totalVerticalSpace = verticalCount * PEG_HOLE_SPACING.vertical;
  
  const horizontalMargin = (wallWidthInches - totalHorizontalSpace) / 2;
  const verticalMargin = (wallHeightInches - totalVerticalSpace) / 2;

  // Generate horizontal positions (centered)
  for (let i = 0; i < horizontalCount; i++) {
    const x = -wallWidthInches / 2 + horizontalMargin + (i * PEG_HOLE_SPACING.horizontal) + PEG_HOLE_SPACING.horizontal / 2;
    horizontalPositions.push(x);
  }

  // Generate vertical positions (centered)
  for (let i = 0; i < verticalCount; i++) {
    const y = verticalMargin + (i * PEG_HOLE_SPACING.vertical) + PEG_HOLE_SPACING.vertical / 2;
    verticalPositions.push(y);
  }

  return { horizontalPositions, verticalPositions };
};

// Calculate the correct width for furniture based on peg hole spans
export const calculateFurnitureWidth = (horizontalSlots: number): number => {
  // Width = (number of slots × 1") + (number of spacings × 8")
  const slotWidth = 1; // 1 inch per slot
  const spacingWidth = 8; // 8 inches between slots
  const numberOfSpacings = horizontalSlots - 1;
  
  return (horizontalSlots * slotWidth) + (numberOfSpacings * spacingWidth);
};

// Calculate the correct height for furniture based on peg hole spans
export const calculateFurnitureHeight = (verticalSlots: number, horizontalSlots: number, originalHeight: number): number => {
  // Use the original height - don't recalculate based on peg holes
  return originalHeight;
};

// Calculate the optimal position for furniture to align with peg holes
export const calculateFurniturePosition = (
  pegHolesToSpan: { horizontal: number; vertical: number },
  targetPosition: [number, number],
  wallWidthInches: number,
  wallHeightInches: number
): [number, number] => {
  const { horizontalPositions, verticalPositions } = calculatePegHoleGrid(wallWidthInches, wallHeightInches);
  
  // Convert target position from Three.js units to inches
  const targetXInches = unitsToInches(targetPosition[0]);
  const targetYInches = unitsToInches(targetPosition[1]);
  
  let closestX = 0;
  let closestY = 0;
  let minDistance = Infinity;

  // Calculate effective boundaries based on the actual peg hole positions
  // Allow furniture to align with the edges of the peg holes
  const effectiveWallLeft = horizontalPositions[0] - PEG_HOLE_SIZE.width / 2;
  const effectiveWallRight = horizontalPositions[horizontalPositions.length - 1] + PEG_HOLE_SIZE.width / 2;
  const effectiveWallBottom = verticalPositions[0] - PEG_HOLE_SIZE.height / 2;
  const effectiveWallTop = verticalPositions[verticalPositions.length - 1] + PEG_HOLE_SIZE.height / 2;

  // Try each possible peg hole position as the anchor
  for (let i = 0; i <= horizontalPositions.length - pegHolesToSpan.horizontal; i++) {
    for (let j = 0; j <= verticalPositions.length - pegHolesToSpan.vertical; j++) {
      // Calculate the position where furniture should be placed
      // Furniture should align its edges with the peg hole edges
      const firstPegHoleX = horizontalPositions[i];
      const firstPegHoleY = verticalPositions[j];
      
      // Position furniture so its left edge aligns with the first peg hole's left edge
      const furnitureX = firstPegHoleX - PEG_HOLE_SIZE.width / 2;
      const furnitureY = firstPegHoleY - PEG_HOLE_SIZE.height / 2;
      
      // Calculate the actual furniture dimensions based on peg hole spans
      const furnitureWidthInches = calculateFurnitureWidth(pegHolesToSpan.horizontal);
      const furnitureHeightInches = calculateFurnitureHeight(pegHolesToSpan.vertical, pegHolesToSpan.horizontal, 10); // Use default height
      
      // Check if position is within reasonable bounds
      // Allow furniture to extend slightly beyond the peg hole grid for larger items
      // But be more restrictive for very large items
      const margin = Math.min(2, Math.max(0.5, (effectiveWallRight - effectiveWallLeft - furnitureWidthInches) / 4));
      if (
        furnitureX >= effectiveWallLeft - margin &&
        furnitureX + furnitureWidthInches <= effectiveWallRight + margin &&
        furnitureY >= effectiveWallBottom - margin &&
        furnitureY + furnitureHeightInches <= effectiveWallTop + margin
      ) {
        const distance = Math.sqrt(
          (targetXInches - furnitureX) ** 2 + 
          (targetYInches - furnitureY) ** 2
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestX = furnitureX;
          closestY = furnitureY;
        }
      }
    }
  }

  // Convert back to Three.js units
  return [inchesToUnits(closestX), inchesToUnits(closestY)];
};

// Check if a furniture position is valid (within bounds and doesn't overlap)
export const isValidFurniturePosition = (
  pegHolesToSpan: { horizontal: number; vertical: number },
  position: [number, number],
  wallWidthInches: number,
  wallHeightInches: number,
  furnitureHeightInches: number,
  otherFurniture: Array<{
    position: [number, number];
    dimensions: { width: number; height: number };
  }>
): boolean => {
  const [x, y] = position;
  
  // Convert to inches for calculations
  const furnitureXInches = unitsToInches(x);
  const furnitureYInches = unitsToInches(y);
  
  // Calculate the actual furniture dimensions based on peg hole spans
  const furnitureWidthInches = calculateFurnitureWidth(pegHolesToSpan.horizontal);
  // Use the passed furniture height parameter
  
  // Check wall boundaries - use peg hole grid boundaries
  const { horizontalPositions, verticalPositions } = calculatePegHoleGrid(wallWidthInches, wallHeightInches);
  const effectiveWallLeft = horizontalPositions[0] - PEG_HOLE_SIZE.width / 2;
  const effectiveWallRight = horizontalPositions[horizontalPositions.length - 1] + PEG_HOLE_SIZE.width / 2;
  const effectiveWallBottom = verticalPositions[0] - PEG_HOLE_SIZE.height / 2;
  const effectiveWallTop = verticalPositions[verticalPositions.length - 1] + PEG_HOLE_SIZE.height / 2;
  
  if (
    furnitureXInches < effectiveWallLeft ||
    furnitureXInches + furnitureWidthInches > effectiveWallRight ||
    furnitureYInches < effectiveWallBottom ||
    furnitureYInches + furnitureHeightInches > effectiveWallTop
  ) {
    return false;
  }
  
  // Check overlap with other furniture
  for (const other of otherFurniture) {
    const otherXInches = unitsToInches(other.position[0]);
    const otherYInches = unitsToInches(other.position[1]);
    
    if (
      furnitureXInches < otherXInches + other.dimensions.width &&
      furnitureXInches + furnitureWidthInches > otherXInches &&
      furnitureYInches < otherYInches + other.dimensions.height &&
      furnitureYInches + furnitureHeightInches > otherYInches
    ) {
      return false;
    }
  }
  
  return true;
}; 

// Calculate the price of the Peg wall based on grid size
export const calculateWallPrice = (horizontalHoles: number, verticalHoles: number): number => {
  // Base price for 3x4 wall: $165
  // Price for 25x16 wall: $4450
  // Calculate price per hole and apply to total holes
  
  const baseHoles = 3 * 4; // 12 holes for base price
  const maxHoles = 25 * 16; // 400 holes for max price
  
  const basePrice = 165;
  const maxPrice = 4450;
  
  const currentHoles = horizontalHoles * verticalHoles;
  
  if (currentHoles <= baseHoles) {
    return basePrice;
  }
  
  if (currentHoles >= maxHoles) {
    return maxPrice;
  }
  
  // Linear interpolation between base and max prices
  const pricePerHole = (maxPrice - basePrice) / (maxHoles - baseHoles);
  const additionalHoles = currentHoles - baseHoles;
  
  return Math.round(basePrice + (additionalHoles * pricePerHole));
};

// Get wall dimensions from peg hole counts
export const getWallDimensionsFromHoles = (horizontalHoles: number, verticalHoles: number) => {
  const widthInches = (horizontalHoles * 8) + 6; // 8" spacing + 6" margin (3" on each side)
  const heightInches = (verticalHoles * 6) + 4;  // 6" spacing + 4" margin (2" on top and bottom)
  
  return {
    width: widthInches / 12, // Convert to feet
    height: heightInches / 12, // Convert to feet
  };
}; 