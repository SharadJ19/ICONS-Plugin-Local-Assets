// scripts/generate-manifests.js
const fs = require('fs');
const path = require('path');

const iconSets = [
  { folder: 'bootstrap', displayName: 'Bootstrap' },
  { folder: 'feather', displayName: 'Feather' },
  { folder: 'gilbarbara', displayName: 'Gilbarbara' },
  { folder: 'heroicons-24-solid', displayName: 'Heroicons 24 Solid' },
  { folder: 'iconoir', displayName: 'Iconoir Regular' },
  { folder: 'simple-icons', displayName: 'Simple Icons' },
  { folder: 'simple-svg-brand-logos', displayName: 'Simple SVG Brand Logos' },
  { folder: 'tabler', displayName: 'Tabler Filled' }
];

// Base path for icons
const basePath = path.join(__dirname, '../src/assets/icons');

iconSets.forEach(({ folder, displayName }) => {
  const dirPath = path.join(basePath, folder);
  
  if (fs.existsSync(dirPath)) {
    try {
      const files = fs.readdirSync(dirPath)
        .filter(file => file.toLowerCase().endsWith('.svg'))
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
      
      const manifest = {
        provider: folder.toUpperCase().replace(/-/g, '_'),
        displayName: displayName,
        count: files.length,
        lastUpdated: new Date().toISOString(),
        files: files
      };
      
      fs.writeFileSync(
        path.join(dirPath, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
      );
      
      console.log(`✅ Generated manifest for ${displayName}: ${files.length} icons`);
    } catch (error) {
      console.error(`❌ Failed to generate manifest for ${folder}:`, error.message);
    }
  } else {
    console.warn(`⚠️ Directory not found: ${dirPath}`);
  }
});

console.log('\n📊 Summary:');
iconSets.forEach(({ folder, displayName }) => {
  const manifestPath = path.join(basePath, folder, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log(`  ${displayName}: ${manifest.count} icons`);
  }
});