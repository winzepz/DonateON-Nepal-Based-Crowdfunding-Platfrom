import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2, Copy, Share2, Award, ArrowRight, ExternalLink } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface BadgeEarned {
    slug: string;
    title: string;
    description: string;
    icon: string;
}

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'verifying' | 'success' | 'pending' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your payment...');
    const [donationCode, setDonationCode] = useState('');
    const [newBadges, setNewBadges] = useState<BadgeEarned[]>([]);
    const [copied, setCopied] = useState(false);
    const [distributedCampaigns, setDistributedCampaigns] = useState<any[]>([]);
    const [showBadgeModal, setShowBadgeModal] = useState(false);
    const verificationAttempted = useRef(false);

    useEffect(() => {
        if (verificationAttempted.current) return;
        verificationAttempted.current = true;

        const verifyPayment = async () => {
            try {
                const data = searchParams.get('data');
                if (data) {
                    const res = await axios.get(`${API_BASE_URL}/payment/verify/esewa?data=${data}`);
                    setDonationCode(res.data.donationCode || '');
                    setNewBadges(res.data.newBadges || []);
                    setDistributedCampaigns(res.data.distributedCampaigns || []);
                    const nextStatus = res.data.status === 'pending' ? 'pending' : 'success';
                    setStatus(nextStatus);
                    setMessage(res.data.message || (nextStatus === 'pending'
                        ? 'Your payment is still being confirmed by eSewa.'
                        : 'Your donation via eSewa has been verified!'));
                    if (nextStatus === 'success' && res.data.newBadges?.length > 0) {
                        setTimeout(() => setShowBadgeModal(true), 800);
                    }
                    return;
                }

                const pidx = searchParams.get('pidx');
                if (pidx) {
                    const res = await axios.post(`${API_BASE_URL}/payment/verify/khalti`, { pidx });
                    setDonationCode(res.data.donationCode || '');
                    setNewBadges(res.data.newBadges || []);
                    setDistributedCampaigns(res.data.distributedCampaigns || []);
                    const nextStatus = res.data.status === 'pending' ? 'pending' : 'success';
                    setStatus(nextStatus);
                    setMessage(res.data.message || (nextStatus === 'pending'
                        ? 'Your payment is still being confirmed by Khalti.'
                        : 'Your donation via Khalti has been verified!'));
                    if (nextStatus === 'success' && res.data.newBadges?.length > 0) {
                        setTimeout(() => setShowBadgeModal(true), 800);
                    }
                    return;
                }

                const oid = searchParams.get('oid');
                if (oid && !data && !pidx) {
                    setStatus('success');
                    setMessage('Payment flow completed. Please check your dashboard for details.');
                    return;
                }

                setStatus('error');
                setMessage('Invalid payment data received.');
            } catch (error: any) {
                console.error('Verification error:', error);
                if (error.response?.status === 202) {
                    setStatus('pending');
                    setMessage(error.response?.data?.message || 'Your payment is still being confirmed.');
                    return;
                }
                setStatus('error');
                setMessage(error.response?.data?.message || 'Failed to verify payment. Please contact support.');
            }
        };

        verifyPayment();
    }, [searchParams]);

    const copyCode = () => {
        if (donationCode) {
            navigator.clipboard.writeText(donationCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareCode = () => {
        if (navigator.share && donationCode) {
            navigator.share({
                title: 'My Donation',
                text: `I just made a donation! Verify it here with code: ${donationCode}`,
                url: `${window.location.origin}/verify`,
            }).catch(() => { });
        }
    };

    return (
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4 selection:bg-primary/30">
            {/* Simplified Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[80px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[80px] rounded-full" />
            </div>

            {/* Badge Modal - Updated UI */}
            {showBadgeModal && newBadges.length > 0 && (
                <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-card rounded-[2.5rem] p-10 max-w-md w-full text-center">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Award className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">Badges Unlocked!</h2>
                        <p className="text-gray-500 font-medium text-sm mb-8">Your contribution has earned you new honors.</p>
                        
                        <div className="space-y-4 mb-8">
                            {newBadges.map(badge => (
                                <div key={badge.slug} className="flex items-center gap-5 bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
                                    <span className="text-4xl filter drop-shadow-lg">{badge.icon}</span>
                                    <div>
                                        <p className="font-black text-white text-base uppercase tracking-tight">{badge.title}</p>
                                        <p className="text-gray-500 text-xs font-medium leading-relaxed mt-1">{badge.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setShowBadgeModal(false)}
                                className="h-14 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10"
                            >
                                Continue
                            </button>
                            <Link
                                to="/badges"
                                className="h-14 bg-primary text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 flex items-center justify-center"
                            >
                                View Gallery
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative glass-card rounded-[2.5rem] max-w-lg w-full p-10 shadow-2xl flex flex-col gap-8">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center gap-6 text-center py-10">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center border border-white/5">
                                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-2">Verifying</h2>
                            <p className="text-gray-500 font-medium">Securing your contribution on the blockchain...</p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-8 text-center transition-all duration-300">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <CheckCircle className="h-12 w-12 text-primary" />
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <h2 className="text-4xl font-black text-white leading-tight tracking-tighter">Success!</h2>
                            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px] opacity-70">Impact Confirmed</p>
                            <p className="text-gray-500 font-medium max-w-xs mx-auto leading-relaxed">{message}</p>
                        </div>

                        {donationCode && (
                            <div className="w-full space-y-4">
                                <div className="flex items-center justify-center gap-3">
                                    <div className="h-[1px] flex-grow bg-white/5" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Donation Code</p>
                                    <div className="h-[1px] flex-grow bg-white/5" />
                                </div>
                                
                                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-7 group relative overflow-hidden transition-all hover:bg-white/[0.07] hover:border-primary/20">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    
                                    <div className="relative flex items-center justify-between gap-4">
                                        <span className="font-mono font-black text-3xl text-primary tracking-[0.15em] flex-grow">
                                            {donationCode}
                                        </span>
                                        <button
                                            onClick={copyCode}
                                            className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 shadow-lg"
                                            title="Copy code"
                                        >
                                            <Copy className={`w-5 h-5 ${copied ? 'text-primary' : 'text-gray-400'}`} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed px-4">
                                    Use the above protocol to verify your contribution
                                </p>
                            </div>
                        )}

                        {distributedCampaigns.length > 0 && (
                            <div className="w-full space-y-4">
                                <div className="flex items-center justify-center gap-3">
                                    <div className="h-[1px] flex-grow bg-white/5" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Your Impact</p>
                                    <div className="h-[1px] flex-grow bg-white/5" />
                                </div>
                                <div className="space-y-2">
                                    {distributedCampaigns.map((camp, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                            <span className="text-xs font-bold text-gray-300 truncate pr-4 text-left">{camp.title}</span>
                                            <span className="text-xs font-black text-white whitespace-nowrap">NRs {camp.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="w-full grid grid-cols-3 gap-3">
                            {donationCode && (
                                <Link
                                    to={`/verify?code=${donationCode}`}
                                    className="h-[56px] flex flex-col items-center justify-center gap-1 bg-white/5 border border-white/10 text-white rounded-2xl transition-all hover:bg-white/10 group active:scale-95"
                                >
                                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Verify</span>
                                </Link>
                            )}
                            {typeof navigator.share === 'function' && donationCode && (
                                <button
                                    onClick={shareCode}
                                    className="h-[56px] flex flex-col items-center justify-center gap-1 bg-white/5 border border-white/10 text-white rounded-2xl transition-all hover:bg-white/10 group active:scale-95"
                                >
                                    <Share2 className="w-4 h-4 text-gray-500 group-hover:text-secondary transition-colors" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Share</span>
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/dashboard')}
                                className={`h-[56px] flex flex-col items-center justify-center gap-1 bg-primary text-black rounded-2xl transition-all hover:bg-emerald-400 shadow-xl shadow-primary/20 active:scale-95 ${!donationCode ? 'col-span-3' : 'col-span-1'}`}
                            >
                                <ArrowRight className="w-4 h-4 font-black" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Done</span>
                            </button>
                        </div>
                    </div>
                )}

                {status === 'pending' && (
                    <div className="flex flex-col items-center gap-8 text-center py-6">
                        <div className="w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-black text-white tracking-tighter">Processing</h2>
                            <p className="text-gray-500 font-medium leading-relaxed">{message}</p>
                        </div>
                        <div className="w-full grid grid-cols-2 gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="h-[54px] bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all shadow-lg active:scale-95"
                            >
                                Refresh
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="h-[54px] bg-amber-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 active:scale-95"
                            >
                                Dashboard
                            </button>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-8 text-center py-6">
                        <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <XCircle className="h-12 w-12 text-red-500" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-black text-white tracking-tighter">Oops!</h2>
                            <p className="text-gray-500 font-medium leading-relaxed">{message}</p>
                        </div>
                        <div className="w-full grid grid-cols-2 gap-4">
                            <button
                                onClick={() => navigate('/help')}
                                className="h-[54px] bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all shadow-lg active:scale-95"
                            >
                                Support
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="h-[54px] bg-red-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-400 transition-all shadow-xl shadow-red-500/20 active:scale-95"
                            >
                                Return
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
