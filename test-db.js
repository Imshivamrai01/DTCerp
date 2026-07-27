const mongoose = require("mongoose");
const Student = require("./models/studentModel");

mongoose.connect("mongodb+srv://developer:6543210987@cluster0.k2m9i8t.mongodb.net/DustToCrown?retryWrites=true&w=majority")
  .then(async () => {
    console.log("Connected to MongoDB");
    const students = await Student.find({ isDeleted: { $ne: true } }).select("studentClass studentSection").lean();
    
    const uniqueClasses = [...new Set(students.map(s => `${s.studentClass} - ${s.studentSection}`))];
    console.log("Existing class-section combinations:", uniqueClasses.slice(0, 20));
    
    // Test L.K.G specifically
    const lkgStudents = students.filter(s => s.studentClass === "L.K.G" || s.studentClass === "LKG");
    console.log(`LKG students count: ${lkgStudents.length}`);
    if (lkgStudents.length > 0) {
       console.log("LKG sections:", [...new Set(lkgStudents.map(s => s.studentSection))]);
    }

    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
  });
