import { Fraction } from '../math/fraction';
import { BigMValue } from '../math/bigM';

/**
 * Estado del algoritmo Simplex en cualquier punto de la resolución:
 * - 'iterating': Iteraciones intermedias en progreso.
 * - 'optimal': Solución óptima única encontrada.
 * - 'alternative_optima': Múltiples soluciones óptimas (infinitas soluciones).
 * - 'unbounded': Problema no acotado (Z crece o decrece indefinidamente).
 * - 'infeasible': Problema infactible (no existe solución que cumpla las restricciones).
 */
export type SimplexStatus = 'iterating' | 'optimal' | 'unbounded' | 'infeasible' | 'alternative_optima';

/**
 * Representa una fila individual dentro de la tabla Simplex (Tableau).
 */
export interface TableauRow {
  /** Nombre de la variable básica actual de este renglón (ej: "s1", "x2", "a1") */
  basicVar: string;

  /** Coeficientes de cada columna en este renglón expresados como BigMValue */
  coefficients: Record<string, BigMValue>;

  /** Valor de la solución del renglón (lado derecho o RHS) */
  rhs: BigMValue;

  /**
   * Cociente mínimo / razón theta calculada para este renglón:
   * theta_i = b_i / a_ik (solo para a_ik > 0).
   * Si a_ik <= 0, es null (no califica para salir de la base).
   */
  ratio: Fraction | null;
}

/**
 * Información detallada del elemento pivote seleccionado en la iteración.
 */
export interface PivotInfo {
  /** Índice del renglón pivote seleccionado por la razón mínima */
  rowIndex: number;

  /** Nombre de la columna pivote (variable que ingresa a la base) */
  colName: string;

  /** Valor numérico del elemento pivote en la intersección de la fila y columna */
  value: BigMValue;

  /** Nombre de la variable entrante a la base */
  enteringVar: string;

  /** Nombre de la variable saliente de la base */
  leavingVar: string;

  /** Valor de la razón mínima theta = min(b_i / a_ik) */
  minimumRatio: Fraction;
}

/**
 * Representa un paso completo del algoritmo Simplex, listo para mostrarse en la UI.
 */
export interface SimplexStep {
  /** Número secuencial del paso (1, 2, 3...) */
  stepNumber: number;

  /** Título descriptivo (ej: "Tabla Inicial", "Iteración 1", "Fase 2: Tabla Inicial") */
  title: string;

  /** Explicación detallada de las decisiones tomadas en este paso */
  description: string;

  /** Matriz completa de la tabla Simplex en este paso */
  tableau: {
    /** Encabezados de todas las columnas (variables de decisión, holgura, exceso, artificiales) */
    columns: string[];

    /** Lista de renglones de restricciones */
    rows: TableauRow[];

    /** Fila de la función objetivo (Renglón Z o Renglón W en Fase 1) */
    zRow: {
      coefficients: Record<string, BigMValue>;
      rhs: BigMValue;
    };
  };

  /** Información del pivote si se va a realizar una iteración siguiente */
  pivot?: PivotInfo;

  /** Lista de operaciones elementales de fila de Gauss-Jordan aplicadas */
  rowOperations: string[];

  /** Estado actual de la tabla */
  status: SimplexStatus;
}

/**
 * Resultado global de la ejecución del algoritmo Simplex.
 */
export interface SimplexResult {
  /** Variante utilizada: Simplex Estándar, Gran M o Dos Fases */
  method: 'standard' | 'bigM' | 'twoPhase';

  /** Estado final de la solución */
  status: SimplexStatus;

  /** Mensaje interpretativo para el estudiante o evaluador */
  statusMessage: string;

  /** Colección completa de pasos e iteraciones */
  steps: SimplexStep[];

  /** Valor numérico óptimo de la función objetivo Z* (o null si es infactible/no acotado) */
  optimalValue: Fraction | null;

  /** Valores óptimos de las variables de decisión (x1*, x2*, ...) */
  variableValues: Record<string, Fraction>;

  /** Valores finales de las variables de holgura y exceso */
  slackValues: Record<string, Fraction>;

  /** Valores finales de las variables artificiales */
  artificialValues: Record<string, Fraction>;

  /** Ecuaciones del modelo convertidas a forma estándar con variables auxiliares */
  standardFormEquations: string[];

  /** Precios sombra / duales asociados a cada restricción */
  dualPrices?: Record<string, Fraction>;

  /** Pasos específicos de la Fase 1 (en el Método de Dos Fases) */
  phase1Steps?: SimplexStep[];

  /** Pasos específicos de la Fase 2 (en el Método de Dos Fases) */
  phase2Steps?: SimplexStep[];
}
