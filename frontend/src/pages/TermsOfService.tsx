import AppearOnScroll from '../components/AppearOnScroll';
import { Gavel, AlertCircle, FileCheck, Shield, CreditCard, Landmark, BookOpen } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-dark pt-32 pb-40">
            <div className="max-w-5xl mx-auto px-6 sm:px-8">
                <AppearOnScroll>
                    <div className="flex flex-col md:flex-row md:items-center gap-8 mb-16 border-b border-white/5 pb-16">
                        <div className="h-20 w-20 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.1)]">
                            <Landmark className="h-10 w-10 text-indigo-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-1 w-8 rounded-full bg-indigo-400" />
                                <h2 className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]">Financial Compliance & Governance</h2>
                            </div>
                            <h1 className="text-6xl font-black text-white tracking-tighter sm:text-7xl">Terms of Service</h1>
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em] mt-6 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                                Last Revision: 2026 April 5
                            </p>
                        </div>
                    </div>
                </AppearOnScroll>

                <div className="space-y-24 text-gray-400 leading-relaxed font-medium">
                    {/* SECTION 1: FINANCIAL REGULATORY FRAMEWORK */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                <BookOpen className="h-5 w-5 text-indigo-400" />
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight">1. Regulatory Framework</h2>
                        </div>
                        <p className="text-lg">
                            DonateOn operates as a digital fundraising intermediary in strict compliance with the **Nepal Rastra Bank (NRB) Unified Directives** 
                            and the **Payment and Settlement Bylaws (2077)**. By utilizing this platform, you acknowledge that our financial 
                            operations are subject to oversight by the **Ministry of Finance (MoF)** and the **Financial Information Unit (FIU-Nepal)**.
                        </p>
                        <div className="grid md:grid-cols-2 gap-8 pt-4">
                            <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-4">
                                <h3 className="text-white font-black uppercase tracking-widest text-xs">Monetary Compliance</h3>
                                <p className="text-sm">We strictly adhere to NRB's Anti-Money Laundering (AML) and Combatting the Financing of Terrorism (CFT) guidelines. Any suspicious donation patterns will be reported immediately to the FIU-Nepal.</p>
                            </div>
                            <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-4">
                                <h3 className="text-white font-black uppercase tracking-widest text-xs">Foreign Exchange Act</h3>
                                <p className="text-sm">All cross-border contributions are processed through approved banking channels in accordance with the Foreign Exchange (Regulation) Act, 2019.</p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: MANDATORY KYC & DUE DILIGENCE */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                <FileCheck className="h-5 w-5 text-indigo-400" />
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight">2. Mandatory Due Diligence</h2>
                        </div>
                        <p>
                            In alignment with the **Electronic Transactions Act (2063)**, DonateOn requires all campaign organizers to submit to a 
                            rigorous three-tier KYC (Know Your Customer) process:
                        </p>
                        <ul className="space-y-6">
                            <li className="flex gap-6 items-start">
                                <div className="h-6 w-6 rounded-lg bg-indigo-500/10 flex items-center justify-center mt-1 flex-shrink-0 font-black text-[10px] text-indigo-400 border border-indigo-400/20">A</div>
                                <div>
                                    <p className="text-white font-black mb-1">Identity Authentication:</p>
                                    <p className="text-sm italic">Submission of Citizenship Certificate, National ID (NID), or Passport verified against government API records.</p>
                                </div>
                            </li>
                            <li className="flex gap-6 items-start">
                                <div className="h-6 w-6 rounded-lg bg-indigo-500/10 flex items-center justify-center mt-1 flex-shrink-0 font-black text-[10px] text-indigo-400 border border-indigo-400/20">B</div>
                                <div>
                                    <p className="text-white font-black mb-1">Documentation Validity:</p>
                                    <p className="text-sm italic">Organized causes must provide clear, verified proof of documentation, including Hospital Records, Educational Certificates, or CDO-verified Disaster Reports.</p>
                                </div>
                            </li>
                            <li className="flex gap-6 items-start">
                                <div className="h-6 w-6 rounded-lg bg-indigo-500/10 flex items-center justify-center mt-1 flex-shrink-0 font-black text-[10px] text-indigo-400 border border-indigo-400/20">C</div>
                                <div>
                                    <p className="text-white font-black mb-1">Bank Account Mapping:</p>
                                    <p className="text-sm italic">Payouts are only permitted to local "Class A" Commercial Banks verified to match the identity of the campaign organizer or the direct beneficiary.</p>
                                </div>
                            </li>
                        </ul>
                    </section>

                    {/* SECTION 3: TRANSACTIONAL TERMS & RECOVERY */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                <CreditCard className="h-5 w-5 text-indigo-400" />
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight">3. Transactional Finality</h2>
                        </div>
                        <p>
                            DonateOn acts as a technology intermediary between Donors and Organizers. We utilize ISO 20022 compliant messaging and high-integrity 
                            API gateways (eSewa, Khalti).
                        </p>
                        <div className="p-10 bg-indigo-500/5 border border-indigo-500/10 rounded-[3rem] space-y-6">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-indigo-400" />
                                <span className="text-white font-black uppercase tracking-widest text-xs">Binding Clause</span>
                            </div>
                            <p className="text-sm border-l-2 border-indigo-400 pl-6 italic">
                                "All donations are processed as irrevocable gifts. Under the **Civil Code of Nepal (2074)**, once a donation is executed via an electronic signature or authenticated OTP, the donor waives all rights to recovery, except in instances where a 'Trust Default' or 'Fraudulent Intent' is judicially proven by the Ministry of Home Affairs or the CDO."
                            </p>
                        </div>
                    </section>

                    {/* FOOTER OF PAGE */}
                    <div className="pt-20 border-t border-white/5">
                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="bg-white/5 p-12 rounded-[3rem] border border-white/5 space-y-4 hover:border-indigo-400/20 transition-all group">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-400/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Shield className="h-6 w-6 text-indigo-400" />
                                </div>
                                <h4 className="text-xl font-black text-white">Institutional Access</h4>
                                <p className="text-sm">Official government audits and regulatory data requests should be directed to our compliance desk.</p>
                                <a href="mailto:compliance@donateon.com.np" className="inline-block text-indigo-400 font-black text-[10px] uppercase tracking-widest pt-4">Inquire Now →</a>
                            </div>
                            <div className="bg-white/5 p-12 rounded-[3rem] border border-white/5 space-y-4 hover:border-primary/20 transition-all group">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Gavel className="h-6 w-6 text-primary" />
                                </div>
                                <h4 className="text-xl font-black text-white">Dispute Resolution</h4>
                                <p className="text-sm">All legal disputes are subject to the exclusive jurisdiction of the Courts of Kathmandu, Nepal.</p>
                                <a href="mailto:legal@donateon.com.np" className="inline-block text-primary font-black text-[10px] uppercase tracking-widest pt-4">Contact Counsel →</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
