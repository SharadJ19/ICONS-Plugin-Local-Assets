// src\app\ql-plugin\ql-plugin.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QlPluginRoutingModule } from './ql-plugin-routing.module';
import { QlDefaultPluginComponent } from './ql-default-plugin/ql-default-plugin.component';
import { HomeComponent } from '../pages/home/home.component';
import { IconCardComponent } from '../components/icon-card/icon-card.component';
import { LoadingSpinnerComponent } from '../components/loading-spinner/loading-spinner.component';
import { ProviderSelectorComponent } from '../components/provider-selector/provider-selector.component';
import { SelectionFooterComponent } from '../components/selection-footer/selection-footer.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    QlDefaultPluginComponent,
    HomeComponent,
    IconCardComponent,
    ProviderSelectorComponent,
    LoadingSpinnerComponent,
  ],
  imports: [
    CommonModule,
    QlPluginRoutingModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    SelectionFooterComponent,
  ],
  exports: [
    QlDefaultPluginComponent,
    HomeComponent,
    IconCardComponent,
    ProviderSelectorComponent,
    LoadingSpinnerComponent,
    SelectionFooterComponent,
  ],
})
export class QlPluginModule {
  static rootComponent = QlDefaultPluginComponent;
}