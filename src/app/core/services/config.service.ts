// src\app\core\services\config.service.ts

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config = environment;

  isProduction(): boolean {
    return this.config.production;
  }
}
