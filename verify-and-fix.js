const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let fixesApplied = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      fixesApplied += processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // FIX 1: useRouter alias bug
      if (content.includes("import { useRouter as useNavigate } from 'next/navigation';") && content.includes("const navigate = useRouter();")) {
        content = content.replace("import { useRouter as useNavigate } from 'next/navigation';", "import { useRouter } from 'next/navigation';");
        changed = true;
      }
      
      // Also catch double quotes just in case
      if (content.includes('import { useRouter as useNavigate } from "next/navigation";') && content.includes("const navigate = useRouter();")) {
        content = content.replace('import { useRouter as useNavigate } from "next/navigation";', 'import { useRouter } from "next/navigation";');
        changed = true;
      }

      // FIX 2: Find remaining react-router-dom usage
      if (content.includes('react-router-dom')) {
        // e.g. import { Link } from 'react-router-dom'
        content = content.replace(/import\s+{([^}]+)}\s+from\s+["']react-router-dom["'];?/g, (match, imports) => {
          if (imports.includes('Link')) {
            return `import Link from 'next/link';`;
          }
          if (imports.includes('useLocation')) {
            return `import { usePathname } from 'next/navigation';`;
          }
          if (imports.includes('useParams')) {
            return `import { useParams } from 'next/navigation';`;
          }
          return `import { useRouter } from 'next/navigation';`; // Fallback
        });
        
        // Fix useLocation calls
        content = content.replace(/const\s+location\s*=\s*useLocation\(\);?/g, 'const pathname = usePathname();');
        content = content.replace(/location\.pathname/g, 'pathname');
        
        changed = true;
      }

      // Replace navigate inside dependency arrays like [navigate] -> [router] or [navigate]
      // wait, the variable is 'const navigate = useRouter()', so [navigate] is actually fine! 
      // The issue earlier in DashboardLayout was that I renamed 'const navigate =' to 'const router =' but left '[navigate]'

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`🔧 Fixed syntax in: ${file}`);
        fixesApplied++;
      }
    }
  }
  return fixesApplied;
}

const pagesDir = path.join(__dirname, 'pages');
const componentsDir = path.join(__dirname, 'components');

console.log("Scanning sections for Next.js syntax errors...");
const totalFixes = processDirectory(pagesDir) + processDirectory(componentsDir);

console.log(`\\nVerification Complete! Applied fixes to ${totalFixes} sections.`);
