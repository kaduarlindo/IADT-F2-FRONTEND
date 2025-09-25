import { Injectable } from '@angular/core';
import { SharedRoute as SharedRouteService } from './shared-route';
import { Subject } from 'rxjs';
import { BestSolutionResponse } from '../models/solution';
import { TspSolution } from './tsp-solution';

@Injectable({
  providedIn: 'root'
})
export class TspWebsocketService {
  private ws!: WebSocket;
  private routeResultSubject = new Subject<any>();
  public routeResult$ = this.routeResultSubject.asObservable();

  private solutionSubject = new Subject<BestSolutionResponse>();
  solution$ = this.solutionSubject.asObservable();

  constructor(private tspService: TspSolution) {}

  private connectAndSend(message: string) {
    this.ws = new WebSocket("ws://localhost:8000/ws/genetic");

    this.ws.onopen = () => {
      console.log("✅ WebSocket conectado");
      this.ws.send(message); // envia logo após conectar
    };

    this.ws.onerror = (err) => console.error("❌ Erro WebSocket", err);
    this.ws.onclose = (e) => console.warn("⚠️ WebSocket fechado", e);
    this.ws.onmessage = (msg) => {
      console.log("📩 Mensagem recebida:", msg.data);
      this.tspService.handleResponse(JSON.parse(msg.data));
      this.routeResultSubject.next(msg.data);
    };
  }

  sendMessage(message: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      
      this.ws.send(message);
    } else {
      console.log("⏳ Ainda não conectado, conectando agora...");
      this.connectAndSend(message);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      console.log("🔌 Conexão WebSocket encerrada");
    }
  }
}
