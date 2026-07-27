const express = require("express");
const router = express.Router();
const { dataCount } = require("../controllers/homepageController");

router.get("/", dataCount);

module.exports = router;
