const express = require("express");
const router = express.Router();
const {
  registerStudent,
  getSingleStudent,
  listAllStudents,
  updateStudent,
  deleteStudent,
  filterStudents,
  lastRollNumber,
  lastAdmissionNumber,
  searchStudents,
  fetchStudentsData,
  upgradeStudentClass,
  filterStudentsByClasses,
  filterStudentsByClass,
  updateStudentStatus,
  arrangeStudentsAlphabetically,
  filterAllStudent,
  promoteClass,
  listGraduatedStudents,
  getNextAdmissionNumber,
  bulkUploadStudents,
} = require("../controllers/studentController");

router.post("/register", registerStudent);
router.post("/bulk-upload", bulkUploadStudents);
router.put("/status/:id", updateStudentStatus);
router.get("/all", listAllStudents);
router.get("/search", searchStudents);
router.get("/upgrade", upgradeStudentClass);
router.get("/fetch", fetchStudentsData);
router.get("/last-roll", lastRollNumber);
router.get("/last-admission", lastAdmissionNumber);
router.get("/next-admission-number", getNextAdmissionNumber);
router.get("/filter", filterStudents);
router.get("/filter-by-class", filterStudentsByClass);
router.get("/filter-by-classes", filterStudentsByClasses);
router.get("/filter-all", filterAllStudent);
router.get("/arrange-alphabetically", arrangeStudentsAlphabetically);
router.post("/promote", promoteClass);
router.get("/graduated", listGraduatedStudents);
router
  .route("/:id")
  .get(getSingleStudent)
  .put(updateStudent)
  .delete(deleteStudent);

module.exports = router;
