import React, { useState } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import { Student } from '../types';

interface StudentFormProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
  courses: string[];
}

const StudentForm: React.FC<StudentFormProps> = ({ students, setStudents, courses }) => {
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    name: '',
    program: 'FYUP',
    electives: [],
    semester: 1
  });

  const programs = ['FYUP', 'B.Ed.', 'M.Ed.', 'ITEP'];

  const addStudent = () => {
    if (!newStudent.name) return;

    const student: Student = {
      id: Date.now().toString(),
      name: newStudent.name,
      program: newStudent.program as 'FYUP' | 'B.Ed.' | 'M.Ed.' | 'ITEP',
      electives: newStudent.electives || [],
      semester: newStudent.semester || 1
    };

    setStudents([...students, student]);
    setNewStudent({
      name: '',
      program: 'FYUP',
      electives: [],
      semester: 1
    });
  };

  const removeStudent = (id: string) => {
    setStudents(students.filter(student => student.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-orange-600" />
          Add New Student
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Name
            </label>
            <input
              type="text"
              value={newStudent.name || ''}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., Alice Johnson"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program
            </label>
            <select
              value={newStudent.program || 'FYUP'}
              onChange={(e) => setNewStudent({ ...newStudent, program: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {programs.map(program => (
                <option key={program} value={program}>{program}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester
            </label>
            <input
              type="number"
              value={newStudent.semester || 1}
              onChange={(e) => setNewStudent({ ...newStudent, semester: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              min="1"
              max="8"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Elective Courses
          </label>
          <select
            multiple
            value={newStudent.electives || []}
            onChange={(e) => {
              const electives = Array.from(e.target.selectedOptions, option => option.value);
              setNewStudent({ ...newStudent, electives });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            size={4}
          >
            {courses.map((course) => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple electives</p>
        </div>
        
        <button
          onClick={addStudent}
          disabled={!newStudent.name}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </button>
      </div>

      {students.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Added Students</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <div key={student.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{student.name}</h4>
                    <p className="text-sm text-gray-600">{student.program} • Semester {student.semester}</p>
                    {student.electives.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Electives:</p>
                        <div className="text-xs text-gray-700">
                          {student.electives.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeStudent(student.id)}
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

export default StudentForm;