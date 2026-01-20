const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateUser = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'cr', 'student']).withMessage('Invalid role'),
  handleValidationErrors
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const validateCourse = [
  body('name').trim().notEmpty().withMessage('Course name is required'),
  body('year').isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  handleValidationErrors
];

const validateSubject = [
  body('name').trim().notEmpty().withMessage('Subject name is required'),
  body('courseId').isMongoId().withMessage('Valid course ID is required'),
  handleValidationErrors
];

const validateClass = [
  body('name').trim().notEmpty().withMessage('Class name is required'),
  body('courseId').isMongoId().withMessage('Valid course ID is required'),
  body('crId').isMongoId().withMessage('Valid CR ID is required'),
  handleValidationErrors
];

const validateStudent = [
  body('name').trim().notEmpty().withMessage('Student name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('rollNumber').trim().notEmpty().withMessage('Roll number is required'),
  body('classId').isMongoId().withMessage('Valid class ID is required'),
  handleValidationErrors
];

const validateAttendance = [
  body('studentId').isMongoId().withMessage('Valid student ID is required'),
  body('subjectId').isMongoId().withMessage('Valid subject ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('status').isIn(['present', 'absent']).withMessage('Status must be present or absent'),
  handleValidationErrors
];

const validateSchedule = [
  body('classId').isMongoId().withMessage('Valid class ID is required'),
  body('subjectId').isMongoId().withMessage('Valid subject ID is required'),
  body('dayOfWeek').isInt({ min: 1, max: 7 }).withMessage('Day must be between 1 and 7'),
  body('time').trim().notEmpty().withMessage('Time is required'),
  handleValidationErrors
];

module.exports = {
  validateUser,
  validateLogin,
  validateCourse,
  validateSubject,
  validateClass,
  validateStudent,
  validateAttendance,
  validateSchedule
};