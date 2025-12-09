/**
 * Chart Service - Sprint 5.10
 *
 * Advanced data visualization utilities for progress tracking.
 * Features:
 * - Canvas-based chart rendering
 * - Multiple chart types (line, bar, area, donut)
 * - Responsive design
 * - Animation support
 * - Gradient fills
 * - Interactive tooltips
 * - Export to image
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface Dataset {
  label: string;
  data: number[];
  color?: string;
  backgroundColor?: string;
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  animation?: boolean;
  animationDuration?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  gridColor?: string;
  labelColor?: string;
  padding?: number;
  minValue?: number;
  maxValue?: number;
}

export interface Point {
  x: number;
  y: number;
  value: number;
  label: string;
}

export type ChartType = 'line' | 'bar' | 'area' | 'donut' | 'radar';

// ============================================================================
// DEFAULT OPTIONS
// ============================================================================

const DEFAULT_OPTIONS: ChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  animation: true,
  animationDuration: 500,
  showLegend: true,
  showGrid: true,
  showLabels: true,
  gridColor: 'rgba(156, 163, 175, 0.2)',
  labelColor: '#6b7280',
  padding: 20,
};

// Color palette
const COLORS = [
  '#059669', // Emerald
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#10b981', // Green
  '#f97316', // Orange
];

// ============================================================================
// CHART SERVICE
// ============================================================================

class ChartService {
  private animationFrameId: number | null = null;

  // --------------------------------------------------------------------------
  // MAIN RENDER
  // --------------------------------------------------------------------------

  /**
   * Render a chart
   */
  public render(
    canvas: HTMLCanvasElement,
    type: ChartType,
    data: ChartData,
    options: ChartOptions = {}
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      logger.error('[Chart] Canvas context not available');
      return;
    }

    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Setup canvas
    this.setupCanvas(canvas, ctx, opts);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate chart area
    const chartArea = this.calculateChartArea(canvas, opts);

    // Render based on type
    switch (type) {
      case 'line':
        this.renderLineChart(ctx, data, chartArea, opts);
        break;
      case 'bar':
        this.renderBarChart(ctx, data, chartArea, opts);
        break;
      case 'area':
        this.renderAreaChart(ctx, data, chartArea, opts);
        break;
      case 'donut':
        this.renderDonutChart(ctx, data, chartArea, opts);
        break;
      case 'radar':
        this.renderRadarChart(ctx, data, chartArea, opts);
        break;
    }

    // Render legend
    if (opts.showLegend && type !== 'donut') {
      this.renderLegend(ctx, data, chartArea, opts);
    }
  }

  // --------------------------------------------------------------------------
  // SETUP
  // --------------------------------------------------------------------------

  private setupCanvas(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    options: ChartOptions
  ): void {
    if (options.responsive) {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.scale(dpr, dpr);

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    }
  }

  private calculateChartArea(
    canvas: HTMLCanvasElement,
    options: ChartOptions
  ): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const padding = options.padding || 20;
    const dpr = window.devicePixelRatio || 1;

    return {
      x: padding + 40, // Space for Y axis labels
      y: padding,
      width: canvas.width / dpr - padding * 2 - 40,
      height: canvas.height / dpr - padding * 2 - 30, // Space for X axis labels
    };
  }

  // --------------------------------------------------------------------------
  // LINE CHART
  // --------------------------------------------------------------------------

  private renderLineChart(
    ctx: CanvasRenderingContext2D,
    data: ChartData,
    area: { x: number; y: number; width: number; height: number },
    options: ChartOptions
  ): void {
    // Draw grid
    if (options.showGrid) {
      this.drawGrid(ctx, data, area, options);
    }

    // Calculate scale
    const { minVal, maxVal, scale } = this.calculateScale(data, options, area);

    // Draw datasets
    data.datasets.forEach((dataset, datasetIndex) => {
      const color = dataset.color || COLORS[datasetIndex % COLORS.length];
      const points = this.calculatePoints(data, dataset, area, minVal, scale);

      // Draw line
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = dataset.borderWidth || 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      points.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          if (dataset.tension && dataset.tension > 0) {
            const prev = points[i - 1];
            const cpx = (prev.x + point.x) / 2;
            ctx.quadraticCurveTo(cpx, prev.y, cpx, point.y);
            ctx.quadraticCurveTo(cpx, point.y, point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        }
      });

      ctx.stroke();

      // Draw points
      points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });

    // Draw labels
    if (options.showLabels) {
      this.drawLabels(ctx, data, area, options);
    }
  }

  // --------------------------------------------------------------------------
  // BAR CHART
  // --------------------------------------------------------------------------

  private renderBarChart(
    ctx: CanvasRenderingContext2D,
    data: ChartData,
    area: { x: number; y: number; width: number; height: number },
    options: ChartOptions
  ): void {
    // Draw grid
    if (options.showGrid) {
      this.drawGrid(ctx, data, area, options);
    }

    const { minVal, maxVal, scale } = this.calculateScale(data, options, area);
    const barCount = data.labels.length;
    const datasetCount = data.datasets.length;
    const groupWidth = area.width / barCount;
    const barWidth = (groupWidth * 0.8) / datasetCount;
    const groupPadding = groupWidth * 0.1;

    // Draw bars
    data.datasets.forEach((dataset, datasetIndex) => {
      const color = dataset.color || COLORS[datasetIndex % COLORS.length];

      dataset.data.forEach((value, i) => {
        const x = area.x + i * groupWidth + groupPadding + datasetIndex * barWidth;
        const barHeight = (value - minVal) * scale;
        const y = area.y + area.height - barHeight;

        // Bar gradient
        const gradient = ctx.createLinearGradient(x, y, x, area.y + area.height);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, this.adjustColor(color, 0.7));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth - 2, barHeight, [4, 4, 0, 0]);
        ctx.fill();
      });
    });

    // Draw labels
    if (options.showLabels) {
      this.drawLabels(ctx, data, area, options);
    }
  }

  // --------------------------------------------------------------------------
  // AREA CHART
  // --------------------------------------------------------------------------

  private renderAreaChart(
    ctx: CanvasRenderingContext2D,
    data: ChartData,
    area: { x: number; y: number; width: number; height: number },
    options: ChartOptions
  ): void {
    // Draw grid
    if (options.showGrid) {
      this.drawGrid(ctx, data, area, options);
    }

    const { minVal, maxVal, scale } = this.calculateScale(data, options, area);

    // Draw datasets (in reverse order for proper layering)
    [...data.datasets].reverse().forEach((dataset, datasetIndex) => {
      const actualIndex = data.datasets.length - 1 - datasetIndex;
      const color = dataset.color || COLORS[actualIndex % COLORS.length];
      const points = this.calculatePoints(data, dataset, area, minVal, scale);

      // Draw filled area
      const gradient = ctx.createLinearGradient(0, area.y, 0, area.y + area.height);
      gradient.addColorStop(0, this.adjustColor(color, 0.3));
      gradient.addColorStop(1, this.adjustColor(color, 0.05));

      ctx.beginPath();
      ctx.moveTo(points[0].x, area.y + area.height);

      points.forEach((point, i) => {
        if (i === 0) {
          ctx.lineTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });

      ctx.lineTo(points[points.length - 1].x, area.y + area.height);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw line on top
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      points.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });

      ctx.stroke();
    });

    // Draw labels
    if (options.showLabels) {
      this.drawLabels(ctx, data, area, options);
    }
  }

  // --------------------------------------------------------------------------
  // DONUT CHART
  // --------------------------------------------------------------------------

  private renderDonutChart(
    ctx: CanvasRenderingContext2D,
    data: ChartData,
    area: { x: number; y: number; width: number; height: number },
    options: ChartOptions
  ): void {
    const centerX = area.x + area.width / 2;
    const centerY = area.y + area.height / 2;
    const radius = Math.min(area.width, area.height) / 2 - 10;
    const innerRadius = radius * 0.6;

    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
    let startAngle = -Math.PI / 2;

    // Draw segments
    data.datasets[0].data.forEach((value, i) => {
      const sliceAngle = (value / total) * Math.PI * 2;
      const color = COLORS[i % COLORS.length];

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      startAngle += sliceAngle;
    });

    // Draw center total
    ctx.fillStyle = options.labelColor || '#374151';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toString(), centerX, centerY - 8);

    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('totalt', centerX, centerY + 12);

    // Draw legend for donut
    this.drawDonutLegend(ctx, data, area, options);
  }

  // --------------------------------------------------------------------------
  // RADAR CHART
  // --------------------------------------------------------------------------

  private renderRadarChart(
    ctx: CanvasRenderingContext2D,
    data: ChartData,
    area: { x: number; y: number; width: number; height: number },
    options: ChartOptions
  ): void {
    const centerX = area.x + area.width / 2;
    const centerY = area.y + area.height / 2;
    const radius = Math.min(area.width, area.height) / 2 - 30;
    const sides = data.labels.length;
    const angleStep = (Math.PI * 2) / sides;

    // Draw grid circles
    for (let i = 1; i <= 5; i++) {
      const r = (radius * i) / 5;
      ctx.beginPath();
      ctx.strokeStyle = options.gridColor || 'rgba(156, 163, 175, 0.2)';
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw axis lines
    for (let i = 0; i < sides; i++) {
      const angle = angleStep * i - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.strokeStyle = options.gridColor || 'rgba(156, 163, 175, 0.2)';
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Draw labels
      const labelX = centerX + Math.cos(angle) * (radius + 15);
      const labelY = centerY + Math.sin(angle) * (radius + 15);

      ctx.fillStyle = options.labelColor || '#6b7280';
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(data.labels[i], labelX, labelY);
    }

    // Draw datasets
    const maxVal = Math.max(...data.datasets.flatMap(d => d.data));

    data.datasets.forEach((dataset, datasetIndex) => {
      const color = dataset.color || COLORS[datasetIndex % COLORS.length];
      const points: { x: number; y: number }[] = [];

      dataset.data.forEach((value, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const r = (value / maxVal) * radius;
        points.push({
          x: centerX + Math.cos(angle) * r,
          y: centerY + Math.sin(angle) * r,
        });
      });

      // Draw filled area
      ctx.beginPath();
      ctx.fillStyle = this.adjustColor(color, 0.2);
      points.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      ctx.fill();

      // Draw outline
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      points.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      ctx.stroke();

      // Draw points
      points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
    });
  }

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------

  private calculateScale(
    data: ChartData,
    options: ChartOptions,
    area: { height: number }
  ): { minVal: number; maxVal: number; scale: number } {
    const allValues = data.datasets.flatMap(d => d.data);
    const minVal = options.minValue ?? Math.min(0, ...allValues);
    const maxVal = options.maxValue ?? Math.max(...allValues) * 1.1;
    const scale = area.height / (maxVal - minVal);

    return { minVal, maxVal, scale };
  }

  private calculatePoints(
    data: ChartData,
    dataset: Dataset,
    area: { x: number; y: number; width: number; height: number },
    minVal: number,
    scale: number
  ): Point[] {
    const step = area.width / (data.labels.length - 1);

    return dataset.data.map((value, i) => ({
      x: area.x + i * step,
      y: area.y + area.height - (value - minVal) * scale,
      value,
      label: data.labels[i],
    }));
  }

  private drawGrid(
    ctx: CanvasRenderingContext2D,
    data: ChartData,
    area: { x: number; y: number; width: number; height: number },
    options: ChartOptions
  ): void {
    const gridLines = 5;
    const allValues = data.datasets.flatMap(d => d.data);
    const maxVal = options.maxValue ?? Math.max(...allValues) * 1.1;
    const minVal = options.minValue ?? Math.min(0, ...allValues);

    ctx.strokeStyle = options.gridColor || 'rgba(156, 163, 175, 0.2)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= gridLines; i++) {
      const y = area.y + (area.height / gridLines) * i;

      ctx.beginPath();
      ctx.moveTo(area.x, y);
      ctx.lineTo(area.x + area.width, y);
      ctx.stroke();

      // Y axis labels
      const value = maxVal - ((maxVal - minVal) / gridLines) * i;
      ctx.fillStyle = options.labelColor || '#6b7280';
      ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(value).toString(), area.x - 8, y);
    }
  }

  private drawLabels(
    ctx: CanvasRenderingContext2D,
    data: ChartData,
    area: { x: number; y: number; width: number; height: number },
    options: ChartOptions
  ): void {
    const step = area.width / (data.labels.length - 1);

    ctx.fillStyle = options.labelColor || '#6b7280';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    data.labels.forEach((label, i) => {
      const x = area.x + i * step;
      ctx.fillText(label, x, area.y + area.height + 8);
    });
  }

  private drawLegend(
    ctx: CanvasRenderingContext2D,
    data: ChartData,
    area: { x: number; y: number; width: number; height: number },
    options: ChartOptions
  ): void {
    const legendY = area.y - 25;
    let legendX = area.x;

    data.datasets.forEach((dataset, i) => {
      const color = dataset.color || COLORS[i % COLORS.length];

      // Draw color box
      ctx.fillStyle = color;
      ctx.fillRect(legendX, legendY, 12, 12);

      // Draw label
      ctx.fillStyle = options.labelColor || '#6b7280';
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(dataset.label, legendX + 16, legendY + 6);

      legendX += ctx.measureText(dataset.label).width + 30;
    });
  }

  private drawDonutLegend(
    ctx: CanvasRenderingContext2D,
    data: ChartData,
    area: { x: number; y: number; width: number; height: number },
    options: ChartOptions
  ): void {
    const legendX = area.x;
    let legendY = area.y + area.height + 20;

    data.labels.forEach((label, i) => {
      const color = COLORS[i % COLORS.length];
      const value = data.datasets[0].data[i];

      ctx.fillStyle = color;
      ctx.fillRect(legendX + (i % 2) * 100, legendY + Math.floor(i / 2) * 20, 10, 10);

      ctx.fillStyle = options.labelColor || '#6b7280';
      ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${label}: ${value}`, legendX + (i % 2) * 100 + 14, legendY + Math.floor(i / 2) * 20 + 5);
    });
  }

  private adjustColor(color: string, alpha: number): string {
    // Convert hex to rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // --------------------------------------------------------------------------
  // EXPORT
  // --------------------------------------------------------------------------

  /**
   * Export chart as PNG
   */
  public exportToPNG(canvas: HTMLCanvasElement, filename: string = 'chart'): void {
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logger.debug('[Chart] Exported as PNG:', filename);
  }

  /**
   * Export chart as data URL
   */
  public toDataURL(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL('image/png');
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const chartService = new ChartService();

// ============================================================================
// REACT COMPONENTS
// ============================================================================

import React, { useRef, useEffect } from 'react';

interface ChartProps {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
  className?: string;
  height?: number;
}

export function Chart({ type, data, options, className = '', height = 300 }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      chartService.render(canvasRef.current, type, data, options);
    }
  }, [type, data, options]);

  // Re-render on resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        chartService.render(canvasRef.current, type, data, options);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [type, data, options]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height }}
    />
  );
}

export function LineChart(props: Omit<ChartProps, 'type'>) {
  return <Chart {...props} type="line" />;
}

export function BarChart(props: Omit<ChartProps, 'type'>) {
  return <Chart {...props} type="bar" />;
}

export function AreaChart(props: Omit<ChartProps, 'type'>) {
  return <Chart {...props} type="area" />;
}

export function DonutChart(props: Omit<ChartProps, 'type'>) {
  return <Chart {...props} type="donut" />;
}

export function RadarChart(props: Omit<ChartProps, 'type'>) {
  return <Chart {...props} type="radar" />;
}

export default chartService;
