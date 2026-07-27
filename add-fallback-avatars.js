const fs = require('fs');
const path = require('path');

const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const avatarRegex = /src=\{((?:item|studentDetail|student|row)?\??\.?avatar\??\.secure_url\??\.src\s*\|\|\s*(?:item|studentDetail|student|row)?\??\.?avatar\??\.secure_url)\}/g;
      const studentAvatarRegex = /src=\{((?:item|studentDetail|student|row)?\??\.?studentAvatar\??\.secure_url\??\.src\s*\|\|\s*(?:item|studentDetail|student|row)?\??\.?studentAvatar\??\.secure_url)\}/g;
      
      let changed = false;
      
      content = content.replace(avatarRegex, (match, p1) => {
        changed = true;
        return `src={${p1} || '${DEFAULT_AVATAR}'}`;
      });
      
      content = content.replace(studentAvatarRegex, (match, p1) => {
        changed = true;
        return `src={${p1} || '${DEFAULT_AVATAR}'}`;
      });

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'pages'));
