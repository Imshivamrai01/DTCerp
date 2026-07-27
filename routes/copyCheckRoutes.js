const express = require("express");
const router = express.Router();
const {
  createCopyCheck,
  listAllCopyCheck,
  updateCopyCheck,
} = require("../controllers/copyCheckController");

router.post("/", createCopyCheck);
router.get("/all", listAllCopyCheck);
router.route("/:id").put(updateCopyCheck);


module.exports = router;
