// src\app\core\services\environment.service.ts

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  private readonly config = environment;

  get production(): boolean {
    return this.config.production;
  }

  get githubToken(): string {
    return '';
  }

  get apiConfig() {
    return this.config.apiConfig;
  }

  get providerConfig() {
    return this.config.providers;
  }

  get uiConfig() {
    return this.config.uiConfig;
  }

  getProviderConfig(providerName: string): any {
    const providers = this.config.providers as any;
    return providers[providerName.toLowerCase()] || null;
  }
}
