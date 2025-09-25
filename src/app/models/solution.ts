export interface Coordinate {
  id: number;
  x: string;
  y: string;
}

export interface Route {
  customers: number[];
  distance: number;
  coordinates: Coordinate[];
}

export interface Vehicle {
  capacity: number;
  autonomy: number;
  route: Route;
}

export interface Solution {
  vehicles: Vehicle[];
  fitness: number;
  total_distance: number;
}

export interface BestSolutionResponse {
  event: string;
  generation: number;
  best_distance: number;
  best_fitness: number;
  generation_time: number;
  total_time: number;
  solution: Solution;
}