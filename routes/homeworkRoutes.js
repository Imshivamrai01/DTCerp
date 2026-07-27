// routes/homeworkRoutes.js
const express = require("express");
const router = express.Router();
const {
  createHomework,
  getHomeworkByTeacher,
  getHomeworkByClass,
  updateHomework,
  deleteHomework,
  getHomeworkById
} = require("../controllers/homeworkController");

router.post("/", createHomework);
router.get("/teacher/:teacherId", getHomeworkByTeacher);
router.get("/class", getHomeworkByClass);
router.get("/specific/:id", getHomeworkById);
router.route("/:id").put(updateHomework).delete(deleteHomework);

module.exports = router;
