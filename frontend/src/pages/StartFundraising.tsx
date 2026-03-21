import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ArrowRight,
    Calendar,
    CheckCircle2,
    Image as ImageIcon,
    ShieldCheck,
    Sparkles,
    Target,
    UploadCloud,
} from 'lucide-react';

const StartFundraising = () => {
    const { isAuthenticated, user } = useAuth();
    const ctaHref = isAuthenticated && user?.role === 'CAMPAIGN_CREATOR' ? '/create-campaign' : '/register';

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary/5 via-white to-secondary/5">
            {/* Hero */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-white to-secondary/15" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative py-14 lg:py-20">
                    <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full bg-dark/80 backdrop-blur px-4 py-2 text-sm font-semibold text-primary shadow-sm border border-white/70">
                                Raise funds in minutes
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
                                Launch your fundraiser with the DonateOn playbook
                            </h1>
                            <p className="text-lg text-gray-600">
                                Tell your story, set a target, and share with supporters. We handle secure payments, transparency, and updates so you can focus on impact.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    to={ctaHref}
                                    className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-white bg-gradient-to-r from-primary to-indigo-700 shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all font-semibold"
                                >
                                    Start fundraising
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    to="/campaigns"
                                    className="inline-flex items-center justify-center px-7 py-3 rounded-full border border-gray-200 bg-dark text-gray-800 hover:border-primary/40 hover:text-primary transition-all shadow-sm"
                                >
                                    Explore campaigns
                                </Link>
                            </div>
                            <div className="flex flex-wrap gap-4 pt-2 text-sm text-gray-700">
                                <div className="flex items-center gap-2 bg-dark/80 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                                    <ShieldCheck className="h-4 w-4 text-primary" />
                                    Bank-grade payments
                                </div>
                                <div className="flex items-center gap-2 bg-dark/80 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                                    <Sparkles className="h-4 w-4 text-secondary" />
                                    Story-first templates
                                </div>
                                <div className="flex items-center gap-2 bg-dark/80 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    Instant preview
                                </div>
                            </div>
                        </div>

                        <div className="bg-dark/90 backdrop-blur border border-gray-100 shadow-xl rounded-2xl p-6 space-y-5">
                            <div className="flex items-center gap-3">
                                <UploadCloud className="h-5 w-5 text-primary" />
                                <p className="text-sm uppercase tracking-wide text-primary font-semibold">Live preview</p>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-gray-100">
                                <div className="h-52 bg-gray-100">
                                    <img
                                        src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80"
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="p-5 space-y-3">
                                    <h4 className="text-xl font-bold text-gray-900">Emergency Classroom Repairs</h4>
                                    <p className="text-sm text-gray-600 line-clamp-3">
                                        Fix leaking roofs, replace broken benches, and add safe lighting for 200 students before monsoon.
                                    </p>
                                    <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                                        <span>Target: NRs 1,500,000</span>
                                        <span className="text-gray-500">Deadline: 14 days</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                                <div className="rounded-xl bg-primary/5 border border-primary/15 p-4">
                                    <p className="font-semibold text-primary">Tell the story</p>
                                    <p className="mt-1 text-gray-600">Outline the problem, the plan, and the budget breakdown.</p>
                                </div>
                                <div className="rounded-xl bg-secondary/5 border border-secondary/15 p-4">
                                    <p className="font-semibold text-secondary">Add proof</p>
                                    <p className="mt-1 text-gray-600">Photos, quotes, and updates build trust quickly.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Steps */}
            <div className="py-16 bg-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold">How it works</p>
                        <h2 className="text-3xl font-bold text-gray-900 mt-2">Launch in three clear steps</h2>
                        <p className="text-gray-600 mt-3">We guide you from story to payouts with prompts, previews, and automated receipts.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: 'Share your story',
                                desc: 'Use our guided template to explain the need, impact, and exact costs.',
                                icon: Sparkles,
                            },
                            {
                                title: 'Add visuals & proof',
                                desc: 'Upload photos, receipts, or short videos to build confidence fast.',
                                icon: ImageIcon,
                            },
                            {
                                title: 'Publish & share',
                                desc: 'Go live, accept eSewa & Khalti instantly, and track donations in real time.',
                                icon: Target,
                            },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
                                    <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Proof / Checklist */}
            <div className="py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr,0.9fr] gap-10 items-center">
                    <div className="space-y-5">
                        <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold">Ready to go live</p>
                        <h3 className="text-3xl font-bold text-gray-900">Everything you need to build trust</h3>
                        <p className="text-gray-600">
                            Add deadlines, targets, and proof in one place. We provide a clean, mobile-first layout that mirrors your campaign card and checkout flow.
                        </p>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-start gap-3">
                                <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                                Secure eSewa & Khalti collection with receipts for donors.
                            </li>
                            <li className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                                Clear timelines and progress bars keep supporters engaged.
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5" />
                                Weekly update prompts to share impact and maintain trust.
                            </li>
                        </ul>
                        <div className="flex gap-3">
                            <Link
                                to={ctaHref}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white bg-primary hover:bg-indigo-700 transition-colors shadow-md"
                            >
                                Start now
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                to="/test-payment"
                                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-gray-200 bg-dark text-gray-800 hover:border-primary/40 hover:text-primary transition-colors"
                            >
                                View checkout
                            </Link>
                        </div>
                    </div>

                    <div className="bg-dark rounded-2xl border border-gray-100 shadow-xl p-6 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Sparkles className="h-4 w-4 text-secondary" />
                            Sample campaign card
                        </div>
                        <div className="overflow-hidden rounded-xl border border-gray-100">
                            <div className="h-44 bg-gray-100">
                                <img
                                    src="https://images.unsplash.com/photo-1509099836639-18ba02e2a2be?auto=format&fit=crop&w=1000&q=80"
                                    alt="Campaign"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="p-5 space-y-3">
                                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                                    <ShieldCheck className="h-4 w-4" />
                                    Verified partner
                                </div>
                                <h4 className="text-xl font-bold text-gray-900">Community Health Bus</h4>
                                <p className="text-sm text-gray-600 line-clamp-3">Bring essential checkups, vaccines, and medicines to remote hillsides every week.</p>
                                <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                                    <span>NRs 1,545,000 raised</span>
                                    <span className="text-gray-500">of NRs 2,000,000</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-primary h-2 rounded-full" style={{ width: '77%' }}></div>
                                </div>
                                <p className="text-xs text-gray-500">77% funded • 12 days left</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StartFundraising;

