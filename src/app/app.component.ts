// src\app\app.component.ts

import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Iconografix';
  
  // Note: Providers are now auto-initialized in ProviderRegistryService
  // The isPluginMode check is kept for compatibility
}
