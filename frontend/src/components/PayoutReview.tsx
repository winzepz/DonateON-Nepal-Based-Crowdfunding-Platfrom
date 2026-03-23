import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
    Check, X, User,
    Info, Activity,
    CreditCard, Landmark, Hash, Quote
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { CardSkeleton } from './Skeleton';

const PayoutReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [payout, setPayout] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayoutDetails = async () => {
            if (!token) return;
            try {
                const res = await axios.get(`${API_BASE_URL}/payouts/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPayout(res.data);
            } catch (err) {
                console.error('Failed to fetch payout details', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPayoutDetails();
    }, [id, token]);

    const handleAction = async (action: 'approve' | 'reject') => {
        try {
            await axios.post(`${API_BASE_URL}/payouts/${id}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/admin');
        } catch (err) {
            console.error(`Failed to ${action} payout`, err);
            alert(`Error processing ${action} request.`);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#09090B] p-12">
            <div className="max-w-7xl mx-auto space-y-10">
                <div className="h-48 w-full animate-pulse bg-white/5 rounded-[3.5rem]" />
                <div className="grid lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8">
                        <div className="h-96 w-full animate-pulse bg-white/5 rounded-[3rem]" />
                    </div>
                    <div className="lg:col-span-4">
                        <CardSkeleton />
                    </div>
                </div>
            </div>
        </div>
    );

    if (!payout) return (
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
            <div className="glass-card p-12 text-center rounded-[2.5rem] border-rose-500/20">
                <Info className="h-16 w-16 text-rose-500 mx-auto mb-6 opacity-30" />
                <h1 className="text-3xl font-black tracking-tighter mb-4">Payout Not Found</h1>
                <button onClick={() => navigate('/admin')} className="px-8 py-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all">Back to Dashboard</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen text-white pb-24 relative overflow-hidden">
            <div className="max-w-[1500px] mx-auto space-y-10 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="hidden" /> {/* Placeholder */}
                        
                        <div className="flex items-center gap-4 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-xl shadow-emerald-500/5">
                            <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Transaction Status: {payout.status}</span>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-8 space-y-8">
                            {/* Payout Summary */}
                            <div className="glass-card p-10 rounded-[2rem] border-white/10 bg-gradient-to-br from-[#131316] to-[#09090B] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <CreditCard size={120} />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4">Disbursement Volume</p>
                                    <h1 className="text-4xl font-black tracking-tighter mb-6 text-white">Rs. {parseFloat(payout.amount).toLocaleString()}</h1>
                                    <div className="flex items-center gap-4 py-3.5 px-6 bg-white/[0.02] border border-white/5 rounded-2xl w-fit">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        <p className="text-sm font-bold text-gray-400 tracking-tight">Reviewing requested capital for <span className="text-white">{payout.organizerName}</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Campaign Context */}
                            <div className="glass-card p-10 rounded-[2.5rem] border-white/5 bg-[#131316]/40 shadow-2xl backdrop-blur-3xl">
                                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                    <Activity className="h-4 w-4" /> Operational Context
                                </h3>
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-white mb-2 tracking-tighter">{payout.campaignTitle}</h2>
                                        <div className="grid grid-cols-2 gap-6 mt-8">
                                            <div className="p-6 rounded-3xl bg-white/[0.01] border border-white/5 shadow-inner">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Capital Target</p>
                                                <p className="text-xl font-black text-white tracking-tighter">Rs. {parseFloat(payout.campaignTargetAmount).toLocaleString()}</p>
                                            </div>
                                            <div className="p-6 rounded-3xl bg-white/[0.01] border border-white/5 shadow-inner">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Net Accumulation</p>
                                                <p className="text-xl font-black text-primary tracking-tighter">Rs. {parseFloat(payout.campaignCurrentAmount).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {payout.remarks && (
                                        <div className="p-6 rounded-3xl bg-emerald-500/[0.02] border border-emerald-500/10 text-gray-400 text-md leading-relaxed flex gap-4">
                                            <Quote size={24} className="text-emerald-500/20 flex-shrink-0 mt-1" />
                                            <p className="tracking-tight italic">"{payout.remarks}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            {/* Bank Credentials */}
                            <div className="glass-card p-10 rounded-[2.5rem] border-white/5 bg-[#131316]/60 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
                                <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/5 blur-[50px] -mr-16 -mt-16" />
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Financial Destination</p>
                                
                                <div className="space-y-6 relative z-10">
                                    <div className="p-6 rounded-3xl bg-black/40 border border-white/5 space-y-6 shadow-2xl shadow-black/50">
                                        <div className="flex items-center gap-5 group">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-emerald-500 transition-all shadow-lg border border-white/5">
                                                <Landmark size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Institution</p>
                                                <p className="font-black text-white text-md uppercase tracking-tight leading-none">{payout.bank_name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5 group">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-emerald-500 transition-all shadow-lg border border-white/5">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Account Holder</p>
                                                <p className="font-black text-white text-md tracking-tight leading-none">{payout.account_holder_name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5 group">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-emerald-500 transition-all shadow-lg border border-white/5">
                                                <Hash size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Node Identifier</p>
                                                <p className="font-black text-emerald-400 text-xl tracking-[-0.05em] font-mono leading-none mt-1">{payout.account_number}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decision Block */}
                            <div className="glass-card p-8 rounded-[2.5rem] border-white/5 bg-emerald-500/[0.02] shadow-2xl space-y-4">
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.25em] px-4 mb-2">Final Authorization</p>
                                <button 
                                    onClick={() => handleAction('approve')}
                                    disabled={loading}
                                    className="w-full py-5 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-[0.25em] text-[10px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                                >
                                    <Check size={18} strokeWidth={4} />
                                    Authorize Release
                                </button>
                                <button 
                                    onClick={() => handleAction('reject')}
                                    disabled={loading}
                                    className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-rose-500 font-black uppercase tracking-[0.25em] text-[10px] flex items-center justify-center gap-3 hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-lg disabled:opacity-50"
                                >
                                    <X size={18} strokeWidth={4} />
                                    Deny Transfer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default PayoutReview;
