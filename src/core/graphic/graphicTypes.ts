import { Fraction } from '../math/fraction';

/**
 * Representa un punto geométrico o vértice en el plano cartesiano 2D.
 */
export interface GraphicPoint {
  /** Coordenada X exacta en Fracción */
  x: Fraction;

  /** Coordenada Y exacta en Fracción */
  y: Fraction;

  /** Coordenada X decimal (para renderizado en Canvas) */
  xNum: number;

  /** Coordenada Y decimal (para renderizado en Canvas) */
  yNum: number;

  /** Valor de la función objetivo Z(x, y) en este punto como Fracción */
  zValue: Fraction;

  /** Valor numérico de Z (para comparaciones rápidas) */
  zNum: number;

  /** Indica si este punto es el vértice óptimo (o uno de los óptimos) */
  isOptimal: boolean;

  /** Etiqueta alfabética del vértice (ej: "A", "B", "C") */
  label?: string;

  /** Nombres de las rectas o restricciones cuya intersección generó este punto */
  sourceConstraints: string[];
}

/**
 * Representa una recta de restricción en el plano 2D: a*x + b*y = c
 */
export interface GraphicLine {
  /** Identificador de la restricción (ej: "R1") */
  id: string;

  /** Etiqueta completa (ej: "R1: 2x1 + x2 <= 100") */
  label: string;

  /** Coeficiente de la primera variable (eje X) */
  a: Fraction;

  /** Coeficiente de la segunda variable (eje Y) */
  b: Fraction;

  /** Lado derecho (RHS) de la ecuación */
  c: Fraction;

  /** Operador original de la inecuación ('<=', '>=', '=') */
  operator: '<=' | '>=' | '=';

  /** Color hexadecimal para trazar la recta en el canvas */
  color: string;

  /** Punto de corte con el eje X (y = 0): (c/a, 0) o null si es paralela al eje X */
  xIntercept: Fraction | null;

  /** Punto de corte con el eje Y (x = 0): (0, c/b) o null si es paralela al eje Y */
  yIntercept: Fraction | null;
}

/**
 * Resultado completo del análisis mediante el Método Gráfico 2D.
 */
export interface GraphicSolution {
  /** Indica si el problema tiene exactamente 2 variables para representarse en 2D */
  is2D: boolean;

  /** Nombres de las dos variables que componen los ejes [Eje X, Eje Y] */
  variables: [string, string];

  /** Lista de todas las rectas de restricción trazadas */
  lines: GraphicLine[];

  /** Vértices factibles ordenados que conforman el polígono de soluciones factibles */
  feasibleVertices: GraphicPoint[];

  /** Vértices en los cuales la función objetivo alcanza su valor óptimo */
  optimalVertices: GraphicPoint[];

  /** Indica si la región factible es acotada (cerrada) o no acotada (abierta al infinito) */
  isBounded: boolean;

  /** Estado de la solución: óptimo, infactible, no acotado u óptimos múltiples */
  status: 'optimal' | 'infeasible' | 'unbounded' | 'alternative_optima';

  /** Mensaje explicativo para el usuario */
  statusMessage: string;

  /** Valor óptimo analítico Z* */
  optimalValue: Fraction | null;

  /** Límites de coordenadas para el encuadre y zoom automático del Canvas */
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };

  /** Desglose pedagógico de los pasos teóricos del método gráfico */
  steps: {
    stepNumber: number;
    title: string;
    description: string;
    latexFormula?: string;
  }[];
}
