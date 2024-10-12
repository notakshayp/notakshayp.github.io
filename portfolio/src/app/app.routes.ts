import { Routes } from '@angular/router';
import { WorkInProgressComponent } from './work-in-progress/work-in-progress.component';

export const routes: Routes = [
    { path: 'WIP', component: WorkInProgressComponent },
    { path: '**', redirectTo: 'WIP' }
];
