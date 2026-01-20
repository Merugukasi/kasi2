import React, { useState, useEffect } from 'react';
import api from '../services/api';

const StudentAttendanceReport = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchStudentInfo();
  }, []);

  const fetchStudentInfo = async () => {
    try {
      const userResponse = await api.get('/auth/me');
      const user = userResponse.data.user;
      
      // Find student record by email
      const studentsResponse = await api.get('/students');
      const student = studentsResponse.data.find(s => s.email === user.email);
      
      if (student) {
        fetchAttendanceReport(student._id);
      }
    } catch (error) {
      setError('Error fetching student information');
    }
  };

  const fetchAttendanceReport = async (studentId, customDateRange = null) => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      if (customDateRange?.startDate) params.append('startDate', customDateRange.startDate);
      if (customDateRange?.endDate) params.append('endDate', customDateRange.endDate);
      
      const response = await api.get(`/attendance/report/${studentId}?${params}`);
      setAttendanceData(response.data.attendance);
      setSummary(response.data.summary);
    } catch (error) {
      setError('Error fetching attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = () => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchStudentInfo();
      // Add logic to apply date range filter
    }
  };

  const getOverallStats = () => {
    let totalPresent = 0;
    let totalAbsent = 0;
    
    Object.values(summary).forEach(subjectSummary => {
      totalPresent += subjectSummary.present;
      totalAbsent += subjectSummary.absent;
    });
    
    const total = totalPresent + totalAbsent;
    const percentage = total > 0 ? ((totalPresent / total) * 100).toFixed(1) : 0;
    
    return { totalPresent, totalAbsent, total, percentage };
  };

  const overallStats = getOverallStats();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">My Attendance Report</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Overall Statistics */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium mb-3">Overall Attendance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{overallStats.total}</div>
            <div className="text-sm text-gray-600">Total Classes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{overallStats.totalPresent}</div>
            <div className="text-sm text-gray-600">Present</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{overallStats.totalAbsent}</div>
            <div className="text-sm text-gray-600">Absent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{overallStats.percentage}%</div>
            <div className="text-sm text-gray-600">Overall %</div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium mb-3">Filter by Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
          />
          <button
            onClick={handleDateRangeChange}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* Subject-wise Summary */}
      {Object.keys(summary).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Subject-wise Attendance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(summary).map(([subjectName, data]) => (
              <div key={subjectName} className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{subjectName}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Present:</span>
                    <span className="font-medium text-green-600">{data.present}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Absent:</span>
                    <span className="font-medium text-red-600">{data.absent}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span className="font-medium">{data.total}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Attendance %:</span>
                      <span className={`font-bold ${
                        parseFloat(data.percentage) >= 75 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {data.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Attendance Records */}
      <div>
        <h3 className="text-lg font-medium mb-3">Attendance History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </td>
                </tr>
              ) : attendanceData.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                attendanceData.map((record, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.subjectId?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'present' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceReport;