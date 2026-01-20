import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CourseManagement from '../components/CourseManagement';
import SubjectManagement from '../components/SubjectManagement';
import ClassManagement from '../components/ClassManagement';
import StudentManagement from '../components/StudentManagement';
import ScheduleManagement from '../components/ScheduleManagement';
import AttendanceReports from '../components/AttendanceReports';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');

  const tabs = [
    { id: 'courses', name: 'Courses', icon: '📚' },
    { id: 'subjects', name: 'Subjects', icon: '📖' },
    { id: 'classes', name: 'Classes', icon: '👥' },
    { id: 'students', name: 'Students', icon: '🎓' },
    { id: 'schedules', name: 'Schedules', icon: '📅' },
    { id: 'attendance', name: 'Attendance', icon: '✅' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'courses':
        return <CourseManagement />;
      case 'subjects':
        return <SubjectManagement />;
      case 'classes':
        return <ClassManagement />;
      case 'students':
        return <StudentManagement />;
      case 'schedules':
        return <ScheduleManagement />;
      case 'attendance':
        return <AttendanceReports />;
      default:
        return <CourseManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;