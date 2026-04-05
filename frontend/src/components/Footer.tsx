import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
    return (
        <footer className="bg-dark border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-6">
                        <Logo textSize="text-xl" />
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Empowering change through transparent and secure crowdfunding. Join us in making a difference in communities across Nepal.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-white text-lg mb-6">Quick Links</h3>
                        <ul className="space-y-4 text-gray-500 text-sm font-medium">
                            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link to="/campaigns" className="hover:text-primary transition-colors">Campaigns</Link></li>
                            <li><Link to="/stories" className="hover:text-primary transition-colors">Success Stories</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-white text-lg mb-6">Legal</h3>
                        <ul className="space-y-4 text-gray-500 text-sm font-medium">
                            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-white text-lg mb-6">Social</h3>
                        <div className="flex space-x-4">
                            {[Facebook, Twitter, Instagram, Mail].map((Icon, idx) => (
                                <a key={idx} href="#" className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:bg-primary hover:text-black transition-all duration-300 text-gray-400 group">
                                    <Icon className="h-5 w-5 transform group-hover:scale-110 transition-transform" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 mt-20 pt-10 text-center text-gray-600 text-[11px] font-bold uppercase tracking-widest">
                    <p>&copy; {new Date().getFullYear()} DonateOn. Built for human impact.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
