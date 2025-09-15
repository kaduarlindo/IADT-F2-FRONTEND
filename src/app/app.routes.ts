import { Routes } from '@angular/router';
import { TspComponent } from './components/tsp-component/tsp.component';
import { TspMapComponent } from './components/tsp-map.component/tsp-map.component';

export const routes: Routes = [
    {path: '', component: TspMapComponent}
];
