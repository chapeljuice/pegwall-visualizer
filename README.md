# PegWall - Furniture Visualization App

A modern web application for visualizing plywood furniture in 3D space. Built with React, TypeScript, and Three.js.

## Features

- **3D Visualization**: Interactive 3D scene with realistic furniture rendering
- **Drag & Drop**: Place furniture items on walls and floors
- **Furniture Catalog**: Browse available furniture items with specifications
- **Real-time Pricing**: See total cost of your furniture selection
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with CSS Modules

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **3D Graphics**: Three.js with React Three Fiber
- **Styling**: CSS Modules for component-scoped styles
- **Build Tool**: Create React App

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pegwall
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/
│   ├── FurnitureVisualizer/     # Main 3D visualization component
│   ├── FurniturePanel/          # Side panel for furniture selection
│   ├── FurnitureItem/           # Individual furniture item component
│   └── Wall/                    # 3D wall and floor components
├── types/
│   └── furniture.ts             # TypeScript interfaces
└── App.tsx                      # Main application component
```

## Usage

1. **Browse Furniture**: Use the "Available Items" tab to see furniture options
2. **Place Items**: Click on any furniture item to place it in the 3D scene
3. **Move Items**: Click and drag placed items to reposition them
4. **Select Items**: Click on placed items to select them (highlighted in green)
5. **Remove Items**: Use the "×" button to remove items from the scene
6. **View Total**: Check the total price of your furniture selection

## Available Furniture

- **Floating Shelves**: Perfect for displaying books and decor
- **Coffee Tables**: Sturdy tables for living rooms
- **Dining Chairs**: Comfortable seating for meals
- **Storage Cabinets**: Organized storage solutions
- **Work Desks**: Professional workspace furniture

## Development

### Adding New Furniture

1. Add furniture data to the `availableItems` array in `FurniturePanel.tsx`
2. Define dimensions, materials, and pricing
3. The 3D rendering will automatically adapt to the new specifications

### Styling

- All components use CSS Modules for scoped styling
- Global styles are in `App.css`
- Component-specific styles are in `.module.css` files

### 3D Scene

- The scene includes walls, floor, and grid lines for reference
- Lighting is configured for realistic furniture visualization
- Orbit controls allow camera movement around the scene

## Future Enhancements

- **Backend Integration**: User accounts, saved designs, and order processing
- **Authentication**: User login and profile management
- **Advanced 3D Features**: Texture mapping, realistic materials
- **Collaboration**: Share designs with others
- **Export Options**: Generate images or 3D models of designs
- **AR Integration**: View furniture in your actual space

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue in the repository.
