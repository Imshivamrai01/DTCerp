const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  rollNumber: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  studentClass: {
    type: String,
  
  },

  studentSection:{
    type: String,
    required: true
  },
   status: {
  type: String,
  enum: ['Present', 'Absent'],
  required: true
},
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
}, {
  timestamps: true
});


module.exports = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);