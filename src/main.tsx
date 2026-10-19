import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

/**
 * Punto de entrada principal (Entry Point) de la aplicación React.
 *
 * Monta el componente raíz `App` en el contenedor DOM con id `root`.
 * Utiliza `StrictMode` para habilitar verificaciones estrictas y advertencias
 * en el ciclo de desarrollo sobre efectos secundarios y buenas prácticas de React 19.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
