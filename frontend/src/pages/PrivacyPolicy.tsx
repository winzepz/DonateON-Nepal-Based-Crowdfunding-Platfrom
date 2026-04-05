import AppearOnScroll from '../components/AppearOnScroll';
import { Shield, Lock, Eye, FileText, Globe, UserCheck, Database, Landmark } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-dark pt-32 pb-40">
            <div className="max-w-5xl mx-auto px-6 sm:px-8">
                <AppearOnScroll>
                    <div className="flex flex-col md:flex-row md:items-center gap-8 mb-16 border-b border-white/5 pb-16">
                        <div className="h-20 w-20 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                            <Shield className="h-10 w-10 text-emerald-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-1 w-8 rounded-full bg-emerald-400" />
                                <h2 className="text-emerald-400 font-black uppercase tracking-[0.4em] text-[10px]">Data Sovereignty & Privacy Mandate</h2>
                            </div>
                            <h1 className="text-6xl font-black text-white tracking-tighter sm:text-7xl">Privacy Policy</h1>
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em] mt-6 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                Last Revision: 2026 April 5
                            </p>
                        </div>
                    </div>
                </AppearOnScroll>

                <div className="space-y-24 text-gray-400 leading-relaxed font-medium">
                    {/* SECTION 1: LEGAL SOVEREIGNTY AND COMPLIANCE */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                <Landmark className="h-5 w-5 text-emerald-400" />
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight">1. Legal Sovereignty</h2>
                        </div>
                        <p className="text-lg">
                            This Privacy Policy is formalized under the **Article 28 of the Constitution of Nepal (2072)** regarding the Fundamental 
                            Right to Privacy, and the subsequent **Privacy Act (2075)**. DonateOn operates as a "Data Controller" 
                            strictly regulated by the **Department of Information and Broadcasting** and the **Ministry of Communication and Information Technology (MoCIT)**.
                        </p>
                        <div className="p-10 bg-emerald-500/5 border border-emerald-500/10 rounded-[3rem] space-y-6">
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-emerald-400" />
                                <span className="text-white font-black uppercase tracking-widest text-xs">Mandatory Privacy Disclosure</span>
                            </div>
                            <p className="text-sm border-l-2 border-emerald-400 pl-6 italic">
                                "The collection, storage, and processing of personal data for the purpose of financial mediation are permitted under Section 19 of the **Privacy Act (2075)**. Any data sharing with the **Nepal Rastra Bank (NRB)** or law enforcement agencies for auditing financial flows is an overriding legal obligation that supersedes individual consent."
                            </p>
                        </div>
                    </section>

                    {/* SECTION 2: DATA PROCESSING TAXONOMY */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                <Database className="h-5 w-5 text-emerald-400" />
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight">2. Information Taxonomy</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                            <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-4 hover:border-emerald-400/20 transition-all group">
                                <UserCheck className="h-6 w-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                                <h3 className="text-white font-black uppercase tracking-widest text-[10px]">Identifiable Data</h3>
                                <p className="text-sm">We process National ID (NID), Citizenship numbers, and biometric metadata for the purpose of high-integrity KYC as mandated by the <strong>Foreign Exchange (Regulation) Act.</strong></p>
                            </div>
                            <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-4 hover:border-indigo-400/20 transition-all group">
                                <Lock className="h-6 w-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                                <h3 className="text-white font-black uppercase tracking-widest text-[10px]">Financial Metadata</h3>
                                <p className="text-sm">We track transaction hashes, digital wallet IDs (eSewa/Khalti), and settlement timestamps across the <strong>NRB Payment System</strong> to prevent split-deposit fraud.</p>
                            </div>
                            <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-4 hover:border-rose-400/20 transition-all group">
                                <Globe className="h-6 w-6 text-rose-400 group-hover:scale-110 transition-transform" />
                                <h3 className="text-white font-black uppercase tracking-widest text-[10px]">Behavioral Audit</h3>
                                <p className="text-sm">Detailed logs of account modification, IP-geo-mapping, and device fingerprints are retained for a minimum of 5 years to meet <strong>MoF Audit Readiness.</strong></p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: DATA SOVEREIGNTY AND ACCESS */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                <Eye className="h-5 w-5 text-emerald-400" />
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight">3. Sovereignty Protocols</h2>
                        </div>
                        <p>
                            Under Section 33 of the **Privacy Act**, you have the right to request access to your records. However, DonateOn 
                            enforces a "Data Hardening" protocol:
                        </p>
                        <ul className="space-y-6">
                            <li className="flex gap-6 items-start">
                                <div className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center mt-1 flex-shrink-0 font-black text-[10px] text-emerald-400 border border-emerald-400/20">1</div>
                                <p className="text-sm italic"><strong>Irremovability of Financial Records:</strong> Financial transaction data cannot be deleted upon user request due to the statutory requirements of the <strong>Income Tax Act of Nepal</strong> and the <strong>Audit Act (2075)</strong>.</p>
                            </li>
                            <li className="flex gap-6 items-start">
                                <div className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center mt-1 flex-shrink-0 font-black text-[10px] text-emerald-400 border border-emerald-400/20">2</div>
                                <p className="text-sm italic"><strong>Data Transmission for Public Safety:</strong> In times of National Crisis, data may be transmitted to the <strong>Ministry of Home Affairs</strong> to coordinate disaster relief logistics.</p>
                            </li>
                        </ul>
                    </section>

                    {/* FOOTER OF PAGE */}
                    <div className="pt-20 border-t border-white/5">
                        <div className="bg-white/5 p-12 rounded-[3.5rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left transition-all hover:bg-emerald-500/5 hover:border-emerald-500/10 group">
                            <div>
                                <h4 className="text-2xl font-black text-white mb-3">Privacy Integrity Officer</h4>
                                <p className="text-gray-500 leading-relaxed font-bold text-xs uppercase tracking-widest">Formal GDPR and Nepal-Privacy compliance desk.</p>
                            </div>
                            <a href="mailto:privacy@donateon.com.np" className="px-12 py-5 bg-emerald-500 text-black font-black rounded-2xl hover:bg-emerald-400 transition-all text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 group-hover:scale-105">
                                Initiate Audit Request
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
