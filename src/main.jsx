import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './components/visual/ThemeContext.jsx';
import MotionProvider from './components/visual/MotionProvider.jsx';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <ThemeProvider>
      <MotionProvider>
        <App />
      </MotionProvider>
    </ThemeProvider>
  </React.StrictMode>
);
