import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Home, LayoutDashboard, User, Shield, LifeBuoy, TrendingUp, LogOut, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface SearchResult {
    id: string;
    title: string;
    type: 'PAGE' | 'CAMPAIGN' | 'ACTION';
    path: string;
    icon: any;
}

const CommandCenter = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    // Default Quick Links
    const quickLinks: SearchResult[] = [
        { id: 'home', title: 'Go to Home', type: 'PAGE', path: '/', icon: Home },
        { id: 'dash', title: 'User Dashboard', type: 'PAGE', path: '/dashboard', icon: LayoutDashboard },
        { id: 'profile', title: 'Manage Profile', type: 'PAGE', path: '/profile', icon: User },
        { id: 'support', title: 'Get Help (Support)', type: 'PAGE', path: '/support', icon: LifeBuoy },
        { id: 'campaigns', title: 'Browse Campaigns', type: 'PAGE', path: '/campaigns', icon: TrendingUp },
    ];

    if (user?.role === 'ADMIN') {
        quickLinks.splice(2, 0, { id: 'admin', title: 'Admin Control Center', type: 'PAGE', path: '/admin', icon: Shield });
    }

    const performSearch = useCallback(async (q: string) => {
        if (!q.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            // Search Campaigns from API
            const res = await axios.get(`${API_BASE_URL}/campaigns`);
            const campaigns = res.data;
            
            const filteredCampaigns = campaigns
                .filter((c: any) => c.title.toLowerCase().includes(q.toLowerCase()))
                .slice(0, 5)
                .map((c: any) => ({
                    id: c.id,
                    title: c.title,
                    type: 'CAMPAIGN',
                    path: `/campaigns/${c.id}`,
                    icon: TrendingUp
                }));

            // Actions Search
            const actions: SearchResult[] = [];
            if ("logout".includes(q.toLowerCase())) {
                actions.push({ id: 'logout', title: 'Sign Out / Logout', type: 'ACTION', path: 'LOGOUT', icon: LogOut });
            }

            setResults([...filteredCampaigns, ...actions]);
        } catch (err) {
            console.error('Search failed', err);
        } finally {
            setLoading(false);
        }
    }, [user?.role]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            performSearch(query);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query, performSearch]);

    // Handle Keyboard Navigation (Esc to close)
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
              e.preventDefault();
              onClose(); // Toggle
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSelect = (result: SearchResult) => {
        if (result.path === 'LOGOUT') {
            logout();
        } else {
            navigate(result.path);
        }
        onClose();
        setQuery('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10001] flex items-start justify-center pt-20 sm:pt-40 px-4 sm:px-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-dark/80 backdrop-blur-2xl"
                    />

                    {/* Search Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-2xl bg-[#131316] border border-white/5 rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,1)] overflow-hidden flex flex-col"
                    >
                        <div className="flex items-center p-6 border-b border-white/5">
                            <Search className="h-6 w-6 text-primary mr-4" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search for pages, campaigns, or actions..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1 bg-transparent border-none text-xl font-bold text-white placeholder-gray-600 focus:outline-none focus:ring-0"
                            />
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-gray-400">ESC</span>
                                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                            {!query && (
                                <div className="space-y-6 p-2">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Quick Navigation</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {quickLinks.map(link => (
                                                <button
                                                    key={link.id}
                                                    onClick={() => handleSelect(link)}
                                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] hover:bg-primary/10 border border-white/5 hover:border-primary/20 transition-all text-left group"
                                                >
                                                    <div className="h-10 w-10 rounded-xl bg-dark border border-white/5 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                                        <link.icon size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-sm">{link.title}</p>
                                                        <p className="text-[10px] font-medium text-gray-500 line-clamp-1">{link.path}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                                                <Command size={24} />
                                            </div>
                                            <div>
                                                <p className="font-black text-white">Power Search</p>
                                                <p className="text-xs font-medium text-primary/60">Type to find campaigns across Nepal</p>
                                            </div>
                                        </div>
                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                    </div>
                                </div>
                            )}

                            {query && (
                                <div className="space-y-1">
                                    {loading && <div className="p-8 text-center text-gray-500 font-bold animate-pulse">Scanning the ecosystem...</div>}
                                    
                                    {!loading && results.length === 0 && (
                                        <div className="p-12 text-center space-y-4">
                                            <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                                <Search className="h-8 w-8 text-gray-700" />
                                            </div>
                                            <p className="text-gray-500 font-bold">No results found for "{query}"</p>
                                        </div>
                                    )}

                                    {results.map(result => (
                                        <button
                                            key={result.id + result.type}
                                            onClick={() => handleSelect(result)}
                                            className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-left group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${
                                                    result.type === 'CAMPAIGN' ? 'bg-indigo-500/10 text-indigo-400' : 
                                                    result.type === 'ACTION' ? 'bg-rose-500/10 text-rose-500' : 
                                                    'bg-primary/10 text-primary'
                                                }`}>
                                                    <result.icon size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-white text-sm">{result.title}</p>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{result.type}</span>
                                                </div>
                                            </div>
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary font-black text-xs">JUMP TO →</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-dark/50 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            <div className="flex items-center gap-6 px-4">
                                <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-white">⏎</kbd> to select</span>
                                <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-white">↑↓</kbd> to navigate</span>
                            </div>
                            <div className="flex items-center gap-2 group cursor-default px-4">
                                <span className="group-hover:text-primary transition-colors">Unified Command</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandCenter;
