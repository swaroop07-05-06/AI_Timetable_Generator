import { GeneratedTimetable, Course, Faculty, Room } from '../types';

export class ExcelExporter {
  static async exportToExcel(
    timetable: GeneratedTimetable,
    courses: Course[],
    faculty: Faculty[],
    rooms: Room[]
  ): Promise<void> {
    // Create a simple CSV format that can be opened in Excel
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
          const course = courses.find(c => c.id === entry.courseId);
          const facultyMember = faculty.find(f => f.id === entry.facultyId);
          const room = rooms.find(r => r.id === entry.roomId);
          
          const cellContent = `"${course?.code || ''} - ${course?.name || ''} | ${facultyMember?.name || ''} | ${room?.name || ''}"`;
          row += ',' + cellContent;
        } else {
          row += ',';
        }
      }
      
      csvContent += row + '\n';
    }
    
    // Add statistics section
    csvContent += '\n\nStatistics\n';
    csvContent += `Total Classes,${timetable.statistics.totalClasses}\n`;
    csvContent += `Faculty Utilization,${timetable.statistics.facultyUtilization.toFixed(1)}%\n`;
    csvContent += `Room Utilization,${timetable.statistics.roomUtilization.toFixed(1)}%\n`;
    csvContent += `Conflicts,${timetable.statistics.conflicts}\n`;
    
    // Add conflicts section
    if (timetable.conflicts.length > 0) {
      csvContent += '\n\nConflicts\n';
      csvContent += 'Type,Description\n';
      
      for (const conflict of timetable.conflicts) {
        csvContent += `${conflict.type},"${conflict.description}"\n`;
      }
    }
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `timetable_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

export default ExcelExporter;