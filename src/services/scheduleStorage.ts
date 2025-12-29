import { supabase } from '../lib/supabase';
import type { ScheduleEvent, AttendanceRecord, DayOfWeek } from '../types';

const STORAGE_KEY = 'schedule_events';
const ATTENDANCE_KEY = 'attendance_records';

// Load all schedule events
export async function loadScheduleEvents(): Promise<ScheduleEvent[]> {
  try {
    if (!supabase) {
      // Fallback to localStorage if supabase is not configured
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }

    const { data, error } = await supabase
      .from('schedule_events')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error loading schedule events from Supabase:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }

    // Map snake_case to camelCase
    const events: ScheduleEvent[] = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      startDate: row.start_date,
      endDate: row.end_date,
      startTime: row.start_time,
      endTime: row.end_time,
      location: row.location,
      subjectId: row.subject_id,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isRecurring: row.is_recurring,
      dayOfWeek: row.day_of_week,
    }));

    // Also save to localStorage as backup
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    return events;
  } catch (error) {
    console.error('Error in loadScheduleEvents:', error);
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }
}

// Save all schedule events
export async function saveScheduleEvents(events: ScheduleEvent[]): Promise<void> {
  try {
    // Save to localStorage first
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));

    if (!supabase) {
      // If supabase is not configured, just use localStorage
      return;
    }

    // Delete all existing events and insert new ones
    await supabase.from('schedule_events').delete().neq('id', '');

    // Map camelCase to snake_case for Supabase
    const rows = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type,
      start_date: event.startDate,
      end_date: event.endDate,
      start_time: event.startTime,
      end_time: event.endTime,
      location: event.location,
      subject_id: event.subjectId,
      created_by: event.createdBy,
      created_at: event.createdAt,
      updated_at: event.updatedAt,
      is_recurring: event.isRecurring,
      day_of_week: event.dayOfWeek,
    }));

    if (rows.length > 0 && supabase) {
      const { error } = await supabase.from('schedule_events').insert(rows);
      if (error) {
        console.error('Error saving schedule events to Supabase:', error);
      }
    }
  } catch (error) {
    console.error('Error in saveScheduleEvents:', error);
  }
}

// Add a new schedule event
export async function addScheduleEvent(event: ScheduleEvent): Promise<void> {
  const events = await loadScheduleEvents();
  events.push(event);
  await saveScheduleEvents(events);
}

// Update an existing schedule event
export async function updateScheduleEvent(eventId: string, updates: Partial<ScheduleEvent>): Promise<void> {
  const events = await loadScheduleEvents();
  const index = events.findIndex((e) => e.id === eventId);
  if (index !== -1) {
    events[index] = { ...events[index], ...updates, updatedAt: Date.now() };
    await saveScheduleEvents(events);
  }
}

// Delete a schedule event
export async function deleteScheduleEvent(eventId: string): Promise<void> {
  const events = await loadScheduleEvents();
  const filtered = events.filter((e) => e.id !== eventId);
  await saveScheduleEvents(filtered);
}

// Get events for a specific date range
export function getEventsInRange(events: ScheduleEvent[], startDate: Date, endDate: Date): ScheduleEvent[] {
  return events.filter((event) => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    return eventStart <= endDate && eventEnd >= startDate;
  });
}

// Get events for a specific month
export function getEventsForMonth(events: ScheduleEvent[], year: number, month: number): ScheduleEvent[] {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  return getEventsInRange(events, startDate, endDate);
}

// Get day of week from date
export function getDayOfWeek(date: Date): DayOfWeek {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

// Get recurring events for a specific date
export function getRecurringEventsForDate(events: ScheduleEvent[], date: Date): ScheduleEvent[] {
  const dayOfWeek = getDayOfWeek(date);
  return events.filter((event) => event.isRecurring && event.dayOfWeek === dayOfWeek);
}

// Get all events for a specific date (including recurring)
export function getAllEventsForDate(events: ScheduleEvent[], date: Date): ScheduleEvent[] {
  const dateStr = date.toISOString().split('T')[0];
  const regularEvents = events.filter((event) => {
    if (event.isRecurring) return false;
    return dateStr >= event.startDate && dateStr <= event.endDate;
  });
  const recurringEvents = getRecurringEventsForDate(events, date);
  return [...regularEvents, ...recurringEvents];
}

// Attendance Management
export async function loadAttendanceRecords(): Promise<AttendanceRecord[]> {
  try {
    const stored = localStorage.getItem(ATTENDANCE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading attendance records:', error);
    return [];
  }
}

export async function saveAttendanceRecords(records: AttendanceRecord[]): Promise<void> {
  try {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Error saving attendance records:', error);
  }
}

export async function markAbsence(userId: string, eventId: string, subjectId: string, date: string): Promise<void> {
  const records = await loadAttendanceRecords();
  
  // Check if already marked
  const existingIndex = records.findIndex(
    (r) => r.userId === userId && r.eventId === eventId && r.date === date
  );
  
  if (existingIndex >= 0) {
    // Update existing record
    records[existingIndex].isAbsent = true;
    records[existingIndex].markedAt = Date.now();
  } else {
    // Create new record
    const newRecord: AttendanceRecord = {
      id: `attendance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      eventId,
      subjectId,
      date,
      isAbsent: true,
      markedAt: Date.now(),
    };
    records.push(newRecord);
  }
  
  await saveAttendanceRecords(records);
}

export async function markPresence(userId: string, eventId: string, date: string): Promise<void> {
  const records = await loadAttendanceRecords();
  
  const existingIndex = records.findIndex(
    (r) => r.userId === userId && r.eventId === eventId && r.date === date
  );
  
  if (existingIndex >= 0) {
    records[existingIndex].isAbsent = false;
    records[existingIndex].markedAt = Date.now();
    await saveAttendanceRecords(records);
  }
}

export async function getAbsencesForUser(userId: string, subjectId?: string): Promise<AttendanceRecord[]> {
  const records = await loadAttendanceRecords();
  return records.filter(
    (r) => r.userId === userId && r.isAbsent && (!subjectId || r.subjectId === subjectId)
  );
}

export async function getAbsenceCountForSubject(userId: string, subjectId: string): Promise<number> {
  const absences = await getAbsencesForUser(userId, subjectId);
  return absences.length;
}

