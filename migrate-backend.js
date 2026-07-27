const fs = require('fs');
const path = require('path');

const bDir = path.join(__dirname, '..', 'Dust-to-Crown_B-main');
const nDir = __dirname;

// 1. Copy folders
const foldersToCopy = ['controllers', 'models', 'routes', 'middleware', 'db', 'src'];

function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) fs.mkdirSync(to);
  fs.readdirSync(from).forEach(element => {
    if (fs.lstatSync(path.join(from, element)).isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

foldersToCopy.forEach(folder => {
  const fromPath = path.join(bDir, folder);
  const toPath = path.join(nDir, folder);
  if (fs.existsSync(fromPath)) {
    copyFolderSync(fromPath, toPath);
    console.log(`✅ Copied folder: ${folder}`);
  }
});

// 2. Read backend package.json and inject dependencies into Next.js package.json
const bPkgPath = path.join(bDir, 'package.json');
const nPkgPath = path.join(nDir, 'package.json');
if (fs.existsSync(bPkgPath) && fs.existsSync(nPkgPath)) {
  const bPkg = JSON.parse(fs.readFileSync(bPkgPath, 'utf8'));
  const nPkg = JSON.parse(fs.readFileSync(nPkgPath, 'utf8'));
  
  if (bPkg.dependencies) {
    nPkg.dependencies = { ...nPkg.dependencies, ...bPkg.dependencies };
    nPkg.scripts.dev = "node server.js";
    nPkg.scripts.build = "next build";
    nPkg.scripts.start = "NODE_ENV=production node server.js";
    fs.writeFileSync(nPkgPath, JSON.stringify(nPkg, null, 2));
    console.log(`✅ Merged backend dependencies and updated Next.js scripts`);
  }
}

console.log("\\nBackend migration script completed! Please run 'npm install' to install the merged dependencies.");
