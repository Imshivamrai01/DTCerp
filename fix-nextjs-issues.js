const fs = require('fs');
const path = require('path');

console.log("Fixing Next.js UI, Images, and SSR errors...");

// 1. Fix SSR Errors (localStorage is not defined) by making pages client-side only
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

// Re-generate pages with SSR: false to prevent localStorage crash
routes.forEach(route => {
  const routePath = path.join(__dirname, 'app', ...route.path.split('/'));
  const pageFile = path.join(routePath, 'page.jsx');
  const content = `"use client";
import dynamic from 'next/dynamic';

const Component = dynamic(() => import('${route.component}'), { ssr: false });

export default function Page() {
  return <Component />;
}
`;
  if (fs.existsSync(pageFile)) {
    fs.writeFileSync(pageFile, content);
  }
});
console.log("✅ Fixed localStorage SSR crashes by forcing client-side rendering.");

// Also fix the root dashboard page
const dashboardFile = path.join(__dirname, 'app', 'dashboard', 'page.jsx');
if (fs.existsSync(dashboardFile)) {
  fs.writeFileSync(dashboardFile, `"use client";
import dynamic from 'next/dynamic';
const Home = dynamic(() => import('@/pages/Home'), { ssr: false });

export default function Dashboard() {
  return <Home />;
}`);
}

// 2. Fix UI / Alignment (Tailwind CSS wasn't scanning the 'pages/' directory)
const tailwindConfigPath = path.join(__dirname, 'tailwind.config.js');
if (fs.existsSync(tailwindConfigPath)) {
  let tw = fs.readFileSync(tailwindConfigPath, 'utf8');
  if (!tw.includes('"./pages/**/*.{js,ts,jsx,tsx,mdx}"')) {
    tw = tw.replace('content: [', 'content: [\n    "./pages/**/*.{js,ts,jsx,tsx,mdx}",');
    fs.writeFileSync(tailwindConfigPath, tw);
    console.log("✅ Fixed Tailwind CSS styling and alignment.");
  }
}

// 3. Fix Images (Next.js imports images as objects, React/Vite imported as string)
function processDirectoryForImages(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectoryForImages(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Match <img src={variableName}
      // We will blindly replace src={something} with src={something?.src || something} if 'something' doesn't have quotes
      
      const imgRegex = /<img([^>]*?)src=\{([^}"']+)\}/g;
      content = content.replace(imgRegex, (match, before, srcVar) => {
        // if it already has .src, skip
        if (srcVar.includes('.src') || srcVar.includes('||')) return match;
        
        changed = true;
        return `<img${before}src={${srcVar}?.src || ${srcVar}}`;
      });

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`✅ Fixed image URLs in: ${file}`);
      }
    }
  }
}

processDirectoryForImages(path.join(__dirname, 'pages'));
processDirectoryForImages(path.join(__dirname, 'components'));

console.log("\\nAll issues fixed! 🎉 Please restart your server.");
