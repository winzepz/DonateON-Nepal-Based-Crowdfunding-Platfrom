import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Home, LayoutDashboard, User, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface CommandBarProps {
  onSearchOpen: () => void;
}

const CommandBar = ({ onSearchOpen }: CommandBarProps) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Scroll logic to hide/show bar (like iPhone Safari bar)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] px-4 w-full max-w-lg lg:max-w-md"
        >
          {/* Main Capsule */}
          <div className="bg-dark/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-2 flex items-center justify-between shadow-[0_32px_128px_-16px_rgba(0,0,0,1)] ring-1 ring-white/10">
            
            {/* Nav Items */}
            <div className="flex items-center gap-1 flex-1 justify-around px-2">
              <Link to="/" className={`p-3 rounded-2xl transition-all duration-300 relative group ${isActive('/') ? 'text-primary' : 'text-gray-500 hover:text-white'}`}>
                <Home size={22} strokeWidth={isActive('/') ? 3 : 2} />
                {isActive('/') && <motion.div layoutId="dock-dot" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-dark border border-white/5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Home</span>
              </Link>

              {isAuthenticated && (
                <Link to="/dashboard" className={`p-3 rounded-2xl transition-all duration-300 relative group ${isActive('/dashboard') ? 'text-primary' : 'text-gray-500 hover:text-white'}`}>
                  <LayoutDashboard size={22} strokeWidth={isActive('/dashboard') ? 3 : 2} />
                  {isActive('/dashboard') && <motion.div layoutId="dock-dot" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-dark border border-white/5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Dash</span>
                </Link>
              )}
            </div>

            {/* Central Search Trigger - iPhone Center Button */}
            <button 
              onClick={onSearchOpen}
              className="relative p-7 rounded-[2rem] bg-primary text-black shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] transition-all transform hover:scale-110 active:scale-95 group -mt-10"
            >
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Search size={28} strokeWidth={3} className="relative z-10" />
            </button>

            {/* Right Nav Items */}
            <div className="flex items-center gap-1 flex-1 justify-around px-2">
              {isAuthenticated ? (
                <>
                  {user?.role === 'ADMIN' && (
                    <Link to="/admin" className={`p-3 rounded-2xl transition-all duration-300 relative group ${isActive('/admin') ? 'text-primary' : 'text-gray-500 hover:text-white'}`}>
                      <Shield size={22} strokeWidth={isActive('/admin') ? 3 : 2} />
                      {isActive('/admin') && <motion.div layoutId="dock-dot" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-dark border border-white/5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Admin</span>
                    </Link>
                  )}
                  <Link to="/profile" className={`p-3 rounded-2xl transition-all duration-300 relative group ${isActive('/profile') ? 'text-primary' : 'text-gray-500 hover:text-white'}`}>
                    <User size={22} strokeWidth={isActive('/profile') ? 3 : 2} />
                    {isActive('/profile') && <motion.div layoutId="dock-dot" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-dark border border-white/5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Account</span>
                  </Link>
                </>
              ) : (
                <Link to="/login" className="p-3 rounded-2xl text-gray-500 hover:text-white transition-all duration-300 relative group">
                  <User size={22} />
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-dark border border-white/5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Login</span>
                </Link>
              )}
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandBar;
