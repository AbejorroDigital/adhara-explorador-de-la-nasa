
/**
 * @file index.tsx
 * @description Punto de entrada principal de la aplicación Adhara.
 * Se encarga de inicializar React y montar el componente raíz en el DOM.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Búsqueda del elemento raíz en el HTML para el montaje de la aplicación
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("No se pudo encontrar el elemento raíz para montar la aplicación");
}

/**
 * Inicialización del renderizado de React en modo estricto para detectar
 * efectos secundarios y comportamientos obsoletos durante el desarrollo.
 */
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
