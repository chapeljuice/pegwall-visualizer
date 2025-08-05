import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import FurnitureVisualizer from './components/FurnitureVisualizer/FurnitureVisualizer';
import PrintLayout from './components/PrintLayout/PrintLayout';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<FurnitureVisualizer />} />
          <Route path="/print" element={<PrintLayout wallDimensions={undefined} placedItems={undefined} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
