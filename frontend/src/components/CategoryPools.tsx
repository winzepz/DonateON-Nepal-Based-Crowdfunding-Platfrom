import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config';
import AppearOnScroll from './AppearOnScroll';

interface CategoryPool {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string;
  total_amount: string;
  accent_color: string;
  icon_name: string;
}

const CategoryPools = () => {
  const [pools, setPools] = useState<CategoryPool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/categories`);
        setPools(response.data);
      } catch (error) {
        console.error('Failed to fetch category pools', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPools();
  }, []);

  if (loading) return null;

  return (
    <section id="categories" className="py-24 bg-dark relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-4">Support Broad Causes</h2>
            <h3 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-[1.1]">
              Impact Categories
            </h3>
            <p className="text-lg text-gray-500 font-medium mt-4">
              Donate to a category pool and let us distribute funds to verified campaigns in that sector.
            </p>
          </div>
          <Link 
            to="/campaigns" 
            className="inline-flex items-center text-primary font-black uppercase tracking-widest text-xs hover:gap-2 transition-all group"
          >
            Browse Individual Campaigns
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pools.map((pool, i) => (
            <AppearOnScroll key={pool.id} delay={i * 100}>
              <div 
                className="group relative bg-white/5 rounded-[2rem] border border-white/5 hover:border-primary/30 transition-all duration-500 overflow-hidden flex flex-col h-full"
                style={{ borderColor: pool.accent_color ? `${pool.accent_color}1a` : undefined }}
              >
                {/* Image Header */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={pool.image_url} 
                    alt={pool.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-4 left-6 flex items-center gap-2">
                    <div 
                        className="h-2 w-2 rounded-full animate-pulse" 
                        style={{ backgroundColor: pool.accent_color || '#10b981' }}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Mass Pool</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-1">
                  <Link to={`/categories/${pool.slug}`}>
                    <h4 
                        className="text-2xl font-black text-white mb-2 tracking-tight transition-colors"
                        style={{ color: pool.accent_color }}
                    >
                        {pool.name}
                    </h4>
                  </Link>
                  <p className="text-sm font-medium text-gray-500 line-clamp-2 mb-6">
                    {pool.description}
                  </p>
                  
                  <div className="mt-auto space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Impact</p>
                        <p className="text-xl font-mono font-black text-white">
                          NRs {parseFloat(pool.total_amount).toLocaleString()}
                        </p>
                      </div>
                      <Link to={`/categories/${pool.slug}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </Link>
                    </div>

                    <Link 
                      to={`/donate?categoryPoolId=${pool.id}&name=${encodeURIComponent(pool.name)}`}
                      className="w-full inline-flex items-center justify-center py-4 bg-primary text-black font-black rounded-xl hover:bg-emerald-400 transition-all text-xs uppercase tracking-[0.1em]"
                    >
                      Donate to Pool
                    </Link>
                  </div>
                </div>
              </div>
            </AppearOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryPools;
