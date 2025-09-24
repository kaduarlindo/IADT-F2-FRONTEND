import { Component, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tsp-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tsp-map.component.html',
  styleUrl: './tsp-map.component.css'
})
export class TspMapComponent implements AfterViewInit, OnChanges {
  @Input() routeResult: any;

  private map!: L.Map;
  private markersLayer = L.layerGroup();

  ngAfterViewInit(): void {
    this.initMap();
    if (this.routeResult) {
      this.renderRoute();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['routeResult'] && this.map) {
      this.renderRoute();
    }
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [0, 0], // posição inicial
      zoom: 2
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);
  }

  private renderRoute(): void {
    this.markersLayer.clearLayers();

    if (!this.routeResult || !this.routeResult.solution) {
      return;
    }

    // supondo que solution é um array [{x: number, y: number}, ...]
    const cities = this.routeResult.solution;

    const latlngs: L.LatLngExpression[] = [];

    cities.forEach((city: any, index: number) => {
      const lat = city.y;
      const lng = city.x;

      const marker = L.marker([lat, lng]).bindPopup(`Cidade ${index}`);
      this.markersLayer.addLayer(marker);

      latlngs.push([lat, lng]);
    });

    if (latlngs.length > 1) {
      const polyline = L.polyline(latlngs, { color: 'blue' });
      this.markersLayer.addLayer(polyline);

      // ajusta o mapa para mostrar todos os pontos
      this.map.fitBounds(polyline.getBounds());
    }
  }
}