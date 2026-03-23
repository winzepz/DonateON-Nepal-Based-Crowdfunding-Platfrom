import { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, MapPin, Shield, TrendingUp, Search, Filter } from 'lucide-react';
import CampaignCard from '../components/CampaignCard';
import { API_BASE_URL } from '../config';
import AppearOnScroll from '../components/AppearOnScroll';
import { GridSkeleton } from '../components/Skeleton';

interface Campaign {
    id: string;
    title: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    imageUrl: string;
    organizer: {
        name: string;
    };
}

const CampaignList = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/campaigns`);
                const data: Campaign[] = response.data;
                setCampaigns(data);
            } catch (error) {
                console.error('API unavailable', error);
                setCampaigns([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    const filteredCampaigns = campaigns
        .filter(c => 
            c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'newest') return 0; // Backend handles newest by default
            if (sortBy === 'most_funded') return b.currentAmount - a.currentAmount;
            if (sortBy === 'near_goal') {
                const aProgress = a.currentAmount / a.targetAmount;
                const bProgress = b.currentAmount / b.targetAmount;
                return bProgress - aProgress;
            }
            return 0;
        });

    const heroStats = [
        { label: 'Raised so far', value: 'NRs 2.4M', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        { label: 'Active campaigns', value: '1,250', icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-500/10 border-indigo-500/20' },
        { label: 'Donor community', value: '210k+', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' },
    ];

    const featuredCampaign = campaigns.length > 0
        ? campaigns.reduce((prev, current) => (prev.currentAmount > current.currentAmount) ? prev : current)
        : null;

    return (
        <div className="bg-dark min-h-screen pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16 relative z-10">
                {/* Hero Section */}
                <div className="glass-card rounded-[3rem] overflow-hidden border-white/5 bg-[#131316]/60 backdrop-blur-3xl shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-12 p-12 lg:p-16">
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                                    Discover
                                </div>
                                <h1 className="text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tight">
                                    Be the change <br/>they <span className="text-primary italic">seek.</span>
                                </h1>
                                <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-md">
                                    Every campaign is vetted for total transparency. Pick a cause and watch your impact grow.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4 pt-4">
                                {heroStats.map((stat) => {
                                    const Icon = stat.icon;
                                    return (
                                        <div key={stat.label} className={`flex items-center gap-6 p-6 rounded-[2rem] bg-dark border border-white/5 hover:border-white/10 transition-all group`}>
                                            <div className={`h-14 w-14 rounded-2xl ${stat.bg} ${stat.color} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                <Icon className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
                                                <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary via-indigo-600 to-indigo-800 text-white rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            {featuredCampaign ? (
                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-dark/20 flex items-center justify-center backdrop-blur-xl border border-white/10">
                                                <MapPin className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-white/50 font-black">Featured Cause</p>
                                                <h3 className="text-2xl font-black tracking-tight line-clamp-1">{featuredCampaign.title}</h3>
                                            </div>
                                        </div>
                                        <p className="text-white/70 font-medium leading-relaxed line-clamp-3">
                                            {featuredCampaign.description}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-12">
                                        <div className="rounded-2xl bg-dark/20 border border-white/10 backdrop-blur-xl p-5">
                                            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Raised</p>
                                            <p className="text-2xl font-black mt-1">NRs {(featuredCampaign.currentAmount / 1000).toFixed(1)}K</p>
                                        </div>
                                        <div className="rounded-2xl bg-dark/20 border border-white/10 backdrop-blur-xl p-5">
                                            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Goal</p>
                                            <p className="text-2xl font-black mt-1">NRs {(featuredCampaign.targetAmount / 1000).toFixed(1)}K</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative z-10 space-y-6 flex flex-col items-center justify-center h-full opacity-40">
                                    <TrendingUp className="h-12 w-12 animate-pulse" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Synthesizing Causes...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search causes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-16 pr-8 py-5 bg-[#131316] border-2 border-white/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-white placeholder-gray-600"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Filter className="h-4 w-4 text-gray-600" />
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-[#131316] border-2 border-white/5 text-white rounded-2xl px-6 py-5 focus:outline-none focus:border-primary/20 font-black text-[10px] uppercase tracking-widest appearance-none cursor-pointer hover:bg-white/5 transition-all min-w-[200px]"
                        >
                            <option value="newest">Newest First</option>
                            <option value="most_funded">Most Funded</option>
                            <option value="near_goal">Near Goal</option>
                        </select>
                    </div>
                </div>

                {/* Campaigns Grid */}
                {loading ? (
                    <GridSkeleton count={6} />
                ) : filteredCampaigns.length > 0 ? (
                    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredCampaigns.map((campaign, i) => (
                            <AppearOnScroll key={campaign.id} delay={i * 100} threshold={0.05}>
                                <CampaignCard
                                    id={campaign.id}
                                    title={campaign.title}
                                    description={campaign.description}
                                    imageUrl={campaign.imageUrl}
                                    organizerName={campaign.organizer?.name}
                                    currentAmount={campaign.currentAmount}
                                    targetAmount={campaign.targetAmount}
                                />
                            </AppearOnScroll>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 space-y-4">
                        <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                            <Search className="h-8 w-8 text-gray-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white">No causes found</h3>
                            <p className="text-gray-500 font-medium">Try adjusting your search or filters to find what you're looking for.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampaignList;
