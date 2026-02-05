// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiConfig: {
    defaultLimit: 30,
    maxLimit: 100,
  },
  providers: {
    iconoir: {
      path: 'iconoir',
      displayName: 'Iconoir'
    },
    bootstrap: {
      path: 'bootstrap',
      displayName: 'Bootstrap'
    },
    feather: {
      path: 'feather',
      displayName: 'Feather'
    },
    gilbarbara: {
      path: 'gilbarbara',
      displayName: 'Gilbarbara'
    },
    heroicons: {
      path: 'heroicons-24-solid',
      displayName: 'Heroicons'
    },
    simpleIcons: {
      path: 'simple-icons',
      displayName: 'Simple Icons'
    },
    brandLogos: {
      path: 'simple-svg-brand-logos',
      displayName: 'Brand Logos'
    },
    tabler: {
      path: 'tabler',
      displayName: 'Tabler'
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