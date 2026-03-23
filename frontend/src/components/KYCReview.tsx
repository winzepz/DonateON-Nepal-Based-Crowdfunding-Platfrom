import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Check, X, Shield, User, Mail, Calendar, ExternalLink, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { CardSkeleton } from './Skeleton';

const KYCReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [kyc, setKyc] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        const fetchKycDetails = async () => {
            if (!token) return;
            try {
                const res = await axios.get(`${API_BASE_URL}/admin/kyc/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setKyc(res.data);
            } catch (err) {
                console.error('Failed to fetch KYC details', err);
            } finally {
                setLoading(false);
            }
        };
        fetchKycDetails();
    }, [id, token]);

    const handleAction = async (action: 'approve' | 'reject') => {
        try {
            await axios.post(`${API_BASE_URL}/admin/kyc/${id}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/admin');
        } catch (err) {
            console.error(`Failed to ${action} KYC`, err);
            alert(`Error ${action}ing KYC`);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#09090B] p-12">
            <div className="max-w-[1600px] mx-auto grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    <div className="h-[70vh] w-full animate-pulse bg-white/5 rounded-[2.5rem]" />
                </div>
                <div className="lg:col-span-4">
                    <CardSkeleton />
                </div>
            </div>
        </div>
    );

    if (!kyc) return (
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
            <div className="text-center space-y-6 glass-card p-12 rounded-[2.5rem] border-rose-500/20">
                <div className="h-20 w-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto">
                    <Shield size={40} />
                </div>
                <div className="space-y-2">
                    <p className="text-2xl font-black tracking-tighter">KYC Record Not Found</p>
                    <p className="text-gray-500 text-sm font-medium">The requested KYC document could not be found.</p>
                </div>
                <button 
                  onClick={() => navigate('/admin')} 
                  className="px-8 py-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all"
                >
                  Back to Dashboard
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen text-white pb-24 relative overflow-hidden">
            <div className="max-w-[1500px] mx-auto relative z-10 space-y-10">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="hidden" /> {/* Placeholder for layout if needed */}
                        
                        <div className="flex items-center gap-4 px-5 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl shadow-xl shadow-amber-500/5">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Audit Intelligence: Pending</span>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8 items-start">
                        {/* Left: Document Inspector */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="glass-card rounded-[2rem] overflow-hidden border-white/5 bg-[#131316]/60 shadow-2xl relative group">
                                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02] backdrop-blur-3xl">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <Shield size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Registry Entry</p>
                                            <p className="text-xs font-black uppercase tracking-widest text-white leading-none mt-1">{kyc.documentType} Document</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors" title="Zoom Out"><ZoomOut size={16} /></button>
                                        <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors" title="Zoom In"><ZoomIn size={16} /></button>
                                        <button onClick={() => setRotation(r => r + 90)} className="p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors" title="Rotate"><RotateCcw size={16} /></button>
                                        <div className="w-px h-8 bg-white/10 mx-1.5" />
                                        <a href={kyc.imageUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-black rounded-lg text-primary transition-all shadow-lg shadow-primary/5" title="Full Quality Link">
                                            <ExternalLink size={16} />
                                        </a>
                                    </div>
                                </div>
                                
                                <div className="h-[650px] bg-black/40 relative overflow-hidden flex items-center justify-center cursor-move p-8">
                                    <motion.div 
                                        style={{ 
                                            scale: zoom,
                                            rotate: rotation,
                                        }}
                                        className="h-full w-full flex items-center justify-center transition-transform duration-500 ease-out"
                                    >
                                        <img 
                                            src={kyc.imageUrl} 
                                            alt="KYC Document" 
                                            className="max-h-full max-w-full object-contain rounded-xl shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/5"
                                        />
                                    </motion.div>
                                    
                                    {/* Scanline Effect */}
                                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-primary/5 to-transparent h-20 w-full animate-scan" />
                                </div>
                            </div>
                        </div>

                        {/* Right: User Details & Actions */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="glass-card rounded-[2.5rem] p-10 border-white/5 bg-[#131316]/40 shadow-2xl backdrop-blur-3xl">
                                <div className="flex items-center gap-5 mb-10">
                                    <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-2xl shadow-primary/5 flex-shrink-0">
                                        <User size={32} />
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-black text-white tracking-tighter leading-tight">{kyc.userName}</h2>
                                        <p className="text-gray-500 font-bold tracking-widest text-[10px] uppercase opacity-60">Identity Node ID: {kyc.userId.slice(0, 10)}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-5 pt-8 border-t border-white/5">
                                    <div className="p-6 rounded-3xl bg-white/[0.01] border border-white/5 space-y-6 shadow-inner">
                                        <div className="flex items-center gap-4 group">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-primary transition-colors border border-white/5">
                                                <Mail size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5 leading-none">Transmission Email</p>
                                                <p className="font-black text-white text-sm tracking-tight leading-none mt-1">{kyc.userEmail}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 group">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-primary transition-colors border border-white/5">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5 leading-none">Logged On</p>
                                                <p className="font-black text-white text-[13px] tracking-tight leading-none mt-1">{new Date(kyc.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 group">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-primary transition-colors border border-white/5">
                                                <Shield size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5 leading-none">Internal Registry</p>
                                                <p className="font-black text-amber-500 text-xs uppercase tracking-[0.1em] mt-1">{kyc.userKycStatus}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 space-y-4">
                                    <button 
                                        onClick={() => handleAction('approve')}
                                        className="w-full py-5 rounded-2xl bg-primary text-black font-black uppercase tracking-[0.25em] text-[10px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                                    >
                                        <Check size={18} strokeWidth={4} />
                                        Authorize Node
                                    </button>
                                    <button 
                                        onClick={() => handleAction('reject')}
                                        className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-rose-500 font-black uppercase tracking-[0.25em] text-[10px] flex items-center justify-center gap-3 hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-lg"
                                    >
                                        <X size={18} strokeWidth={4} />
                                        Deny Audit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            
                <style>{`
                    @keyframes scan {
                        0% { transform: translateY(-100%); opacity: 0; }
                        50% { opacity: 1; }
                        100% { transform: translateY(650px); opacity: 0; }
                    }
                    .animate-scan {
                        animation: scan 4s ease-in-out infinite;
                    }
                `}</style>
            </div>
    );
};

export default KYCReview;
