import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, FileText, Upload, ShieldCheck, Clock, XCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

import { CardSkeleton } from '../components/Skeleton';

const KYCSubmission = () => {
    const { token } = useAuth();
    const [documentType, setDocumentType] = useState('citizenship');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('UNVERIFIED');
    const [statusLoading, setStatusLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchStatus();
    }, [token]);

    const fetchStatus = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/kyc/status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus(res.data.status);
        } catch (err) {
            console.error('Error fetching KYC status:', err);
        } finally {
            setStatusLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image) return;

        setLoading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('documentType', documentType);
        formData.append('image', image);

        try {
            const res = await axios.post(`${API_BASE_URL}/kyc/submit`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setStatus(res.data.status);
            setMessage({ type: 'success', text: 'Documents submitted successfully. Verification is pending.' });
            setImage(null);
            setImagePreview(null);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to submit documents' });
        } finally {
            setLoading(false);
        }
    };

    if (statusLoading) {
        return (
            <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <CardSkeleton />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="glass-card rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden bg-[#131316]/60 backdrop-blur-3xl">
                    <div className="p-12 border-b border-white/5 bg-gradient-to-br from-primary/5 to-transparent">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary shadow-2xl shadow-primary/20">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Oversight Registry</h1>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-2">Biometric & Identity Matrix Synchronization</p>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className={`rounded-2xl p-6 flex items-center gap-4 border-2 transition-all duration-500 ${status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                status === 'REJECTED' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                    'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                            }`}>
                            <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-current/10 flex items-center justify-center">
                                {status === 'VERIFIED' && <CheckCircle2 className="h-5 w-5" />}
                                {status === 'PENDING' && <Clock className="h-5 w-5" />}
                                {status === 'REJECTED' && <XCircle className="h-5 w-5" />}
                                {status === 'UNVERIFIED' && <AlertCircle className="h-5 w-5" />}
                            </div>

                            <span className="font-black text-[10px] uppercase tracking-widest leading-relaxed">
                                {status === 'VERIFIED' && 'Neural core verified. Full administrative access granted.'}
                                {status === 'PENDING' && 'Protocol pending. Synchronization with global oversight in progress.'}
                                {status === 'REJECTED' && 'Biometric mismatch. Please re-submit valid credentials.'}
                                {status === 'UNVERIFIED' && 'Authentication Required: Please synchronize your identity matrix.'}
                            </span>
                        </div>
                    </div>

                    {(status === 'UNVERIFIED' || status === 'REJECTED') && (
                        <div className="p-12">
                            {message && (
                                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-1">Protocol Type</label>
                                    <div className="grid grid-cols-2 gap-6">
                                        <button
                                            type="button"
                                            onClick={() => setDocumentType('citizenship')}
                                            className={`p-8 rounded-[2.5rem] border-2 flex flex-col items-center gap-4 transition-all duration-500 ${documentType === 'citizenship'
                                                ? 'border-primary bg-primary/5 text-primary shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                                                : 'border-white/5 bg-white/5 text-gray-400 hover:border-white/10 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-colors ${documentType === 'citizenship' ? 'bg-primary/20' : 'bg-dark'}`}>
                                                <FileText className="h-8 w-8" />
                                            </div>
                                            <span className="font-black tracking-tight text-lg">Citizenship</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDocumentType('license')}
                                            className={`p-8 rounded-[2.5rem] border-2 flex flex-col items-center gap-4 transition-all duration-500 ${documentType === 'license'
                                                ? 'border-primary bg-primary/5 text-primary shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                                                : 'border-white/5 bg-white/5 text-gray-400 hover:border-white/10 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-colors ${documentType === 'license' ? 'bg-primary/20' : 'bg-dark'}`}>
                                                <FileText className="h-8 w-8" />
                                            </div>
                                            <span className="font-black tracking-tight text-lg">Driving License</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4 text-white">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-1">Visual Evidence Upload</label>
                                    <div className="border-2 border-dashed border-white/10 rounded-[2.5rem] p-12 hover:bg-white/5 transition-all duration-500 text-center cursor-pointer relative group/upload">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {imagePreview ? (
                                            <div className="relative inline-block">
                                                <img src={imagePreview} alt="Preview" className="h-64 rounded-[2rem] shadow-2xl border-4 border-[#09090B]" />
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-[2rem] opacity-0 hover:opacity-100 transition-opacity">
                                                    <span className="text-white font-black uppercase tracking-widest text-xs">Reset Matrix</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="h-20 w-20 bg-white/5 rounded-[1.5rem] flex items-center justify-center mx-auto group-hover/upload:scale-110 transition-transform">
                                                    <Upload className="h-8 w-8 text-gray-500" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-lg font-black text-white tracking-tight">Initiate Synchronization</p>
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">PNG, JPG Matrix Formats (MAX 5MB)</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !image}
                                    className="w-full py-6 px-10 rounded-[2rem] text-black bg-primary hover:bg-emerald-400 font-black shadow-2xl shadow-primary/20 disabled:opacity-20 disabled:grayscale transition-all transform hover:-translate-y-1 uppercase tracking-[0.2em]"
                                >
                                    {loading ? 'Processing Synchronization...' : 'Confirm Matrix Upload'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KYCSubmission;
