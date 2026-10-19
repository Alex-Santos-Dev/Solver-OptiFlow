import React, { useRef, useEffect, useState, useMemo } from 'react';
import { GraphicSolution, GraphicPoint, GraphicLine } from '../../core/graphic/graphicTypes';
import { ZoomIn, ZoomOut, RotateCcw, Play, Pause, Sparkles } from 'lucide-react';

/**
 * Propiedades del componente GraphicCanvas
 */
interface GraphicCanvasProps {
  /** Solución calculada por el Método Gráfico */
  solution: GraphicSolution;
  /** Callback opcional al hacer clic o interactuar con un vértice */
  onSelectVertex?: (vertex: GraphicPoint) => void;
}

/**
 * Componente GraphicCanvas (Plano Cartesiano 2D Interactivo)
 * -------------------------------------------------------------
 * Representa visualmente el problema de Programación Lineal en 2 dimensiones:
 * 1. Sistema de coordenadas con escala dinámica y ajuste a pantallas Retina (DPI alto).
 * 2. Cuadrícula y ejes graduados con etiquetas para x e y.
 * 3. Trazado de cada recta de restricción con color propio.
 * 4. Polígono sombreado en degradado verde esmeralda para la Región Factible.
 * 5. Puntos extremos (vértices A, B, C...) con halo dorado en el vértice óptimo.
 * 6. Recta de Nivel Z interactiva (isocostos/isobeneficios) con slider y animación para
 *    demostrar visualmente cómo Z toca el óptimo antes de dejar la región.
 * 7. Tooltips flotantes al pasar el cursor sobre los vértices con coordenadas exactas.
 */
export const GraphicCanvas: React.FC<GraphicCanvasProps> = ({ solution, onSelectVertex }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // View state: scale and offsets for pan/zoom
  const [zoomFactor, setZoomFactor] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [hoveredPoint, setHoveredPoint] = useState<GraphicPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<GraphicPoint | null>(null);

  // Dynamic Z isocost line slider
  const [customZ, setCustomZ] = useState<number | null>(null);
  const [isAnimatingZ, setIsAnimatingZ] = useState(false);

  const { bounds, feasibleVertices, optimalVertices, lines, variables } = solution;
  const [xVar, yVar] = variables;

  // Min and max Z across all feasible points for the isocost slider
  const zRange = useMemo(() => {
    if (feasibleVertices.length === 0) return { min: 0, max: 100, opt: 50 };
    const zVals = feasibleVertices.map((v) => v.zNum);
    const min = Math.min(...zVals);
    const max = Math.max(...zVals);
    const opt = solution.optimalValue ? solution.optimalValue.toNumber() : max;
    return {
      min: Math.floor(min * 0.8),
      max: Math.ceil(max * 1.2) || 10,
      opt,
    };
  }, [feasibleVertices, solution.optimalValue]);

  // Reset customZ to optimal on solution change
  useEffect(() => {
    if (solution.optimalValue) {
      setCustomZ(solution.optimalValue.toNumber());
    } else {
      setCustomZ(zRange.min);
    }
    setZoomFactor(1);
    setPanOffset({ x: 0, y: 0 });
  }, [solution, zRange]);

  // Animation effect for Z line
  useEffect(() => {
    if (!isAnimatingZ) return;
    const duration = 3000;
    const startZ = zRange.min;
    const targetZ = zRange.opt;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startZ + (targetZ - startZ) * ease;
      setCustomZ(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimatingZ(false);
      }
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isAnimatingZ, zRange]);

  // Main Canvas Render function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Margins around the graph
    const margin = { left: 65, right: 35, top: 40, bottom: 55 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    // World coordinates
    const maxX = bounds.maxX * zoomFactor;
    const maxY = bounds.maxY * zoomFactor;

    // Transform functions: World -> Screen
    const worldToScreenX = (wx: number) => margin.left + panOffset.x + (wx / maxX) * plotWidth;
    const worldToScreenY = (wy: number) => margin.top + plotHeight - panOffset.y - (wy / maxY) * plotHeight;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Grid
    ctx.strokeStyle = '#27272a'; // Zinc 800
    ctx.lineWidth = 1;
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = '#a1a1aa'; // Zinc 400

    const numTicks = 8;
    const stepX = maxX / numTicks;
    const stepY = maxY / numTicks;

    // Vertical grid lines and X labels
    for (let i = 0; i <= numTicks; i++) {
      const wx = i * stepX;
      const sx = worldToScreenX(wx);
      if (sx >= margin.left && sx <= width - margin.right) {
        ctx.beginPath();
        ctx.moveTo(sx, margin.top);
        ctx.lineTo(sx, margin.top + plotHeight);
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(Number(wx.toFixed(1)).toString(), sx, margin.top + plotHeight + 8);
      }
    }

    // Horizontal grid lines and Y labels
    for (let i = 0; i <= numTicks; i++) {
      const wy = i * stepY;
      const sy = worldToScreenY(wy);
      if (sy >= margin.top && sy <= margin.top + plotHeight) {
        ctx.beginPath();
        ctx.moveTo(margin.left, sy);
        ctx.lineTo(width - margin.right, sy);
        ctx.stroke();

        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(Number(wy.toFixed(1)).toString(), margin.left - 10, sy);
      }
    }

    // 2. Draw Main Axes (X and Y in bold)
    ctx.strokeStyle = '#71717a'; // Zinc 500
    ctx.lineWidth = 2;

    const zeroX = worldToScreenX(0);
    const zeroY = worldToScreenY(0);

    // X Axis
    ctx.beginPath();
    ctx.moveTo(margin.left, zeroY);
    ctx.lineTo(width - margin.right + 15, zeroY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(zeroX, margin.top + plotHeight);
    ctx.lineTo(zeroX, margin.top - 15);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#e4e4e7';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${xVar} (Eje X) →`, width - margin.right + 5, zeroY + 18);
    ctx.textAlign = 'center';
    ctx.fillText(`↑ ${yVar} (Eje Y)`, zeroX, margin.top - 24);

    // 3. Clip to plotting area for lines and polygon
    ctx.save();
    ctx.beginPath();
    ctx.rect(margin.left, margin.top, plotWidth, plotHeight);
    ctx.clip();

    // 4. Draw Feasible Region Polygon
    if (feasibleVertices.length >= 3) {
      ctx.beginPath();
      const first = feasibleVertices[0];
      ctx.moveTo(worldToScreenX(first.xNum), worldToScreenY(first.yNum));

      for (let i = 1; i < feasibleVertices.length; i++) {
        const pt = feasibleVertices[i];
        ctx.lineTo(worldToScreenX(pt.xNum), worldToScreenY(pt.yNum));
      }
      ctx.closePath();

      // Soft emerald / cyan gradient fill
      const grad = ctx.createLinearGradient(margin.left, margin.top, width, height);
      grad.addColorStop(0, 'rgba(16, 185, 129, 0.35)'); // Emerald
      grad.addColorStop(1, 'rgba(6, 182, 212, 0.25)'); // Cyan
      ctx.fillStyle = grad;
      ctx.fill();

      // Region border
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // 5. Draw Constraint Lines
    lines.forEach((l) => {
      ctx.strokeStyle = l.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);

      const a = l.a.toNumber();
      const b = l.b.toNumber();
      const c = l.c.toNumber();

      let x1 = 0, y1 = 0, x2 = 0, y2 = 0;

      if (b === 0) {
        // Vertical line: x = c / a
        x1 = c / a;
        y1 = 0;
        x2 = c / a;
        y2 = maxY;
      } else if (a === 0) {
        // Horizontal line: y = c / b
        x1 = 0;
        y1 = c / b;
        x2 = maxX;
        y2 = c / b;
      } else {
        // General line: ax + by = c => y = (c - ax) / b
        x1 = 0;
        y1 = c / b;
        x2 = maxX;
        y2 = (c - a * maxX) / b;
      }

      ctx.beginPath();
      ctx.moveTo(worldToScreenX(x1), worldToScreenY(y1));
      ctx.lineTo(worldToScreenX(x2), worldToScreenY(y2));
      ctx.stroke();
    });

    // 6. Draw Objective Function Line (Isocost / Isoprofit)
    if (customZ !== null && solution.optimalValue) {
      const c1 = solution.lines.length > 0 ? (lines[0].a.toNumber() || 1) : 1;
      const c2 = solution.lines.length > 0 ? (lines[0].b.toNumber() || 1) : 1;

      // Draw Z line: c1 * x + c2 * y = customZ
      ctx.strokeStyle = '#f43f5e'; // Vibrant Rose
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 5]);

      let zx1 = 0, zy1 = 0, zx2 = 0, zy2 = 0;
      if (c2 === 0) {
        zx1 = customZ / c1;
        zy1 = 0;
        zx2 = customZ / c1;
        zy2 = maxY;
      } else {
        zx1 = 0;
        zy1 = customZ / c2;
        zx2 = maxX;
        zy2 = (customZ - c1 * maxX) / c2;
      }

      ctx.beginPath();
      ctx.moveTo(worldToScreenX(zx1), worldToScreenY(zy1));
      ctx.lineTo(worldToScreenX(zx2), worldToScreenY(zy2));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore(); // Restore clipping

    // 7. Draw Vertices (A, B, C...)
    feasibleVertices.forEach((v) => {
      const sx = worldToScreenX(v.xNum);
      const sy = worldToScreenY(v.yNum);

      // Check if point is inside visible area
      if (sx < margin.left - 5 || sx > width - margin.right + 5) return;
      if (sy < margin.top - 5 || sy > margin.top + plotHeight + 5) return;

      const isOpt = v.isOptimal;
      const isHovered = hoveredPoint?.label === v.label;

      if (isOpt) {
        // Glowing halo for optimal vertex
        ctx.beginPath();
        ctx.arc(sx, sy, isHovered ? 16 : 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(234, 179, 8, 0.35)'; // Amber gold glow
        ctx.fill();

        ctx.beginPath();
        ctx.arc(sx, sy, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#eab308';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(sx, sy, isHovered ? 8 : 6, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? '#38bdf8' : '#0284c7';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw Vertex Label (e.g. "A", "B*")
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillStyle = isOpt ? '#facc15' : '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(
        `${v.label || ''}${isOpt ? ' ★ (Óptimo)' : ''}`,
        sx + 9,
        sy - 5
      );
    });
  }, [bounds, feasibleVertices, optimalVertices, lines, variables, zoomFactor, panOffset, customZ, hoveredPoint, solution]);

  // Handle Mouse Move for Tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const margin = { left: 65, right: 35, top: 40, bottom: 55 };
    const plotWidth = canvas.clientWidth - margin.left - margin.right;
    const plotHeight = canvas.clientHeight - margin.top - margin.bottom;

    const maxX = bounds.maxX * zoomFactor;
    const maxY = bounds.maxY * zoomFactor;

    const worldToScreenX = (wx: number) => margin.left + panOffset.x + (wx / maxX) * plotWidth;
    const worldToScreenY = (wy: number) => margin.top + plotHeight - panOffset.y - (wy / maxY) * plotHeight;

    let found: GraphicPoint | null = null;
    for (const v of feasibleVertices) {
      const sx = worldToScreenX(v.xNum);
      const sy = worldToScreenY(v.yNum);
      const dist = Math.hypot(mx - sx, my - sy);
      if (dist <= 15) {
        found = v;
        break;
      }
    }

    if (found) {
      setHoveredPoint(found);
      setTooltipPos({ x: mx, y: my });
    } else {
      setHoveredPoint(null);
      setTooltipPos(null);
    }
  };

  const handleCanvasClick = () => {
    if (hoveredPoint) {
      setSelectedPoint(hoveredPoint);
      if (onSelectVertex) onSelectVertex(hoveredPoint);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full" ref={containerRef}>
      {/* Control Bar (Estilo macOS Toolbar) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#18191e]/60 backdrop-blur-2xl border border-white/[0.08] p-2.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        {/* Isocost Slider & Animation */}
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <button
            onClick={() => setIsAnimatingZ(!isAnimatingZ)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isAnimatingZ
                ? 'bg-rose-500/90 text-white shadow-[0_2px_8px_rgba(244,63,94,0.35)] border border-rose-400/40'
                : 'bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.12] border border-white/[0.08] text-zinc-200'
            }`}
            title="Animar recta Z hacia el óptimo"
          >
            {isAnimatingZ ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAnimatingZ ? 'Pausar Z' : 'Animar Z'}</span>
          </button>

          <div className="flex flex-col flex-1">
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span className="font-medium text-rose-400/90 flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-rose-500 inline-block rounded"></span>
                Recta de Nivel Z
              </span>
              <span className="font-mono text-zinc-200 font-semibold text-xs">
                Z = {customZ !== null ? customZ.toFixed(2) : '0'}
              </span>
            </div>
            <input
              type="range"
              min={zRange.min}
              max={zRange.max}
              step={0.1}
              value={customZ ?? zRange.min}
              onChange={(e) => {
                setIsAnimatingZ(false);
                setCustomZ(parseFloat(e.target.value));
              }}
              className="w-full accent-blue-500 h-1.5 bg-white/[0.1] rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Zoom & Reset Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomFactor((prev) => Math.max(0.4, prev * 0.8))}
            className="p-1.5 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/[0.06] text-zinc-300 rounded-lg transition"
            title="Acercar (Zoom In)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomFactor((prev) => Math.min(3, prev * 1.25))}
            className="p-1.5 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/[0.06] text-zinc-300 rounded-lg transition"
            title="Alejar (Zoom Out)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoomFactor(1);
              setPanOffset({ x: 0, y: 0 });
              if (solution.optimalValue) setCustomZ(solution.optimalValue.toNumber());
            }}
            className="p-1.5 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/[0.06] text-zinc-300 rounded-lg transition"
            title="Restablecer Vista"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full h-[480px] bg-[#0f1015] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            setHoveredPoint(null);
            setTooltipPos(null);
          }}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Legend Overlay (Estilo macOS Glass Tag) */}
        <div className="absolute top-3 right-3 bg-[#18191e]/80 backdrop-blur-xl border border-white/[0.08] p-2.5 rounded-xl shadow-lg flex flex-col gap-1.5 max-w-[240px] text-xs">
          <div className="font-medium text-zinc-200 border-b border-white/[0.06] pb-1 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Leyenda del Gráfico</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-400"></span>
            <span>Región Factible</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-3 h-0.5 bg-rose-500 border-t border-dashed border-rose-400"></span>
            <span>Recta de Nivel Z</span>
          </div>
          {lines.map((l) => (
            <div key={l.id} className="flex items-center gap-2 text-zinc-400 truncate">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: l.color }}></span>
              <span className="truncate">{l.id}: {l.operator} {l.c.toString()}</span>
            </div>
          ))}
        </div>

        {/* Interactive Floating Tooltip (macOS style callout) */}
        {hoveredPoint && tooltipPos && (
          <div
            className="absolute z-20 pointer-events-none bg-[#18191e]/95 backdrop-blur-2xl border border-white/[0.12] p-3 rounded-xl shadow-2xl text-xs flex flex-col gap-1 min-w-[170px]"
            style={{
              left: Math.min(tooltipPos.x + 12, (canvasRef.current?.clientWidth || 400) - 190),
              top: Math.max(tooltipPos.y - 70, 10),
            }}
          >
            <div className="flex items-center justify-between font-semibold text-zinc-100 border-b border-white/[0.06] pb-1">
              <span>Vértice {hoveredPoint.label}</span>
              {hoveredPoint.isOptimal && (
                <span className="text-amber-400 text-[10px] uppercase tracking-wider font-semibold flex items-center gap-0.5">
                  ★ Óptimo
                </span>
              )}
            </div>
            <div className="text-zinc-300 font-mono text-[11px]">
              Coordenadas: ({hoveredPoint.x.toString()}, {hoveredPoint.y.toString()})
            </div>
            <div className="text-zinc-400 font-mono text-[11px]">
              Decimal: ({hoveredPoint.xNum.toFixed(2)}, {hoveredPoint.yNum.toFixed(2)})
            </div>
            <div className="text-emerald-400 font-medium font-mono border-t border-white/[0.06] pt-1">
              Valor Z = {hoveredPoint.zValue.toString()} ({hoveredPoint.zNum.toFixed(2)})
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

