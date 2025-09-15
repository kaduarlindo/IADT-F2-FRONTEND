import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TspWebsocketService {
  
  private ws!: WebSocketSubject<any>;
  private routeResultSubject = new Subject<any>();
  public routeResult$ = this.routeResultSubject.asObservable();

  constructor() {
    this.connect();
  }

  private connect() {
    // Conectar ao backend WebSocket
    this.ws = webSocket('ws://localhost:8080/api/ws');

    this.ws.subscribe({
      next: msg => {
        // Recebe resposta do backend
        if (msg.type === 'route_result') {
          this.routeResultSubject.next(msg.data);
        }
      },
      error: err => console.error('WebSocket error:', err),
      complete: () => console.log('WebSocket closed')
    });
  }

  sendCities(cities: any[]) {
    // Envia a lista de cidades para o backend
    this.ws.next({ type: 'calculate_route', data: cities });
  }
}
