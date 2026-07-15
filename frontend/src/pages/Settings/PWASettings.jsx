import React, { useState } from 'react';
import { Bell, Calendar, Download, RefreshCw, Server, AlertCircle } from 'lucide-react';
import { calendarService } from '../../services/calendarService';
import { backupService } from '../../services/backupService';
import toast from 'react-hot-toast';
import { useSyncStore } from '../../store/syncStore';

export default function PWASettings() {
  const { isOnline, pendingSyncs, fetchSyncStatus, processQueue } = useSyncStore();
  const [pushEnabled, setPushEnabled] = useState(false);

  const requestPushPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Normally you'd get the service worker registration and pushManager.subscribe here.
        setPushEnabled(true);
        toast.success('Push notifications enabled!');
      } else {
        toast.error('Permission denied for notifications');
      }
    } catch (err) {
      toast.error('Push notifications are not supported in this browser');
    }
  };

  const handleCalendarLink = async () => {
    try {
      const url = await calendarService.getAuthUrl();
      window.location.href = url;
    } catch (err) {
      toast.error('Failed to link Google Calendar');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6 pb-24 md:pb-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-rose-400">
          App Settings & Integrations
        </h1>

        <div className="space-y-6">
          
          {/* Notifications */}
          <section className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-500/20 rounded-xl">
                <Bell className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Push Notifications</h3>
                <p className="text-sm text-slate-400 mt-1">Receive alerts for reminders and messages even when the app is closed.</p>
                <div className="mt-4">
                  <button
                    onClick={requestPushPermission}
                    disabled={pushEnabled}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 rounded-xl font-medium transition-colors"
                  >
                    {pushEnabled ? 'Enabled' : 'Enable Push Notifications'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Google Calendar */}
          <section className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Calendar className="w-6 h-6 text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Google Calendar Sync</h3>
                <p className="text-sm text-slate-400 mt-1">Sync your reminders, dates, and milestones to your external calendar.</p>
                <div className="mt-4">
                  <button
                    onClick={handleCalendarLink}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-colors"
                  >
                    Connect Google Account
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Backup & Export */}
          <section className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Download className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Export & Backup</h3>
                <p className="text-sm text-slate-400 mt-1">Download your entire digital memory book and records.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={() => backupService.exportData('json')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium">Export JSON</button>
                  <button onClick={() => backupService.exportData('csv')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium">Export CSV</button>
                  <button onClick={() => backupService.exportData('zip')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-sm font-medium">Full ZIP Backup</button>
                </div>
              </div>
            </div>
          </section>

          {/* Sync Engine */}
          <section className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-pink-500/20 rounded-xl">
                <RefreshCw className="w-6 h-6 text-pink-400" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Background Sync Engine</h3>
                    <p className="text-sm text-slate-400 mt-1">Status of offline data queue and realtime synchronization.</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    <Server className="w-3 h-3" />
                    {isOnline ? 'Online' : 'Offline Mode'}
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-300">Pending Actions: <strong className="text-white">{pendingSyncs}</strong></span>
                  </div>
                  <button
                    onClick={() => {
                      fetchSyncStatus();
                      processQueue();
                      toast.success('Sync engine checked');
                    }}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    Force Sync
                  </button>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
