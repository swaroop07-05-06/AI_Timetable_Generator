# AI Timetable Generator 🗓️

A sophisticated full-stack web application that generates optimized academic timetables using constraint-based algorithms with intelligent conflict resolution.

## ✨ Features

### Frontend
- **Multi-step Form Interface**: User-friendly forms for courses, faculty, rooms, and student data
- **Interactive Timetable Grid**: Visual weekly schedule with color-coded classes
- **Export Options**: Export to Excel (.csv) and Google Sheets
- **Real-time Validation**: Form validation with helpful error messages
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Modern UI**: Beautiful gradients, animations, and micro-interactions

### Backend
- **RESTful API**: Built with Express.js and comprehensive endpoint coverage
- **Intelligent Scheduling**: Constraint-based algorithm for optimal timetable generation
- **Conflict Resolution**: Automatic detection and reporting of scheduling conflicts
- **Statistics Dashboard**: Faculty and room utilization metrics
- **Data Persistence**: In-memory storage (easily extensible to databases)

### Algorithm Features
- **No Faculty Clashes**: Ensures no teacher is double-booked
- **Room Capacity Management**: Respects room capacity and type requirements
- **Elective Matching**: Handles student elective preferences
- **Credit Hour Satisfaction**: Meets course credit and hour requirements
- **Availability Constraints**: Considers faculty availability windows

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ai-timetable-generator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Start the backend server** (in a new terminal):
   ```bash
   npm run server
   ```

5. **Open your browser** and navigate to `http://localhost:5173`

## 📊 Usage Guide

### Step 1: Add Courses
- Enter course name, code, and credits
- Specify theory and practical hours per week
- Select course type (theory/practical/both)

### Step 2: Add Faculty
- Enter faculty name and maximum hours per week
- Set availability windows for each day
- Assign subjects the faculty can teach

### Step 3: Add Rooms
- Enter room name, capacity, and type
- Specify available equipment
- Choose room type (classroom/lab/auditorium)

### Step 4: Add Students
- Enter student information and program type
- Select elective courses for each student
- Specify semester information

### Step 5: Generate & Export
- Review the summary and generate timetable
- View statistics and conflict analysis
- Export to Excel or Google Sheets

## 🔧 API Endpoints

### Core Endpoints
- `POST /api/generate` - Generate new timetable
- `GET /api/timetable/:id` - Get specific timetable
- `GET /api/timetables` - List all timetables
- `DELETE /api/timetable/:id` - Delete timetable

### Export Endpoints
- `POST /api/export/excel` - Export to Excel format
- `POST /api/export/google-sheets` - Export to Google Sheets

### Example API Usage

```javascript
// Generate timetable
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    courses: [...],
    faculty: [...],
    rooms: [...],
    students: [...],
    preferences: {
      startTime: '09:00',
      endTime: '17:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    }
  })
});

const { timetable } = await response.json();
```

## 🏗️ Architecture

### Frontend Structure
```
src/
├── components/          # React components
│   ├── FormStep.tsx    # Multi-step form wrapper
│   ├── CourseForm.tsx  # Course input form
│   ├── FacultyForm.tsx # Faculty input form
│   ├── RoomForm.tsx    # Room input form
│   ├── StudentForm.tsx # Student input form
│   └── TimetableGrid.tsx # Timetable display
├── services/           # Business logic
│   ├── timetableGenerator.ts
│   ├── excelExporter.ts
│   └── googleSheetsExporter.ts
├── types/              # TypeScript definitions
└── App.tsx             # Main application
```

### Backend Structure
```
server/
└── index.js            # Express server with all routes
```

## 🔬 Algorithm Details

The timetable generation uses a **greedy algorithm** with constraint satisfaction:

1. **Time Slot Generation**: Creates available time slots based on preferences
2. **Course Scheduling**: Iterates through courses and assigns optimal slots
3. **Constraint Checking**: Validates faculty availability and room capacity
4. **Conflict Detection**: Identifies and reports scheduling conflicts
5. **Statistics Calculation**: Computes utilization metrics

### Constraints Handled
- Faculty availability windows
- Room capacity and type requirements
- No double-booking of faculty or rooms
- Student elective preferences
- Course credit hour requirements

## 📤 Export Features

### Excel Export
- Generates CSV format compatible with Excel
- Includes timetable grid and statistics
- Automatic file download functionality

### Google Sheets Integration
- Copies formatted data to clipboard
- Opens new Google Sheets tab
- Easy paste-and-use workflow

## 🚀 Deployment

### Local Development
```bash
npm run dev        # Frontend development server
npm run server:dev # Backend with auto-reload
```

### Production Build
```bash
npm run build      # Build frontend
npm run server     # Production server
```

### Deployment Options

#### Heroku
1. Create new Heroku app
2. Set buildpacks for Node.js
3. Configure environment variables
4. Deploy via Git push

#### Render
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set start command: `npm run server`
4. Deploy automatically

## 🔧 Configuration

### Environment Variables
```bash
PORT=3001                    # Backend server port
NODE_ENV=production         # Environment mode
```

### Customization Options
- Modify time slot duration in `timetableGenerator.ts`
- Adjust UI colors in Tailwind classes
- Extend constraint logic for specific requirements
- Add database integration for persistence

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the GitHub Issues page
- Review the API documentation
- Contact the development team

---

Built with ❤️ using React, TypeScript, Express.js, and Tailwind CSS