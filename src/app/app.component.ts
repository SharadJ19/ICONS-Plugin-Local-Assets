// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { ProviderRegistryService } from './core/services/providers/provider-registry.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Icons Plugin Standalone';
  isPluginMode = false;

  constructor(
    private providerRegistry: ProviderRegistryService
  ) {}

  ngOnInit(): void {
    // Providers are now auto-initialized in ProviderRegistryService
    this.isPluginMode = window.location.search.includes('plugin=true');
  }
}