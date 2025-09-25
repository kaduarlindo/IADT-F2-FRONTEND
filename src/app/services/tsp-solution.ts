import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BestSolutionResponse } from '../models/solution';

@Injectable({
  providedIn: 'root'
})
export class TspSolution {
  
  private solutionSubject = new Subject<BestSolutionResponse>();
  solution$ = this.solutionSubject.asObservable();

  handleResponse(json: any) {
    // Faz o cast do JSON para o modelo
    const response: BestSolutionResponse = json as BestSolutionResponse;
    this.solutionSubject.next(response);
  }
}
