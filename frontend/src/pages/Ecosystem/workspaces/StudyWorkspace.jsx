import { useEffect } from 'react';
import { BookOpen, Clock, Calendar } from 'lucide-react';
import useProductivityStore from '@/store/productivityStore';

export default function StudyWorkspace() {
  const { items, fetchItems, isLoading } = useProductivityStore();
  
  useEffect(() => {
    fetchItems();
  }, []);

  const studyItems = items.filter(i => i.type.startsWith('study'));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Study Planner</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col items-center justify-center space-y-2">
          <BookOpen className="w-8 h-8 text-indigo-500" />
          <h3 className="font-bold text-[var(--text-primary)]">Subjects</h3>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col items-center justify-center space-y-2">
          <Clock className="w-8 h-8 text-rose-500" />
          <h3 className="font-bold text-[var(--text-primary)]">Pomodoro</h3>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col items-center justify-center space-y-2">
          <Calendar className="w-8 h-8 text-emerald-500" />
          <h3 className="font-bold text-[var(--text-primary)]">Exams</h3>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-[var(--text-secondary)]">Loading study items...</div>
      ) : studyItems.length === 0 ? (
        <div className="text-center text-[var(--text-secondary)] py-8 border border-dashed border-[var(--border-color)] rounded-2xl">
          No study plans created yet.
        </div>
      ) : (
        <div className="space-y-4">
          {studyItems.map(item => (
            <div key={item._id} className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl flex justify-between">
              <span className="font-bold text-[var(--text-primary)]">{item.title}</span>
              <span className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">{item.type.replace('study_', '')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
