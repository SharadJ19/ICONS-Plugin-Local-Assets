// PATH: src/app\app-routing.module.ts


import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IconBrowserComponent } from './components/icon-browser/icon-browser.component'; // Import directly
import { QlDefaultPluginComponent } from './ql-plugin/ql-default-plugin/ql-default-plugin.component';

const routes: Routes = [
  { path: '', component: IconBrowserComponent, pathMatch: 'full' }, // Direct to IconBrowser
  { path: 'plugin', component: QlDefaultPluginComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { 
    scrollPositionRestoration: 'enabled',
    enableTracing: false
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {}



