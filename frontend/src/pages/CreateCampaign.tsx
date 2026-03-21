import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, CheckCircle2, Image as ImageIcon, Target, UploadCloud, ArrowLeft, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

const CreateCampaign = () => {
    const navigate = useNavigate();
    const { token, user } = useAuth();

    const [title, setTitle] = useState('Emergency Relief for Families in Rural Bagmati');
    const [description, setDescription] = useState('Our mission is to provide food, blankets, and essential medicines to over 100 families affected by recent floods. Every donation helps us reach further and save lives.');
    const [targetAmount, setTargetAmount] = useState('250000');
    const [deadline, setDeadline] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80');

    const [error, setError] = useState<string | any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && user.role !== 'CAMPAIGN_CREATOR' && user.role !== 'ADMIN') {
            navigate('/campaigns');
        }
    }, [user, navigate]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError([]);
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('targetAmount', targetAmount);
        formData.append('deadline', deadline);
        if (image) {
            formData.append('image', image);
        }

        try {
            await axios.post(`${API_BASE_URL}/campaigns`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            navigate('/dashboard');
        } catch (err: any) {
            if (err.response?.data?.errors) {
                setError(err.response.data.errors);
            } else {
                setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create campaign');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090B] text-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full  -mr-64 -mt-64 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full  -ml-64 -mb-64" />

            <div className="max-w-6xl mx-auto relative z-10">
                <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Dashboard</span>
                </button>

                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20 mb-4">
                        <Plus className="h-3 w-3" /> New Campaign
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-black text-gray-900 tracking-tighter leading-none mb-4">
                        Launch your cause. <br />
                        <span className="text-gray-500">Inspire the world.</span>
                    </h1>
                </div>

                <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-12">
                    {/* Form Section */}
                    <div className="glass-card rounded-[2.5rem] p-10 space-y-8 border-white/5 bg-[#131316]/60 backdrop- shadow-2xl">
                        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Campaign Blueprint</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Step 1: Define your mission</p>
                            </div>
                        </div>

                        {error && (Array.isArray(error) ? error.length > 0 : error) && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-2xl flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <AlertCircle className="h-6 w-6 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-sm font-black uppercase tracking-tight">Launch Blocked</p>
                                    <ul className="text-xs font-bold leading-relaxed list-disc list-inside">
                                        {Array.isArray(error) ? error.map((err, i) => (
                                            <li key={i}>{err.message || String(err)}</li>
                                        )) : <li>{error}</li>}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <form className="space-y-8" onSubmit={handleSubmit}>
                            <div className="group space-y-2">
                                <label htmlFor="title" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 transition-colors group-hover:text-primary">Campaign Title</label>
                                <input
                                    id="title"
                                    type="text"
                                    required
                                    className="block w-full rounded-2xl bg-[#18181B] border-2 border-transparent px-6 py-4 text-white font-bold placeholder:text-gray-600 focus:border-primary focus:outline-none transition-all"
                                    placeholder="Enter a compelling title..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="group space-y-2">
                                <label htmlFor="description" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 transition-colors group-hover:text-primary">Your Story</label>
                                <textarea
                                    id="description"
                                    required
                                    rows={6}
                                    className="block w-full rounded-2xl bg-[#18181B] border-2 border-transparent px-6 py-4 text-white font-bold placeholder:text-gray-600 focus:border-primary focus:outline-none transition-all resize-none"
                                    placeholder="Share your journey and why this cause matters..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-8">
                                <div className="group space-y-2">
                                    <label htmlFor="targetAmount" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 transition-colors group-hover:text-primary">Funding Goal (NRs)</label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6 text-gray-500 group-hover:text-primary transition-colors">
                                            <Target className="h-5 w-5" />
                                        </div>
                                        <input
                                            id="targetAmount"
                                            type="number"
                                            min="0"
                                            required
                                            className="block w-full rounded-2xl bg-[#18181B] border-2 border-transparent px-14 py-4 text-white font-bold focus:border-primary focus:outline-none transition-all"
                                            placeholder="50,000"
                                            value={targetAmount}
                                            onChange={(e) => setTargetAmount(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="group space-y-2">
                                    <label htmlFor="deadline" className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 transition-colors group-hover:text-primary">Deadline Date</label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6 text-gray-500 group-hover:text-primary transition-colors">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <input
                                            id="deadline"
                                            type="date"
                                            required
                                            className="block w-full rounded-2xl bg-[#18181B] border-2 border-transparent px-14 py-4 text-white font-bold focus:border-primary focus:outline-none transition-all [color-scheme:dark]"
                                            value={deadline}
                                            onChange={(e) => setDeadline(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="group space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 transition-colors group-hover:text-primary">Visual Impact (Cover Image)</label>
                                <div className="relative group/upload h-48 rounded-3xl border-2 border-dashed border-white/10 bg-[#18181B] flex flex-col items-center justify-center hover:border-primary/50 transition-all cursor-pointer overflow-hidden p-4">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover/upload:opacity-60 transition-opacity" />
                                    ) : (
                                        <UploadCloud className="h-10 w-10 text-gray-500 mb-2 group-hover/upload:scale-110 transition-transform" />
                                    )}
                                    <div className="relative z-10 text-center">
                                        <p className="text-sm font-black text-white">Drop image here or click to browse</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">High-quality photos build trust</p>
                                    </div>
                                    <input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex justify-center items-center gap-2 py-5 px-4 rounded-2xl text-base font-black text-black bg-primary hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all disabled:opacity-50 hover:-translate-y-1"
                            >
                                {loading ? (
                                    <>
                                        <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        <span>Deploying...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-5 w-5" />
                                        <span>Launch Now</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Preview Section */}
                    <div className="hidden lg:block space-y-8">
                        <div className="flex items-center gap-4 border-b border-white/5 pb-6 px-4">
                            <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">Real-time Preview</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Mirroring Donor Experience</p>
                            </div>
                        </div>

                        <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 bg-[#131316]/40 backdrop- shadow-2xl group/prev hover:-translate-y-2 transition-transform duration-500">
                            <div className="h-64 bg-[#18181B] relative overflow-hidden">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover transition-transform duration-700 group-hover/prev:scale-105" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-600 font-black italic">No image selected</div>
                                )}
                                <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
                                    <ImageIcon className="h-3 w-3 text-secondary" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Main Media</span>
                                </div>
                            </div>
                            <div className="p-10 space-y-6">
                                <div className="space-y-3">
                                    <h4 className="text-3xl font-black text-white leading-tight line-clamp-2">{title || 'Your compelling title'}</h4>
                                    <p className="text-gray-400 font-medium line-clamp-3 leading-relaxed">{description || 'Share your story to build trust and show impact.'}</p>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Goal</p>
                                            <p className="text-2xl font-black text-white">NRs {Number(targetAmount || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Closing date</p>
                                            <p className="text-lg font-black text-gray-700">{deadline ? new Date(deadline).toLocaleDateString('en-NP', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pick a date'}</p>
                                        </div>
                                    </div>
                                    <div className="w-full h-3 bg-[#18181B] rounded-full overflow-hidden p-0.5 border border-white/5">
                                        <div className="h-full bg-primary/20 rounded-full" style={{ width: '10%' }} />
                                    </div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest text-center">0% Tracked yet</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { title: "Strategy Tip", desc: "Keep it personal and explain the exact math of where NRs will go.", color: "text-primary" },
                                { title: "Trust Hack", desc: "Mention your local reputation or partner organizations.", color: "text-secondary" }
                            ].map((tip, i) => (
                                <div key={i} className="glass-card rounded-2xl p-6 border-white/5 bg-[#131316]/30">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${tip.color} mb-2`}>{tip.title}</p>
                                    <p className="text-xs text-gray-500 font-bold leading-relaxed">{tip.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCampaign;
