const express = require('express');
const Schedule = require('../models/Schedule');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const { auth, authorize } = require('../middleware/auth');
const { validateSchedule } = require('../middleware/validation');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { classId, subjectId } = req.query;
    let filter = {};

    if (classId) filter.classId = classId;
    if (subjectId) filter.subjectId = subjectId;

    const schedules = await Schedule.find(filter)
      .populate('classId', 'name courseId')
      .populate('subjectId', 'name courseId')
      .sort({ dayOfWeek: 1, time: 1 });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('classId', 'name courseId')
      .populate('subjectId', 'name courseId');
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, authorize('admin'), validateSchedule, async (req, res) => {
  try {
    const classDoc = await Class.findById(req.body.classId);
    if (!classDoc) {
      return res.status(400).json({ message: 'Invalid class ID' });
    }

    const subject = await Subject.findById(req.body.subjectId);
    if (!subject) {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }

    const existingSchedule = await Schedule.findOne({
      classId: req.body.classId,
      subjectId: req.body.subjectId,
      dayOfWeek: req.body.dayOfWeek,
      time: req.body.time
    });

    if (existingSchedule) {
      return res.status(400).json({ message: 'Schedule already exists for this time slot' });
    }

    const schedule = new Schedule(req.body);
    await schedule.save();
    await schedule.populate([
      { path: 'classId', select: 'name courseId' },
      { path: 'subjectId', select: 'name courseId' }
    ]);
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, authorize('admin'), validateSchedule, async (req, res) => {
  try {
    if (req.body.classId) {
      const classDoc = await Class.findById(req.body.classId);
      if (!classDoc) {
        return res.status(400).json({ message: 'Invalid class ID' });
      }
    }

    if (req.body.subjectId) {
      const subject = await Subject.findById(req.body.subjectId);
      if (!subject) {
        return res.status(400).json({ message: 'Invalid subject ID' });
      }
    }

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'classId', select: 'name courseId' },
      { path: 'subjectId', select: 'name courseId' }
    ]);
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;