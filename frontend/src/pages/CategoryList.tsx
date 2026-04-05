import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowRight, 
  Search, 
  Filter,
  GraduationCap,
  Activity,
  ShieldAlert,
  PawPrint,
  Leaf,
  Heart,
  TrendingUp,
  Zap
} from 'lucide-react';
import { API_BASE_URL } from '../config';
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
    total_amount: string;
}

const iconMap: Record<string, any> = {
    'graduation-cap': GraduationCap,
    'activity': Activity,
    'shield-alert': ShieldAlert,
    'paw-print': PawPrint,
    'leaf': Leaf
};

const CategoryList = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/categories`);
                setCategories(res.data);
            } catch (error) {
                console.error('Failed to fetch categories', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-6">
                <Zap className="h-12 w-12 text-primary animate-pulse" />
                <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Loading Causes</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark">
            {/* Header Section */}
            <div className="relative py-24 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl">
                        <h2 className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-4">Discovery</h2>
                        <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight leading-[1.05] mb-8">
                            Impact <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Categories</span>
                        </h1>
                        <p className="text-xl text-gray-400 font-medium leading-relaxed">
                            Support broad causes instead of individual campaigns. We use data-driven logic to distribute your funds where they are needed most.
                        </p>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="mt-16 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 transition-colors group-focus-within:text-primary" />
                            <input 
                                type="text"
                                placeholder="Search causes (e.g. Health, Education...)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-16 pr-6 text-white placeholder-gray-600 focus:outline-none focus:border-primary/30 focus:bg-white/[0.07] transition-all"
                            />
                        </div>
                        <button className="h-16 px-8 bg-white/5 border border-white/5 rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3">
                            <Filter className="h-5 w-5" />
                            <span className="text-sm font-bold uppercase tracking-widest">Filter</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCategories.length > 0 ? filteredCategories.map((category, i) => {
                        const Icon = iconMap[category.icon_name] || Heart;
                        return (
                            <AppearOnScroll key={category.id} delay={i * 50}>
                                <div className="group relative bg-[#18181B] rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden flex flex-col h-full shadow-2xl">
                                    <div className="relative h-64 overflow-hidden">
                                        <img 
                                            src={category.image_url} 
                                            alt={category.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-transparent" />
                                        
                                        <div 
                                            className="absolute top-6 left-6 p-4 rounded-2xl backdrop-blur-md border border-white/10"
                                            style={{ backgroundColor: `${category.accent_color}33` }}
                                        >
                                            <Icon className="h-6 w-6" style={{ color: category.accent_color }} />
                                        </div>
                                    </div>

                                    <div className="p-10 flex flex-col flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: category.accent_color }} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Community Fund</span>
                                        </div>
                                        
                                        <h3 className="text-3xl font-black text-white mb-4 group-hover:text-primary transition-colors tracking-tight">
                                            {category.name}
                                        </h3>
                                        
                                        <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8 line-clamp-3">
                                            {category.description}
                                        </p>

                                        <div className="mt-auto pt-8 border-t border-white/5 flex flex-col gap-6">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Distributed</p>
                                                    <p className="text-2xl font-mono font-black text-white">
                                                        NRs {parseFloat(category.total_amount).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="p-3 bg-white/5 rounded-xl">
                                                    <TrendingUp className="h-5 w-5 text-primary" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <Link 
                                                    to={`/categories/${category.slug}`}
                                                    className="inline-flex items-center justify-center py-4 bg-white/5 border border-white/10 text-white font-black rounded-xl hover:bg-white/10 transition-all text-[10px] uppercase tracking-widest"
                                                >
                                                    View Details
                                                </Link>
                                                <Link 
                                                    to={`/donate?categoryPoolId=${category.id}&name=${encodeURIComponent(category.name)}`}
                                                    className="inline-flex items-center justify-center py-4 bg-primary text-black font-black rounded-xl hover:bg-emerald-400 transition-all text-[10px] uppercase tracking-widest shadow-xl shadow-primary/10"
                                                >
                                                    Donate
                                                    <ArrowRight className="ml-2 h-3.3 w-3.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </AppearOnScroll>
                        );
                    }) : (
                        <div className="col-span-full py-32 text-center">
                            <Search className="h-12 w-12 text-gray-700 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-white mb-2">No categories found</h3>
                            <p className="text-gray-500 font-medium">Try searching for a different keyword.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryList;
