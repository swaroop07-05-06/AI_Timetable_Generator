import { GeneratedTimetable, Course, Faculty, Room } from '../types';

export class GoogleSheetsExporter {
  static async exportToGoogleSheets(
    timetable: GeneratedTimetable,
    courses: Course[],
    faculty: Faculty[],
    rooms: Room[]
  ): Promise<void> {
    try {
      // This is a simplified version for demonstration
      // In production, you would need proper Google Sheets API integration
      
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
      
      // Create the data structure for Google Sheets
      const sheetData: string[][] = [];
      
      // Header row
      sheetData.push(['Time', ...days]);
      
      // Data rows
      for (const time of timeSlots) {
        const row = [time];
        
        for (const day of days) {
          const entry = timetable.entries.find(e => 
            e.timeSlot.day === day && e.timeSlot.startTime === time
          );
          
          if (entry) {
            const course = courses.find(c => c.id === entry.courseId);
            const facultyMember = faculty.find(f => f.id === entry.facultyId);
            const room = rooms.find(r => r.id === entry.roomId);
            
            const cellContent = `${course?.code || ''} - ${course?.name || ''}\n${facultyMember?.name || ''}\n${room?.name || ''}`;
            row.push(cellContent);
          } else {
            row.push('');
          }
        }
        
        sheetData.push(row);
      }
      
      // For now, we'll create a simple text representation and copy to clipboard
      let textContent = sheetData.map(row => row.join('\t')).join('\n');
      
      // Add statistics
      textContent += '\n\nStatistics:\n';
      textContent += `Total Classes: ${timetable.statistics.totalClasses}\n`;
      textContent += `Faculty Utilization: ${timetable.statistics.facultyUtilization.toFixed(1)}%\n`;
      textContent += `Room Utilization: ${timetable.statistics.roomUtilization.toFixed(1)}%\n`;
      textContent += `Conflicts: ${timetable.statistics.conflicts}\n`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(textContent);
      
      // Open Google Sheets in a new tab
      const googleSheetsUrl = 'https://docs.google.com/spreadsheets/create';
      window.open(googleSheetsUrl, '_blank');
      
      alert('Timetable data has been copied to your clipboard!\nPaste it into the new Google Sheet that just opened.');
      
    } catch (error) {
      console.error('Error exporting to Google Sheets:', error);
      alert('Failed to export to Google Sheets. Please try again.');
    }
  }
}

export default GoogleSheetsExporter;