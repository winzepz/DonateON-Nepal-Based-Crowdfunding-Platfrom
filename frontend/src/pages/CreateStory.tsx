import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Image as ImageIcon, Send, ArrowLeft, Loader2, Quote, Users, Heart } from 'lucide-react';
import { API_BASE_URL } from '../config';

const CreateStory = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [fetchingCampaigns, setFetchingCampaigns] = useState(true);

    const [formData, setFormData] = useState({
        campaign_id: '',
        title: '',
        content: '',
        category: 'Health',
        impact_amount: '',
        impact_people: '',
        quote: '',
        author_name: ''
    });

    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!token || user?.role !== 'CAMPAIGN_CREATOR') {
            navigate('/login');
            return;
        }

        const fetchMyCampaigns = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/campaigns/my-campaigns`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCampaigns(res.data);
                if (res.data.length > 0) {
                    setFormData(prev => ({ ...prev, campaign_id: res.data[0].id }));
                }
            } catch (err) {
                console.error('Failed to fetch campaigns:', err);
            } finally {
                setFetchingCampaigns(false);
            }
        };

        fetchMyCampaigns();
    }, [token, user, navigate]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.campaign_id) return alert('Please select a campaign');

        setLoading(true);
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value);
        });
        if (image) data.append('image', image);

        try {
            await axios.post(`${API_BASE_URL}/stories`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            navigate('/stories');
        } catch (err) {
            console.error('Failed to create story:', err);
            alert('Failed to post story. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingCampaigns) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

    if (campaigns.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-dark p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md text-center space-y-4">
                    <Heart className="h-12 w-12 text-primary/20 mx-auto" />
                    <h2 className="text-xl font-bold text-gray-900">No campaigns found</h2>
                    <p className="text-gray-500">You need to have an active campaign to post an impact story.</p>
                    <button onClick={() => navigate('/create-campaign')} className="w-full bg-primary text-white py-3 rounded-xl font-bold">
                        Create a Campaign
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto space-y-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium">
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>

                <div className="bg-dark rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-indigo-600 p-8 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="h-6 w-6" />
                            <h1 className="text-2xl font-bold">Share your Impact Story</h1>
                        </div>
                        <p className="text-white/80">Highlight the success and transformations powered by your supporters.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Campaign Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Linked Campaign</label>
                            <select
                                value={formData.campaign_id}
                                onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            >
                                {campaigns.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>

                        {/* Title & Category */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Story Title</label>
                                <input
                                    required
                                    placeholder="e.g., Clean Water Reaches 500 Families"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    {['Health', 'Education', 'Community', 'Emergency', 'Relief', 'Environment'].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Impact Metrics */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                    <Heart className="h-4 w-4" /> Amount Raised
                                </label>
                                <input
                                    required
                                    placeholder="e.g., NRs 500,000"
                                    value={formData.impact_amount}
                                    onChange={(e) => setFormData({ ...formData, impact_amount: e.target.value })}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                    <Users className="h-4 w-4" /> People Impacted
                                </label>
                                <input
                                    required
                                    placeholder="e.g., 200+ students"
                                    value={formData.impact_people}
                                    onChange={(e) => setFormData({ ...formData, impact_people: e.target.value })}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">The Story Details</label>
                            <textarea
                                required
                                rows={6}
                                placeholder="Describe the outcome, challenges overcome, and how the funds were used..."
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Impact Image</label>
                            <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:bg-gray-50 transition-all cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                {preview ? (
                                    <div className="relative inline-block">
                                        <img src={preview} alt="Preview" className="h-48 rounded-xl" />
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-all rounded-xl">
                                            <span className="text-white font-bold underline">Change Image</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                            <ImageIcon className="h-6 w-6" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">Click to upload story image</p>
                                        <p className="text-xs text-gray-400">High quality photos work best (max 5MB)</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quote Section */}
                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                                <Quote className="h-5 w-5" />
                                <h3 className="font-bold">Testimonial (Optional)</h3>
                            </div>
                            <div className="space-y-4">
                                <textarea
                                    rows={2}
                                    placeholder="Enter a quote from a beneficiary..."
                                    value={formData.quote}
                                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                                    className="w-full p-4 bg-dark border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                />
                                <input
                                    placeholder="Source Name (e.g., John Doe - Local Resident)"
                                    value={formData.author_name}
                                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                                    className="w-full p-4 bg-dark border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-primary text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
                            Publish Story
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateStory;
