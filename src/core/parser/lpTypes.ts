import { Fraction } from '../math/fraction';

/**
 * Tipo de objetivo de optimización:
 * - 'max': Maximización (beneficios, ingresos, rendimiento)
 * - 'min': Minimización (costos, tiempo, distancias, desperdicios)
 */
export type ObjectiveType = 'max' | 'min';

/**
 * Operadores relacionales de restricciones en programación lineal:
 * - '<=': Menor o igual (asociado a variables de holgura s_i >= 0)
 * - '>=': Mayor o igual (asociado a variables de exceso e_i >= 0 y artificiales a_i >= 0)
 * - '=': Igualdad estricta (asociado a variables artificiales a_i >= 0)
 */
export type ConstraintOperator = '<=' | '>=' | '=';

/**
 * Representa una restricción individual del modelo:
 * Ejemplo: 2x1 + 3x2 <= 18
 */
export interface LPConstraint {
  /** Identificador único o etiqueta de la restricción (ej: "R1", "R2") */
  id: string;

  /** Mapa de coeficientes por variable: { "x1": Fraction(2), "x2": Fraction(3) } */
  coefficients: Record<string, Fraction>;

  /** Operador de la inecuación o ecuación ('<=', '>=', '=') */
  operator: ConstraintOperator;

  /** Lado derecho (Right-Hand Side, RHS) de la restricción como Fracción exacta */
  rhs: Fraction;
}

/**
 * Representa el modelo completo de Programación Lineal (LP):
 * Max/Min Z = c1*x1 + c2*x2 + ...
 * sujeto a:
 *   A * x (<=, >=, =) b
 *   x >= 0
 */
export interface LPModel {
  /** Tipo de optimización: 'max' o 'min' */
  objectiveType: ObjectiveType;

  /** Coeficientes de la función objetivo: { "x1": Fraction(3), "x2": Fraction(5) } */
  objectiveCoefficients: Record<string, Fraction>;

  /** Lista de restricciones estructurales del problema */
  constraints: LPConstraint[];

  /** Lista ordenada de variables de decisión encontradas (ej: ['x1', 'x2']) */
  variables: string[];

  /** Condición de no negatividad: indica si x_j >= 0 para todas las variables */
  nonNegativity: boolean;
}

/**
 * Detalle de error en caso de fallo al analizar la sintaxis del problema ingresado.
 */
export interface ParseError {
  line?: number;
  message: string;
}
