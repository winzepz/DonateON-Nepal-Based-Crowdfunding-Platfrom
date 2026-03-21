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
    const [showBadgeModal, setShowBadgeModal] = useState(false);
    const verificationAttempted = useRef(false);

    useEffect(() => {
        if (verificationAttempted.current) return;
        verificationAttempted.current = true;

        const verifyPayment = async () => {
            try {
                const data = searchParams.get('data'); // eSewa sends 'data'
                if (data) {
                    const res = await axios.get(`${API_BASE_URL}/payment/verify/esewa?data=${data}`);
                    setDonationCode(res.data.donationCode || '');
                    setNewBadges(res.data.newBadges || []);
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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full " />
                <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-blue-500/5 rounded-full " />
            </div>

            {/* Badge Modal */}
            {showBadgeModal && newBadges.length > 0 && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/40 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-purple-500/20 text-center animate-in zoom-in-95 duration-300">
                        <div className="text-5xl mb-2">🎉</div>
                        <h2 className="text-2xl font-extrabold text-white mb-2">Badge{newBadges.length > 1 ? 's' : ''} Earned!</h2>
                        <p className="text-slate-400 text-sm mb-6">You've unlocked {newBadges.length > 1 ? `${newBadges.length} new badges` : 'a new badge'}!</p>
                        <div className="space-y-3 mb-6">
                            {newBadges.map(badge => (
                                <div key={badge.slug} className="flex items-center gap-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 text-left">
                                    <span className="text-3xl">{badge.icon}</span>
                                    <div>
                                        <p className="font-bold text-white">{badge.title}</p>
                                        <p className="text-slate-400 text-xs">{badge.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowBadgeModal(false)}
                                className="flex-1 py-3 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-colors"
                            >
                                Continue
                            </button>
                            <Link
                                to="/badges"
                                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity text-center"
                            >
                                View All Badges
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl max-w-lg w-full p-8 shadow-2xl text-white">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center gap-5 text-center py-4">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold">Verifying Payment</h2>
                        <p className="text-slate-400">Please wait while we confirm your donation...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-5 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                                <CheckCircle className="h-10 w-10 text-emerald-400" />
                            </div>
                            {/* Confetti circles */}
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-extrabold text-white mb-2">Donation Successful!</h2>
                            <p className="text-slate-400 text-sm">{message}</p>
                        </div>

                        {donationCode && (
                            <div className="w-full">
                                <p className="text-xs uppercase tracking-widest text-slate-400 mb-3 font-semibold">Your Donation Code</p>
                                <div className="bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-5 flex items-center justify-between gap-3">
                                    <span className="font-mono font-bold text-xl text-emerald-400 tracking-wider flex-grow text-center">
                                        {donationCode}
                                    </span>
                                    <button
                                        onClick={copyCode}
                                        className="flex-shrink-0 p-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors"
                                        title="Copy code"
                                    >
                                        <Copy className={`w-4 h-4 ${copied ? 'text-emerald-400' : 'text-slate-400'}`} />
                                    </button>
                                </div>
                                <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                                    Save this code! Use it to verify your donation at <strong>DonateOn.com/verify</strong>
                                </p>
                            </div>
                        )}

                        {newBadges.length > 0 && (
                            <div className="w-full bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-purple-500/15 transition-colors"
                                onClick={() => setShowBadgeModal(true)}>
                                <Award className="w-6 h-6 text-purple-400 flex-shrink-0" />
                                <div className="flex-grow text-left">
                                    <p className="font-semibold text-white text-sm">You earned {newBadges.length} new badge{newBadges.length > 1 ? 's' : ''}!</p>
                                    <p className="text-purple-400 text-xs">{newBadges.map(b => b.icon + ' ' + b.title).join(', ')}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-500" />
                            </div>
                        )}

                        <div className="w-full flex gap-3 mt-2">
                            {donationCode && (
                                <Link
                                    to={`/verify?code=${donationCode}`}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-700/60 border border-slate-600/50 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors text-sm"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Verify
                                </Link>
                            )}
                            {typeof navigator.share === 'function' && donationCode && (
                                <button
                                    onClick={shareCode}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-700/60 border border-slate-600/50 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors text-sm"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-400 hover:to-teal-400 transition-all text-sm"
                            >
                                Dashboard
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {status === 'pending' && (
                    <div className="flex flex-col items-center gap-5 text-center">
                        <div className="w-20 h-20 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                            <Loader2 className="h-10 w-10 text-amber-400 animate-spin" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Payment Pending</h2>
                            <p className="text-slate-400 text-sm mt-2">{message}</p>
                        </div>
                        <div className="flex gap-3 mt-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors text-sm"
                            >
                                Check Again
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity text-sm"
                            >
                                Dashboard
                            </button>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-5 text-center">
                        <div className="w-20 h-20 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                            <XCircle className="h-10 w-10 text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
                            <p className="text-slate-400 text-sm mt-2">{message}</p>
                        </div>
                        <div className="flex gap-3 mt-2">
                            <button
                                onClick={() => navigate('/help')}
                                className="px-4 py-3 text-slate-400 font-medium hover:text-white transition-colors text-sm"
                            >
                                Contact Support
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors text-sm"
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
