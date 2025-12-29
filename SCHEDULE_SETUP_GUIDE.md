# 🚀 Quick Setup Guide for Schedule Feature

## Step-by-Step Setup

### 1. Database Setup (Required)
Run the SQL script in your Supabase dashboard:

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Open the file `ADD_SCHEDULE_TABLE.sql`
4. Copy all the SQL code
5. Paste it into the SQL Editor
6. Click **Run** or press `Ctrl+Enter`

You should see: ✅ Success message

### 2. Verify Installation
The following files have been created/updated:

#### New Files:
- ✅ `src/pages/Schedule.tsx` - Main schedule page
- ✅ `src/services/scheduleStorage.ts` - Data management
- ✅ `ADD_SCHEDULE_TABLE.sql` - Database schema
- ✅ `SCHEDULE_FEATURE.md` - Full documentation
- ✅ `SCHEDULE_SETUP_GUIDE.md` - This file

#### Updated Files:
- ✅ `src/types/index.ts` - Added schedule types
- ✅ `src/App.tsx` - Added /schedule route
- ✅ `src/components/Layout.tsx` - Added schedule navigation

### 3. Start the Application
```bash
npm run dev
```

### 4. Access the Schedule
1. Log in to your application
2. Click on **📅 Schedule** in the navigation menu
3. You should see the calendar view

### 5. Test Admin Functions (Admin Users Only)
If you're logged in as an admin:

1. Click **➕ Add Event**
2. Fill in the form:
   - Title: "Test Event"
   - Type: "Event"
   - Start Date: Today's date
   - End Date: Today's date
3. Click **Add Event**
4. Verify the event appears on the calendar

## Features Available

### All Users Can:
- ✅ View the calendar
- ✅ See all events
- ✅ Switch between Calendar and List views
- ✅ Click on dates to see events
- ✅ Navigate between months

### Admin Users Can:
- ✅ Add new events
- ✅ Edit existing events
- ✅ Delete events
- ✅ Link events to subjects
- ✅ Set event times and locations

## Event Types

When creating events, you can choose from:

1. **📚 Class** - Regular class sessions
   - Use for: Daily classes, lectures, labs
   - Color: Blue

2. **📝 Exam** - Examinations
   - Use for: Midterms, finals, quizzes
   - Color: Red (high visibility)

3. **📅 Event** - General events
   - Use for: Meetings, presentations, workshops
   - Color: Green

4. **🎉 Holiday** - Holidays and breaks
   - Use for: Vacation periods, public holidays
   - Color: Purple

## Quick Example: Adding an Exam

1. Click **➕ Add Event**
2. Fill in:
   ```
   Title: Mathematics Final Exam
   Description: Final examination for Semester 1
   Type: Exam
   Start Date: 2025-01-15
   End Date: 2025-01-15
   Start Time: 09:00
   End Time: 11:00
   Location: Room A101
   Link to Subject: [Select Mathematics from dropdown]
   ```
3. Click **Add Event**
4. The exam will appear on January 15th in red

## Troubleshooting

### Problem: "Add Event" button not visible
**Solution**: You need to be logged in as an admin user

### Problem: Events not saving
**Solution**: 
1. Check Supabase connection in `src/lib/supabase.ts`
2. Verify you ran the SQL script
3. Check browser console for errors
4. Events are still saved in localStorage as backup

### Problem: Calendar not displaying correctly
**Solution**: 
1. Clear browser cache
2. Refresh the page
3. Try switching to List view

## Next Steps

1. ✅ Add your class schedule
2. ✅ Mark all exam dates
3. ✅ Add important events
4. ✅ Mark holiday periods
5. ✅ Share the schedule with students

## Tips for Best Results

### For Class Schedules
- Create recurring patterns manually (e.g., "Math - Monday 9:00-11:00")
- Use the same title format for consistency
- Always link to the subject
- Include room numbers in location

### For Exams
- Add exams well in advance
- Include exam duration in time fields
- Add preparation notes in description
- Link to the subject being examined

### For Events
- Use descriptive titles
- Add details in description
- Include meeting links if virtual
- Specify location clearly

### For Holidays
- Mark entire break periods
- Use date ranges (start to end)
- Add holiday name in title
- Consider adding description with return date

## Support

If you encounter any issues:
1. Check the `SCHEDULE_FEATURE.md` for detailed documentation
2. Verify all setup steps were completed
3. Check browser console for error messages
4. Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)

---

**Setup Complete!** 🎉

You now have a fully functional schedule management system. Start by adding your first event!

