import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Share2, Clock, Target, Heart, ShieldCheck, Wallet, Landmark } from 'lucide-react';
import VerificationBadge from '../components/VerificationBadge';
import { API_BASE_URL } from '../config';

interface Donation {
    id: number;
    amount: number;
    createdAt: string;
    isAnonymous: boolean;
    user: {
        name: string;
        kycStatus?: string;
    } | null;
}

interface Campaign {
    id: string;
    title: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    releasedAmount: number;
    imageUrl: string;
    deadline: string;
    organizer: {
        name: string;
        kycStatus?: string;
    };
    donations: Donation[];
}

const CampaignDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/campaigns/${id}`);
                setCampaign(response.data);
            } catch (error) {
                console.error('API unavailable', error);
                setCampaign(null);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaign();
    }, [id]);

    if (loading) return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!campaign) return <div className="text-center p-10">Campaign not found</div>;

    const progress = Math.min((campaign.currentAmount / campaign.targetAmount) * 100, 100);
    const daysLeft = campaign.deadline ? Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return (
        <div className="bg-dark min-h-screen py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="glass-card rounded-[3rem] overflow-hidden border-white/5 bg-[#131316]/60 backdrop-blur-3xl shadow-2xl">
                    <div className="h-96 w-full bg-dark relative overflow-hidden">
                        {campaign.imageUrl && (
                            <img src={campaign.imageUrl} alt={campaign.title} className="h-full w-full object-cover opacity-80" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#131316] via-transparent to-transparent" />
                        <div className="absolute top-8 right-8 flex gap-3">
                            <button className="h-12 w-12 bg-dark/80 rounded-2xl border border-white/10 flex items-center justify-center text-white hover:text-primary transition-all">
                                <Share2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 p-10 lg:p-16">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-12">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <ShieldCheck className="h-4 w-4" />
                                    Verified Cause
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">{campaign.title}</h1>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                                        <Landmark className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-500">
                                        Organized by <span className="text-white font-black ml-1">{campaign.organizer?.name || 'Unknown'}</span>
                                    </span>
                                    <VerificationBadge status={campaign.organizer?.kycStatus} showLabel={true} />
                                </div>
                            </div>

                            <div className="space-y-6 text-gray-500 text-lg font-medium leading-relaxed max-w-3xl">
                                <p>{campaign.description}</p>
                                <p className="text-sm text-gray-600">
                                    Funds cover essentials like food, medical kits, temporary shelters, and logistics to reach families in hard-to-access zones.
                                    Every update will be posted to backers weekly.
                                </p>
                            </div>

                            <div className="glass-card rounded-[2.5rem] p-10 space-y-8 bg-white/5 border-white/5">
                                <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                                    <Heart className="h-6 w-6 text-primary" />
                                    <h3 className="text-xl font-black text-white tracking-tight">Recent Donors</h3>
                                </div>
                                {campaign.donations.length > 0 ? (
                                    <div className="space-y-4">
                                        {campaign.donations.map((donation) => (
                                            <div key={donation.id} className="flex items-center justify-between bg-dark p-6 rounded-[1.5rem] border border-white/5 group hover:border-white/10 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black">
                                                        {donation.isAnonymous ? 'A' : (donation.user?.name?.[0] || 'A')}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white flex items-center gap-2">
                                                            {donation.isAnonymous ? 'Anonymous' : (donation.user?.name || 'Anonymous Donor')}
                                                            {!donation.isAnonymous && donation.user?.kycStatus && (
                                                                <VerificationBadge status={donation.user.kycStatus} />
                                                            )}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{new Date(donation.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <span className="text-lg font-black text-emerald-500 tracking-tight">NRs {donation.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-600 italic font-medium">No donations yet. Be the first to make an impact!</p>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="glass-card p-10 rounded-[2.5rem] bg-[#1a1a1e] border-white/10 shadow-2xl sticky top-24 space-y-10">
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-4xl font-black text-white tracking-tight leading-none">NRs {campaign.currentAmount.toLocaleString()}</span>
                                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Successfully raised so far</span>
                                    </div>
                                    <p className="text-xs font-bold text-gray-600">of NRs {campaign.targetAmount.toLocaleString()} target goal</p>
                                    <div className="relative h-4 bg-white/5 rounded-full overflow-hidden p-1 shadow-inner">
                                        <div className="bg-primary h-full rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest text-right">{progress.toFixed(0)}% funded</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-2xl bg-dark/50 p-5 border border-white/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Target className="h-4 w-4 text-primary" />
                                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Goal</p>
                                        </div>
                                        <p className="text-sm font-black text-white tracking-tight">NRs {campaign.targetAmount.toLocaleString()}</p>
                                    </div>
                                    <div className="rounded-2xl bg-dark/50 p-5 border border-white/5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="h-4 w-4 text-primary" />
                                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Left</p>
                                        </div>
                                        <p className="text-sm font-black text-white tracking-tight">{daysLeft > 0 ? `${daysLeft} days` : 'Ended'}</p>
                                    </div>
                                </div>

                                {/* Financial Governance Breakdown */}
                                <div className="rounded-3xl border border-indigo-500/10 bg-indigo-500/5 p-6 space-y-6">
                                    <div className="flex items-center gap-3 text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                                        <ShieldCheck className="h-4 w-4" />
                                        Governance & Audits
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-bold flex items-center gap-2"><Wallet className="h-4 w-4 opacity-30" /> Total Raised</span>
                                            <span className="font-black text-white">NRs {campaign.currentAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-bold flex items-center gap-2"><Clock className="h-4 w-4 opacity-30" /> In Escrow</span>
                                            <span className="font-black text-indigo-400">NRs {(campaign.currentAmount - campaign.releasedAmount).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs border-t border-white/5 pt-4">
                                            <span className="text-gray-500 font-bold flex items-center gap-2"><Landmark className="h-4 w-4 opacity-30" /> Disbursed</span>
                                            <span className="font-black text-emerald-500">NRs {campaign.releasedAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-600 italic font-medium leading-relaxed">
                                        Escrow funds are only released after admin verification of field utilization plans.
                                    </p>
                                </div>

                                <Link
                                    to={`/donate?campaignId=${campaign.id}`}
                                    className="w-full flex justify-center items-center gap-3 py-5 px-6 bg-primary hover:bg-emerald-400 text-black font-black rounded-2xl transition-all shadow-2xl shadow-primary/20 text-sm uppercase tracking-widest"
                                >
                                    Donate Now
                                </Link>

                                <div className="rounded-2xl bg-white/5 border border-white/5 p-6 space-y-4">
                                    <div className="flex items-center gap-3 font-black text-white text-[10px] uppercase tracking-widest">
                                        <ShieldCheck className="h-4 w-4 text-primary" />
                                        Safe Giving
                                    </div>
                                    <p className="text-xs font-medium text-gray-500 leading-relaxed">
                                        Every NRs is tracked and disbursed to verified partners. Receipts and field updates posted weekly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetails;
