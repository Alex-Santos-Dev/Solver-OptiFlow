import { Fraction } from '../math/fraction';
import {
  TransportModel,
  TransportSolution,
  TransportInitialMethod,
  TransportTableau,
  TransportStep,
  TransportSpecialCase,
  TransportCellAllocation,
} from './transportTypes';

/**
 * Validador y balanceador del Modelo de Transporte.
 * Si Oferta != Demanda, genera automáticamente un Origen o Destino Ficticio con costo cero
 * y registra la alerta del Caso Especial.
 */
export function balanceTransportModel(rawModel: TransportModel): {
  balancedModel: TransportModel;
  specialCases: TransportSpecialCase[];
} {
  const specialCases: TransportSpecialCase[] = [];

  let totalSupply = Fraction.ZERO;
  for (const o of rawModel.origins) {
    totalSupply = totalSupply.add(o.supply);
  }

  let totalDemand = Fraction.ZERO;
  for (const d of rawModel.destinations) {
    totalDemand = totalDemand.add(d.demand);
  }

  // Comprobar rutas prohibidas originales
  if (rawModel.prohibited && rawModel.prohibited.some((row) => row.some((p) => p))) {
    specialCases.push({
      type: 'prohibited_route',
      title: 'Rutas Prohibidas / Restringidas Detectadas',
      description:
        'El modelo contiene trayectos bloqueados o imposibles. Se les asigna una penalización de costo infinita (M) para garantizar que el algoritmo no asigne flujo en ellas.',
      actionTaken: 'Penalización con costo astronómico M en las celdas restringidas.',
      badge: 'Ruta Prohibida (M)',
      severity: 'purple',
    });
  }

  const diff = totalSupply.sub(totalDemand);

  if (diff.isZero()) {
    // Perfectamente balanceado
    return {
      balancedModel: {
        origins: rawModel.origins.map((o) => ({ ...o })),
        destinations: rawModel.destinations.map((d) => ({ ...d })),
        costs: rawModel.costs.map((row) => [...row]),
        prohibited: rawModel.prohibited ? rawModel.prohibited.map((row) => [...row]) : undefined,
      },
      specialCases,
    };
  }

  if (diff.isPositive()) {
    // Oferta > Demanda -> Crear Destino Ficticio
    const dummyDemand = diff;
    const newDestinations = [
      ...rawModel.destinations.map((d) => ({ ...d })),
      {
        id: `dest_ficticio_${rawModel.destinations.length + 1}`,
        name: `Destino Ficticio (Excedente)`,
        demand: dummyDemand,
      },
    ];

    const newCosts = rawModel.costs.map((row) => [...row, Fraction.ZERO]);
    const newProhibited = rawModel.prohibited
      ? rawModel.prohibited.map((row) => [...row, false])
      : undefined;

    specialCases.push({
      type: 'unbalanced_supply',
      title: 'Caso Especial: Problema Desbalanceado (Oferta > Demanda)',
      description: `La oferta global (${totalSupply.toString()} u) supera a la demanda requerida (${totalDemand.toString()} u) por una diferencia de ${dummyDemand.toString()} unidades.`,
      actionTaken: `Se incorporó automáticamente un "Destino Ficticio" con demanda de ${dummyDemand.toString()} u y costos de transporte $c_{i,\\text{ficticio}} = 0$ para absorber el inventario sobrante.`,
      badge: 'Desbalanceado (Destino Ficticio)',
      severity: 'warning',
    });

    return {
      balancedModel: {
        origins: rawModel.origins.map((o) => ({ ...o })),
        destinations: newDestinations,
        costs: newCosts,
        prohibited: newProhibited,
      },
      specialCases,
    };
  } else {
    // Demanda > Oferta -> Crear Origen Ficticio
    const dummySupply = diff.abs();
    const newOrigins = [
      ...rawModel.origins.map((o) => ({ ...o })),
      {
        id: `orig_ficticio_${rawModel.origins.length + 1}`,
        name: `Origen Ficticio (Déficit)`,
        supply: dummySupply,
      },
    ];

    const dummyRowCosts = rawModel.destinations.map(() => Fraction.ZERO);
    const newCosts = [...rawModel.costs.map((row) => [...row]), dummyRowCosts];
    const newProhibited = rawModel.prohibited
      ? [...rawModel.prohibited.map((row) => [...row]), rawModel.destinations.map(() => false)]
      : undefined;

    specialCases.push({
      type: 'unbalanced_demand',
      title: 'Caso Especial: Problema Desbalanceado (Demanda > Oferta)',
      description: `La demanda requerida (${totalDemand.toString()} u) supera a la capacidad disponible de las fuentes (${totalSupply.toString()} u) por ${dummySupply.toString()} unidades no cubiertas.`,
      actionTaken: `Se incorporó automáticamente un "Origen Ficticio" con capacidad de ${dummySupply.toString()} u y costos $c_{\\text{ficticio},j} = 0$ para representar la demanda insatisfecha.`,
      badge: 'Desbalanceado (Origen Ficticio)',
      severity: 'warning',
    });

    return {
      balancedModel: {
        origins: newOrigins,
        destinations: rawModel.destinations.map((d) => ({ ...d })),
        costs: newCosts,
        prohibited: newProhibited,
      },
      specialCases,
    };
  }
}

/**
 * Crea un tablero base vacío a partir del modelo.
 */
function createEmptyTableau(model: TransportModel): TransportTableau {
  const m = model.origins.length;
  const n = model.destinations.length;

  const cells: TransportCellAllocation[][] = [];
  for (let i = 0; i < m; i++) {
    const row: TransportCellAllocation[] = [];
    for (let j = 0; j < n; j++) {
      const isProhibited = model.prohibited?.[i]?.[j] ?? false;
      row.push({
        row: i,
        col: j,
        allocated: Fraction.ZERO,
        isBasic: false,
        isEpsilon: false,
        cost: model.costs[i][j],
        isProhibited,
      });
    }
    cells.push(row);
  }

  return {
    cells,
    u: Array(m).fill(null),
    v: Array(n).fill(null),
    totalCost: Fraction.ZERO,
    basicCount: 0,
    requiredBasicCount: m + n - 1,
    isDegenerate: false,
    isOptimal: false,
  };
}

/**
 * Clona de forma profunda un tablero conservando intactas las instancias de Fraction
 * (evitando JSON.stringify que falla al no poder serializar BigInt).
 */
export function cloneTableau(tableau: TransportTableau): TransportTableau {
  return {
    cells: tableau.cells.map((row) =>
      row.map((cell) => ({
        ...cell,
      }))
    ),
    u: [...tableau.u],
    v: [...tableau.v],
    totalCost: tableau.totalCost,
    basicCount: tableau.basicCount,
    requiredBasicCount: tableau.requiredBasicCount,
    isDegenerate: tableau.isDegenerate,
    isOptimal: tableau.isOptimal,
    enteringCell: tableau.enteringCell ? { ...tableau.enteringCell } : undefined,
    leavingCell: tableau.leavingCell ? { ...tableau.leavingCell } : undefined,
    theta: tableau.theta,
    cycle: tableau.cycle ? tableau.cycle.map((node) => ({ ...node })) : undefined,
    vogelPenalties: tableau.vogelPenalties
      ? {
          rowPenalties: [...tableau.vogelPenalties.rowPenalties],
          colPenalties: [...tableau.vogelPenalties.colPenalties],
          selectedType: tableau.vogelPenalties.selectedType,
          selectedIndex: tableau.vogelPenalties.selectedIndex,
        }
      : undefined,
  };
}

/**
 * Calcula el costo total de transporte para el tablero:
 * Z = sum(c_ij * x_ij)
 */
export function calculateTableauTotalCost(tableau: TransportTableau): Fraction {
  let total = Fraction.ZERO;
  for (const row of tableau.cells) {
    for (const cell of row) {
      if (cell.isBasic && !cell.isEpsilon && !cell.allocated.isZero()) {
        total = total.add(cell.cost.mul(cell.allocated));
      }
    }
  }
  return total;
}

/**
 * 1. MÉTODO DE LA ESQUINA NOROESTE (Northwest Corner Rule)
 * Recorre la matriz desde la celda superior izquierda (0,0), agotando sucesivamente
 * ofertas y demandas y desplazándose hacia la derecha o hacia abajo.
 */
export function solveNorthwestCorner(model: TransportModel): {
  tableau: TransportTableau;
  steps: TransportStep[];
} {
  const steps: TransportStep[] = [];
  const tableau = createEmptyTableau(model);
  const m = model.origins.length;
  const n = model.destinations.length;

  const remSupply = model.origins.map((o) => o.supply);
  const remDemand = model.destinations.map((d) => d.demand);

  let i = 0;
  let j = 0;
  let stepIdx = 1;

  while (i < m && j < n) {
    const s = remSupply[i];
    const d = remDemand[j];

    // Asignar el mínimo entre la oferta y demanda restante
    const alloc = s.sub(d).isPositive() ? d : s;

    tableau.cells[i][j].allocated = alloc;
    tableau.cells[i][j].isBasic = true;
    tableau.basicCount++;

    remSupply[i] = remSupply[i].sub(alloc);
    remDemand[j] = remDemand[j].sub(alloc);

    const originName = model.origins[i].name;
    const destName = model.destinations[j].name;

    steps.push({
      stepNumber: stepIdx++,
      phase: 'initial_solution',
      title: `Esquina Noroeste: Asignación en celda (${i + 1}, ${j + 1})`,
      description: `Se evalúa la celda superior izquierda disponible [${originName} → ${destName}]. Oferta disponible: ${s.toString()}, Demanda pendiente: ${d.toString()}. Se asignan ${alloc.toString()} unidades.`,
      tableau: cloneTableau(tableau),
      latexFormulas: [
        `x_{${i + 1},${j + 1}} = \\min(S_{${i + 1}}, D_{${j + 1}}) = \\min(${s.toString()}, ${d.toString()}) = ${alloc.toString()}`,
      ],
    });

    if (remSupply[i].isZero() && remDemand[j].isZero()) {
      // Caso especial: Ambos se agotan a la vez. Avanzar manteniendo consistencia de base si no es el final
      if (i < m - 1) {
        i++;
      } else {
        j++;
      }
    } else if (remSupply[i].isZero()) {
      i++; // Oferta agotada -> bajar de fila
    } else {
      j++; // Demanda satisfecha -> avanzar de columna
    }
  }

  tableau.totalCost = calculateTableauTotalCost(tableau);
  return { tableau, steps };
}

/**
 * 2. MÉTODO DEL COSTO MÍNIMO (Least Cost Method)
 * Asigna prioritariamente la máxima cantidad posible a la celda con menor costo unitario
 * de transporte no agotada en la matriz.
 */
export function solveLeastCost(model: TransportModel): {
  tableau: TransportTableau;
  steps: TransportStep[];
} {
  const steps: TransportStep[] = [];
  const tableau = createEmptyTableau(model);
  const m = model.origins.length;
  const n = model.destinations.length;

  const remSupply = model.origins.map((o) => o.supply);
  const remDemand = model.destinations.map((d) => d.demand);

  const rowExhausted = Array(m).fill(false);
  const colExhausted = Array(n).fill(false);

  let stepIdx = 1;

  while (rowExhausted.some((e) => !e) && colExhausted.some((e) => !e)) {
    // Buscar la celda con menor costo disponible
    let minCost: Fraction | null = null;
    let bestI = -1;
    let bestJ = -1;

    for (let i = 0; i < m; i++) {
      if (rowExhausted[i]) continue;
      for (let j = 0; j < n; j++) {
        if (colExhausted[j]) continue;
        if (tableau.cells[i][j].isProhibited) continue; // Omitir rutas prohibidas

        const c = tableau.cells[i][j].cost;
        if (minCost === null || c.sub(minCost).isNegative()) {
          minCost = c;
          bestI = i;
          bestJ = j;
        }
      }
    }

    // Si solo quedan celdas prohibidas pero falta asignar
    if (bestI === -1 || bestJ === -1) {
      for (let i = 0; i < m; i++) {
        if (rowExhausted[i]) continue;
        for (let j = 0; j < n; j++) {
          if (colExhausted[j]) continue;
          bestI = i;
          bestJ = j;
          break;
        }
        if (bestI !== -1) break;
      }
    }

    if (bestI === -1 || bestJ === -1) break;

    const s = remSupply[bestI];
    const d = remDemand[bestJ];
    const alloc = s.sub(d).isPositive() ? d : s;

    tableau.cells[bestI][bestJ].allocated = alloc;
    tableau.cells[bestI][bestJ].isBasic = true;
    tableau.basicCount++;

    remSupply[bestI] = remSupply[bestI].sub(alloc);
    remDemand[bestJ] = remDemand[bestJ].sub(alloc);

    const originName = model.origins[bestI].name;
    const destName = model.destinations[bestJ].name;

    steps.push({
      stepNumber: stepIdx++,
      phase: 'initial_solution',
      title: `Costo Mínimo: Asignación en celda (${bestI + 1}, ${bestJ + 1})`,
      description: `Costo unitario mínimo encontrado: $c_{${bestI + 1},${bestJ + 1}} = ${tableau.cells[bestI][bestJ].cost.toString()}$ [${originName} → ${destName}]. Se asignan ${alloc.toString()} unidades.`,
      tableau: cloneTableau(tableau),
      latexFormulas: [
        `c_{\\min} = c_{${bestI + 1},${bestJ + 1}} = ${tableau.cells[bestI][bestJ].cost.toString()}`,
        `x_{${bestI + 1},${bestJ + 1}} = \\min(${s.toString()}, ${d.toString()}) = ${alloc.toString()}`,
      ],
    });

    if (remSupply[bestI].isZero() && remDemand[bestJ].isZero()) {
      rowExhausted[bestI] = true;
      // Solo tachamos uno si quedan más elementos para preservar grados de libertad
      const remainingRows = rowExhausted.filter((r) => !r).length;
      const remainingCols = colExhausted.filter((c) => !c).length;
      if (remainingRows > 0 && remainingCols > 1) {
        colExhausted[bestJ] = true;
      }
    } else if (remSupply[bestI].isZero()) {
      rowExhausted[bestI] = true;
    } else {
      colExhausted[bestJ] = true;
    }
  }

  tableau.totalCost = calculateTableauTotalCost(tableau);
  return { tableau, steps };
}

/**
 * 3. MÉTODO DE APROXIMACIÓN DE VOGEL (VAM)
 * Calcula penalizaciones por fila y columna (diferencia entre los dos costos más pequeños).
 * Asigna prioritariamente en la fila o columna de máxima penalización a su costo mínimo.
 */
export function solveVogel(model: TransportModel): {
  tableau: TransportTableau;
  steps: TransportStep[];
} {
  const steps: TransportStep[] = [];
  const tableau = createEmptyTableau(model);
  const m = model.origins.length;
  const n = model.destinations.length;

  const remSupply = model.origins.map((o) => o.supply);
  const remDemand = model.destinations.map((d) => d.demand);

  const rowActive = Array(m).fill(true);
  const colActive = Array(n).fill(true);

  let stepIdx = 1;

  while (rowActive.some((a) => a) && colActive.some((a) => a)) {
    const activeRowCount = rowActive.filter((a) => a).length;
    const activeColCount = colActive.filter((a) => a).length;

    // Si solo queda 1 fila activa, asignar a todas sus columnas activas
    if (activeRowCount === 1) {
      const i = rowActive.indexOf(true);
      for (let j = 0; j < n; j++) {
        if (!colActive[j]) continue;
        const alloc = remDemand[j];
        tableau.cells[i][j].allocated = alloc;
        tableau.cells[i][j].isBasic = true;
        tableau.basicCount++;
        remSupply[i] = remSupply[i].sub(alloc);
        remDemand[j] = Fraction.ZERO;
        colActive[j] = false;
      }
      rowActive[i] = false;
      break;
    }

    // Si solo queda 1 columna activa, asignar a todas sus filas activas
    if (activeColCount === 1) {
      const j = colActive.indexOf(true);
      for (let i = 0; i < m; i++) {
        if (!rowActive[i]) continue;
        const alloc = remSupply[i];
        tableau.cells[i][j].allocated = alloc;
        tableau.cells[i][j].isBasic = true;
        tableau.basicCount++;
        remDemand[j] = remDemand[j].sub(alloc);
        remSupply[i] = Fraction.ZERO;
        rowActive[i] = false;
      }
      colActive[j] = false;
      break;
    }

    // 1. Calcular penalizaciones por fila
    const rowPenalties: (Fraction | null)[] = Array(m).fill(null);
    for (let i = 0; i < m; i++) {
      if (!rowActive[i]) continue;
      const costsInRow: Fraction[] = [];
      for (let j = 0; j < n; j++) {
        if (colActive[j]) costsInRow.push(tableau.cells[i][j].cost);
      }
      costsInRow.sort((a, b) => (a.sub(b).isNegative() ? -1 : a.sub(b).isZero() ? 0 : 1));
      if (costsInRow.length >= 2) {
        rowPenalties[i] = costsInRow[1].sub(costsInRow[0]);
      } else if (costsInRow.length === 1) {
        rowPenalties[i] = costsInRow[0];
      }
    }

    // 2. Calcular penalizaciones por columna
    const colPenalties: (Fraction | null)[] = Array(n).fill(null);
    for (let j = 0; j < n; j++) {
      if (!colActive[j]) continue;
      const costsInCol: Fraction[] = [];
      for (let i = 0; i < m; i++) {
        if (rowActive[i]) costsInCol.push(tableau.cells[i][j].cost);
      }
      costsInCol.sort((a, b) => (a.sub(b).isNegative() ? -1 : a.sub(b).isZero() ? 0 : 1));
      if (costsInCol.length >= 2) {
        colPenalties[j] = costsInCol[1].sub(costsInCol[0]);
      } else if (costsInCol.length === 1) {
        colPenalties[j] = costsInCol[0];
      }
    }

    // 3. Determinar la mayor penalización global
    let maxPenalty: Fraction = new Fraction(-1, 1);
    let selectedType: 'row' | 'col' = 'row';
    let selectedIdx = -1;

    for (let i = 0; i < m; i++) {
      const p = rowPenalties[i];
      if (p !== null && p.sub(maxPenalty).isPositive()) {
        maxPenalty = p;
        selectedType = 'row';
        selectedIdx = i;
      }
    }

    for (let j = 0; j < n; j++) {
      const p = colPenalties[j];
      if (p !== null && p.sub(maxPenalty).isPositive()) {
        maxPenalty = p;
        selectedType = 'col';
        selectedIdx = j;
      }
    }

    if (selectedIdx === -1) break;

    // 4. Seleccionar celda con menor costo en la línea de máxima penalización
    let bestI = -1;
    let bestJ = -1;
    let minLineCost: Fraction | null = null;

    if (selectedType === 'row') {
      bestI = selectedIdx;
      for (let j = 0; j < n; j++) {
        if (!colActive[j]) continue;
        const c = tableau.cells[bestI][j].cost;
        if (minLineCost === null || c.sub(minLineCost).isNegative()) {
          minLineCost = c;
          bestJ = j;
        }
      }
    } else {
      bestJ = selectedIdx;
      for (let i = 0; i < m; i++) {
        if (!rowActive[i]) continue;
        const c = tableau.cells[i][bestJ].cost;
        if (minLineCost === null || c.sub(minLineCost).isNegative()) {
          minLineCost = c;
          bestI = i;
        }
      }
    }

    const s = remSupply[bestI];
    const d = remDemand[bestJ];
    const alloc = s.sub(d).isPositive() ? d : s;

    tableau.cells[bestI][bestJ].allocated = alloc;
    tableau.cells[bestI][bestJ].isBasic = true;
    tableau.basicCount++;

    remSupply[bestI] = remSupply[bestI].sub(alloc);
    remDemand[bestJ] = remDemand[bestJ].sub(alloc);

    // Adjuntar penalizaciones a la instantánea
    tableau.vogelPenalties = {
      rowPenalties: [...rowPenalties],
      colPenalties: [...colPenalties],
      selectedType,
      selectedIndex: selectedIdx,
    };

    const targetDesc =
      selectedType === 'row'
        ? `Fila ${selectedIdx + 1} (${model.origins[selectedIdx].name}) con penalización $P = ${maxPenalty.toString()}$`
        : `Columna ${selectedIdx + 1} (${model.destinations[selectedIdx].name}) con penalización $P = ${maxPenalty.toString()}$`;

    steps.push({
      stepNumber: stepIdx++,
      phase: 'initial_solution',
      title: `Vogel (VAM): Penalización Máxima en ${selectedType === 'row' ? 'Fila' : 'Columna'} ${selectedIdx + 1}`,
      description: `Se calculan las penalizaciones por diferencia entre los dos menores costos. Se selecciona la ${targetDesc}. Se asigna en su costo mínimo $c_{${bestI + 1},${bestJ + 1}} = ${tableau.cells[bestI][bestJ].cost.toString()}$ una cantidad de ${alloc.toString()} unidades.`,
      tableau: cloneTableau(tableau),
      latexFormulas: [
        `P_{\\max} = ${maxPenalty.toString()}`,
        `x_{${bestI + 1},${bestJ + 1}} = \\min(${s.toString()}, ${d.toString()}) = ${alloc.toString()}`,
      ],
    });

    if (remSupply[bestI].isZero() && remDemand[bestJ].isZero()) {
      rowActive[bestI] = false;
      const leftRows = rowActive.filter((r) => r).length;
      const leftCols = colActive.filter((c) => c).length;
      if (leftRows > 0 && leftCols > 1) {
        colActive[bestJ] = false;
      }
    } else if (remSupply[bestI].isZero()) {
      rowActive[bestI] = false;
    } else {
      colActive[bestJ] = false;
    }
  }

  tableau.totalCost = calculateTableauTotalCost(tableau);
  return { tableau, steps };
}

/**
 * 4. GESTIÓN Y REPARACIÓN DE DEGENERACIÓN (Tratamiento con Épsilon)
 * Una Solución Básica Factible de Transporte requiere estrictamente m + n - 1 celdas básicas
 * que no formen un ciclo (árbol generador conexo).
 * Si faltan celdas, se asigna un valor infinitesimal ε en celdas independientes
 * para permitir el cálculo unívoco de los multiplicadores u_i y v_j de MODI.
 */
export function handleDegeneracy(
  tableau: TransportTableau,
  model: TransportModel
): { isDegenerate: boolean; epsilonCells: { row: number; col: number }[]; step?: TransportStep } {
  const m = model.origins.length;
  const n = model.destinations.length;
  const required = m + n - 1;

  // Contar celdas básicas actuales
  let currentBasicCount = 0;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (tableau.cells[i][j].isBasic) currentBasicCount++;
    }
  }

  if (currentBasicCount >= required) {
    tableau.isDegenerate = false;
    return { isDegenerate: false, epsilonCells: [] };
  }

  tableau.isDegenerate = true;
  const missingCount = required - currentBasicCount;
  const epsilonCells: { row: number; col: number }[] = [];

  // Ordenar celdas no básicas por menor costo para preferir las más económicas
  const candidates: { row: number; col: number; cost: Fraction }[] = [];
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (!tableau.cells[i][j].isBasic && !tableau.cells[i][j].isProhibited) {
        candidates.push({ row: i, col: j, cost: tableau.cells[i][j].cost });
      }
    }
  }
  candidates.sort((a, b) => (a.cost.sub(b.cost).isNegative() ? -1 : 1));

  for (const cand of candidates) {
    if (epsilonCells.length >= missingCount) break;

    // Verificar si candidate forma ciclo con las básicas existentes
    if (!createsCycle(tableau, cand.row, cand.col, m, n)) {
      tableau.cells[cand.row][cand.col].isBasic = true;
      tableau.cells[cand.row][cand.col].isEpsilon = true;
      tableau.cells[cand.row][cand.col].allocated = Fraction.ZERO;
      tableau.basicCount++;
      epsilonCells.push({ row: cand.row, col: cand.col });
    }
  }

  const step: TransportStep = {
    stepNumber: 0,
    phase: 'degeneracy_handling',
    title: 'Caso Especial Detectado: Solución Básica Degenerada',
    description: `El número de celdas básicas asignadas (${currentBasicCount}) es menor que el mínimo requerido $m + n - 1 = ${m} + ${n} - 1 = ${required}$. Para que el sistema de ecuaciones de multiplicadores MODI ($u_i + v_j = c_{ij}$) tenga solución única, se insertaron ${missingCount} celda(s) básica(s) artificial(es) con valor infinitesimal $\\varepsilon = 0$.`,
    tableau: cloneTableau(tableau),
    latexFormulas: [
      `\\text{Celdas Básicas Actuales} = ${currentBasicCount} < m + n - 1 = ${required}`,
      `\\text{Asignación de } \\varepsilon \\text{ en: } ${epsilonCells
        .map((c) => `(${c.row + 1}, ${c.col + 1})`)
        .join(', ')}`,
    ],
  };

  return { isDegenerate: true, epsilonCells, step };
}

/**
 * Comprueba si añadir una celda (candRow, candCol) crea un ciclo cerrado con las básicas existentes.
 * Utiliza detección de componentes conexas en el grafo bipartito filas-columnas.
 */
function createsCycle(
  tableau: TransportTableau,
  candRow: number,
  candCol: number,
  m: number,
  n: number
): boolean {
  // Construir grafo no dirigido de filas (0..m-1) y columnas (m..m+n-1)
  const adj: number[][] = Array.from({ length: m + n }, () => []);

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (tableau.cells[i][j].isBasic) {
        const u = i;
        const v = m + j;
        adj[u].push(v);
        adj[v].push(u);
      }
    }
  }

  // Comprobar si ya existe un camino entre candRow y (m + candCol)
  const target = m + candCol;
  const visited = Array(m + n).fill(false);
  const queue = [candRow];
  visited[candRow] = true;

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr === target) return true; // Ya estaban conectados -> formaría ciclo

    for (const neighbor of adj[curr]) {
      if (!visited[neighbor]) {
        visited[neighbor] = true;
        queue.push(neighbor);
      }
    }
  }

  return false;
}

/**
 * 5. MÉTODO MODI (Modified Distribution) Y CRUCE DEL ARROYO (Stepping Stone)
 * - Determina los multiplicadores u_i y v_j resolviendo u_i + v_j = c_ij para celdas básicas.
 * - Calcula costos de oportunidad delta_ij = u_i + v_j - c_ij para celdas no básicas.
 * - Si algún delta_ij > 0 (o c_ij - u_i - v_j < 0), la solución no es óptima.
 * - Encuentra el ciclo cerrado alternante (+ / -) y redistribuye flujo por theta = min(celdas con -).
 */
export function solveMODIOptimization(
  initialTableau: TransportTableau,
  model: TransportModel,
  initialSteps: TransportStep[]
): {
  finalTableau: TransportTableau;
  allSteps: TransportStep[];
  isOptimal: boolean;
  hasMultipleOptima: boolean;
  multipleOptimaCells: { row: number; col: number }[];
} {
  const m = model.origins.length;
  const n = model.destinations.length;
  const allSteps: TransportStep[] = [...initialSteps];

  let tableau: TransportTableau = cloneTableau(initialTableau);
  let stepCounter = allSteps.length + 1;
  let iteration = 1;
  const maxIterations = 25; // Prevenir bucles infinitos

  let hasMultipleOptima = false;
  const multipleOptimaCells: { row: number; col: number }[] = [];

  while (iteration <= maxIterations) {
    // 1. Calcular multiplicadores u_i y v_j
    computeMultipliers(tableau, m, n);

    // 2. Evaluar celdas no básicas: delta_ij = u_i + v_j - c_ij
    let maxImprovement = Fraction.ZERO;
    let enteringCell: { row: number; col: number; delta: Fraction } | null = null;
    let alternativeOptimaFoundThisRound: { row: number; col: number }[] = [];

    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        const cell = tableau.cells[i][j];
        if (!cell.isBasic) {
          const ui = tableau.u[i] ?? Fraction.ZERO;
          const vj = tableau.v[j] ?? Fraction.ZERO;
          // delta_ij representa la tasa marginal de reducción del costo si se envía flujo por (i, j)
          const delta = ui.add(vj).sub(cell.cost);
          cell.opportunityCost = delta;

          if (delta.isPositive() && delta.sub(maxImprovement).isPositive()) {
            maxImprovement = delta;
            enteringCell = { row: i, col: j, delta };
          } else if (delta.isZero()) {
            alternativeOptimaFoundThisRound.push({ row: i, col: j });
          }
        } else {
          cell.opportunityCost = Fraction.ZERO;
        }
      }
    }

    // Comprobar si se alcanzó la solución óptima
    if (!enteringCell) {
      tableau.isOptimal = true;
      tableau.totalCost = calculateTableauTotalCost(tableau);

      if (alternativeOptimaFoundThisRound.length > 0) {
        hasMultipleOptima = true;
        multipleOptimaCells.push(...alternativeOptimaFoundThisRound);
      }

      allSteps.push({
        stepNumber: stepCounter++,
        phase: 'optimal_result',
        title: `Condición de Optimalidad Alcanzada (MODI Iteración ${iteration})`,
        description: `Todos los índices de costo marginal satisfacen $\\Delta_{ij} = u_i + v_j - c_{ij} \\le 0$ (o equivalentemente $c_{ij} - u_i - v_j \\ge 0$). La distribución actual es estrictamente el costo mínimo óptimo global Z* = $${tableau.totalCost.toString()}$.`,
        tableau: cloneTableau(tableau),
        latexFormulas: [
          `\\forall (i,j) \\notin \\text{Base}: \\Delta_{ij} = u_i + v_j - c_{ij} \\le 0`,
          `Z^* = \\sum c_{ij} x_{ij} = ${tableau.totalCost.toString()}`,
        ],
      });
      break;
    }

    tableau.enteringCell = enteringCell;

    // 3. Hallar el Ciclo Cerrado de Cruce del Arroyo (Stepping Stone Loop)
    const cycle = findClosedCycle(tableau, enteringCell.row, enteringCell.col, m, n);

    if (!cycle || cycle.length < 4) {
      // Si no se pudo cerrar ciclo, detener para evitar inconsistencias
      tableau.isOptimal = true;
      break;
    }

    // 4. Determinar theta = min { celdas con signo '-' }
    let minTheta: Fraction | null = null;
    let leavingCell: { row: number; col: number } | null = null;

    for (const node of cycle) {
      if (node.sign === '-') {
        const alloc = tableau.cells[node.row][node.col].allocated;
        if (minTheta === null || alloc.sub(minTheta).isNegative()) {
          minTheta = alloc;
          leavingCell = { row: node.row, col: node.col };
        }
      }
    }

    const theta = minTheta ?? Fraction.ZERO;
    tableau.theta = theta;
    tableau.cycle = cycle;
    tableau.leavingCell = leavingCell ?? undefined;

    // Registrar paso con el ciclo visualizado
    allSteps.push({
      stepNumber: stepCounter++,
      phase: 'stepping_stone_cycle',
      title: `MODI: Ciclo del Cruce del Arroyo para Celda Entrante (${enteringCell.row + 1}, ${enteringCell.col + 1})`,
      description: `La celda (${enteringCell.row + 1}, ${enteringCell.col + 1}) tiene índice de mejora $\\Delta = ${enteringCell.delta.toString()} > 0$. Se traza un ciclo cerrado alternante (+ / -). La capacidad máxima de transferencia es $\\theta = ${theta.toString()}$. Sale de la base la celda (${(leavingCell?.row ?? 0) + 1}, ${(leavingCell?.col ?? 0) + 1}).`,
      tableau: cloneTableau(tableau),
      latexFormulas: [
        `\\Delta_{${enteringCell.row + 1},${enteringCell.col + 1}} = u_{${enteringCell.row + 1}} + v_{${enteringCell.col + 1}} - c_{${enteringCell.row + 1},${enteringCell.col + 1}} = ${enteringCell.delta.toString()}`,
        `\\theta = \\min \\{ x_{ij} \\mid \\text{signo } - \\} = ${theta.toString()}`,
      ],
    });

    // 5. Actualizar la tabla sumando y restando theta a lo largo del ciclo
    for (const node of cycle) {
      const cell = tableau.cells[node.row][node.col];
      if (node.sign === '+') {
        cell.allocated = cell.allocated.add(theta);
        cell.isBasic = true;
        cell.isEpsilon = false;
      } else {
        cell.allocated = cell.allocated.sub(theta);
        if (cell.row === leavingCell?.row && cell.col === leavingCell?.col) {
          cell.isBasic = false;
          cell.isEpsilon = false;
        } else if (cell.allocated.isZero()) {
          // Si empata a 0, se mantiene como básico con epsilon para preservar árbol generador
          cell.isEpsilon = true;
        }
      }
    }

    // Limpiar marcadores transitorios
    for (const row of tableau.cells) {
      for (const cell of row) {
        delete cell.cycleSign;
      }
    }
    delete tableau.cycle;
    delete tableau.enteringCell;
    delete tableau.leavingCell;
    delete tableau.theta;

    tableau.totalCost = calculateTableauTotalCost(tableau);
    iteration++;
  }

  return {
    finalTableau: tableau,
    allSteps,
    isOptimal: tableau.isOptimal,
    hasMultipleOptima,
    multipleOptimaCells,
  };
}

/**
 * Calcula los multiplicadores u_i y v_j mediante propagación por componentes conexas.
 * Ecuación para celdas básicas: u_i + v_j = c_ij
 */
function computeMultipliers(tableau: TransportTableau, m: number, n: number) {
  tableau.u = Array(m).fill(null);
  tableau.v = Array(n).fill(null);

  // Elegir la fila con mayor número de celdas básicas para fijar u_i = 0
  let maxBasics = -1;
  let startRow = 0;
  for (let i = 0; i < m; i++) {
    let count = 0;
    for (let j = 0; j < n; j++) {
      if (tableau.cells[i][j].isBasic) count++;
    }
    if (count > maxBasics) {
      maxBasics = count;
      startRow = i;
    }
  }

  tableau.u[startRow] = Fraction.ZERO;

  let progress = true;
  while (progress) {
    progress = false;

    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (!tableau.cells[i][j].isBasic) continue;
        const cij = tableau.cells[i][j].cost;

        // Si u_i es conocido pero v_j no: v_j = c_ij - u_i
        if (tableau.u[i] !== null && tableau.v[j] === null) {
          tableau.v[j] = cij.sub(tableau.u[i]!);
          progress = true;
        }
        // Si v_j es conocido pero u_i no: u_i = c_ij - v_j
        else if (tableau.v[j] !== null && tableau.u[i] === null) {
          tableau.u[i] = cij.sub(tableau.v[j]!);
          progress = true;
        }
      }
    }

    // Si aún quedan filas o columnas nulas en caso de grafo desconectado
    if (!progress) {
      const unassignedRow = tableau.u.findIndex((u) => u === null);
      if (unassignedRow !== -1) {
        tableau.u[unassignedRow] = Fraction.ZERO;
        progress = true;
      }
    }
  }
}

/**
 * Encuentra el ciclo cerrado alternante (Stepping Stone) para una celda entrante
 * usando reducción por podas de hojas en el subgrafo de celdas candidatas.
 */
function findClosedCycle(
  tableau: TransportTableau,
  startRow: number,
  startCol: number,
  m: number,
  n: number
): { row: number; col: number; sign: '+' | '-' }[] | null {
  // Matriz de vértices activos para el ciclo (básicas + entrante)
  const inCycle = Array.from({ length: m }, () => Array(n).fill(false));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (tableau.cells[i][j].isBasic || (i === startRow && j === startCol)) {
        inCycle[i][j] = true;
      }
    }
  }

  // Poda iterativa: todo vértice que sea el único en su fila o el único en su columna no puede pertenecer a un ciclo
  let pruned = true;
  while (pruned) {
    pruned = false;

    // Revisar filas
    for (let i = 0; i < m; i++) {
      let count = 0;
      let lastJ = -1;
      for (let j = 0; j < n; j++) {
        if (inCycle[i][j]) {
          count++;
          lastJ = j;
        }
      }
      if (count === 1 && (i !== startRow || lastJ !== startCol)) {
        inCycle[i][lastJ] = false;
        pruned = true;
      }
    }

    // Revisar columnas
    for (let j = 0; j < n; j++) {
      let count = 0;
      let lastI = -1;
      for (let i = 0; i < m; i++) {
        if (inCycle[i][j]) {
          count++;
          lastI = i;
        }
      }
      if (count === 1 && (lastI !== startRow || j !== startCol)) {
        inCycle[lastI][j] = false;
        pruned = true;
      }
    }
  }

  // Recorrer el ciclo alternando desplazamientos horizontales y verticales
  const path: { row: number; col: number; sign: '+' | '-' }[] = [
    { row: startRow, col: startCol, sign: '+' },
  ];

  let currRow = startRow;
  let currCol = startCol;
  let moveHorizontal = true;

  while (true) {
    let nextRow = -1;
    let nextCol = -1;

    if (moveHorizontal) {
      for (let j = 0; j < n; j++) {
        if (j !== currCol && inCycle[currRow][j]) {
          // Si podemos regresar a la meta
          if (currRow === startRow && j === startCol && path.length >= 4) {
            return path;
          }
          if (!path.some((p) => p.row === currRow && p.col === j)) {
            nextRow = currRow;
            nextCol = j;
            break;
          }
        }
      }
    } else {
      for (let i = 0; i < m; i++) {
        if (i !== currRow && inCycle[i][currCol]) {
          if (i === startRow && currCol === startCol && path.length >= 4) {
            return path;
          }
          if (!path.some((p) => p.row === i && p.col === currCol)) {
            nextRow = i;
            nextCol = currCol;
            break;
          }
        }
      }
    }

    if (nextRow === -1 && nextCol === -1) {
      // Verificar si regresamos al inicio
      if (moveHorizontal && inCycle[currRow][startCol] && path.length >= 3) {
        path.push({
          row: currRow,
          col: startCol,
          sign: path.length % 2 === 0 ? '+' : '-',
        });
        return path;
      }
      break;
    }

    path.push({
      row: nextRow,
      col: nextCol,
      sign: path.length % 2 === 0 ? '+' : '-',
    });

    currRow = nextRow;
    currCol = nextCol;
    moveHorizontal = !moveHorizontal;

    if (path.length > m * n + 2) break; // Límite de seguridad
  }

  return path.length >= 4 ? path : null;
}
