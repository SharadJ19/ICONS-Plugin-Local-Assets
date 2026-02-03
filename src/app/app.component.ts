// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { ProviderRegistryService } from './core/services/providers/provider-registry.service';
import { IconoirProviderService } from './core/services/providers/iconoir.provider.service';
import { BootstrapProviderService } from './core/services/providers/bootstrap.provider.service';
import { EnvironmentService } from './core/services/environment.service';

@Component({
  selector: 'app-root',
  template: `
    <!-- Main container -->
    <div class="app-container">
      <!-- You can keep your header or remove it for plugin usage
      <header class="app-header" *ngIf="!isPluginMode">
        <h1>{{ title }}</h1>
      </header> -->
      
      <!-- Plugin content will be rendered here -->
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Icons Plugin Standalone';
  isPluginMode = false;

  constructor(
    private providerRegistry: ProviderRegistryService,
    private iconoirProvider: IconoirProviderService,
    private bootstrapProvider: BootstrapProviderService,
    private environment: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.registerProviders();
    this.checkToken();
    
    // Check if we're in plugin mode
    this.isPluginMode = window.location.search.includes('plugin=true');
  }

  private registerProviders(): void {
    this.providerRegistry.registerProvider(
      'ICONOIR',
      'Iconoir',
      this.iconoirProvider,
    );

    this.providerRegistry.registerProvider(
      'BOOTSTRAP',
      'Bootstrap',
      this.bootstrapProvider,
    );

    const defaultProvider = this.environment.uiConfig.defaultProvider;
    this.providerRegistry.setActiveProvider(defaultProvider);
  }

  private checkToken(): void {
    if (!this.environment.githubToken && !this.environment.production) {
      console.warn(
        '⚠️ GitHub token not found. API requests may be rate limited.\n' +
          'Set token in localStorage: localStorage.setItem("github_token", "your_token_here")',
      );
    }
  }
}