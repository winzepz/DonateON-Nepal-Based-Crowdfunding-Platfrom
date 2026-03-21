import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, LogOut, Mail, Shield, User, ShieldCheck, FileText, EyeOff, Download, Sparkles } from 'lucide-react';
import VerificationBadge from '../components/VerificationBadge';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_BASE_URL } from '../config';

const Profile = () => {
    const { user, logout, token, loading: authLoading } = useAuth();
    const [donations, setDonations] = useState<any[]>([]);
    const [kycData, setKycData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            if (!authLoading) setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const [donationsRes, kycRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/donations/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${API_BASE_URL}/kyc/status`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);
                setDonations(donationsRes.data);
                setKycData(kycRes.data);
            } catch (err) {
                console.error('Failed to fetch profile data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, authLoading]);

    if (authLoading || (loading && token)) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!token || !user) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-white font-bold">Please log in to view your profile.</p>
                    <Link to="/login" className="btn-premium inline-flex px-8 py-3">Login</Link>
                </div>
            </div>
        );
    }

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Donation Statement', 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Donor Name: ${user.name || 'N/A'}`, 14, 36);
        doc.text(`Email: ${user.email || 'N/A'}`, 14, 42);

        autoTable(doc, {
            head: [['Date', 'Campaign', 'Amount (NRs)', 'Privacy']],
            body: donations.map(d => [
                new Date(d.createdAt).toLocaleDateString(),
                d.campaignTitle,
                d.amount,
                d.isAnonymous ? 'Anonymous' : 'Public'
            ]),
            startY: 50,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] },
        });

        doc.save('donation_statement.pdf');
    };

    const renderKYCSection = () => {
        const kycStatus = user.kycStatus || 'UNVERIFIED';

        if (kycStatus === 'UNVERIFIED') {
            return (
                <div className="p-10 bg-primary/5 rounded-[2.5rem] border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-8 transition-all hover:bg-primary/10 shadow-2xl shadow-primary/5">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 bg-[#18181B] border border-white/10 rounded-2xl flex items-center justify-center text-primary  shadow-xl">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight">Identity Verification</h3>
                            <p className="text-sm text-gray-400 font-medium">Verify your identity to start fundraising.</p>
                        </div>
                    </div>
                    <Link
                        to="/kyc"
                        className="w-full sm:w-auto px-10 py-5 bg-primary text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-primary/20 text-center"
                    >
                        Verify Now
                    </Link>
                </div>
            );
        }

        const submission = kycData?.lastSubmission;

        return (
            <div className="p-8 bg-dark/5 rounded-[2rem] border border-white/5 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${kycStatus === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white tracking-tight">KYC Status: {kycStatus}</h3>
                            <p className="text-xs text-gray-400 font-medium tracking-wide">
                                {kycStatus === 'VERIFIED' ? 'Your identity is fully verified.' : 'Verification documents are under review.'}
                            </p>
                        </div>
                    </div>
                </div>

                {submission && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-widest pl-1">
                            <FileText className="h-3 w-3" /> Submitted Document ({submission.document_type})
                        </div>
                        <div className="relative group/doc max-w-sm overflow-hidden rounded-2xl border border-white/5 shadow-2xl bg-[#18181B]">
                            <img
                                src={submission.image_url}
                                alt="Identity Document"
                                className="w-full h-48 object-cover transition-transform group-hover/doc:scale-110 duration-700"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/doc:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <a
                                    href={submission.image_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 bg-dark text-black text-[10px] font-black uppercase tracking-widest rounded-xl shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform"
                                >
                                    View Full Document
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-dark pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">


            <div className="max-w-4xl mx-auto space-y-10 relative z-10 pt-16">
                {/* Header Section */}
                <div className="glass-card rounded-[3rem] overflow-hidden group shadow-2xl border-white/5 bg-[#131316]/60 backdrop-">
                    <div className="h-48 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="absolute -bottom-16 left-8 flex items-end gap-6">
                            <div className="relative group/avatar">
                                <div className="h-40 w-40 rounded-[2.5rem] border-8 border-[#09090B] bg-gradient-to-br from-[#18181B] to-[#27272A] flex items-center justify-center text-5xl font-black text-primary shadow-2xl transition-transform group-hover/avatar:scale-105 duration-500 overflow-hidden ring-1 ring-white/10">
                                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="h-16 w-16" />}
                                </div>
                                <div className="absolute bottom-3 right-3 bg-primary text-black rounded-2xl p-2.5 shadow-2xl cursor-pointer hover:scale-110 transition-all border-4 border-[#09090B]">
                                    <Camera className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-6 right-8">
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-8 py-3.5 text-sm font-black text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-xl hover:-translate-y-1"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                    <div className="px-10 pt-20 pb-12">
                        <div className="space-y-4">
                             <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter">{user.name}</h1>
                                <VerificationBadge status={user.kycStatus} />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">
                                    {user.role === 'CAMPAIGN_CREATOR' ? 'Verified Creator' : 'Community Donor'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="glass-card rounded-[2.5rem] p-10 space-y-10 border-white/5 bg-[#131316]/40 backdrop- shadow-xl">
                    <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                        <div className="h-10 w-10 rounded-xl bg-dark/5 flex items-center justify-center text-gray-400">
                            <User className="h-5 w-5" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Profile Details</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { label: 'Full Name', value: user.name, icon: User },
                            { label: 'Email Address', value: user.email, icon: Mail },
                            { label: 'Account Identity', value: user.role.replace('_', ' ').toLowerCase(), icon: Shield, capitalize: true },
                        ].map((field, i) => (
                            <div key={i} className="space-y-3 group">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">{field.label}</label>
                                <div className="flex items-center gap-4 p-5 bg-[#18181B] border-2 border-transparent group-hover:border-primary/20 transition-all rounded-2xl">
                                    <field.icon className="h-5 w-5 text-gray-500 group-hover:text-primary transition-colors" />
                                    <span className={`text-white font-bold ${field.capitalize ? 'capitalize' : ''}`}>{field.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* KYC Section inside Profile Details */}
                    {renderKYCSection()}
                </div>

                {/* Creator Central (If applicable) */}
                {/* Creator Dashboard (If applicable) */}
                {user.role === 'CAMPAIGN_CREATOR' && (
                    <div className="glass-card rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden group border-white/5 bg-[#131316]/40 backdrop- shadow-xl">
                        <div className="flex items-center gap-3 pb-6 border-b border-white/5 relative z-10">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Creator Dashboard</h2>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between p-8 bg-[#18181B] border border-white/5 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative z-10 gap-6">
                            <div className="flex items-center gap-5">
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight">Share Your Impact</h3>
                                    <p className="text-sm text-gray-400 font-medium">Connect with donors through updates.</p>
                                </div>
                            </div>
                            <Link
                                to="/create-story"
                                className="w-full sm:w-auto px-10 py-5 bg-primary text-black text-sm font-black rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-primary/20 text-center uppercase tracking-widest"
                            >
                                Post Update
                            </Link>
                        </div>
                    </div>
                )}

                {/* Donation History Section */}
                <div className="glass-card rounded-[2.5rem] p-10 space-y-8 border-white/5 bg-[#131316]/40 backdrop- shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-dark/5 flex items-center justify-center text-gray-400">
                                <FileText className="h-5 w-5" />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Donation History</h2>
                        </div>
                        <button
                            onClick={downloadPDF}
                            disabled={donations.length === 0}
                            className="flex items-center justify-center gap-2 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 hover:bg-primary/20 rounded-2xl transition-all disabled:opacity-30 shadow-xl shadow-primary/10"
                        >
                            <Download className="h-4 w-4" />
                            Statement
                        </button>
                    </div>

                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : donations.length === 0 ? (
                        <div className="py-12 text-center space-y-4">
                            <p className="text-gray-400 font-bold italic">No donations found yet.</p>
                        </div>
                    ) : (
                    <div className="overflow-x-auto -mx-10 sm:mx-0">
                            <table className="w-full text-left border-separate border-spacing-y-4">
                                <thead>
                                    <tr className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">
                                        <th className="px-8 py-2">Date</th>
                                        <th className="px-8 py-2">Campaign</th>
                                        <th className="px-8 py-2 text-right">Amount</th>
                                        <th className="px-8 py-2">Privacy</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {donations.map((d) => (
                                        <tr key={d.id} className="group hover:bg-dark/5 transition-colors">
                                            <td className="px-8 py-6 text-sm font-bold text-gray-400 rounded-l-[1.5rem]">
                                                {new Date(d.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6 text-sm font-black text-white">
                                                {d.campaignTitle}
                                            </td>
                                            <td className="px-8 py-6 text-sm font-black text-emerald-500 text-right">
                                                NRs {parseFloat(d.amount).toLocaleString()}
                                            </td>
                                            <td className="px-8 py-6 rounded-r-[1.5rem]">
                                                {d.isAnonymous ? (
                                                    <span className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 tracking-widest">
                                                        <EyeOff className="h-3 w-3" /> Anonymous
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-black uppercase text-primary tracking-widest">Public</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
