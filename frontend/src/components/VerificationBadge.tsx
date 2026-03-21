import { BadgeCheck } from 'lucide-react';

interface VerificationBadgeProps {
    status?: string;
    showLabel?: boolean;
}

const VerificationBadge = ({ status, showLabel = false }: VerificationBadgeProps) => {
    if (status !== 'VERIFIED') return null;

    return (
        <div className="inline-flex items-center gap-1.5" title="Verified Account">
            <div className="relative flex items-center justify-center">
                <BadgeCheck className="h-5 w-5 text-emerald-500 relative z-10" />
                <div className="absolute inset-0 bg-emerald-500/20 blur-[6px] rounded-full scale-110" />
            </div>
            {showLabel && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Verified</span>}
        </div>
    );
};

export default VerificationBadge;
