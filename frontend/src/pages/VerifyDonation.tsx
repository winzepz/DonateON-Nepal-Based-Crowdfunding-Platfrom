import React, { useState } from 'react';
import axios from 'axios';
import { Search, CheckCircle, XCircle, Shield, Calendar, Tag, User, Loader2, ArrowRight, DollarSign } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface VerifyResult {
    code: string;
    campaignTitle: string;
    campaignId: string;
    amount: number;
    donorName: string;
    gateway: string;
    createdAt: string;
    isReleased: boolean;
    status: string;
}

const VerifyDonation: React.FC = () => {
    const [code, setCode] = useState('');
    const [result, setResult] = useState<VerifyResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await axios.get(`${API_BASE_URL}/donations/verify?code=${encodeURIComponent(code.trim().toUpperCase())}`);
            setResult(response.data);
        } catch (err: any) {
            if (err.response?.status === 404) {
                setError('No donation found with this code. Please check and try again.');
            } else {
                setError(err.response?.data?.error || 'Failed to verify donation code.');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-NP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-dark py-20 px-4">
            <div className="max-w-2xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 mb-2">
                        <Shield className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-white tracking-tight">Verify Donation</h1>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">Security Transparency Hub</p>
                    </div>
                </div>

                {/* Search Form */}
                <div className="glass-card rounded-[2.5rem] p-10 shadow-2xl space-y-8">
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase text-gray-500 tracking-widest ml-1">Donation Reference Code</label>
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    placeholder="DN-XXXX-XXXX"
                                    className="w-full bg-[#18181B] border-2 border-transparent focus:border-primary rounded-2xl pl-16 pr-6 py-5 text-xl font-black text-white outline-none transition-all placeholder:text-gray-700"
                                    spellCheck={false}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !code.trim()}
                            className="w-full group flex items-center justify-center gap-3 py-5 rounded-2xl bg-primary text-black font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-6 w-6" />
                            ) : (
                                <>
                                    <span>Verify Transaction</span>
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="flex items-center gap-4 p-5 bg-red-500/5 border border-red-500/10 rounded-2xl animate-in fade-in zoom-in duration-300">
                            <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                            <p className="text-xs font-bold text-red-400">{error}</p>
                        </div>
                    )}
                </div>

                {/* Result Display */}
                {result && (
                    <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
                        {/* Status Header */}
                        <div className="px-10 py-8 border-b border-white/5 bg-emerald-500/5 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">Authenticated</p>
                                    <h2 className="text-xl font-black text-white font-mono tracking-wider">{result.code}</h2>
                                </div>
                            </div>
                            <div className="px-5 py-2.5 rounded-xl bg-dark/50 border border-white/5 text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${result.isReleased ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
                                {result.isReleased ? 'Finalized' : 'In Progress'}
                            </div>
                        </div>

                        {/* Details Body */}
                        <div className="p-10 grid gap-8">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <DetailCard
                                    icon={<Tag className="h-5 w-5 text-indigo-400" />}
                                    label="Campaign"
                                    value={result.campaignTitle}
                                />
                                <DetailCard
                                    icon={<DollarSign className="h-5 w-5 text-emerald-400" />}
                                    label="Donation Value"
                                    value={`NRs ${result.amount.toLocaleString()}`}
                                />
                                <DetailCard
                                    icon={<User className="h-5 w-5 text-purple-400" />}
                                    label="Contributor"
                                    value={result.donorName}
                                />
                                <DetailCard
                                    icon={<Calendar className="h-5 w-5 text-orange-400" />}
                                    label="Verified On"
                                    value={formatDate(result.createdAt)}
                                />
                            </div>

                            <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Gateway</span>
                                    <div className={`px-4 py-2 rounded-xl text-xs font-black text-white ${result.gateway === 'ESEWA' ? 'bg-[#60BB46]' : 'bg-[#5D2E8E]'}`}>
                                        {result.gateway}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 opacity-30">
                                    <Shield className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Immutable Record</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Security */}
                <div className="flex flex-col items-center gap-4 opacity-40">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] text-center">
                        Secure Transparency Hub
                    </p>
                    <div className="h-px w-20 bg-white/10" />
                </div>
            </div>
        </div>
    );
};

const DetailCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="p-6 rounded-[2rem] bg-dark/50 border border-white/5 space-y-3 group hover:border-primary/20 transition-all">
        <div className="bg-[#18181B] w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 transition-colors">
            {icon}
        </div>
        <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-black text-white tracking-tight">{value}</p>
        </div>
    </div>
);

export default VerifyDonation;
