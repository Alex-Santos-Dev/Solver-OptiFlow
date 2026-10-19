import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Propiedades del componente LatexMath.
 */
interface LatexMathProps {
  /** Cadena de texto con código LaTeX matemático a renderizar (ej: "\\frac{3}{4}x_1 + x_2 \\le 10") */
  math: string;
  /** Si es true, renderiza en modo bloque centrado (displayMode). Si es false, renderiza en línea (inline). Por defecto false. */
  block?: boolean;
  /** Clases CSS adicionales de Tailwind o personalizadas */
  className?: string;
}

/**
 * Componente LatexMath.
 *
 * Renderiza expresiones matemáticas con tipografía académica de alta calidad mediante KaTeX.
 * Utiliza un `useRef` directo hacia el nodo DOM para invocar `katex.render()`, garantizando
 * máxima velocidad de renderizado sin recargar React ni generar fugas de memoria.
 *
 * Si la sintaxis LaTeX contiene errores, captura la excepción y muestra el texto plano como fallback seguro.
 */
export const LatexMath: React.FC<LatexMathProps> = ({ math, block = false, className = '' }) => {
  // Referencia al elemento HTML contenedor donde KaTeX inyectará los elementos MathML / HTML
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        // Invoca el motor de renderizado KaTeX de forma síncrona y eficiente
        katex.render(math, containerRef.current, {
          displayMode: block,
          throwOnError: false, // Evita lanzar errores en consola si hay una fórmula incompleta durante la escritura
        });
      } catch (err) {
        // En caso de falla catastrófica de sintaxis, muestra la cadena original sin romper la interfaz
        containerRef.current.innerText = math;
      }
    }
  }, [math, block]);

  return <span ref={containerRef} className={`latex-container ${className}`} />;
};
