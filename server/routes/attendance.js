const express = require('express');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const { auth, authorize } = require('../middleware/auth');
const { validateAttendance } = require('../middleware/validation');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { studentId, subjectId, date, classId } = req.query;
    let filter = {};

    if (studentId) filter.studentId = studentId;
    if (subjectId) filter.subjectId = subjectId;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    let attendanceQuery = Attendance.find(filter)
      .populate('studentId', 'name rollNumber email')
      .populate('subjectId', 'name courseId')
      .populate('markedBy', 'name email')
      .sort({ date: -1 });

    const attendance = await attendanceQuery;

    if (classId) {
      const classStudents = await Student.find({ classId }).select('_id');
      const studentIds = classStudents.map(s => s._id);
      const filteredAttendance = attendance.filter(a => 
        studentIds.some(id => id.toString() === a.studentId._id.toString())
      );
      return res.json(filteredAttendance);
    }

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/report/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find({
      studentId,
      ...dateFilter
    })
    .populate('subjectId', 'name')
    .sort({ date: -1 });

    const summary = attendance.reduce((acc, record) => {
      const subjectName = record.subjectId.name;
      if (!acc[subjectName]) {
        acc[subjectName] = { present: 0, absent: 0, total: 0 };
      }
      acc[subjectName][record.status]++;
      acc[subjectName].total++;
      return acc;
    }, {});

    Object.keys(summary).forEach(subject => {
      const { present, total } = summary[subject];
      summary[subject].percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;
    });

    res.json({ attendance, summary });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/mark', auth, authorize('cr', 'admin'), validateAttendance, async (req, res) => {
  try {
    const { studentId, subjectId, date, status } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    const subject = await Subject.findById(subjectId).populate('courseId');
    if (!subject) {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }

    if (req.user.role === 'cr') {
      const userClass = await Class.findById(req.user.classId).populate('courseId');
      if (!userClass || userClass.courseId._id.toString() !== subject.courseId._id.toString()) {
        return res.status(403).json({ message: 'You can only mark attendance for your class subjects' });
      }

      const studentInClass = await Student.findById(studentId);
      if (studentInClass.classId.toString() !== req.user.classId.toString()) {
        return res.status(403).json({ message: 'Student is not in your class' });
      }
    }

    const existingAttendance = await Attendance.findOne({
      studentId,
      subjectId,
      date: new Date(date)
    });

    if (existingAttendance) {
      existingAttendance.status = status;
      existingAttendance.markedBy = req.user.id;
      await existingAttendance.save();
      return res.json(existingAttendance);
    }

    const attendance = new Attendance({
      studentId,
      subjectId,
      date: new Date(date),
      status,
      markedBy: req.user.id
    });

    await attendance.save();
    await attendance.populate([
      { path: 'studentId', select: 'name rollNumber' },
      { path: 'subjectId', select: 'name' },
      { path: 'markedBy', select: 'name email' }
    ]);

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/mark-batch', auth, authorize('cr', 'admin'), async (req, res) => {
  try {
    const { subjectId, date, attendanceRecords } = req.body;

    const subject = await Subject.findById(subjectId).populate('courseId');
    if (!subject) {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }

    if (req.user.role === 'cr') {
      const userClass = await Class.findById(req.user.classId).populate('courseId');
      if (!userClass || userClass.courseId._id.toString() !== subject.courseId._id.toString()) {
        return res.status(403).json({ message: 'You can only mark attendance for your class subjects' });
      }
    }

    const results = [];
    for (const record of attendanceRecords) {
      const { studentId, status } = record;

      const existingAttendance = await Attendance.findOne({
        studentId,
        subjectId,
        date: new Date(date)
      });

      if (existingAttendance) {
        existingAttendance.status = status;
        existingAttendance.markedBy = req.user.id;
        await existingAttendance.save();
        results.push(existingAttendance);
      } else {
        const attendance = new Attendance({
          studentId,
          subjectId,
          date: new Date(date),
          status,
          markedBy: req.user.id
        });
        await attendance.save();
        results.push(attendance);
      }
    }

    res.status(201).json({ message: 'Attendance marked successfully', results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;