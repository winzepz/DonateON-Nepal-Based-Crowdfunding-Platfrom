import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Heart, Target, Wallet, Copy, TrendingUp, Plus, Settings, LogOut, Layout, Clock } from 'lucide-react';
import CampaignCard from '../components/CampaignCard';
import { API_BASE_URL } from '../config';
import { gsap } from 'gsap';
import AppearOnScroll from '../components/AppearOnScroll';
import { GridSkeleton, TableSkeleton } from '../components/Skeleton';

const Dashboard = () => {
    const { isAuthenticated, user, token, logout } = useAuth();
    const [ownedCampaigns, setOwnedCampaigns] = useState<any[]>([]);
    const [supportedCampaigns, setSupportedCampaigns] = useState<any[]>([]);
    const [userStats, setUserStats] = useState({ totalImpact: 0, thisMonth: 0 });
    const [loading, setLoading] = useState(true);
    const [donations, setDonations] = useState<any[]>([]);
    const [badges, setBadges] = useState<any[]>([]);
    const [copiedCode, setCopiedCode] = useState('');

    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
    const [payoutAmount, setPayoutAmount] = useState('');
    const dashboardRef = useRef<HTMLDivElement>(null);

    const isFundraiser = user?.role === 'CAMPAIGN_CREATOR' || user?.role === 'ADMIN';

    const handleRequestPayout = (campaign: any) => {
        setSelectedCampaign(campaign);
        setShowPayoutModal(true);
    };

    const submitPayout = async () => {
        try {
            if (!selectedCampaign) return;
            const bankName = (document.getElementById('bankName') as HTMLInputElement).value;
            const accountNumber = (document.getElementById('accountNumber') as HTMLInputElement).value;
            const accountHolderName = (document.getElementById('accountHolder') as HTMLInputElement).value;

            await axios.post(`${API_BASE_URL}/payouts/request`, {
                campaignId: selectedCampaign.id,
                amount: parseFloat(payoutAmount),
                bankName,
                accountNumber,
                accountHolderName
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShowPayoutModal(false);
            setPayoutAmount('');
            alert('Payout requested successfully!');
        } catch (error) {
            console.error('Payout request failed', error);
            alert('Failed to request payout');
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(''), 2000);
    };

    useEffect(() => {
        if (!isAuthenticated || !token) return;

        const fetchData = async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };

                if (isFundraiser) {
                    const res = await axios.get(`${API_BASE_URL}/campaigns/my/created`, { headers });
                    setOwnedCampaigns(res.data);
                }

                const supportedRes = await axios.get(`${API_BASE_URL}/campaigns/my/supported`, { headers });
                setSupportedCampaigns(supportedRes.data);

                const statsRes = await axios.get(`${API_BASE_URL}/stats/user`, { headers });
                setUserStats(statsRes.data);

                const donRes = await axios.get(`${API_BASE_URL}/donations/me`, { headers });
                setDonations(donRes.data);

                const badgeRes = await axios.get(`${API_BASE_URL}/donations/me/badges`, { headers });
                setBadges(badgeRes.data);
            } catch (err) {
                console.error('Dashboard data fetch error', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // GSAP Entrance
        const ctx = gsap.context(() => {
            gsap.from(".dash-sidebar > *", {
                x: -20,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out"
            });
            gsap.from(".dash-main-header > *", {
                y: 20,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out"
            });
        }, dashboardRef);

        return () => ctx.revert();
    }, [isAuthenticated, token, isFundraiser]);

    if (!isAuthenticated) return null;

    return (
        <div ref={dashboardRef} className="min-h-screen pb-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* Left Side: Profile Summary & Quick Stats */}
                    <div className="dash-sidebar w-full lg:w-80 space-y-6 lg:sticky lg:top-24">
                        <div className="glass-card rounded-[2.5rem] p-8 border-white/5 bg-[#131316]/60 backdrop- shadow-2xl overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                            
                            <div className="relative z-10 space-y-6 text-center lg:text-left">
                                <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-[#18181B] to-[#27272A] border-4 border-[#09090B] shadow-2xl flex items-center justify-center text-4xl font-black text-primary mx-auto lg:mx-0">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-white tracking-tight">{user?.name}</h2>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{user?.role?.replace('_', ' ')}</p>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                                    <Link to="/profile" className="p-3 rounded-xl bg-dark/5 text-gray-400 hover:text-white hover:bg-dark/10 transition-all shadow-xl">
                                        <Settings className="h-4 w-4" />
                                    </Link>
                                    <button onClick={logout} className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl">
                                        <LogOut className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Impact Card */}
                        <div className="glass-card rounded-[2rem] p-6 border-white/5 bg-gradient-to-br from-primary/10 to-[#131316] shadow-xl space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Impact</span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-white tracking-tighter">
                                    NRs {userStats.totalImpact.toLocaleString()}
                                </h3>
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">NRs {userStats.thisMonth.toLocaleString()} this month</p>
                            </div>
                        </div>

                        {/* Recent Badges Mini-Grid */}
                        {badges.length > 0 && (
                            <div className="glass-card rounded-[2rem] p-6 border-white/5 bg-[#131316]/40 shadow-xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Achievements</span>
                                    <Link to="/badges" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline leading-none">View All</Link>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {badges.slice(0, 4).map((b, i) => (
                                        <div key={i} className={`aspect-square rounded-xl flex items-center justify-center text-lg ${b.earned ? 'bg-primary/20 grayscale-0 shadow-lg shadow-primary/10' : 'bg-dark/5 grayscale opacity-30 cursor-not-allowed'}`} title={b.title}>
                                            {b.icon}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Main Dashboard Content */}
                    <div className="flex-grow space-y-10 w-full lg:w-2/3">
                        <header className="dash-main-header flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div className="space-y-1">
                                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter">Dashboard</h1>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em]">{isFundraiser ? 'Campaign Management' : 'Donation Activity'}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                {isFundraiser && (
                                    <Link to="/create-campaign" className="btn-premium flex items-center gap-2">
                                        <Plus className="h-5 w-5" />
                                        Launch New
                                    </Link>
                                )}
                            </div>
                        </header>

                        {/* Managed Campaigns Section */}
                        {isFundraiser && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                        <Layout className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Active Campaigns</h2>
                                </div>
                                
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {loading ? (
                                        <GridSkeleton count={2} />
                                    ) : ownedCampaigns.length > 0 ? (
                                        ownedCampaigns.map(c => (
                                            <div key={c.id} className="relative group/card">
                                                <CampaignCard
                                                    id={c.id}
                                                    title={c.title}
                                                    description={c.description}
                                                    imageUrl={c.imageUrl}
                                                    currentAmount={c.currentAmount}
                                                    targetAmount={c.targetAmount}
                                                />
                                                <div className="absolute top-6 right-6 z-20 flex gap-2 translate-y-2 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-300">
                                                    <button 
                                                        onClick={() => handleRequestPayout(c)}
                                                        className="px-4 py-2 bg-dark text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-2xl hover:bg-primary transition-colors"
                                                    >
                                                        Payout
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-2 glass-card rounded-[2.5rem] p-20 text-center border-white/5 border-dashed border-2 bg-transparent opacity-50">
                                            <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                                            <p className="text-lg font-black text-gray-500">No active campaigns yet</p>
                                            <Link to="/create-campaign" className="text-primary font-black mt-2 inline-block">Start your first campaign →</Link>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Supported Campaigns - For Donors */}
                        {!loading && supportedCampaigns.length > 0 && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                        <Heart className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Supported Campaigns</h2>
                                </div>
                                
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {supportedCampaigns.map(c => (
                                        <CampaignCard
                                            key={c.id}
                                            id={c.id}
                                            title={c.title}
                                            description={c.description}
                                            imageUrl={c.imageUrl}
                                            currentAmount={c.currentAmount}
                                            targetAmount={c.targetAmount}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Donation History List - More Streamlined */}
                        <section className="space-y-6 pt-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                                        <Wallet className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Transaction History</h2>
                                </div>
                                <p className="text-xs font-bold text-gray-500">Last 10 entries</p>
                            </div>

                            <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 bg-[#131316]/40 backdrop- shadow-xl">
                                {loading ? (
                                    <TableSkeleton rows={4} />
                                ) : donations.length > 0 ? (
                                    <div className="divide-y divide-white/5">
                                        {donations.slice(0, 10).map((d: any, i) => (
                                            <AppearOnScroll key={d.id} delay={i * 50} direction="none" threshold={0.01}>
                                                <div className="p-6 hover:bg-dark/5 transition-colors group/row">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 rounded-2xl bg-dark/5 flex items-center justify-center text-gray-400 group-hover/row:bg-primary group-hover/row:text-white transition-all">
                                                                <Clock className="h-5 w-5" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h4 className="font-black text-white text-lg tracking-tight group-hover/row:text-primary transition-colors">{d.campaignTitle}</h4>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{new Date(d.createdAt).toLocaleDateString('en-NP')}</span>
                                                                    <div className="h-1 w-1 rounded-full bg-gray-700" />
                                                                    <button onClick={() => copyCode(d.donationCode || d.trackingCode)} className="text-[10px] font-black text-primary hover:underline flex items-center gap-1">
                                                                        {d.donationCode || d.trackingCode} <Copy className="h-3 w-3" />
                                                                    </button>
                                                                    {copiedCode === (d.donationCode || d.trackingCode) && <span className="text-[8px] font-black text-emerald-500 uppercase animate-in fade-in zoom-in">Copied!</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex items-center sm:block gap-4">
                                                            <p className="text-2xl font-black text-white tracking-tighter">Rs {parseFloat(d.amount).toLocaleString()}</p>
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Success</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AppearOnScroll>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-20 text-center opacity-30">
                                        <Heart className="h-12 w-12 mx-auto mb-4" />
                                        <p className="font-black text-lg text-white tracking-widest uppercase">Zero footprints yet</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* Payout Modal Redesign */}
            {showPayoutModal && selectedCampaign && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="glass-card rounded-[3rem] p-10 max-w-lg w-full shadow-[0_0_100px_rgba(0,0,0,0.8)] border-white/5 bg-[#131316] animate-in zoom-in-95 duration-300">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary mb-8 shadow-2xl shadow-primary/20">
                            <Wallet className="h-8 w-8" />
                        </div>
                        <h3 className="text-3xl font-black text-white tracking-tighter mb-2">Request Payout</h3>
                        <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed">
                            Withdraw funds from <span className="text-white font-black">{selectedCampaign.title}</span>. 
                            Available balance: <span className="text-primary font-black">NRs {parseFloat(selectedCampaign.currentAmount).toLocaleString()}</span>
                        </p>

                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-1">Withdrawal Amount (NRs)</label>
                                <input
                                    type="number"
                                    value={payoutAmount}
                                    onChange={e => setPayoutAmount(e.target.value)}
                                    className="w-full bg-[#18181B] border-2 border-transparent focus:border-primary rounded-2xl px-6 py-4 font-black text-white transition-all outline-none"
                                    placeholder="Enter Amount"
                                />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-1">Bank Name</label>
                                    <input id="bankName" className="w-full bg-[#18181B] border-2 border-transparent focus:border-primary rounded-2xl px-6 py-4 font-bold text-white transition-all outline-none" placeholder="e.g. NIC Asia" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-1">Account Number</label>
                                    <input id="accountNumber" className="w-full bg-[#18181B] border-2 border-transparent focus:border-primary rounded-2xl px-6 py-4 font-bold text-white transition-all outline-none" placeholder="xxxx-xxxx-xxxx" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-1">Account Holder Name</label>
                                <input id="accountHolder" className="w-full bg-[#18181B] border-2 border-transparent focus:border-primary rounded-2xl px-6 py-4 font-bold text-white transition-all outline-none" placeholder="Full Name" />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mt-10">
                            <button onClick={() => setShowPayoutModal(false)} className="flex-1 py-5 rounded-2xl font-black text-gray-500 hover:bg-dark/5 transition-all uppercase tracking-[0.2em]">Close</button>
                            <button onClick={submitPayout} className="flex-1 py-5 rounded-2xl bg-primary text-black font-black hover:bg-emerald-400 shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1 uppercase tracking-[0.2em]">Confirm Payout</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

