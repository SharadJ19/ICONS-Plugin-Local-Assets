// src/app/core/services/environment.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  private readonly config = environment;

  get production(): boolean {
    return this.config.production;
  }

  get githubToken(): string {
    // In production, use environment token
    if (this.config.production) {
      return this.config.githubToken || '';
    }
    
    // In development, check localStorage first, then environment
    const storedToken = localStorage.getItem('github_token');
    return storedToken || this.config.githubToken || '';
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

  setToken(token: string): void {
    if (!this.production) {
      localStorage.setItem('github_token', token);
    }
  }

  clearToken(): void {
    if (!this.production) {
      localStorage.removeItem('github_token');
    }
  }
}