import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Heart, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  ArrowLeft,
  GraduationCap,
  Activity,
  ShieldAlert,
  PawPrint,
  Leaf,
  Zap
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import NumberTicker from '../components/NumberTicker';
import AppearOnScroll from '../components/AppearOnScroll';

interface Category {
    id: string;
    slug: string;
    name: string;
    description: string;
    image_url: string;
    accent_color: string;
    icon_name: string;
    impact_label: string;
    impact_count: number;
    total_amount: string;
}

const iconMap: Record<string, any> = {
    'graduation-cap': GraduationCap,
    'activity': Activity,
    'shield-alert': ShieldAlert,
    'paw-print': PawPrint,
    'leaf': Leaf
};

const CategoryDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const [category, setCategory] = useState<Category | null>(null);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const catRes = await axios.get(`${API_BASE_URL}/categories/${slug}`);
                if (!catRes.data) throw new Error('Category not found');
                setCategory(catRes.data);

                // Fetch campaigns in this category
                const campRes = await axios.get(`${API_BASE_URL}/campaigns?category=${slug}`);
                setCampaigns(Array.isArray(campRes.data) ? campRes.data : []);
            } catch (err: any) {
                console.error('Failed to fetch category detail', err);
                setError(err.response?.data?.message || err.message || 'Failed to load category details');
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchData();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-6">
                <Zap className="h-12 w-12 text-primary animate-pulse" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Loading category details</p>
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-8 p-4 text-center">
                <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                    <Heart className="h-10 w-10 text-red-500 opacity-50" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white mb-2">Not Found</h2>
                    <p className="text-gray-500 font-medium max-w-sm mx-auto">{error || 'This category could not be reached at the moment.'}</p>
                </div>
                <Link to="/" className="px-8 py-3 bg-white/5 border border-white/10 text-white font-black rounded-xl hover:bg-white/10 transition-all text-xs uppercase tracking-widest">
                    Return to Home
                </Link>
            </div>
        );
    }

    const Icon = iconMap[category.icon_name] || Heart;

    return (
        <div className="min-h-screen bg-dark">
            {/* Hero Header */}
            <div className="relative h-[60vh] overflow-hidden">
                <img 
                    src={category.image_url} 
                    alt={category.name}
                    className="w-full h-full object-cover opacity-40 scale-105"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <Link to="/" className="mb-12 inline-flex items-center text-gray-400 hover:text-white transition-colors group">
                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Causes
                    </Link>
                    <div 
                        className="p-6 rounded-[2rem] mb-6 shadow-2xl animate-pulse"
                        style={{ backgroundColor: `${category.accent_color}1a`, border: `1px solid ${category.accent_color}33` }}
                    >
                        <Icon className="h-12 w-12" style={{ color: category.accent_color }} />
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight mb-4">
                        {category.name}
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl font-medium">
                        {category.description}
                    </p>
                </div>
            </div>

            {/* Impact Stats */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <AppearOnScroll delay={100}>
                        <div className="bg-[#18181B]/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Pool Value</p>
                            <NumberTicker 
                                value={parseFloat(category.total_amount)} 
                                prefix="NRs " 
                                className="text-4xl font-black text-white" 
                            />
                            <p className="text-xs font-bold text-primary mt-2 flex items-center gap-2">
                                <Zap className="h-3 w-3" />
                                Distributed to campaigns
                            </p>
                        </div>
                    </AppearOnScroll>
                    <AppearOnScroll delay={200}>
                        <div className="bg-[#18181B]/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">{category.impact_label}</p>
                            <NumberTicker 
                                value={category.impact_count || 120} 
                                suffix="+" 
                                className="text-4xl font-black text-white" 
                            />
                            <p className="text-xs font-bold text-indigo-400 mt-2 flex items-center gap-2">
                                <Users className="h-3 w-3" />
                                Community Impact
                            </p>
                        </div>
                    </AppearOnScroll>
                    <AppearOnScroll delay={300}>
                        <div className="bg-primary p-8 rounded-[2.5rem] shadow-2xl group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                <Icon className="h-24 w-24 text-black" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-black/60 mb-2 relative z-10">Make a difference</p>
                            <h4 className="text-2xl font-black text-black mb-6 relative z-10">Donate to this cause</h4>
                            <Link 
                                to={`/donate?categoryPoolId=${category.id}&name=${encodeURIComponent(category.name)}`}
                                className="inline-flex items-center justify-center px-8 py-3 bg-black text-white font-black rounded-xl hover:bg-black/80 transition-all text-xs uppercase tracking-widest relative z-10 shadow-lg"
                            >
                                Contribute Now
                            </Link>
                        </div>
                    </AppearOnScroll>
                </div>
            </div>

            {/* Smart Distribution Explanation & Active Campaigns */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="flex flex-col lg:flex-row gap-20">
                    {/* Left: Active Campaigns */}
                    <div className="flex-1 space-y-12">
                        <div>
                            <h3 className="text-3xl font-black text-white mb-2">Supported Initiatives</h3>
                            <p className="text-gray-500 font-medium font-sans">Your pool donation is split across these active verified campaigns.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {campaigns.length > 0 ? campaigns.map((campaign, i) => (
                                <AppearOnScroll key={campaign.id} delay={i * 50}>
                                    <div className="group bg-white/5 border border-white/5 rounded-3xl p-6 flex items-center gap-8 hover:border-white/10 transition-all">
                                        <div className="w-32 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                                            <img src={campaign.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="text-white font-black text-lg mb-1">{campaign.title}</h5>
                                            <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                                                <span>{Math.round((campaign.currentAmount / campaign.targetAmount) * 100)}% Funded</span>
                                                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-primary" 
                                                        style={{ width: `${(campaign.currentAmount / campaign.targetAmount) * 100}%` }} 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <Link to={`/campaigns/${campaign.id}`} className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                                            <TrendingUp className="h-5 w-5" />
                                        </Link>
                                    </div>
                                </AppearOnScroll>
                            )) : (
                                <div className="text-gray-600 py-12 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                                    No active campaigns in this category yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Distribution Trust Card */}
                    <div className="lg:w-96">
                        <div className="sticky top-24 p-8 glass-card rounded-[2.5rem] border border-white/5 space-y-8">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <ShieldCheck className="h-7 w-7 text-primary" />
                            </div>
                            <h4 className="text-xl font-black text-white">How it works</h4>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    <p className="text-sm font-medium text-gray-400">Funds are sent to campaigns that are closer to their deadline first.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    <p className="text-sm font-medium text-gray-400">100% of your donation reaches the campaign; there are no platform fees.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    <p className="text-sm font-medium text-gray-400">You will receive an update showing how your donation was used.</p>
                                </div>
                            </div>
                            <div className="pt-8 border-t border-white/5">
                                <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                                    <p className="text-[10px] font-black uppercase text-indigo-400 mb-1">Status</p>
                                    <p className="text-xs text-indigo-100 flex items-center gap-2">
                                        <TrendingUp className="h-3 w-3" />
                                        Pool updating regularly
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

export default CategoryDetail;
