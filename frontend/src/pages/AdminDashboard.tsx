import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Check, X, Shield, FileText, LayoutList, CreditCard, Download, BarChart2, DollarSign, TrendingUp, Search, LifeBuoy, MessageSquare, Send } from 'lucide-react';
import { API_BASE_URL } from '../config';

const AdminDashboard = () => {
    const { token, user } = useAuth();
    const [kycRequests, setKycRequests] = useState<any[]>([]);
    const [campaignRequests, setCampaignRequests] = useState<any[]>([]);
    const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [adminDonations, setAdminDonations] = useState<any[]>([]);
    const [supportTickets, setSupportTickets] = useState<any[]>([]);
    const [platformStats, setPlatformStats] = useState<any>(null);
    const [donationsTotal, setDonationsTotal] = useState(0);
    const [donationSearch, setDonationSearch] = useState('');
    const [summary, setSummary] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'kyc' | 'campaigns' | 'payouts' | 'donations' | 'stats' | 'logs' | 'support'>('kyc');
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [ticketMessages, setTicketMessages] = useState<any[]>([]);
    const [logFilter, setLogFilter] = useState<{ entityType?: string; entityId?: string }>({});

    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            // Fetch summary stats
            const summaryRes = await axios.get(`${API_BASE_URL}/stats/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSummary(summaryRes.data);

            if (activeTab === 'kyc') {
                const res = await axios.get(`${API_BASE_URL}/admin/kyc`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setKycRequests(res.data);
            } else if (activeTab === 'campaigns') {
                const res = await axios.get(`${API_BASE_URL}/admin/campaigns`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCampaignRequests(res.data);
            } else if (activeTab === 'payouts') {
                const res = await axios.get(`${API_BASE_URL}/payouts/all`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPayoutRequests(res.data);
            } else if (activeTab === 'logs') {
                let url = `${API_BASE_URL}/admin/audit-logs?`;
                if (logFilter.entityType) url += `entityType=${logFilter.entityType}&`;
                if (logFilter.entityId) url += `entityId=${logFilter.entityId}&`;
                const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
                setAuditLogs(res.data);
            } else if (activeTab === 'donations') {
                const res = await axios.get(`${API_BASE_URL}/admin/donations?limit=100`, { headers: { Authorization: `Bearer ${token}` } });
                setAdminDonations(res.data.data || []);
                setDonationsTotal(res.data.total || 0);
            } else if (activeTab === 'stats') {
                const res = await axios.get(`${API_BASE_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
                setPlatformStats(res.data);
            } else if (activeTab === 'support') {
                const res = await axios.get(`${API_BASE_URL}/admin/support`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSupportTickets(res.data.tickets || []);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token, activeTab, logFilter]);

    const handleAction = async (type: 'kyc' | 'campaigns', id: string, action: 'approve' | 'reject') => {
        try {
            await axios.post(`${API_BASE_URL}/admin/${type}/${id}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            console.error('Action error:', err);
            alert(`Failed to ${action} item.`);
        }
    };

    const fetchTicketMessages = async (ticketId: string) => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/admin/support/${ticketId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTicketMessages(res.data.messages || []);
        } catch (err) {
            console.error('Fetch messages error:', err);
        }
    };

    const handleSendReply = async () => {
        if (!token || !replyMessage.trim() || !selectedTicket) return;
        try {
            await axios.post(`${API_BASE_URL}/admin/support/${selectedTicket.id}/reply`, {
                message: replyMessage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReplyMessage('');
            fetchTicketMessages(selectedTicket.id);
        } catch (err) {
            console.error('Reply error:', err);
            alert('Failed to send reply');
        }
    };

    const updateTicketStatus = async (ticketId: string, status: string) => {
        if (!token) return;
        try {
            await axios.put(`${API_BASE_URL}/admin/support/${ticketId}/status`, {
                status
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
            if (selectedTicket?.id === ticketId) {
                setSelectedTicket({ ...selectedTicket, status });
            }
        } catch (err) {
            console.error('Status update error:', err);
            alert('Failed to update status');
        }
    };

    if (user?.role !== 'ADMIN') {
        return <div className="p-8 text-center text-red-600 font-bold">Access Denied</div>;
    }

    return (
        <div className="min-h-screen bg-[#09090B] text-white pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] -ml-64 -mt-64 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] -mr-64 -mb-64 pointer-events-none" />

            <div className="max-w-7xl mx-auto pt-16 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-2xl shadow-primary/10 border border-primary/20">
                                <Shield className="h-7 w-7" />
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white">Admin Command</h1>
                        </div>
                        <p className="text-gray-400 text-lg font-medium max-w-2xl leading-relaxed">Central oversight and governance center for the DonateOn ecosystem.</p>
                    </div>
                </div>

                {/* Summary Stats */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {[
                            { label: 'Total Users', value: summary.totalUsers, icon: TrendingUp, color: 'text-white' },
                            { label: 'Escrow Balance', value: `NRs ${summary.escrowBalance.toLocaleString()}`, icon: CreditCard, color: 'text-primary', sub: 'Donated - Released' },
                            { label: 'Active Inflow', value: `NRs ${summary.totalDonated.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400' },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card rounded-3xl p-8 border-white/5 bg-[#131316]/60 backdrop- shadow-xl group hover:border-primary/20 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{stat.label}</p>
                                    <stat.icon className={`h-5 w-5 ${stat.color} opacity-40`} />
                                </div>
                                <h3 className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</h3>
                                {stat.sub && <p className="mt-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">{stat.sub}</p>}
                            </div>
                        ))}
                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#131316]/60 backdrop- shadow-xl">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Pending Tasks</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black flex justify-between uppercase">KYC <span>{summary.pendingKYC}</span></div>
                                <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black flex justify-between uppercase">Payout <span>{summary.pendingPayouts}</span></div>
                                <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black flex justify-between uppercase">Tickets <span>{summary.pendingTickets}</span></div>
                                <div className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black flex justify-between uppercase">Campaign <span>{summary.pendingCampaigns}</span></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex flex-wrap gap-3 mb-10 p-2 bg-[#131316]/60 backdrop-blur-2xl rounded-[2rem] border border-white/5 shadow-2xl">
                    {[
                        { id: 'kyc', label: 'Identity', icon: Shield, count: summary?.pendingKYC },
                        { id: 'campaigns', label: 'Campaigns', icon: LayoutList, count: summary?.pendingCampaigns },
                        { id: 'payouts', label: 'Payouts', icon: CreditCard, count: summary?.pendingPayouts },
                        { id: 'donations', label: 'Ledger', icon: DollarSign },
                        { id: 'support', label: 'Care', icon: LifeBuoy, count: summary?.pendingTickets },
                        { id: 'stats', label: 'Deep Intel', icon: BarChart2 },
                        { id: 'logs', label: 'Audits', icon: FileText }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id
                                ? 'bg-primary text-black shadow-xl shadow-primary/20 scale-105'
                                : 'text-gray-500 hover:text-white hover:bg-dark/5'
                                }`}
                        >
                            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-black' : 'text-gray-500'}`} />
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={`flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5 text-[8px] font-black ${activeTab === tab.id ? 'bg-black text-primary' : 'bg-primary text-black'} ml-2`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center py-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {activeTab === 'kyc' && (
                            <div className="glass-card rounded-[2.5rem] p-10 border-white/5 bg-[#131316]/40 backdrop- shadow-xl">
                                {kycRequests.length === 0 ? (
                                    <div className="p-20 text-center text-gray-600 italic font-medium tracking-wide">Clean slate. All identities verified.</div>
                                ) : (
                                    <div className="overflow-x-auto -mx-10 sm:mx-0">
                                        <table className="w-full text-left border-separate border-spacing-y-4">
                                            <thead>
                                                <tr className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">
                                                    <th className="px-8 py-2">Entity</th>
                                                    <th className="px-8 py-2">Credential</th>
                                                    <th className="px-8 py-2">Entry Date</th>
                                                    <th className="px-8 py-2">Attachment</th>
                                                    <th className="px-8 py-2 text-right">Verdict</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {kycRequests.map((req) => (
                                                    <tr key={req.id} className="group hover:bg-dark/5 transition-all">
                                                        <td className="px-8 py-6 rounded-l-2xl">
                                                            <p className="font-black text-white text-lg tracking-tight leading-tight">{req.userName}</p>
                                                            <p className="text-xs text-gray-500 font-medium tracking-wide">{req.userEmail}</p>
                                                        </td>
                                                        <td className="px-8 py-6 text-sm font-black text-gray-400 capitalize">{req.documentType}</td>
                                                        <td className="px-8 py-6 text-sm font-bold text-gray-500">
                                                            {new Date(req.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <a href={req.imageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-dark/5 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-black rounded-xl transition-all">
                                                                <FileText className="h-3 w-3" /> Inspect
                                                            </a>
                                                        </td>
                                                        <td className="px-8 py-6 text-right rounded-r-2xl">
                                                            <div className="flex items-center justify-end gap-3">
                                                                <button onClick={() => handleAction('kyc', req.id, 'approve')} className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors" title="Approve"><Check className="h-5 w-5" /></button>
                                                                <button onClick={() => handleAction('kyc', req.id, 'reject')} className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors" title="Reject"><X className="h-5 w-5" /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'campaigns' && (
                            <div className="bg-dark rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {campaignRequests.length === 0 ? (
                                    <div className="p-12 text-center text-gray-500 italic">No pending campaign approvals.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-500 text-sm">
                                                <tr>
                                                    <th className="px-6 py-4 font-medium">Campaign</th>
                                                    <th className="px-6 py-4 font-medium">Organizer</th>
                                                    <th className="px-6 py-4 font-medium">Target</th>
                                                    <th className="px-6 py-4 font-medium">Review</th>
                                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {campaignRequests.map((req) => (
                                                    <tr key={req.id} className="hover:bg-gray-50/50">
                                                        <td className="px-6 py-4">
                                                            <p className="font-semibold text-gray-900">{req.title}</p>
                                                            <p className="text-sm text-gray-500 line-clamp-1">{req.description}</p>
                                                        </td>
                                                        <td className="px-6 py-4 font-medium text-gray-700 text-sm">{req.organizerName}</td>
                                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">NRs {req.targetAmount.toLocaleString()}</td>
                                                        <td className="px-6 py-4">
                                                            <a href={req.imageUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm font-medium">View Media</a>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setLogFilter({ entityType: 'CAMPAIGN', entityId: req.id });
                                                                        setActiveTab('logs');
                                                                    }}
                                                                    className="p-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                                                                    title="View Audit History"
                                                                >
                                                                    <FileText className="h-5 w-5" />
                                                                </button>
                                                                <button onClick={() => handleAction('campaigns', req.id, 'approve')} className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors" title="Approve"><Check className="h-5 w-5" /></button>
                                                                <button onClick={() => handleAction('campaigns', req.id, 'reject')} className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors" title="Reject"><X className="h-5 w-5" /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'payouts' && (
                            <div className="bg-dark rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {payoutRequests.length === 0 ? (
                                    <div className="p-12 text-center text-gray-500 italic">No pending payout requests.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-500 text-sm">
                                                <tr>
                                                    <th className="px-6 py-4 font-medium">Project & Organizer</th>
                                                    <th className="px-6 py-4 font-medium">Request</th>
                                                    <th className="px-6 py-4 font-medium">Bank Details</th>
                                                    <th className="px-6 py-4 font-medium">Status</th>
                                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {payoutRequests.map((req) => (
                                                    <tr key={req.id} className="hover:bg-gray-50/50">
                                                        <td className="px-6 py-4">
                                                            <p className="font-semibold text-gray-900 line-clamp-1">{req.campaignTitle}</p>
                                                            <p className="text-xs text-gray-500">{req.organizerName} ({req.organizerEmail})</p>
                                                        </td>
                                                        <td className="px-6 py-4 font-black text-gray-900 text-sm">NRs {parseFloat(req.amount).toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-xs font-medium">
                                                            <div className="text-gray-900">{req.bank_name}</div>
                                                            <div className="text-gray-600 underline">{req.account_number}</div>
                                                            <div className="text-gray-400 italic">{req.account_holder_name}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                {req.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {req.status === 'PENDING' && (
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={async () => {
                                                                            if (!confirm('Confirm payout approval? Funds will be marked as released.')) return;
                                                                            await axios.post(`${API_BASE_URL}/payouts/${req.id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
                                                                            fetchData();
                                                                        }}
                                                                        className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100"
                                                                    ><Check className="h-5 w-5" /></button>
                                                                    <button
                                                                        onClick={async () => {
                                                                            if (!confirm('Reject this payout?')) return;
                                                                            await axios.post(`${API_BASE_URL}/payouts/${req.id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
                                                                            fetchData();
                                                                        }}
                                                                        className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                                                                    ><X className="h-5 w-5" /></button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'support' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Ticket List */}
                                <div className="lg:col-span-1 bg-dark rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                                        <h3 className="font-bold text-gray-900">Support Tickets</h3>
                                    </div>
                                    <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                                        {supportTickets.length === 0 ? (
                                            <div className="p-12 text-center text-gray-500 italic">No support tickets.</div>
                                        ) : (
                                            supportTickets.map((ticket) => (
                                                <button
                                                    key={ticket.id}
                                                    onClick={() => {
                                                        setSelectedTicket(ticket);
                                                        fetchTicketMessages(ticket.id);
                                                    }}
                                                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-indigo-50/50 border-l-4 border-indigo-600' : ''}`}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-700' : ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                            {ticket.status}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">{new Date(ticket.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="font-bold text-gray-900 truncate">{ticket.subject}</p>
                                                    <p className="text-xs text-gray-500 truncate mt-1">From: {ticket.user_name}</p>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Ticket Details & Conversation */}
                                <div className="lg:col-span-2 space-y-4">
                                    {selectedTicket ? (
                                        <>
                                            <div className="bg-dark p-6 rounded-2xl shadow-sm border border-gray-100">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h2 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                                                        <p className="text-sm text-gray-500 mt-1">Ticket #{selectedTicket.id.slice(0, 8)} • Raised by {selectedTicket.user_name} ({selectedTicket.user_email})</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {selectedTicket.status !== 'RESOLVED' && (
                                                            <button onClick={() => updateTicketStatus(selectedTicket.id, 'RESOLVED')} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors">Mark Resolved</button>
                                                        )}
                                                        {selectedTicket.status !== 'CLOSED' && (
                                                            <button onClick={() => updateTicketStatus(selectedTicket.id, 'CLOSED')} className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">Close Ticket</button>
                                                        )}
                                                        {selectedTicket.status !== 'OPEN' && (
                                                            <button onClick={() => updateTicketStatus(selectedTicket.id, 'OPEN')} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">Reopen</button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-xl text-gray-700 text-sm whitespace-pre-wrap border border-gray-100 italic">
                                                    {selectedTicket.description}
                                                </div>
                                            </div>

                                            <div className="bg-dark p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
                                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><MessageSquare className="h-5 w-5 text-indigo-500" /> Conversation</h3>
                                                <div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-2">
                                                    {ticketMessages.map((msg) => (
                                                        <div key={msg.id} className={`flex flex-col ${msg.sender_role === 'ADMIN' ? 'items-end' : 'items-start'}`}>
                                                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender_role === 'ADMIN' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                                                                {msg.message}
                                                            </div>
                                                            <span className="text-[10px] text-gray-400 mt-1">{msg.sender_role === 'ADMIN' ? 'You' : msg.sender_name} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    ))}
                                                    {ticketMessages.length === 0 && <div className="text-center py-12 text-gray-400 italic">No replies yet.</div>}
                                                </div>
                                                {selectedTicket.status !== 'CLOSED' && (
                                                    <div className="relative mt-auto">
                                                        <input
                                                            type="text"
                                                            value={replyMessage}
                                                            onChange={(e) => setReplyMessage(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                                                            placeholder="Type your response..."
                                                            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                        />
                                                        <button
                                                            onClick={handleSendReply}
                                                            disabled={!replyMessage.trim()}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                                        >
                                                            <Send className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-dark p-24 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-400 italic">
                                            Select a ticket to view conversation details.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'logs' && (
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-dark p-6 rounded-[2rem] border border-white/5 shadow-xl">
                                    <div className="space-y-4 w-full sm:w-auto">
                                        <h3 className="font-black text-white text-xl tracking-tight">System Audit Trail</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { label: 'All Logs', value: {} },
                                                { label: 'Financial', value: { entityType: 'FINANCIAL' } },
                                                { label: 'KYC', value: { entityType: 'KYC' } },
                                                { label: 'Campaigns', value: { entityType: 'CAMPAIGN' } },
                                            ].map((f, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setLogFilter(f.value)}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${JSON.stringify(logFilter) === JSON.stringify(f.value)
                                                        ? 'bg-primary text-black'
                                                        : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                                                        }`}
                                                >
                                                    {f.label}
                                                </button>
                                            ))}
                                            {logFilter.entityId && (
                                                <button
                                                    onClick={() => setLogFilter({})}
                                                    className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                                >
                                                    Clear Filter: {logFilter.entityId.slice(0, 8)}... [X]
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            try {
                                                let url = `${API_BASE_URL}/admin/audit-logs/export?`;
                                                if (logFilter.entityType) url += `entityType=${logFilter.entityType}&`;
                                                if (logFilter.entityId) url += `entityId=${logFilter.entityId}&`;
                                                const res = await axios.get(url, {
                                                    headers: { Authorization: `Bearer ${token}` },
                                                    responseType: 'blob'
                                                });
                                                const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
                                                const link = document.createElement('a');
                                                link.href = blobUrl;
                                                link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
                                                document.body.appendChild(link);
                                                link.click();
                                                link.remove();
                                            } catch { alert('Export failed'); }
                                        }}
                                        className="flex items-center gap-3 px-8 py-3 bg-primary text-black rounded-2xl hover:bg-emerald-400 transition-all text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                                    >
                                        <Download className="h-4 w-4" />
                                        Secure Export (CSV)
                                    </button>
                                </div>
                                <div className="bg-dark rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-500 text-sm">
                                                <tr>
                                                    <th className="px-6 py-4 font-medium">Timestamp</th>
                                                    <th className="px-6 py-4 font-medium">Admin</th>
                                                    <th className="px-6 py-4 font-medium">Action</th>
                                                    <th className="px-6 py-4 font-medium">Entity</th>
                                                    <th className="px-6 py-4 font-medium">Details</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 italic text-[10px]">
                                                {auditLogs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-gray-50/50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                                                        <td className="px-6 py-4">
                                                            <p className="font-semibold text-gray-900">{log.adminName}</p>
                                                            <p className="text-gray-500 font-normal">{log.adminEmail}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-100 uppercase">{log.action}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600 font-bold uppercase">{log.entity_type}</td>
                                                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate font-normal">{log.details ? JSON.stringify(log.details) : '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                        )}

                        {activeTab === 'donations' && (
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap gap-3 items-center bg-dark p-4 rounded-xl border border-gray-100">
                                    <div className="relative flex-grow min-w-[200px]">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={donationSearch}
                                            onChange={e => setDonationSearch(e.target.value)}
                                            placeholder="Search by code, name, email..."
                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <button
                                        onClick={async () => {
                                            try {
                                                const url = `${API_BASE_URL}/admin/donations?search=${encodeURIComponent(donationSearch)}&limit=100`;
                                                const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
                                                setAdminDonations(res.data.data || []);
                                                setDonationsTotal(res.data.total || 0);
                                            } catch { alert('Search failed'); }
                                        }}
                                        className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700"
                                    >Search</button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                const res = await axios.get(`${API_BASE_URL}/admin/donations/export?search=${encodeURIComponent(donationSearch)}`, {
                                                    headers: { Authorization: `Bearer ${token}` }, responseType: 'blob'
                                                });
                                                const url = window.URL.createObjectURL(new Blob([res.data]));
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.setAttribute('download', `donations_${new Date().toISOString().split('T')[0]}.csv`);
                                                document.body.appendChild(link);
                                                link.click();
                                                link.remove();
                                            } catch { alert('Export failed'); }
                                        }}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700"
                                    >
                                        <Download className="h-4 w-4" /> Export CSV
                                    </button>
                                    <span className="text-sm text-gray-500 font-medium ml-auto">{donationsTotal} total donations</span>
                                </div>
                                <div className="bg-dark rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 text-gray-500">
                                                <tr>
                                                    <th className="px-6 py-4 font-medium">Code</th>
                                                    <th className="px-6 py-4 font-medium">Donor</th>
                                                    <th className="px-6 py-4 font-medium">Campaign</th>
                                                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                                                    <th className="px-6 py-4 font-medium">Gateway</th>
                                                    <th className="px-6 py-4 font-medium">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {adminDonations.length === 0 ? (
                                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">No donations found.</td></tr>
                                                ) : adminDonations.map((d: any) => (
                                                    <tr key={d.id} className="hover:bg-gray-50/50">
                                                        <td className="px-6 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold">{d.donationCode || '—'}</span>
                                                                <button 
                                                                    onClick={() => {
                                                                        setLogFilter({ entityId: d.campaignId });
                                                                        setActiveTab('logs');
                                                                    }}
                                                                    className="p-1 text-gray-400 hover:text-primary transition-colors"
                                                                    title="View Campaign History"
                                                                >
                                                                    <FileText className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <p className="font-semibold text-gray-900">{d.isAnonymous ? 'Anonymous' : (d.donorName || 'Guest')}</p>
                                                            <p className="text-xs text-gray-400">{d.donorEmail || ''}</p>
                                                        </td>
                                                        <td className="px-6 py-3 text-gray-700 max-w-[180px] truncate">{d.campaignTitle}</td>
                                                        <td className="px-6 py-3 text-right font-bold text-gray-900">Rs {parseFloat(d.amount).toLocaleString('en-NP')}</td>
                                                        <td className="px-6 py-3">
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${d.gateway === 'ESEWA' ? 'bg-green-50 text-green-700' :
                                                                d.gateway === 'KHALTI' ? 'bg-purple-50 text-purple-700' :
                                                                    'bg-gray-100 text-gray-600'
                                                                }`}>{d.gateway || 'N/A'}</span>
                                                        </td>
                                                        <td className="px-6 py-3 text-xs text-gray-400">
                                                            {new Date(d.createdAt).toLocaleDateString('en-NP', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'stats' && platformStats && (
                            <div className="space-y-6">
                                {/* Key metrics */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                    {[
                                        { label: 'Total Raised', value: `Rs ${parseFloat(platformStats.totalRaised || 0).toLocaleString('en-NP')}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                        { label: 'Total Donations', value: platformStats.totalDonations, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
                                        { label: 'Avg. Donation', value: `Rs ${parseFloat(platformStats.avgDonation || 0).toFixed(0)}`, icon: BarChart2, color: 'text-purple-600', bg: 'bg-purple-50' },
                                        { label: 'Total Donors', value: platformStats.totalDonors, icon: Shield, color: 'text-orange-600', bg: 'bg-orange-50' },
                                    ].map((s, i) => (
                                        <div key={i} className="bg-dark rounded-2xl border border-gray-100 p-6 flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}>
                                                <s.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-xs uppercase tracking-wider">{s.label}</p>
                                                <p className="text-2xl font-black text-gray-900">{s.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Top Campaigns */}
                                <div className="bg-dark rounded-2xl border border-gray-100 p-6">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-500" /> Top Campaigns</h3>
                                    <div className="space-y-3">
                                        {(platformStats.topCampaigns || []).map((c: any, i: number) => (
                                            <div key={c.id} className="flex items-center gap-4">
                                                <span className="w-6 text-sm font-black text-gray-400">#{i + 1}</span>
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-gray-800 text-sm">{c.title}</p>
                                                    <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (parseFloat(c.totalRaised) / parseFloat(platformStats.totalRaised || 1)) * 100)}%` }} />
                                                    </div>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">Rs {parseFloat(c.totalRaised).toLocaleString('en-NP')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Gateway breakdown */}
                                <div className="bg-dark rounded-2xl border border-gray-100 p-6">
                                    <h3 className="font-bold text-gray-900 mb-4">Payment Gateway Breakdown</h3>
                                    <div className="space-y-3">
                                        {(platformStats.gatewayBreakdown || []).map((g: any) => (
                                            <div key={g.gateway} className="flex items-center gap-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${g.gateway === 'ESEWA' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                                                    }`}>{g.gateway || 'UNKNOWN'}</span>
                                                <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${Math.min(100, (parseFloat(g.total) / parseFloat(platformStats.totalRaised || 1)) * 100)}%` }} />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700">{g.count} × Rs {parseFloat(g.total).toLocaleString('en-NP')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'stats' && !platformStats && !loading && (
                            <div className="text-center py-24 text-gray-400">Failed to load statistics.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
