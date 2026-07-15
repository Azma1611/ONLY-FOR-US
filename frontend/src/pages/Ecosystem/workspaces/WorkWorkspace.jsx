import { useEffect } from 'react';
import { Briefcase, ListTodo, Users } from 'lucide-react';
import useProductivityStore from '@/store/productivityStore';

export default function WorkWorkspace() {
  const { items, fetchItems, isLoading } = useProductivityStore();
  
  useEffect(() => {
    fetchItems();
  }, []);

  const workItems = items.filter(i => i.type.startsWith('work'));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Work Planner</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 hover:border-orange-500 transition-colors">
          <Briefcase className="w-8 h-8 text-orange-500" />
          <h3 className="font-bold text-[var(--text-primary)]">Projects</h3>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 hover:border-blue-500 transition-colors">
          <ListTodo className="w-8 h-8 text-blue-500" />
          <h3 className="font-bold text-[var(--text-primary)]">Tasks</h3>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 hover:border-purple-500 transition-colors">
          <Users className="w-8 h-8 text-purple-500" />
          <h3 className="font-bold text-[var(--text-primary)]">Meetings</h3>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-[var(--text-secondary)]">Loading work items...</div>
      ) : workItems.length === 0 ? (
        <div className="text-center text-[var(--text-secondary)] py-8 border border-dashed border-[var(--border-color)] rounded-2xl">
          No work items added yet.
        </div>
      ) : (
        <div className="space-y-4">
          {workItems.map(item => (
            <div key={item._id} className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl flex justify-between">
              <span className="font-bold text-[var(--text-primary)]">{item.title}</span>
              <span className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">{item.type.replace('work_', '')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
