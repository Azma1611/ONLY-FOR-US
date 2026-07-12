import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Copy, 
  Check, 
  UserPlus, 
  Link2, 
  Calendar, 
  BookOpen, 
  Image, 
  Sparkles, 
  Activity, 
  Clock, 
  ShieldAlert
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import relationshipService from '@/services/relationshipService';
import { Link } from 'react-router';
import chatService from '@/services/chatService';
import useSocketStore from '@/store/socketStore';
import useTodoStore from '@/store/todoStore';
import useCalendarStore from '@/store/calendarStore';
import usePlannerStore from '@/store/plannerStore';

export default function DashboardPage() {
  const { user, updateUser } = useAuthStore();
  const { addToast } = useUIStore();

  const [loading, setLoading] = useState(true);
  const [paired, setPaired] = useState(false);
  const [relationship, setRelationship] = useState(null);
  const [partner, setPartner] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const partnerOnline = useSocketStore((state) => state.partnerOnline);

  const { tasks, fetchTasks, shoppingItems, fetchShoppingItems } = useTodoStore();
  const { events, fetchEvents } = useCalendarStore();
  const { travelPlans, fetchTravelPlans } = usePlannerStore();

  useEffect(() => {
    if (paired) {
      const fetchLastMsg = async () => {
        try {
          const response = await chatService.getMessages({ limit: 1 });
          if (response.data?.messages && response.data.messages.length > 0) {
            setLastMessage(response.data.messages[0]);
          }
        } catch (err) {
          console.error('Error fetching last message for dashboard:', err);
        }
      };
      fetchLastMsg();
      fetchTasks();
      fetchShoppingItems();
      fetchEvents();
      fetchTravelPlans();
    }
  }, [paired]);

  const getNextAnniversaryCountdown = () => {
    if (!relationship) return '';
    const anniversary = relationship.anniversary ? new Date(relationship.anniversary) : new Date(relationship.createdAt);
    const today = new Date();
    
    let nextAnniv = new Date(today.getFullYear(), anniversary.getMonth(), anniversary.getDate());
    if (nextAnniv < today) {
      nextAnniv.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = nextAnniv - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days left! 💕`;
  };

  // Pairing actions state
  const [inviteCode, setInviteCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [partnerCodeInput, setPartnerCodeInput] = useState('');
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [joiningRelationship, setJoiningRelationship] = useState(false);
  const [copied, setCopied] = useState(false);

  const pollIntervalRef = useRef(null);

  // Fetch initial relationship status
  const fetchRelationshipStatus = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await relationshipService.getStatus();
      const statusData = response.data;
      if (statusData && statusData.paired) {
        setPaired(true);
        setRelationship(statusData.relationship);
        setPartner(statusData.partner);
        // Sync relationship state into authStore user object
        updateUser({ relationship: statusData.relationship._id });
        
        // Clear pairing polling if we are now paired
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      } else {
        setPaired(false);
        setRelationship(null);
        setPartner(null);
        updateUser({ relationship: null });
        
        // Fetch generated invite code if any
        const inviteResponse = await relationshipService.getInvite();
        const inviteData = inviteResponse.data;
        if (inviteData && inviteData.invite) {
          setInviteCode(inviteData.invite.code);
          setExpiresAt(inviteData.invite.expiresAt);
          // Start polling if we have a generated invite
          startPairingPoll();
        }
      }
    } catch (error) {
      console.error('Error fetching relationship status:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Start polling to detect when partner joins
  const startPairingPoll = () => {
    if (pollIntervalRef.current) return;
    pollIntervalRef.current = setInterval(() => {
      fetchRelationshipStatus(false);
    }, 5000); // Check every 5 seconds
  };

  useEffect(() => {
    fetchRelationshipStatus(true);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate invite code
  const handleGenerateInvite = async () => {
    setGeneratingInvite(true);
    try {
      const response = await relationshipService.createInvite();
      const inviteData = response.data;
      setInviteCode(inviteData.invite.code);
      setExpiresAt(inviteData.invite.expiresAt);
      addToast({
        type: 'success',
        title: 'Invite code ready!',
        message: 'Share it with your partner to connect.',
      });
      // Start polling for pairing detection
      startPairingPoll();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to generate code.',
      });
    } finally {
      setGeneratingInvite(false);
    }
  };

  // Regenerate invite code
  const handleRegenerateInvite = async () => {
    setGeneratingInvite(true);
    try {
      const response = await relationshipService.regenerateInvite();
      const inviteData = response.data;
      setInviteCode(inviteData.invite.code);
      setExpiresAt(inviteData.invite.expiresAt);
      addToast({
        type: 'success',
        title: 'New invite code ready!',
        message: 'The old code is now invalid. Share this new code.',
      });
      // Restart polling
      startPairingPoll();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to regenerate code.',
      });
    } finally {
      setGeneratingInvite(false);
    }
  };

  // Connect using partner's code
  const handleJoinRelationship = async (e) => {
    e.preventDefault();
    if (!partnerCodeInput.trim()) return;

    setJoiningRelationship(true);
    try {
      const response = await relationshipService.joinRelationship(partnerCodeInput.trim());
      const joinData = response.data;
      addToast({
        type: 'success',
        title: 'Successfully paired! 💕',
        message: response.message || 'Welcome to your shared workspace.',
      });
      setPaired(true);
      setRelationship(joinData.relationship);
      setPartner(joinData.partner);
      updateUser({ relationship: joinData.relationship._id });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Pairing failed',
        message: error.response?.data?.message || 'Invalid or expired code.',
      });
    } finally {
      setJoiningRelationship(false);
    }
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    addToast({
      type: 'info',
      title: 'Copied to clipboard',
      message: 'Paste and send it to your partner!',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Share invite code
  const handleShareCode = () => {
    if (!inviteCode) return;
    if (navigator.share) {
      navigator.share({
        title: 'Connect on Only For Us',
        text: `Let's connect our spaces on Only For Us. Here is my unique invite code: ${inviteCode}`,
        url: window.location.origin
      }).catch(err => console.error(err));
    } else {
      handleCopyCode();
    }
  };

  // Calculations for Paired user Dashboard
  const getDaysTogether = () => {
    if (!relationship) return 1;
    const anniversary = relationship.anniversary ? new Date(relationship.anniversary) : new Date(relationship.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - anniversary);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPairedDateFormatted = () => {
    if (!relationship) return '';
    const date = relationship.connectedAt ? new Date(relationship.connectedAt) : new Date(relationship.createdAt);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getAnniversaryFormatted = () => {
    if (!relationship) return '';
    const date = relationship.anniversary ? new Date(relationship.anniversary) : new Date(relationship.createdAt);
    return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  };

  const getExpiryFormatted = () => {
    if (!expiresAt) return '';
    const date = new Date(expiresAt);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <PageWrapper>
      <Container size="lg" className="py-6 md:py-10">
        <AnimatePresence mode="wait">
          {!paired ? (
            /* ===================================================================
               PAIRING & ONBOARDING STATE
               =================================================================== */
            <motion.div
              key="pairing-onboarding"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              {/* Onboarding Header */}
              <div className="text-center space-y-4 max-w-xl mx-auto">
                <motion.div
                  className="w-16 h-16 rounded-3xl bg-[var(--color-primary-50)] dark:bg-pink-950/20 flex items-center justify-center mx-auto"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <Heart className="w-8 h-8 text-[var(--color-primary)] fill-[var(--color-primary)]" />
                </motion.div>
                <h1 className="text-display-lg font-bold tracking-[-0.02em] text-[var(--text-primary)]">
                  Connect with your Partner
                </h1>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                  Only For Us is designed for two. To unlock your shared world, invite your partner or enter their invite code.
                </p>
              </div>

              {/* Two-Column Pairing Layout */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Column 1: Invite Partner */}
                <Card hover={false} className="p-6 md:p-8 flex flex-col justify-between border border-[var(--border-color)]">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-50)] dark:bg-pink-950/30 flex items-center justify-center text-[var(--color-primary)]">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-[var(--text-primary)]">
                      Option A: Invite Partner
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      Generate a secure invite code and send it to your partner. We'll automatically pair you when they enter it.
                    </p>
                  </div>

                  <div className="mt-8 space-y-4">
                    {inviteCode ? (
                      <div className="space-y-3">
                        <label className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                          Your Invite Code
                        </label>
                        <div className="flex gap-2">
                          <div className="flex-1 glass-input font-mono text-center font-bold tracking-wider text-base py-3 select-all uppercase rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-primary)]">
                            {inviteCode}
                          </div>
                          <Button
                            onClick={handleCopyCode}
                            variant="secondary"
                            className="p-3 aspect-square !rounded-xl flex items-center justify-center flex-shrink-0 border border-[var(--border-color)] bg-[var(--bg-tertiary)]"
                            title="Copy code"
                          >
                            {copied ? <Check className="w-5 h-5 text-[var(--color-success)]" /> : <Copy className="w-5 h-5" />}
                          </Button>
                        </div>
                        
                        {expiresAt && (
                          <div className="text-[11px] text-[var(--text-tertiary)] text-center">
                            Expires on {getExpiryFormatted()}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={handleRegenerateInvite}
                            loading={generatingInvite}
                            variant="secondary"
                            size="sm"
                            className="flex-1 text-xs !rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]"
                          >
                            Regenerate Code
                          </Button>
                          <Button
                            onClick={handleShareCode}
                            variant="secondary"
                            size="sm"
                            className="flex-1 text-xs !rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]"
                          >
                            Share Code
                          </Button>
                        </div>

                        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border-color)]/50">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                          </span>
                          Waiting for partner to connect...
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={handleGenerateInvite}
                        loading={generatingInvite}
                        size="lg"
                        className="w-full !rounded-xl"
                      >
                        Generate Invite Code
                      </Button>
                    )}
                  </div>
                </Card>

                {/* Column 2: Enter Partner's Code */}
                <Card hover={false} className="p-6 md:p-8 flex flex-col justify-between border border-[var(--border-color)]">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center text-violet-500">
                      <Link2 className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-[var(--text-primary)]">
                      Option B: Join Partner
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      If your partner has already generated an invite code, enter it below to join their shared workspace immediately.
                    </p>
                  </div>

                  <form onSubmit={handleJoinRelationship} className="mt-8 space-y-4">
                    <div className="space-y-3">
                      <Input
                        label="Invite Code (e.g. OFU-XXXX-XXXX)"
                        placeholder="Enter code"
                        value={partnerCodeInput}
                        onChange={(e) => setPartnerCodeInput(e.target.value)}
                        className="text-center font-mono tracking-wider font-semibold uppercase"
                        disabled={joiningRelationship}
                      />
                    </div>
                    <Button
                      type="submit"
                      loading={joiningRelationship}
                      size="lg"
                      variant="secondary"
                      className="w-full !rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)]"
                    >
                      Connect
                    </Button>
                  </form>
                </Card>
              </div>
            </motion.div>
          ) : (
            /* ===================================================================
               ACTIVE PAIRED DASHBOARD STATE
               =================================================================== */
            <motion.div
              key="paired-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Visual Pairing Top Header */}
              <div className="relative glass-card p-6 md:p-8 overflow-hidden rounded-2xl border border-[var(--border-color)]">
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,77,136,0.3) 0%, transparent 80%)`
                  }}
                />
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  {/* Left - Users pairing animation */}
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-4 relative">
                      <div className="relative z-10 ring-4 ring-[var(--bg-secondary)] rounded-full">
                        <Avatar name={user?.name || 'User'} src={user?.avatar} size="lg" className="shadow-lg border-2 border-white/10" />
                      </div>
                      <div className="relative z-25 ring-4 ring-[var(--bg-secondary)] rounded-full">
                        <Avatar name={partner?.name || 'Partner'} src={partner?.avatar} size="lg" className="shadow-lg border-2 border-white/10" />
                      </div>
                      <motion.div 
                        className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 bg-white dark:bg-slate-900 shadow-md p-1 rounded-full text-xs"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        💕
                      </motion.div>
                    </div>

                    <div className="text-center md:text-left space-y-1">
                      <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight text-[var(--text-primary)]">
                        Welcome back, {user?.name}!
                      </h1>
                      <p className="text-xs text-[var(--text-secondary)] font-medium flex items-center justify-center md:justify-start gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                        Connected with <strong className="text-[var(--text-primary)]">{partner?.name}</strong> since {getPairedDateFormatted()}
                      </p>
                    </div>
                  </div>

                  {/* Right - Days indicator */}
                  <div className="bg-[var(--color-primary-50)] dark:bg-pink-950/20 px-5 py-3 rounded-2xl border border-[var(--color-primary-100)] dark:border-pink-900/30 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-sm shadow-md animate-pulse">
                      ❤
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Love Counter</div>
                      <div className="text-lg font-bold text-[var(--text-primary)]">Day {getDaysTogether()} Together</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Dashboard Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Partner Profile Card */}
                <Card hover={false} className="p-6 space-y-4 border border-[var(--border-color)]">
                  <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                    <h4 className="font-display font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
                      <Heart className="w-4.5 h-4.5 text-[var(--color-primary)]" />
                      Partner Status
                    </h4>
                    <Badge variant="primary" size="sm">Active</Badge>
                  </div>

                  <div className="flex items-center gap-3 py-2">
                    <Avatar name={partner?.name || 'Partner'} src={partner?.avatar} size="md" />
                    <div>
                      <div className="text-base font-bold text-[var(--text-primary)]">{partner?.name}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">{partner?.email}</div>
                    </div>
                  </div>

                  <div className="bg-[var(--bg-tertiary)] p-3 rounded-xl text-xs text-[var(--text-secondary)] leading-relaxed border border-[var(--border-color)]">
                    <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                      ✓ Connected • anniversary {getAnniversaryFormatted()}
                    </span>
                  </div>
                </Card>

                          {/* 2. Quick Stats Grid */}
                <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {/* Vacation Plans */}
                  <Link 
                    to="/planner"
                    className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl space-y-2 flex flex-col justify-between shadow-sm cursor-pointer hover:translate-y-[-4px] transition-transform"
                  >
                    <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-950/20 text-pink-500 flex items-center justify-center font-bold">
                      ✈️
                    </div>
                    <div>
                      <div className="text-2xl font-black text-[var(--text-primary)]">{travelPlans.length}</div>
                      <div className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Vacation Plans</div>
                    </div>
                  </Link>

                  {/* Pending Tasks */}
                  <Link 
                    to="/planner"
                    className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl space-y-2 flex flex-col justify-between shadow-sm cursor-pointer hover:translate-y-[-4px] transition-transform"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center font-bold">
                      🎯
                    </div>
                    <div>
                      <div className="text-2xl font-black text-[var(--text-primary)]">
                        {tasks.filter(t => !t.completed).length}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Pending Tasks</div>
                    </div>
                  </Link>

                  {/* Shopping List */}
                  <Link 
                    to="/planner"
                    className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl space-y-2 flex flex-col justify-between shadow-sm cursor-pointer hover:translate-y-[-4px] transition-transform col-span-2 sm:col-span-1"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center font-bold">
                      🛒
                    </div>
                    <div>
                      <div className="text-2xl font-black text-[var(--text-primary)]">
                        ${shoppingItems.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Shopping Est.</div>
                    </div>
                  </Link>
                </div>

              </div>

              {/* 3. Detailed Modules Placeholders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Live Chat Drawer Box */}
                <Card hover={false} className="p-6 space-y-4 border border-[var(--border-color)] flex flex-col justify-between">
                  <div>
                    <h4 className="font-display font-bold text-base text-[var(--text-primary)] flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                      <span className="flex items-center gap-2">💬 Live Chat Room</span>
                      {partner && (
                        <span className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                          <span className={`w-2 h-2 rounded-full ${partnerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                          {partnerOnline ? 'Online' : 'Offline'}
                        </span>
                      )}
                    </h4>
                    
                    <div className="mt-4 p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] min-h-[90px] flex flex-col justify-center">
                      {lastMessage ? (
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-[var(--text-secondary)]">
                            {lastMessage.sender?.name || (lastMessage.sender === user?._id ? 'You' : partner?.name)}
                          </p>
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {lastMessage.isDeleted ? (
                              <span className="italic opacity-60">This message was deleted.</span>
                            ) : lastMessage.type === 'text' ? (
                              lastMessage.text
                            ) : (
                              `Sent a ${lastMessage.type}`
                            )}
                          </p>
                          <p className="text-[10px] text-[var(--text-tertiary)]">
                            {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center opacity-70">
                          <p className="text-xs font-semibold text-[var(--text-secondary)]">No messages yet</p>
                          <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Send a sweet message to spark the conversation!</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Link 
                    to="/chat" 
                    className="mt-4 w-full py-2.5 px-4 rounded-xl bg-[var(--color-primary)] hover:opacity-90 text-white font-semibold text-center text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    Open Chat Room
                  </Link>
                </Card>

                {/* Upcoming Anniversary Calendar List */}
                <Card hover={false} className="p-6 space-y-4 border border-[var(--border-color)] flex flex-col justify-between">
                  <div>
                    <h4 className="font-display font-bold text-base text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-color)] pb-3 justify-between">
                      <span className="flex items-center gap-2">📅 Shared Planner & Events</span>
                      <span className="text-xs text-[var(--color-primary)] font-bold">{getNextAnniversaryCountdown()}</span>
                    </h4>
                    
                    <div className="mt-4 space-y-2">
                      {events.filter(e => new Date(e.startDate) >= new Date()).slice(0, 3).length > 0 ? (
                        events.filter(e => new Date(e.startDate) >= new Date()).slice(0, 3).map((e) => (
                          <div key={e._id} className="flex justify-between items-center text-xs p-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)]/40 rounded-xl font-medium">
                            <div>
                              <p className="font-bold text-[var(--text-primary)]">{e.title}</p>
                              <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase mt-0.5">{e.category}</p>
                            </div>
                            <span className="text-[10px] text-[var(--text-tertiary)] font-bold">{new Date(e.startDate).toLocaleDateString()}</span>
                          </div>
                        ))
                      ) : (
                        <div className="h-28 bg-[var(--bg-tertiary)] border border-dashed border-[var(--border-color)] rounded-xl flex flex-col items-center justify-center p-4 text-center opacity-75">
                          <p className="text-xs font-semibold text-[var(--text-secondary)]">No upcoming events scheduled</p>
                          <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Anniversaries and date nights will appear here.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2.5 mt-4 pt-3 border-t border-[var(--border-color)]/50">
                    <Link to="/calendar" className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary)] hover:bg-[var(--color-primary-100)] text-center text-xs font-bold transition-all shadow-sm">
                      Open Calendar
                    </Link>
                    <Link to="/planner" className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 text-center text-xs font-bold transition-all shadow-sm">
                      Open Planners
                    </Link>
                  </div>
                </Card>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </PageWrapper>
  );
}
