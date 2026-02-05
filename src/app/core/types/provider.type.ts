// src\app\core\types\provider.type.ts
export interface ProviderManifest {
  provider: string;
  displayName: string;
  count: number;
  lastUpdated: string;
  files: string[];
}

export interface ProviderStatistics {
  name: string;
  displayName: string;
  count: number;
  lastUpdated?: string;
}

export interface ProviderInitializationResult {
  success: boolean;
  provider: string;
  count: number;
  error?: string;
}
