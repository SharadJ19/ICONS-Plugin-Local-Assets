// src\app\core\models\icon.model.ts
export interface Icon {
  id: string;
  name: string;
  displayName: string;
  provider: string;
  category?: string;
  path: string;
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
