import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus, X, Calendar as CalendarIcon, MapPin, Tag, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import useCalendarStore from '@/store/calendarStore';
import useAuthStore from '@/store/authStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

const CATEGORIES = [
  { value: 'shared', label: 'Shared Event', color: '#FF4D88' },
  { value: 'personal', label: 'Personal', color: '#8B5CF6' },
  { value: 'date_night', label: 'Date Night', color: '#FF7DAF' },
  { value: 'movie_night', label: 'Movie Night', color: '#A78BFA' },
  { value: 'restaurant', label: 'Restaurant', color: '#EC4899' },
  { value: 'vacation', label: 'Vacation', color: '#3B82F6' },
  { value: 'travel', label: 'Travel', color: '#10B981' },
  { value: 'anniversary', label: 'Anniversary', color: '#EF4444' },
  { value: 'birthday', label: 'Birthday', color: '#F59E0B' },
  { value: 'bills', label: 'Bills/Finance', color: '#10B981' },
  { value: 'study', label: 'Study/Exam', color: '#6366F1' },
  { value: 'work', label: 'Work/Meeting', color: '#64748B' },
  { value: 'gym', label: 'Gym/Health', color: '#06B6D4' },
];

export default function CalendarPage() {
  const { user } = useAuthStore();
  const { events, fetchEvents, createEvent, updateEvent, deleteEvent, categoryFilter, setCategoryFilter } = useCalendarStore();
  
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('shared');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('medium');
  const [reminderTime, setReminderTime] = useState('none');
  const [repeatType, setRepeatType] = useState('none');
  const [color, setColor] = useState('#FF4D88');
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events based on active category
  const filteredEvents = useMemo(() => {
    let list = events;
    if (categoryFilter !== 'all') {
      list = list.filter(e => e.category === categoryFilter);
    }
    return list.map(e => ({
      id: e._id,
      title: e.title,
      start: e.startDate,
      end: e.endDate,
      allDay: e.allDay,
      backgroundColor: e.color || '#FF4D88',
      borderColor: 'transparent',
      textColor: '#FFFFFF',
      extendedProps: { ...e }
    }));
  }, [events, categoryFilter]);

  // Use a custom useMemo fallback since we can import it or define it simply
  function useMemo(cb, deps) {
    const [state, setState] = useState(cb);
    useEffect(() => {
      setState(cb());
    }, deps);
    return state;
  }

  // Open editor for creating new event
  const handleSelectSlot = (info) => {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setCategory('shared');
    setStartDate(info.startStr.slice(0, 16));
    setEndDate(info.endStr.slice(0, 16));
    setAllDay(info.allDay);
    setLocation('');
    setNotes('');
    setPriority('medium');
    setReminderTime('none');
    setRepeatType('none');
    setColor('#FF4D88');
    setEditorOpen(true);
  };

  // Open editor for editing existing event
  const handleEventClick = (info) => {
    const e = info.event.extendedProps;
    setEditingEvent(e);
    setTitle(e.title || '');
    setDescription(e.description || '');
    setCategory(e.category || 'shared');
    setStartDate(e.startDate ? new Date(e.startDate).toISOString().slice(0, 16) : '');
    setEndDate(e.endDate ? new Date(e.endDate).toISOString().slice(0, 16) : '');
    setAllDay(!!e.allDay);
    setLocation(e.location || '');
    setNotes(e.notes || '');
    setPriority(e.priority || 'medium');
    setReminderTime(e.reminderTime || 'none');
    setRepeatType(e.repeatType || 'none');
    setColor(e.color || '#FF4D88');
    setEditorOpen(true);
  };

  // Handle Drag & Drop / Resize update on backend
  const handleEventChange = async (changeInfo) => {
    const id = changeInfo.event.id;
    const updates = {
      startDate: changeInfo.event.start.toISOString(),
      endDate: changeInfo.event.end ? changeInfo.event.end.toISOString() : changeInfo.event.start.toISOString(),
      allDay: changeInfo.event.allDay,
    };
    try {
      await updateEvent(id, updates);
    } catch (err) {
      console.error('Drag update failed:', err);
      changeInfo.revert();
    }
  };

  // Submit form handler
  const handleSave = async (e) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) return;

    setLoading(true);
    const catObj = CATEGORIES.find(c => c.value === category);
    const eventColor = catObj ? catObj.color : color;

    const payload = {
      title,
      description,
      category,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      allDay,
      location,
      notes,
      priority,
      reminderTime,
      repeatType,
      color: eventColor,
    };

    try {
      if (editingEvent) {
        await updateEvent(editingEvent._id, payload);
      } else {
        await createEvent(payload);
      }
      setEditorOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    if (!confirm('Are you sure you want to delete this event?')) return;
    setLoading(true);
    try {
      await deleteEvent(editingEvent._id);
      setEditorOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 lg:p-8 flex flex-col lg:flex-row gap-6">
      
      {/* SIDEBAR FILTERS */}
      <div className="w-full lg:w-64 flex flex-col gap-4">
        <Card hover={false} className="p-4 border border-[var(--border-color)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-bold text-base text-[var(--text-primary)]">Categories</h3>
            <button onClick={() => fetchEvents()} className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-lg text-[var(--text-secondary)]">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => setCategoryFilter('all')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                categoryFilter === 'all' 
                  ? 'bg-[var(--color-primary-50)] text-[var(--color-primary)] font-bold' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full border border-pink-400 bg-pink-100" />
              All Categories
            </button>

            {CATEGORIES.map((cat) => (
              <button 
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                  categoryFilter === cat.value 
                    ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-bold' 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] opacity-85 hover:opacity-100'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                {cat.label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* CALENDAR BODY */}
      <div className="flex-1 min-w-0">
        <Card hover={false} className="p-4 lg:p-6 border border-[var(--border-color)] calendar-wrapper bg-[var(--bg-secondary)] shadow-soft">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,timeGridAgenda'
            }}
            views={{
              timeGridAgenda: {
                type: 'timeGrid',
                duration: { days: 4 },
                buttonText: 'Agenda'
              }
            }}
            events={filteredEvents}
            selectable={true}
            editable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleSelectSlot}
            eventClick={handleEventClick}
            eventDrop={handleEventChange}
            eventResize={handleEventChange}
            height="auto"
          />
        </Card>
      </div>

      {/* EDITOR DRAWER MODAL */}
      <AnimatePresence>
        {editorOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditorOpen(false)}
              className="fixed inset-0 bg-black z-45"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[var(--bg-secondary)] border-l border-[var(--border-color)] shadow-elevated z-50 p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3 mb-5">
                  <h3 className="font-display font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                    <CalendarIcon className="w-5.5 h-5.5 text-[var(--color-primary)]" />
                    {editingEvent ? 'Edit Event Details' : 'Schedule New Event'}
                  </h3>
                  <button onClick={() => setEditorOpen(false)} className="p-2 hover:bg-[var(--bg-tertiary)] rounded-xl text-[var(--text-secondary)]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  <Input 
                    label="Event Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g. Sweet anniversary night..."
                    required
                    disabled={loading}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Category</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                        disabled={loading}
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Priority</label>
                      <select 
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                        disabled={loading}
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium</option>
                        <option value="high">High Priority ⚡</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      type="datetime-local"
                      label="Start Date & Time"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <Input 
                      type="datetime-local"
                      label="End Date & Time"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    <input 
                      type="checkbox" 
                      id="allDayCheckbox"
                      checked={allDay}
                      onChange={(e) => setAllDay(e.target.checked)}
                      className="w-4.5 h-4.5 accent-[var(--color-primary)] rounded cursor-pointer"
                      disabled={loading}
                    />
                    <label htmlFor="allDayCheckbox" className="text-sm font-semibold text-[var(--text-secondary)] cursor-pointer select-none">
                      All day event
                    </label>
                  </div>

                  <Input 
                    label="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="E.g. Eiffel Tower, Paris"
                    disabled={loading}
                  />

                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Description</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Write brief event summaries..."
                      className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] h-20 resize-none font-medium"
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Reminder Offsets</label>
                      <select 
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                        disabled={loading}
                      >
                        <option value="none">No reminder</option>
                        <option value="5_min">5 minutes before</option>
                        <option value="10_min">10 minutes before</option>
                        <option value="30_min">30 minutes before</option>
                        <option value="1_hour">1 hour before</option>
                        <option value="1_day">1 day before</option>
                        <option value="1_week">1 week before</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Recurrence Repeat</label>
                      <select 
                        value={repeatType}
                        onChange={(e) => setRepeatType(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                        disabled={loading}
                      >
                        <option value="none">Does not repeat</option>
                        <option value="daily">Repeats Daily</option>
                        <option value="weekly">Repeats Weekly</option>
                        <option value="monthly">Repeats Monthly</option>
                        <option value="yearly">Repeats Yearly</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>

              <div className="flex gap-3 border-t border-[var(--border-color)] pt-5 mt-5">
                <Button 
                  onClick={handleSave}
                  loading={loading}
                  className="flex-1"
                >
                  Save Event
                </Button>
                {editingEvent && (
                  <Button 
                    onClick={handleDelete}
                    loading={loading}
                    variant="secondary"
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15"
                  >
                    Delete
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
