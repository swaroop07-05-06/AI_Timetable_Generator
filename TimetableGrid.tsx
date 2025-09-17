import React from 'react';
import { Download, Share2, Calendar, Clock, MapPin, User } from 'lucide-react';
import { GeneratedTimetable, Course, Faculty, Room } from '../types';

interface TimetableGridProps {
  timetable: GeneratedTimetable;
  courses: Course[];
  faculty: Faculty[];
  rooms: Room[];
  onExportExcel: () => void;
  onExportGoogleSheets: () => void;
}

const TimetableGrid: React.FC<TimetableGridProps> = ({
  timetable,
  courses,
  faculty,
  rooms,
  onExportExcel,
  onExportGoogleSheets
}) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const getCourse = (courseId: string) => courses.find(c => c.id === courseId);
  const getFaculty = (facultyId: string) => faculty.find(f => f.id === facultyId);
  const getRoom = (roomId: string) => rooms.find(r => r.id === roomId);

  const getClassForTimeSlot = (day: string, time: string) => {
    return timetable.entries.find(entry => 
      entry.timeSlot.day === day && entry.timeSlot.startTime === time
    );
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'theory':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'practical':
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Generated Timetable</h2>
            <p className="text-gray-600">Optimized schedule with conflict resolution</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <button
              onClick={onExportExcel}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </button>
            <button
              onClick={onExportGoogleSheets}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Export to Google Sheets
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Classes</p>
                <p className="text-2xl font-bold text-blue-800">{timetable.statistics.totalClasses}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <User className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-green-600 font-medium">Faculty Utilization</p>
                <p className="text-2xl font-bold text-green-800">{timetable.statistics.facultyUtilization.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <MapPin className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Room Utilization</p>
                <p className="text-2xl font-bold text-purple-800">{timetable.statistics.roomUtilization.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-red-600 font-medium">Conflicts</p>
                <p className="text-2xl font-bold text-red-800">{timetable.statistics.conflicts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Conflicts Display */}
        {timetable.conflicts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-3">Conflicts Detected</h3>
            <div className="space-y-2">
              {timetable.conflicts.map((conflict, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 font-medium">{conflict.type.toUpperCase()} CONFLICT</p>
                  <p className="text-red-700 text-sm">{conflict.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-50 p-3 text-left font-semibold text-gray-700 min-w-[100px]">
                  Time
                </th>
                {days.map(day => (
                  <th key={day} className="border border-gray-300 bg-gray-50 p-3 text-center font-semibold text-gray-700 min-w-[200px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(time => (
                <tr key={time}>
                  <td className="border border-gray-300 bg-gray-50 p-3 font-medium text-gray-700">
                    {time}
                  </td>
                  {days.map(day => {
                    const classEntry = getClassForTimeSlot(day, time);
                    return (
                      <td key={`${day}-${time}`} className="border border-gray-300 p-2 h-24 align-top">
                        {classEntry && (
                          <div className={`h-full rounded-lg border-2 p-2 ${getColorClass(classEntry.type)}`}>
                            <div className="text-xs font-semibold mb-1">
                              {getCourse(classEntry.courseId)?.code}
                            </div>
                            <div className="text-xs mb-1">
                              {getCourse(classEntry.courseId)?.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              👨‍🏫 {getFaculty(classEntry.facultyId)?.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              🏢 {getRoom(classEntry.roomId)?.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              👥 {classEntry.students.length} students
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Theory Classes</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Practical Classes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableGrid;