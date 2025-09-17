const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload configuration
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Store timetables in memory (in production, use a database)
const timetables = new Map();

// Utility functions
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const parseTime = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Timetable generation algorithm
class TimetableGenerator {
  constructor(request) {
    this.courses = request.courses;
    this.faculty = request.faculty;
    this.rooms = request.rooms;
    this.students = request.students;
    this.preferences = request.preferences;
    this.conflicts = [];
    this.entries = [];
  }

  generate() {
    this.entries = [];
    this.conflicts = [];

    const timeSlots = this.generateTimeSlots();
    this.createTimetableEntries(timeSlots);
    this.detectConflicts();
    
    const statistics = this.calculateStatistics();

    return {
      id: generateId(),
      entries: this.entries,
      conflicts: this.conflicts,
      statistics,
      createdAt: new Date().toISOString()
    };
  }

  generateTimeSlots() {
    const slots = [];
    const { workingDays, startTime, endTime } = this.preferences;
    
    for (const day of workingDays) {
      let currentTime = parseTime(startTime);
      const endTimeMinutes = parseTime(endTime);
      
      while (currentTime < endTimeMinutes) {
        const nextTime = currentTime + 60;
        slots.push({
          day,
          startTime: formatTime(currentTime),
          endTime: formatTime(nextTime),
          duration: 60
        });
        currentTime = nextTime;
      }
    }
    
    return slots;
  }

  createTimetableEntries(timeSlots) {
    for (const course of this.courses) {
      this.scheduleCourse(course, timeSlots);
    }
  }

  scheduleCourse(course, timeSlots) {
    const totalHours = course.theoryHours + course.practicalHours;
    let scheduledHours = 0;

    const availableFaculty = this.faculty.filter(f => 
      f.subjects.includes(course.name) || f.subjects.includes(course.code)
    );

    if (availableFaculty.length === 0) {
      this.conflicts.push({
        type: 'faculty',
        description: `No faculty available for course: ${course.name}`,
        entries: [course.id]
      });
      return;
    }

    if (course.theoryHours > 0) {
      scheduledHours += this.scheduleClassType(
        course,
        'theory',
        course.theoryHours,
        availableFaculty,
        timeSlots,
        ['classroom', 'auditorium']
      );
    }

    if (course.practicalHours > 0) {
      scheduledHours += this.scheduleClassType(
        course,
        'practical',
        course.practicalHours,
        availableFaculty,
        timeSlots,
        ['lab']
      );
    }

    if (scheduledHours < totalHours) {
      this.conflicts.push({
        type: 'room',
        description: `Could not schedule all hours for course: ${course.name}. Scheduled ${scheduledHours}/${totalHours} hours`,
        entries: [course.id]
      });
    }
  }

  scheduleClassType(course, type, hours, availableFaculty, timeSlots, roomTypes) {
    let scheduledHours = 0;

    for (let i = 0; i < hours && scheduledHours < hours; i++) {
      const availableSlots = timeSlots.filter(slot => 
        !this.isSlotOccupied(slot) && this.isFacultyAvailable(availableFaculty[0], slot)
      );

      if (availableSlots.length === 0) continue;

      const slot = availableSlots[0];
      const suitableRooms = this.rooms.filter(room => 
        roomTypes.includes(room.type) && !this.isRoomOccupied(room.id, slot)
      );

      if (suitableRooms.length === 0) continue;

      const room = suitableRooms[0];
      const faculty = availableFaculty[0];
      
      const courseStudents = this.students.filter(student => 
        student.electives.includes(course.name) || 
        student.electives.includes(course.code) ||
        this.isCoreSubject(course, student)
      );

      const entry = {
        id: `${course.id}-${faculty.id}-${room.id}-${slot.day}-${slot.startTime}`,
        courseId: course.id,
        facultyId: faculty.id,
        roomId: room.id,
        timeSlot: slot,
        students: courseStudents.map(s => s.id),
        type
      };

      this.entries.push(entry);
      scheduledHours++;
    }

    return scheduledHours;
  }

  isSlotOccupied(slot) {
    return this.entries.some(entry => 
      entry.timeSlot.day === slot.day && 
      entry.timeSlot.startTime === slot.startTime
    );
  }

  isFacultyAvailable(faculty, slot) {
    const isAvailable = faculty.availability.some(avail => 
      avail.day === slot.day &&
      parseTime(avail.startTime) <= parseTime(slot.startTime) &&
      parseTime(avail.endTime) >= parseTime(slot.endTime)
    );

    if (!isAvailable) return false;

    const isNotScheduled = !this.entries.some(entry => 
      entry.facultyId === faculty.id &&
      entry.timeSlot.day === slot.day &&
      entry.timeSlot.startTime === slot.startTime
    );

    return isNotScheduled;
  }

  isRoomOccupied(roomId, slot) {
    return this.entries.some(entry => 
      entry.roomId === roomId &&
      entry.timeSlot.day === slot.day &&
      entry.timeSlot.startTime === slot.startTime
    );
  }

  isCoreSubject(course, student) {
    return student.program === 'FYUP' || student.program === 'B.Ed.';
  }

  detectConflicts() {
    // Implementation similar to frontend version
    // Faculty and room conflict detection logic here
  }

  calculateStatistics() {
    const totalClasses = this.entries.length;
    
    const facultyHours = new Map();
    for (const entry of this.entries) {
      facultyHours.set(entry.facultyId, (facultyHours.get(entry.facultyId) || 0) + 1);
    }
    
    let totalFacultyUtilization = 0;
    for (const [facultyId, hours] of facultyHours) {
      const faculty = this.faculty.find(f => f.id === facultyId);
      if (faculty) {
        totalFacultyUtilization += (hours / faculty.maxHours) * 100;
      }
    }
    const facultyUtilization = totalFacultyUtilization / this.faculty.length;

    const roomHours = new Map();
    for (const entry of this.entries) {
      roomHours.set(entry.roomId, (roomHours.get(entry.roomId) || 0) + 1);
    }
    
    const maxPossibleHours = this.preferences.workingDays.length * 
      (parseTime(this.preferences.endTime) - parseTime(this.preferences.startTime)) / 60;
    
    let totalRoomUtilization = 0;
    for (const hours of roomHours.values()) {
      totalRoomUtilization += (hours / maxPossibleHours) * 100;
    }
    const roomUtilization = totalRoomUtilization / this.rooms.length;

    return {
      totalClasses,
      facultyUtilization,
      roomUtilization,
      conflicts: this.conflicts.length
    };
  }
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/generate', (req, res) => {
  try {
    const { courses, faculty, rooms, students, preferences } = req.body;

    // Validate input
    if (!courses || !faculty || !rooms || !students) {
      return res.status(400).json({
        error: 'Missing required data: courses, faculty, rooms, and students are required'
      });
    }

    const generator = new TimetableGenerator({
      courses,
      faculty,
      rooms,
      students,
      preferences: preferences || {
        startTime: '09:00',
        endTime: '17:00',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        breakDuration: 15
      }
    });

    const timetable = generator.generate();
    
    // Store timetable
    timetables.set(timetable.id, timetable);

    res.json({
      success: true,
      timetable
    });

  } catch (error) {
    console.error('Error generating timetable:', error);
    res.status(500).json({
      error: 'Failed to generate timetable',
      details: error.message
    });
  }
});

app.get('/api/timetable/:id', (req, res) => {
  const { id } = req.params;
  const timetable = timetables.get(id);
  
  if (!timetable) {
    return res.status(404).json({
      error: 'Timetable not found'
    });
  }
  
  res.json({
    success: true,
    timetable
  });
});

app.get('/api/timetables', (req, res) => {
  const allTimetables = Array.from(timetables.values()).map(t => ({
    id: t.id,
    createdAt: t.createdAt,
    statistics: t.statistics
  }));
  
  res.json({
    success: true,
    timetables: allTimetables
  });
});

app.delete('/api/timetable/:id', (req, res) => {
  const { id } = req.params;
  const deleted = timetables.delete(id);
  
  if (!deleted) {
    return res.status(404).json({
      error: 'Timetable not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Timetable deleted successfully'
  });
});

app.post('/api/export/excel', (req, res) => {
  try {
    const { timetableId } = req.body;
    const timetable = timetables.get(timetableId);
    
    if (!timetable) {
      return res.status(404).json({
        error: 'Timetable not found'
      });
    }

    // In a real implementation, you would use a library like exceljs
    // For now, return CSV data
    const csvData = generateCSV(timetable);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=timetable_${timetableId}.csv`);
    res.send(csvData);

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({
      error: 'Failed to export timetable',
      details: error.message
    });
  }
});

app.post('/api/export/google-sheets', (req, res) => {
  try {
    const { timetableId, sheetsConfig } = req.body;
    const timetable = timetables.get(timetableId);
    
    if (!timetable) {
      return res.status(404).json({
        error: 'Timetable not found'
      });
    }

    // In a real implementation, you would integrate with Google Sheets API
    // For now, return the data that can be imported
    const sheetsData = generateSheetsData(timetable);
    
    res.json({
      success: true,
      data: sheetsData,
      message: 'Data prepared for Google Sheets export'
    });

  } catch (error) {
    console.error('Error preparing Google Sheets export:', error);
    res.status(500).json({
      error: 'Failed to prepare Google Sheets export',
      details: error.message
    });
  }
});

// Utility functions for export
function generateCSV(timetable) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  
  let csvContent = 'Time,' + days.join(',') + '\n';
  
  for (const time of timeSlots) {
    let row = time;
    
    for (const day of days) {
      const entry = timetable.entries.find(e => 
        e.timeSlot.day === day && e.timeSlot.startTime === time
      );
      
      if (entry) {
        const cellContent = `"${entry.courseId} | ${entry.facultyId} | ${entry.roomId}"`;
        row += ',' + cellContent;
      } else {
        row += ',';
      }
    }
    
    csvContent += row + '\n';
  }
  
  return csvContent;
}

function generateSheetsData(timetable) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  
  const data = [['Time', ...days]];
  
  for (const time of timeSlots) {
    const row = [time];
    
    for (const day of days) {
      const entry = timetable.entries.find(e => 
        e.timeSlot.day === day && e.timeSlot.startTime === time
      );
      
      if (entry) {
        row.push(`${entry.courseId}\n${entry.facultyId}\n${entry.roomId}`);
      } else {
        row.push('');
      }
    }
    
    data.push(row);
  }
  
  return data;
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Timetable Generator API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;