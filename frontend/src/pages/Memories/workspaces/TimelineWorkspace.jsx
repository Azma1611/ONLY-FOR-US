import { useMemo } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import useMemoriesStore from '@/store/memoriesStore';
import { Camera, Video, Mic, MapPin, Flag, FileText } from 'lucide-react';

export default function TimelineWorkspace() {
  const { memories, loveLetters, milestones } = useMemoriesStore();

  const timelineEvents = useMemo(() => {
    // Combine all types of memories into a single timeline array
    const events = [
      ...memories.map(m => ({ ...m, eventType: 'memory' })),
      ...loveLetters.map(l => ({ ...l, eventType: 'letter', date: l.createdAt })),
      ...milestones.map(m => ({ ...m, eventType: 'milestone' })),
    ];

    // Sort descending by date
    return events.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  }, [memories, loveLetters, milestones]);

  if (timelineEvents.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <Camera className="w-10 h-10 text-gray-500" />
        </div>
        <h2 className="text-xl font-medium text-white mb-2">No memories yet</h2>
        <p className="text-gray-400 max-w-md">Start capturing your favorite moments to build your relationship timeline.</p>
      </div>
    );
  }

  const getEventIcon = (event) => {
    if (event.eventType === 'letter') return <FileText className="w-5 h-5" />;
    if (event.eventType === 'milestone') return <Flag className="w-5 h-5" />;
    if (event.mediaType === 'video') return <Video className="w-5 h-5" />;
    if (event.mediaType === 'voice') return <Mic className="w-5 h-5" />;
    if (event.mediaType === 'place') return <MapPin className="w-5 h-5" />;
    return <Camera className="w-5 h-5" />;
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="relative border-l-2 border-white/10 ml-6 md:ml-12 pl-8 md:pl-12 space-y-12">
        {timelineEvents.map((event, index) => {
          const eventDate = new Date(event.date || event.createdAt);
          
          return (
            <motion.div
              key={event._id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="relative"
            >
              {/* Timeline dot */}
              <div className="absolute -left-[41px] md:-left-[57px] top-1 w-10 h-10 bg-dark rounded-full border-2 border-purple-500/50 flex items-center justify-center text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                {getEventIcon(event)}
              </div>

              {/* Event Content */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                <span className="text-xs font-semibold tracking-wider text-purple-400 uppercase mb-2 block">
                  {format(eventDate, 'MMM d, yyyy')}
                </span>
                
                <h3 className="text-lg font-medium text-white mb-2">{event.title}</h3>
                
                {event.description || event.content ? (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {event.description || (event.content && event.content.replace(/<[^>]*>?/gm, ''))}
                  </p>
                ) : null}

                {/* Media Preview (if applicable) */}
                {event.eventType === 'memory' && event.mediaUrl && event.mediaType === 'photo' && (
                  <div className="rounded-xl overflow-hidden mt-4 aspect-video relative bg-black/20">
                    <img 
                      src={event.mediaUrl} 
                      alt={event.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                
                {event.eventType === 'memory' && event.mediaUrl && event.mediaType === 'video' && (
                  <div className="rounded-xl overflow-hidden mt-4 aspect-video relative bg-black/20">
                    <video src={event.mediaUrl} controls className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
