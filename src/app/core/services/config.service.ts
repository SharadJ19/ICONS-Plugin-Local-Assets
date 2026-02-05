// src\app\core\services\config.service.ts

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config = environment;

  get apiConfig() {
    return this.config.apiConfig;
  }

  get providerConfig() {
    return this.config.providers;
  }

  isProduction(): boolean {
    return this.config.production;
  }
}
