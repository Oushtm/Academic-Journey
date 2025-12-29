import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAcademic } from '../context/AcademicContext';
import type { ScheduleEvent, EventType, AcademicYear, Module, DayOfWeek } from '../types';
import {
  loadScheduleEvents,
  addScheduleEvent,
  updateScheduleEvent,
  deleteScheduleEvent,
  getAllEventsForDate,
  markAbsence,
  getAbsencesForUser,
} from '../services/scheduleStorage';
import { weeklyScheduleData } from '../utils/addWeeklySchedule';

export function Schedule() {
  const { currentUser } = useAuth();
  const { years, updateUserSubjectData, getUserSubjectData } = useAcademic();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'list'>('week');
  const [absenceCounts, setAbsenceCounts] = useState<Record<string, number>>({});

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'class' as EventType,
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    subjectId: '',
    isRecurring: false,
    dayOfWeek: 'monday' as DayOfWeek,
  });

  useEffect(() => {
    loadEvents();
    loadAbsenceCounts();
  }, [currentUser]);

  // Force reload when view changes
  useEffect(() => {
    loadEvents();
  }, [viewMode]);

  // Auto-add classes if missing (only for admin)
  useEffect(() => {
    const autoAddClasses = async () => {
      if (!currentUser?.isAdmin) return;
      if (events.length > 0 && events.length < 14) {
        console.log('Detected incomplete schedule. Auto-adding all classes...');
        localStorage.removeItem('schedule_events');
        await handleAddAllWeeklyClasses();
      } else if (events.length === 0) {
        console.log('No classes found. Auto-adding all 14 classes...');
        await handleAddAllWeeklyClasses();
      }
    };
    
    if (currentUser?.isAdmin && events.length < 14) {
      autoAddClasses();
    }
  }, [events.length, currentUser]);

  const loadEvents = async () => {
    const loadedEvents = await loadScheduleEvents();
    setEvents(loadedEvents);
  };

  const loadAbsenceCounts = async () => {
    if (!currentUser) return;
    const absences = await getAbsencesForUser(currentUser.id);
    const counts: Record<string, number> = {};
    absences.forEach((absence) => {
      counts[absence.subjectId] = (counts[absence.subjectId] || 0) + 1;
    });
    setAbsenceCounts(counts);
  };

  const handleMarkAbsence = async (event: ScheduleEvent, date: Date) => {
    if (!currentUser || !event.subjectId) return;
    
    const dateStr = date.toISOString().split('T')[0];
    await markAbsence(currentUser.id, event.id, event.subjectId, dateStr);
    
    // Update the subject's missed sessions count
    const currentData = getUserSubjectData(event.subjectId);
    const currentMissed = currentData?.missedSessions || 0;
    await updateUserSubjectData(event.subjectId, {
      missedSessions: currentMissed + 1,
    });
    
    await loadAbsenceCounts();
    alert(`✅ Marked as absent for ${event.title}. This will be counted in your attendance.`);
  };

  const handleAddEvent = async () => {
    if (!currentUser || !formData.title) {
      alert('Please fill in all required fields');
      return;
    }

    if (!formData.isRecurring && (!formData.startDate || !formData.endDate)) {
      alert('Please provide start and end dates for non-recurring events');
      return;
    }

    const newEvent: ScheduleEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      endDate: formData.endDate || '2099-12-31',
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      location: formData.location || undefined,
      subjectId: formData.subjectId || undefined,
      createdBy: currentUser.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isRecurring: formData.isRecurring,
      dayOfWeek: formData.isRecurring ? formData.dayOfWeek : undefined,
    };

    await addScheduleEvent(newEvent);
    await loadEvents();
    resetForm();
    setShowEventModal(false);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent || !formData.title) {
      alert('Please fill in all required fields');
      return;
    }

    await updateScheduleEvent(editingEvent.id, {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      location: formData.location || undefined,
      subjectId: formData.subjectId || undefined,
      isRecurring: formData.isRecurring,
      dayOfWeek: formData.isRecurring ? formData.dayOfWeek : undefined,
    });

    await loadEvents();
    resetForm();
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      await deleteScheduleEvent(eventId);
      await loadEvents();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'class',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      location: '',
      subjectId: '',
      isRecurring: false,
      dayOfWeek: 'monday',
    });
    setEditingEvent(null);
  };

  const openEditModal = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      type: event.type,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      location: event.location || '',
      subjectId: event.subjectId || '',
      isRecurring: event.isRecurring || false,
      dayOfWeek: event.dayOfWeek || 'monday',
    });
    setShowEventModal(true);
  };

  const getEventTypeColor = (type: EventType) => {
    switch (type) {
      case 'class':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'exam':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'event':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'holiday':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case 'class':
        return '📚';
      case 'exam':
        return '📝';
      case 'event':
        return '📅';
      case 'holiday':
        return '🎉';
      default:
        return '📌';
    }
  };

  // Get all subjects for dropdown
  const allSubjects = years.flatMap((year: AcademicYear) =>
    year.modules.flatMap((module: Module) => module.subjects)
  );

  // Weekly view helpers
  const getWeekDates = (date: Date) => {
    const curr = new Date(date);
    const dayOfWeek = curr.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
    
    const monday = new Date(curr);
    monday.setDate(curr.getDate() + diff);
    
    const weekDates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      weekDates.push(day);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(currentDate);

  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddAllWeeklyClasses = async () => {
    if (!currentUser) return;
    
    if (!confirm('This will add all 14 weekly classes to your schedule. Continue?')) {
      return;
    }

    try {
      console.log('Starting to add classes. Total to add:', weeklyScheduleData.length);
      
      const newEvents: ScheduleEvent[] = [];
      for (let i = 0; i < weeklyScheduleData.length; i++) {
        const classData = weeklyScheduleData[i];
        const newEvent: ScheduleEvent = {
          ...classData,
          id: `event-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
          createdBy: currentUser.id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        newEvents.push(newEvent);
        console.log(`Added class ${i + 1}/${weeklyScheduleData.length}:`, newEvent.title, newEvent.dayOfWeek);
      }
      
      // Add all events at once
      for (const event of newEvents) {
        await addScheduleEvent(event);
      }
      
      await loadEvents();
      
      // Verify
      const stored = localStorage.getItem('schedule_events');
      const parsedEvents = stored ? JSON.parse(stored) : [];
      console.log('Verification: Total events in storage:', parsedEvents.length);
      console.log('Friday events:', parsedEvents.filter((e: any) => e.dayOfWeek === 'friday'));
      
      alert(`✅ Successfully added ${newEvents.length} weekly classes!\n\nCheck console for details.`);
    } catch (error) {
      console.error('Error adding weekly classes:', error);
      alert('❌ Error adding classes. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-effect rounded-2xl p-6 shadow-lg border border-gray-200/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              📅 Emploi du Temps
            </h1>
            <p className="text-gray-600 mt-1">Weekly Schedule & Attendance Tracking</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-xl transition-colors font-semibold text-sm ${
                viewMode === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📅 Week
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-xl transition-colors font-semibold text-sm ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 List
            </button>
            <button
              onClick={() => {
                loadEvents();
                // Debug: Show what's in storage
                const stored = localStorage.getItem('schedule_events');
                const parsedEvents = stored ? JSON.parse(stored) : [];
                console.log('=== STORAGE DEBUG ===');
                console.log('Total events in storage:', parsedEvents.length);
                console.log('Recurring events:', parsedEvents.filter((e: any) => e.isRecurring).length);
                console.log('Friday events:', parsedEvents.filter((e: any) => e.dayOfWeek === 'friday'));
                console.log('All days:', parsedEvents.filter((e: any) => e.isRecurring).map((e: any) => ({ title: e.title, day: e.dayOfWeek })));
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-semibold text-sm"
            >
              🔄 Refresh
            </button>
            {currentUser?.isAdmin && (
              <>
                {events.length < 14 && (
                  <button
                    onClick={async () => {
                      if (!currentUser) return;
                      // Clear and re-add all
                      localStorage.removeItem('schedule_events');
                      await handleAddAllWeeklyClasses();
                    }}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm"
                  >
                    🔄 Reset & Add All 14 Classes
                  </button>
                )}
                <button
                  onClick={() => {
                    resetForm();
                    setShowEventModal(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm"
                >
                  ➕ Add Event
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Weekly View */}
      {viewMode === 'week' && (
        <div className="glass-effect rounded-2xl p-6 shadow-lg border border-gray-200/50">
          {/* Week Navigation */}
          <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
            <button
              onClick={previousWeek}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-semibold"
            >
              ← Previous Week
            </button>
            <div className="flex gap-2">
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-xl transition-colors font-semibold"
              >
                📍 Today
              </button>
              <h2 className="text-xl font-bold text-gray-800 px-4 py-2">
                Week of {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </h2>
            </div>
            <button
              onClick={nextWeek}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-semibold"
            >
              Next Week →
            </button>
          </div>

          {/* Weekly Schedule Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {weekDates.map((date, index) => {
              const dayEvents = getAllEventsForDate(events, date);
              const isToday = date.toDateString() === new Date().toDateString();
              const actualDayName = date.toLocaleDateString('en-US', { weekday: 'long' });
              
              // Debug logging for all days
              console.log(`${actualDayName} (${date.toDateString()}):`, {
                jsDay: date.getDay(),
                eventsFound: dayEvents.length,
                eventTitles: dayEvents.map(e => e.title)
              });

              return (
                <div
                  key={index}
                  className={`border-2 rounded-xl p-4 min-h-[200px] ${
                    isToday ? 'bg-primary-50 border-primary-300' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="text-center mb-3">
                    <div className={`font-bold ${isToday ? 'text-primary-700' : 'text-gray-700'}`}>
                      {actualDayName}
                    </div>
                    <div className={`text-sm ${isToday ? 'text-primary-600' : 'text-gray-500'}`}>
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {dayEvents.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No classes</p>
                    ) : (
                      dayEvents
                        .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
                        .map((event) => (
                          <div
                            key={event.id}
                            className={`p-3 rounded-lg border-2 ${getEventTypeColor(event.type)} cursor-pointer hover:shadow-md transition-shadow`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm truncate" title={event.title}>
                                  {getEventTypeIcon(event.type)} {event.title}
                                </div>
                                {event.startTime && event.endTime && (
                                  <div className="text-xs mt-1">
                                    🕐 {event.startTime} - {event.endTime}
                                  </div>
                                )}
                                {event.location && (
                                  <div className="text-xs mt-1">📍 {event.location}</div>
                                )}
                              </div>
                              {currentUser?.isAdmin && (
                                <button
                                  onClick={() => openEditModal(event)}
                                  className="text-xs px-2 py-1 bg-white/50 hover:bg-white rounded transition-colors"
                                >
                                  ✏️
                                </button>
                              )}
                            </div>
                            {!currentUser?.isAdmin && event.type === 'class' && event.subjectId && (
                              <button
                                onClick={() => handleMarkAbsence(event, date)}
                                className="w-full mt-2 text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors font-semibold"
                              >
                                ❌ Mark Absent
                              </button>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="glass-effect rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">All Events</h2>
          {events.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No events scheduled</p>
          ) : (
            <div className="space-y-3">
              {events
                .filter((e) => e.isRecurring || new Date(e.startDate) >= new Date())
                .map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-xl border-2 ${getEventTypeColor(event.type)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getEventTypeIcon(event.type)}</span>
                          <h3 className="font-bold text-lg">{event.title}</h3>
                          {event.isRecurring && (
                            <span className="text-xs px-2 py-1 bg-white/50 rounded">
                              🔄 Every {event.dayOfWeek}
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm mt-1 opacity-80">{event.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2 text-sm">
                          {!event.isRecurring && (
                            <span>
                              📅 {event.startDate} to {event.endDate}
                            </span>
                          )}
                          {event.startTime && event.endTime && (
                            <span>
                              🕐 {event.startTime} - {event.endTime}
                            </span>
                          )}
                          {event.location && <span>📍 {event.location}</span>}
                        </div>
                      </div>
                      {currentUser?.isAdmin && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(event)}
                            className="px-3 py-1 bg-white/50 hover:bg-white rounded-lg transition-colors text-sm font-semibold"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-semibold"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Attendance Summary (for non-admin users) */}
      {!currentUser?.isAdmin && Object.keys(absenceCounts).length > 0 && (
        <div className="glass-effect rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Your Attendance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(absenceCounts).map(([subjectId, count]) => {
              const subject = allSubjects.find((s: { id: string }) => s.id === subjectId);
              return (
                <div key={subjectId} className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <div className="font-semibold text-gray-800">{subject?.name || 'Unknown Subject'}</div>
                  <div className="text-2xl font-bold text-red-600 mt-2">{count} absences</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Penalty: {(count * 0.5).toFixed(1)} points
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && currentUser?.isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingEvent ? '✏️ Edit Event' : '➕ Add New Event'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Event title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Event description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="class">📚 Class</option>
                  <option value="exam">📝 Exam</option>
                  <option value="event">📅 Event</option>
                  <option value="holiday">🎉 Holiday</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isRecurring" className="text-sm font-semibold text-gray-700">
                  🔄 Recurring Weekly Event
                </label>
              </div>

              {formData.isRecurring && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Day of Week</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value as DayOfWeek })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>
              )}

              {!formData.isRecurring && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Event location"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Link to Subject (Optional)
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">None</option>
                  {allSubjects.map((subject: { id: string; name: string }) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEventModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={editingEvent ? handleUpdateEvent : handleAddEvent}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                {editingEvent ? 'Update Event' : 'Add Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

