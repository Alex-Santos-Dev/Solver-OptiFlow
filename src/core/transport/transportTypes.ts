import { Fraction } from '../math/fraction';

/**
 * Método inicial para obtener una Solución Básica Factible Inicial (SBFI).
 */
export type TransportInitialMethod = 'northwest' | 'leastCost' | 'vogel';

/**
 * Método de optimización y prueba de optimalidad.
 */
export type TransportOptMethod = 'modi' | 'steppingStone';

/**
 * Tipos de casos especiales en problemas de transporte.
 */
export type TransportSpecialCaseType =
  | 'unbalanced_supply' // Oferta > Demanda (requiere destino ficticio)
  | 'unbalanced_demand' // Demanda > Oferta (requiere origen ficticio)
  | 'degeneracy'        // Asignaciones básicas < m + n - 1 (requiere epsilon)
  | 'multiple_optima'   // Celda no básica con delta = 0 en tabla óptima
  | 'prohibited_route'; // Ruta bloqueada con penalización M

/**
 * Estructura de un caso especial detectado y activado.
 */
export interface TransportSpecialCase {
  type: TransportSpecialCaseType;
  title: string;
  description: string;
  actionTaken: string;
  badge: string;
  severity: 'info' | 'warning' | 'purple' | 'emerald';
}

/**
 * Modelo de entrada de un Problema de Transporte.
 */
export interface TransportModel {
  /** Lista de orígenes con nombre y capacidad de oferta */
  origins: { id: string; name: string; supply: Fraction }[];
  /** Lista de destinos con nombre y requisito de demanda */
  destinations: { id: string; name: string; demand: Fraction }[];
  /** Matriz de costos unitarios de transporte C[i][j] */
  costs: Fraction[][];
  /** Matriz booleana de rutas prohibidas (si true, costo M / bloqueada) */
  prohibited?: boolean[][];
}

/**
 * Función para clonar profundamente un TransportModel sin perder instancias de Fraction.
 */
export function cloneTransportModel(model: TransportModel): TransportModel {
  return {
    origins: model.origins.map((o) => ({ ...o })),
    destinations: model.destinations.map((d) => ({ ...d })),
    costs: model.costs.map((row) => [...row]),
    prohibited: model.prohibited ? model.prohibited.map((row) => [...row]) : undefined,
  };
}

/**
 * Información de una celda individual en el tablero de transporte.
 */
export interface TransportCellAllocation {
  row: number;
  col: number;
  /** Cantidad de flujo asignado (0 si no básica, a menos que sea epsilon) */
  allocated: Fraction;
  /** Indica si la celda pertenece a la base actual */
  isBasic: boolean;
  /** Indica si la celda es una asignación artificial infinitesimal (épsilon) para resolver degeneración */
  isEpsilon?: boolean;
  /** Costo unitario original */
  cost: Fraction;
  /** Es una ruta prohibida */
  isProhibited?: boolean;
  /** Índice de evaluación o costo marginal delta_ij = u_i + v_j - c_ij (o c_ij - u_i - v_j) */
  opportunityCost?: Fraction;
  /** Si forma parte del ciclo cerrado de cruce del arroyo (+ o -) */
  cycleSign?: '+' | '-';
}

/**
 * Estado completo de un tablero matricial de transporte en una iteración.
 */
export interface TransportTableau {
  /** Celdas con asignaciones y costos */
  cells: TransportCellAllocation[][];
  /** Multiplicadores de fila u_i del Método MODI */
  u: (Fraction | null)[];
  /** Multiplicadores de columna v_j del Método MODI */
  v: (Fraction | null)[];
  /** Costo total de transporte en este paso: Z = sum(c_ij * x_ij) */
  totalCost: Fraction;
  /** Cantidad de celdas básicas (debe ser m + n - 1) */
  basicCount: number;
  /** Requisito m + n - 1 */
  requiredBasicCount: number;
  /** ¿Es degenerada la tabla actual? */
  isDegenerate: boolean;
  /** ¿Cumple el criterio de optimalidad? */
  isOptimal: boolean;
  /** Celda entrante seleccionada para el paso actual */
  enteringCell?: { row: number; col: number; delta: Fraction };
  /** Celda saliente del ciclo */
  leavingCell?: { row: number; col: number };
  /** Monto de reasignación theta en el ciclo */
  theta?: Fraction;
  /** Coordenadas del ciclo cerrado de cruce del arroyo */
  cycle?: { row: number; col: number; sign: '+' | '-' }[];
  /** Penalizaciones por fila y columna (exclusivo de Vogel) */
  vogelPenalties?: {
    rowPenalties: (Fraction | null)[];
    colPenalties: (Fraction | null)[];
    selectedType?: 'row' | 'col';
    selectedIndex?: number;
  };
}

/**
 * Registro de un paso didáctico en la resolución.
 */
export interface TransportStep {
  stepNumber: number;
  phase:
    | 'balancing'
    | 'initial_solution'
    | 'degeneracy_handling'
    | 'modi_multipliers'
    | 'optimality_test'
    | 'stepping_stone_cycle'
    | 'optimal_result';
  title: string;
  description: string;
  tableau: TransportTableau;
  latexFormulas?: string[];
  annotations?: string[];
}

/**
 * Resultado completo del motor de transporte.
 */
export interface TransportSolution {
  /** Modelo balanceado tras aplicar orígenes o destinos ficticios si procedía */
  balancedModel: TransportModel;
  /** Método de solución inicial empleado */
  initialMethod: TransportInitialMethod;
  /** Tablero resultante de la fase inicial */
  initialTableau: TransportTableau;
  /** Pasos detallados de todo el proceso iterativo */
  steps: TransportStep[];
  /** Tablero óptimo final */
  finalTableau: TransportTableau;
  /** Costo mínimo total óptimo alcanzado */
  totalCost: Fraction;
  /** Indicador de si el costo total es óptimo */
  isOptimal: boolean;
  /** Lista de casos especiales detectados y su gestión */
  specialCases: TransportSpecialCase[];
  /** Soluciones óptimas alternativas si existen */
  hasMultipleOptima: boolean;
  multipleOptimaCells?: { row: number; col: number }[];
}
