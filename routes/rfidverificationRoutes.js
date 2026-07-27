const express = require("express");
const router = express.Router();

const {checkRFID,
} = require("../controllers/rfidverificationController");

// Route to check RFID
router.post("/check", checkRFID);

// Export the router
module.exports = router;