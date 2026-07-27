    const express = require('express');
const router = express.Router();
const {searchLabs,getLabsPaginated,createLabAssignment,getAllLabAssignments,getSingleLabAssignment,updateLabAssignment,deleteLabAssignment,acknowledgeLabAssignment} = require('../controllers/labController');

// Create
router.post('/', createLabAssignment);

// Read All
router.get('/', getAllLabAssignments);

router.get("/pg", getLabsPaginated);
router.get("/search", searchLabs);
router.get('/:id', getSingleLabAssignment);

// Update
router.put('/:id', updateLabAssignment);

// Delete
router.delete('/:id', deleteLabAssignment);

// Acknowledge
router.patch('/:id/acknowledge', acknowledgeLabAssignment);

module.exports = router;
