// src\app\app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { QlDefaultPluginComponent } from './ql-plugin/ql-default-plugin/ql-default-plugin.component';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'plugin', component: QlDefaultPluginComponent },
  { path: '**', redirectTo: '' } // Wildcard route for 404
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { 
    scrollPositionRestoration: 'enabled',
    enableTracing: false // Set to true for debugging routes
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
