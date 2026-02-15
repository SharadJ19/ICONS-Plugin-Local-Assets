// PATH: src/app\ql-plugin\ql-plugin-routing.module.ts
import { NgModule } from '@angular/core';
import { QlDefaultPluginComponent } from './ql-default-plugin/ql-default-plugin.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: QlDefaultPluginComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class QlPluginRoutingModule {}