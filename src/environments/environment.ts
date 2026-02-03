// src/environments/environment.ts
export const environment = {
  production: false,
  githubToken: '', // Will be empty, set via .env or localStorage
  apiConfig: {
    defaultLimit: 16,
    maxLimit: 100,
    timeout: 30000,
    retryAttempts: 3,
  },
  providers: {
    iconoir: {
      baseUrl: 'https://api.github.com/repos/SharadJ19/free-svg-icons/contents/iconoir-regular-icons',
      displayName: 'Iconoir',
      iconPath: 'iconoir-regular-icons'
    },
    bootstrap: {
      baseUrl: 'https://api.github.com/repos/SharadJ19/free-svg-icons/contents/bootstrap-icons',
      displayName: 'Bootstrap',
      iconPath: 'bootstrap-icons'
    }
  },
  uiConfig: {
    defaultProvider: 'ICONOIR',
    gridColumns: {
      xs: 2,
      sm: 4,
      md: 6,
      lg: 8
    }
  }
};