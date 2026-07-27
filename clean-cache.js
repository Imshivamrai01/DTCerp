const fs = require('fs');
const path = require('path');

const nextDir = path.join(__dirname, '.next');

if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('✅ Successfully deleted the .next cache folder.');
} else {
  console.log('✅ .next folder does not exist or was already deleted.');
}
