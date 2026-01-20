# CR Attendance Management System

A comprehensive attendance management system built with the MERN stack (MongoDB, Express, React, Node.js) for educational institutions. This system allows administrators to manage courses, classes, and students, while class representatives can mark attendance and generate reports.

## Features

### Role-Based Access Control
- **Admin**: Full access to manage courses, subjects, classes, students, schedules, and view all attendance reports
- **Class Representative (CR)**: Mark attendance for assigned class subjects and view attendance reports
- **Student**: View personal attendance history and statistics

### Key Features
- User authentication with JWT
- Course and subject management
- Class and student management
- Schedule management
- Attendance marking with batch operations
- Comprehensive attendance reports
- Real-time statistics and analytics
- Responsive design with Tailwind CSS

## Technology Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- bcryptjs for password hashing
- Express Validator for input validation

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling
- Context API for state management

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd cr-attendance-system
```

### Step 2: Backend Setup
1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
# Create a .env file in the server directory
MONGODB_URI=mongodb://localhost:27017/cr-attendance
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

4. Run the database seed script:
```bash
npm run seed
```

5. Start the backend server:
```bash
npm run dev  # For development with nodemon
# or
npm start   # For production
```

### Step 3: Frontend Setup
1. Navigate to the client directory:
```bash
cd ../client
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
# Create a .env file in the client directory
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

## Default Login Credentials

After running the seed script, you can use these credentials to test the system:

### Admin Account
- **Email**: admin@university.edu
- **Password**: admin123

### Class Representative Accounts
- **CR 1**: john.smith@university.edu / cr123
- **CR 2**: jane.doe@university.edu / cr123

### Student Accounts
All student accounts use the same password:
- **Email**: alice.j@university.edu / student123
- **Email**: bob.w@university.edu / student123
- **Email**: charlie.b@university.edu / student123
- **And more...**

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (Admin only)
- `PUT /api/courses/:id` - Update course (Admin only)
- `DELETE /api/courses/:id` - Delete course (Admin only)

### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create subject (Admin only)
- `PUT /api/subjects/:id` - Update subject (Admin only)
- `DELETE /api/subjects/:id` - Delete subject (Admin only)

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create class (Admin only)
- `PUT /api/classes/:id` - Update class (Admin only)
- `DELETE /api/classes/:id` - Delete class (Admin only)

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create student (Admin only)
- `PUT /api/students/:id` - Update student (Admin only)
- `DELETE /api/students/:id` - Delete student (Admin only)

### Attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/report/:studentId` - Get student attendance report
- `POST /api/attendance/mark` - Mark single attendance (CR/Admin)
- `POST /api/attendance/mark-batch` - Mark batch attendance (CR/Admin)
- `DELETE /api/attendance/:id` - Delete attendance record (Admin only)

### Schedules
- `GET /api/schedules` - Get all schedules
- `POST /api/schedules` - Create schedule (Admin only)
- `PUT /api/schedules/:id` - Update schedule (Admin only)
- `DELETE /api/schedules/:id` - Delete schedule (Admin only)

## Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin|cr|student),
  classId: ObjectId (ref: Class)
}
```

### Courses Collection
```javascript
{
  name: String,
  year: Number (1-4),
  semester: Number (1-8)
}
```

### Subjects Collection
```javascript
{
  courseId: ObjectId (ref: Course),
  name: String
}
```

### Classes Collection
```javascript
{
  name: String,
  courseId: ObjectId (ref: Course),
  crId: ObjectId (ref: User)
}
```

### Students Collection
```javascript
{
  name: String,
  email: String (unique),
  rollNumber: String (unique),
  classId: ObjectId (ref: Class)
}
```

### Attendance Collection
```javascript
{
  studentId: ObjectId (ref: Student),
  subjectId: ObjectId (ref: Subject),
  date: Date,
  status: String (present|absent),
  markedBy: ObjectId (ref: User)
}
```

### Schedules Collection
```javascript
{
  classId: ObjectId (ref: Class),
  subjectId: ObjectId (ref: Subject),
  dayOfWeek: Number (1-7),
  time: String
}
```

## Project Structure

```
cr-attendance-system/
├── server/
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Authentication & validation
│   ├── controllers/      # Route controllers (if needed)
│   ├── config/          # Configuration files
│   ├── seeds/           # Database seeding script
│   ├── server.js        # Main server file
│   ├── package.json
│   └── .env
├── client/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── services/    # API services
│   │   ├── utils/       # Utility functions
│   │   ├── hooks/       # Custom hooks
│   │   ├── App.js       # Main App component
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── .env
└── README.md
```

## Features in Detail

### Admin Dashboard
- **Course Management**: Add, edit, delete courses with year and semester information
- **Subject Management**: Manage subjects linked to specific courses
- **Class Management**: Create classes and assign CRs
- **Student Management**: Add students to classes with roll numbers
- **Schedule Management**: Create class schedules with time slots
- **Attendance Reports**: View comprehensive attendance data with filters

### CR Dashboard
- **Mark Attendance**: Select subject and date to mark attendance for class students
- **Batch Operations**: Mark attendance for multiple students at once
- **View Reports**: Access attendance reports for assigned class
- **Real-time Stats**: See attendance percentages and statistics

### Student Dashboard
- **Personal Attendance**: View individual attendance history
- **Subject-wise Reports**: See attendance breakdown by subject
- **Date Range Filters**: Filter attendance by date ranges
- **Attendance Statistics**: View overall attendance percentage

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Protected API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Note**: This is a fully functional MERN stack application. Make sure MongoDB is running before starting the backend server. The seed script will create sample data for testing all features.