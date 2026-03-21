import { useState, useEffect } from 'react';
import axios from 'axios';
import { Quote, Sparkles, Heart, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Story {
    id: string;
    title: string;
    category: string;
    impact_amount: string;
    impact_people: string;
    quote: string;
    author_name: string;
    image_url: string;
    campaignTitle: string;
}

const Stories = () => {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        const fetchStories = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/stories`);
                if (response.data && response.data.length > 0) {
                    setStories(response.data);
                } else {
                    setStories([]);
                }
            } catch (error) {
                console.error('Error fetching stories:', error);
                setStories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, []);

    return (
        <div className="min-h-screen bg-dark relative overflow-hidden py-16">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full  -ml-48 -mt-48 " />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-50 rounded-full  -mr-48 -mb-48  animation-delay-4000" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
                {/* Hero Section */}
                <div className="text-center space-y-6 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">
                        <Sparkles className="h-4 w-4" />
                        Impact Stories
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-black text-gray-900 tracking-tight leading-tight">
                        Real Stories.<br />Real Impact.
                    </h1>
                    <p className="text-xl text-gray-500 font-medium leading-relaxed">
                        See how your donations are transforming lives across Nepal. Every contribution creates ripples of change.
                    </p>
                </div>

                {/* Stories Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                            <p className="text-gray-400 font-bold">Loading inspiring stories...</p>
                        </div>
                    </div>
                ) : stories.length === 0 ? (
                    <div className="glass-card rounded-[2.5rem] p-20 text-center space-y-6">
                        <Heart className="h-16 w-16 text-gray-200 mx-auto" />
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">No Stories Yet</h3>
                            <p className="text-gray-500 font-medium">Check back soon for inspiring impact stories from our community.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-12 lg:gap-16">
                        {stories.map((story, index) => (
                            <div
                                key={story.id}
                                className={`glass-card rounded-[2.5rem] overflow-hidden group hover:premium-shadow transition-all duration-500 ${index % 2 === 0 ? '' : ''
                                    }`}
                            >
                                <div className={`grid lg:grid-cols-2 gap-0 ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                                    {/* Image Section */}
                                    <div className={`relative h-80 lg:h-auto overflow-hidden ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                                        <img
                                            src={story.image_url}
                                            alt={story.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                        <div className="absolute top-6 left-6">
                                            <span className="inline-flex items-center px-4 py-2 rounded-full bg-dark/95 backdrop-blur-xl text-xs font-black uppercase tracking-widest text-gray-900 shadow-xl">
                                                {story.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-10 lg:p-12 flex flex-col justify-center space-y-8">
                                        <div className="space-y-4">
                                            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                                                {story.title}
                                            </h2>
                                            <p className="text-sm font-black text-primary uppercase tracking-widest">
                                                {story.campaignTitle}
                                            </p>
                                        </div>

                                        {/* Quote */}
                                        <div className="relative">
                                            <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20" />
                                            <blockquote className="pl-6 text-lg font-medium text-gray-600 italic leading-relaxed">
                                                {story.quote}
                                            </blockquote>
                                            <p className="mt-4 text-sm font-black text-gray-900">— {story.author_name}</p>
                                        </div>

                                        {/* Impact Stats */}
                                        <div className="grid grid-cols-2 gap-4 pt-4">
                                            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
                                                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2">Funds Raised</p>
                                                <p className="text-2xl font-black text-gray-900">{story.impact_amount}</p>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100">
                                                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2">People Helped</p>
                                                <p className="text-2xl font-black text-gray-900">{story.impact_people}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Stories;
