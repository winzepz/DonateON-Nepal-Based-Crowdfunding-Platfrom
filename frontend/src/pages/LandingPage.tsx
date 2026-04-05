import { Globe, Shield, Users, ArrowRight, CheckCircle, Heart, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { API_BASE_URL } from '../config';
import AppearOnScroll from '../components/AppearOnScroll';
import NumberTicker from '../components/NumberTicker';
import CategoryPools from '../components/CategoryPools';

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
    const { isAuthenticated } = useAuth();
    const [stats, setStats] = useState({
        totalRaised: 0,
        activeCampaigns: 0,
        happyDonors: 0,
        impactedCommunities: 0
    });

    const heroRef = useRef<HTMLDivElement>(null);
    const blob1Ref = useRef<HTMLDivElement>(null);
    const blob2Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/stats/global`);
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            }
        };

        fetchStats();

        // GSAP Animations
        const ctx = gsap.context(() => {
            // Initial Hero Entrance
            gsap.from(".hero-content > *", {
                y: 30,
                opacity: 0,
                duration: 1,
                stagger: 0.15,
                ease: "power3.out"
            });

            gsap.from(".hero-image", {
                scale: 0.95,
                opacity: 0,
                x: 20,
                duration: 1.2,
                ease: "power2.out"
            });

            // Parallax effect on background blobs
            gsap.to(blob1Ref.current, {
                y: -100,
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: 1.5,
                }
            });

            gsap.to(blob2Ref.current, {
                y: 50,
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: 2,
                }
            });

        });

        return () => ctx.revert();
    }, []);

    return (
        <div className="min-h-screen bg-dark font-sans overflow-x-hidden">
            {/* Hero Section */}
            <div ref={heroRef} className="relative overflow-hidden pt-20 pb-12 sm:pt-32 sm:pb-16 lg:pb-24">
                {/* Background Image & Blobs */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <img 
                        src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=2000" 
                        alt="" 
                        className="w-full h-full object-cover opacity-[0.07] scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/50 to-dark" />
                </div>

                <div ref={blob1Ref} className="absolute -top-24 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
                <div ref={blob2Ref} className="absolute top-1/2 -left-24 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                        <div className="hero-content sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left space-y-10">
                            <h1 className="text-5xl tracking-tight font-black text-white sm:text-7xl leading-[1.1]">
                                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400 drop-shadow-sm">
                                    DonateOn
                                </span>
                                <span className="block text-2xl sm:text-3xl mt-4 text-gray-400 font-medium tracking-wide">Verified Giving and Impact in Nepal</span>
                            </h1>
                            <p className="text-lg text-gray-400 sm:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                DonateOn connects powerful stories with secure local payments. Every NRs counts towards a better community.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                                {isAuthenticated ? (
                                    <Link
                                        to="/dashboard"
                                        className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-white bg-primary hover:bg-indigo-700 shadow-2xl shadow-primary/40 hover:-translate-y-1 transition-all font-bold text-lg group"
                                    >
                                        Go to Dashboard
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                ) : (
                                    <Link
                                        to="/register"
                                        className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-white bg-primary hover:bg-indigo-700 shadow-2xl shadow-primary/40 hover:-translate-y-1 transition-all font-bold text-lg group"
                                    >
                                        Start a Campaign
                                        <Zap className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                                    </Link>
                                )}
                                <Link
                                    to="/campaigns"
                                    className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border-2 border-gray-100 bg-dark text-gray-900 hover:border-primary/20 hover:bg-primary/5 transition-all font-bold text-lg"
                                >
                                    Browse Causes
                                </Link>
                            </div>

                            <div className="flex flex-wrap gap-6 pt-6 justify-center lg:justify-start">
                                <div className="flex items-center gap-2 group cursor-default">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <CheckCircle className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-500">Verified Creators</span>
                                </div>
                                <div className="flex items-center gap-2 group cursor-default">
                                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Shield className="h-4 w-4 text-indigo-400" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-500">Secure Payments</span>
                                </div>
                                <div className="flex items-center gap-2 group cursor-default">
                                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <TrendingUp className="h-4 w-4 text-purple-400" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-500">Instant Updates</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 hero-image relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                            <div className="relative mx-auto w-full rounded-3xl shadow-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-700 group">
                                <img
                                    className="w-full object-cover aspect-video lg:aspect-square"
                                    src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200"
                                    alt="Community Impact"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                <div className="absolute bottom-6 left-6 right-6 p-6 bg-dark/20 backdrop-blur-xl border border-white/30 rounded-2xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-black uppercase tracking-widest text-white font-mono">Transparency first</span>
                                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                    </div>
                                    <p className="text-xl font-black text-white tracking-tight">
                                        Empowering Communities
                                    </p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-1">
                                        Verified Funding Across Nepal
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Pools Section */}
            <CategoryPools />

            {/* Impact Stats */}
            <div className="py-24 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats && [
                            { label: 'Total Raised', value: stats.totalRaised, prefix: 'NRs ', suffix: '', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' },
                            { label: 'Active Campaigns', value: stats.activeCampaigns, suffix: '+', icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-400/10 border-indigo-400/20' },
                            { label: 'Happy Donors', value: stats.happyDonors, suffix: '+', icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
                            { label: 'Villages Impacted', value: stats.impactedCommunities, suffix: '+', icon: Globe, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
                        ].map((stat, i) => (
                            <AppearOnScroll key={i} delay={i * 100}>
                                <div className="bg-white/5 p-8 rounded-[2.5rem] shadow-sm border border-white/5 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                                    <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                    <NumberTicker 
                                      value={stat.value} 
                                      prefix={stat.prefix} 
                                      suffix={stat.suffix} 
                                      className="text-2xl sm:text-3xl font-black text-white" 
                                    />
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-2">{stat.label}</p>
                                </div>
                            </AppearOnScroll>
                        ))}
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="py-32 bg-dark relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                        <h2 className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">Transparency first</h2>
                        <h3 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-[1.1]">The DonateOn Ecosystem</h3>
                        <p className="text-lg text-gray-500 font-medium max-w-xl mx-auto">Empowering local heroes with verified support in three simple stages.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { step: '01', title: 'Submit Campaign', desc: 'Create your cause with verified documentation.', icon: Globe },
                            { step: '02', title: 'Community Support', desc: 'Connect with local and global donors.', icon: Users },
                            { step: '03', title: 'Bank Transfer', desc: 'Receive funds to your local Nepali bank.', icon: Shield },
                        ].map((item, i) => (
                            <AppearOnScroll key={i} direction={i === 0 ? 'right' : i === 2 ? 'left' : 'up'} delay={i * 200}>
                                <div className="relative group p-10 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-primary/20 transition-all duration-500 h-full">
                                    <div className="text-6xl font-black text-white/5 group-hover:text-primary/10 transition-colors absolute top-6 right-10 select-none">
                                        {item.step}
                                    </div>
                                    <div className="h-16 w-16 bg-dark border border-white/10 rounded-2xl flex items-center justify-center mb-10 group-hover:rotate-6 transition-transform">
                                        <item.icon className="h-8 w-8 text-primary" />
                                    </div>
                                    <h4 className="text-2xl font-black text-white mb-4 tracking-tight">{item.title}</h4>
                                    <p className="text-sm font-medium text-gray-500 leading-relaxed">{item.desc}</p>
                                </div>
                            </AppearOnScroll>
                        ))}
                    </div>
                </div>
            </div>

            {/* Featured Campaigns Placeholder/Promo */}
            <div className="py-32 bg-dark text-white relative overflow-hidden border-t border-white/5">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-20">
                        <div className="max-w-2xl space-y-8">
                            <h2 className="text-4xl sm:text-7xl font-black leading-[1.1] tracking-tight">Ready to make a <br/><span className="text-primary">real difference?</span></h2>
                            <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-xl">
                                Join thousands of others who are already changing lives in Nepal. Start your campaign in under 5 minutes.
                            </p>
                            <div className="flex flex-wrap gap-6 pt-4">
                                <Link to="/register" className="px-12 py-5 bg-primary text-black font-black rounded-2xl hover:bg-emerald-400 transition-all shadow-2xl shadow-primary/20 text-sm uppercase tracking-widest">
                                    Get Started Free
                                </Link>
                                <Link to="/about" className="px-12 py-5 bg-white/5 text-white font-black rounded-2xl hover:bg-white/10 transition-all border border-white/10 text-sm uppercase tracking-widest">
                                    Our Mission
                                </Link>
                            </div>
                        </div>
                        <div className="flex-1 w-full max-w-md">
                            <div className="glass-card p-10 rounded-[2.5rem] space-y-10">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                        <span>Contribution Goal</span>
                                        <span className="text-primary tracking-normal font-mono">88%</span>
                                    </div>
                                    <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1">
                                        <div className="h-full bg-primary w-[88%] rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-6 p-6 bg-dark/50 border border-white/5 rounded-[1.5rem] group hover:border-primary/20 transition-colors">
                                        <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <CheckCircle className="h-7 w-7 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white tracking-tight">NRs 1.2M Verified</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Successfully Disbursed</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 p-6 bg-dark/50 border border-white/5 rounded-[1.5rem] group hover:border-indigo-400/20 transition-colors">
                                        <div className="h-14 w-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <Shield className="h-7 w-7 text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white tracking-tight">100% Security</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Dual Gateway Protected</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;

