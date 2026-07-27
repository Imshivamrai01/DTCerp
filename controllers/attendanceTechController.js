const TeacherAttendance = require('../models/teacherAttendence'); // Assuming you have a TeacherAttendance model
const User = require('../models/userModel'); // Assuming you have a User model

// Create new attendance record
exports.createAttendance = async (req, res) => {
  try {
    require('fs').appendFileSync('error.log', 'CREATE ATTENDANCE POST BODY: ' + JSON.stringify(req.body) + '\n');
    // Verify the user is a teacher
    const teacher = await User.findOne({
      _id: req.body.teacher,
      $or: [{ role: 'Teacher' }, { secondaryRole: 'Teacher' }]
    });
    
    if (!teacher) {
      return res.status(400).json({ error: 'Invalid teacher ID or user is not a teacher' });
    }

    const attendance = new TeacherAttendance({
      teacher: req.body.teacher,
      name: req.body.name || teacher.name,
      email: req.body.email || teacher.email,
      status: req.body.status,
      date: req.body.date || new Date()
    });

    const savedAttendance = await attendance.save();
    res.status(201).json(savedAttendance);
  } catch (err) {
    console.error("CREATE ATTENDANCE ERROR:", err.message);
    require('fs').appendFileSync('error.log', err.message + '\n');
    res.status(400).json({ error: err.message });
  }
};
exports.updateAttendance = async (req, res) => {
  try {
    const { teacher: teacherId, date, status } = req.body;

    if (!teacherId || !date || !status) {
      return res.status(400).json({ error: 'Teacher, date, and status are required.' });
    }

    const startOfDay = new Date(date + "T00:00:00.000+05:30");
    const endOfDay = new Date(date + "T23:59:59.999+05:30");

    const attendance = await TeacherAttendance.findOneAndUpdate(
      {
        teacher: teacherId,
        date: { $gte: startOfDay, $lte: endOfDay }
      },
      { status },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found for the given date' });
    }

    res.status(200).json({ message: 'Attendance status updated', data: attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markDeparture = async (req, res) => {
  try {
    const { teacherId, date } = req.body;

    if (!teacherId || !date) {
      return res.status(400).json({ error: 'Teacher ID and date are required.' });
    }

    const startOfDay = new Date(date + "T00:00:00.000+05:30");
    const endOfDay = new Date(date + "T23:59:59.999+05:30");

    const attendance = await TeacherAttendance.findOneAndUpdate(
      {
        teacher: teacherId,
        date: { $gte: startOfDay, $lte: endOfDay }
      },
      { departureTime: new Date() },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found for the given date' });
    }

    res.status(200).json({ message: 'Departure time recorded', data: attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Read - Get all attendance records with pagination and optional date filter
exports.getAllAttendance = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 25; // You can change this limit if needed
    const skip = (page - 1) * limit;

    const filter = {};

    // If a date query param is provided, filter by that date (same day range)
    if (req.query.date) {
      const startOfDay = new Date(req.query.date + "T00:00:00.000+05:30");
      const endOfDay = new Date(req.query.date + "T23:59:59.999+05:30");
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Fetch attendance records
    const attendances = await TeacherAttendance.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 }); // Sort by most recent first

    if (!attendances || attendances.length === 0) {
      return res.status(200).json({ 
        message: 'No attendance records found',
        data: [],
        total: 0,
        page,
        totalPages: 1,
        limit
      });
    }

    const totalCount = await TeacherAttendance.countDocuments(filter);

    res.status(200).json({
      message: 'Attendance records fetched successfully',
      data: attendances,
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      limit,
    });

  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getMonthlySummaryForAllTeachers = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'month and year are required' });
    }

    const numericMonth = parseInt(month) - 1; // JavaScript months are 0-based
    const startDate = new Date(year, numericMonth, 1);
    const endDate = new Date(year, numericMonth + 1, 0, 23, 59, 59, 999);

    const summary = await TeacherAttendance.aggregate([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $lookup: {
          from: 'users', // Assuming your teacher details are in 'users' collection
          localField: 'teacher',
          foreignField: '_id',
          as: 'teacherInfo'
        }
      },
      {
        $unwind: '$teacherInfo'
      },
      {
        $group: {
          _id: {
            teacherId: '$teacher',
            name: '$teacherInfo.name',
            email: '$teacherInfo.email'
          },
          statuses: {
            $push: '$status'
          }
        }
      },
      {
        $project: {
          teacherId: '$_id.teacherId',
          name: '$_id.name',
          email: '$_id.email',
          presentCount: {
            $size: {
              $filter: {
                input: '$statuses',
                as: 'status',
                cond: { $eq: ['$$status', 'Present'] }
              }
            }
          },
          absentCount: {
            $size: {
              $filter: {
                input: '$statuses',
                as: 'status',
                cond: { $eq: ['$$status', 'Absent'] }
              }
            }
          },
          leaveCount: {
            $size: {
              $filter: {
                input: '$statuses',
                as: 'status',
                cond: { $eq: ['$$status', 'Leave'] }
              }
            }
          },
          totalDays: { $size: '$statuses' }
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    res.status(200).json({
      month,
      year,
      data: summary
    });

  } catch (error) {
    console.error('Error generating monthly summary:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.exportMonthlySummaryCSV = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'month and year are required' });
    }

    const numericMonth = parseInt(month) - 1;
    const startDate = new Date(year, numericMonth, 1);
    const endDate = new Date(year, numericMonth + 1, 0, 23, 59, 59, 999);

    const summary = await TeacherAttendance.aggregate([
      // Same pipeline as above
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'teacher',
          foreignField: '_id',
          as: 'teacherInfo'
        }
      },
      {
        $unwind: '$teacherInfo'
      },
      {
        $group: {
          _id: {
            teacherId: '$teacher',
            name: '$teacherInfo.name',
            email: '$teacherInfo.email'
          },
          statuses: {
            $push: '$status'
          }
        }
      },
      {
        $project: {
          teacherId: '$_id.teacherId',
          name: '$_id.name',
          email: '$_id.email',
          presentCount: {
            $size: {
              $filter: {
                input: '$statuses',
                as: 'status',
                cond: { $eq: ['$$status', 'Present'] }
              }
            }
          },
          absentCount: {
            $size: {
              $filter: {
                input: '$statuses',
                as: 'status',
                cond: { $eq: ['$$status', 'Absent'] }
              }
            }
          },
          leaveCount: {
            $size: {
              $filter: {
                input: '$statuses',
                as: 'status',
                cond: { $eq: ['$$status', 'Leave'] }
              }
            }
          },
          totalDays: { $size: '$statuses' }
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    // Convert to CSV
    let csv = 'Name,Email,Present Days,Absent Days,Leave Days,Total Days\n';
    
    summary.forEach(teacher => {
      csv += `"${teacher.name}","${teacher.email}",${teacher.presentCount},${teacher.absentCount},${teacher.leaveCount},${teacher.totalDays}\n`;
    });

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_summary_${month}_${year}.csv`);
    
    res.status(200).end(csv);

  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ error: 'Server error' });
  }
};



// // Get all attendance records
// exports.getAllAttendance = async (req, res) => {
//   try {
//     const { startDate, endDate, status } = req.query;
    
//     let query = {};
    
//     if (startDate && endDate) {
//       query.date = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate)
//       };
//     }
    
//     if (status) {
//       query.status = status;
//     }
    
//     const attendance = await TeacherAttendance.find(query)
//       .populate('teacher', 'name email')
//       .sort({ date: -1 });
      
//     res.json(attendance);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get single attendance record
// exports.getAttendanceById = async (req, res) => {
//   try {
//     const attendance = await TeacherAttendance.findById(req.params.id)
//       .populate('teacher', 'name email');
      
//     if (!attendance) {
//       return res.status(404).json({ error: 'Attendance record not found' });
//     }
    
//     res.json(attendance);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Update attendance record
// exports.updateAttendance = async (req, res) => {
//   try {
//     const updates = {
//       status: req.body.status
//     };
    
//     // Optionally allow updating date if needed
//     if (req.body.date) {
//       updates.date = req.body.date;
//     }
    
//     const attendance = await TeacherAttendance.findByIdAndUpdate(
//       req.params.id,
//       updates,
//       { new: true, runValidators: true }
//     ).populate('teacher', 'name email');
    
//     if (!attendance) {
//       return res.status(404).json({ error: 'Attendance record not found' });
//     }
    
//     res.json(attendance);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// // Delete attendance record
// exports.deleteAttendance = async (req, res) => {
//   try {
//     const attendance = await TeacherAttendance.findByIdAndDelete(req.params.id);
    
//     if (!attendance) {
//       return res.status(404).json({ error: 'Attendance record not found' });
//     }
    
//     res.json({ message: 'Attendance record deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };