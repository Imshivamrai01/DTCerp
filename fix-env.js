const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes('import.meta.env')) {
        content = content.replace(/import\.meta\.env\.VITE_BACKEND_URL/g, 'process.env.NEXT_PUBLIC_BACKEND_URL');
        fs.writeFileSync(fullPath, content);
        console.log(`🔧 Fixed API Env Variables in: ${file}`);
      }
    }
  }
}

const pagesDir = path.join(__dirname, 'pages');
const componentsDir = path.join(__dirname, 'components');

console.log("Fixing Environment Variables...");
processDirectory(pagesDir);
processDirectory(componentsDir);
console.log("\\nAll API endpoints have been successfully migrated to Next.js process.env!");
