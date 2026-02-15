// PATH: src/app\core\services\environment.service.ts

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

  get defaultLimit(): number {
    return environment.defaultLimit;
  }

  get enableDebugLogging(): boolean {
    return environment.enableDebugLogging;
  }

  get assetsPath(): string {
    return environment.assetsPath;
  }

  get svgCacheTimeout(): number {
    return environment.svgCacheTimeout;
  }

  get doubleClickThreshold(): number {
    return environment.doubleClickThreshold;
  }

  get searchDebounceTime(): number {
    return environment.searchDebounceTime;
  }

  // Feature flags
  get enableMultiSelect(): boolean {
    return environment.enableMultiSelect;
  }

  get enablePluginMode(): boolean {
    return environment.enablePluginMode;
  }
}