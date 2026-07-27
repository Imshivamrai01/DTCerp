const fs = require('fs');
const path = require('path');

function fixRouter(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixRouter(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // If the file uses 'router.push' or 'router.replace' or 'router.back' 
      // but defines 'const navigate = useRouter();'
      if (content.includes('const navigate = useRouter();') && content.match(/router\.(push|replace|back|refresh|prefetch)/)) {
        content = content.replace(/router\.(push|replace|back|refresh|prefetch)/g, 'navigate.$1');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`🔧 Fixed router instance in: ${file}`);
      }
    }
  }
}

const pagesDir = path.join(__dirname, 'pages');
const componentsDir = path.join(__dirname, 'components');
const appDir = path.join(__dirname, 'app');

console.log("Fixing 'router is not defined' errors...");
if (fs.existsSync(pagesDir)) fixRouter(pagesDir);
if (fs.existsSync(componentsDir)) fixRouter(componentsDir);
if (fs.existsSync(appDir)) fixRouter(appDir);
console.log("\\nAll router references have been mapped to 'navigate'!");
