import AppearOnScroll from '../components/AppearOnScroll';
import { Sparkles, Info, Link as LinkIcon, Database, Eye } from 'lucide-react';

const CookiePolicy = () => {
    return (
        <div className="min-h-screen bg-dark pt-32 pb-40">
            <div className="max-w-4xl mx-auto px-6 sm:px-8">
                <AppearOnScroll>
                    <div className="flex flex-col md:flex-row md:items-center gap-6 mb-16 border-b border-white/5 pb-12">
                        <div className="h-16 w-16 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-2xl shadow-amber-500/5">
                            <Sparkles className="h-8 w-8 text-amber-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="h-1 w-4 rounded-full bg-amber-500" />
                                <h2 className="text-amber-500 font-black uppercase tracking-[0.3em] text-[10px]">Technical Transparency</h2>
                            </div>
                            <h1 className="text-5xl font-black text-white tracking-tight">Cookie Policy</h1>
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-4">Last Updated: 2026 April 5</p>
                        </div>
                    </div>
                </AppearOnScroll>

                <div className="space-y-20 text-gray-400 leading-relaxed font-medium">
                    {/* SECTION 1 */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                                <span className="text-white text-xs font-black">01</span>
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Mechanism of Action</h2>
                        </div>
                        <p>
                            DonateOn utilizes "Cookies"—small data packets stored on your local device—as an essential fuel for our performance engine. 
                            These packets allow us to recognize your session, secure your transactions, and personalize your donation journey across the platform.
                        </p>
                    </section>

                    {/* SECTION 2 */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                                <span className="text-white text-xs font-black">02</span>
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Cookie Taxonomy</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6 mt-4">
                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                                <Database className="h-6 w-6 text-amber-500" />
                                <h3 className="text-sm font-black text-white tracking-widest uppercase">Essential</h3>
                                <p className="text-xs">Security tokens and login session continuity. These are non-negotiable for system access.</p>
                            </div>
                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                                <Eye className="h-6 w-6 text-amber-500" />
                                <h3 className="text-sm font-black text-white tracking-widest uppercase">Analytical</h3>
                                <p className="text-xs">Anonymous data tracking to optimize campaign discovery and UI responsiveness.</p>
                            </div>
                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                                <Sparkles className="h-6 w-6 text-amber-500" />
                                <h3 className="text-sm font-black text-white tracking-widest uppercase">Marketing</h3>
                                <p className="text-xs">Optional tokens that allow us to provide you with relevant cause recommendations.</p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3 */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                                <span className="text-white text-xs font-black">03</span>
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Consent Management</h2>
                        </div>
                        <p>
                            You maintain total control over your local data. You can configure your browser to reject analytical 
                            or marketing cookies. Note however, that disabling essential cookies will sever your connection to 
                            our authenticated dashboards and transaction gateways.
                        </p>
                    </section>

                    {/* FOOTER OF PAGE */}
                    <div className="pt-20 border-t border-white/5">
                        <div className="bg-white/5 p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                            <div>
                                <h4 className="text-xl font-black text-white mb-2">Technical Questions?</h4>
                                <p className="text-sm">For deep-dives into our cookie implementation.</p>
                            </div>
                            <a href="mailto:it-audit@donateon.com.np" className="px-10 py-4 bg-amber-500 text-black font-black rounded-2xl hover:bg-amber-400 transition-all text-xs uppercase tracking-widest">
                                IT Review
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookiePolicy;
