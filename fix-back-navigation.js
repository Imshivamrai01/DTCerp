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
      
      // Fix Next.js back navigation
      if (content.includes('navigate.push(-1)')) {
        content = content.replace(/navigate\.push\(-1\)/g, 'navigate.back()');
        changed = true;
      }
      if (content.includes('router.push(-1)')) {
        content = content.replace(/router\.push\(-1\)/g, 'navigate.back()');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`🔧 Fixed back navigation in: ${file}`);
      }
    }
  }
}

const pagesDir = path.join(__dirname, 'pages');
const componentsDir = path.join(__dirname, 'components');
const appDir = path.join(__dirname, 'app');

console.log("Fixing 'navigate.push(-1)' to 'navigate.back()'");
if (fs.existsSync(pagesDir)) processDirectory(pagesDir);
if (fs.existsSync(componentsDir)) processDirectory(componentsDir);
if (fs.existsSync(appDir)) processDirectory(appDir);
console.log("\\nAll back buttons have been fixed!");
