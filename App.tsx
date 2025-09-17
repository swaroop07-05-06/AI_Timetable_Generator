import React, { useState } from 'react';
import { Calendar, ChevronRight, Sparkles, Clock } from 'lucide-react';
import FormStep from './components/FormStep';
import CourseForm from './components/CourseForm';
import FacultyForm from './components/FacultyForm';
import RoomForm from './components/RoomForm';
import StudentForm from './components/StudentForm';
import TimetableGrid from './components/TimetableGrid';
import TimetableGenerator from './services/timetableGenerator';
import ExcelExporter from './services/excelExporter';
import GoogleSheetsExporter from './services/googleSheetsExporter';
import { Course, Faculty, Room, Student, GeneratedTimetable } from './types';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [generatedTimetable, setGeneratedTimetable] = useState<GeneratedTimetable | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const totalSteps = 5;

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Generate timetable
      await generateTimetable();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return courses.length > 0;
      case 2:
        return faculty.length > 0;
      case 3:
        return rooms.length > 0;
      case 4:
        return students.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const generateTimetable = async () => {
    setIsGenerating(true);
    
    try {
      const request = {
        courses,
        faculty,
        rooms,
        students,
        preferences: {
          startTime: '09:00',
          endTime: '17:00',
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          breakDuration: 15
        }
      };

      const generator = new TimetableGenerator(request);
      const timetable = generator.generate();
      
      setGeneratedTimetable(timetable);
      setCurrentStep(6); // Move to results view
    } catch (error) {
      console.error('Error generating timetable:', error);
      alert('Failed to generate timetable. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportExcel = async () => {
    if (generatedTimetable) {
      await ExcelExporter.exportToExcel(generatedTimetable, courses, faculty, rooms);
    }
  };

  const handleExportGoogleSheets = async () => {
    if (generatedTimetable) {
      await GoogleSheetsExporter.exportToGoogleSheets(generatedTimetable, courses, faculty, rooms);
    }
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setGeneratedTimetable(null);
  };

  if (generatedTimetable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="bg-white p-3 rounded-full shadow-lg mr-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">AI Timetable Generator</h1>
                <p className="text-gray-600">Smart scheduling with conflict resolution</p>
              </div>
            </div>
            <button
              onClick={handleStartOver}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Start Over
            </button>
          </div>

          <TimetableGrid
            timetable={generatedTimetable}
            courses={courses}
            faculty={faculty}
            rooms={rooms}
            onExportExcel={handleExportExcel}
            onExportGoogleSheets={handleExportGoogleSheets}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white p-4 rounded-full shadow-lg mr-4">
              <Calendar className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 flex items-center">
                AI Timetable Generator
                <Sparkles className="w-8 h-8 text-yellow-500 ml-2" />
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Create optimized schedules with intelligent conflict resolution
              </p>
            </div>
          </div>
        </div>

        {/* Form Steps */}
        {currentStep === 1 && (
          <FormStep
            title="📚 Course Information"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canProceed={canProceed()}
          >
            <CourseForm courses={courses} setCourses={setCourses} />
          </FormStep>
        )}

        {currentStep === 2 && (
          <FormStep
            title="👨‍🏫 Faculty Details"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canProceed={canProceed()}
          >
            <FacultyForm 
              faculty={faculty} 
              setFaculty={setFaculty}
              courses={courses.map(c => c.name)}
            />
          </FormStep>
        )}

        {currentStep === 3 && (
          <FormStep
            title="🏢 Room & Lab Information"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canProceed={canProceed()}
          >
            <RoomForm rooms={rooms} setRooms={setRooms} />
          </FormStep>
        )}

        {currentStep === 4 && (
          <FormStep
            title="👥 Student Information"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canProceed={canProceed()}
          >
            <StudentForm 
              students={students} 
              setStudents={setStudents}
              courses={courses.map(c => c.name)}
            />
          </FormStep>
        )}

        {currentStep === 5 && (
          <FormStep
            title="🎯 Review & Generate"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canProceed={canProceed()}
          >
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
                    <div className="text-sm text-gray-600">Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{faculty.length}</div>
                    <div className="text-sm text-gray-600">Faculty</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{rooms.length}</div>
                    <div className="text-sm text-gray-600">Rooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{students.length}</div>
                    <div className="text-sm text-gray-600">Students</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Generation Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Working Hours</p>
                    <p className="font-medium">9:00 AM - 5:00 PM</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Working Days</p>
                    <p className="font-medium">Monday - Friday</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Algorithm</p>
                    <p className="font-medium">Constraint-based Optimization</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Conflict Resolution</p>
                    <p className="font-medium">Automatic</p>
                  </div>
                </div>
              </div>

              {isGenerating && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-800 rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                    Generating optimized timetable...
                  </div>
                </div>
              )}
            </div>
          </FormStep>
        )}
      </div>
    </div>
  );
}

export default App;