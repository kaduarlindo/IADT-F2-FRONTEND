import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { TspWebsocketService } from '../../services/tsp-websocket';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { City } from '../../models/city';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TspGraphComponent } from '../tsp-graph/tsp-graph';
import { BestSolutionResponse, Vehicle } from '../../models/solution';
import { Route } from '../../models/solution';

@Component({
  selector: 'app-tsp-component',
  imports: [CommonModule, ReactiveFormsModule, MatProgressSpinnerModule, TspGraphComponent],
  templateUrl: './tsp.component.html',
  styleUrls: ['./tsp.component.css'],
  standalone: true
})
export class TspComponent {
  tspForm!: FormGroup;
  routeResult!: BestSolutionResponse;
  wsSubscription!: Subscription;
  spinnerVisible = false;

  citiesResposnse: City[] = [];
  itinerariesResponse: Vehicle[] = [];

  constructor(private fb: FormBuilder, private wsService: TspWebsocketService) {}

  ngOnInit(): void {
    this.tspForm = this.fb.group({
      cities: this.fb.array([ this.createCity() ])
    });
  }

  get cities(): FormArray {
    return this.tspForm.get('cities') as FormArray;
  }

  createCity() {
    return this.fb.group({
      x: ['', Validators.required],
      y: ['', Validators.required],
      priority: [false, Validators.required],
      demand: ['', Validators.required]
    });
  }

  addCity() {
    this.cities.push(this.createCity());
  }

  removeCity(index: number) {
    this.cities.removeAt(index);
  }

  sendForm() {
    if (this.tspForm.valid) {
      this.spinnerVisible = true;

      const citiesData = this.tspForm.value.cities.map(
        (city: City, index: number) => ({
          identifier: index,
          x: city.x,
          y: city.y,
          priority: city.priority ? 1 : 0,
          demand: Number(city.demand)
        })
      );

      const payload = { command: 'start', cities: citiesData };
      this.wsService.sendMessage(JSON.stringify(payload));

      this.wsSubscription = this.wsService.routeResult$.subscribe(result => {
        this.routeResult = JSON.parse(result);
        this.citiesResposnse = Array.from(
                                          new Map(
                                            this.routeResult.solution.vehicles
                                              .flatMap(v => v.route.coordinates.map(element => ({
                                                identifier: element.id,
                                                x: element.x,
                                                y: element.y
                                              } as City)))
                                              .map(city => [city.identifier, city])
                                          ).values()
                                        );
                this.itinerariesResponse = this.routeResult.solution.vehicles;              
                               
        console.log('Cidades:', this.citiesResposnse);
        console.log('Itinerários:', this.itinerariesResponse);
        this.spinnerVisible = false;
      });
    }
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }
}