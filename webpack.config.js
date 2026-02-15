// webpack.config.js
const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'icons-plugin-standalone',
  filename: 'remoteEntry.js',
  
  exposes: {
    './QlPluginModule': './src/app/ql-plugin/ql-plugin.module.ts',
    './QlDefaultPluginComponent': './src/app/ql-plugin/ql-default-plugin/ql-default-plugin.component.ts',
    './IconBrowserComponent': './src/app/components/icon-browser/icon-browser.component.ts',
  },
  
  shared: {
    ...shareAll({ 
      singleton: true, 
      strictVersion: false, 
      requiredVersion: 'auto' 
    }),
  },
  
  sharedMappings: []
});