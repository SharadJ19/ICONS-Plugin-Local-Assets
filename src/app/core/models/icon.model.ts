// src/app/core/models/icon.model.ts
export interface Icon {
  id: string;
  name: string;
  displayName: string;
  provider: string;
  category?: string; // Optional category for organization
  path: string; // Relative path in assets
  svgContent?: string;
}

export interface IconApiResponse {
  data: Icon[];
  pagination: {
    total: number;
    count: number;
    offset: number;
    hasNext: boolean;
  };
}
