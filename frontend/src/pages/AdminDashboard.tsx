import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
    Shield, FileText, LayoutList, CreditCard, 
    BarChart2, DollarSign, TrendingUp, Search, 
    LifeBuoy, MessageSquare, Send, ArrowUpRight, Activity, RotateCcw
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { TableSkeleton } from '../components/Skeleton';

const AdminDashboard = () => {
    const navigate = useNavigate();
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
            console.log('Admin Intelligence Refresh Triggered:', { activeTab });
            const summaryRes = await axios.get(`${API_BASE_URL}/stats/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSummary(summaryRes.data);

            if (activeTab === 'kyc') {
                const res = await axios.get(`${API_BASE_URL}/admin/kyc`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('KYC Registry Sync:', res.data.length, 'entries');
                setKycRequests(res.data);
            } else if (activeTab === 'campaigns') {
                const res = await axios.get(`${API_BASE_URL}/admin/campaigns`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Campaign Pipeline Sync:', res.data.length, 'entries');
                setCampaignRequests(res.data);
            } else if (activeTab === 'payouts') {
                const res = await axios.get(`${API_BASE_URL}/payouts/all`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Treasury Sync:', res.data.length, 'entries');
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
        return (
            <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
                <div className="glass-card p-12 text-center rounded-[2rem] border-rose-500/20">
                    <Shield className="h-16 w-16 text-rose-500 mx-auto mb-6 opacity-50" />
                    <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Access Denied</h1>
                    <p className="text-gray-500 mb-8 font-medium">You do not have administrative privileges to access this sector.</p>
                    <button onClick={() => navigate('/')} className="px-8 py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all">
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white pb-24 relative overflow-hidden">
            <div className="max-w-[1400px] mx-auto space-y-10 relative z-10">
                {/* Header Section */}
                <div className="flex items-center justify-between gap-8">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white tracking-tighter leading-tight">Admin Dashboard</h1>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px] opacity-70">Operations & Oversight Terminal</p>
                    </div>
                    <button 
                        onClick={fetchData} 
                        disabled={loading}
                        className="px-5 py-2.5 bg-[#131316] border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-primary transition-all flex items-center gap-2.5 active:scale-95 disabled:opacity-50 shadow-xl"
                    >
                        <RotateCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Registry
                    </button>
                </div>

                {/* Dashboard Summary Chips */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
                    <div className="glass-card p-6 rounded-2xl border-white/5 bg-[#131316]/40 hover:bg-[#131316]/60 transition-colors group">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 group-hover:text-primary transition-colors">Total Impact</p>
                        <p className="text-xl font-black text-white tracking-tighter">Rs {summary?.totalDonated?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="glass-card p-6 rounded-2xl border-white/5 bg-[#131316]/40 hover:bg-[#131316]/60 transition-colors group">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 group-hover:text-emerald-400 transition-colors">Released</p>
                        <p className="text-xl font-black text-emerald-400 tracking-tighter">Rs {summary?.totalReleased?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="glass-card p-6 rounded-2xl border-white/5 bg-[#131316]/40 hover:bg-[#131316]/60 transition-colors group">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 group-hover:text-primary transition-colors">Escrow Balance</p>
                        <p className="text-xl font-black text-primary tracking-tighter">Rs {summary?.escrowBalance?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="glass-card p-6 rounded-2xl border-white/5 bg-[#131316]/40 hover:bg-[#131316]/60 transition-colors group">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 group-hover:text-white transition-colors">Nodes</p>
                        <p className="text-xl font-black text-white tracking-tighter">{summary?.totalUsers || '0'}</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-2.5 mb-8 p-1.5 bg-[#131316]/60 backdrop-blur-2xl rounded-[2rem] border border-white/5 shadow-2xl overflow-x-auto scrollbar-hide">
                    {[
                        { id: 'kyc', label: 'KYC Sync', icon: Shield, count: summary?.pendingKYC },
                        { id: 'campaigns', label: 'Marketplace', icon: LayoutList, count: summary?.pendingCampaigns },
                        { id: 'payouts', label: 'Payouts', icon: CreditCard, count: summary?.pendingPayouts },
                        { id: 'donations', label: 'Donations', icon: DollarSign },
                        { id: 'support', label: 'Tickets', icon: LifeBuoy, count: summary?.pendingTickets },
                        { id: 'stats', label: 'Stats', icon: BarChart2 },
                        { id: 'logs', label: 'Logs', icon: FileText }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2.5 group relative overflow-hidden ${
                                activeTab === tab.id 
                                ? 'bg-primary text-black shadow-xl shadow-primary/20' 
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <tab.icon size={15} />
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[8px] font-black ${
                                    activeTab === tab.id ? 'bg-black text-primary' : 'bg-primary/20 text-primary'
                                }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="min-h-[600px] relative">
                    {loading ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <TableSkeleton rows={6} />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* 1. KYC TAB */}
                            {activeTab === 'kyc' && (
                                <div className="glass-card rounded-[2rem] p-4 border-white/5 bg-[#131316]/40 shadow-2xl overflow-hidden">
                                    <div className="p-8 pb-4">
                                        <h2 className="text-xl font-black text-white tracking-tighter flex items-center gap-3">
                                            <Shield className="h-6 w-6 text-primary" /> Pending KYC Audits
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-separate border-spacing-y-2.5 px-8 pb-8">
                                            <thead>
                                                <tr className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">
                                                    <th className="px-6 py-4">Applicant</th>
                                                    <th className="px-6 py-4">Document Class</th>
                                                    <th className="px-6 py-4">Timestamp</th>
                                                    <th className="px-6 py-4 text-right">Verification</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {kycRequests.length === 0 ? (
                                                    <tr><td colSpan={4} className="py-20 text-center text-gray-600 italic uppercase text-[10px] tracking-widest">No pending identity audits.</td></tr>
                                                ) : kycRequests.map((req) => (
                                                    <tr key={req.id} className="group bg-white/[0.01] hover:bg-white/[0.04] transition-all">
                                                        <td className="px-6 py-6 rounded-l-2xl">
                                                            <p className="font-black text-white text-md tracking-tighter">{req.userName}</p>
                                                            <p className="text-[10px] text-gray-500 font-medium tracking-wide mt-0.5 opacity-60">{req.userEmail}</p>
                                                        </td>
                                                        <td className="px-6 py-6 font-bold text-xs text-gray-400 uppercase tracking-widest">{req.documentType}</td>
                                                        <td className="px-6 py-6 text-[10px] font-mono text-gray-600">{new Date(req.createdAt).toLocaleDateString()}</td>
                                                        <td className="px-6 py-6 text-right rounded-r-2xl">
                                                            <button onClick={() => navigate(`/admin/kyc/${req.id}`)} className="px-5 py-2.5 bg-white/5 text-primary border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all inline-flex items-center gap-2.5 group-hover:scale-105 shadow-lg">
                                                                Review <ArrowUpRight className="h-3.5 w-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* 2. MARKETPLACE TAB */}
                            {activeTab === 'campaigns' && (
                                <div className="glass-card rounded-[2rem] p-4 border-white/5 bg-[#131316]/40 shadow-2xl overflow-hidden">
                                    <div className="p-8 pb-4">
                                        <h2 className="text-xl font-black text-white tracking-tighter flex items-center gap-3">
                                            <LayoutList className="h-6 w-6 text-primary" /> Campaign Requests
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-separate border-spacing-y-2.5 px-8 pb-8">
                                            <thead>
                                                <tr className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">
                                                    <th className="px-6 py-4">Campaign</th>
                                                    <th className="px-6 py-4">Intel</th>
                                                    <th className="px-6 py-4">Created</th>
                                                    <th className="px-6 py-4 text-right">Audit</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {campaignRequests.length === 0 ? (
                                                    <tr><td colSpan={4} className="py-20 text-center text-gray-600 italic uppercase text-[10px] tracking-widest">Marketplace is in equilibrium.</td></tr>
                                                ) : campaignRequests.map((req) => (
                                                    <tr key={req.id} className="group bg-white/[0.01] hover:bg-white/[0.04] transition-all">
                                                        <td className="px-6 py-6 rounded-l-2xl max-w-md">
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-10 w-14 overflow-hidden rounded-xl bg-dark/50 flex-shrink-0 border border-white/5 shadow-xl">
                                                                    <img src={req.imageUrl} className="h-full w-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" alt="" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-white text-md tracking-tighter truncate leading-tight">{req.title}</p>
                                                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1 truncate opacity-60">{req.organizerName}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-6">
                                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Target</p>
                                                            <p className="font-black text-primary text-lg tracking-tighter">NRs {req.targetAmount?.toLocaleString()}</p>
                                                        </td>
                                                        <td className="px-6 py-6 text-[10px] text-gray-500 font-mono">{new Date(req.createdAt).toLocaleDateString()}</td>
                                                         <td className="px-6 py-6 text-right rounded-r-2xl">
                                                             <button 
                                                                 onClick={() => navigate(`/admin/campaigns/${req.id}`)}
                                                                 className="px-5 py-2.5 bg-white/5 text-primary border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all inline-flex items-center gap-2.5 group-hover:scale-105 shadow-lg"
                                                             >
                                                                 Review <ArrowUpRight className="h-3.5 w-3.5" />
                                                             </button>
                                                         </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* 3. TREASURY TAB */}
                            {activeTab === 'payouts' && (
                                <div className="glass-card rounded-[2rem] p-4 border-white/5 bg-[#131316]/40 shadow-2xl overflow-hidden">
                                    <div className="p-8 pb-4">
                                        <h2 className="text-xl font-black text-white tracking-tighter flex items-center gap-3">
                                            <CreditCard className="h-6 w-6 text-primary" /> Payout Queue
                                        </h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-separate border-spacing-y-2.5 px-8 pb-8">
                                            <thead>
                                                <tr className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">
                                                    <th className="px-6 py-4">Campaign</th>
                                                    <th className="px-6 py-4">Bank Intel</th>
                                                    <th className="px-6 py-4">Volume</th>
                                                    <th className="px-6 py-4 text-right">Auth</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payoutRequests.length === 0 ? (
                                                    <tr><td colSpan={4} className="py-20 text-center text-gray-600 italic uppercase text-[10px] tracking-widest">Treasury balance confirmed.</td></tr>
                                                ) : payoutRequests.map((req) => (
                                                    <tr key={req.id} className="group bg-white/[0.01] hover:bg-white/[0.04] transition-all">
                                                        <td className="px-6 py-6 rounded-l-2xl">
                                                            <p className="font-black text-white text-md tracking-tighter leading-tight max-w-xs">{req.campaignTitle}</p>
                                                        </td>
                                                        <td className="px-6 py-6">
                                                            <p className="text-xs font-black text-gray-400 capitalize">{req.organizerName}</p>
                                                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1 font-mono opacity-60">{req.bank_name} • {req.account_number}</p>
                                                        </td>
                                                        <td className="px-6 py-6 font-black text-emerald-400 text-lg tracking-tighter">NRs {parseFloat(req.amount).toLocaleString()}</td>
                                                         <td className="px-6 py-6 text-right rounded-r-2xl">
                                                             <button 
                                                                 onClick={() => navigate(`/admin/payouts/${req.id}`)}
                                                                 className="px-5 py-2.5 bg-white/5 text-emerald-400 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all inline-flex items-center gap-2.5 group-hover:scale-105 shadow-lg"
                                                             >
                                                                 Review <ArrowUpRight className="h-3.5 w-3.5" />
                                                             </button>
                                                         </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* 4. LEDGER TAB */}
                            {activeTab === 'donations' && (
                                <div className="space-y-10">
                                    <div className="flex flex-wrap gap-6 items-center justify-between glass-card p-8 rounded-[2rem] border-white/5 bg-[#131316]/40 backdrop-blur-3xl shadow-2xl">
                                        <div className="flex flex-wrap gap-4 items-center">
                                            <div className="relative group">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 group-focus-within:text-primary transition-colors" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Search transaction node..."
                                                    className="pl-12 pr-6 py-3 bg-dark/50 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest focus:border-primary/50 outline-none w-64 transition-all shadow-inner"
                                                    value={donationSearch}
                                                    onChange={(e) => setDonationSearch(e.target.value)}
                                                />
                                            </div>
                                            <button className="px-6 py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all shadow-lg">Export Protocol CSV</button>
                                        </div>
                                        <div className="px-6 py-3 bg-primary/10 border border-primary/20 rounded-xl shadow-xl shadow-primary/5">
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Volume: Rs {donationsTotal.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="glass-card rounded-[2rem] p-2 border-white/5 bg-[#131316]/40 shadow-2xl overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-separate border-spacing-y-2.5 px-8 pb-8">
                                                <thead>
                                                    <tr className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">
                                                        <th className="px-6 py-4">TX ID</th>
                                                        <th className="px-6 py-4">Node Context</th>
                                                        <th className="px-6 py-4">Volume</th>
                                                        <th className="px-6 py-4">Origin</th>
                                                        <th className="px-6 py-4 text-right">Auth Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {adminDonations.filter(d => 
                                                        d.id.toLowerCase().includes(donationSearch.toLowerCase()) || 
                                                        d.campaignTitle?.toLowerCase().includes(donationSearch.toLowerCase())
                                                    ).map((don) => (
                                                        <tr key={don.id} className="group bg-white/[0.01] hover:bg-white/[0.04] transition-all">
                                                            <td className="px-6 py-6 rounded-l-2xl font-mono text-[9px] text-gray-500">{don.id.slice(0, 18)}...</td>
                                                            <td className="px-6 py-6">
                                                                <p className="font-black text-white text-md tracking-tighter truncate max-w-[200px]">{don.campaignTitle}</p>
                                                            </td>
                                                            <td className="px-6 py-6 font-black text-primary text-lg">Rs {parseFloat(don.amount).toLocaleString()}</td>
                                                            <td className="px-6 py-6">
                                                                <p className="font-black text-white text-xs">{don.donorName || 'GUEST'}</p>
                                                                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-1 opacity-60">{don.donorEmail || 'ANONYMOUS'}</p>
                                                            </td>
                                                            <td className="px-6 py-6 rounded-r-2xl text-right font-mono text-[9px] text-gray-600 font-bold">{new Date(don.createdAt).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 5. DEEP INTEL TAB (STATS) */}
                            {activeTab === 'stats' && platformStats && (
                                <div className="grid lg:grid-cols-2 gap-8">
                                    <div className="glass-card p-8 rounded-[2.5rem] border-white/5 bg-[#131316]/40">
                                        <div className="flex items-center gap-5 mb-8">
                                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-2xl shadow-primary/5">
                                                <TrendingUp size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white tracking-tighter">Volume Intelligence</h3>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 opacity-60">30-Day Growth Analysis</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {platformStats.campaignVolume?.map((s: any) => (
                                                <div key={s.date} className="flex items-center justify-between p-5 bg-white/[0.02] rounded-xl border border-white/5 hover:bg-white/[0.04] transition-colors">
                                                    <p className="text-[10px] font-mono text-gray-500 font-bold">{new Date(s.date).toLocaleDateString()}</p>
                                                    <p className="font-black text-white text-md">Rs {parseFloat(s.volume).toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="glass-card p-8 rounded-[2.5rem] border-white/5 bg-[#131316]/40">
                                        <div className="flex items-center gap-5 mb-8">
                                            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-2xl shadow-indigo-500/5">
                                                <Activity size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white tracking-tighter">Node Activity</h3>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 opacity-60">User Engagement Metrics</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 transition-colors group">
                                                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-3 group-hover:text-indigo-400">Creators</p>
                                                <p className="text-4xl font-black text-white tracking-tighter">{platformStats.activeCreators || '0'}</p>
                                            </div>
                                            <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors group">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 group-hover:text-primary">Verified</p>
                                                <p className="text-4xl font-black text-white tracking-tighter">{platformStats.verifiedUsers || '0'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 6. AUDIT LOGS TAB */}
                            {activeTab === 'logs' && (
                                <div className="space-y-6">
                                    <div className="flex gap-4 glass-card p-3 rounded-2xl border-white/5 bg-[#131316]/40">
                                        <select 
                                            className="px-5 py-2.5 bg-dark/50 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest focus:border-primary/50 outline-none shadow-inner"
                                            onChange={(e) => setLogFilter({ ...logFilter, entityType: e.target.value || undefined })}
                                        >
                                            <option value="">All Entities</option>
                                            <option value="CAMPAIGN">Campaigns</option>
                                            <option value="PAYOUT">Payouts</option>
                                            <option value="KYC">KYC</option>
                                            <option value="FINANCIAL">Finance (Gov Audit)</option>
                                        </select>
                                    </div>
                                    
                                    <div className="glass-card rounded-[1.5rem] p-1 border-white/5 bg-[#131316]/40 shadow-2xl">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-separate border-spacing-y-2 px-6 pb-6">
                                                <thead>
                                                    <tr className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">
                                                        <th className="px-5 py-3">Timestamp</th>
                                                        <th className="px-5 py-3">Admin</th>
                                                        <th className="px-5 py-3">Action</th>
                                                        <th className="px-5 py-3">Protocol</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {auditLogs.length === 0 ? (
                                                        <tr><td colSpan={4} className="py-20 text-center text-gray-600 italic uppercase text-[9px] tracking-widest">No anomalies detected.</td></tr>
                                                    ) : auditLogs.map((log) => (
                                                        <tr key={log.id} className="group bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                                                            <td className="px-5 py-4 rounded-l-xl font-mono text-[9px] text-gray-600">{new Date(log.created_at).toLocaleString()}</td>
                                                            <td className="px-5 py-4 font-black text-white text-[11px] uppercase">{log.adminName}</td>
                                                            <td className="px-5 py-4">
                                                                <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[8px] font-black rounded-full border border-primary/20">{log.action}</span>
                                                            </td>
                                                            <td className="px-5 py-4 rounded-r-xl font-mono text-[9px] text-gray-500">{log.entityType?.slice(0, 4)} • {log.entityId?.slice(0, 8)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 7. SUPPORT TICKETS TAB */}
                            {activeTab === 'support' && (
                                <div className="grid lg:grid-cols-12 gap-6 h-[650px]">
                                    {/* Sidebar: Ticket List */}
                                    <div className="lg:col-span-4 glass-card rounded-[2rem] border-white/5 bg-[#131316]/40 overflow-hidden flex flex-col shadow-2xl">
                                        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                                            <h3 className="text-xs font-black text-white uppercase tracking-[0.25em] opacity-60">Support Queue</h3>
                                        </div>
                                        <div className="flex-grow overflow-y-auto p-4 space-y-3 scrollbar-hide">
                                            {supportTickets.map((ticket) => (
                                                <button
                                                    key={ticket.id}
                                                    onClick={() => {
                                                        setSelectedTicket(ticket);
                                                        fetchTicketMessages(ticket.id);
                                                    }}
                                                    className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${
                                                        selectedTicket?.id === ticket.id 
                                                        ? 'bg-primary/10 border-primary/30 shadow-xl shadow-primary/5' 
                                                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:translate-x-1'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                                            ticket.status === 'OPEN' ? 'bg-amber-500/20 text-amber-500' : 
                                                            ticket.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-500/20 text-gray-500'
                                                        }`}>
                                                            {ticket.status}
                                                        </span>
                                                        <span className="text-[9px] font-mono text-gray-600 font-bold">{new Date(ticket.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="font-black text-white text-md tracking-tighter truncate mb-1">{ticket.subject}</p>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate opacity-60">{ticket.user_name?.split(' ')[0]}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Chat Area */}
                                    <div className="lg:col-span-8 glass-card rounded-[2rem] border-white/5 bg-[#131316]/40 overflow-hidden flex flex-col shadow-2xl">
                                        {selectedTicket ? (
                                            <>
                                                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-dark/70 backdrop-blur-xl">
                                                    <div className="space-y-0.5">
                                                        <h2 className="text-xl font-black text-white tracking-tighter leading-tight">{selectedTicket.subject}</h2>
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest opacity-60">{selectedTicket.user_name} • {selectedTicket.user_email}</p>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button 
                                                            onClick={() => updateTicketStatus(selectedTicket.id, 'RESOLVED')}
                                                            className="px-5 py-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
                                                        >
                                                            Resolve
                                                        </button>
                                                        <button 
                                                            onClick={() => updateTicketStatus(selectedTicket.id, 'CLOSED')}
                                                            className="px-5 py-2.5 bg-white/5 text-gray-500 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all shadow-lg"
                                                        >
                                                            Close
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex-grow overflow-y-auto p-8 space-y-6 scrollbar-hide bg-[#09090B]/40 shadow-inner">
                                                    {ticketMessages.map((msg) => (
                                                        <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                                                            <div className={`max-w-[80%] p-6 rounded-3xl shadow-xl ${
                                                                msg.is_admin 
                                                                ? 'bg-primary text-black rounded-tr-none' 
                                                                : 'bg-[#131316] text-white border border-white/5 rounded-tl-none border-white/10'
                                                            }`}>
                                                                <p className="text-sm font-bold leading-relaxed tracking-tight">{msg.message}</p>
                                                                <p className={`text-[9px] font-black uppercase mt-4 opacity-40 ${msg.is_admin ? 'text-black' : 'text-gray-500'}`}>
                                                                    {new Date(msg.created_at).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="p-6 bg-dark/70 border-t border-white/5 backdrop-blur-xl">
                                                    <div className="relative group">
                                                        <textarea 
                                                            placeholder="Compose administrative reply..."
                                                            className="w-full bg-[#131316] border border-white/10 rounded-2xl p-6 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all resize-none h-28 shadow-inner"
                                                            value={replyMessage}
                                                            onChange={(e) => setReplyMessage(e.target.value)}
                                                        />
                                                        <button 
                                                            onClick={handleSendReply}
                                                            className="absolute bottom-4 right-4 h-12 w-12 rounded-xl bg-primary text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl group-hover:shadow-primary/30"
                                                        >
                                                            <Send size={18} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="h-full flex items-center justify-center p-12 text-center opacity-20">
                                                <div className="space-y-4">
                                                    <MessageSquare size={80} strokeWidth={1} className="mx-auto" />
                                                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Select a node to transmit</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
