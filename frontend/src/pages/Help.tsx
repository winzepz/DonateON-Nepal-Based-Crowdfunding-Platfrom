import { ChevronDown, HelpCircle, Shield, Wallet } from 'lucide-react';
import { useState } from 'react';

type FaqItem = {
    id: string;
    category: 'donor' | 'fundraiser' | 'payments';
    question: string;
    answer: string;
};

const faqs: FaqItem[] = [
    {
        id: 'd1',
        category: 'donor',
        question: 'How do I know a campaign is genuine?',
        answer:
            'For this FYP version, all campaigns are managed by your demo data. In production, DonateOn would verify organizers, require IDs for high-value campaigns, and review campaign descriptions before publishing.',
    },
    {
        id: 'd2',
        category: 'donor',
        question: 'Can I get a receipt for my donation?',
        answer:
            'Yes. Each successful donation triggers a digital receipt with the campaign name, amount, and date. For now, this is represented in the demo as a mock confirmation screen or console log.',
    },
    {
        id: 'f1',
        category: 'fundraiser',
        question: 'What information do I need to start a fundraiser?',
        answer:
            'You should prepare a clear title, a detailed story, a target amount, a deadline, and at least one strong photo. The “Create Campaign” form in this app walks you through each of these fields.',
    },
    {
        id: 'f2',
        category: 'fundraiser',
        question: 'How do I keep donors updated?',
        answer:
            'In this prototype, updates can be simulated via mock sections on the campaign details page. A production version would let you post regular updates with photos and progress notes that notify donors.',
    },
    {
        id: 'p1',
        category: 'payments',
        question: 'Which payment gateways are supported?',
        answer:
            'DonateOn integrates with popular Nepali gateways like eSewa and Khalti. The current implementation redirects to these providers using secure, server-generated payment URLs.',
    },
    {
        id: 'p2',
        category: 'payments',
        question: 'Is it safe to donate online?',
        answer:
            'Yes. Payment details are handled by the gateway providers over SSL. DonateOn never stores raw card or wallet credentials; it only receives confirmation of success or failure.',
    },
];

const Help = () => {
    const [expandedId, setExpandedId] = useState<string | null>(faqs[0]?.id ?? null);
    const [filter, setFilter] = useState<'all' | FaqItem['category']>('all');

    const filteredFaqs = faqs.filter((f) => filter === 'all' || f.category === filter);

    return (
        <div className="min-h-screen bg-dark py-20 px-4">
            <div className="max-w-4xl mx-auto space-y-16">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                        <HelpCircle className="h-4 w-4 text-indigo-400" />
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Knowledge Base</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Support Center</h1>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em]">Answers for Donors & Fundraisers</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <FilterButton label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
                    <FilterButton label="For Donors" active={filter === 'donor'} onClick={() => setFilter('donor')} />
                    <FilterButton label="For Fundraisers" active={filter === 'fundraiser'} onClick={() => setFilter('fundraiser')} />
                    <FilterButton label="Payments & Security" active={filter === 'payments'} onClick={() => setFilter('payments')} />
                </div>

                {/* FAQs */}
                <div className="glass-card rounded-[2.5rem] overflow-hidden divide-y divide-white/5">
                    {filteredFaqs.map((item) => {
                        const open = expandedId === item.id;
                        return (
                            <div key={item.id} className="group">
                                <button
                                    onClick={() => setExpandedId(open ? null : item.id)}
                                    className="w-full text-left px-8 py-6 focus:outline-none flex items-center justify-between"
                                >
                                    <span className={`text-base font-black tracking-tight transition-colors ${open ? 'text-primary' : 'text-white'}`}>
                                        {item.question}
                                    </span>
                                    <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform duration-300 ${open ? 'rotate-180 text-primary' : ''}`} />
                                </button>
                                {open && (
                                    <div className="px-8 pb-8 animate-in slide-in-from-top-2 duration-300">
                                        <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-2xl">
                                            {item.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Info Grid */}
                <div className="grid sm:grid-cols-2 gap-6">
                    <InfoCard 
                        icon={<Shield className="h-5 w-5 text-indigo-400" />}
                        title="Security Architecture"
                        desc="In this prototype, sensitive operations like KYC and payout workflows are simulated to demonstrate the core logic."
                    />
                    <InfoCard 
                        icon={<Wallet className="h-5 w-5 text-emerald-400" />}
                        title="Transaction Flow"
                        desc="Payments demonstrate server-side integration with eSewa/Khalti using secure parameter validation."
                    />
                </div>
            </div>
        </div>
    );
};

const FilterButton = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
            ${active 
                ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105' 
                : 'bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10 hover:text-white'}`}
    >
        {label}
    </button>
);

const InfoCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
    <div className="p-8 rounded-[2rem] bg-[#131316] border border-white/5 space-y-4">
        <div className="h-10 w-10 rounded-xl bg-dark border border-white/5 flex items-center justify-center">
            {icon}
        </div>
        <div className="space-y-2">
            <h4 className="text-sm font-black text-white uppercase tracking-widest">{title}</h4>
            <p className="text-xs font-medium text-gray-600 leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default Help;


