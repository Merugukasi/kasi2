const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Schedule = require('../models/Schedule');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cr-attendance', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Subject.deleteMany({});
    await Class.deleteMany({});
    await Student.deleteMany({});
    await Schedule.deleteMany({});

    console.log('Cleared existing data');

    // Create courses
    const courses = await Course.create([
      { name: 'Computer Science', year: 1, semester: 1 },
      { name: 'Computer Science', year: 1, semester: 2 },
      { name: 'Computer Science', year: 2, semester: 1 },
      { name: 'Information Technology', year: 1, semester: 1 }
    ]);

    console.log('Created courses');

    // Create subjects
    const subjects = await Subject.create([
      { courseId: courses[0]._id, name: 'Programming Fundamentals' },
      { courseId: courses[0]._id, name: 'Mathematics I' },
      { courseId: courses[0]._id, name: 'Digital Logic' },
      { courseId: courses[1]._id, name: 'Data Structures' },
      { courseId: courses[1]._id, name: 'Mathematics II' },
      { courseId: courses[2]._id, name: 'Database Systems' },
      { courseId: courses[2]._id, name: 'Web Development' },
      { courseId: courses[3]._id, name: 'Network Fundamentals' },
      { courseId: courses[3]._id, name: 'Business Communication' }
    ]);

    console.log('Created subjects');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@university.edu',
      password: adminPassword,
      role: 'admin'
    });

    console.log('Created admin user');

    // Create CR users
    const cr1Password = await bcrypt.hash('cr123', 12);
    const cr2Password = await bcrypt.hash('cr123', 12);
    
    const cr1 = await User.create({
      name: 'John Smith',
      email: 'john.smith@university.edu',
      password: cr1Password,
      role: 'cr'
    });

    const cr2 = await User.create({
      name: 'Jane Doe',
      email: 'jane.doe@university.edu',
      password: cr2Password,
      role: 'cr'
    });

    console.log('Created CR users');

    // Create classes
    const classes = await Class.create([
      {
        name: 'CS-1A',
        courseId: courses[0]._id,
        crId: cr1._id
      },
      {
        name: 'CS-1B',
        courseId: courses[0]._id,
        crId: cr2._id
      },
      {
        name: 'IT-1A',
        courseId: courses[3]._id,
        crId: cr2._id
      }
    ]);

    console.log('Created classes');

    // Update CR users with class IDs
    cr1.classId = classes[0]._id;
    cr2.classId = classes[1]._id;
    await cr1.save();
    await cr2.save();

    // Create student users and student records
    const studentData = [
      { name: 'Alice Johnson', email: 'alice.j@university.edu', rollNumber: 'CS001', classId: classes[0]._id },
      { name: 'Bob Wilson', email: 'bob.w@university.edu', rollNumber: 'CS002', classId: classes[0]._id },
      { name: 'Charlie Brown', email: 'charlie.b@university.edu', rollNumber: 'CS003', classId: classes[0]._id },
      { name: 'Diana Prince', email: 'diana.p@university.edu', rollNumber: 'CS004', classId: classes[1]._id },
      { name: 'Eva Green', email: 'eva.g@university.edu', rollNumber: 'CS005', classId: classes[1]._id },
      { name: 'Frank Miller', email: 'frank.m@university.edu', rollNumber: 'IT001', classId: classes[2]._id },
      { name: 'Grace Kelly', email: 'grace.k@university.edu', rollNumber: 'IT002', classId: classes[2]._id },
      { name: 'Henry Ford', email: 'henry.f@university.edu', rollNumber: 'IT003', classId: classes[2]._id }
    ];

    const studentPassword = await bcrypt.hash('student123', 12);
    
    for (const studentInfo of studentData) {
      // Create student record
      const student = await Student.create({
        name: studentInfo.name,
        email: studentInfo.email,
        rollNumber: studentInfo.rollNumber,
        classId: studentInfo.classId
      });

      // Create user account for student
      await User.create({
        name: studentInfo.name,
        email: studentInfo.email,
        password: studentPassword,
        role: 'student',
        classId: studentInfo.classId
      });
    }

    console.log('Created students');

    // Create schedules
    await Schedule.create([
      {
        classId: classes[0]._id,
        subjectId: subjects[0]._id,
        dayOfWeek: 1, // Monday
        time: '09:00-10:30'
      },
      {
        classId: classes[0]._id,
        subjectId: subjects[1]._id,
        dayOfWeek: 2, // Tuesday
        time: '10:00-11:30'
      },
      {
        classId: classes[0]._id,
        subjectId: subjects[2]._id,
        dayOfWeek: 3, // Wednesday
        time: '14:00-15:30'
      },
      {
        classId: classes[1]._id,
        subjectId: subjects[0]._id,
        dayOfWeek: 1, // Monday
        time: '11:00-12:30'
      },
      {
        classId: classes[1]._id,
        subjectId: subjects[1]._id,
        dayOfWeek: 3, // Wednesday
        time: '09:00-10:30'
      },
      {
        classId: classes[2]._id,
        subjectId: subjects[7]._id,
        dayOfWeek: 2, // Tuesday
        time: '09:00-10:30'
      },
      {
        classId: classes[2]._id,
        subjectId: subjects[8]._id,
        dayOfWeek: 4, // Thursday
        time: '13:00-14:30'
      }
    ]);

    console.log('Created schedules');

    console.log('\n=== Seed Data Created Successfully ===\n');
    console.log('Login Credentials:\n');
    console.log('Admin: admin@university.edu / admin123');
    console.log('CR 1: john.smith@university.edu / cr123');
    console.log('CR 2: jane.doe@university.edu / cr123');
    console.log('Students: alice.j@university.edu / student123');
    console.log('          bob.w@university.edu / student123');
    console.log('          ... (all students use same password)\n');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedData();