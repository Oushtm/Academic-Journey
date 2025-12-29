# 📅 Schedule Feature (Emploi du Temps)

## Overview
The Schedule feature provides a comprehensive calendar system for managing classes, exams, events, and holidays. Only administrators can add, edit, or delete schedule events, while all users can view the calendar.

## Features

### 🎯 Key Capabilities
1. **Calendar View** - Interactive monthly calendar with event visualization
2. **List View** - Detailed list of all events for the current month
3. **Event Types** - Support for 4 types of events:
   - 📚 **Class** - Regular class sessions
   - 📝 **Exam** - Examination schedules
   - 📅 **Event** - General events (meetings, presentations, etc.)
   - 🎉 **Holiday** - Holidays and breaks

4. **Admin Controls** - Full CRUD operations (Create, Read, Update, Delete)
5. **Subject Linking** - Optional linking of events to specific subjects
6. **Time Management** - Support for date ranges and specific time slots
7. **Location Tracking** - Optional location field for events

### 🔐 Permissions
- **All Users**: Can view the schedule and all events
- **Admins Only**: Can add, edit, and delete events

## Database Setup

### Step 1: Run SQL Script
Execute the `ADD_SCHEDULE_TABLE.sql` file in your Supabase SQL Editor:

```sql
-- This creates the schedule_events table with all necessary fields
-- Run this after CREATE_TABLES.sql
```

The table includes:
- Event details (title, description, type)
- Date and time information
- Location and subject linking
- Audit fields (created_by, created_at, updated_at)

## Usage Guide

### For All Users

#### Viewing the Schedule
1. Navigate to **📅 Schedule** in the main menu
2. Choose between two view modes:
   - **Calendar View**: Visual monthly calendar with color-coded events
   - **List View**: Detailed list of all events

#### Calendar Navigation
- Use **Previous/Next** buttons to navigate between months
- Click on any date to see all events for that day
- Events are color-coded by type:
  - 🔵 Blue: Classes
  - 🔴 Red: Exams
  - 🟢 Green: Events
  - 🟣 Purple: Holidays

### For Administrators

#### Adding a New Event
1. Click the **➕ Add Event** button
2. Fill in the required fields:
   - **Title*** (required)
   - **Type*** (required): Select from Class, Exam, Event, or Holiday
   - **Start Date*** (required)
   - **End Date*** (required)
3. Optional fields:
   - **Description**: Additional details about the event
   - **Start Time** & **End Time**: Specific time slots
   - **Location**: Where the event takes place
   - **Link to Subject**: Associate with a specific subject
4. Click **Add Event** to save

#### Editing an Event
1. In either Calendar or List view, click the **✏️ Edit** button on any event
2. Modify the desired fields
3. Click **Update Event** to save changes

#### Deleting an Event
1. Click the **🗑️ Delete** button on any event
2. Confirm the deletion when prompted

## Technical Details

### File Structure
```
src/
├── types/index.ts              # Added ScheduleEvent and EventType types
├── services/
│   └── scheduleStorage.ts      # Schedule data management
├── pages/
│   └── Schedule.tsx            # Main schedule page component
├── components/
│   └── Layout.tsx              # Updated with schedule navigation
└── App.tsx                     # Added /schedule route

ADD_SCHEDULE_TABLE.sql          # Database schema for schedule events
```

### Data Storage
- **Primary Storage**: Supabase PostgreSQL database
- **Backup Storage**: Browser localStorage (automatic fallback)
- **Sync**: Automatic synchronization between Supabase and localStorage

### Event Types
```typescript
type EventType = 'class' | 'exam' | 'event' | 'holiday';

interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  startDate: string;        // ISO date string (YYYY-MM-DD)
  endDate: string;          // ISO date string (YYYY-MM-DD)
  startTime?: string;       // HH:MM format
  endTime?: string;         // HH:MM format
  location?: string;
  subjectId?: string;       // Optional link to subject
  createdBy: string;        // User ID of creator
  createdAt: number;        // Timestamp
  updatedAt: number;        // Timestamp
}
```

## Best Practices

### For Admins
1. **Use Descriptive Titles**: Make event titles clear and concise
2. **Add Descriptions**: Provide additional context for important events
3. **Link to Subjects**: Associate exams and classes with their subjects
4. **Include Locations**: Always specify where events take place
5. **Set Time Ranges**: Use start/end times for precise scheduling
6. **Plan Ahead**: Add events well in advance
7. **Regular Updates**: Keep the schedule current and remove past events

### Event Organization
- **Classes**: Use for regular course sessions
- **Exams**: Mark all examination dates clearly
- **Events**: Use for special occasions, presentations, or meetings
- **Holidays**: Mark vacation periods and public holidays

## Color Coding System
Events are automatically color-coded for easy identification:
- 📚 **Classes**: Blue background
- 📝 **Exams**: Red background (high visibility)
- 📅 **Events**: Green background
- 🎉 **Holidays**: Purple background

## Mobile Responsiveness
The schedule is fully responsive and works on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktop computers

## Future Enhancements (Possible)
- Email/push notifications for upcoming events
- Recurring events support
- Export to iCal/Google Calendar
- Event reminders
- Attendance tracking for classes
- Conflict detection for overlapping events

## Troubleshooting

### Events Not Showing
1. Check if you're viewing the correct month
2. Verify the date range of the event
3. Try switching between Calendar and List view

### Can't Add Events
1. Ensure you're logged in as an admin
2. Check that all required fields are filled
3. Verify date format is correct

### Data Not Syncing
1. Check your internet connection
2. Verify Supabase configuration in `src/lib/supabase.ts`
3. Check browser console for errors
4. Data is backed up in localStorage automatically

## Support
For issues or questions about the schedule feature, contact your system administrator.

---

**Version**: 1.0  
**Last Updated**: December 2025  
**Feature Status**: ✅ Fully Implemented

