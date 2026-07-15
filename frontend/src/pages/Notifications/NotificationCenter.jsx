import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../../store/notificationStore';
import { Bell, Check, Trash2, Calendar, Target, CheckCircle2, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

const iconMap = {
  reminder: <Bell className="w-5 h-5 text-indigo-400" />,
  message: <MessageCircle className="w-5 h-5 text-pink-400" />,
  goal: <Target className="w-5 h-5 text-emerald-400" />,
  habit: <CheckCircle2 className="w-5 h-5 text-blue-400" />,
  calendar: <Calendar className="w-5 h-5 text-orange-400" />,
  system: <Bell className="w-5 h-5 text-slate-400" />
};

export default function NotificationCenter() {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, loading } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (loading && notifications.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0F172A] text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6 pb-24 md:pb-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-rose-400">
            Notifications
          </h1>
          {notifications.some(n => !n.read) && (
            <button
              onClick={() => markAllAsRead()}
              className="text-sm font-medium text-pink-400 hover:text-pink-300 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-slate-400"
              >
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>You're all caught up!</p>
              </motion.div>
            ) : (
              notifications.map((notification) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative overflow-hidden rounded-2xl p-5 border transition-colors ${
                    notification.read 
                      ? 'bg-slate-800/40 border-slate-700/50' 
                      : 'bg-slate-800/80 border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.1)]'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0">
                      {iconMap[notification.type] || iconMap.system}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={`font-semibold truncate ${notification.read ? 'text-slate-300' : 'text-white'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-slate-500 flex-shrink-0 ml-4">
                          {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      
                      <p className={`text-sm ${notification.read ? 'text-slate-400' : 'text-slate-300'}`}>
                        {notification.message}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-emerald-400 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
