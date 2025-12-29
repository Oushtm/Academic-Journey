import { supabase } from '../lib/supabase';
import type { ScheduleEvent } from '../types';

const STORAGE_KEY = 'schedule_events';

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

