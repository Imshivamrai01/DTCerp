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
      let changed = false;
      
      // Fix undefined string interpolations: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/...`
      if (content.includes('process.env.NEXT_PUBLIC_BACKEND_URL')) {
        // Strip it out of template literals like `${process.env.NEXT_PUBLIC_BACKEND_URL}`
        content = content.replace(/\$\{process\.env\.NEXT_PUBLIC_BACKEND_URL\}/g, '');
        // Strip it out of concatenations like process.env.NEXT_PUBLIC_BACKEND_URL + "/api"
        content = content.replace(/process\.env\.NEXT_PUBLIC_BACKEND_URL\s*\+\s*/g, '');
        // Just in case there are bare references left:
        content = content.replace(/process\.env\.NEXT_PUBLIC_BACKEND_URL/g, '""');
        changed = true;
      }

      // Also clean up any lingering import.meta.env.VITE_BACKEND_URL that might have been missed
      if (content.includes('import.meta.env.VITE_BACKEND_URL')) {
        content = content.replace(/\$\{import\.meta\.env\.VITE_BACKEND_URL\}/g, '');
        content = content.replace(/import\.meta\.env\.VITE_BACKEND_URL\s*\+\s*/g, '');
        content = content.replace(/import\.meta\.env\.VITE_BACKEND_URL/g, '""');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`🔧 Cleaned API URLs in: ${file}`);
      }
    }
  }
}

const pagesDir = path.join(__dirname, 'pages');
const componentsDir = path.join(__dirname, 'components');
const appDir = path.join(__dirname, 'app');

console.log("Removing 'undefined' API URLs...");
if (fs.existsSync(pagesDir)) processDirectory(pagesDir);
if (fs.existsSync(componentsDir)) processDirectory(componentsDir);
if (fs.existsSync(appDir)) processDirectory(appDir);
console.log("\\nAll URLs have been fixed to relative paths (e.g. /api/...)");
