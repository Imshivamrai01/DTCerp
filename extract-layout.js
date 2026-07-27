const fs = require('fs');
const path = require('path');

// Read the original App.jsx
const originalAppPath = path.join(__dirname, '..', 'Dust-to-Crown_F-main', 'src', 'App.jsx');
let appContent = fs.readFileSync(originalAppPath, 'utf8');

// Replace react-router-dom imports with next/navigation
appContent = appContent.replace(/import\s+{([^}]+)}\s+from\s+["']react-router-dom["'];?/, (match, imports) => {
  return `import { useRouter, usePathname } from 'next/navigation';`;
});
appContent = appContent.replace(/const\s+navigate\s*=\s*useNavigate\(\);/g, 'const router = useRouter();');
appContent = appContent.replace(/navigate\(/g, 'router.push(');
appContent = appContent.replace(/const\s+location\s*=\s*useLocation\(\);/g, 'const pathname = usePathname();');
appContent = appContent.replace(/location\.pathname/g, 'pathname');

// We need to pass 'children' to the App component and use it where Routes used to be
appContent = appContent.replace(/const\s+App\s*=\s*\(\)\s*=>\s*{/, 'const DashboardLayout = ({ children }) => {');

// Remove the Routes and replace with children
// The routes are between <Routes> and </Routes> inside TeacherLayout, OR in the else block for Login
// For the DashboardLayout, we ONLY want the authenticated view!
// So let's just find the entire authenticated view.

// To make it easy, we will just find <Routes>...</Routes> and replace with {children}
const routesRegex = /<Routes>[\s\S]*?<\/Routes>/g;
appContent = appContent.replace(routesRegex, '{children}');

// Also replace TeacherLayout imports just in case
appContent = appContent.replace(/import\s+Home\s+from.*/g, '');
appContent = appContent.replace(/import\s+Login\s+from.*/g, '');
appContent = appContent.replace(/import\s+ManageAdmins\s+from.*/g, '');
appContent = appContent.replace(/import\s+ManageStudents\s+from.*/g, '');
// ... basically remove all page imports
appContent = appContent.replace(/import\s+[A-Z][a-zA-Z0-9]+\s+from\s+["']\.\/pages\/[^"']+["'];?/g, '');

// Finally, replace 'export default App;' with 'export default DashboardLayout;'
appContent = appContent.replace(/export default App;/, 'export default DashboardLayout;');

const imgRegex = /<img([^>]*?)src=\{([^}"']+)\}/g;
appContent = appContent.replace(imgRegex, (match, before, srcVar) => {
  if (srcVar.includes('.src') || srcVar.includes('||')) return match;
  return "<img" + before + "src={" + srcVar + "?.src || " + srcVar + "}";
});

// Write to components/DashboardLayout.jsx
const layoutPath = path.join(__dirname, 'components', 'DashboardLayout.jsx');
// Ensure components directory exists
if (!fs.existsSync(path.join(__dirname, 'components'))) {
  fs.mkdirSync(path.join(__dirname, 'components'));
}

fs.writeFileSync(layoutPath, '"use client";\n' + appContent);
console.log("✅ Created components/DashboardLayout.jsx from App.jsx");

// Now update app/layout.js to conditionally render DashboardLayout
const nextLayoutPath = path.join(__dirname, 'app', 'layout.jsx');
let nextLayoutContent = fs.readFileSync(nextLayoutPath, 'utf8');

if (!nextLayoutContent.includes('DashboardLayout')) {
  // we will import ClientLayoutWrapper to handle the logic
  const wrapperContent = `"use client";
import { usePathname } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  
  // Do not show sidebar on login page
  if (pathname === '/' || pathname === '/login') {
    return <>{children}</>;
  }
  
  return <DashboardLayout>{children}</DashboardLayout>;
}
`;
  fs.writeFileSync(path.join(__dirname, 'components', 'ClientLayoutWrapper.jsx'), wrapperContent);
  console.log("✅ Created ClientLayoutWrapper.jsx");

  // Modify root layout
  nextLayoutContent = `import "./globals.css";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

export const metadata = {
  title: "Dust to Crown Portal",
  description: "D2C School Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
`;
  fs.writeFileSync(nextLayoutPath, nextLayoutContent);
  console.log("✅ Updated app/layout.jsx to use global layout");
}

console.log("All layout tasks finished!");
