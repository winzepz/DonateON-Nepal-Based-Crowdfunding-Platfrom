import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import {
  Bell, CheckCheck, CheckCircle, AlertTriangle,
  Award, Megaphone, Heart, ArrowRight, Loader2
} from 'lucide-react';
import { TableSkeleton } from '../components/Skeleton';

interface Notification {
  id: string;
  type: string;
  message: string;
  link?: string;
  read_status: boolean;
  created_at: string;
}

const typeIcon = (type: string) => {
  switch (type) {
    case 'KYC_APPROVED': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    case 'KYC_REJECTED': return <AlertTriangle className="h-5 w-5 text-rose-500" />;
    case 'CAMPAIGN_APPROVED': return <Megaphone className="h-5 w-5 text-blue-500" />;
    case 'CAMPAIGN_REJECTED': return <AlertTriangle className="h-5 w-5 text-rose-500" />;
    case 'DONATION_SUCCESS': return <Heart className="h-5 w-5 text-rose-500" />;
    case 'DONATION_RECEIVED': return <Heart className="h-5 w-5 text-emerald-500" />;
    case 'BADGE_EARNED': return <Award className="h-5 w-5 text-purple-500" />;
    default: return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const typeColor = (type: string) => {
  switch (type) {
    case 'KYC_APPROVED':
    case 'CAMPAIGN_APPROVED':
    case 'DONATION_SUCCESS':
    case 'DONATION_RECEIVED':
      return 'border-emerald-500/10 bg-emerald-500/5';
    case 'KYC_REJECTED':
    case 'CAMPAIGN_REJECTED':
      return 'border-rose-500/10 bg-rose-500/5';
    case 'BADGE_EARNED':
      return 'border-purple-500/10 bg-purple-500/5';
    default:
      return 'border-white/5 bg-white/5';
  }
};

const Notifications = () => {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.notifications || res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_status: true } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await axios.put(`${API_BASE_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read_status: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    } finally {
      setMarkingAll(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 space-y-8">
        <div className="h-20 w-20 bg-white/5 rounded-[2rem] flex items-center justify-center">
            <Bell className="h-10 w-10 text-gray-700" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-white tracking-tight">Access Restricted</h2>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-none">Authentication Required</p>
        </div>
        <Link to="/login" className="btn-premium px-10">Sign In to Continue</Link>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read_status).length;

  return (
    <div className="min-h-screen pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <Bell className="h-3 w-3 text-indigo-400" />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Alert System</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Inbox
              {unreadCount > 0 && (
                <span className="ml-4 text-primary opacity-50 text-2xl font-black font-mono">/ {unreadCount}</span>
              )}
            </h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={markingAll}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
            >
              {markingAll ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <CheckCheck className="h-4 w-4 text-primary" />}
              Clear all
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="space-y-4">
          {loading ? (
            <TableSkeleton rows={6} />
          ) : notifications.length === 0 ? (
            <div className="glass-card rounded-[3rem] py-32 text-center space-y-6">
              <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                <Bell className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-black text-white tracking-tight">Silence is Golden</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">No notifications found</p>
              </div>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`group flex items-start gap-5 p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer
                  ${notif.read_status ? 'bg-transparent border-white/5 opacity-40 hover:opacity-70' : `${typeColor(notif.type)} border-transparent hover:scale-[1.01]`}`}
                onClick={() => !notif.read_status && markAsRead(notif.id)}
              >
                <div className={`flex-shrink-0 h-14 w-14 rounded-2xl flex items-center justify-center transition-colors
                  ${notif.read_status ? 'bg-white/5 border border-white/5' : 'bg-dark border border-white/10 shadow-xl'}`}>
                  {typeIcon(notif.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className={`text-sm leading-relaxed ${notif.read_status ? 'text-gray-400 font-medium' : 'text-white font-black tracking-tight'}`}>
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] pt-1">
                    {new Date(notif.created_at).toLocaleString('en-NP', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                {!notif.read_status && (
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                )}
                {notif.link && (
                    <Link
                        to={notif.link}
                        onClick={e => e.stopPropagation()}
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors mt-1"
                    >
                        <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-primary transition-colors" />
                    </Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
