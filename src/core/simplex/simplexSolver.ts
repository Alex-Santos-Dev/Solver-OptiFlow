import { LPModel } from '../parser/lpTypes';
import { SimplexResult } from './simplexTypes';
import { BigMSimplexSolver } from './bigMSimplex';
import { TwoPhaseSimplexSolver } from './twoPhaseSimplex';

/**
 * Variantes soportadas para resolver problemas que requieren variables artificiales:
 * - 'bigM': Método de la Gran M (penalizaciones en la función objetivo).
 * - 'twoPhase': Método de las Dos Fases (minimizar artificiales en Fase 1, optimizar Z en Fase 2).
 */
export type SimplexMethodOption = 'bigM' | 'twoPhase';

/**
 * Clase SimplexSolver (Centro de Coordinación del Método Simplex)
 * ---------------------------------------------------------------
 * Determina inteligentemente qué algoritmo aplicar en función de la estructura
 * del problema:
 * 1. Si todas las restricciones son '<=' con lado derecho no negativo, ejecuta Simplex Estándar.
 * 2. Si existen restricciones '>=' o '=', delega según la opción del usuario:
 *    - 'bigM': Método de la Gran M.
 *    - 'twoPhase': Método de las Dos Fases.
 */
export class SimplexSolver {
  /**
   * Resuelve el modelo lineal con el método simplex seleccionado.
   * @param model Modelo lineal analizado
   * @param method Variante deseada ('bigM' o 'twoPhase')
   * @returns Resultado con el paso a paso detallado y la solución final
   */
  static solve(model: LPModel, method: SimplexMethodOption = 'bigM'): SimplexResult {
    // Verificar si el problema requiere variables artificiales
    const hasGeOrEq = model.constraints.some((c) => c.operator === '>=' || c.operator === '=');

    if (!hasGeOrEq) {
      // Simplex estándar puro (no hay artificiales que penalizar)
      return BigMSimplexSolver.solve(model);
    }

    if (method === 'twoPhase') {
      return TwoPhaseSimplexSolver.solve(model);
    } else {
      return BigMSimplexSolver.solve(model);
    }
  }
}
