import { Fraction } from '../math/fraction';
import { LPModel } from '../parser/lpTypes';
import { GraphicLine, GraphicPoint, GraphicSolution } from './graphicTypes';

/** Paleta de colores armoniosa para diferenciar las rectas de restricción */
const PALETTE = [
  '#3b82f6', // Azul
  '#10b981', // Esmeralda
  '#f59e0b', // Ámbar
  '#ec4899', // Rosa
  '#8b5cf6', // Violeta
  '#06b6d4', // Cian
  '#f97316', // Naranja
  '#14b8a6', // Turquesa
];

/**
 * Clase GraphicSolver (Método Gráfico en 2 Dimensiones)
 * -------------------------------------------------------------
 * Aplica el Método Gráfico para problemas de Programación Lineal con 2 variables:
 *
 * 1. Convierte cada inecuación en una recta límite: a*x + b*y = c.
 * 2. Calcula los puntos de corte con los ejes (interceptos).
 * 3. Resuelve analíticamente los sistemas 2x2 entre todos los pares de rectas (Regla de Cramer).
 * 4. Filtra los puntos que satisfacen simultáneamente todas las restricciones y la no negatividad
 *    (Vértices o Puntos Extremos de la Región Factible).
 * 5. Ordena los vértices en sentido antihorario respecto a su centroide para formar el polígono convexo.
 * 6. Por el Teorema Fundamental de la Programación Lineal, evalúa Z en cada vértice para
 *    hallar el punto óptimo (o detectar óptimos múltiples, región no acotada o infactible).
 */
export class GraphicSolver {
  /**
   * Resuelve el modelo 2D y calcula la región factible y los vértices.
   * @param model Modelo de Programación Lineal
   * @returns Estructura completa GraphicSolution con polígono, vértices y pasos pedagógicos
   */
  static solve(model: LPModel): GraphicSolution {
    const isMax = model.objectiveType === 'max';
    const vars = model.variables;

    // Validación dimensional: el método gráfico requiere exactamente 2 variables
    if (vars.length !== 2) {
      return {
        is2D: false,
        variables: [vars[0] || 'x1', vars[1] || 'x2'],
        lines: [],
        feasibleVertices: [],
        optimalVertices: [],
        isBounded: false,
        status: 'infeasible',
        statusMessage: `El método gráfico requiere exactamente 2 variables en el plano cartesiano. Este problema tiene ${vars.length} variables (${vars.join(', ')}). Utiliza el Método Simplex (Lineal) para resolverlo.`,
        optimalValue: null,
        bounds: { minX: 0, maxX: 10, minY: 0, maxY: 10 },
        steps: [],
      };
    }

    const [xVar, yVar] = [vars[0], vars[1]];
    const c1 = model.objectiveCoefficients[xVar] || Fraction.ZERO;
    const c2 = model.objectiveCoefficients[yVar] || Fraction.ZERO;

    // =========================================================================
    // PASO 1: CONVERSIÓN DE RESTRICCIONES EN RECTAS E INTERCEPTOS
    // =========================================================================
    const lines: GraphicLine[] = [];
    let colorIdx = 0;

    for (let i = 0; i < model.constraints.length; i++) {
      const c = model.constraints[i];
      const a = c.coefficients[xVar] || Fraction.ZERO;
      const b = c.coefficients[yVar] || Fraction.ZERO;
      const rhs = c.rhs;

      // Si ambos coeficientes son cero, no define una recta en 2D
      if (a.isZero() && b.isZero()) continue;

      // Intercepto con el eje X: se hace y = 0 => x = c / a
      const xInt = !a.isZero() ? rhs.div(a) : null;

      // Intercepto con el eje Y: se hace x = 0 => y = c / b
      const yInt = !b.isZero() ? rhs.div(b) : null;

      lines.push({
        id: c.id,
        label: `${c.id}: ${a.toString()} ${xVar} + ${b.toString()} ${yVar} ${c.operator} ${rhs.toString()}`,
        a,
        b,
        c: rhs,
        operator: c.operator,
        color: PALETTE[colorIdx++ % PALETTE.length],
        xIntercept: xInt,
        yIntercept: yInt,
      });
    }

    // Incluir las rectas de los ejes de coordenadas para no negatividad:
    // x = 0 (Eje Y) y y = 0 (Eje X)
    interface BoundaryLine {
      id: string;
      a: Fraction;
      b: Fraction;
      c: Fraction;
    }

    const allBoundaryLines: BoundaryLine[] = lines.map((l) => ({
      id: l.id,
      a: l.a,
      b: l.b,
      c: l.c,
    }));

    if (model.nonNegativity) {
      allBoundaryLines.push({ id: 'Eje Y (x=0)', a: Fraction.ONE, b: Fraction.ZERO, c: Fraction.ZERO });
      allBoundaryLines.push({ id: 'Eje X (y=0)', a: Fraction.ZERO, b: Fraction.ONE, c: Fraction.ZERO });
    }

    // =========================================================================
    // PASO 2: CÁLCULO DE TODAS LAS INTERSECCIONES POR PARES (REGLA DE CRAMER)
    // =========================================================================
    // Sistema 2x2:
    //   l1.a * x + l1.b * y = l1.c
    //   l2.a * x + l2.b * y = l2.c
    // Determinante: D = l1.a * l2.b - l1.b * l2.a
    const candidatePoints: { x: Fraction; y: Fraction; sources: string[] }[] = [];

    for (let i = 0; i < allBoundaryLines.length; i++) {
      for (let j = i + 1; j < allBoundaryLines.length; j++) {
        const l1 = allBoundaryLines[i];
        const l2 = allBoundaryLines[j];

        const det = l1.a.mul(l2.b).sub(l1.b.mul(l2.a));

        // Si det == 0, las rectas son paralelas (no se intersecan en un punto único)
        if (!det.isZero()) {
          const x = l1.c.mul(l2.b).sub(l1.b.mul(l2.c)).div(det);
          const y = l1.a.mul(l2.c).sub(l1.c.mul(l2.a)).div(det);

          candidatePoints.push({
            x,
            y,
            sources: [l1.id, l2.id],
          });
        }
      }
    }

    // =========================================================================
    // PASO 3: FILTRADO DE PUNTOS FACTIBLES (COMPROBACIÓN EXACTA)
    // =========================================================================
    // Un punto es factible si y solo si satisface simultáneamente TODAS las
    // restricciones y la condición de no negatividad x >= 0, y >= 0.
    const isPointFeasible = (x: Fraction, y: Fraction): boolean => {
      if (model.nonNegativity) {
        if (x.isNegative() || y.isNegative()) return false;
      }

      for (const line of lines) {
        const val = line.a.mul(x).add(line.b.mul(y));
        const diff = val.sub(line.c);

        if (line.operator === '<=' && diff.isPositive()) return false;
        if (line.operator === '>=' && diff.isNegative()) return false;
        if (line.operator === '=' && !diff.isZero()) return false;
      }
      return true;
    };

    const feasiblePoints: { x: Fraction; y: Fraction; sources: string[] }[] = [];

    for (const pt of candidatePoints) {
      if (isPointFeasible(pt.x, pt.y)) {
        // Evitar duplicados por múltiples rectas concurrentes
        const alreadyExists = feasiblePoints.some(
          (p) => p.x.equals(pt.x) && p.y.equals(pt.y)
        );
        if (!alreadyExists) {
          feasiblePoints.push(pt);
        }
      }
    }

    // Incluir el origen (0,0) si es factible
    if (isPointFeasible(Fraction.ZERO, Fraction.ZERO)) {
      if (!feasiblePoints.some((p) => p.x.isZero() && p.y.isZero())) {
        feasiblePoints.push({
          x: Fraction.ZERO,
          y: Fraction.ZERO,
          sources: ['Origen (0,0)'],
        });
      }
    }

    // =========================================================================
    // PASO 4: ORDENAMIENTO POLIGONAL MEDIANTE CENTROIDE (ÁNGULO ATAN2)
    // =========================================================================
    // Para dibujar el polígono convexo relleno en el canvas sin cruces de aristas,
    // se calcula el centroide (cx, cy) y se ordenan los puntos según su ángulo polar.
    let sortedVertices: GraphicPoint[] = [];

    if (feasiblePoints.length > 0) {
      let sumX = 0;
      let sumY = 0;
      feasiblePoints.forEach((p) => {
        sumX += p.x.toNumber();
        sumY += p.y.toNumber();
      });
      const cx = sumX / feasiblePoints.length;
      const cy = sumY / feasiblePoints.length;

      const pointsWithAngle = feasiblePoints.map((p) => {
        const angle = Math.atan2(p.y.toNumber() - cy, p.x.toNumber() - cx);
        const zVal = c1.mul(p.x).add(c2.mul(p.y));
        return {
          x: p.x,
          y: p.y,
          xNum: p.x.toNumber(),
          yNum: p.y.toNumber(),
          zValue: zVal,
          zNum: zVal.toNumber(),
          isOptimal: false,
          sourceConstraints: p.sources,
          angle,
        };
      });

      pointsWithAngle.sort((a, b) => a.angle - b.angle);

      // Asignar etiquetas alfabéticas secuenciales A, B, C, D...
      sortedVertices = pointsWithAngle.map((p, idx) => ({
        x: p.x,
        y: p.y,
        xNum: p.xNum,
        yNum: p.yNum,
        zValue: p.zValue,
        zNum: p.zNum,
        isOptimal: false,
        label: String.fromCharCode(65 + (idx % 26)),
        sourceConstraints: p.sourceConstraints,
      }));
    }

    // =========================================================================
    // PASO 5: EVALUACIÓN DE OPTIMALIDAD (TEOREMA DE PROGRAMACIÓN LINEAL)
    // =========================================================================
    let optimalVertices: GraphicPoint[] = [];
    let optimalValue: Fraction | null = null;
    let status: 'optimal' | 'infeasible' | 'unbounded' | 'alternative_optima' = 'optimal';
    let statusMsg = '';

    if (sortedVertices.length === 0) {
      status = 'infeasible';
      statusMsg = 'Región factible vacía: No existe ningún punto que satisfaga todas las restricciones simultáneamente.';
    } else {
      let extremeZ: Fraction | null = null;

      for (const v of sortedVertices) {
        if (extremeZ === null) {
          extremeZ = v.zValue;
        } else {
          const cmp = v.zValue.compare(extremeZ);
          if (isMax && cmp > 0) extremeZ = v.zValue;
          if (!isMax && cmp < 0) extremeZ = v.zValue;
        }
      }

      optimalValue = extremeZ;

      // Identificar todos los vértices que logran el valor extremo
      optimalVertices = sortedVertices.filter((v) => v.zValue.equals(extremeZ!));
      optimalVertices.forEach((v) => (v.isOptimal = true));

      if (optimalVertices.length > 1) {
        status = 'alternative_optima';
        statusMsg = `Soluciones Óptimas Múltiples: La función objetivo alcanza su valor óptimo Z = ${optimalValue!.toString()} en todo el segmento entre los vértices ${optimalVertices.map((v) => v.label).join(' y ')}.`;
      } else {
        status = 'optimal';
        const best = optimalVertices[0];
        statusMsg = `Solución Óptima Única en el vértice ${best.label} (${best.x.toString()}, ${best.y.toString()}) con Z* = ${optimalValue!.toString()}.`;
      }
    }

    // =========================================================================
    // PASO 6: CÁLCULO DE LÍMITES DE ENCUADRE PARA EL CANVAS
    // =========================================================================
    let maxX = 5;
    let maxY = 5;

    for (const v of sortedVertices) {
      if (v.xNum > maxX) maxX = v.xNum;
      if (v.yNum > maxY) maxY = v.yNum;
    }

    for (const l of lines) {
      if (l.xIntercept && l.xIntercept.isPositive() && l.xIntercept.toNumber() < 1000) {
        if (l.xIntercept.toNumber() > maxX) maxX = l.xIntercept.toNumber();
      }
      if (l.yIntercept && l.yIntercept.isPositive() && l.yIntercept.toNumber() < 1000) {
        if (l.yIntercept.toNumber() > maxY) maxY = l.yIntercept.toNumber();
      }
    }

    // Añadir margen visual del 25%
    maxX = Math.max(5, Math.ceil(maxX * 1.25));
    maxY = Math.max(5, Math.ceil(maxY * 1.25));

    // =========================================================================
    // PASO 7: GENERACIÓN DE PASOS EXPLICATIVOS PASO A PASO
    // =========================================================================
    const steps = [
      {
        stepNumber: 1,
        title: 'Paso 1: Ecuaciones asociadas e interceptos con los ejes',
        description:
          'Se convierten las inecuaciones en ecuaciones de rectas para determinar sus puntos de corte con los ejes coordenados haciendo x = 0 y y = 0.',
        latexFormula: lines
          .map((l) => {
            const xStr = l.xIntercept ? `( ${l.xIntercept.toLatex()}, 0 )` : '\\text{no corta}';
            const yStr = l.yIntercept ? `( 0, ${l.yIntercept.toLatex()} )` : '\\text{no corta}';
            return `\\text{${l.id}: } ${l.a.toLatex()} ${xVar} + ${l.b.toLatex()} ${yVar} = ${l.c.toLatex()} \\implies \\text{Cortes: } ${xStr} \\text{ y } ${yStr}`;
          })
          .join(' \\\\\n'),
      },
      {
        stepNumber: 2,
        title: 'Paso 2: Trazado de semiplanos y Región Factible',
        description:
          'Para cada restricción, se evalúa el punto de prueba (0,0) para determinar hacia qué lado de la recta se encuentra el semiplano factible. La intersección de todos los semiplanos conforma la Región de Soluciones Factibles (polígono sombreado en el gráfico).',
      },
      {
        stepNumber: 3,
        title: 'Paso 3: Identificación de los vértices (Puntos Extremos)',
        description:
          `Se calcularon las intersecciones entre las rectas activas para obtener los vértices del polígono factible: ${sortedVertices.map((v) => `${v.label} (${v.x.toString()}, ${v.y.toString()})`).join(', ')}.`,
      },
      {
        stepNumber: 4,
        title: 'Paso 4: Evaluación de la función objetivo Z en cada vértice',
        description:
          'Por el Teorema Fundamental de la Programación Lineal, el valor óptimo se encuentra siempre en al menos uno de los vértices de la región factible.',
        latexFormula: sortedVertices
          .map((v) => {
            return `Z(${v.label}) = ${c1.toLatex()} (${v.x.toLatex()}) + ${c2.toLatex()} (${v.y.toLatex()}) = ${v.zValue.toLatex()} \\approx ${v.zNum.toFixed(2)}`;
          })
          .join(' \\\\\n'),
      },
      {
        stepNumber: 5,
        title: 'Paso 5: Conclusión y Solución Óptima',
        description: statusMsg,
      },
    ];

    return {
      is2D: true,
      variables: [xVar, yVar],
      lines,
      feasibleVertices: sortedVertices,
      optimalVertices,
      isBounded: true,
      status,
      statusMessage: statusMsg,
      optimalValue,
      bounds: {
        minX: 0,
        maxX,
        minY: 0,
        maxY,
      },
      steps,
    };
  }
}
