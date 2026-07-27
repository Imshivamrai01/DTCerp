const express = require("express");
const router = express.Router();
const {
  loginUser,
  getMe,
  registeruser,
  listAllusers,
  updateUser,
  deleteUser,
  getAllTeachers,
  updateTeacher,
  searchUsers,
  getTeachersByClassSubjectSection,
  listByRole,
  getFilteredUsers,
  updateUserStatus,
} = require("../controllers/userController");

router.post("/login", loginUser);
router.post("/register", registeruser);
router.get("/filter-lab", getFilteredUsers);
router.get("/all", listAllusers);
router.get("/search", searchUsers);
router.get("/teacher", getAllTeachers);
router.get("/list-role", listByRole);
router.get("/list-teacher", getTeachersByClassSubjectSection);
router.put("/teacher/:id", updateTeacher);
router.put("/status/:id", updateUserStatus);
router.get("/me/:id", getMe);
router.route("/:id").put(updateUser).delete(deleteUser);

module.exports = router;
