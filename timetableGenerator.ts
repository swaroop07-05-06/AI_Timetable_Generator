import { 
  Course, 
  Faculty, 
  Room, 
  Student, 
  TimetableEntry, 
  GeneratedTimetable, 
  TimeSlot,
  Conflict,
  TimetableRequest
} from '../types';

class TimetableGenerator {
  private courses: Course[];
  private faculty: Faculty[];
  private rooms: Room[];
  private students: Student[];
  private preferences: TimetableRequest['preferences'];
  private conflicts: Conflict[];
  private entries: TimetableEntry[];

  constructor(request: TimetableRequest) {
    this.courses = request.courses;
    this.faculty = request.faculty;
    this.rooms = request.rooms;
    this.students = request.students;
    this.preferences = request.preferences;
    this.conflicts = [];
    this.entries = [];
  }

  generate(): GeneratedTimetable {
    this.entries = [];
    this.conflicts = [];

    // Generate time slots
    const timeSlots = this.generateTimeSlots();
    
    // Create timetable entries using greedy algorithm
    this.createTimetableEntries(timeSlots);
    
    // Detect and resolve conflicts
    this.detectConflicts();
    
    // Calculate statistics
    const statistics = this.calculateStatistics();

    return {
      entries: this.entries,
      conflicts: this.conflicts,
      statistics
    };
  }

  private generateTimeSlots(): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const { workingDays, startTime, endTime } = this.preferences;
    
    for (const day of workingDays) {
      let currentTime = this.parseTime(startTime);
      const endTimeMinutes = this.parseTime(endTime);
      
      while (currentTime < endTimeMinutes) {
        const nextTime = currentTime + 60; // 1-hour slots
        slots.push({
          day,
          startTime: this.formatTime(currentTime),
          endTime: this.formatTime(nextTime),
          duration: 60
        });
        currentTime = nextTime;
      }
    }
    
    return slots;
  }

  private createTimetableEntries(timeSlots: TimeSlot[]): void {
    // Create entries for each course
    for (const course of this.courses) {
      this.scheduleCourse(course, timeSlots);
    }
  }

  private scheduleCourse(course: Course, timeSlots: TimeSlot[]): void {
    const totalHours = course.theoryHours + course.practicalHours;
    let scheduledHours = 0;

    // Find suitable faculty
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

    // Schedule theory hours
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

    // Schedule practical hours
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

  private scheduleClassType(
    course: Course,
    type: 'theory' | 'practical',
    hours: number,
    availableFaculty: Faculty[],
    timeSlots: TimeSlot[],
    roomTypes: string[]
  ): number {
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
      
      // Find students for this course
      const courseStudents = this.students.filter(student => 
        student.electives.includes(course.name) || 
        student.electives.includes(course.code) ||
        this.isCoreSubject(course, student)
      );

      const entry: TimetableEntry = {
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

  private isSlotOccupied(slot: TimeSlot): boolean {
    return this.entries.some(entry => 
      entry.timeSlot.day === slot.day && 
      entry.timeSlot.startTime === slot.startTime
    );
  }

  private isFacultyAvailable(faculty: Faculty, slot: TimeSlot): boolean {
    // Check if faculty is available at this time
    const isAvailable = faculty.availability.some(avail => 
      avail.day === slot.day &&
      this.parseTime(avail.startTime) <= this.parseTime(slot.startTime) &&
      this.parseTime(avail.endTime) >= this.parseTime(slot.endTime)
    );

    if (!isAvailable) return false;

    // Check if faculty is not already scheduled
    const isNotScheduled = !this.entries.some(entry => 
      entry.facultyId === faculty.id &&
      entry.timeSlot.day === slot.day &&
      entry.timeSlot.startTime === slot.startTime
    );

    return isNotScheduled;
  }

  private isRoomOccupied(roomId: string, slot: TimeSlot): boolean {
    return this.entries.some(entry => 
      entry.roomId === roomId &&
      entry.timeSlot.day === slot.day &&
      entry.timeSlot.startTime === slot.startTime
    );
  }

  private isCoreSubject(course: Course, student: Student): boolean {
    // Simple logic - can be enhanced based on program requirements
    return student.program === 'FYUP' || student.program === 'B.Ed.';
  }

  private detectConflicts(): void {
    // Faculty conflicts
    const facultySchedule = new Map<string, TimetableEntry[]>();
    
    for (const entry of this.entries) {
      if (!facultySchedule.has(entry.facultyId)) {
        facultySchedule.set(entry.facultyId, []);
      }
      facultySchedule.get(entry.facultyId)!.push(entry);
    }

    for (const [facultyId, entries] of facultySchedule) {
      const conflicts = this.findTimeConflicts(entries);
      if (conflicts.length > 0) {
        this.conflicts.push({
          type: 'faculty',
          description: `Faculty scheduling conflict for ${this.faculty.find(f => f.id === facultyId)?.name}`,
          entries: conflicts.map(c => c.id)
        });
      }
    }

    // Room conflicts
    const roomSchedule = new Map<string, TimetableEntry[]>();
    
    for (const entry of this.entries) {
      if (!roomSchedule.has(entry.roomId)) {
        roomSchedule.set(entry.roomId, []);
      }
      roomSchedule.get(entry.roomId)!.push(entry);
    }

    for (const [roomId, entries] of roomSchedule) {
      const conflicts = this.findTimeConflicts(entries);
      if (conflicts.length > 0) {
        this.conflicts.push({
          type: 'room',
          description: `Room scheduling conflict for ${this.rooms.find(r => r.id === roomId)?.name}`,
          entries: conflicts.map(c => c.id)
        });
      }
    }
  }

  private findTimeConflicts(entries: TimetableEntry[]): TimetableEntry[] {
    const conflicts: TimetableEntry[] = [];
    
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        if (this.timeSlotsOverlap(entries[i].timeSlot, entries[j].timeSlot)) {
          conflicts.push(entries[i], entries[j]);
        }
      }
    }
    
    return conflicts;
  }

  private timeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
    if (slot1.day !== slot2.day) return false;
    
    const start1 = this.parseTime(slot1.startTime);
    const end1 = this.parseTime(slot1.endTime);
    const start2 = this.parseTime(slot2.startTime);
    const end2 = this.parseTime(slot2.endTime);
    
    return start1 < end2 && start2 < end1;
  }

  private calculateStatistics() {
    const totalClasses = this.entries.length;
    
    // Faculty utilization
    const facultyHours = new Map<string, number>();
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

    // Room utilization
    const roomHours = new Map<string, number>();
    for (const entry of this.entries) {
      roomHours.set(entry.roomId, (roomHours.get(entry.roomId) || 0) + 1);
    }
    
    const maxPossibleHours = this.preferences.workingDays.length * 
      (this.parseTime(this.preferences.endTime) - this.parseTime(this.preferences.startTime)) / 60;
    
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

  private parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}

export default TimetableGenerator;