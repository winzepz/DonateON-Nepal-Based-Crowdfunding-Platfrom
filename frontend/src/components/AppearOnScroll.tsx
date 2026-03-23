import React, { useEffect, useRef, useState } from 'react';

interface AppearOnScrollProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    threshold?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

const AppearOnScroll: React.FC<AppearOnScrollProps> = ({ 
    children, 
    className = "", 
    delay = 0, 
    threshold = 0.1,
    direction = 'up'
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        setIsVisible(true);
                    }, delay);
                    // Once visible, stop observing
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold });

        const currentRef = domRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [delay, threshold]);

    const getDirectionClass = () => {
        if (!isVisible) {
            switch (direction) {
                case 'up': return 'translate-y-10 opacity-0';
                case 'down': return '-translate-y-10 opacity-0';
                case 'left': return 'translate-x-10 opacity-0';
                case 'right': return '-translate-x-10 opacity-0';
                case 'none': return 'opacity-0 scale-95';
                default: return 'translate-y-10 opacity-0';
            }
        }
        return 'translate-y-0 translate-x-0 opacity-100 scale-100';
    };

    return (
        <div
            ref={domRef}
            className={`transition-all duration-1000 ease-out ${getDirectionClass()} ${className}`}
        >
            {children}
        </div>
    );
};

export default AppearOnScroll;
