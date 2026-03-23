import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Loader2, ArrowRight, Lock, Mail } from 'lucide-react';
import { API_BASE_URL } from '../config';
import Logo from '../components/Logo';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the page the user was trying to access before being redirected to login
    const from = (location.state as any)?.from?.pathname || '/';

    useEffect(() => {
        // If already authenticated, redirect away from login page
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email,
                password,
            });

            const { token, user } = response.data;
            login(token, user);
            // Redirect will be handled by the useEffect above
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
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
        } catch (err: any) {
            setError(err.response?.data?.message || 'Google login failed');
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
                    <h2 className="text-4xl font-black text-white tracking-tight">Welcome Back</h2>
                    <p className="text-sm text-gray-500 font-medium">
                        New to DonateOn?{' '}
                        <Link to="/register" className="font-black text-primary hover:text-indigo-400 transition-colors">
                            Create account
                        </Link>
                    </p>
                </div>

                <form className="mt-10 space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4">
                            <p className="text-sm font-bold text-red-400">{error}</p>
                        </div>
                    )}

                    <div className="space-y-5">
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
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none block w-full pl-12 pr-4 py-4 border-2 border-white/5 placeholder-gray-600 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold bg-[#18181B]"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm font-bold text-gray-600">
                                Remember me
                            </label>
                        </div>
                        <a href="#" className="font-black text-primary hover:text-indigo-700 transition-colors text-xs uppercase tracking-wider">
                            Forgot?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center items-center gap-3 py-4 px-4 border border-transparent text-sm font-black rounded-2xl text-black bg-primary hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign In
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
                            text="signin_with"
                            width="340"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
