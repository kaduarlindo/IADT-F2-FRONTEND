import { City } from './city';

export interface TspRequest {
  command: string;
  populationSize: number;
  numberOfVehicles: number;
  mutationProbability: number;
  vehicleCapacity: number;
  crossoverProbability: number;
  cities: City[];
}