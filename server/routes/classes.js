const express = require('express');
const Class = require('../models/Class');
const Course = require('../models/Course');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { validateClass } = require('../middleware/validation');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('courseId', 'name year semester')
      .populate('crId', 'name email')
      .sort({ createdAt: -1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id)
      .populate('courseId', 'name year semester')
      .populate('crId', 'name email');
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(classDoc);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, authorize('admin'), validateClass, async (req, res) => {
  try {
    const course = await Course.findById(req.body.courseId);
    if (!course) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const cr = await User.findById(req.body.crId);
    if (!cr || cr.role !== 'cr') {
      return res.status(400).json({ message: 'Invalid CR user ID or user is not a CR' });
    }

    const classDoc = new Class(req.body);
    await classDoc.save();
    
    cr.classId = classDoc._id;
    await cr.save();

    await classDoc.populate([
      { path: 'courseId', select: 'name year semester' },
      { path: 'crId', select: 'name email' }
    ]);
    
    res.status(201).json(classDoc);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, authorize('admin'), validateClass, async (req, res) => {
  try {
    if (req.body.courseId) {
      const course = await Course.findById(req.body.courseId);
      if (!course) {
        return res.status(400).json({ message: 'Invalid course ID' });
      }
    }

    if (req.body.crId) {
      const cr = await User.findById(req.body.crId);
      if (!cr || cr.role !== 'cr') {
        return res.status(400).json({ message: 'Invalid CR user ID or user is not a CR' });
      }
    }

    const classDoc = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'courseId', select: 'name year semester' },
      { path: 'crId', select: 'name email' }
    ]);
    
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (req.body.crId) {
      await User.updateMany(
        { classId: req.params.id, role: 'cr' },
        { classId: null }
      );
      
      await User.findByIdAndUpdate(req.body.crId, { classId: classDoc._id });
    }

    res.json(classDoc);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const classDoc = await Class.findByIdAndDelete(req.params.id);
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    await User.updateMany(
      { classId: req.params.id },
      { classId: null }
    );

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;