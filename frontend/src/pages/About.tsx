import { Shield, Target, Users, Heart } from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen bg-dark py-20 px-4">
            <div className="max-w-7xl mx-auto space-y-24">
                {/* Hero */}
                <div className="text-center space-y-6 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                        <Heart className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Our Philosophy</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1]">
                        Empowering Giving, <br />
                        <span className="text-primary">Empowering Lives</span>
                    </h1>
                    <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
                        We are building a future where help is just a click away, connecting generous hearts with those in need through total transparency and trust.
                    </p>
                </div>

                {/* Mission & Vision */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black text-white tracking-tight">Radical Transparency</h2>
                            <p className="text-lg text-gray-500 font-medium leading-relaxed">
                                At DonateOn, our mission is to democratize philanthropy. We believe that everyone has the power to make a difference, regardless of the size of their contribution. By leveraging blockchain-ready architecture, we create a secure, transparent, and direct channel for funds.
                            </p>
                        </div>
                        
                        <div className="grid gap-6">
                            <FeatureItem 
                                icon={<Target className="h-6 w-6 text-indigo-400" />}
                                title="Transparency First"
                                desc="Every transaction is tracked and verified to ensure funds reach their intended destination."
                            />
                            <FeatureItem 
                                icon={<Users className="h-6 w-6 text-emerald-400" />}
                                title="Community Focused"
                                desc="We build vibrant ecosystems around causes, fostering long-term engagement."
                            />
                            <FeatureItem 
                                icon={<Shield className="h-6 w-6 text-purple-400" />}
                                title="Secure Payments"
                                desc="Bank-grade encryption ensures your donations are safe from checkout to payout."
                            />
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-75 group-hover:scale-100 transition-transform duration-700 pointer-events-none" />
                        <img
                            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                            alt="Team brainstorming"
                            className="rounded-[3rem] shadow-2xl relative z-10 border border-white/5 grayscale hover:grayscale-0 transition-all duration-500"
                        />
                        <div className="absolute -bottom-10 -left-10 glass-card p-10 rounded-[2.5rem] shadow-2xl max-w-xs z-20 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Heart className="h-7 w-7 text-primary" fill="currentColor" />
                                </div>
                                <span className="font-black text-4xl text-white tracking-tighter">10k+</span>
                            </div>
                            <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase tracking-widest">
                                Lives impacted through our platform globally.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureItem = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
    <div className="flex items-start gap-6 p-6 rounded-3xl hover:bg-white/5 transition-colors group">
        <div className="h-14 w-14 rounded-2xl bg-dark border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-primary/20 transition-all">
            {icon}
        </div>
        <div className="space-y-1">
            <h4 className="text-lg font-black text-white tracking-tight">{title}</h4>
            <p className="text-sm font-medium text-gray-500 leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default About;
