import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

interface NumberTickerProps {
  value: number;
  direction?: 'up' | 'down';
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

const NumberTicker = ({
  value,
  direction = 'up',
  delay = 0,
  className,
  prefix = '',
  suffix = '',
}: NumberTickerProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === 'down' ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: '0px' });

  useEffect(() => {
    if (isInView) {
      setTimeout(() => {
        motionValue.set(direction === 'down' ? 0 : value);
      }, delay * 1000);
    }
  }, [motionValue, isInView, delay, value, direction]);

  useEffect(
    () =>
      springValue.on('change', (latest) => {
        if (ref.current) {
          ref.current.textContent = 
            prefix + 
            Intl.NumberFormat('en-US').format(Math.round(latest)) + 
            suffix;
        }
      }),
    [springValue, prefix, suffix]
  );

  return (
    <span
      className={`inline-block tabular-nums text-white tracking-tighter ${className}`}
      ref={ref}
    />
  );
};

export default NumberTicker;
