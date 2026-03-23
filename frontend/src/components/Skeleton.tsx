import React from 'react';

interface SkeletonProps {
    className?: string;
}

const Skeleton = ({ className = '' }: SkeletonProps) => {
    return (
        <div 
            className={`animate-pulse bg-white/5 rounded-2xl overflow-hidden relative isolate ${className}`}
        >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
    <div className="space-y-4 w-full">
        {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex gap-4 p-6 glass-card border-white/5 bg-[#131316]/40 rounded-2xl">
                <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
                <div className="flex-grow space-y-3">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2 opacity-50" />
                </div>
                <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
        ))}
    </div>
);

export const CardSkeleton = () => (
    <div className="glass-card p-10 rounded-[3rem] border-white/5 bg-[#131316]/60 space-y-8">
        <div className="flex items-center gap-6">
            <Skeleton className="h-16 w-16 rounded-[1.8rem]" />
            <div className="space-y-3 flex-grow">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-3 w-1/3 opacity-50" />
            </div>
        </div>
        <div className="space-y-4 pt-4 border-t border-white/5">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
        <div className="pt-6 space-y-4">
            <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
    </div>
);

export const DashboardSkeleton = () => (
    <div className="space-y-12">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4 space-y-8">
                <CardSkeleton />
                <div className="glass-card p-8 rounded-[2.5rem] border-white/5 bg-[#131316]/40 space-y-6">
                    <Skeleton className="h-6 w-1/2" />
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </div>
            <div className="lg:col-span-8 space-y-10">
                <div className="grid grid-cols-2 gap-6">
                    <Skeleton className="h-32 w-full rounded-[2rem]" />
                    <Skeleton className="h-32 w-full rounded-[2rem]" />
                </div>
                <TableSkeleton rows={4} />
            </div>
        </div>
    </div>
);

export const CampaignDetailsSkeleton = () => (
    <div className="space-y-12">
        <div className="glass-card rounded-[3.5rem] overflow-hidden border-white/5 bg-[#131316]/40">
            <Skeleton className="h-[400px] w-full" />
            <div className="p-12 space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-1/2 opacity-50" />
                </div>
                <div className="grid md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
                    <Skeleton className="h-24 w-full rounded-3xl" />
                    <Skeleton className="h-24 w-full rounded-3xl" />
                    <Skeleton className="h-24 w-full rounded-3xl" />
                </div>
            </div>
        </div>
    </div>
);

export const GridSkeleton = ({ count = 6 }) => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(count)].map((_, i) => (
            <div key={i} className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 bg-[#131316]/40">
                <Skeleton className="h-56 w-full" />
                <div className="p-8 space-y-6">
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-3 w-1/2 opacity-50" />
                    </div>
                    <div className="pt-6 border-t border-white/5">
                        <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export default Skeleton;
