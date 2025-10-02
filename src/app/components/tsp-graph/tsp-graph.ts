import { Component, Input, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, Vehicle } from '../../models/solution';

type LegendItem = {
  index: number;
  color: string;
  autonomy: number;
  distance: number;
  capacity: number;
};


@Component({
  selector: 'app-tsp-graph',
  imports: [CommonModule],
  templateUrl: './tsp-graph.html',
  styleUrl: './tsp-graph.css',
  standalone: true
})
export class TspGraphComponent implements AfterViewInit {

  @Input() cities: any[] = [];
  @Input() itineraries: Vehicle[] = [];
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  legendData: LegendItem[] = [];

  ngAfterViewInit() {
    console.log('TspGraphComponent initialized');
    console.log('Cities:', this.cities);
    console.log('Itineraries:', this.itineraries);
    this.drawGraph();
  }

  ngOnChanges() {
    this.drawGraph();
  }

  drawGraph() {
    type Point2D = { x: number; y: number };
    type Route2D = { color: string; points: Point2D[]; autonomy: number; distance: number; capacity: number };

    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.cities?.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ---------- Base / escala ----------
    const margin = 40;
    const xs = this.cities.map((c: any) => Number(c.x));
    const ys = this.cities.map((c: any) => Number(c.y));

    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);

    const denomX = (maxX - minX) || 1;
    const denomY = (maxY - minY) || 1;

    const scaleX = (x: number) =>
      margin + ((x - minX) / denomX) * (canvas.width - 2 * margin);
    const scaleY = (y: number) =>
      margin + ((y - minY) / denomY) * (canvas.height - 2 * margin);

    // Pré-processa rotas já em coordenadas de tela
    const colors = ['blue', 'green', 'orange', 'purple', 'brown', 'magenta'];
    const routes2d: Route2D[] = (this.itineraries || []).map((vehicle: any, index: number) => ({
      color: colors[index % colors.length],
      points: (vehicle.route?.coordinates || []).map((p: any) => ({
        x: scaleX(Number(p.x)),
        y: scaleY(Number(p.y)),
      })),
      autonomy: vehicle.autonomy,
      distance: vehicle.route?.distance ?? 0,
      capacity: vehicle.capacity,
    }));

    this.legendData = routes2d.map((r, i) => ({
      index: i + 1,
      color: r.color,
      autonomy: r.autonomy,
      distance: r.distance,
      capacity: r.capacity
    }));

    // ---------- helpers ----------
    const pointToSegmentDistance = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
      const vx = x2 - x1, vy = y2 - y1;
      const wx = px - x1, wy = py - y1;
      const c1 = vx * wx + vy * wy;
      const c2 = vx * vx + vy * vy;
      let t = 0;
      if (c2 > 0) t = Math.max(0, Math.min(1, c1 / c2));
      const projX = x1 + t * vx, projY = y1 + t * vy;
      return Math.hypot(px - projX, py - projY);
    };

    const findHoverVehicle = (mx: number, my: number) => {
      const threshold = 7; // pixels
      for (let i = 0; i < routes2d.length; i++) {
        const pts = routes2d[i].points;
        for (let j = 0; j < pts.length - 1; j++) {
          if (pointToSegmentDistance(mx, my, pts[j].x, pts[j].y, pts[j + 1].x, pts[j + 1].y) <= threshold) {
            return i;
          }
        }
      }
      return -1;
    };

    const render = (hoverIdx: number = -1, mouse?: { x: number; y: number }) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Desenha cidades
      ctx.fillStyle = 'red';
      this.cities.forEach((city: any) => {
        const x = scaleX(Number(city.x));
        const y = scaleY(Number(city.y));
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Desenha rotas
      routes2d.forEach((r, i) => {
        if (!r.points.length) return;
        ctx.beginPath();
        ctx.strokeStyle = r.color;
        ctx.lineWidth = (i === hoverIdx) ? 4 : 2;
        r.points.forEach((pt: any, j: number) => j === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
        ctx.stroke();
      });
    };

    // desenho inicial
    render();

    // hover nas rotas
    canvas.onmousemove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const idx = findHoverVehicle(mx, my);
      canvas.style.cursor = idx >= 0 ? 'pointer' : 'default';
      render(idx, idx >= 0 ? { x: mx, y: my } : undefined);
    };

    canvas.onclick = null;
  }
}
