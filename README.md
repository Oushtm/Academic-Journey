# 📚 Academic Management System

A comprehensive academic tracking and management system built with React, TypeScript, and Supabase.

## ✨ Features

### Core Features
- 🎓 **Academic Year Management** - Track 5 years of academic progress
- 📊 **Module & Subject Organization** - Structured course management
- 📝 **Lesson Tracking** - Manage lessons with review status
- 📈 **Grade Calculations** - Automatic score calculations with attendance penalties
- 👥 **User Management** - Admin and student roles
- 📅 **Schedule & Calendar** - Complete timetable management (NEW!)

### Schedule Feature (Emploi du Temps)
- 📅 **Interactive Calendar View** - Visual monthly calendar
- 📋 **List View** - Detailed event listings
- 📚 **Multiple Event Types** - Classes, Exams, Events, Holidays
- 🔐 **Admin Controls** - Full CRUD operations for admins
- 🎨 **Color-Coded Events** - Easy visual identification
- 📱 **Fully Responsive** - Works on all devices
- 🔗 **Subject Linking** - Connect events to academic subjects
- 🕐 **Time Management** - Date ranges and specific time slots
- 📍 **Location Tracking** - Event location support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)
- Modern web browser

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd academic-management-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Supabase**
- Create a new Supabase project
- Copy your project URL and anon key
- Update `src/lib/supabase.ts` with your credentials

4. **Set up the database**
- Open Supabase SQL Editor
- Run `CREATE_TABLES.sql` first
- Run `ADD_SCHEDULE_TABLE.sql` for schedule feature

5. **Start the development server**
```bash
npm run dev
```

6. **Open in browser**
```
http://localhost:5173
```

## 📖 Documentation

### General Documentation
- `QUICK_SETUP.md` - Quick setup guide
- `SETUP_COMPLETE.md` - Complete setup instructions
- `SUPABASE_SETUP.md` - Supabase configuration

### Schedule Feature Documentation
- `SCHEDULE_FEATURE.md` - Complete feature documentation
- `SCHEDULE_SETUP_GUIDE.md` - Setup and quick start
- `SCHEDULE_VISUAL_GUIDE.md` - Visual interface guide
- `SCHEDULE_IMPLEMENTATION_SUMMARY.md` - Technical details
- `SCHEDULE_CHECKLIST.md` - Implementation checklist

### Database
- `CREATE_TABLES.sql` - Main database schema
- `ADD_SCHEDULE_TABLE.sql` - Schedule feature schema

## 🎯 Main Features

### For Students
- View academic years and modules
- Track lesson progress
- Monitor grades and attendance
- Review lesson materials
- View schedule and upcoming events
- Check exam dates

### For Administrators
- Create and manage users
- Add/edit academic structure
- Manage lessons and materials
- Add/edit/delete schedule events
- Track student progress
- Manage exams and events

## 🗂️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx
│   ├── AddModuleForm.tsx
│   └── ...
├── context/            # React Context providers
│   ├── AuthContext.tsx
│   └── AcademicContext.tsx
├── pages/              # Page components
│   ├── Home.tsx
│   ├── Dashboard.tsx
│   ├── Schedule.tsx    # NEW: Schedule page
│   └── ...
├── services/           # Data management services
│   ├── authStorage.ts
│   ├── sharedStorage.ts
│   └── scheduleStorage.ts  # NEW: Schedule service
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── calculations.ts
└── lib/                # External library configs
    └── supabase.ts
```

## 🎨 Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **State Management**: React Context API

## 🔐 Authentication

- First user becomes admin automatically
- Admins can create additional users
- Session-based authentication
- Protected routes for authenticated users

## 📅 Schedule Feature

The schedule feature provides a complete timetable management system:

### Event Types
- 📚 **Class** - Regular class sessions (Blue)
- 📝 **Exam** - Examinations (Red)
- 📅 **Event** - General events (Green)
- 🎉 **Holiday** - Holidays and breaks (Purple)

### Views
- **Calendar View** - Interactive monthly calendar with event badges
- **List View** - Detailed list of all events with full information

### Permissions
- **All Users**: View schedule and events
- **Admins Only**: Add, edit, and delete events

For detailed schedule documentation, see `SCHEDULE_FEATURE.md`.

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📱 Responsive Design

The application is fully responsive and works on:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop computers (1024px+)
- 🖥️ Large screens (1920px+)

## 🔄 Data Storage

- **Primary Storage**: Supabase PostgreSQL database
- **Backup Storage**: Browser localStorage (automatic fallback)
- **Sync**: Automatic synchronization between storage layers

## 🎓 Academic Structure

```
Academic Years (1-5)
  └── Modules
      └── Subjects
          └── Lessons
              ├── Notes
              ├── YouTube Links
              ├── Course Links
              └── PDF Files
```

## 📊 Grade Calculation

- Assignment Score (40%)
- Exam Score (60%)
- Attendance Penalty (0.5 points per missed session)
- Final Score = (Assignment × 0.4 + Exam × 0.6) - Penalty

## 🌟 Recent Updates

### Version 1.1.0 (December 2025)
- ✅ Added complete schedule/timetable feature
- ✅ Calendar view with monthly navigation
- ✅ Event management (Classes, Exams, Events, Holidays)
- ✅ Admin-only editing capabilities
- ✅ Subject linking for events
- ✅ Time and location tracking
- ✅ Mobile-responsive calendar interface
- ✅ Color-coded event types
- ✅ Comprehensive documentation

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions:
1. Check the documentation files
2. Review the troubleshooting sections
3. Check browser console for errors
4. Contact your system administrator

## 🎉 Credits

Built with ❤️ using:
- React
- TypeScript
- Tailwind CSS
- Supabase
- Vite

---

**Version**: 1.1.0  
**Last Updated**: December 29, 2025  
**Status**: ✅ Production Ready

For more information, see the documentation files in the project root.
