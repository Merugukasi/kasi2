const express = require('express');
const Student = require('../models/Student');
const Class = require('../models/Class');
const { auth, authorize } = require('../middleware/auth');
const { validateStudent } = require('../middleware/validation');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { classId } = req.query;
    const filter = classId ? { classId } : {};
    const students = await Student.find(filter).populate('classId', 'name courseId').sort({ rollNumber: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('classId', 'name courseId');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, authorize('admin'), validateStudent, async (req, res) => {
  try {
    const classDoc = await Class.findById(req.body.classId);
    if (!classDoc) {
      return res.status(400).json({ message: 'Invalid class ID' });
    }

    const existingStudent = await Student.findOne({ email: req.body.email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }

    const existingRollNumber = await Student.findOne({ rollNumber: req.body.rollNumber });
    if (existingRollNumber) {
      return res.status(400).json({ message: 'Student with this roll number already exists' });
    }

    const student = new Student(req.body);
    await student.save();
    await student.populate('classId', 'name courseId');
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, authorize('admin'), validateStudent, async (req, res) => {
  try {
    if (req.body.classId) {
      const classDoc = await Class.findById(req.body.classId);
      if (!classDoc) {
        return res.status(400).json({ message: 'Invalid class ID' });
      }
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('classId', 'name courseId');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;