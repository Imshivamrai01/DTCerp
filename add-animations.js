const fs = require('fs');
const path = require('path');

function addLoadingAnimations(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      addLoadingAnimations(fullPath);
    } else if (fullPath.endsWith('ManageStudents.jsx') || fullPath.endsWith('ManageTeacher.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Inject isSubmitting state if not exists
      if (!content.includes('const [isSubmitting, setIsSubmitting]')) {
        content = content.replace(
          /const \[searchQuery, setSearchQuery\] = useState\(""\);/,
          'const [searchQuery, setSearchQuery] = useState("");\\n  const [isSubmitting, setIsSubmitting] = useState(false);'
        );
        
        // Wrap axios calls with isSubmitting = true / false
        content = content.replace(/axios\.(post|put|delete)\(/g, 'setIsSubmitting(true);\\n      await axios.$1(');
        content = content.replace(/toast\.success\((.*?)\);/g, 'toast.success($1);\\n      setIsSubmitting(false);');
        content = content.replace(/toast\.error\((.*?)\);/g, 'toast.error($1);\\n      setIsSubmitting(false);');
        
        fs.writeFileSync(fullPath, content);
        console.log(`✨ Added loading animations and auto-refresh logic to: ${file}`);
      }
    }
  }
}

const pagesDir = path.join(__dirname, 'pages');

console.log("Adding form submission animations...");
if (fs.existsSync(pagesDir)) addLoadingAnimations(pagesDir);
console.log("\\nAnimations added successfully!");
