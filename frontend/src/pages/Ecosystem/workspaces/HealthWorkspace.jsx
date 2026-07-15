import { useEffect } from 'react';
import { Heart, Droplet, Moon, Activity as ActivityIcon } from 'lucide-react';
import useHealthStore from '@/store/healthStore';

export default function HealthWorkspace() {
  const { logs, fetchHealthData, isLoading } = useHealthStore();

  useEffect(() => {
    fetchHealthData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Health & Wellness</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-900 flex flex-col items-center justify-center text-center space-y-2">
          <Droplet className="w-8 h-8 text-blue-500" />
          <div className="font-bold text-blue-900 dark:text-blue-100">Water Tracker</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-100 dark:border-purple-900 flex flex-col items-center justify-center text-center space-y-2">
          <Moon className="w-8 h-8 text-purple-500" />
          <div className="font-bold text-purple-900 dark:text-purple-100">Sleep Log</div>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-2xl border border-rose-100 dark:border-rose-900 flex flex-col items-center justify-center text-center space-y-2">
          <Heart className="w-8 h-8 text-rose-500" />
          <div className="font-bold text-rose-900 dark:text-rose-100">Mood Journal</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900 flex flex-col items-center justify-center text-center space-y-2">
          <ActivityIcon className="w-8 h-8 text-emerald-500" />
          <div className="font-bold text-emerald-900 dark:text-emerald-100">Workouts</div>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Recent Logs</h3>
        {isLoading ? (
          <div className="text-[var(--text-secondary)]">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="text-[var(--text-secondary)] text-center py-8">No health logs found.</div>
        ) : (
          <div className="space-y-3">
            {logs.slice(0, 5).map(log => (
              <div key={log._id} className="p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] flex justify-between">
                <span className="font-semibold text-[var(--text-primary)] uppercase text-sm tracking-wider">{log.type}</span>
                <span className="text-[var(--text-secondary)]">{log.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
