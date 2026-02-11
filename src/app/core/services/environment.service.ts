// src/app/core/services/environment.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  get production(): boolean {
    return environment.production;
  }

  get defaultProvider(): string {
    return environment.defaultProvider;
  }
}