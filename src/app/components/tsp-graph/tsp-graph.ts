import { Component, Input, AfterViewInit, ElementRef, ViewChild, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Coordinate, Route, Vehicle } from '../../models/solution';
type LegendItem = {
  index: number;
  color: string;
  autonomy: number;
  distance: number;
  capacity: number;
  names: string[]; // nomes das cidades percorridas
};

@Component({
  selector: 'app-tsp-graph',
  imports: [CommonModule],
  templateUrl: './tsp-graph.html',
  styleUrl: './tsp-graph.css',
  standalone: true
})
export class TspGraphComponent implements AfterViewInit, OnChanges {

  @Input() cities: any[] = [];
  @Input() itineraries: Vehicle[] = [];
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  legendData: LegendItem[] = [];

  // estado do clique (nome e posição para desenhar tooltip)
  private selectedCityName: string | null = null;
  private selectedCityPos: { x: number; y: number } | null = null;

  ngAfterViewInit() {
    this.drawGraph();
  }
  
  ngOnChanges() {
    this.drawGraph();
  }

  private findCityById(id: any) {
    if (id === undefined || id === null) return null;
    return this.cities.find(c => c.id === id || c.identifier === id);
  }

  private findNearestCityByXY(x: number, y: number) {
    // procura na lista this.cities pela menor distância (usando coordenadas originais)
    if (!this.cities?.length) return null;
    let best = null;
    let bestDist = Infinity;
    for (let i = 0; i < this.cities.length; i++) {
      const c = this.cities[i];
      const cx = Number(c.x), cy = Number(c.y);
      const d = Math.hypot(cx - x, cy - y);
      if (d < bestDist) {
        bestDist = d;
        best = c;
      }
    }
    return best;
  }

  drawGraph() {
    type Point2D = { x: number; y: number };
    type Route2D = { color: string; points: Point2D[]; autonomy: number; distance: number; capacity: number; originalCoords: any[] };

    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    if (!this.cities?.length) {
      // limpa canvas se não houver cidades
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

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

    // cidades em coordenadas de tela (usado p/ hit test e labels)
    const cities2d = this.cities.map((city: any, idx: number) => {
      const name = city.name ?? city.label ?? (`Cidade ${idx}`);
      return {
        original: city,
        x: scaleX(Number(city.x)),
        y: scaleY(Number(city.y)),
        name,
        idx
      };
    });

    // Pré-processa rotas já em coordenadas de tela
    const colors = ['blue', 'green', 'orange', 'purple', 'brown', 'magenta'];
    const routes2d: Route2D[] = (this.itineraries || []).map((vehicle: any, index: number) => {
      const originalCoords = (vehicle.route?.coordinates || []);
      const pts: Point2D[] = originalCoords.map((p: any) => {
        // se p tem x,y use diretamente; senão tenta associar por id à cidade original
        if (p && p.x !== undefined && p.y !== undefined) {
          return { x: scaleX(Number(p.x)), y: scaleY(Number(p.y)) };
        }
        // tenta achar cidade pelo id
        const found = this.findCityById(p?.id);
        if (found) {
          return { x: scaleX(Number(found.x)), y: scaleY(Number(found.y)) };
        }
        // fallback: 0,0
        return { x: scaleX(0), y: scaleY(0) };
      });

      return {
        color: colors[index % colors.length],
        points: pts,
        autonomy: vehicle.autonomy ?? 0,
        distance: vehicle.route?.distance ?? 0,
        capacity: vehicle.capacity ?? 0,
        originalCoords
      };
    });

    // Prepara legenda com nomes de cidades por veículo
    this.legendData = routes2d.map((r, i) => {
      const names: string[] = (r.originalCoords || []).map((coord: any, j: number) => {
        // prioriza nome direto na coord
        if (coord && (coord.name || coord.label)) return (coord.name ?? coord.label);
        // coord pode ter id
        if (coord && coord.id !== undefined) {
          const found = this.findCityById(coord.id);
          if (found) return found.name ?? found.label ?? `Cidade ${found.identifier ?? found.id}`;
        }
        // caso não tenha nada, tenta corresponder pelo ponto já escalado (closest)
        const pt = r.points[j];
        if (pt) {
          // encontra cidade2d mais próxima do ponto pt
          let best = null; let bestDist = Infinity;
          for (const c2 of cities2d) {
            const d = Math.hypot(c2.x - pt.x, c2.y - pt.y);
            if (d < bestDist) { bestDist = d; best = c2; }
          }
          if (best && bestDist < 20) return best.name;
        }
        // fallback: índice
        return `Ponto ${j + 1}`;
      });

      return {
        index: i + 1,
        color: r.color,
        autonomy: r.autonomy,
        distance: r.distance,
        capacity: r.capacity,
        names
      } as LegendItem;
    });

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

    // Render principal (aceita label do clique)
    const render = (hoverIdx: number = -1) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // fundo branco sutil
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Desenha cidades (pontos)
      ctx.fillStyle = 'red';
      cities2d.forEach((city) => {
        ctx.beginPath();
        ctx.arc(city.x, city.y, 4, 0, Math.PI * 2);
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

        // desenha pequenos marcadores nos pontos do itinerário
        ctx.fillStyle = r.color;
        r.points.forEach(pt => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      // Se houver label selecionada, desenha tooltip no canvas
      if (this.selectedCityName && this.selectedCityPos) {
        const padding = 6;
        ctx.font = '12px Segoe UI, Arial';
        const text = this.selectedCityName;
        const metrics = ctx.measureText(text);
        const w = metrics.width + padding * 2;
        const h = 18 + padding;
        const x = Math.min(canvas.width - w - 4, Math.max(4, this.selectedCityPos.x + 8));
        const y = Math.max(4, this.selectedCityPos.y - h - 8);

        // tooltip background
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(x, y, w, h);
        // text
        ctx.fillStyle = '#fff';
        ctx.fillText(text, x + padding, y + 14);
      }
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
      render(idx);
    };

    // clique: procura cidade mais próxima do clique e mostra nome
    canvas.onclick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      // procura cidade2d mais próxima
      let best = null; let bestDist = Infinity;
      for (const c2 of cities2d) {
        const d = Math.hypot(c2.x - mx, c2.y - my);
        if (d < bestDist) { bestDist = d; best = c2; }
      }
      const CLICK_THRESHOLD = 12; // pixels
      if (best && bestDist <= CLICK_THRESHOLD) {
        // exibe label no canvas
        this.selectedCityName = best.name;
        this.selectedCityPos = { x: best.x, y: best.y };
        render();
        // opcional: limpa label depois de alguns segundos
        window.setTimeout(() => {
          this.selectedCityName = null;
          this.selectedCityPos = null;
          render();
        }, 3500);
      } else {
        // se não clicou em cidade, limpa
        this.selectedCityName = null;
        this.selectedCityPos = null;
        render();
      }
    };
  }

}
