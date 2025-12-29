# 📅 Weekly Schedule & Attendance Tracking - Complete Guide

## 🎉 What's New

Your schedule system has been **completely upgraded** with:

### ✨ New Features

1. **📅 Weekly Recurring Schedule**
   - Add classes once, they repeat every week automatically
   - Perfect for your regular timetable
   - No need to add events manually each week

2. **❌ Student Attendance Tracking**
   - Students can mark themselves absent
   - Absences are automatically linked to subjects
   - Missed sessions count is updated automatically
   - Penalty calculation (0.5 points per absence)

3. **📊 Attendance Summary**
   - Students see their absence count per subject
   - Real-time penalty calculation
   - Visual attendance dashboard

4. **🗓️ Enhanced Weekly View**
   - See the entire week at a glance
   - Today's date is highlighted
   - Navigate between weeks easily
   - Shows current date and day name

## 🚀 Quick Setup (3 Steps)

### Step 1: Update Database
Run the updated SQL script in Supabase:

```sql
-- The ADD_SCHEDULE_TABLE.sql file has been updated
-- It now includes:
-- - is_recurring and day_of_week fields
-- - attendance_records table
-- - Additional indexes
```

1. Open Supabase SQL Editor
2. Copy content from `ADD_SCHEDULE_TABLE.sql`
3. Run the script

### Step 2: Start Your App
```bash
npm run dev
```

### Step 3: Add Your Weekly Schedule
As an admin, add the 14 recurring classes (see details below)

## 📚 Your Weekly Schedule

### Monday (Lundi)
- **09:00 - 10:30**: Organisation des Entreprises
- **10:45 - 12:45**: Algèbre
- **14:30 - 16:00**: Circuit Électrique

### Tuesday (Mardi)
- **08:30 - 11:45**: Algorithme
- **12:30 - 14:00**: Comptabilité

### Wednesday (Mercredi)
- **09:00 - 10:30**: Analyse de Controverses
- **10:45 - 12:45**: MTU
- **14:00 - 17:15**: Langage de Programmation

### Thursday (Jeudi)
- **08:30 - 10:30**: Analyse
- **10:45 - 12:15**: Circuit Numérique
- **14:00 - 16:00**: TP Circuit Électrique
- **16:15 - 18:15**: TP Langage de Programmation

### Friday (Vendredi)
- **09:00 - 10:30**: English
- **10:45 - 12:15**: Français

## 🎯 How to Add Your Schedule (Admin)

### Option 1: Manual Entry (Recommended for first time)

1. Click **📅 Schedule** in navigation
2. Click **➕ Add Event**
3. For each class:
   - Enter the **Title** (e.g., "Algèbre")
   - Select **Type**: 📚 Class
   - Check ✅ **Recurring Weekly Event**
   - Select **Day of Week** (e.g., Monday)
   - Enter **Start Time** (e.g., 09:00)
   - Enter **End Time** (e.g., 10:30)
   - Optionally link to **Subject** (if you've created it)
   - Click **Add Event**

4. Repeat for all 14 classes

### Option 2: Quick Reference
Use the `ADD_WEEKLY_SCHEDULE.md` file for detailed step-by-step instructions for each class.

### Option 3: Template File
A `weekly-schedule-template.json` file is provided with all your classes pre-configured.

## 👨‍🎓 How Students Mark Attendance

### For Students:

1. **Navigate to Schedule**
   - Click **📅 Schedule** in the menu
   - You'll see the weekly view by default

2. **View Your Classes**
   - Today's date is highlighted
   - All your classes for the week are visible
   - Each class shows time and location

3. **Mark Yourself Absent**
   - Find the class you're absent from
   - Click the **❌ Mark Absent** button
   - Confirm the action
   - ✅ Done! Your absence is recorded

4. **Check Your Attendance**
   - Scroll down to see **📊 Your Attendance Summary**
   - View absences per subject
   - See the penalty calculation

### What Happens When You Mark Absent:
1. ✅ Absence is recorded with date and time
2. ✅ Subject's missed sessions count increases by 1
3. ✅ Penalty is calculated (0.5 points per absence)
4. ✅ Attendance summary updates immediately
5. ✅ Your grade calculation includes the penalty

## 🎨 Interface Overview

### Weekly View
```
┌─────────────────────────────────────────────────────┐
│  📅 Emploi du Temps                                 │
│  Weekly Schedule & Attendance Tracking              │
│  [📅 Week] [📋 List] [➕ Add Event]                │
├─────────────────────────────────────────────────────┤
│  [← Previous Week]  [📍 Today]  [Next Week →]      │
│                                                      │
│  ┌────────┬────────┬────────┬────────┬────────┐   │
│  │ Monday │Tuesday │Wednesday│Thursday│ Friday │   │
│  │ Jan 15 │ Jan 16 │ Jan 17 │ Jan 18 │ Jan 19 │   │
│  ├────────┼────────┼────────┼────────┼────────┤   │
│  │ 📚 9:00│ 📚 8:30│ 📚 9:00│ 📚 8:30│ 📚 9:00│   │
│  │ Org.   │ Algo   │ Analyse│ Analyse│ English│   │
│  │ Entrep.│        │ Contro.│        │        │   │
│  │ ❌ Abs │ ❌ Abs │ ❌ Abs │ ❌ Abs │ ❌ Abs │   │
│  │        │        │        │        │        │   │
│  │ 📚10:45│ 📚12:30│ 📚10:45│ 📚10:45│ 📚10:45│   │
│  │ Algèbre│ Compta.│ MTU    │ Circuit│ Français│  │
│  │ ❌ Abs │ ❌ Abs │ ❌ Abs │ Num.   │ ❌ Abs │   │
│  │        │        │        │ ❌ Abs │        │   │
│  │ 📚14:30│        │ 📚14:00│ 📚14:00│        │   │
│  │ Circuit│        │ Lang.  │ TP Circ│        │   │
│  │ Élec.  │        │ Program│ Élec.  │        │   │
│  │ ❌ Abs │        │ ❌ Abs │ ❌ Abs │        │   │
│  │        │        │        │        │        │   │
│  │        │        │        │ 📚16:15│        │   │
│  │        │        │        │ TP Lang│        │   │
│  │        │        │        │ Program│        │   │
│  │        │        │        │ ❌ Abs │        │   │
│  └────────┴────────┴────────┴────────┴────────┘   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  📊 Your Attendance Summary                         │
├─────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ Algèbre      │  │ Algorithme   │  │ English  │ │
│  │ 3 absences   │  │ 1 absence    │  │ 2 absences│ │
│  │ Penalty: 1.5 │  │ Penalty: 0.5 │  │ Penalty:1.0│ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
└─────────────────────────────────────────────────────┘
```

## 🔐 Permissions

### Admin Users Can:
- ✅ Add recurring weekly events
- ✅ Edit any event
- ✅ Delete events
- ✅ View all attendance records
- ✅ Manage the schedule

### Regular Users (Students) Can:
- ✅ View the weekly schedule
- ✅ Mark themselves absent
- ✅ View their attendance summary
- ✅ See penalty calculations
- ❌ Cannot edit or delete events
- ❌ Cannot see other students' attendance

## 📊 Attendance & Grade Calculation

### How It Works:

1. **Student marks absent** → Absence recorded
2. **System updates** → Subject's missed sessions +1
3. **Penalty applied** → 0.5 points per absence
4. **Grade calculation** → Final score includes penalty

### Example:
```
Subject: Algèbre
Assignment Score: 15/20
Exam Score: 14/20
Missed Sessions: 3

Calculation:
Initial S1 Score = (15 × 0.4) + (14 × 0.6) = 14.4
Penalty = 3 × 0.5 = 1.5
Final S1 Score = 14.4 - 1.5 = 12.9/20
```

## 🎯 Best Practices

### For Admins:
1. ✅ Add all classes as recurring events
2. ✅ Link classes to subjects for attendance tracking
3. ✅ Include room numbers in location field
4. ✅ Use consistent naming for classes
5. ✅ Review attendance reports regularly

### For Students:
1. ✅ Mark absences on the same day
2. ✅ Check your attendance summary regularly
3. ✅ Be aware of penalty calculations
4. ✅ Contact admin if you marked absent by mistake
5. ✅ Use the weekly view to plan your week

## 🔧 Technical Details

### Database Tables

#### schedule_events
- Stores all events (recurring and one-time)
- `is_recurring`: Boolean flag for weekly events
- `day_of_week`: Which day the event repeats on
- `start_time` & `end_time`: Time slots

#### attendance_records
- Stores all absence records
- Links to user, event, and subject
- Includes date and timestamp
- `is_absent`: Boolean flag

### Data Flow
```
Student clicks "Mark Absent"
    ↓
Create AttendanceRecord
    ↓
Update Subject's missedSessions
    ↓
Calculate penalty
    ↓
Update grade calculation
    ↓
Refresh attendance summary
```

## 🐛 Troubleshooting

### Problem: "Mark Absent" button not showing
**Solution**: 
- Only shows for class events (not exams/holidays)
- Only shows if event is linked to a subject
- Only shows for non-admin users

### Problem: Absence not counting in grade
**Solution**:
- Ensure the class is linked to the correct subject
- Check that the subject exists in your academic structure
- Refresh the page to see updated calculations

### Problem: Can't add recurring events
**Solution**:
- You must be logged in as admin
- Check the "Recurring Weekly Event" checkbox
- Select a day of the week
- Times are required

### Problem: Weekly view not showing classes
**Solution**:
- Ensure events are marked as recurring
- Check that `is_recurring` is true
- Verify the day_of_week is set correctly
- Run the updated SQL script

## 📱 Mobile Support

The weekly schedule is fully responsive:
- ✅ Vertical scrolling on mobile
- ✅ Touch-friendly buttons
- ✅ Optimized layout for small screens
- ✅ Easy absence marking on mobile

## 🎓 Example Usage Scenario

### Monday Morning:
1. Student wakes up feeling sick
2. Opens the app on phone
3. Goes to Schedule page
4. Sees Monday's classes
5. Clicks "❌ Mark Absent" for 9:00 AM class
6. Confirms absence
7. System records absence and updates penalty
8. Student can see updated attendance summary

### End of Week:
1. Student checks attendance summary
2. Sees they missed 2 classes
3. Penalty: 1.0 point
4. Plans to attend all classes next week

## 📈 Future Enhancements (Possible)

- Email notifications for marked absences
- Attendance reports for admins
- Export attendance to Excel
- Attendance percentage per subject
- Warning when approaching absence limit
- Bulk absence marking for holidays

## ✅ Setup Checklist

- [ ] Run updated SQL script
- [ ] Test schedule page loads
- [ ] Add all 14 recurring classes
- [ ] Link classes to subjects
- [ ] Test marking absence as student
- [ ] Verify attendance summary shows
- [ ] Check grade penalty calculation
- [ ] Test on mobile device

## 🎉 You're All Set!

Your weekly schedule with attendance tracking is now complete! 

**Key Benefits:**
- ⏱️ Saves time - add classes once
- 📊 Automatic tracking - no manual counting
- 🎯 Accurate penalties - automatic calculation
- 📱 Mobile-friendly - mark absences anywhere
- 👥 Student-friendly - easy to use

---

**Version**: 2.0  
**Last Updated**: December 29, 2025  
**Status**: ✅ Complete & Ready to Use

For questions or issues, refer to the troubleshooting section or check the code comments.

