import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAcademic } from '../context/AcademicContext';
import type { ScheduleEvent, EventType, AcademicYear, Module } from '../types';
import {
  loadScheduleEvents,
  addScheduleEvent,
  updateScheduleEvent,
  deleteScheduleEvent,
  getEventsForMonth,
} from '../services/scheduleStorage';

export function Schedule() {
  const { currentUser } = useAuth();
  const { years } = useAcademic();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');

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
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const loadedEvents = await loadScheduleEvents();
    setEvents(loadedEvents);
  };

  const handleAddEvent = async () => {
    if (!currentUser || !formData.title || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    const newEvent: ScheduleEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      location: formData.location || undefined,
      subjectId: formData.subjectId || undefined,
      createdBy: currentUser.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await addScheduleEvent(newEvent);
    await loadEvents();
    resetForm();
    setShowEventModal(false);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent || !formData.title || !formData.startDate || !formData.endDate) {
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
    });
    setShowEventModal(true);
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getEventsForDay = (day: number) => {
    const { year, month } = getDaysInMonth(currentDate);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((event) => {
      const eventStart = event.startDate;
      const eventEnd = event.endDate;
      return dateStr >= eventStart && dateStr <= eventEnd;
    });
  };

  const monthEvents = getEventsForMonth(events, currentDate.getFullYear(), currentDate.getMonth());

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-effect rounded-2xl p-6 shadow-lg border border-gray-200/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              📅 Emploi du Temps
            </h1>
            <p className="text-gray-600 mt-1">Schedule, Events & Exams Calendar</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'month' ? 'list' : 'month')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm"
            >
              {viewMode === 'month' ? '📋 List View' : '📅 Calendar View'}
            </button>
            {currentUser?.isAdmin && (
              <button
                onClick={() => {
                  resetForm();
                  setShowEventModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm"
              >
                ➕ Add Event
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'month' && (
        <div className="glass-effect rounded-2xl p-6 shadow-lg border border-gray-200/50">
          {/* Month Navigation */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={previousMonth}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-semibold"
            >
              ← Previous
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={nextMonth}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-semibold"
            >
              Next →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-bold text-gray-700 py-2">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Calendar days */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayEvents = getEventsForDay(day);
              const isToday =
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

              return (
                <div
                  key={day}
                  className={`aspect-square border rounded-xl p-2 ${
                    isToday ? 'bg-primary-50 border-primary-300' : 'bg-white border-gray-200'
                  } hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => setSelectedDate(new Date(year, month, day))}
                >
                  <div className={`text-sm font-semibold ${isToday ? 'text-primary-700' : 'text-gray-700'}`}>
                    {day}
                  </div>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded truncate ${getEventTypeColor(event.type)}`}
                        title={event.title}
                      >
                        {getEventTypeIcon(event.type)} {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
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
          {monthEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No events scheduled for this month</p>
          ) : (
            <div className="space-y-3">
              {monthEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-xl border-2 ${getEventTypeColor(event.type)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getEventTypeIcon(event.type)}</span>
                        <h3 className="font-bold text-lg">{event.title}</h3>
                      </div>
                      {event.description && (
                        <p className="text-sm mt-1 opacity-80">{event.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2 text-sm">
                        <span>📅 {event.startDate} to {event.endDate}</span>
                        {event.startTime && event.endTime && (
                          <span>🕐 {event.startTime} - {event.endTime}</span>
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

      {/* Selected Date Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Events on {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h2>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {getEventsForDay(selectedDate.getDate()).length === 0 ? (
              <p className="text-gray-500 text-center py-8">No events scheduled for this day</p>
            ) : (
              <div className="space-y-3">
                {getEventsForDay(selectedDate.getDate()).map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-xl border-2 ${getEventTypeColor(event.type)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getEventTypeIcon(event.type)}</span>
                          <h3 className="font-bold text-lg">{event.title}</h3>
                        </div>
                        {event.description && (
                          <p className="text-sm mt-1 opacity-80">{event.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2 text-sm">
                          {event.startTime && event.endTime && (
                            <span>🕐 {event.startTime} - {event.endTime}</span>
                          )}
                          {event.location && <span>📍 {event.location}</span>}
                        </div>
                      </div>
                      {currentUser?.isAdmin && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedDate(null);
                              openEditModal(event);
                            }}
                            className="px-3 py-1 bg-white/50 hover:bg-white rounded-lg transition-colors text-sm font-semibold"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteEvent(event.id);
                              setSelectedDate(null);
                            }}
                            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-semibold"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

