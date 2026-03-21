import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import {
    ArrowRight,
    CreditCard,
    Loader2,
    ShieldCheck,
    Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const createIdempotencyKey = () => {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
        return window.crypto.randomUUID();
    }
    return `donate-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const Donate = () => {
    const [searchParams] = useSearchParams();
    const [amount, setAmount] = useState(100);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [campaignId, setCampaignId] = useState<number | string>('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const { token } = useAuth();

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/campaigns`);
                if (response.data && response.data.length > 0) {
                    const requestedCampaignId = searchParams.get('campaignId');
                    const matchingCampaign = requestedCampaignId
                        ? response.data.find((campaign: { id: string }) => campaign.id === requestedCampaignId)
                        : null;

                    setCampaignId(matchingCampaign?.id || response.data[0].id);
                }
        } catch {
                console.warn('Using requested campaign ID or fallback');
            }
        };
        fetchCampaigns();
    }, [searchParams]);

    const handleEsewaPayment = async () => {
        setLoading(true);
        setStatus('Initiating eSewa payment...');
        try {
            const idempotencyKey = createIdempotencyKey();
            const response = await axios.post(`${API_BASE_URL}/payment/esewa`, {
                amount: amount,
                productId: campaignId,
                isAnonymous,
                idempotencyKey,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-idempotency-key': idempotencyKey,
                }
            });

            const { url, params } = response.data;

            // Create a hidden form and submit it
            const form = document.createElement('form');
            form.setAttribute('method', 'POST');
            form.setAttribute('action', url);

            for (const key in params) {
                if (Object.prototype.hasOwnProperty.call(params, key)) {
                    const hiddenField = document.createElement('input');
                    hiddenField.setAttribute('type', 'hidden');
                    hiddenField.setAttribute('name', key);
                    hiddenField.setAttribute('value', params[key]);
                    form.appendChild(hiddenField);
                }
            }

            document.body.appendChild(form);
            form.submit();
        } catch (error) {
            console.error('eSewa error:', error);
            setStatus('eSewa payment failed initiation.');
            setLoading(false);
        }
    };

    const handleKhaltiPayment = async () => {
        setLoading(true);
        setStatus('Initiating Khalti payment...');
        try {
            const idempotencyKey = createIdempotencyKey();
            const response = await axios.post(`${API_BASE_URL}/payment/khalti`, {
                amount: amount,
                productId: campaignId,
                name: 'Campaign Donation',
                isAnonymous,
                idempotencyKey,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-idempotency-key': idempotencyKey,
                }
            });

            if (response.data.payment_url) {
                window.location.href = response.data.payment_url;
            } else {
                setStatus('Khalti did not return a payment URL.');
            }
        } catch (error) {
            console.error('Khalti error:', error);
            setStatus('Khalti payment failed initiation. Check console.');
            setLoading(false);
        }
    };

    const quickAmounts = [100, 500, 1000, 2500];

    return (
        <div className="min-h-screen bg-dark py-20 px-4">
            <div className="max-w-xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-white tracking-tight">Complete Donation</h1>
                    <p className="text-gray-500 font-medium">Select your preferred payment method</p>
                </div>

                <div className="glass-card rounded-[2.5rem] p-10 space-y-10 shadow-2xl">
                    {/* Amount Input */}
                    <div className="space-y-4">
                        <label className="text-xs font-black uppercase text-gray-500 tracking-widest ml-1">Donation Amount (NPR)</label>
                        <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 font-black text-xl">NRs</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full bg-[#18181B] border-2 border-transparent focus:border-primary rounded-2xl pl-20 pr-6 py-5 text-2xl font-black text-white outline-none transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-4">
                            {quickAmounts.map((value) => (
                                <button
                                    key={value}
                                    onClick={() => setAmount(value)}
                                    className={`py-3 rounded-xl text-xs font-black transition-all ${amount === value ? 'bg-primary text-black' : 'bg-[#18181B] text-gray-400 hover:text-white'}`}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Anonymous Toggle */}
                    <label className="flex items-center gap-4 p-5 bg-[#18181B] rounded-2xl cursor-pointer group hover:bg-[#202024] transition-colors">
                        <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="h-5 w-5 rounded border-gray-100 text-primary focus:ring-primary bg-dark"
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-white tracking-tight">Donate Anonymously</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Hide your name from the public</span>
                        </div>
                    </label>

                    {/* Payment Buttons */}
                    <div className="space-y-4">
                        <label className="text-xs font-black uppercase text-gray-500 tracking-widest ml-1">Payment Method</label>
                        <div className="grid gap-4">
                            <button
                                onClick={handleEsewaPayment}
                                disabled={loading}
                                className="flex items-center justify-between p-6 rounded-2xl bg-[#60BB46] hover:bg-[#52A03C] shadow-xl shadow-green-500/10 transition-all group active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-2 rounded-lg">
                                        <Wallet className="h-6 w-6 text-[#60BB46]" />
                                    </div>
                                    <span className="text-white font-black text-lg">Pay with eSewa</span>
                                </div>
                                {loading && status.includes('eSewa') ? <Loader2 className="animate-spin h-6 w-6 text-white" /> : <ArrowRight className="h-6 w-6 text-white group-hover:translate-x-1 transition-transform" />}
                            </button>

                            <button
                                onClick={handleKhaltiPayment}
                                disabled={loading}
                                className="flex items-center justify-between p-6 rounded-2xl bg-[#5D2E8E] hover:bg-[#4C2475] shadow-xl shadow-purple-500/10 transition-all group active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-2 rounded-lg">
                                        <CreditCard className="h-6 w-6 text-[#5D2E8E]" />
                                    </div>
                                    <span className="text-white font-black text-lg">Pay with Khalti</span>
                                </div>
                                {loading && status.includes('Khalti') ? <Loader2 className="animate-spin h-6 w-6 text-white" /> : <ArrowRight className="h-6 w-6 text-white group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>
                    </div>

                    {/* Total Summary Inline */}
                    <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                        <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Total to pay</span>
                        <span className="text-3xl font-black text-primary tracking-tighter">NRs {amount.toLocaleString()}</span>
                    </div>
                </div>

                {/* Footer Security */}
                <div className="flex items-center justify-center gap-8 opacity-40">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">PCI DSS Secure</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">SSL Encrypted</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Donate;
