import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Check, ClipboardList, ShoppingCart, 
  Heart, Compass, Film, Utensils, Sun, Calendar, BarChart2, 
  Star, Clock, MapPin, Moon, Coffee
} from 'lucide-react';

import useAuthStore from '@/store/authStore';
import useTodoStore from '@/store/todoStore';
import usePlannerStore from '@/store/plannerStore';
import useCalendarStore from '@/store/calendarStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

// Emojis for Daily Mood
const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😍', label: 'Loved' },
  { emoji: '🥱', label: 'Tired' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '🤢', label: 'Sick' }
];

export default function PlannerPage() {
  const { user } = useAuthStore();
  
  // Zustand States
  const { tasks, fetchTasks, createTask, updateTask, deleteTask } = useTodoStore();
  const { shoppingItems, fetchShoppingItems, createShoppingItem, updateShoppingItem, deleteShoppingItem } = useTodoStore();
  const { travelPlans, fetchTravelPlans, createTravelPlan, updateTravelPlan, deleteTravelPlan } = usePlannerStore();
  const { moviePlans, fetchMoviePlans, createMoviePlan, updateMoviePlan, deleteMoviePlan } = usePlannerStore();
  const { restaurantPlans, fetchRestaurantPlans, createRestaurantPlan, updateRestaurantPlan, deleteRestaurantPlan } = usePlannerStore();
  const { events, fetchEvents, createEvent, deleteEvent } = useCalendarStore();

  const [activeTab, setActiveTab] = useState('tasks');
  const [partnerName, setPartnerName] = useState('Partner');

  // Load resources
  useEffect(() => {
    fetchTasks();
    fetchShoppingItems();
    fetchTravelPlans();
    fetchMoviePlans();
    fetchRestaurantPlans();
    fetchEvents();

    // Deduce partner name
    const partnerId = user?.partnerId;
    if (partnerId) {
      setPartnerName('Partner');
    }
  }, []);

  const tabs = [
    { id: 'tasks', label: 'Shared Tasks', icon: ClipboardList },
    { id: 'shopping', label: 'Shopping List', icon: ShoppingCart },
    { id: 'date', label: 'Date Planner', icon: Heart },
    { id: 'travel', label: 'Travel Planner', icon: Compass },
    { id: 'movies', label: 'Movie Planner', icon: Film },
    { id: 'restaurants', label: 'Restaurant Planner', icon: Utensils },
    { id: 'daily', label: 'Daily Planner', icon: Sun },
    { id: 'weekly', label: 'Weekly Planner', icon: Calendar },
    { id: 'monthly', label: 'Monthly Statistics', icon: BarChart2 }
  ];

  return (
    <div className="min-h-[calc(100vh-100px)] lg:min-h-[calc(100vh-88px)] bg-[var(--bg-primary)] flex flex-col lg:flex-row rounded-3xl overflow-hidden border border-[var(--border-color)] shadow-soft">
      
      {/* SIDEBAR TABS - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-color)] p-4 flex-shrink-0">
        <div className="mb-6 px-2">
          <h2 className="font-display font-black text-lg gradient-text">Planner Hub</h2>
          <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider mt-0.5">Notion & Notion Calendar style</p>
        </div>
        <nav className="flex-1 flex flex-col gap-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-[var(--color-primary-50)] text-[var(--color-primary)] font-extrabold shadow-sm' 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* MOBILE DROPDOWN SELECTION */}
      <div className="lg:hidden p-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between">
        <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Select View:</label>
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm font-semibold focus:outline-none"
        >
          {tabs.map(tab => (
            <option key={tab.id} value={tab.id}>{tab.label}</option>
          ))}
        </select>
      </div>

      {/* ACTIVE PLANNER WORKSPACE */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[var(--bg-secondary)] min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'tasks' && <TasksWorkspace tasks={tasks} createTask={createTask} updateTask={updateTask} deleteTask={deleteTask} partnerName={partnerName} />}
            {activeTab === 'shopping' && <ShoppingWorkspace items={shoppingItems} createItem={createShoppingItem} updateItem={updateShoppingItem} deleteItem={deleteShoppingItem} />}
            {activeTab === 'date' && <DateWorkspace events={events} createEvent={createEvent} deleteEvent={deleteEvent} />}
            {activeTab === 'travel' && <TravelWorkspace plans={travelPlans} createPlan={createTravelPlan} updatePlan={updateTravelPlan} deletePlan={deleteTravelPlan} />}
            {activeTab === 'movies' && <MovieWorkspace movies={moviePlans} createMovie={createMoviePlan} updateMovie={updateMoviePlan} deleteMovie={deleteMoviePlan} />}
            {activeTab === 'restaurants' && <RestaurantWorkspace restaurants={restaurantPlans} createRestaurant={createRestaurantPlan} updateRestaurant={updateRestaurantPlan} deleteRestaurant={deleteRestaurantPlan} />}
            {activeTab === 'daily' && <DailyPlannerWorkspace />}
            {activeTab === 'weekly' && <WeeklyPlannerWorkspace tasks={tasks} events={events} />}
            {activeTab === 'monthly' && <MonthlyPlannerWorkspace tasks={tasks} shopping={shoppingItems} travel={travelPlans} movies={moviePlans} restaurants={restaurantPlans} />}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}

/* ===================================================================
   1. SHARED TASKS WORKSPACE
   =================================================================== */
function TasksWorkspace({ tasks, createTask, updateTask, deleteTask, partnerName }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [listName, setListName] = useState('Personal');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('me');
  
  // Checklist input
  const [checkText, setCheckText] = useState('');
  const [checklist, setChecklist] = useState([]);

  const [activeListFilter, setActiveListFilter] = useState('Personal');

  const addChecklistItem = () => {
    if (!checkText.trim()) return;
    setChecklist([...checklist, { text: checkText.trim(), completed: false }]);
    setCheckText('');
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      description: desc.trim(),
      priority,
      listName,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      checklist,
      assignedTo: assignedTo === 'me' ? null : undefined, // simple toggle
    };

    await createTask(payload);
    setTitle('');
    setDesc('');
    setChecklist([]);
    setDueDate('');
  };

  const toggleCheckItem = async (task, itemIndex) => {
    const updatedChecklist = [...task.checklist];
    updatedChecklist[itemIndex].completed = !updatedChecklist[itemIndex].completed;
    
    // Check if task is completed
    const allDone = updatedChecklist.every(item => item.completed);

    await updateTask(task._id, { 
      checklist: updatedChecklist,
      completed: allDone
    });
  };

  const toggleTaskCompletion = async (task) => {
    const isCompleted = !task.completed;
    // Set all checklist items to matches
    const updatedChecklist = task.checklist.map(item => ({ ...item, completed: isCompleted }));
    await updateTask(task._id, { 
      completed: isCompleted,
      checklist: updatedChecklist
    });
  };

  const filteredTasks = tasks.filter(t => t.listName === activeListFilter);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
      <div className="xl:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Shared Todos</h2>
          
          <div className="flex bg-[var(--bg-tertiary)] border border-[var(--border-color)] p-1 rounded-xl gap-1">
            {['Personal', 'Shared', 'Work'].map((l) => (
              <button 
                key={l}
                onClick={() => setActiveListFilter(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeListFilter === l ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="h-64 rounded-2xl bg-[var(--bg-tertiary)] border border-dashed border-[var(--border-color)] flex flex-col items-center justify-center p-6 text-center opacity-75">
            <span className="text-3xl mb-2">🎉</span>
            <p className="text-sm font-semibold text-[var(--text-secondary)]">All caught up!</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Create a task in this list to share with your partner.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <Card key={task._id} className="p-4 border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button 
                      onClick={() => toggleTaskCompletion(task)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors ${
                        task.completed 
                          ? 'bg-[var(--color-primary)] border-transparent text-white' 
                          : 'border-[var(--border-color)] hover:border-[var(--color-primary)]'
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-bold text-[var(--text-primary)] truncate ${task.completed ? 'line-through opacity-50' : ''}`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{task.description}</p>
                      )}
                      
                      {/* Checklist items */}
                      {task.checklist && task.checklist.length > 0 && (
                        <div className="mt-3 p-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)]/50 rounded-xl space-y-2 max-w-md">
                          {task.checklist.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
                              <button 
                                onClick={() => toggleCheckItem(task, idx)}
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                  item.completed ? 'bg-emerald-500 border-transparent text-white' : 'border-[var(--border-color)]'
                                }`}
                              >
                                {item.completed && <Check className="w-3 h-3 stroke-[3px]" />}
                              </button>
                              <span className={item.completed ? 'line-through opacity-60' : ''}>{item.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Badges footer */}
                      <div className="flex flex-wrap gap-2 mt-3 items-center text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">
                        {task.priority && (
                          <span className={`px-2 py-0.5 rounded ${
                            task.priority === 'high' ? 'bg-red-50 text-red-500 dark:bg-red-950/20' : 
                            task.priority === 'medium' ? 'bg-amber-50 text-amber-500 dark:bg-amber-950/20' : 'bg-slate-50 text-slate-500 dark:bg-slate-900'
                          }`}>
                            {task.priority} priority
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="flex items-center gap-1.5 bg-[var(--bg-tertiary)] px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3" /> Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => deleteTask(task._id)}
                    className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CREATE TASK PANEL */}
      <Card hover={false} className="p-4 lg:p-6 border border-[var(--border-color)] h-fit">
        <h3 className="font-display font-bold text-base text-[var(--text-primary)] mb-4">Create task</h3>
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input 
            label="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            required
          />

          <Input 
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Priority</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Workspace</label>
              <select 
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              >
                <option value="Personal">Personal</option>
                <option value="Shared">Shared</option>
                <option value="Work">Work</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Assignee</label>
            <select 
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm focus:outline-none"
            >
              <option value="me">Assign to me</option>
              <option value="partner">Assign to partner</option>
            </select>
          </div>

          {/* Checklist creation */}
          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Checklist Items</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={checkText}
                onChange={(e) => setCheckText(e.target.value)}
                placeholder="E.g. Pack tickets..."
                className="flex-1 px-3 py-2 border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm rounded-xl focus:outline-none"
              />
              <Button type="button" size="sm" onClick={addChecklistItem}>Add</Button>
            </div>

            {checklist.length > 0 && (
              <div className="p-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl space-y-1 text-xs">
                {checklist.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center font-semibold text-[var(--text-secondary)]">
                    <span>• {item.text}</span>
                    <button type="button" onClick={() => setChecklist(checklist.filter((_, i) => i !== idx))} className="text-red-500 font-bold p-1">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">Create Task</Button>
        </form>
      </Card>
    </div>
  );
}

/* ===================================================================
   2. SHOPPING LIST WORKSPACE
   =================================================================== */
function ShoppingWorkspace({ items, createItem, updateItem, deleteItem }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);

  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createItem({
      name: name.trim(),
      category,
      quantity: Number(quantity) || 1,
      price: Number(price) || 0,
    });
    setName('');
    setQuantity(1);
    setPrice(0);
  };

  const togglePurchased = async (item) => {
    await updateItem(item._id, { purchased: !item.purchased });
  };

  const categories = useMemo(() => {
    const set = new Set(items.map(item => item.category));
    return ['all', ...Array.from(set)];
  }, [items]);

  const filteredItems = activeCategoryFilter === 'all' 
    ? items 
    : items.filter(i => i.category === activeCategoryFilter);

  // Calculations for total budget sums
  const totalCost = useMemo(() => {
    return items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  }, [items]);

  const purchasedCost = useMemo(() => {
    return items.filter(i => i.purchased).reduce((acc, i) => acc + (i.price * i.quantity), 0);
  }, [items]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
      <div className="xl:col-span-2 space-y-6">
        
        {/* Cost stats bar */}
        <div className="p-4 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-2xl flex justify-between items-center">
          <div>
            <div className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider">Total Est. Cost</div>
            <div className="text-xl font-black text-[var(--text-primary)]">${totalCost.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider">Purchased Sum</div>
            <div className="text-xl font-black text-emerald-500">${purchasedCost.toFixed(2)}</div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Shopping List</h2>
          <select 
            value={activeCategoryFilter}
            onChange={(e) => setActiveCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-xs font-bold focus:outline-none"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>

        {filteredItems.length === 0 ? (
          <div className="h-64 rounded-2xl bg-[var(--bg-tertiary)] border border-dashed border-[var(--border-color)] flex flex-col items-center justify-center p-6 text-center opacity-75">
            <span className="text-3xl mb-2">🛒</span>
            <p className="text-sm font-semibold text-[var(--text-secondary)]">Shopping cart is empty</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Add items your relationship needs in the form on the right.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div 
                key={item._id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  item.purchased 
                    ? 'bg-[var(--bg-tertiary)]/70 border-[var(--border-color)]/60 opacity-60' 
                    : 'bg-[var(--bg-secondary)] border-[var(--border-color)] shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => togglePurchased(item)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      item.purchased 
                        ? 'bg-emerald-500 border-transparent text-white' 
                        : 'border-[var(--border-color)] hover:border-emerald-500'
                    }`}
                  >
                    {item.purchased && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                  </button>
                  <div>
                    <p className={`text-sm font-bold text-[var(--text-primary)] ${item.purchased ? 'line-through opacity-70' : ''}`}>{item.name}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)] font-semibold mt-0.5">{item.category} • Qty {item.quantity}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-black text-[var(--text-primary)]">${(item.price * item.quantity).toFixed(2)}</span>
                  <button 
                    onClick={() => deleteItem(item._id)}
                    className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD ITEM CARD */}
      <Card hover={false} className="p-4 lg:p-6 border border-[var(--border-color)] h-fit">
        <h3 className="font-display font-bold text-base text-[var(--text-primary)] mb-4">Add Item</h3>
        <form onSubmit={handleAddItem} className="space-y-4">
          <Input 
            label="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="E.g. Organic Strawberries"
            required
          />

          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm focus:outline-none"
            >
              <option value="Groceries">Groceries 🥦</option>
              <option value="Electronics">Electronics 🔌</option>
              <option value="Clothing">Clothing 👕</option>
              <option value="Household">Household 🏠</option>
              <option value="Pharmacy">Pharmacy 💊</option>
              <option value="Snacks">Snacks 🍫</option>
              <option value="Special">Special Gift 🎁</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              type="number"
              label="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
              required
            />
            <Input 
              type="number"
              step="0.01"
              label="Price (Est.)"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min="0"
              required
            />
          </div>

          <Button type="submit" className="w-full">Add to Cart</Button>
        </form>
      </Card>
    </div>
  );
}

/* ===================================================================
   3. DATE PLANNER WORKSPACE
   =================================================================== */
function DateWorkspace({ events, createEvent, deleteEvent }) {
  const [type, setType] = useState('Dinner');
  const [place, setPlace] = useState('');
  const [budget, setBudget] = useState(0);
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  
  const [taskText, setTaskText] = useState('');
  const [checklist, setChecklist] = useState([]);

  const addChecklistItem = () => {
    if (!taskText.trim()) return;
    setChecklist([...checklist, { text: taskText.trim(), completed: false }]);
    setTaskText('');
  };

  const handlePlanDate = async (e) => {
    e.preventDefault();
    if (!place || !time) return;

    // Create Calendar Event with category: 'date_night'
    const payload = {
      title: `💕 Date: ${type} at ${place}`,
      description: notes,
      category: 'date_night',
      startDate: new Date(time).toISOString(),
      // Auto set end date 3 hours later
      endDate: new Date(new Date(time).getTime() + 3 * 60 * 60 * 1000).toISOString(),
      location: place,
      notes: notes,
      budget,
      checklist,
      color: '#FF7DAF', // soft date night pink
    };

    await createEvent(payload);
    setPlace('');
    setTime('');
    setNotes('');
    setChecklist([]);
  };

  const dateEvents = events.filter(e => e.category === 'date_night');

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
      <div className="xl:col-span-2 space-y-6">
        <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Date Planner</h2>
        
        {dateEvents.length === 0 ? (
          <div className="h-64 rounded-2xl bg-[var(--bg-tertiary)] border border-dashed border-[var(--border-color)] flex flex-col items-center justify-center p-6 text-center opacity-75">
            <span className="text-3xl mb-2">🥂</span>
            <p className="text-sm font-semibold text-[var(--text-secondary)]">No dates planned yet</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Use the constructor on the right to plan your next anniversary night!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dateEvents.map((date) => (
              <Card key={date._id} className="p-5 border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col justify-between hover:shadow-soft">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-2xl">🥂</span>
                    <button onClick={() => deleteEvent(date._id)} className="p-1 hover:bg-[var(--bg-tertiary)] rounded text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-display font-bold text-base text-[var(--text-primary)] mb-1 leading-snug">{date.title}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider mb-3">
                    <Clock className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    {new Date(date.startDate).toLocaleDateString()} at {new Date(date.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {date.budget > 0 && (
                    <div className="text-xs font-semibold text-emerald-500 mb-2">Budget: ${date.budget}</div>
                  )}

                  {date.description && (
                    <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-tertiary)] p-2.5 rounded-xl border border-[var(--border-color)]/30 mb-3">{date.description}</p>
                  )}

                  {date.checklist && date.checklist.length > 0 && (
                    <div className="space-y-1 text-xs font-medium text-[var(--text-secondary)] border-t border-[var(--border-color)] pt-3 mt-3">
                      <div className="font-bold text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Checklist</div>
                      {date.checklist.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${item.completed ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <span className={item.completed ? 'line-through opacity-60' : ''}>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/*构造 Date planner */}
      <Card hover={false} className="p-4 lg:p-6 border border-[var(--border-color)] h-fit">
        <h3 className="font-display font-bold text-base text-[var(--text-primary)] mb-4">Plan Date Night</h3>
        <form onSubmit={handlePlanDate} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Date Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm focus:outline-none"
            >
              <option value="Dinner">Dinner 🍕</option>
              <option value="Café">Café ☕</option>
              <option value="Movies">Movies 🍿</option>
              <option value="Park">Park 🌳</option>
              <option value="Beach">Beach 🏖️</option>
              <option value="Shopping">Shopping 🛍️</option>
              <option value="Road Trip">Road Trip 🚗</option>
            </select>
          </div>

          <Input 
            label="Place / Venue"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="Restaurant name or location..."
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
              type="datetime-local"
              label="Date & Time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
            <Input 
              type="number"
              label="Budget ($)"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              min="0"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Date Notes</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What to wear, surprise ideas, reservations..."
              className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm h-20 resize-none font-medium focus:outline-none"
            />
          </div>

          {/* Checklist */}
          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Checklist</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                placeholder="E.g. Buy flowers, book table..."
                className="flex-1 px-3 py-2 border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm rounded-xl focus:outline-none"
              />
              <Button type="button" size="sm" onClick={addChecklistItem}>Add</Button>
            </div>
            
            {checklist.length > 0 && (
              <div className="p-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl space-y-1 text-xs">
                {checklist.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center font-semibold text-[var(--text-secondary)]">
                    <span>• {item.text}</span>
                    <button type="button" onClick={() => setChecklist(checklist.filter((_, i) => i !== idx))} className="text-red-500 font-bold p-1">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">Create Date Plan</Button>
        </form>
      </Card>
    </div>
  );
}

/* ===================================================================
   4. TRAVEL PLANNER WORKSPACE
   =================================================================== */
function TravelWorkspace({ plans, createPlan, updatePlan, deletePlan }) {
  const [destination, setDestination] = useState('');
  const [hotel, setHotel] = useState('');
  const [budget, setBudget] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [activePlanId, setActivePlanId] = useState(null);

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!destination) return;

    await createPlan({
      destination,
      hotel,
      budget,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
    });

    setDestination('');
    setHotel('');
    setBudget(0);
    setStartDate('');
    setEndDate('');
  };

  const activePlan = plans.find(p => p._id === activePlanId);

  // Travel Checklist helpers
  const handleToggleChecklist = async (plan, idx) => {
    const checklist = [...plan.checklist];
    checklist[idx].completed = !checklist[idx].completed;
    await updatePlan(plan._id, { checklist });
  };

  const [newCheckText, setNewCheckText] = useState('');
  const handleAddCheckItem = async (plan) => {
    if (!newCheckText.trim()) return;
    const checklist = [...plan.checklist, { text: newCheckText.trim(), completed: false }];
    await updatePlan(plan._id, { checklist });
    setNewCheckText('');
  };

  // Timeline helpers
  const [timelineTime, setTimelineTime] = useState('');
  const [timelineAct, setTimelineAct] = useState('');
  const handleAddTimeline = async (plan) => {
    if (!timelineAct.trim()) return;
    const timeline = [...plan.timeline, { time: timelineTime.trim(), activity: timelineAct.trim() }];
    await updatePlan(plan._id, { timeline });
    setTimelineTime('');
    setTimelineAct('');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
      <div className="xl:col-span-2 space-y-6">
        <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Travel Planner</h2>

        {/* Selected Plan Detail View */}
        {activePlan ? (
          <Card hover={false} className="p-6 border border-[var(--border-color)] space-y-6 bg-[var(--bg-secondary)] shadow-medium relative">
            <button 
              onClick={() => setActivePlanId(null)}
              className="absolute top-4 right-4 p-2 hover:bg-[var(--bg-tertiary)] rounded-xl text-[var(--text-secondary)] font-bold text-xs"
            >
              Back to Trips
            </button>

            <div>
              <h3 className="font-display font-black text-2xl text-[var(--text-primary)]">✈️ {activePlan.destination}</h3>
              <p className="text-xs text-[var(--text-secondary)] font-semibold mt-1">
                Hotel: {activePlan.hotel || 'None'} • Budget: ${activePlan.budget}
              </p>
              {activePlan.startDate && (
                <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider mt-1">
                  📅 {new Date(activePlan.startDate).toLocaleDateString()} — {new Date(activePlan.endDate).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Travel checklists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Packing checklist */}
              <div className="space-y-3">
                <h4 className="font-display font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 flex items-center gap-1.5">🧳 Packing & Checklist</h4>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCheckText}
                    onChange={(e) => setNewCheckText(e.target.value)}
                    placeholder="Add item..."
                    className="flex-1 px-3 py-1.5 border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-xs rounded-xl focus:outline-none"
                  />
                  <Button size="sm" onClick={() => handleAddCheckItem(activePlan)}>Add</Button>
                </div>
                
                <div className="space-y-1.5">
                  {activePlan.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
                      <button 
                        onClick={() => handleToggleChecklist(activePlan, idx)}
                        className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                          item.completed ? 'bg-emerald-500 border-transparent text-white' : 'border-[var(--border-color)]'
                        }`}
                      >
                        {item.completed && <Check className="w-3 h-3 stroke-[3px]" />}
                      </button>
                      <span className={item.completed ? 'line-through opacity-60' : ''}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline step constructor */}
              <div className="space-y-3">
                <h4 className="font-display font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 flex items-center gap-1.5">⏰ Travel Timeline</h4>
                <div className="space-y-2">
                  <div className="flex gap-1.5">
                    <input 
                      type="text" 
                      placeholder="Time (e.g. 10:00 AM)" 
                      value={timelineTime}
                      onChange={(e) => setTimelineTime(e.target.value)}
                      className="w-1/3 px-3 py-1.5 border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-xs rounded-xl focus:outline-none"
                    />
                    <input 
                      type="text" 
                      placeholder="Activity (e.g. Flight 221)" 
                      value={timelineAct}
                      onChange={(e) => setTimelineAct(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-xs rounded-xl focus:outline-none"
                    />
                  </div>
                  <Button size="sm" className="w-full" onClick={() => handleAddTimeline(activePlan)}>Add Activity</Button>
                </div>

                <div className="space-y-2 border-l-2 border-[var(--border-color)] pl-3 ml-1 text-xs">
                  {activePlan.timeline.map((act, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute left-[-16px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] border-2 border-[var(--bg-secondary)]" />
                      <span className="font-bold text-[10px] text-[var(--text-tertiary)]">{act.time}</span>
                      <p className="font-semibold text-[var(--text-secondary)]">{act.activity}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </Card>
        ) : plans.length === 0 ? (
          <div className="h-64 rounded-2xl bg-[var(--bg-tertiary)] border border-dashed border-[var(--border-color)] flex flex-col items-center justify-center p-6 text-center opacity-75">
            <span className="text-3xl mb-2">🏖️</span>
            <p className="text-sm font-semibold text-[var(--text-secondary)]">No vacations planned yet</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Start crafting your packing lists and destinations using the form.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((p) => (
              <Card key={p._id} className="p-5 border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:shadow-soft flex flex-col justify-between min-h-[160px]">
                <div>
                  <h4 className="font-display font-bold text-base text-[var(--text-primary)]">✈️ {p.destination}</h4>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">Hotel: {p.hotel || 'Not set'}</p>
                  {p.startDate && (
                    <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase mt-2">
                      📅 {new Date(p.startDate).toLocaleDateString()} — {new Date(p.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-[var(--border-color)]/50">
                  <Button size="sm" className="flex-1" onClick={() => setActivePlanId(p._id)}>Manage Trip</Button>
                  <button onClick={() => deletePlan(p._id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-lg text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CREATE TRAVEL PLAN FORM */}
      <Card hover={false} className="p-4 lg:p-6 border border-[var(--border-color)] h-fit">
        <h3 className="font-display font-bold text-base text-[var(--text-primary)] mb-4">New Travel Plan</h3>
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <Input 
            label="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="E.g. Maui, Hawaii"
            required
          />
          <Input 
            label="Hotel Reservation"
            value={hotel}
            onChange={(e) => setHotel(e.target.value)}
            placeholder="E.g. Grand Wailea Resort"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input 
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <Input 
            type="number"
            label="Est. Budget ($)"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            min="0"
          />

          <Button type="submit" className="w-full">Create Plan</Button>
        </form>
      </Card>
    </div>
  );
}

/* ===================================================================
   5. MOVIE PLANNER WORKSPACE
   =================================================================== */
function MovieWorkspace({ movies, createMovie, updateMovie, deleteMovie }) {
  const [movieName, setMovieName] = useState('');
  const [platform, setPlatform] = useState('');
  const [date, setDate] = useState('');
  const [watched, setWatched] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const [activeFilter, setActiveFilter] = useState('wishlist'); // wishlist, watched

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    if (!movieName) return;

    await createMovie({
      movieName,
      streamingPlatform: platform,
      date: date ? new Date(date).toISOString() : null,
      watched,
      rating,
      review,
      wishlist: !watched,
    });

    setMovieName('');
    setPlatform('');
    setDate('');
    setWatched(false);
    setRating(0);
    setReview('');
  };

  const handleMarkWatched = async (movie, stars, textReview) => {
    await updateMovie(movie._id, {
      watched: true,
      wishlist: false,
      rating: stars,
      review: textReview || movie.review,
    });
  };

  const filteredMovies = movies.filter(m => activeFilter === 'watched' ? m.watched : !m.watched);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
      <div className="xl:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Movie Watchlist</h2>
          
          <div className="flex bg-[var(--bg-tertiary)] border border-[var(--border-color)] p-1 rounded-xl gap-1">
            <button 
              onClick={() => setActiveFilter('wishlist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'wishlist' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              To Watch 🍿
            </button>
            <button 
              onClick={() => setActiveFilter('watched')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'watched' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Watched Logs 🎬
            </button>
          </div>
        </div>

        {filteredMovies.length === 0 ? (
          <div className="h-64 rounded-2xl bg-[var(--bg-tertiary)] border border-dashed border-[var(--border-color)] flex flex-col items-center justify-center p-6 text-center opacity-75">
            <span className="text-3xl mb-2">🍿</span>
            <p className="text-sm font-semibold text-[var(--text-secondary)]">No movies here</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Use the scheduler to log your upcoming streaming nights.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMovies.map((movie) => (
              <Card key={movie._id} className="p-4 border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col justify-between hover:shadow-soft">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-display font-bold text-base text-[var(--text-primary)] leading-tight">{movie.movieName}</h4>
                    <button onClick={() => deleteMovie(movie._id)} className="p-1 text-red-500 hover:bg-[var(--bg-tertiary)] rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] font-semibold mb-1">Platform: {movie.streamingPlatform || 'Cinema'}</p>
                  
                  {movie.watched ? (
                    <div className="space-y-2 mt-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4.5 h-4.5 ${i < movie.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        ))}
                      </div>
                      {movie.review && (
                        <p className="text-xs italic text-[var(--text-secondary)] bg-[var(--bg-tertiary)] p-2.5 rounded-lg border border-[var(--border-color)]/30 mt-1">"{movie.review}"</p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-[var(--border-color)]/50">
                      {/* Simple rating click-to-finish log */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Log Watched:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((stars) => (
                            <button 
                              key={stars} 
                              onClick={() => handleMarkWatched(movie, stars, 'We loved it!')}
                              className="hover:scale-125 transition-transform"
                              title={`Rate ${stars} stars`}
                            >
                              <Star className="w-4 h-4 text-amber-400 fill-current hover:opacity-100 opacity-60" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CREATE MOVIE FORM */}
      <Card hover={false} className="p-4 lg:p-6 border border-[var(--border-color)] h-fit">
        <h3 className="font-display font-bold text-base text-[var(--text-primary)] mb-4">Add Movie</h3>
        <form onSubmit={handleCreateMovie} className="space-y-4">
          <Input 
            label="Movie Name"
            value={movieName}
            onChange={(e) => setMovieName(e.target.value)}
            placeholder="E.g. Inception"
            required
          />
          <Input 
            label="Streaming Platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="E.g. Netflix, Disney+, Cinema"
          />
          <Input 
            type="date"
            label="Watch Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div className="flex items-center gap-2 py-1">
            <input 
              type="checkbox" 
              id="movieWatched"
              checked={watched}
              onChange={(e) => setWatched(e.target.checked)}
              className="w-4.5 h-4.5 accent-[var(--color-primary)] rounded cursor-pointer"
            />
            <label htmlFor="movieWatched" className="text-sm font-semibold text-[var(--text-secondary)] cursor-pointer select-none">
              Already Watched
            </label>
          </div>

          {watched && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Rating (1-5)</label>
                <select 
                  value={rating} 
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-sm focus:outline-none"
                >
                  <option value="1">⭐</option>
                  <option value="2">⭐⭐</option>
                  <option value="3">⭐⭐⭐</option>
                  <option value="4">⭐⭐⭐⭐</option>
                  <option value="5">⭐⭐⭐⭐⭐</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Review</label>
                <textarea 
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Review the movie..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-sm h-16 resize-none focus:outline-none"
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full">Create Entry</Button>
        </form>
      </Card>
    </div>
  );
}

/* ===================================================================
   6. RESTAURANT PLANNER WORKSPACE
   =================================================================== */
function RestaurantWorkspace({ restaurants, createRestaurant, updateRestaurant, deleteRestaurant }) {
  const [restaurantName, setRestaurantName] = useState('');
  const [location, setLocation] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [budget, setBudget] = useState('$$');
  const [rating, setRating] = useState(0);
  const [reservation, setReservation] = useState('');
  const [notes, setNotes] = useState('');

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    if (!restaurantName) return;

    await createRestaurant({
      restaurantName,
      location,
      cuisine,
      budget,
      rating,
      reservation: reservation ? new Date(reservation).toISOString() : null,
      notes,
    });

    setRestaurantName('');
    setLocation('');
    setCuisine('');
    setBudget('$$');
    setRating(0);
    setReservation('');
    setNotes('');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
      <div className="xl:col-span-2 space-y-6">
        <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Restaurant Logs</h2>

        {restaurants.length === 0 ? (
          <div className="h-64 rounded-2xl bg-[var(--bg-tertiary)] border border-dashed border-[var(--border-color)] flex flex-col items-center justify-center p-6 text-center opacity-75">
            <span className="text-3xl mb-2">🍕</span>
            <p className="text-sm font-semibold text-[var(--text-secondary)]">No restaurants logged</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Pin reservation schedules or review your past dinner places.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurants.map((res) => (
              <Card key={res._id} className="p-5 border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col justify-between hover:shadow-soft">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-display font-bold text-base text-[var(--text-primary)]">{res.restaurantName}</h4>
                    <button onClick={() => deleteRestaurant(res._id)} className="p-1 text-red-500 hover:bg-[var(--bg-tertiary)] rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] font-semibold">Cuisine: {res.cuisine || 'Cuisine'}</p>
                  
                  {res.location && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-[var(--text-tertiary)] font-bold">
                      <MapPin className="w-3.5 h-3.5 text-red-400" /> {res.location}
                    </div>
                  )}

                  {res.reservation && (
                    <div className="mt-3 p-2 bg-[var(--color-primary-50)] border border-[var(--color-primary-100)] rounded-xl text-xs text-[var(--color-primary)] font-bold flex items-center gap-2">
                      <Clock className="w-4 h-4 animate-spin" />
                      Res: {new Date(res.reservation).toLocaleString()}
                    </div>
                  )}

                  {res.notes && (
                    <p className="text-xs text-[var(--text-secondary)] italic bg-[var(--bg-tertiary)] p-2.5 border border-[var(--border-color)]/30 rounded-xl mt-3">"{res.notes}"</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CREATE RESTAURANT FORM */}
      <Card hover={false} className="p-4 lg:p-6 border border-[var(--border-color)] h-fit">
        <h3 className="font-display font-bold text-base text-[var(--text-primary)] mb-4">Log Restaurant</h3>
        <form onSubmit={handleCreateRestaurant} className="space-y-4">
          <Input 
            label="Restaurant Name"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder="E.g. Nobu Restaurant"
            required
          />
          <Input 
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="E.g. Malibu, CA"
          />
          <Input 
            label="Cuisine"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            placeholder="E.g. Japanese Sushi"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Pricing tier</label>
              <select 
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-sm focus:outline-none"
              >
                <option value="$">$ (Cheap)</option>
                <option value="$$">$$ (Average)</option>
                <option value="$$$">$$$ (Fancy)</option>
                <option value="$$$$">$$$$ (Luxury)</option>
              </select>
            </div>
            <Input 
              type="datetime-local"
              label="Reservation Date"
              value={reservation}
              onChange={(e) => setReservation(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">Notes</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Fav dishes, dress code, surprise details..."
              className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-sm h-16 resize-none focus:outline-none"
            />
          </div>

          <Button type="submit" className="w-full">Save Entry</Button>
        </form>
      </Card>
    </div>
  );
}

/* ===================================================================
   7. DAILY PLANNER WORKSPACE
   =================================================================== */
function DailyPlannerWorkspace() {
  const [mood, setMood] = useState('😊');
  const [morning, setMorning] = useState('');
  const [afternoon, setAfternoon] = useState('');
  const [evening, setEvening] = useState('');
  const [night, setNight] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Daily Planner</h2>
        
        {/* Mood logger */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Today's Mood:</span>
          <div className="flex gap-1 bg-[var(--bg-tertiary)] p-1 rounded-xl border border-[var(--border-color)]">
            {MOODS.map(m => (
              <button 
                key={m.emoji}
                onClick={() => setMood(m.emoji)}
                className={`p-1.5 rounded-lg text-lg transition-transform hover:scale-125 ${mood === m.emoji ? 'bg-[var(--bg-secondary)] scale-110 shadow-sm' : 'opacity-60'}`}
                title={m.label}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Time grids layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Morning */}
        <Card hover={false} className="p-4 border border-[var(--border-color)] bg-[var(--bg-secondary)] min-h-[160px] flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Coffee className="w-4.5 h-4.5 text-amber-500" /> Morning Routine
            </h4>
            <textarea 
              value={morning}
              onChange={(e) => setMorning(e.target.value)}
              placeholder="Yoga, healthy breakfast, news..."
              className="w-full text-xs text-[var(--text-secondary)] font-semibold bg-[var(--bg-tertiary)] border border-[var(--border-color)]/30 p-2.5 rounded-xl h-24 resize-none focus:outline-none"
            />
          </div>
        </Card>

        {/* Afternoon */}
        <Card hover={false} className="p-4 border border-[var(--border-color)] bg-[var(--bg-secondary)] min-h-[160px] flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Sun className="w-4.5 h-4.5 text-yellow-500 animate-spin" style={{ animationDuration: '20s' }} /> Afternoon focus
            </h4>
            <textarea 
              value={afternoon}
              onChange={(e) => setAfternoon(e.target.value)}
              placeholder="Meetings, study session, lunch..."
              className="w-full text-xs text-[var(--text-secondary)] font-semibold bg-[var(--bg-tertiary)] border border-[var(--border-color)]/30 p-2.5 rounded-xl h-24 resize-none focus:outline-none"
            />
          </div>
        </Card>

        {/* Evening */}
        <Card hover={false} className="p-4 border border-[var(--border-color)] bg-[var(--bg-secondary)] min-h-[160px] flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Moon className="w-4.5 h-4.5 text-violet-500" /> Evening wind-down
            </h4>
            <textarea 
              value={evening}
              onChange={(e) => setEvening(e.target.value)}
              placeholder="Cooking together, evening walk..."
              className="w-full text-xs text-[var(--text-secondary)] font-semibold bg-[var(--bg-tertiary)] border border-[var(--border-color)]/30 p-2.5 rounded-xl h-24 resize-none focus:outline-none"
            />
          </div>
        </Card>

        {/* Night */}
        <Card hover={false} className="p-4 border border-[var(--border-color)] bg-[var(--bg-secondary)] min-h-[160px] flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Moon className="w-4.5 h-4.5 text-indigo-950 fill-current" /> Sleep hygiene
            </h4>
            <textarea 
              value={night}
              onChange={(e) => setNight(e.target.value)}
              placeholder="Read 10 pages, gratitude logs..."
              className="w-full text-xs text-[var(--text-secondary)] font-semibold bg-[var(--bg-tertiary)] border border-[var(--border-color)]/30 p-2.5 rounded-xl h-24 resize-none focus:outline-none"
            />
          </div>
        </Card>
      </div>

      <Card hover={false} className="p-5 border border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">General Daily Logs / Notes</h4>
        <textarea 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Jot down summaries of today's achievements..."
          className="w-full text-sm text-[var(--text-primary)] bg-[var(--bg-tertiary)] border border-[var(--border-color)]/30 p-4 rounded-xl h-32 resize-none focus:outline-none"
        />
      </Card>
    </div>
  );
}

/* ===================================================================
   8. WEEKLY PLANNER WORKSPACE
   =================================================================== */
function WeeklyPlannerWorkspace({ tasks, events }) {
  const [weeklyGoal, setWeeklyGoal] = useState('');
  const [goals, setGoals] = useState([]);

  const addGoal = () => {
    if (!weeklyGoal.trim()) return;
    setGoals([...goals, { text: weeklyGoal.trim(), done: false }]);
    setWeeklyGoal('');
  };

  // Filter tasks and events happening this week
  const thisWeekTasks = useMemo(() => {
    const today = new Date();
    const endOfWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return tasks.filter(t => t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) <= endOfWeek);
  }, [tasks]);

  const thisWeekEvents = useMemo(() => {
    const today = new Date();
    const endOfWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return events.filter(e => e.startDate && new Date(e.startDate) >= today && new Date(e.startDate) <= endOfWeek);
  }, [events]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 space-y-6">
        <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Weekly Planner</h2>
        
        {/* Weekly schedule preview card */}
        <Card hover={false} className="p-5 border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-4">
          <h4 className="font-display font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
            📅 Upcoming Week Events ({thisWeekEvents.length})
          </h4>
          {thisWeekEvents.length === 0 ? (
            <p className="text-xs text-[var(--text-tertiary)] italic">No events scheduled this week.</p>
          ) : (
            <div className="space-y-2">
              {thisWeekEvents.map(e => (
                <div key={e._id} className="flex justify-between items-center text-xs border-b border-[var(--border-color)]/30 pb-2">
                  <div>
                    <span className="font-bold text-[var(--text-primary)]">{e.title}</span>
                    <p className="text-[10px] text-[var(--text-tertiary)] font-semibold mt-0.5">{e.category}</p>
                  </div>
                  <span className="text-[10px] text-[var(--text-tertiary)] font-bold">{new Date(e.startDate).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Weekly tasks card */}
        <Card hover={false} className="p-5 border border-[var(--border-color)] bg-[var(--bg-secondary)] space-y-4">
          <h4 className="font-display font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
            📋 Pending Tasks for the Week ({thisWeekTasks.length})
          </h4>
          {thisWeekTasks.length === 0 ? (
            <p className="text-xs text-[var(--text-tertiary)] italic">No tasks due this week.</p>
          ) : (
            <div className="space-y-2">
              {thisWeekTasks.map(t => (
                <div key={t._id} className="flex justify-between items-center text-xs border-b border-[var(--border-color)]/30 pb-2">
                  <span className="font-semibold text-[var(--text-secondary)]">{t.title}</span>
                  <span className="text-[10px] bg-red-50 text-red-500 font-bold px-2 py-0.5 rounded">{t.priority}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* CREATE WEEKLY GOAL CARD */}
      <Card hover={false} className="p-4 lg:p-6 border border-[var(--border-color)] h-fit">
        <h3 className="font-display font-bold text-base text-[var(--text-primary)] mb-4 font-black">Weekly Objectives</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(e.target.value)}
              placeholder="Weekly goal description..."
              className="flex-1 px-3 py-2 border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-xs rounded-xl focus:outline-none"
            />
            <Button size="sm" onClick={addGoal}>Add</Button>
          </div>

          <div className="space-y-2">
            {goals.length === 0 ? (
              <p className="text-xs text-[var(--text-tertiary)] italic text-center py-4">No objectives listed.</p>
            ) : (
              goals.map((g, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] p-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)]/50 rounded-xl">
                  <span className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={g.done}
                      onChange={() => {
                        const newGoals = [...goals];
                        newGoals[idx].done = !newGoals[idx].done;
                        setGoals(newGoals);
                      }}
                      className="accent-[var(--color-primary)] rounded cursor-pointer"
                    />
                    <span className={g.done ? 'line-through opacity-60' : ''}>{g.text}</span>
                  </span>
                  <button onClick={() => setGoals(goals.filter((_, i) => i !== idx))} className="text-red-500 text-xs font-black">×</button>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ===================================================================
   9. MONTHLY STATISTICS PLANNER WORKSPACE
   =================================================================== */
function MonthlyPlannerWorkspace({ tasks, shopping, travel, movies, restaurants }) {
  const taskCompletionRate = useMemo(() => {
    if (tasks.length === 0) return 0;
    const doneCount = tasks.filter(t => t.completed).length;
    return Math.round((doneCount / tasks.length) * 100);
  }, [tasks]);

  const shoppingStatus = useMemo(() => {
    if (shopping.length === 0) return { rate: 0, count: 0 };
    const purchased = shopping.filter(i => i.purchased).length;
    return {
      rate: Math.round((purchased / shopping.length) * 100),
      count: shopping.length
    };
  }, [shopping]);

  return (
    <div className="space-y-6">
      <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">Monthly Statistics & Achievements</h2>

      {/* Grid status cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Tasks progress bar */}
        <Card hover={false} className="p-5 border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col justify-between min-h-[140px] shadow-sm">
          <div>
            <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">Todo Completion</div>
            <div className="text-3xl font-black text-[var(--text-primary)] mt-1.5">{taskCompletionRate}%</div>
          </div>
          <div className="w-full bg-[var(--bg-tertiary)] h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-[var(--color-primary)] h-full rounded-full transition-all" style={{ width: `${taskCompletionRate}%` }} />
          </div>
        </Card>

        {/* Shopping list progress */}
        <Card hover={false} className="p-5 border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col justify-between min-h-[140px] shadow-sm">
          <div>
            <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">Shopping Status</div>
            <div className="text-3xl font-black text-emerald-500 mt-1.5">{shoppingStatus.rate}%</div>
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">{shoppingStatus.count} total items logged</p>
        </Card>

        {/* Travel logs counts */}
        <Card hover={false} className="p-5 border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col justify-between min-h-[140px] shadow-sm">
          <div>
            <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">Trips Scheduled</div>
            <div className="text-3xl font-black text-blue-500 mt-1.5">{travel.length}</div>
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">Shared Travel plans</p>
        </Card>

        {/* Movie + dining logs count */}
        <Card hover={false} className="p-5 border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col justify-between min-h-[140px] shadow-sm">
          <div>
            <div className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">Activity Logs</div>
            <div className="text-3xl font-black text-violet-500 mt-1.5">{movies.length + restaurants.length}</div>
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">{movies.length} movies • {restaurants.length} food logs</p>
        </Card>

      </div>

      {/* Monthly highlights list */}
      <Card hover={false} className="p-6 border border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <h3 className="font-display font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2 mb-4">
          🏆 Monthly Milestones & Achievements
        </h3>
        
        <div className="space-y-3">
          <div className="flex gap-3 text-sm font-semibold text-[var(--text-secondary)] items-start">
            <span className="text-lg">🎯</span>
            <div>
              <p className="text-[var(--text-primary)] font-bold">Goal Setter</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Completed {tasks.filter(t => t.completed).length} tasks successfully with your partner.</p>
            </div>
          </div>

          <div className="flex gap-3 text-sm font-semibold text-[var(--text-secondary)] items-start">
            <span className="text-lg">🎬</span>
            <div>
              <p className="text-[var(--text-primary)] font-bold">Cinephile Duo</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Watched and rated {movies.filter(m => m.watched).length} movies together this month.</p>
            </div>
          </div>

          <div className="flex gap-3 text-sm font-semibold text-[var(--text-secondary)] items-start">
            <span className="text-lg">✈️</span>
            <div>
              <p className="text-[var(--text-primary)] font-bold">Explorer Spirit</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Designed {travel.length} vacations packing logs, and places timelines.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
