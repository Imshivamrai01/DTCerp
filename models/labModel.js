const mongoose = require('mongoose');

// Define Schema for Lab Work Assignments
const labSchema = new mongoose.Schema({
    assignedBy: { 
        type: String,
        required: true
    },
    assignedDate: { 
        type: Date,
        required: true
    },
    assignedClass: {
        type: String,
        required: true
    },
    assignedSection:{
type: String,
    },
    inchargeName: { 
        type: String,
        required: true
    },
    practicalDescription: {
        type: String
    },
    isCompleted: { 
        type: Boolean,
        default: false
    }
    ,
    isAcknowledged: {
    type: Boolean,
    default: false
}
}, {
    timestamps: true  
});

// Create and Export Model
const Lab = mongoose.model('Lab', labSchema);
module.exports = Lab;
