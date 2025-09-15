import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { TspWebsocketService } from '../../services/tsp-websocket'; 
import { Subscription } from 'rxjs';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-tsp-map.component',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './tsp-map.component.html',
  styleUrl: './tsp-map.component.css'
})
export class TspMapComponent {

tspForm!: FormGroup;
  wsSubscription!: Subscription;
  map: any;
  markers: any[] = [];
  routeLine: any;
  isBrowser: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private fb: FormBuilder, private wsService: TspWebsocketService) {}

  ngOnInit(): void {
    this.tspForm = this.fb.group({
      cities: this.fb.array([this.createCity()])
    });
  }

  async ngAfterViewInit(): Promise<void> {
     if (this.isBrowser) {
      const L = await import('leaflet');

      this.map = L.map('map', { center: [0, 0], zoom: 2 });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);
    }
  }

  get cities(): FormArray { return this.tspForm.get('cities') as FormArray; }

  createCity() {
    return this.fb.group({
      name: ['', Validators.required],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required]
    });
  }

  addCity() { this.cities.push(this.createCity()); }
  removeCity(index: number) { this.cities.removeAt(index); }

  sendForm(): void {
    if (this.tspForm.valid) {
      this.clearMap();
      this.wsService.sendCities(this.tspForm.value.cities);
      this.wsSubscription = this.wsService.routeResult$.subscribe(route => {
        this.renderRoute(route);
      });
    }
  }

  async renderRoute(route: any): Promise<void> {
    const L = await import('leaflet');
    const latlngs: [number, number][] = [];

    route.order.forEach((city: string) => {
      const cityData = this.cities.controls.find(c => c.value.name === city)?.value;
      if (cityData) {
        const latlng: [number, number] = [
          Number(cityData.latitude),
          Number(cityData.longitude)
        ];
        latlngs.push(latlng);
        const marker = L.marker(latlng).addTo(this.map).bindPopup(city);
        this.markers.push(marker);
      }
    });

    this.routeLine = L.polyline(latlngs, { color: 'blue', weight: 4 }).addTo(this.map);

    const group = L.featureGroup([...this.markers]);
    this.map.fitBounds(group.getBounds().pad(0.5));
  }

  clearMap(): void {
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];
    if (this.routeLine) this.map.removeLayer(this.routeLine);
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) this.wsSubscription.unsubscribe();
  }
}
