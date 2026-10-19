import { Fraction } from '../math/fraction';
import { TransportModel, TransportInitialMethod } from './transportTypes';

export interface TransportPresetProblem {
  id: string;
  name: string;
  description: string;
  recommendedInitialMethod: TransportInitialMethod;
  specialCaseHighlight?: string;
  model: TransportModel;
}

export const TRANSPORT_PRESETS: TransportPresetProblem[] = [
  {
    id: 'tp1-clasico-balanceado',
    name: '1. Transporte Clásico Balanceado (3 Plantas, 4 Almacenes)',
    description:
      'Problema canónico de libro (Taha / Hillier). Oferta total (300 u) coincide exactamente con la demanda total (300 u). Permite contrastar Esquina Noroeste, Costo Mínimo y Vogel contra la solución óptima MODI.',
    recommendedInitialMethod: 'vogel',
    model: {
      origins: [
        { id: 'p1', name: 'Planta 1 (Norte)', supply: new Fraction(120, 1) },
        { id: 'p2', name: 'Planta 2 (Centro)', supply: new Fraction(80, 1) },
        { id: 'p3', name: 'Planta 3 (Sur)', supply: new Fraction(100, 1) },
      ],
      destinations: [
        { id: 'a1', name: 'Almacén A', demand: new Fraction(60, 1) },
        { id: 'a2', name: 'Almacén B', demand: new Fraction(70, 1) },
        { id: 'a3', name: 'Almacén C', demand: new Fraction(80, 1) },
        { id: 'a4', name: 'Almacén D', demand: new Fraction(90, 1) },
      ],
      costs: [
        [new Fraction(4, 1), new Fraction(6, 1), new Fraction(8, 1), new Fraction(8, 1)],
        [new Fraction(6, 1), new Fraction(8, 1), new Fraction(6, 1), new Fraction(7, 1)],
        [new Fraction(5, 1), new Fraction(7, 1), new Fraction(4, 1), new Fraction(6, 1)],
      ],
    },
  },
  {
    id: 'tp2-desbalanceado-oferta',
    name: '2. Problema Desbalanceado (Oferta Excedente con Destino Ficticio)',
    description:
      'La capacidad de las plantas (450 u) es superior a la demanda requerida por los centros (370 u). El sistema activa automáticamente un "Destino Ficticio" de 80 u con costo $c = 0$.',
    recommendedInitialMethod: 'vogel',
    specialCaseHighlight: 'Desbalanceado: Oferta > Demanda',
    model: {
      origins: [
        { id: 'f1', name: 'Fábrica Monterrey', supply: new Fraction(150, 1) },
        { id: 'f2', name: 'Fábrica Guadalajara', supply: new Fraction(120, 1) },
        { id: 'f3', name: 'Fábrica CDMX', supply: new Fraction(180, 1) },
      ],
      destinations: [
        { id: 't1', name: 'Sucursal Puebla', demand: new Fraction(100, 1) },
        { id: 't2', name: 'Sucursal Querétaro', demand: new Fraction(150, 1) },
        { id: 't3', name: 'Sucursal Toluca', demand: new Fraction(120, 1) },
      ],
      costs: [
        [new Fraction(8, 1), new Fraction(5, 1), new Fraction(6, 1)],
        [new Fraction(15, 1), new Fraction(10, 1), new Fraction(12, 1)],
        [new Fraction(3, 1), new Fraction(9, 1), new Fraction(10, 1)],
      ],
    },
  },
  {
    id: 'tp3-degeneracion-epsilon',
    name: '3. Caso de Degeneración (Requiere Épsilon ε)',
    description:
      'Una asignación inicial agota simultáneamente la oferta de una fila y la demanda de una columna, generando menos de m + n - 1 básicas. El solver detecta la degeneración e inserta ε en una celda independiente.',
    recommendedInitialMethod: 'northwest',
    specialCaseHighlight: 'Degeneración: Básicas < m + n - 1',
    model: {
      origins: [
        { id: 'o1', name: 'Almacén Principal', supply: new Fraction(30, 1) },
        { id: 'o2', name: 'Almacén Secundario', supply: new Fraction(40, 1) },
      ],
      destinations: [
        { id: 'd1', name: 'Punto de Venta 1', demand: new Fraction(30, 1) },
        { id: 'd2', name: 'Punto de Venta 2', demand: new Fraction(20, 1) },
        { id: 'd3', name: 'Punto de Venta 3', demand: new Fraction(20, 1) },
      ],
      costs: [
        [new Fraction(3, 1), new Fraction(2, 1), new Fraction(1, 1)],
        [new Fraction(4, 1), new Fraction(5, 1), new Fraction(2, 1)],
      ],
    },
  },
  {
    id: 'tp4-multiples-optimos',
    name: '4. Soluciones Óptimas Múltiples (Costo Marginal Δ = 0)',
    description:
      'Problema donde la tabla óptima final cuenta con una celda no básica con costo de oportunidad Δ = 0, lo que permite redistribuir el flujo entre diferentes rutas sin alterar el costo mínimo óptimo.',
    recommendedInitialMethod: 'vogel',
    specialCaseHighlight: 'Óptimos Múltiples (Rutas Alternativas)',
    model: {
      origins: [
        { id: 'o1', name: 'Silo 1', supply: new Fraction(100, 1) },
        { id: 'o2', name: 'Silo 2', supply: new Fraction(120, 1) },
      ],
      destinations: [
        { id: 'd1', name: 'Molino 1', demand: new Fraction(80, 1) },
        { id: 'd2', name: 'Molino 2', demand: new Fraction(60, 1) },
        { id: 'd3', name: 'Molino 3', demand: new Fraction(80, 1) },
      ],
      costs: [
        [new Fraction(4, 1), new Fraction(6, 1), new Fraction(8, 1)],
        [new Fraction(2, 1), new Fraction(4, 1), new Fraction(6, 1)],
      ],
    },
  },
  {
    id: 'tp5-rutas-prohibidas',
    name: '5. Rutas Prohibidas (Penalización Gran M)',
    description:
      'Determinadas rutas están cerradas por restricciones logísticas o sanitarias. El solver las penaliza con costo astronómico M asegurando que su asignación óptima sea exactamente 0.',
    recommendedInitialMethod: 'vogel',
    specialCaseHighlight: 'Rutas Prohibidas con Costo M',
    model: {
      origins: [
        { id: 'o1', name: 'Refinería A', supply: new Fraction(100, 1) },
        { id: 'o2', name: 'Refinería B', supply: new Fraction(150, 1) },
      ],
      destinations: [
        { id: 'd1', name: 'Depósito 1', demand: new Fraction(120, 1) },
        { id: 'd2', name: 'Depósito 2', demand: new Fraction(130, 1) },
      ],
      costs: [
        [new Fraction(5, 1), new Fraction(999, 1)], // Ruta (1,2) bloqueada
        [new Fraction(7, 1), new Fraction(4, 1)],
      ],
      prohibited: [
        [false, true],
        [false, false],
      ],
    },
  },
];
