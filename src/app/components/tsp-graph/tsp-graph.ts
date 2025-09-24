import { Component, Input, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tsp-graph',
  imports: [CommonModule],
  templateUrl: './tsp-graph.html',
  styleUrl: './tsp-graph.css',
  standalone: true
})
export class TspGraphComponent implements AfterViewInit {

  @Input() cities: any[] = [];
  @Input() itineraries: number[][] = [];
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

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
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.cities.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Escala simples para caber no canvas
    const margin = 40;
    const xs = this.cities.map(c => c.x);
    const ys = this.cities.map(c => c.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);

    function scaleX(x: number) {
      return margin + ((x - minX) / (maxX - minX || 1)) * (canvas.width - 2 * margin);
    }
    function scaleY(y: number) {
      return canvas.height - margin - ((y - minY) / (maxY - minY || 1)) * (canvas.height - 2 * margin);
    }

    // Desenha linhas dos itinerários
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    this.itineraries.forEach(route => {
      ctx.beginPath();
      route.forEach((idx, i) => {
        const city = this.cities[idx];
        if (i === 0) ctx.moveTo(scaleX(city.x), scaleY(city.y));
        else ctx.lineTo(scaleX(city.x), scaleY(city.y));
      });
      ctx.stroke();
    });

    // Desenha pontos das cidades
    this.cities.forEach((city, idx) => {
      ctx.beginPath();
      ctx.arc(scaleX(city.x), scaleY(city.y), 7, 0, 2 * Math.PI);
      ctx.fillStyle = '#2563eb';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '12px Segoe UI';
      ctx.fillText(idx.toString(), scaleX(city.x) - 4, scaleY(city.y) + 4);
    });
  }
}
