export interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  theoryHours: number;
  practicalHours: number;
  type: 'theory' | 'practical' | 'both';
}

export interface Faculty {
  id: string;
  name: string;
  maxHours: number;
  availability: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  subjects: string[];
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: 'classroom' | 'lab' | 'auditorium';
  equipment: string[];
}

export interface Student {
  id: string;
  name: string;
  program: 'FYUP' | 'B.Ed.' | 'M.Ed.' | 'ITEP';
  electives: string[];
  semester: number;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export interface TimetableEntry {
  id: string;
  courseId: string;
  facultyId: string;
  roomId: string;
  timeSlot: TimeSlot;
  students: string[];
  type: 'theory' | 'practical';
}

export interface GeneratedTimetable {
  entries: TimetableEntry[];
  conflicts: Conflict[];
  statistics: {
    totalClasses: number;
    facultyUtilization: number;
    roomUtilization: number;
    conflicts: number;
  };
}

export interface Conflict {
  type: 'faculty' | 'room' | 'student';
  description: string;
  entries: string[];
}

export interface TimetableRequest {
  courses: Course[];
  faculty: Faculty[];
  rooms: Room[];
  students: Student[];
  preferences: {
    startTime: string;
    endTime: string;
    workingDays: string[];
    breakDuration: number;
  };
}