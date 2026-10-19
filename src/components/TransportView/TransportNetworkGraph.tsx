import React, { useState } from 'react';
import { TransportModel, TransportTableau } from '../../core/transport/transportTypes';
import { Network, Filter } from 'lucide-react';

interface TransportNetworkGraphProps {
  model: TransportModel;
  tableau: TransportTableau;
}

export const TransportNetworkGraph: React.FC<TransportNetworkGraphProps> = ({
  model,
  tableau,
}) => {
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<{ type: 'origin' | 'dest'; index: number } | null>(
    null
  );
  const [hoveredEdge, setHoveredEdge] = useState<{ row: number; col: number } | null>(null);

  const m = model.origins.length;
  const n = model.destinations.length;

  // Dimensiones dinámicas del SVG
  const width = 800;
  const height = Math.max(450, Math.max(m, n) * 95 + 60);

  // Coordenadas de los nodos
  const leftX = 140;
  const rightX = width - 140;

  const originPositions = model.origins.map((_, i) => {
    const spacing = (height - 80) / Math.max(1, m);
    return {
      x: leftX,
      y: 50 + spacing * i + spacing / 2,
    };
  });

  const destPositions = model.destinations.map((_, j) => {
    const spacing = (height - 80) / Math.max(1, n);
    return {
      x: rightX,
      y: 50 + spacing * j + spacing / 2,
    };
  });

  // Encontrar el flujo máximo para escalar el grosor de las líneas
  let maxFlow = 1;
  for (const row of tableau.cells) {
    for (const cell of row) {
      if (cell.isBasic && !cell.isEpsilon) {
        const val = cell.allocated.toNumber();
        if (val > maxFlow) maxFlow = val;
      }
    }
  }

  return (
    <div className="bg-[#18191e]/60 backdrop-blur-2xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.36)] flex flex-col">
      {/* Encabezado con Controles */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3 bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Grafo Interactivo de Red Bipartita de Transporte
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Flujos físicos de distribución optimizada desde Orígenes (Fuentes) hasta Destinos (Sumideros)
            </p>
          </div>
        </div>

        {/* Interruptor de Filtro de Rutas */}
        <button
          onClick={() => setShowOnlyActive(!showOnlyActive)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
            showOnlyActive
              ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
              : 'bg-white/[0.04] border-white/[0.08] text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{showOnlyActive ? 'Mostrando Rutas Activas' : 'Mostrando Todas las Rutas'}</span>
        </button>
      </div>

      {/* Contenedor del Lienzo SVG */}
      <div className="p-4 flex items-center justify-center overflow-x-auto bg-[#0f1015]/80">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[850px] select-none"
          style={{ minHeight: `${height}px` }}
        >
          <defs>
            {/* Gradiente para aristas activas */}
            <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>

            {/* Gradiente para aristas en hover */}
            <linearGradient id="edgeHoverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="1" />
            </linearGradient>

            {/* Marcador de flecha direccional */}
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#10b981" />
            </marker>
          </defs>

          {/* 1. Dibujar Aristas (Rutas de Transporte) */}
          {model.origins.map((_, i) =>
            model.destinations.map((_, j) => {
              const cell = tableau.cells[i][j];
              const flow = cell.allocated.toNumber();
              const isBasic = cell.isBasic;
              const hasFlow = isBasic && flow > 0;

              if (showOnlyActive && !hasFlow && !cell.isEpsilon) return null;

              const p1 = originPositions[i];
              const p2 = destPositions[j];

              // Curva Bézier cúbica suave
              const dx = (p2.x - p1.x) * 0.45;
              const pathD = `M ${p1.x} ${p1.y} C ${p1.x + dx} ${p1.y}, ${p2.x - dx} ${p2.y}, ${p2.x} ${p2.y}`;

              // Punto medio de la curva para el label
              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;

              const isEdgeHighlighted =
                hoveredEdge?.row === i && hoveredEdge?.col === j;
              const isNodeRelated =
                (hoveredNode?.type === 'origin' && hoveredNode?.index === i) ||
                (hoveredNode?.type === 'dest' && hoveredNode?.index === j);

              // Grosor proporcional al flujo
              const strokeWidth = hasFlow
                ? Math.max(2, Math.min(7, (flow / maxFlow) * 6 + 1.5))
                : 1;

              const strokeOpacity = hoveredNode
                ? isNodeRelated
                  ? 1
                  : 0.1
                : hasFlow
                ? isEdgeHighlighted
                  ? 1
                  : 0.75
                : 0.15;

              return (
                <g
                  key={`${i}-${j}`}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredEdge({ row: i, col: j })}
                  onMouseLeave={() => setHoveredEdge(null)}
                >
                  <path
                    d={pathD}
                    fill="none"
                    stroke={
                      hasFlow
                        ? isEdgeHighlighted || isNodeRelated
                          ? 'url(#edgeHoverGradient)'
                          : 'url(#edgeGradient)'
                        : '#71717a'
                    }
                    strokeWidth={isEdgeHighlighted ? strokeWidth + 2 : strokeWidth}
                    strokeDasharray={hasFlow ? undefined : '4 4'}
                    strokeOpacity={strokeOpacity}
                  />

                  {/* Etiqueta flotante con el flujo asignado */}
                  {(hasFlow || isEdgeHighlighted || cell.isEpsilon) && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-40"
                        y="-12"
                        width="80"
                        height="24"
                        rx="12"
                        fill="#090a0f"
                        stroke={hasFlow ? '#10b981' : '#71717a'}
                        strokeWidth="1.2"
                        className="shadow-lg"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill={hasFlow ? '#34d399' : '#e4e4e7'}
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {cell.isEpsilon ? 'ε (0)' : `${cell.allocated.toString()} u`}
                      </text>
                    </g>
                  )}
                </g>
              );
            })
          )}

          {/* 2. Dibujar Nodos de Origen (Izquierda) */}
          {model.origins.map((orig, i) => {
            const pos = originPositions[i];
            const isHovered = hoveredNode?.type === 'origin' && hoveredNode.index === i;

            return (
              <g
                key={orig.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredNode({ type: 'origin', index: i })}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Halo de resplandor al hover */}
                {isHovered && (
                  <circle r="44" fill="#3b82f6" fillOpacity="0.15" className="animate-pulse" />
                )}

                {/* Caja del Nodo Origen */}
                <rect
                  x="-110"
                  y="-26"
                  width="110"
                  height="52"
                  rx="14"
                  fill="#151720"
                  stroke={isHovered ? '#60a5fa' : '#3b82f6'}
                  strokeWidth={isHovered ? '2' : '1.4'}
                  className="shadow-xl"
                />

                {/* Punto conector */}
                <circle cx="0" cy="0" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />

                {/* Texto del Nodo */}
                <text
                  x="-55"
                  y="-6"
                  textAnchor="middle"
                  fill="#f4f4f5"
                  fontSize="11"
                  fontWeight="600"
                >
                  {orig.name.length > 13 ? `${orig.name.slice(0, 12)}…` : orig.name}
                </text>
                <text
                  x="-55"
                  y="12"
                  textAnchor="middle"
                  fill="#60a5fa"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="500"
                >
                  Oferta: {orig.supply.toString()}
                </text>
              </g>
            );
          })}

          {/* 3. Dibujar Nodos de Destino (Derecha) */}
          {model.destinations.map((dest, j) => {
            const pos = destPositions[j];
            const isHovered = hoveredNode?.type === 'dest' && hoveredNode.index === j;

            return (
              <g
                key={dest.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredNode({ type: 'dest', index: j })}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Halo de resplandor al hover */}
                {isHovered && (
                  <circle r="44" fill="#10b981" fillOpacity="0.15" className="animate-pulse" />
                )}

                {/* Punto conector */}
                <circle cx="0" cy="0" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />

                {/* Caja del Nodo Destino */}
                <rect
                  x="0"
                  y="-26"
                  width="110"
                  height="52"
                  rx="14"
                  fill="#151720"
                  stroke={isHovered ? '#34d399' : '#10b981'}
                  strokeWidth={isHovered ? '2' : '1.4'}
                  className="shadow-xl"
                />

                {/* Texto del Nodo */}
                <text
                  x="55"
                  y="-6"
                  textAnchor="middle"
                  fill="#f4f4f5"
                  fontSize="11"
                  fontWeight="600"
                >
                  {dest.name.length > 13 ? `${dest.name.slice(0, 12)}…` : dest.name}
                </text>
                <text
                  x="55"
                  y="12"
                  textAnchor="middle"
                  fill="#34d399"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="500"
                >
                  Demanda: {dest.demand.toString()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Indicador de ayuda */}
      <div className="px-5 py-2.5 border-t border-white/[0.06] bg-black/30 flex items-center justify-between text-[11px] text-zinc-400">
        <span>Pasa el cursor sobre un nodo o ruta para resaltar sus conexiones de flujo.</span>
        <span className="font-mono text-zinc-500">
          {m} Fuentes &bull; {n} Sumideros &bull; {m * n} Rutas Posibles
        </span>
      </div>
    </div>
  );
};
