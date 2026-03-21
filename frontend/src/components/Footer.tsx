import { Heart, Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-dark text-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Heart className="h-6 w-6 text-primary" fill="currentColor" />
                            <span className="font-bold text-xl text-gray-900">DonateOn</span>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Empowering change through transparent and secure crowdfunding. Join us in making a difference.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-gray-600">
                            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link to="/campaigns" className="hover:text-primary transition-colors">Campaigns</Link></li>
                            <li><Link to="/stories" className="hover:text-primary transition-colors">Success Stories</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-4">Legal</h3>
                        <ul className="space-y-2 text-gray-600">
                            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-4">Connect With Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="bg-gray-100 p-2 rounded-full hover:bg-primary transition-colors text-gray-900 hover:text-gray-900">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="bg-gray-100 p-2 rounded-full hover:bg-primary transition-colors text-gray-900 hover:text-gray-900">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="bg-gray-100 p-2 rounded-full hover:bg-primary transition-colors text-gray-900 hover:text-gray-900">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="bg-gray-100 p-2 rounded-full hover:bg-primary transition-colors text-gray-900 hover:text-gray-900">
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 mt-12 pt-8 text-center text-gray-600 text-sm">
                    <p>&copy; {new Date().getFullYear()} DonateOn. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
