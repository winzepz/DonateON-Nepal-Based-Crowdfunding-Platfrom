import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Loader2, ArrowRight, Lock, Mail, User, Sparkles, Heart } from 'lucide-react';
import { API_BASE_URL } from '../config';
import Logo from '../components/Logo';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'DONOR' | 'CAMPAIGN_CREATOR'>('DONOR');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, {
                name,
                email,
                password,
                role
            });

            const { token, user } = response.data;
            login(token, user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (response: any) => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/google-login`, {
                credential: response.credential
            });
            const { token, user } = res.data;
            login(token, user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Google registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark py-12 px-4 sm:px-6 lg:px-8 relative">

            <div className="max-w-md w-full space-y-8 glass-card p-12 rounded-[2.5rem] relative z-10">
                <div className="text-center space-y-4">
                    <Link to="/" className="inline-flex justify-center">
                        <Logo textSize="text-4xl" />
                    </Link>
                    <h2 className="text-4xl font-black text-white tracking-tight">Join DonateOn</h2>
                    <p className="text-sm text-gray-500 font-medium">
                        Already a member?{' '}
                        <Link to="/login" className="font-black text-primary hover:text-indigo-400 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>

                <form className="mt-10 space-y-6" onSubmit={handleRegister}>
                    {error && (
                        <div className="rounded-2xl bg-red-500/10 border border-red-500/10 p-4">
                            <p className="text-sm font-bold text-red-400">{error}</p>
                        </div>
                    )}

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    className="appearance-none block w-full pl-12 pr-4 py-4 border-2 border-white/5 placeholder-gray-600 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold bg-[#18181B]"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email-address" className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full pl-12 pr-4 py-4 border-2 border-white/5 placeholder-gray-600 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold bg-[#18181B]"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none block w-full pl-12 pr-4 py-4 border-2 border-white/5 placeholder-gray-600 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold bg-[#18181B]"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                            I want to...
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole('DONOR')}
                                className={`group flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${role === 'DONOR'
                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                    : 'border-gray-100 hover:border-primary/30 hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${role === 'DONOR' ? 'bg-primary/10 text-primary' : 'bg-[#18181B] text-gray-600 group-hover:bg-primary/10 group-hover:text-primary'
                                    }`}>
                                    <Heart className="h-6 w-6" />
                                </div>
                                <span className={`text-sm font-black uppercase tracking-wider ${role === 'DONOR' ? 'text-primary' : 'text-gray-500'}`}>
                                    Donate
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('CAMPAIGN_CREATOR')}
                                className={`group flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${role === 'CAMPAIGN_CREATOR'
                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                    : 'border-gray-100 hover:border-primary/30 hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${role === 'CAMPAIGN_CREATOR' ? 'bg-primary/10 text-primary' : 'bg-[#18181B] text-gray-600 group-hover:bg-primary/10 group-hover:text-primary'
                                    }`}>
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <span className={`text-sm font-black uppercase tracking-wider ${role === 'CAMPAIGN_CREATOR' ? 'text-primary' : 'text-gray-500'}`}>
                                    Fundraise
                                </span>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center items-center gap-3 py-4 px-4 border border-transparent text-sm font-black rounded-2xl text-black bg-primary hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            <>
                                Create Account
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="relative flex items-center gap-4 my-8">
                        <div className="flex-grow h-px bg-white/5"></div>
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest leading-none">Or continue with</span>
                        <div className="flex-grow h-px bg-white/5"></div>
                    </div>

                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google login failed')}
                            theme="filled_black"
                            shape="circle"
                            text="signup_with"
                            width="340"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
