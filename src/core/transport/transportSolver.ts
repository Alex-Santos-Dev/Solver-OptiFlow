import {
  TransportModel,
  TransportSolution,
  TransportInitialMethod,
  TransportStep,
  TransportSpecialCase,
} from './transportTypes';
import {
  balanceTransportModel,
  solveNorthwestCorner,
  solveLeastCost,
  solveVogel,
  handleDegeneracy,
  solveMODIOptimization,
} from './transportAlgorithms';

/**
 * Fachada del Solucionador de Problemas de Transporte (Solver IO).
 *
 * Flujo de ejecución integral:
 * 1. Balanceo Automático: Verifica si Oferta == Demanda. Si no, añade origen o destino ficticio con costo 0 y emite alerta.
 * 2. Solución Básica Factible Inicial (SBFI): Aplica Esquina Noroeste, Costo Mínimo o Vogel (VAM).
 * 3. Detección y Reparación de Degeneración: Verifica m + n - 1. Si faltan celdas, inserta épsilon (ε) e informa al usuario.
 * 4. Optimización MODI y Cruce del Arroyo: Resuelve u_i + v_j = c_ij, prueba de optimalidad y ciclos cerrados iterativos.
 * 5. Detección de Casos Especiales adicionales: Rutas prohibidas y Múltiples Soluciones Óptimas.
 */
export class TransportSolver {
  static solve(
    rawModel: TransportModel,
    initialMethod: TransportInitialMethod = 'vogel',
    optimizeWithMODI: boolean = true
  ): TransportSolution {
    const steps: TransportStep[] = [];
    const specialCases: TransportSpecialCase[] = [];

    // 1. Balanceo del modelo
    const balanceResult = balanceTransportModel(rawModel);
    const balancedModel = balanceResult.balancedModel;
    specialCases.push(...balanceResult.specialCases);

    if (balanceResult.specialCases.length > 0) {
      steps.push({
        stepNumber: steps.length + 1,
        phase: 'balancing',
        title: 'Verificación de Balanceo de Oferta y Demanda',
        description: balanceResult.specialCases[0].description,
        tableau: {
          cells: balancedModel.costs.map((row, r) =>
            row.map((c, col) => ({
              row: r,
              col,
              allocated: balancedModel.costs[r][col],
              isBasic: false,
              cost: c,
            }))
          ),
          u: Array(balancedModel.origins.length).fill(null),
          v: Array(balancedModel.destinations.length).fill(null),
          totalCost: balanceResult.balancedModel.origins[0].supply,
          basicCount: 0,
          requiredBasicCount:
            balancedModel.origins.length + balancedModel.destinations.length - 1,
          isDegenerate: false,
          isOptimal: false,
        },
        annotations: [balanceResult.specialCases[0].actionTaken],
      });
    }

    // 2. Método de Solución Básica Factible Inicial
    let initialRes;
    switch (initialMethod) {
      case 'northwest':
        initialRes = solveNorthwestCorner(balancedModel);
        break;
      case 'leastCost':
        initialRes = solveLeastCost(balancedModel);
        break;
      case 'vogel':
      default:
        initialRes = solveVogel(balancedModel);
        break;
    }

    const initialTableau = initialRes.tableau;
    steps.push(...initialRes.steps);

    // 3. Manejo de degeneración
    const degenResult = handleDegeneracy(initialTableau, balancedModel);
    if (degenResult.isDegenerate) {
      specialCases.push({
        type: 'degeneracy',
        title: 'Caso Especial: Solución Básica Factible Degenerada',
        description: `La solución inicial solo asignó ${initialTableau.basicCount - degenResult.epsilonCells.length} celdas básicas, pero la teoría de redes exige estrictamente $m + n - 1 = ${balancedModel.origins.length + balancedModel.destinations.length - 1}$ celdas para asegurar un árbol generador completo.`,
        actionTaken: `Se activó la inserción automática de ${degenResult.epsilonCells.length} celda(s) con valor infinitesimal $\\varepsilon = 0$ para poder calcular los multiplicadores $u_i$ y $v_j$ sin división indeterminada.`,
        badge: 'Degeneración (ε)',
        severity: 'warning',
      });

      if (degenResult.step) {
        degenResult.step.stepNumber = steps.length + 1;
        steps.push(degenResult.step);
      }
    }

    // 4. Optimización con MODI / Cruce del Arroyo
    if (optimizeWithMODI) {
      const modiResult = solveMODIOptimization(initialTableau, balancedModel, steps);

      if (modiResult.hasMultipleOptima) {
        specialCases.push({
          type: 'multiple_optima',
          title: 'Caso Especial: Soluciones Óptimas Múltiples (Alternativas)',
          description:
            'En el tablero óptimo final existe al menos una celda no básica cuyo costo marginal de oportunidad es exactamente cero (Δ = 0).',
          actionTaken:
            'Indica que es posible transferir flujo a lo largo de un ciclo alternativo manteniendo exactamente el mismo costo mínimo total Z*.',
          badge: 'Óptimos Múltiples (Δ = 0)',
          severity: 'purple',
        });
      }

      return {
        balancedModel,
        initialMethod,
        initialTableau,
        steps: modiResult.allSteps,
        finalTableau: modiResult.finalTableau,
        totalCost: modiResult.finalTableau.totalCost,
        isOptimal: modiResult.isOptimal,
        specialCases,
        hasMultipleOptima: modiResult.hasMultipleOptima,
        multipleOptimaCells: modiResult.multipleOptimaCells,
      };
    }

    return {
      balancedModel,
      initialMethod,
      initialTableau,
      steps,
      finalTableau: initialTableau,
      totalCost: initialTableau.totalCost,
      isOptimal: false,
      specialCases,
      hasMultipleOptima: false,
    };
  }
}
