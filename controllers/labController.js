const Lab = require('../models/labModel');

// Create New Lab Assignment
exports.createLabAssignment = async (req, res) => {
    try {
        const newLab = await Lab.create(req.body);
        res.status(201).json(newLab);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get All Lab Assignments
exports.getAllLabAssignments = async (req, res) => {
    try {
        const labs = await Lab.find().sort({ createdAt: -1 });
        res.status(200).json(labs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Single Lab Assignment By ID
exports.getSingleLabAssignment = async (req, res) => {
    try {
        const lab = await Lab.findById(req.params.id);
        if (!lab) {
            return res.status(404).json({ message: 'Lab Assignment not found' });
        }
        res.status(200).json(lab);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Lab Assignment By ID
exports.updateLabAssignment = async (req, res) => {
    try {
        const lab = await Lab.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!lab) {
            return res.status(404).json({ message: 'Lab Assignment not found' });
        }
        res.status(200).json(lab);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete Lab Assignment By ID
exports.deleteLabAssignment = async (req, res) => {
    try {
        const lab = await Lab.findByIdAndDelete(req.params.id);
        if (!lab) {
            return res.status(404).json({ message: 'Lab Assignment not found' });
        }
        res.status(200).json({ message: 'Lab Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Acknowledge Lab Assignment
exports.acknowledgeLabAssignment = async (req, res) => {
    try {
        const lab = await Lab.findByIdAndUpdate(
            req.params.id,
            { isAcknowledged: true },
            { new: true }
        );
        if (!lab) {
            return res.status(404).json({ message: 'Lab Assignment not found' });
        }
        res.status(200).json(lab);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
// Get Labs with Pagination
exports.getLabsPaginated = async (req, res) => {
    const page = parseInt(req?.query?.page) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    const labs = await Lab.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await Lab.countDocuments();

    res.status(200).json({
        data: labs,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
        },
        success: true,
    });
};
// Search Labs
exports.searchLabs = async (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res
            .status(400)
            .json({ message: "Please enter a query", success: false });
    }

    const regexQuery = new RegExp(query, "i");

    const labs = await Lab.find({
        $or: [
           
          
            { assignedBy: { $regex: regexQuery } },
       {inchargeName: { $regex: regexQuery } },
           
        ],
    });

    if (!labs || labs.length === 0) {
        return res
            .status(404)
            .json({ message: "No labs found!", success: false });
    }

    res.status(200).json({ data: labs, success: true });
};
