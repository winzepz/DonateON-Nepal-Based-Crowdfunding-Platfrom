import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import {
  LifeBuoy, Send, MessageCircle, ChevronDown, ChevronUp,
  Clock, CheckCircle, AlertCircle, Loader2, Plus, X
} from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  message: string;
  sender_name: string;
  sender_role: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  OPEN: { label: 'Open', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: <AlertCircle className="h-3.5 w-3.5" /> },
  IN_PROGRESS: { label: 'In Progress', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: <Clock className="h-3.5 w-3.5" /> },
  RESOLVED: { label: 'Resolved', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  CLOSED: { label: 'Closed', color: 'text-gray-500 bg-gray-50 border-gray-200', icon: <X className="h-3.5 w-3.5" /> },
};

const Support = () => {
  const { token, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTickets = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/support`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError('Subject and description are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await axios.post(`${API_BASE_URL}/support`, { subject, description }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Support ticket submitted! Our team will get back to you soon.');
      setSubject('');
      setDescription('');
      setShowForm(false);
      fetchTickets();
    } catch {
      setError('Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const loadMessages = async (ticketId: string) => {
    if (messages[ticketId]) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/support/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => ({ ...prev, [ticketId]: res.data.messages || [] }));
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  const toggleTicket = (id: string) => {
    if (expandedTicket === id) {
      setExpandedTicket(null);
    } else {
      setExpandedTicket(id);
      loadMessages(id);
    }
  };

  const sendReply = async (ticketId: string) => {
    const msg = replyText[ticketId]?.trim();
    if (!msg) return;
    setSendingReply(ticketId);
    try {
      await axios.post(`${API_BASE_URL}/support/${ticketId}/reply`, { message: msg }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => ({
        ...prev,
        [ticketId]: [
          ...(prev[ticketId] || []),
          {
            id: Date.now().toString(),
            message: msg,
            sender_name: 'You',
            sender_role: 'USER',
            created_at: new Date().toISOString()
          }
        ]
      }));
      setReplyText(prev => ({ ...prev, [ticketId]: '' }));
    } catch (err) {
      console.error('Failed to send reply', err);
    } finally {
      setSendingReply(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <LifeBuoy className="h-12 w-12 text-gray-200 mx-auto" />
          <h2 className="text-xl font-black text-gray-900">Please log in to access support</h2>
          <Link to="/login" className="btn-premium inline-flex">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full  -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-50 rounded-full  -ml-36 -mb-36 pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest">
              <LifeBuoy className="h-3 w-3" />
              Support
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Help Center</h1>
            <p className="text-gray-500 font-medium">We're here to help. Open a ticket and we'll respond shortly.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-700 transition-all shadow-lg"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? 'Cancel' : 'New Ticket'}
          </button>
        </div>

        {/* Success / Error Banner */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-emerald-700">{success}</p>
            <button onClick={() => setSuccess('')} className="ml-auto text-emerald-500 hover:text-emerald-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* New Ticket Form */}
        {showForm && (
          <form
            onSubmit={submitTicket}
            className="glass-card rounded-3xl p-8 space-y-6 border-2 border-indigo-100 shadow-xl shadow-indigo-50"
          >
            <h2 className="text-xl font-black text-gray-900">Create New Ticket</h2>

            {error && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200">
                <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                <p className="text-sm font-semibold text-rose-700">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-black uppercase text-gray-400 tracking-wider">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Payment not received"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:border-indigo-300 focus:outline-none transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black uppercase text-gray-400 tracking-wider">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Please describe your issue in detail..."
                rows={5}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-semibold text-gray-900 focus:border-indigo-300 focus:outline-none transition-colors resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-gray-900 text-white font-black hover:bg-gray-700 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </form>
        )}

        {/* Tickets List */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-gray-900">Your Tickets</h2>

          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
            ))
          ) : tickets.length === 0 ? (
            <div className="glass-card rounded-3xl py-20 text-center space-y-4">
              <MessageCircle className="h-12 w-12 text-gray-200 mx-auto" />
              <p className="text-gray-400 font-bold">No tickets yet. Open one above!</p>
            </div>
          ) : (
            tickets.map((ticket) => {
              const status = statusConfig[ticket.status] || statusConfig.OPEN;
              const isExpanded = expandedTicket === ticket.id;

              return (
                <div key={ticket.id} className="glass-card rounded-2xl border border-gray-100 overflow-hidden">
                  {/* Ticket Header */}
                  <button
                    className="w-full flex items-center gap-4 p-5 hover:bg-gray-50/50 transition-colors text-left"
                    onClick={() => toggleTicket(ticket.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-gray-900 truncate">{ticket.subject}</p>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${status.color}`}>
                          {status.icon} {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-medium">
                        Opened {new Date(ticket.created_at).toLocaleDateString('en-NP', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />}
                  </button>

                  {/* Ticket Chat Area */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50/30">
                      {/* Original message */}
                      <div className="bg-dark rounded-xl p-4 border border-gray-100">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Your Issue</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{ticket.description}</p>
                      </div>

                      {/* Thread Messages */}
                      {(messages[ticket.id] || []).map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${msg.sender_role === 'ADMIN' ? '' : 'flex-row-reverse'}`}
                        >
                          <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black
                            ${msg.sender_role === 'ADMIN' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-600'}`}>
                            {msg.sender_role === 'ADMIN' ? 'S' : 'Y'}
                          </div>
                          <div className={`max-w-[75%] ${msg.sender_role === 'ADMIN' ? '' : 'items-end flex flex-col'}`}>
                            <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
                              ${msg.sender_role === 'ADMIN'
                                ? 'bg-dark border border-gray-100 text-gray-800'
                                : 'bg-gray-900 text-white'}`}>
                              {msg.message}
                            </div>
                            <p className="text-xs text-gray-400 mt-1 px-1">
                              {msg.sender_name} · {new Date(msg.created_at).toLocaleTimeString('en-NP', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Reply Box */}
                      {ticket.status !== 'CLOSED' && (
                        <div className="flex gap-3 pt-2">
                          <input
                            type="text"
                            value={replyText[ticket.id] || ''}
                            onChange={e => setReplyText(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && sendReply(ticket.id)}
                            placeholder="Type a reply..."
                            className="flex-1 bg-dark border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:border-indigo-300 focus:outline-none transition-colors"
                          />
                          <button
                            onClick={() => sendReply(ticket.id)}
                            disabled={sendingReply === ticket.id || !replyText[ticket.id]?.trim()}
                            className="h-12 w-12 rounded-xl bg-gray-900 text-white flex items-center justify-center hover:bg-gray-700 transition-all disabled:opacity-40 flex-shrink-0"
                          >
                            {sendingReply === ticket.id
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <Send className="h-4 w-4" />}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Support;
