import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';

const Breadcrumbs = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // If we're on the landing page, don't show breadcrumbs
    if (pathnames.length === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="h-8 w-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 group"
                    title="Go Back"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>

                <nav className="flex items-center space-x-2 text-gray-500 overflow-x-auto no-scrollbar py-1">
                    <Link 
                        to="/" 
                        className="hover:text-primary transition-colors flex items-center gap-1.5 group"
                    >
                        <Home size={12} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] hidden xs:inline">Home</span>
                    </Link>
                    
                    {pathnames.map((name, index) => {
                        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                        const isLast = index === pathnames.length - 1;
                        
                        // Format label
                        let label = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
                        
                        // Smart Labels
                        if (name.length > 20) label = "Records";
                        if (name === 'kyc') label = "Verification";
                        if (name === 'payouts') label = "Treasury";
                        if (name === 'admin') label = "Oversight";
                        if (name === 'dashboard') label = "Dashboard";
                        if (name === 'create-campaign') label = "Genesis";
                        if (name === 'campaigns' && !isLast) label = "Navigator";

                        return (
                            <div key={name} className="flex items-center space-x-2">
                                <ChevronRight size={10} className="opacity-20 flex-shrink-0" />
                                {isLast ? (
                                    <span className="text-primary text-[8px] font-black uppercase tracking-[0.2em] truncate max-w-[120px]">
                                        {label}
                                    </span>
                                ) : (
                                    <Link 
                                        to={routeTo} 
                                        className="hover:text-white transition-colors text-[8px] font-black uppercase tracking-[0.2em] whitespace-nowrap"
                                    >
                                        {label}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Path metadata indicator */}
            <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-full">
                <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                <span className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-600">Trace: {location.pathname}</span>
            </div>
        </div>
    );
};

export default Breadcrumbs;
