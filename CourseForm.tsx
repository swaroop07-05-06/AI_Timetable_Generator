import React, { useState } from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { Course } from '../types';

interface CourseFormProps {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
}

const CourseForm: React.FC<CourseFormProps> = ({ courses, setCourses }) => {
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    name: '',
    code: '',
    credits: 3,
    theoryHours: 3,
    practicalHours: 0,
    type: 'theory'
  });

  const addCourse = () => {
    if (!newCourse.name || !newCourse.code) return;
    
    const course: Course = {
      id: Date.now().toString(),
      name: newCourse.name,
      code: newCourse.code,
      credits: newCourse.credits || 3,
      theoryHours: newCourse.theoryHours || 0,
      practicalHours: newCourse.practicalHours || 0,
      type: newCourse.type as 'theory' | 'practical' | 'both'
    };

    setCourses([...courses, course]);
    setNewCourse({
      name: '',
      code: '',
      credits: 3,
      theoryHours: 3,
      practicalHours: 0,
      type: 'theory'
    });
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
          Add New Course
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Name
            </label>
            <input
              type="text"
              value={newCourse.name || ''}
              onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Data Structures"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Code
            </label>
            <input
              type="text"
              value={newCourse.code || ''}
              onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., CS201"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credits
            </label>
            <input
              type="number"
              value={newCourse.credits || 3}
              onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="6"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={newCourse.type || 'theory'}
              onChange={(e) => setNewCourse({ ...newCourse, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="theory">Theory</option>
              <option value="practical">Practical</option>
              <option value="both">Both</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theory Hours/Week
            </label>
            <input
              type="number"
              value={newCourse.theoryHours || 0}
              onChange={(e) => setNewCourse({ ...newCourse, theoryHours: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="10"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Practical Hours/Week
            </label>
            <input
              type="number"
              value={newCourse.practicalHours || 0}
              onChange={(e) => setNewCourse({ ...newCourse, practicalHours: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="10"
            />
          </div>
        </div>
        
        <button
          onClick={addCourse}
          disabled={!newCourse.name || !newCourse.code}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </button>
      </div>

      {courses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Added Courses</h3>
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-medium text-gray-800">{course.name}</h4>
                      <p className="text-sm text-gray-600">{course.code}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {course.credits} credits
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        Theory: {course.theoryHours}h
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        Practical: {course.practicalHours}h
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeCourse(course.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseForm;