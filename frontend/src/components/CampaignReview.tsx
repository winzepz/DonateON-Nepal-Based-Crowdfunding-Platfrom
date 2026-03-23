import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
    Check, X, Shield, User, Mail, 
    DollarSign, Info, Activity,
    Clock, Target
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { CardSkeleton } from './Skeleton';

const CampaignReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [campaign, setCampaign] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaignDetails = async () => {
            if (!token) return;
            try {
                const res = await axios.get(`${API_BASE_URL}/admin/campaigns/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCampaign(res.data);
            } catch (err) {
                console.error('Failed to fetch campaign details', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaignDetails();
    }, [id, token]);

    const handleAction = async (action: 'approve' | 'reject') => {
        try {
            await axios.post(`${API_BASE_URL}/admin/campaigns/${id}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/admin');
        } catch (err) {
            console.error(`Failed to ${action} campaign`, err);
            alert(`Error processing ${action} request.`);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#09090B] p-12">
            <div className="max-w-7xl mx-auto space-y-10">
                <div className="h-96 w-full animate-pulse bg-white/5 rounded-[3rem]" />
                <div className="grid lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-8">
                        <div className="h-64 w-full animate-pulse bg-white/5 rounded-[3rem]" />
                        <div className="h-64 w-full animate-pulse bg-white/5 rounded-[3rem]" />
                    </div>
                    <div className="lg:col-span-4 space-y-8">
                        <CardSkeleton />
                        <CardSkeleton />
                    </div>
                </div>
            </div>
        </div>
    );

    if (!campaign) return (
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
            <div className="glass-card p-12 text-center rounded-[2.5rem] border-rose-500/20">
                <Info className="h-16 w-16 text-rose-500 mx-auto mb-6 opacity-30" />
                <h1 className="text-3xl font-black tracking-tighter mb-4">Campaign Not Found</h1>
                <button onClick={() => navigate('/admin')} className="px-8 py-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all">Back to Dashboard</button>
            </div>
        </div>
    );

    const progress = (campaign.totalRaised / parseFloat(campaign.targetAmount)) * 100;

    return (
        <div className="min-h-screen text-white pb-24 relative overflow-hidden">
            <div className="max-w-[1500px] mx-auto space-y-10 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="hidden" /> {/* Placeholder */}
                        
                        <div className="flex items-center gap-4 px-5 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl shadow-xl shadow-amber-500/5">
                            <Activity className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Node Status: {campaign.status}</span>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-8 space-y-8">
                            <div className="space-y-6">
                                <div className="relative group">
                                    <div className="aspect-[21/9] w-full rounded-[2rem] overflow-hidden border border-white/5 bg-dark shadow-2xl relative">
                                        <img 
                                            src={campaign.imageUrl} 
                                            alt={campaign.title} 
                                            className="h-full w-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent opacity-80" />
                                    </div>
                                    <div className="absolute -bottom-6 left-8 right-8 flex gap-4">
                                        <div className="glass-card flex-grow p-8 rounded-[2rem] border-white/10 bg-[#131316]/80 backdrop-blur-3xl shadow-2xl">
                                            <h1 className="text-2xl font-black tracking-tighter leading-none mb-2">{campaign.title}</h1>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2.5">
                                                <Target className="h-3.5 w-3.5 text-primary" /> Initialized: {new Date(campaign.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card mt-12 p-10 rounded-[2.5rem] border-white/5 bg-[#131316]/40 shadow-2xl backdrop-blur-3xl">
                                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                    <Info className="h-4 w-4" /> Mission Intelligence
                                </h3>
                                <div className="prose prose-invert max-w-none">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                            <Clock size={14} className="text-primary" /> Temporal Validation
                                        </div>
                                        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                            <DollarSign size={14} className="text-primary" /> Fiscal Audit Ready
                                        </div>
                                    </div>
                                    <p className="text-gray-400 font-medium leading-[1.6] text-lg whitespace-pre-wrap tracking-tight">
                                        {campaign.description}
                                    </p>
                                </div>
                            </div>

                            <div className="glass-card mt-10 p-10 rounded-[2.5rem] border-white/5 bg-[#131316]/40 shadow-2xl overflow-hidden backdrop-blur-3xl">
                                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                    <Activity className="h-4 w-4" /> Transaction Ledger
                                </h3>
                                <div className="space-y-4">
                                    {campaign.recentDonations?.length === 0 ? (
                                        <div className="p-16 text-center text-gray-600 italic uppercase text-[10px] font-black tracking-[0.3em] bg-white/[0.01] rounded-[2rem] border border-dashed border-white/5">
                                            Zero activity detected on primary ledger.
                                        </div>
                                    ) : (
                                        campaign.recentDonations?.map((d: any) => (
                                            <div key={d.id} className="flex items-center justify-between p-6 bg-white/[0.02] hover:bg-white/[0.05] rounded-[2rem] border border-white/5 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-md shadow-lg shadow-primary/5 group-hover:scale-105 transition-transform">
                                                        {d.donorName ? d.donorName[0] : 'G'}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-md text-white tracking-tight">{d.isAnonymous ? 'Restricted Identity' : (d.donorName || 'Guest Access')}</p>
                                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-0.5">{new Date(d.created_at).toLocaleDateString()} • REF: {d.donationCode || 'INTERNAL_SYS'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-lg text-white tracking-tighter">Rs. {parseFloat(d.amount).toLocaleString()}</p>
                                                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Verified</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>                        <div className="lg:col-span-4 space-y-8">
                            <div className="glass-card p-10 rounded-[2.5rem] border-white/5 bg-[#131316]/60 shadow-2xl backdrop-blur-3xl">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Operator Identity</p>
                                
                                <div className="space-y-8">
                                    <div className="flex items-center gap-5">
                                        <div className="h-20 w-20 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 shadow-xl shadow-primary/5">
                                            <User size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white tracking-tighter leading-tight">{campaign.organizerName}</h3>
                                            <p className="text-gray-500 font-mono text-[10px] mt-1 opacity-60 uppercase tracking-widest">ID: {campaign.organizer_id.slice(0, 10)}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-5 pt-8 border-t border-white/5">
                                        <div className="flex items-center gap-4 group">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-primary transition-colors shadow-lg border border-white/5">
                                                <Mail size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5 leading-none">Transmission</p>
                                                <p className="font-black text-white tracking-tight text-sm leading-none mt-1">{campaign.organizerEmail}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 group">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-primary transition-colors shadow-lg border border-white/5">
                                                <Shield size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5 leading-none">Audit Status</p>
                                                <p className={`font-black text-xs uppercase tracking-[0.1em] mt-1 ${campaign.organizerKycStatus === 'VERIFIED' ? 'text-primary' : 'text-amber-500'}`}>
                                                    {campaign.organizerKycStatus}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-10 rounded-[2.5rem] border-white/5 bg-[#131316]/60 shadow-2xl backdrop-blur-3xl">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Fiscal Metrics</p>
                                <div className="space-y-8">
                                    <div>
                                        <div className="flex justify-between items-end mb-4">
                                            <div>
                                                <p className="text-2xl font-black tracking-tighter text-white">Rs. {parseFloat(campaign.totalRaised).toLocaleString()}</p>
                                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mt-1.5">Capital Accumulated</p>
                                            </div>
                                        </div>
                                        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                            <div 
                                                className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary/80 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(var(--primary),0.5)]" 
                                                style={{ width: `${Math.min(100, progress)}%` }} 
                                            />
                                        </div>
                                        <div className="flex justify-between mt-4">
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{progress.toFixed(1)}% Saturation</p>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Goal: {parseFloat(campaign.targetAmount).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/5">
                                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner">
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 leading-none">Released</p>
                                            <p className="text-lg font-black text-emerald-400 tracking-tighter">Rs.{parseFloat(campaign.payouts?.releasedAmount || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner">
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 leading-none">Suspended</p>
                                            <p className="text-lg font-black text-rose-400 tracking-tighter">Rs.{parseFloat(campaign.payouts?.pendingPayoutAmount || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02] shadow-2xl space-y-4">
                                <button 
                                    onClick={() => handleAction('approve')}
                                    disabled={loading}
                                    className="w-full py-5 rounded-2xl bg-primary text-black font-black uppercase tracking-[0.25em] text-[10px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                                >
                                    <Check size={18} strokeWidth={4} />
                                    Authorize Mission
                                </button>
                                <button 
                                    onClick={() => handleAction('reject')}
                                    disabled={loading}
                                    className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-rose-500 font-black uppercase tracking-[0.25em] text-[10px] flex items-center justify-center gap-3 hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-lg disabled:opacity-50"
                                >
                                    <X size={18} strokeWidth={4} />
                                    Deny Deployment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default CampaignReview;
