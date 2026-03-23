import { Link } from 'react-router-dom';
import { ArrowRight, User } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export interface CampaignCardProps {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    organizerName?: string;
    currentAmount: number;
    targetAmount: number;
    to?: string;
}

const CampaignCard = ({
    id,
    title,
    description,
    imageUrl,
    organizerName,
    currentAmount,
    targetAmount,
    to,
}: CampaignCardProps) => {
    const progress = Math.min((currentAmount / (targetAmount || 1)) * 100, 100);
    const detailsHref = to || `/campaigns/${id}`;

    // Tilt Effect Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div 
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="group glass-card overflow-hidden rounded-[2.5rem] flex flex-col hover:premium-shadow transition-all duration-500 perspective-[1000px]"
        >
            <div 
                style={{ transform: "translateZ(50px)" }}
                className="h-56 w-full bg-gray-100 relative overflow-hidden"
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50 font-black tracking-widest uppercase text-xs">No Image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                {organizerName && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-dark/95 backdrop-blur-xl rounded-2xl px-3 py-1.5 shadow-xl border border-white/20">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="h-3 w-3" />
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
                            {organizerName}
                        </span>
                    </div>
                )}
            </div>

            <div 
                style={{ transform: "translateZ(30px)" }}
                className="px-6 py-6 flex-grow flex flex-col justify-between"
            >
                <div className="space-y-3">
                    <h3 className="text-xl font-black text-white leading-tight line-clamp-2 tracking-tight group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 line-clamp-3 leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className="pt-6 space-y-3">
                    <div className="flex items-end justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Raised</span>
                            <span className="text-lg font-black text-white">NRs {currentAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Target</span>
                            <span className="text-xs font-bold text-gray-600">NRs {targetAmount.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="relative w-full bg-white/5 rounded-full h-3.5 p-0.5 overflow-hidden border border-white/5">
                        <div
                            className="bg-gradient-to-r from-primary via-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out group-hover:shadow-[0_0_15px_rgba(79,70,229,0.3)] shadow-indigo-500/20"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                            {progress.toFixed(0)}% Funded
                        </span>
                    </div>
                </div>
            </div>

            <div 
                style={{ transform: "translateZ(40px)" }}
                className="px-6 pb-6 pt-2"
            >
                <Link
                    to={detailsHref}
                    className="w-full h-[54px] inline-flex items-center justify-center gap-3 rounded-2xl text-[10px] font-black uppercase text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-all group-link tracking-widest"
                >
                    Review Campaign
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </motion.div>
    );
};

export default CampaignCard;
