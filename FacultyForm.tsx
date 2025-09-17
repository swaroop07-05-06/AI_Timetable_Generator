import React, { useState } from 'react';
import { Plus, Trash2, User, Clock } from 'lucide-react';
import { Faculty } from '../types';

interface FacultyFormProps {
  faculty: Faculty[];
  setFaculty: (faculty: Faculty[]) => void;
  courses: string[];
}

const FacultyForm: React.FC<FacultyFormProps> = ({ faculty, setFaculty, courses }) => {
  const [newFaculty, setNewFaculty] = useState<Partial<Faculty>>({
    name: '',
    maxHours: 20,
    availability: [],
    subjects: []
  });

  const [newAvailability, setNewAvailability] = useState({
    day: 'Monday',
    startTime: '09:00',
    endTime: '17:00'
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const addAvailability = () => {
    setNewFaculty({
      ...newFaculty,
      availability: [...(newFaculty.availability || []), newAvailability]
    });
  };

  const removeAvailability = (index: number) => {
    const updated = [...(newFaculty.availability || [])];
    updated.splice(index, 1);
    setNewFaculty({ ...newFaculty, availability: updated });
  };

  const addFaculty = () => {
    if (!newFaculty.name) return;

    const facultyMember: Faculty = {
      id: Date.now().toString(),
      name: newFaculty.name,
      maxHours: newFaculty.maxHours || 20,
      availability: newFaculty.availability || [],
      subjects: newFaculty.subjects || []
    };

    setFaculty([...faculty, facultyMember]);
    setNewFaculty({
      name: '',
      maxHours: 20,
      availability: [],
      subjects: []
    });
  };

  const removeFaculty = (id: string) => {
    setFaculty(faculty.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-green-600" />
          Add New Faculty
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Faculty Name
            </label>
            <input
              type="text"
              value={newFaculty.name || ''}
              onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Dr. John Smith"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Hours/Week
            </label>
            <input
              type="number"
              value={newFaculty.maxHours || 20}
              onChange={(e) => setNewFaculty({ ...newFaculty, maxHours: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="1"
              max="40"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subjects (Can Teach)
          </label>
          <select
            multiple
            value={newFaculty.subjects || []}
            onChange={(e) => {
              const subjects = Array.from(e.target.selectedOptions, option => option.value);
              setNewFaculty({ ...newFaculty, subjects });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            size={4}
          >
            {courses.map((course) => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple subjects</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Availability
          </label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <select
              value={newAvailability.day}
              onChange={(e) => setNewAvailability({ ...newAvailability, day: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <input
              type="time"
              value={newAvailability.startTime}
              onChange={(e) => setNewAvailability({ ...newAvailability, startTime: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <input
              type="time"
              value={newAvailability.endTime}
              onChange={(e) => setNewAvailability({ ...newAvailability, endTime: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={addAvailability}
            className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            Add Availability
          </button>
        </div>

        {newFaculty.availability && newFaculty.availability.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Added Availability:</h4>
            <div className="space-y-2">
              {newFaculty.availability.map((avail, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                  <span className="text-sm">
                    {avail.day}: {avail.startTime} - {avail.endTime}
                  </span>
                  <button
                    onClick={() => removeAvailability(index)}
                    className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <button
          onClick={addFaculty}
          disabled={!newFaculty.name}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Faculty
        </button>
      </div>

      {faculty.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Added Faculty</h3>
          <div className="space-y-3">
            {faculty.map((member) => (
              <div key={member.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{member.name}</h4>
                    <p className="text-sm text-gray-600">Max {member.maxHours} hours/week</p>
                    <p className="text-sm text-gray-600">
                      Subjects: {member.subjects.join(', ') || 'None specified'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Available: {member.availability.length} time slots
                    </p>
                  </div>
                  <button
                    onClick={() => removeFaculty(member.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyForm;