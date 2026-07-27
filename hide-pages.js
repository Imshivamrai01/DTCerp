const fs = require('fs');
const path = require('path');

// 1. Rename 'pages' directory to 'views'
if (fs.existsSync('pages')) {
  fs.renameSync('pages', 'views');
  console.log("Renamed 'pages' to 'views'");
}

// 2. Update app/**/*.jsx files to import from @/views/ instead of @/pages/
function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('@/pages/')) {
        content = content.replace(/@\/pages\//g, '@/views/');
        fs.writeFileSync(fullPath, content);
        console.log(`Updated imports in ${fullPath}`);
      }
    }
  }
}

processDirectory('app');

// 3. Update tailwind.config.js
if (fs.existsSync('tailwind.config.js')) {
  let tw = fs.readFileSync('tailwind.config.js', 'utf8');
  if (tw.includes('./pages/')) {
    tw = tw.replace(/\.\/pages\//g, './views/');
    fs.writeFileSync('tailwind.config.js', tw);
    console.log("Updated tailwind.config.js");
  }
}
