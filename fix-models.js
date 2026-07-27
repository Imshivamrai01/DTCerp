const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');
const files = fs.readdirSync(modelsDir);

files.forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(modelsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Regex to match module.exports = mongoose.model("ModelName", schemaName);
    const regex = /module\.exports\s*=\s*mongoose\.model\(\s*["']([^"']+)["']\s*,\s*([^)]+)\s*\);/g;
    
    if (regex.test(content)) {
      content = content.replace(regex, (match, modelName, schemaName) => {
        return `module.exports = mongoose.models.${modelName} || mongoose.model("${modelName}", ${schemaName});`;
      });
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed ${file}`);
    }
  }
});
