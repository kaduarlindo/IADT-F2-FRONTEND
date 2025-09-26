import { Component, Input, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route } from '../../models/solution';

@Component({
  selector: 'app-tsp-graph',
  imports: [CommonModule],
  templateUrl: './tsp-graph.html',
  styleUrl: './tsp-graph.css',
  standalone: true
})
export class TspGraphComponent implements AfterViewInit {

  @Input() cities: any[] = [];
  @Input() itineraries: Route[] = [];
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

    const margin = 40;
    const xs = this.cities.map(c => Number(c.x));
    const ys = this.cities.map(c => Number(c.y));

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const scaleX = (x: number) =>
      margin + ((x - minX) / (maxX - minX)) * (canvas.width - 2 * margin);
    const scaleY = (y: number) =>
      margin + ((y - minY) / (maxY - minY)) * (canvas.height - 2 * margin);

    // Guardar posições das cidades para interação
    const cityPositions: { city: any; x: number; y: number }[] = [];

    // Desenhar cidades
    ctx.fillStyle = 'red';
    this.cities.forEach(city => {
      const x = scaleX(Number(city.x));
      const y = scaleY(Number(city.y));
      cityPositions.push({ city, x, y });

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Desenhar rotas
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;

    this.itineraries.forEach(route => {
      if (!route.coordinates.length) return;

      ctx.beginPath();
      route.coordinates.forEach((point, i) => {
        const x = scaleX(Number(point.x));
        const y = scaleY(Number(point.y));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    // Função para detectar cidade próxima do mouse
    const getCityAt = (mx: number, my: number) => {
      return cityPositions.find(
        p => Math.hypot(p.x - mx, p.y - my) < 7 // raio de clique
      )?.city;
    };

    // Evento hover
    canvas.onmousemove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const city = getCityAt(mx, my);

      canvas.style.cursor = city ? 'pointer' : 'default';
    };

    // Evento click
    canvas.onclick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const city = getCityAt(mx, my);

      if (city) {
        alert(`Cidade: ${city.name || city.id}`); // você pode personalizar o conteúdo
      }
    };
  }
}
