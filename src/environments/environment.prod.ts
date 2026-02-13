// src/environments/environment.prod.ts
export const environment = {
  production: true,
  defaultProvider: 'ICONOIR',
  defaultLimit: 24,
  enableDebugLogging: false,
  assetsPath: '/assets/icons',
  svgCacheTimeout: 3600000,
  doubleClickThreshold: 300,
  searchDebounceTime: 400,
  
  // Feature flags
  enableMultiSelect: true,
  enablePluginMode: true
};