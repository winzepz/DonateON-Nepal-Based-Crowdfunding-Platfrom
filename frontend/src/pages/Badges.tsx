import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Lock, Award, CheckCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';

interface BadgeData {
    id: string;
    slug: string;
    title: string;
    description: string;
    icon: string;
    ruleType: string;
    threshold: number;
    earned: boolean;
    earnedAt: string | null;
}

import { DashboardSkeleton } from '../components/Skeleton';

const Badges: React.FC = () => {
    const [badges, setBadges] = useState<BadgeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchBadges = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/donations/me/badges`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBadges(res.data);
            } catch (err: any) {
                if (err.response?.status === 401) {
                    navigate('/login');
                } else {
                    setError('Failed to load badges. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchBadges();
    }, [navigate]);

    const earnedCount = badges.filter(b => b.earned).length;
    const totalCount = badges.length;

    const getThresholdLabel = (ruleType: string, threshold: number): string => {
        switch (ruleType) {
            case 'FIRST_DONATION': return 'Complete 1 Donation';
            case 'DONATION_COUNT': return `${threshold} Total Donations`;
            case 'TOTAL_AMOUNT': return `Donate NRs ${threshold.toLocaleString()}`;
            default: return '';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen px-4">
                <div className="max-w-5xl mx-auto py-20">
                    <DashboardSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24 px-4 overflow-hidden relative">
            <div className="max-w-5xl mx-auto space-y-16 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                            <Award className="h-3 w-3 text-indigo-400" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Achievements</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Your Badges</h1>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">Philanthropic Milestones</p>
                    </div>

                    <div className="glass-card px-8 py-6 rounded-3xl flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Earned</p>
                            <p className="text-3xl font-black text-white">{earnedCount}</p>
                        </div>
                        <div className="h-10 w-px bg-white/5" />
                        <div className="text-center">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total</p>
                            <p className="text-3xl font-black text-gray-400">{totalCount}</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl text-center">
                        <p className="text-xs font-black text-red-400 uppercase tracking-widest">{error}</p>
                    </div>
                )}

                {/* Progress */}
                {totalCount > 0 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Progress</p>
                            <p className="text-xl font-black text-primary">{Math.round((earnedCount / totalCount) * 100)}%</p>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                style={{ width: `${(earnedCount / totalCount) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* First show earned, then locked */}
                    {badges.filter(b => b.earned).map(badge => (
                        <EarnedBadgeCard key={badge.id} badge={badge} />
                    ))}
                    {badges.filter(b => !b.earned).map(badge => (
                        <LockedBadgeCard
                            key={badge.id}
                            badge={badge}
                            target={getThresholdLabel(badge.ruleType, badge.threshold)}
                        />
                    ))}
                </div>

                {badges.length === 0 && !loading && (
                    <div className="text-center py-32 space-y-6">
                        <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                            <Award className="h-10 w-10 text-white" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-black text-white tracking-tight">Legacy Awaits</p>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Make your first donation to begin</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const EarnedBadgeCard = ({ badge }: { badge: BadgeData }) => (
    <div className="glass-card rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
            <CheckCircle className="h-24 w-24 text-white" />
        </div>
        
        <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-500">
            {badge.icon}
        </div>

        <div className="space-y-2">
            <h3 className="text-xl font-black text-white tracking-tight">{badge.title}</h3>
            <p className="text-sm font-medium text-gray-500 leading-relaxed">{badge.description}</p>
        </div>

        {badge.earnedAt && (
            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Achieved</span>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    {new Date(badge.earnedAt).toLocaleDateString('en-NP', { month: 'short', year: 'numeric' })}
                </span>
            </div>
        )}
    </div>
);

const LockedBadgeCard = ({ badge, target }: { badge: BadgeData; target: string }) => (
    <div className="bg-[#131316] border border-white/5 rounded-[2.5rem] p-10 space-y-8 opacity-40 hover:opacity-100 transition-all duration-500 group">
        <div className="relative">
            <div className="h-20 w-20 rounded-3xl bg-white/5 flex items-center justify-center text-4xl filter grayscale group-hover:grayscale-0 transition-all">
                {badge.icon}
            </div>
            <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-dark border border-white/10 flex items-center justify-center">
                <Lock className="h-4 w-4 text-gray-600" />
            </div>
        </div>

        <div className="space-y-2">
            <h3 className="text-xl font-black text-gray-400 tracking-tight">{badge.title}</h3>
            <p className="text-sm font-bold text-gray-600 leading-relaxed">{badge.description}</p>
        </div>

        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest italic">{target}</span>
        </div>
    </div>
);

export default Badges;
