import React from 'react';
import ReactDOM from 'react-dom/client';
import Visualizer from './Visualizer';
import Editor from './Editor.js';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <Editor />
      <Visualizer />
  </React.StrictMode>
);
