const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'Dust-to-Crown_F-main', 'public');
const destDir = path.join(__dirname, 'public');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir);
}

const files = fs.readdirSync(srcDir);
files.forEach(file => {
  const srcFile = path.join(srcDir, file);
  const destFile = path.join(destDir, file);
  if (fs.statSync(srcFile).isFile()) {
    fs.copyFileSync(srcFile, destFile);
    console.log(`✅ Copied ${file}`);
  }
});
console.log("All missing public images have been copied!");
