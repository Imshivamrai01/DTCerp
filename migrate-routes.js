const fs = require('fs');
const path = require('path');

const routes = [
  { path: "manage-admins", component: "@/pages/Admins/ManageAdmins" },
  { path: "manage-teacher", component: "@/pages/Admins/ManageTeacher" },
  { path: "manage-coordinator", component: "@/pages/Admins/ManageCoordinator" },
  { path: "manage-admin", component: "@/pages/Admins/ManageAdmin" },
  { path: "manage-fees", component: "@/pages/Fee-Management/ListFee" },
  { path: "fee-structure", component: "@/pages/Fee-Management/FeeStructure" },
  { path: "take-fees/[id]", component: "@/pages/Fee-Management/TakeFee" },
  { path: "view-fees/[id]", component: "@/pages/Fee-Management/ViewFees" },
  { path: "manage-students", component: "@/pages/Students/ManageStudents" },
  { path: "manage-copies", component: "@/pages/Manage-Copies/ManageCopies" },
  { path: "tc-certificate", component: "@/pages/Certificates/TCertificate" },
  { path: "manage-attendence-student", component: "@/pages/Students/StudentAttendece" },
  { path: "display-attendence-stu", component: "@/pages/Students/StudentList" },
  { path: "manage-attendence-teacher", component: "@/pages/Teachers/TeacherAttendance" },
  { path: "display-attendence", component: "@/pages/Teachers/AttendenceList" },
  { path: "manage-exam-copies", component: "@/pages/Manage-exam-copies/ManageExamCopies" },
  { path: "assign-classes", component: "@/pages/Teachers/AssignClasses" },
  { path: "homework", component: "@/pages/Homework/Homework" },
  { path: "add-homework", component: "@/pages/Homework/AddHomework" },
  { path: "stu-attendence-view", component: "@/pages/Admins/ManageStuAtten" },
  { path: "assign-work", component: "@/pages/Work-Assignment/AssignWork" },
  { path: "update-work", component: "@/pages/Work-Assignment/UpdateWork" },
  { path: "work-list", component: "@/pages/Work-Assignment/WorkList" },
  { path: "manage-all-attendance", component: "@/pages/Students/StudentList" },
  { path: "share-homework/[classSection]", component: "@/pages/Homework/ShareHomework" },
  { path: "homework/[id]", component: "@/pages/Homework/EditHomework" },
  { path: "assign-lab", component: "@/pages/Lab/LabForm" },
  { path: "update-lab/[id]", component: "@/pages/Lab/UpdateLab" },
  { path: "list-lab", component: "@/pages/Lab/LabList" }
];

console.log("Starting Next.js App Router Migration...");

// 1. Create Route Folders
routes.forEach(route => {
  const routePath = path.join(__dirname, 'app', ...route.path.split('/'));
  if (!fs.existsSync(routePath)) {
    fs.mkdirSync(routePath, { recursive: true });
  }

  // Create page.jsx inside each route
  const pageFile = path.join(routePath, 'page.jsx');
  const content = `"use client";
import Component from "${route.component}";

export default function Page() {
  return <Component />;
}
`;
  fs.writeFileSync(pageFile, content);
  console.log(`✅ Created route: /${route.path}`);
});

// 2. Fix React Router Hooks in pages/ directory
function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Keep track if we changed anything
      let changed = false;

      // Replace imports
      if (content.includes('react-router-dom')) {
        content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]react-router-dom['"];?/g, (match, imports) => {
          let nextImports = [];
          if (imports.includes('useNavigate')) nextImports.push('useRouter');
          if (imports.includes('useLocation')) nextImports.push('usePathname');
          if (imports.includes('useParams')) nextImports.push('useParams');
          
          if (nextImports.length > 0) {
            return `import { ${nextImports.join(', ')} } from 'next/navigation';`;
          }
          return '';
        });
        changed = true;
      }

      // Replace useNavigate()
      if (content.includes('useNavigate()')) {
        content = content.replace(/const\s+(\w+)\s*=\s*useNavigate\(\);?/g, 'const $1 = useRouter();');
        changed = true;
      }
      
      // Replace navigate('/path') to router.push('/path')
      if (content.includes('navigate(')) {
        content = content.replace(/navigate\(/g, 'router.push(');
        changed = true;
      }

      // Replace useLocation()
      if (content.includes('useLocation()')) {
        content = content.replace(/const\s+(\w+)\s*=\s*useLocation\(\);?/g, 'const $1 = usePathname();');
        content = content.replace(/location\.pathname/g, 'pathname');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`🔧 Updated hooks in: ${file}`);
      }
    }
  }
}

console.log("\\nUpdating React Router hooks to Next.js...");
processDirectory(path.join(__dirname, 'pages'));

console.log("\\nMigration complete! 🎉 All panels and sections are now mapped.");
