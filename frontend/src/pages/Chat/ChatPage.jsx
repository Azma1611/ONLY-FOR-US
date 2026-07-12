import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Smile, Paperclip, Mic, X, Check, CheckCheck, 
  MoreVertical, Reply, Edit, Trash2, Copy, Search, 
  Volume2, VolumeX, Pause, Play, Square, Trash, 
  Download, Image as ImageIcon, FileText, Video as VideoIcon, 
  ArrowDown, Pin, Star, Eye
} from 'lucide-react';

import useAuthStore from '@/store/authStore';
import useChatStore from '@/store/chatStore';
import useSocketStore from '@/store/socketStore';
import useNotificationStore from '@/store/notificationStore';
import chatService from '@/services/chatService';

// Format message timestamps
const formatMessageTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper for date separators
const getDayLabel = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    // Check if it's within the current week (7 days)
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    }
    return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
  }
};

// Canvas Visualizer Component for active voice recording
const VoiceRecorderVisualizer = ({ stream }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!stream) return;

    let audioContext;
    let analyser;
    let dataArray;
    let source;
    let animationId;

    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);

      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const canvas = canvasRef.current;
      const canvasCtx = canvas.getContext('2d');

      const draw = () => {
        if (!canvas) return;
        animationId = requestAnimationFrame(draw);

        const width = canvas.width;
        const height = canvas.height;

        analyser.getByteFrequencyData(dataArray);

        canvasCtx.clearRect(0, 0, width, height);

        const barWidth = (width / bufferLength) * 2;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * height;
          
          // Cute gradient coloring
          canvasCtx.fillStyle = `rgba(255, 77, 136, ${Math.max(0.4, dataArray[i] / 255)})`;
          
          const y = (height - barHeight) / 2; // center vertically
          canvasCtx.fillRect(x, y, barWidth - 2, barHeight);

          x += barWidth;
        }
      };

      draw();
    } catch (err) {
      console.warn('AudioContext failed to initialize:', err);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (source) source.disconnect();
      if (analyser) analyser.disconnect();
      if (audioContext && audioContext.state !== 'closed') audioContext.close();
    };
  }, [stream]);

  return <canvas ref={canvasRef} className="w-48 h-8 opacity-95" width="200" height="32" />;
};

// Custom voice note playback bubble
const VoicePlaybackBubble = ({ url, isOwn }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [url]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center gap-3 py-2 px-4 rounded-2xl ${isOwn ? 'bg-white/10 text-white' : 'bg-slate-800/40 text-[var(--text-primary)]'} border border-white/5 max-w-[280px] w-full shadow-sm`}>
      <button 
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full ${isOwn ? 'bg-white text-[var(--color-primary)]' : 'bg-[var(--color-primary)] text-white'} flex items-center justify-center shadow-md flex-shrink-0 transition-transform active:scale-95`}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
      </button>
      
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="flex items-end gap-0.5 h-6">
          {Array.from({ length: 24 }).map((_, index) => {
            const barProgress = (index / 24) * 100;
            const isPlayed = progressPercent > barProgress;
            const heights = [30, 50, 70, 40, 60, 80, 90, 50, 30, 60, 70, 40, 50, 80, 90, 60, 40, 70, 50, 30, 60, 80, 40, 30];
            const heightVal = heights[index % heights.length];
            return (
              <span 
                key={index} 
                className="w-[3px] rounded-full transition-colors duration-150"
                style={{
                  height: `${heightVal}%`,
                  backgroundColor: isPlayed 
                    ? (isOwn ? '#FFFFFF' : 'var(--color-primary)') 
                    : (isOwn ? 'rgba(255,255,255,0.3)' : 'rgba(128,128,128,0.3)'),
                }}
              />
            );
          })}
        </div>
        
        <div className="flex justify-between items-center text-[10px] opacity-75 mt-1 select-none font-medium">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration || 0)}</span>
        </div>
      </div>
    </div>
  );
};

export default function ChatPage() {
  const { user } = useAuthStore();
  const { messages, fetchMessages, pagination, isLoading, isLoadingMore, setChatPageActive, replyTo, setReplyTo, editingMessage, setEditingMessage, addMessage } = useChatStore();
  const { isConnected, partnerOnline, partnerLastSeen, partnerTyping, emitSendMessage, emitTypingStart, emitTypingStop, emitMessageSeen, emitMessageDelivered, emitMessageReaction, emitDeleteMessage, emitEditMessage } = useSocketStore();
  const { muted, toggleMute, clearUnread } = useNotificationStore();

  const [partner, setPartner] = useState(null);
  const [inputText, setInputText] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  
  // Media uploads states
  const [uploadProgress, setUploadProgress] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState(null); // { mediaUrl, fileName, mimeType, type }
  const [showAttachmentsMenu, setShowAttachmentsMenu] = useState(false);

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recDuration, setRecDuration] = useState(0);
  const [recBlob, setRecBlob] = useState(null);
  const [recUrl, setRecUrl] = useState(null);
  const [recStream, setRecStream] = useState(null);

  const mediaRecorderRef = useRef(null);
  const recIntervalRef = useRef(null);
  const chatBottomRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [activeMenuMessageId, setActiveMenuMessageId] = useState(null);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  // Sync unread counter and active status
  useEffect(() => {
    setChatPageActive(true);
    clearUnread();
    
    // Fetch partner details from status endpoint
    const fetchPartnerData = async () => {
      try {
        const response = await chatService.getMessages({ limit: 1 });
        // Since we are connected, we can also fetch status from /partner/status
        const statusRes = await apiGetStatus();
        if (statusRes.partner) {
          setPartner(statusRes.partner);
        }
      } catch (err) {
        console.error('Error fetching partner details:', err);
      }
    };
    fetchPartnerData();

    // Initial messages fetch
    fetchMessages(1, 30);

    return () => {
      setChatPageActive(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const apiGetStatus = async () => {
    // Quick API fallback
    const res = await chatService.getMessages({ limit: 1 });
    // We can infer partner from user details or just fetch relationship partner
    const relationshipResponse = await chatService.getMessages({ limit: 1 });
    // Find partnerId
    const receiverId = user?.partnerId;
    return {
      partner: {
        _id: receiverId,
        name: 'Partner',
        avatar: null
      }
    };
  };

  // Scroll to bottom on load or new messages
  const scrollToBottom = (behavior = 'smooth') => {
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior });
    }, 100);
  };

  useEffect(() => {
    if (messages.length > 0 && !isLoadingMore) {
      scrollToBottom('smooth');
    }
  }, [messages.length]);

  // Monitor scroll for pagination and scroll-to-bottom button
  const handleScroll = async () => {
    const container = chatContainerRef.current;
    if (!container) return;

    // Detect scroll near top
    if (container.scrollTop === 0 && pagination && pagination.currentPage < pagination.totalPages && !isLoadingMore) {
      const prevHeight = container.scrollHeight;
      await fetchMessages(pagination.currentPage + 1, 30, true);
      // Retain scroll position after pagination prepend
      setTimeout(() => {
        container.scrollTop = container.scrollHeight - prevHeight;
      }, 50);
    }

    // Toggle scroll to bottom button
    const isScrolledUp = container.scrollHeight - container.clientHeight - container.scrollTop > 300;
    setShowScrollBottomBtn(isScrolledUp);
  };

  // Search logic
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMessages(1, 40);
    setSearchOpen(false);
  };

  // Typing emitter
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    emitTypingStart();

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStop();
    }, 2000);
  };

  // File uploading wrapper
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setShowAttachmentsMenu(false);
    setUploadProgress(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await chatService.uploadFile(formData);
      const data = response.data;

      // Classify type based on mime type
      let type = 'file';
      if (data.mimeType.startsWith('image/')) type = 'image';
      else if (data.mimeType.startsWith('video/')) type = 'video';
      else if (data.mimeType.startsWith('audio/')) type = 'voice';

      setAttachmentPreview({
        mediaUrl: data.mediaUrl,
        fileName: data.fileName,
        mimeType: data.mimeType,
        type,
      });
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setUploadProgress(false);
    }
  };

  // Recording voice triggers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setRecStream(stream);
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecBlob(audioBlob);
        setRecUrl(audioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecDuration(0);

      recIntervalRef.current = setInterval(() => {
        setRecDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recIntervalRef.current);
      if (recStream) {
        recStream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const deleteRecording = () => {
    setRecBlob(null);
    setRecUrl(null);
    setRecDuration(0);
  };

  const sendVoiceNote = async () => {
    if (!recBlob) return;
    setUploadProgress(true);
    try {
      const audioFile = new File([recBlob], 'voice_message.wav', { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await chatService.uploadFile(formData);
      const data = response.data;

      const payload = {
        type: 'voice',
        mediaUrl: data.mediaUrl,
        fileName: 'Voice Note.wav',
        mimeType: 'audio/wav',
      };

      emitSendMessage(payload);
      deleteRecording();
      scrollToBottom('smooth');
    } catch (err) {
      console.error('Voice send error:', err);
    } finally {
      setUploadProgress(false);
    }
  };

  // Message sending trigger
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();

    if (!inputText.trim() && !attachmentPreview) return;

    const payload = {
      type: attachmentPreview ? attachmentPreview.type : 'text',
      text: inputText.trim(),
      mediaUrl: attachmentPreview ? attachmentPreview.mediaUrl : null,
      fileName: attachmentPreview ? attachmentPreview.fileName : null,
      mimeType: attachmentPreview ? attachmentPreview.mimeType : null,
      replyTo: replyTo ? replyTo._id : null,
    };

    emitSendMessage(payload);
    emitTypingStop();

    // Reset input tray states
    setInputText('');
    setReplyTo(null);
    setAttachmentPreview(null);
    scrollToBottom('smooth');
  };

  // Edit Message trigger
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !editingMessage) return;

    emitEditMessage(editingMessage._id, inputText.trim());
    setInputText('');
    setEditingMessage(null);
  };

  // Initiate message edit mode
  const startEditing = (message) => {
    setEditingMessage(message);
    setInputText(message.text);
    setReplyTo(null);
    setActiveMenuMessageId(null);
  };

  // Message deletion
  const handleDeleteMessage = (messageId, type) => {
    emitDeleteMessage(messageId, type);
    setActiveMenuMessageId(null);
  };

  // Copy text helper
  const copyMessageText = (text) => {
    navigator.clipboard.writeText(text);
    setActiveMenuMessageId(null);
  };

  // Quote reply helper
  const handleReplyTo = (message) => {
    setReplyTo(message);
    setEditingMessage(null);
    setActiveMenuMessageId(null);
  };

  // Jump to specific message bubble
  const handleJumpToMessage = (messageId) => {
    const element = document.getElementById(`msg-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 2000);
    }
  };

  // Group messages chronologically with Date Separators
  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastDateLabel = '';

    messages.forEach((msg) => {
      const dateLabel = getDayLabel(msg.createdAt);
      if (dateLabel !== lastDateLabel) {
        groups.push({ type: 'separator', label: dateLabel, id: `sep-${msg._id}` });
        lastDateLabel = dateLabel;
      }
      groups.push({ type: 'message', message: msg, id: msg._id });
    });

    return groups;
  }, [messages]);

  // Format recording clock duration (MM:SS)
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex h-[calc(100vh-100px)] lg:h-[calc(100vh-88px)] bg-[var(--bg-primary)] rounded-3xl overflow-hidden border border-[var(--border-color)] shadow-soft relative">
      
      {/* 1. CHAT MAIN PANEL */}
      <div className="flex-1 flex flex-col h-full bg-[var(--bg-secondary)] relative">
        
        {/* TOP PANEL HEADER */}
        <div className="h-16 lg:h-20 border-b border-[var(--border-color)] px-4 lg:px-6 flex items-center justify-between glass-card sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary)] flex items-center justify-center font-bold text-lg border border-[var(--border-color)]">
                {partner?.name?.charAt(0) || 'P'}
              </div>
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--bg-secondary)] ${partnerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            </div>
            
            <div>
              <h3 className="font-display font-bold text-sm lg:text-base text-[var(--text-primary)]">
                {partner?.name || 'My Partner'}
              </h3>
              <p className="text-[11px] text-[var(--text-tertiary)] font-medium">
                {partnerOnline ? (
                  <span className="text-emerald-500 font-semibold">Active Now</span>
                ) : partnerLastSeen ? (
                  `Last seen ${new Date(partnerLastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                ) : (
                  'Offline'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search toggler */}
            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-xl transition-all"
              title="Search chat"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notification mute toggler */}
            <button 
              onClick={toggleMute}
              className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-xl transition-all"
              title={muted ? 'Unmute sound' : 'Mute sound'}
            >
              {muted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* SEARCH OVERLAY BAR */}
        <AnimatePresence>
          {searchOpen && (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleSearchSubmit}
              className="px-6 py-3 border-b border-[var(--border-color)] bg-[var(--bg-primary)] flex gap-2 items-center"
            >
              <input 
                type="text" 
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              />
              <Button type="submit" size="sm">Search</Button>
              <Button 
                type="button" 
                variant="secondary" 
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSearchOpen(false);
                  fetchMessages(1, 30);
                }}
              >
                Clear
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* MESSAGES VIEWPORT CONTAINER */}
        <div 
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-4 no-scrollbar scroll-smooth"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3">
              <span className="relative flex h-8 w-8">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-8 w-8 bg-pink-500"></span>
              </span>
              <p className="text-xs text-[var(--text-tertiary)] font-medium">Encrypting and loading connection...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-60 text-center px-6">
              <span className="text-4xl mb-3">💌</span>
              <h4 className="font-display font-bold text-base text-[var(--text-primary)]">Your private chat room</h4>
              <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-[280px] leading-relaxed">
                Messages sent here are secure and private between only you and your partner.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {isLoadingMore && (
                <div className="text-center text-xs text-[var(--text-tertiary)] py-2 font-medium">
                  Loading older messages...
                </div>
              )}
              
              {groupedMessages.map((item) => {
                if (item.type === 'separator') {
                  return (
                    <div key={item.id} className="flex justify-center my-6">
                      <span className="px-3.5 py-1 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider bg-[var(--bg-tertiary)] border border-[var(--border-color)]/60 rounded-full shadow-sm">
                        {item.label}
                      </span>
                    </div>
                  );
                }

                const msg = item.message;
                const isOwn = msg.sender?._id === user?._id || msg.sender === user?._id;
                
                // Determine read/seen details
                const isDelivered = msg.deliveredTo && msg.deliveredTo.length > 1;
                const isSeen = msg.readBy && msg.readBy.length > 1;
                const isHighlighted = highlightedMessageId === msg._id;

                return (
                  <div 
                    key={msg._id} 
                    id={`msg-${msg._id}`}
                    className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} group relative transition-colors duration-500 ${isHighlighted ? 'bg-[var(--color-primary-50)]/45 rounded-2xl p-2' : ''}`}
                  >
                    
                    {/* Quoted Message display above bubble */}
                    {msg.replyTo && (
                      <div 
                        onClick={() => handleJumpToMessage(msg.replyTo._id || msg.replyTo)}
                        className={`flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] mb-1 cursor-pointer bg-[var(--bg-tertiary)] px-2.5 py-1 rounded-lg border border-[var(--border-color)] max-w-sm truncate hover:opacity-80 transition-opacity`}
                      >
                        <Reply className="w-3 h-3 flex-shrink-0" />
                        <span className="font-bold">{msg.replyTo?.sender?.name || 'Partner'}:</span>
                        <span>{msg.replyTo?.text || 'Media'}</span>
                      </div>
                    )}

                    <div className={`flex items-center gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      
                      {/* BUBBLE WRAPPER */}
                      <div className={`relative px-4 py-3 rounded-2xl shadow-sm text-sm border ${
                        isOwn 
                          ? 'gradient-primary text-white border-transparent rounded-tr-sm' 
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-[var(--border-color)] rounded-tl-sm'
                      }`}>
                        
                        {/* Text Content */}
                        {!msg.isDeleted ? (
                          <div className="space-y-1.5 break-words">
                            
                            {/* Attachments inside bubble */}
                            {msg.type === 'image' && msg.mediaUrl && (
                              <div className="rounded-xl overflow-hidden mb-2 max-w-sm shadow-inner relative group/image">
                                <img src={msg.mediaUrl} alt="Attachment" className="max-h-72 object-cover w-full cursor-zoom-in" />
                                <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="absolute top-2 right-2 p-1.5 bg-black/40 text-white rounded-full hover:bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity">
                                  <Eye className="w-4 h-4" />
                                </a>
                              </div>
                            )}

                            {msg.type === 'video' && msg.mediaUrl && (
                              <div className="rounded-xl overflow-hidden mb-2 max-w-sm shadow-inner relative">
                                <video src={msg.mediaUrl} controls className="max-h-72 w-full" />
                              </div>
                            )}

                            {msg.type === 'voice' && msg.mediaUrl && (
                              <div className="mb-2">
                                <VoicePlaybackBubble url={msg.mediaUrl} isOwn={isOwn} />
                              </div>
                            )}

                            {msg.type === 'file' && msg.mediaUrl && (
                              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 mb-2 border border-white/5">
                                <FileText className="w-8 h-8 text-[var(--color-primary)] flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold truncate opacity-90">{msg.fileName || 'Attachment Document'}</p>
                                  <p className="text-[10px] opacity-60">File Attachment</p>
                                </div>
                                <a 
                                  href={msg.mediaUrl} 
                                  download={msg.fileName}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] rounded-lg text-[var(--text-secondary)] shadow-sm"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </div>
                            )}

                            {msg.text && (
                              <p className="leading-relaxed select-text font-medium">{msg.text}</p>
                            )}
                          </div>
                        ) : (
                          <p className="italic opacity-60 text-xs flex items-center gap-1.5 select-none">
                            <Trash2 className="w-3.5 h-3.5" />
                            This message was deleted.
                          </p>
                        )}

                        {/* Reactions grouped below bubble */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className={`absolute bottom-[-10px] ${isOwn ? 'left-2' : 'right-2'} flex gap-1 bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full border border-[var(--border-color)] shadow-sm text-xs select-none z-10 scale-95`}>
                            {msg.reactions.map((r, i) => (
                              <span key={i} title={`Reacted by user`} className="cursor-pointer" onClick={() => emitMessageReaction(msg._id, r.emoji)}>
                                {r.emoji}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* HOVER HOOK ACTIONS TRIGGER */}
                      {!msg.isDeleted && (
                        <div className={`opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                          
                          {/* Emoji quick reaction popover trigger */}
                          <div className="relative">
                            <button 
                              onClick={() => setActiveMenuMessageId(activeMenuMessageId === msg._id ? null : msg._id)}
                              className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-full transition-all"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            
                            {/* POPUP OPTIONS TRAY */}
                            <AnimatePresence>
                              {activeMenuMessageId === msg._id && (
                                <motion.div 
                                  initial={{ scale: 0.8, opacity: 0, y: 5 }}
                                  animate={{ scale: 1, opacity: 1, y: 0 }}
                                  exit={{ scale: 0.8, opacity: 0, y: 5 }}
                                  className={`absolute ${isOwn ? 'right-0' : 'left-0'} bottom-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1.5 rounded-2xl shadow-elevated z-30 min-w-[150px] space-y-1`}
                                >
                                  {/* Emoji Reactions Bar */}
                                  <div className="flex gap-1.5 border-b border-[var(--border-color)] pb-2 mb-1 justify-center px-1">
                                    {['❤️', '👍', '😂', '😢', '🔥'].map((emoji) => (
                                      <button 
                                        key={emoji}
                                        onClick={() => {
                                          emitMessageReaction(msg._id, emoji);
                                          setActiveMenuMessageId(null);
                                        }}
                                        className="hover:scale-125 text-base transition-transform active:scale-95"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>

                                  <button onClick={() => handleReplyTo(msg)} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg font-semibold">
                                    <Reply className="w-3.5 h-3.5" /> Quote Reply
                                  </button>
                                  
                                  {msg.text && (
                                    <button onClick={() => copyMessageText(msg.text)} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg font-semibold">
                                      <Copy className="w-3.5 h-3.5" /> Copy Message
                                    </button>
                                  )}

                                  {isOwn && msg.type === 'text' && (
                                    <button onClick={() => startEditing(msg)} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-lg font-semibold">
                                      <Edit className="w-3.5 h-3.5" /> Edit Message
                                    </button>
                                  )}

                                  <button onClick={() => handleDeleteMessage(msg._id, 'me')} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-lg font-semibold">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete for Me
                                  </button>

                                  {isOwn && (
                                    <button onClick={() => handleDeleteMessage(msg._id, 'everyone')} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-lg font-semibold">
                                      <Trash2 className="w-3.5 h-3.5" /> Delete for Everyone
                                    </button>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Metadata: timestamp, edit marker, ticks */}
                    <div className={`flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)] mt-1.5 font-medium select-none ${isOwn ? 'mr-1' : 'ml-1'}`}>
                      <span>{formatMessageTime(msg.createdAt)}</span>
                      {msg.isEdited && <span className="text-[9px] bg-[var(--bg-tertiary)] px-1 py-0.5 rounded">Edited</span>}
                      
                      {isOwn && !msg.isDeleted && (
                        <span className="flex items-center">
                          {isSeen ? (
                            <CheckCheck className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                          ) : isDelivered ? (
                            <CheckCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>
          )}
        </div>

        {/* Live Partner Typing state animation */}
        <AnimatePresence>
          {partnerTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute bottom-20 left-6 z-10 bg-[var(--bg-secondary)] border border-[var(--border-color)] py-1.5 px-3 rounded-full shadow-soft flex items-center gap-2"
            >
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-[10px] font-bold text-[var(--text-secondary)]">Partner is typing...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating scroll to bottom anchor button */}
        {showScrollBottomBtn && (
          <button 
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-24 right-6 p-3 rounded-full bg-[var(--color-primary)] text-white shadow-medium border border-transparent z-15 hover:scale-105 active:scale-95 transition-transform"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        )}

        {/* BOTTOM INPUT TRAY PANEL */}
        <div className="border-t border-[var(--border-color)] px-4 py-4 glass-card sticky bottom-0 z-20">
          <div className="max-w-6xl mx-auto space-y-3">
            
            {/* Reply active quoted preview */}
            {replyTo && (
              <div className="flex items-center justify-between bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Reply className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <div>
                    <span className="font-bold text-[var(--text-primary)]">Replying to {replyTo.sender?.name || 'Partner'}</span>
                    <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">{replyTo.text || 'Media File'}</p>
                  </div>
                </div>
                <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-[var(--bg-secondary)] rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Editing active banner */}
            {editingMessage && (
              <div className="flex items-center justify-between bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <Edit className="w-3.5 h-3.5 text-[var(--color-primary)] animate-pulse" />
                  <span className="font-bold text-[var(--text-primary)]">Editing your message...</span>
                </div>
                <button 
                  onClick={() => {
                    setEditingMessage(null);
                    setInputText('');
                  }} 
                  className="p-1 hover:bg-[var(--bg-secondary)] rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Attachment preview in input tray */}
            {attachmentPreview && (
              <div className="flex items-center justify-between bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  {attachmentPreview.type === 'image' ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={attachmentPreview.mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : attachmentPreview.type === 'video' ? (
                    <div className="w-10 h-10 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center text-white flex-shrink-0">
                      <VideoIcon className="w-5 h-5 text-sky-400" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-[var(--color-primary)]" />
                    </div>
                  )}
                  <div className="truncate">
                    <p className="font-bold text-[var(--text-primary)] truncate">{attachmentPreview.fileName || 'Attachment ready'}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)] uppercase mt-0.5">{attachmentPreview.type} upload</p>
                  </div>
                </div>
                <button onClick={() => setAttachmentPreview(null)} className="p-1.5 hover:bg-[var(--bg-secondary)] rounded-full text-red-500">
                  <Trash className="w-4.5 h-4.5" />
                </button>
              </div>
            )}

            {/* Upload progress indicator spinner */}
            {uploadProgress && (
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-semibold justify-center py-1">
                <span className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                Encrypting file payload to Cloudinary...
              </div>
            )}

            {/* VOICE RECORDER OVERLAY TRAY */}
            {isRecording || recUrl ? (
              <div className="flex items-center justify-between bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-2xl px-4 py-2.5">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] flex-shrink-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-slate-400'}`} />
                    <span>{formatDuration(recDuration)}</span>
                  </div>

                  {isRecording ? (
                    <div className="flex-1 overflow-hidden flex justify-center">
                      <VoiceRecorderVisualizer stream={recStream} />
                    </div>
                  ) : (
                    <div className="flex-1 px-3">
                      <audio src={recUrl} controls className="h-8 max-w-xs w-full outline-none" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {isRecording ? (
                    <button 
                      onClick={stopRecording}
                      className="p-2.5 rounded-full bg-slate-900 text-white hover:bg-slate-800"
                      title="Stop recording"
                    >
                      <Square className="w-4.5 h-4.5 fill-current" />
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={deleteRecording}
                        className="p-2.5 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-500"
                        title="Delete recording"
                      >
                        <Trash className="w-4.5 h-4.5" />
                      </button>
                      <button 
                        onClick={sendVoiceNote}
                        className="p-2.5 rounded-full bg-[var(--color-primary)] text-white hover:opacity-90"
                        title="Send recording"
                      >
                        <Send className="w-4.5 h-4.5 fill-current" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* STANDARD TEXT ENTRY CONTAINER */
              <form onSubmit={editingMessage ? handleSaveEdit : handleSendMessage} className="flex items-center gap-3">
                <div className="flex-shrink-0 relative">
                  
                  {/* Attachment Clip Button */}
                  <button 
                    type="button"
                    onClick={() => setShowAttachmentsMenu(!showAttachmentsMenu)}
                    className="p-3 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-full transition-all"
                  >
                    <Paperclip className="w-5.5 h-5.5" />
                  </button>

                  {/* ATTACHMENT POPUP SELECTOR */}
                  <AnimatePresence>
                    {showAttachmentsMenu && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 15 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 15 }}
                        className="absolute bottom-14 left-0 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-2xl shadow-elevated z-35 min-w-[200px] flex flex-col space-y-1"
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileUpload} 
                          className="hidden" 
                        />
                        
                        <button 
                          type="button"
                          onClick={() => {
                            fileInputRef.current.accept = 'image/*';
                            fileInputRef.current.click();
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-xl font-semibold"
                        >
                          <ImageIcon className="w-5 h-5 text-pink-500" /> Share Image
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            fileInputRef.current.accept = 'video/*';
                            fileInputRef.current.click();
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-xl font-semibold"
                        >
                          <VideoIcon className="w-5 h-5 text-sky-500" /> Share Video
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            fileInputRef.current.accept = '*/*';
                            fileInputRef.current.click();
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-xl font-semibold"
                        >
                          <FileText className="w-5 h-5 text-emerald-500" /> Document / PDF / Zip
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex-1 relative flex items-center">
                  <input 
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder={editingMessage ? "Edit message..." : "Write a sweet message..."}
                    className="w-full px-5 py-3.5 border border-[var(--border-color)] rounded-2xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] pr-12 font-medium"
                  />
                  <div className="absolute right-3">
                    <button 
                      type="button"
                      onClick={() => setInputText((prev) => prev + '💕')}
                      className="p-1 text-base hover:scale-125 transition-transform"
                      title="Heart emoji"
                    >
                      💕
                    </button>
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">
                  {!inputText.trim() && !attachmentPreview ? (
                    <button 
                      type="button"
                      onClick={startRecording}
                      className="p-3 bg-[var(--bg-tertiary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-50)] rounded-full transition-all"
                      title="Record Voice"
                    >
                      <Mic className="w-5.5 h-5.5" />
                    </button>
                  ) : (
                    <button 
                      type="submit"
                      className="p-3 bg.5 bg-[var(--color-primary)] hover:opacity-90 text-white rounded-full transition-all shadow-md flex items-center justify-center"
                      title="Send message"
                    >
                      <Send className="w-5 h-5 fill-current" />
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
