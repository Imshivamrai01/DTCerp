const express = require("express");
const router = express.Router();
const {
  login,
  logout,
  checkUsers,
} = require("../controllers/firebaseOtpController");

router.post("/login", login);
router.post("/logout", logout);
router.get("/check-users", checkUsers);

module.exports = router;
