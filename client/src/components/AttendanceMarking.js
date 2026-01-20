import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AttendanceMarking = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject && selectedDate) {
      fetchExistingAttendance();
    }
  }, [selectedSubject, selectedDate]);

  const fetchStudents = async () => {
    try {
      // Get current user's class students
      const userResponse = await api.get('/auth/me');
      const classId = userResponse.data.user.classId;
      
      if (classId) {
        const response = await api.get(`/students?classId=${classId}`);
        setStudents(response.data);
        
        // Initialize attendance data
        setAttendanceData(response.data.map(student => ({
          studentId: student._id,
          status: 'present'
        })));
      }
    } catch (error) {
      setError('Error fetching students');
    }
  };

  const fetchSubjects = async () => {
    try {
      const userResponse = await api.get('/auth/me');
      const classId = userResponse.data.user.classId;
      
      if (classId) {
        // Get class info to find course
        const classResponse = await api.get(`/classes/${classId}`);
        const courseId = classResponse.data.courseId._id;
        
        // Get subjects for this course
        const response = await api.get(`/subjects?courseId=${courseId}`);
        setSubjects(response.data);
      }
    } catch (error) {
      setError('Error fetching subjects');
    }
  };

  const fetchExistingAttendance = async () => {
    try {
      const response = await api.get('/attendance', {
        params: {
          subjectId: selectedSubject,
          date: selectedDate
        }
      });
      
      const existingAttendance = response.data;
      
      // Update attendance data with existing records
      setAttendanceData(prev => 
        prev.map(item => {
          const existing = existingAttendance.find(
            a => a.studentId._id === item.studentId && a.subjectId === selectedSubject
          );
          return existing ? {
            ...item,
            status: existing.status,
            _id: existing._id
          } : item;
        })
      );
    } catch (error) {
      console.error('Error fetching existing attendance:', error);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev =>
      prev.map(item =>
        item.studentId === studentId ? { ...item, status } : item
      )
    );
  };

  const handleMarkAttendance = async () => {
    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const attendanceRecords = attendanceData.map(item => ({
        studentId: item.studentId,
        subjectId: selectedSubject,
        date: selectedDate,
        status: item.status
      }));

      await api.post('/attendance/mark-batch', {
        subjectId: selectedSubject,
        date: selectedDate,
        attendanceRecords
      });

      setSuccess('Attendance marked successfully!');
      fetchExistingAttendance(); // Refresh the data
    } catch (error) {
      setError(error.response?.data?.message || 'Error marking attendance');
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const total = attendanceData.length;
    const present = attendanceData.filter(a => a.status === 'present').length;
    const absent = attendanceData.filter(a => a.status === 'absent').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    
    return { total, present, absent, percentage };
  };

  const stats = getStats();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Mark Attendance</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            required
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            required
          />
          
          <button
            onClick={handleMarkAttendance}
            disabled={loading || !selectedSubject}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Mark Attendance'}
          </button>
        </div>

        {selectedSubject && (
          <div className="bg-blue-50 p-4 rounded">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{stats.present}</div>
                <div className="text-sm text-gray-600">Present</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">{stats.absent}</div>
                <div className="text-sm text-gray-600">Absent</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{stats.percentage}%</div>
                <div className="text-sm text-gray-600">Attendance Rate</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {students.length > 0 && selectedSubject ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roll Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => {
                const attendanceRecord = attendanceData.find(
                  a => a.studentId === student._id
                );
                
                return (
                  <tr key={student._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.rollNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={attendanceRecord?.status || 'present'}
                        onChange={(e) => handleStatusChange(student._id, e.target.value)}
                        className={`px-3 py-1 border rounded-md text-sm font-medium ${
                          attendanceRecord?.status === 'present'
                            ? 'bg-green-100 border-green-300 text-green-800'
                            : 'bg-red-100 border-red-300 text-red-800'
                        }`}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        !selectedSubject && (
          <div className="text-center py-8 text-gray-500">
            Please select a subject to mark attendance
          </div>
        )
      )}
    </div>
  );
};

export default AttendanceMarking;