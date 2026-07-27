const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'pages', 'Students', 'ManageStudents.jsx');
if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the literal \n string with actual newlines
  content = content.replace(/\\n      setIsSubmitting\(false\);/g, '\n      setIsSubmitting(false);');
  content = content.replace(/\\n      await axios\./g, '\n      await axios.');
  
  fs.writeFileSync(filePath, content);
  console.log("Fixed literal newlines in ManageStudents.jsx");
}
