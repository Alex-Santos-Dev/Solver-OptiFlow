/**
 * Modelo de datos para un Problema Preestablecido (Preset).
 *
 * Permite catalogar problemas clásicos de Programación Lineal con fines
 * pedagógicos, de verificación y de demostración interactiva en clase.
 */
export interface PresetProblem {
  /** Identificador único del ejercicio (slug alfanumérico) */
  id: string;
  /** Nombre o título descriptivo del problema */
  name: string;
  /** Categoría metodológica del ejercicio */
  category: 'standard' | 'bigM' | 'twoPhase' | 'special' | 'multivariable';
  /** Descripción del contexto operativo y particularidad matemática */
  description: string;
  /** Método de resolución sugerido para mejor comprensión visual o algorítmica */
  recommendedMethod: 'graphic' | 'simplex';
  /** Variante específica de Simplex sugerida cuando aplica ('bigM' o 'twoPhase') */
  simplexMethod?: 'bigM' | 'twoPhase';
  /** Texto en formato algebraico estándar listo para ser procesado por el LPParser */
  text: string;
}

/**
 * Catálogo de Problemas Emblemáticos de Investigación de Operaciones.
 *
 * Contiene ejercicios cuidadosamente formulados a partir de la bibliografía canónica
 * (Hamdy A. Taha "Investigación de Operaciones", Hillier & Lieberman):
 *
 * 1. Producción Estándar (2D): Restricciones puras `<=`, holguras positivas, factibilidad inmediata en el origen.
 * 2. Problema de la Dieta: Minimización con restricciones `>=`, requiere variables de exceso y artificiales con Gran M.
 * 3. Mezcla Química: Restricciones combinadas `=`, `>=`, `<=`, ideal para contrastar Fase 1 y Fase 2.
 * 4. Soluciones Óptimas Múltiples: Función objetivo con pendiente idéntica a una frontera de restricción.
 * 5. Región No Acotada: Espacio de soluciones abierto que permite a Z crecer indefinidamente hacia $+\infty$.
 * 6. Problema Infactible: Intersección vacía entre semiespacios contradictorios.
 * 7. Multivariable (3D): 3 variables de decisión que trascienden el plano cartesiano y exigen el algoritmo Simplex tabular.
 */
export const PRESET_PROBLEMS: PresetProblem[] = [
  {
    id: 'ex1-carpinteria',
    name: '1. Producción y Maximización Estándar (2 Variables)',
    category: 'standard',
    description: 'Problema clásico de producción de mesas y sillas. Restricciones <= con holguras puras. Ideal para comparar Método Gráfico vs Simplex.',
    recommendedMethod: 'graphic',
    text: `Max Z = 3x1 + 5x2
s.a.
x1 <= 4
2x2 <= 12
3x1 + 2x2 <= 18
x1, x2 >= 0`,
  },
  {
    id: 'ex2-dieta-min',
    name: '2. Problema de la Dieta (Minimización con Gran M y Dos Fases)',
    category: 'bigM',
    description: 'Minimización de costos nutricionales con restricciones >= que requieren variables de exceso y artificiales.',
    recommendedMethod: 'simplex',
    simplexMethod: 'bigM',
    text: `Min Z = 2x1 + 3x2
s.a.
x1 + x2 >= 5
x1 + 2x2 >= 6
x1, x2 >= 0`,
  },
  {
    id: 'ex3-dos-fases',
    name: '3. Mezcla Química con Igualdad (Dos Fases)',
    category: 'twoPhase',
    description: 'Problema con restricciones combinadas <=, >= e igualdad (=) para observar el algoritmo de Dos Fases.',
    recommendedMethod: 'simplex',
    simplexMethod: 'twoPhase',
    text: `Min Z = 4x1 + x2
s.a.
3x1 + x2 = 3
4x1 + 3x2 >= 6
x1 + 2x2 <= 4
x1, x2 >= 0`,
  },
  {
    id: 'ex4-optimos-multiples',
    name: '4. Soluciones Óptimas Múltiples (Segmento de Óptimos)',
    category: 'special',
    description: 'La función objetivo es paralela a una restricción activa, generando infinitas soluciones óptimas.',
    recommendedMethod: 'graphic',
    text: `Max Z = 2x1 + 4x2
s.a.
x1 + 2x2 <= 10
x1 + x2 <= 6
x1, x2 >= 0`,
  },
  {
    id: 'ex5-no-acotado',
    name: '5. Región No Acotada (Solución Unbounded)',
    category: 'special',
    description: 'La región factible está abierta hacia el infinito en la dirección de crecimiento de la función objetivo.',
    recommendedMethod: 'graphic',
    text: `Max Z = 2x1 + x2
s.a.
x1 - x2 <= 10
2x1 <= 40
x1, x2 >= 0`,
  },
  {
    id: 'ex6-infactible',
    name: '6. Problema Infactible (Sin Región Factible)',
    category: 'special',
    description: 'Restricciones contradictorias donde no existe ningún punto común que satisfaga todas simultáneamente.',
    recommendedMethod: 'graphic',
    text: `Max Z = 3x1 + 2x2
s.a.
x1 + x2 <= 2
2x1 + 2x2 >= 8
x1, x2 >= 0`,
  },
  {
    id: 'ex7-multivariable',
    name: '7. Problema Multivariable: 3 Variables (Fábrica de Muebles)',
    category: 'multivariable',
    description: 'Problema de 3 variables (x1: mesas, x2: sillas, x3: escritorios). Muestra el poder del Método Simplex en n dimensiones.',
    recommendedMethod: 'simplex',
    text: `Max Z = 50x1 + 30x2 + 80x3
s.a.
x1 + 2x2 + x3 <= 120
2x1 + x2 + 3x3 <= 180
x1 + x2 + x3 <= 100
x1, x2, x3 >= 0`,
  },
  {
    id: 'ex8-multivariable-4d',
    name: '8. Multivariable: 4 Variables y 4 Restricciones (Refinería)',
    category: 'multivariable',
    description: 'Problema de gran escala con 4 variables de producción y 4 restricciones de capacidad y demanda. Pone a prueba la matriz interactiva y el Simplex tabular.',
    recommendedMethod: 'simplex',
    text: `Max Z = 12x1 + 15x2 + 18x3 + 10x4
s.a.
2x1 + 3x2 + 4x3 + 2x4 <= 240
3x1 + 2x2 + x3 + 2x4 <= 180
x1 + 2x2 + 2x3 + x4 <= 150
x1 + x2 + x3 + x4 <= 100
x1, x2, x3, x4 >= 0`,
  },
  {
    id: 'ex9-multivariable-5d',
    name: '9. Multivariable: 5 Variables y 3 Restricciones (Recursos)',
    category: 'multivariable',
    description: 'Formulación amplia con 5 variables de decisión. Demuestra la estabilidad visual de la matriz tabular y el tableau Simplex en dimensiones superiores.',
    recommendedMethod: 'simplex',
    text: `Max Z = 4x1 + 6x2 + 5x3 + 3x4 + 7x5
s.a.
x1 + 2x2 + 2x3 + x4 + 3x5 <= 300
2x1 + x2 + 3x3 + 2x4 + x5 <= 250
3x1 + 2x2 + x3 + 3x4 + 2x5 <= 280
x1, x2, x3, x4, x5 >= 0`,
  },
];

