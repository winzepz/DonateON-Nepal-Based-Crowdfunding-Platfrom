import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown, Bell, LifeBuoy, Shield, Award } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import VerificationBadge from './VerificationBadge';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import Logo from './Logo';

const Navbar = () => {
    const { isAuthenticated, user, token, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const profileRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    const fetchUnreadCount = useCallback(async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Handle both { notifications: [] } and directly []
            const notifications = res.data.notifications || res.data;
            const unreadCount = Array.isArray(notifications) 
                ? notifications.filter((n: any) => !n.read_status).length 
                : 0;
            setUnreadNotifications(unreadCount);
        } catch (err) {
            console.error('Failed to fetch unread notifications', err);
        }
    }, [token]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
            // Polling every 2 minutes for notifications
            const interval = setInterval(fetchUnreadCount, 120000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, fetchUnreadCount]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Campaigns', path: '/campaigns' },
        { name: 'Stories', path: '/stories' },
        { name: 'Verify Donation', path: '/verify' },
        { name: 'About', path: '/about' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="bg-dark/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100/50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    {/* Logo Section */}
                    <div className="flex items-center flex-shrink-0">
                        <Link to="/">
                            <Logo textSize="text-2xl" />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive(link.path)
                                    ? 'text-primary bg-primary/5'
                                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Section / Auth */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                {user?.role === 'CAMPAIGN_CREATOR' && (
                                    <Link
                                        to="/create-campaign"
                                        className="hidden lg:inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-primary hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
                                    >
                                        Start Fundraising
                                    </Link>
                                )}

                                {/* Notification Bell */}
                                <Link
                                    to="/notifications"
                                    className="relative p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-full transition-all"
                                >
                                    <Bell className="h-6 w-6" />
                                    {unreadNotifications > 0 && (
                                        <span className="absolute top-1 right-1 flex h-4 w-4">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white items-center justify-center">
                                                {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                            </span>
                                        </span>
                                    )}
                                </Link>

                                {/* User Dropdown */}
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-2 p-1.5 pl-3 rounded-full border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <span className="text-sm font-semibold text-gray-700 max-w-[100px] truncate">
                                            {user?.name?.split(' ')[0]}
                                        </span>
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm overflow-hidden">
                                            {user?.profileImage ? (
                                                <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                                            ) : (
                                                user?.name?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-3 w-64 bg-dark rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-100/10 py-3 origin-top-right z-50 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="px-4 py-3 border-b border-gray-100 mb-1">
                                                <div className="flex items-center gap-1">
                                                    <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                                                    <VerificationBadge status={user?.kycStatus} />
                                                </div>
                                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                            </div>

                                            <Link
                                                to="/dashboard"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                                            >
                                                <LayoutDashboard className="h-4 w-4" />
                                                Dashboard
                                            </Link>
                                            {user?.role === 'ADMIN' && (
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                                                >
                                                    <Shield className="h-4 w-4 text-indigo-500" />
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                            <Link
                                                to="/profile"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                                            >
                                                <User className="h-4 w-4" />
                                                Profile
                                            </Link>
                                            <Link
                                                to="/support"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                                            >
                                                <LifeBuoy className="h-4 w-4" />
                                                Support
                                            </Link>
                                                <Link
                                                    to="/badges"
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                                                >
                                                    <Award className="h-4 w-4" />
                                                    My Badges
                                                </Link>

                                            <div className="my-1 border-t border-gray-100" />

                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setIsProfileOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Log out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="text-gray-600 hover:text-gray-900 font-medium text-sm px-3 py-2 transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-primary hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden gap-3">
                        {isAuthenticated && (
                            <Link to="/notifications" className="relative p-2 text-gray-500">
                                <Bell className="h-6 w-6" />
                                {unreadNotifications > 0 && <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>}
                            </Link>
                        )}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2.5 rounded-xl text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-dark/95 backdrop-blur border-t border-gray-100 animate-in slide-in-from-top-5">
                    <div className="px-4 py-6 space-y-4">
                        <div className="space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive(link.path)
                                        ? 'text-primary bg-primary/5'
                                        : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            {isAuthenticated ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 px-4 py-2">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                                            {user?.profileImage ? (
                                                <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                                            ) : (
                                                user?.name?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                                                <VerificationBadge status={user?.kycStatus} />
                                            </div>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>
                                    </div>
                                    {user?.role === 'CAMPAIGN_CREATOR' && (
                                        <Link
                                            to="/create-campaign"
                                            onClick={() => setIsOpen(false)}
                                            className="block w-full text-center bg-primary text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                                        >
                                            Start Fundraising
                                        </Link>
                                    )}
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link
                                            to="/dashboard"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-50 text-gray-700 font-medium hover:bg-gray-100"
                                        >
                                            <LayoutDashboard className="h-4 w-4" />
                                            Dash
                                        </Link>
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-50 text-gray-700 font-medium hover:bg-gray-100"
                                        >
                                            <User className="h-4 w-4" />
                                            Profile
                                        </Link>
                                        <Link
                                            to="/notifications"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-50 text-gray-700 font-medium hover:bg-gray-100"
                                        >
                                            <Bell className="h-4 w-4" />
                                            Alerts
                                        </Link>
                                        <Link
                                            to="/support"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-50 text-gray-700 font-medium hover:bg-gray-100"
                                        >
                                            <LifeBuoy className="h-4 w-4" />
                                            Help
                                        </Link>
                                    </div>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-600 bg-red-50 font-medium hover:bg-red-100 transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Log out
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="block w-full text-center px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setIsOpen(false)}
                                        className="block w-full text-center bg-primary text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
