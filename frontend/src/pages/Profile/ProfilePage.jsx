import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Mail, 
  Calendar, 
  Trash2, 
  AlertTriangle, 
  ShieldCheck, 
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import relationshipService from '@/services/relationshipService';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { addToast } = useUIStore();

  const [loading, setLoading] = useState(true);
  const [relationship, setRelationship] = useState(null);
  const [partner, setPartner] = useState(null);
  const [paired, setPaired] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Fetch connection status
  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await relationshipService.getStatus();
      const statusData = response.data;
      if (statusData && statusData.paired) {
        setRelationship(statusData.relationship);
        setPartner(statusData.partner);
        setPaired(true);
        updateUser({ relationship: statusData.relationship._id });
      } else {
        setRelationship(null);
        setPartner(null);
        setPaired(false);
        updateUser({ relationship: null });
      }
    } catch (error) {
      console.error('Error fetching connection status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await relationshipService.disconnect();
      addToast({
        type: 'success',
        title: 'Space Disconnected',
        message: 'Successfully disconnected. Your space has been reset.',
      });
      // Update local state
      setPaired(false);
      setRelationship(null);
      setPartner(null);
      updateUser({ relationship: null });
      setConfirmDisconnect(false);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to disconnect.',
      });
    } finally {
      setDisconnecting(false);
    }
  };

  const getDaysTogether = () => {
    if (!relationship) return 1;
    const anniversary = relationship.anniversary ? new Date(relationship.anniversary) : new Date(relationship.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - anniversary);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStartDateFormatted = () => {
    if (!relationship) return '';
    const date = relationship.anniversary ? new Date(relationship.anniversary) : new Date(relationship.createdAt);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <PageWrapper>
      <Container size="md" className="py-6 md:py-10">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-display-md font-bold tracking-tight text-[var(--text-primary)]">
                Shared Space Settings
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">
                Manage your connection, anniversary details, and partner settings.
              </p>
            </div>
            {paired ? (
              <Badge variant="primary" size="lg" className="flex items-center gap-1">
                Connected 💕
              </Badge>
            ) : (
              <Badge variant="secondary" size="lg" className="flex items-center gap-1">
                Single Space
              </Badge>
            )}
          </div>

          {paired ? (
            <div className="space-y-6">
              {/* Couple Connection Overview Card */}
              <Card hover={false} className="p-6 md:p-8 relative overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,77,136,0.3) 0%, transparent 80%)`
                  }}
                />

                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                  {/* Left Side: You */}
                  <div className="flex flex-col items-center text-center space-y-3 w-full md:w-1/3">
                    <Avatar name={user?.name || 'You'} src={user?.avatar} size="xl" className="ring-4 ring-[var(--color-primary-100)] shadow-lg" />
                    <div>
                      <h4 className="font-bold text-lg text-[var(--text-primary)]">{user?.name}</h4>
                      <p className="text-xs text-[var(--text-tertiary)] flex items-center justify-center gap-1">
                        <UserIcon className="w-3 h-3" /> You
                      </p>
                    </div>
                  </div>

                  {/* Middle Connection Status */}
                  <div className="flex flex-col items-center justify-center space-y-2 w-full md:w-1/3">
                    <div className="flex items-center gap-3">
                      <div className="h-0.5 w-10 bg-gradient-to-r from-transparent to-[var(--color-primary)] opacity-50 hidden md:block" />
                      <motion.div
                        animate={{ scale: [1, 1.12, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-12 h-12 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center text-xl text-[var(--color-primary)] shadow-md"
                      >
                        ❤
                      </motion.div>
                      <div className="h-0.5 w-10 bg-gradient-to-l from-transparent to-[var(--color-primary)] opacity-50 hidden md:block" />
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-extrabold text-[var(--text-primary)]">Day {getDaysTogether()} Together</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">Since {getStartDateFormatted()}</div>
                    </div>
                  </div>

                  {/* Right Side: Partner */}
                  <div className="flex flex-col items-center text-center space-y-3 w-full md:w-1/3">
                    <Avatar name={partner?.name || 'Partner'} src={partner?.avatar} size="xl" className="ring-4 ring-[var(--color-primary-100)] shadow-lg" />
                    <div>
                      <h4 className="font-bold text-lg text-[var(--text-primary)]">{partner?.name}</h4>
                      <p className="text-xs text-[var(--text-tertiary)] flex items-center justify-center gap-1">
                        <Mail className="w-3 h-3" /> {partner?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Partner Details Card */}
              <Card hover={false} className="p-6 space-y-4">
                <h3 className="font-display font-bold text-lg text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
                  <ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" /> Partner Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)]">
                    <div className="text-xs font-semibold text-[var(--text-tertiary)] uppercase">Partner Name</div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">{partner?.name}</div>
                  </div>
                  <div className="space-y-1 p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)]">
                    <div className="text-xs font-semibold text-[var(--text-tertiary)] uppercase">Username</div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">@{partner?.username || 'partner'}</div>
                  </div>
                  <div className="space-y-1 p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)]">
                    <div className="text-xs font-semibold text-[var(--text-tertiary)] uppercase">Email Address</div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">{partner?.email}</div>
                  </div>
                  <div className="space-y-1 p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)]">
                    <div className="text-xs font-semibold text-[var(--text-tertiary)] uppercase">Connection Date</div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">{getStartDateFormatted()}</div>
                  </div>
                </div>
              </Card>

              {/* Danger Zone */}
              <Card hover={false} className="p-6 border border-red-500/30 dark:border-red-500/20 bg-red-50/5 dark:bg-red-950/5 space-y-6">
                <h3 className="font-display font-bold text-lg text-red-500 flex items-center gap-2 border-b border-red-500/10 pb-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" /> Danger Zone
                </h3>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-lg">
                    <div className="text-sm font-bold text-[var(--text-primary)]">Disconnect Shared Space</div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Disconnecting will immediately terminate your shared space session, delete all custom calendar lists, wishlists, and unpair both user accounts permanently.
                    </p>
                  </div>
                  <Button
                    onClick={() => setConfirmDisconnect(true)}
                    variant="danger"
                    className="flex-shrink-0 !rounded-xl"
                  >
                    Disconnect Space
                  </Button>
                </div>

                {/* Disconnect Modal/State via AnimatePresence */}
                <AnimatePresence>
                  {confirmDisconnect && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 mt-2 border border-red-500/20 bg-red-500/5 rounded-xl space-y-4">
                        <div className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Trash2 className="w-3.5 h-3.5" /> Action requires verification
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Are you absolutely sure you want to end this pairing? You and your partner will be disconnected immediately and returned to the onboarding pairing view. All shared records will be deleted.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleDisconnect}
                            loading={disconnecting}
                            variant="danger"
                            size="sm"
                            className="!px-4 !py-2 text-xs !rounded-lg"
                          >
                            Yes, Disconnect
                          </Button>
                          <Button
                            onClick={() => setConfirmDisconnect(false)}
                            variant="secondary"
                            size="sm"
                            className="!px-4 !py-2 text-xs !rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)]"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </div>
          ) : (
            /* Unpaired Profile View */
            <Card hover={false} className="p-8 text-center space-y-5 max-w-xl mx-auto mt-8">
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center mx-auto text-[var(--color-primary)]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-[var(--text-primary)]">No Partner Connected</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
                You are currently running in single onboarding mode. Connect with your partner to customize and view shared space profile settings.
              </p>
              <Button
                to="/dashboard"
                variant="primary"
                className="mt-2 inline-flex !rounded-xl"
              >
                Go to Dashboard
              </Button>
            </Card>
          )}
        </div>
      </Container>
    </PageWrapper>
  );
}
