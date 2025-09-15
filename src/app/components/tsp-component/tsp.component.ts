import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { TspWebsocketService } from '../../services/tsp-websocket';
import { Subscription } from 'rxjs';
import { CommonModule, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-tsp-component',
  imports: [JsonPipe, CommonModule, ReactiveFormsModule],
  templateUrl: './tsp.component.html',
  styleUrl: './tsp.component.css'
})
export class TspComponent {

   tspForm!: FormGroup;
  routeResult: any = null;
  wsSubscription!: Subscription;

  constructor(private fb: FormBuilder, private wsService: TspWebsocketService) {}

  ngOnInit(): void {
    this.tspForm = this.fb.group({
      cities: this.fb.array([
        this.createCity()
      ])
    });
  }

  get cities(): FormArray {
    return this.tspForm.get('cities') as FormArray;
  }

  createCity() {
    return this.fb.group({
      name: ['', Validators.required],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required]
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
      // Envia os dados via WebSocket
      this.wsService.sendCities(this.tspForm.value.cities);
      
      // Se inscreve para receber resposta
      this.wsSubscription = this.wsService.routeResult$.subscribe(result => {
        this.routeResult = result;
        console.log('Rota recebida:', result);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }
}
