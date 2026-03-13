import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const STEPS = [
    {
        number: '01',
        title: 'Paste the URL',
        desc: "Drop any public GitHub repository URL into the input. That's your only job.",
        icon: '⌨️',
    },
    {
        number: '02',
        title: 'Let the Magic Happen',
        desc: 'We clone it, read every file, split the code into chunks, and embed it all into a vector database.',
        icon: '⚡',
    },
    {
        number: '03',
        title: 'Just Ask',
        desc: 'Type any question about the codebase. We find the relevant code and answer with precision.',
        icon: '💬',
    },
];

export default function StepsSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);
    const progress = useMotionValue(0);
    const x = useTransform(progress, [0, 1, 2], ['0vw', '-100vw', '-200vw']);
    const accumRef = useRef(0);

    useEffect(() => {
        const onWheel = (e: WheelEvent) => {
            const section = sectionRef.current;
            if (!section) return;

            const rect = section.getBoundingClientRect();

            // Only intercept if THIS section is the one most centered in viewport
            const center = rect.top + rect.height / 2;
            const viewCenter = window.innerHeight / 2;
            if (Math.abs(center - viewCenter) > window.innerHeight / 2) return;

            if (active >= STEPS.length - 1 && e.deltaY > 0) return;
            if (active <= 0 && e.deltaY < 0) return;

            e.preventDefault();
            e.stopPropagation();

            accumRef.current += e.deltaY;

            const threshold = 120;
            if (accumRef.current > threshold) {
                accumRef.current = 0;
                const next = Math.min(active + 1, STEPS.length - 1);
                setActive(next);
                animate(progress, next, { duration: 0.6, ease: [0.32, 0, 0.67, 0] });
            } else if (accumRef.current < -threshold) {
                accumRef.current = 0;
                const prev = Math.max(active - 1, 0);
                setActive(prev);
                animate(progress, prev, { duration: 0.6, ease: [0.32, 0, 0.67, 0] });
            }
        };

        window.addEventListener('wheel', onWheel, { passive: false });
        return () => window.removeEventListener('wheel', onWheel);
    }, [active, progress]);

    return (
        <div
            ref={sectionRef}
            className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Header */}
            <div className="absolute top-12 text-center z-10">
                <p className="font-exo text-xs text-solar-orange uppercase tracking-widest mb-2">
                    How It Works
                </p>
                <h2 className="font-exo text-3xl font-bold text-text-primary">
                    Three steps to{' '}
                    <span style={{ color: '#F97316', textShadow: '0 0 20px rgba(249,115,22,0.5)' }}>
                        understand anything
                    </span>
                </h2>
            </div>

            {/* Cards track */}
            <motion.div style={{ x }} className="flex w-screen">
                {STEPS.map((step, i) => (
                    <div
                        key={step.number}
                        className="w-screen shrink-0 flex items-center justify-center px-6"
                    >
                        <motion.div
                            animate={{
                                opacity: active === i ? 1 : 0.3,
                                scale: active === i ? 1 : 0.92,
                            }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center text-center gap-6 p-10 rounded-2xl border border-surface-raised bg-surface/50 backdrop-blur-sm max-w-md w-full"
                            style={{ boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}
                        >
                            <span
                                className="font-exo text-7xl font-black select-none"
                                style={{
                                    color: 'transparent',
                                    WebkitTextStroke: '1px rgba(249,115,22,0.5)',
                                    textShadow: active === i ? '0 0 30px rgba(249,115,22,0.6)' : 'none',
                                }}
                            >
                                {step.number}
                            </span>

                            <div
                                className="w-16 h-16 rounded-full border border-solar-orange/30 bg-solar-orange/5 flex items-center justify-center text-3xl"
                                style={{ boxShadow: active === i ? '0 0 20px rgba(249,115,22,0.25)' : 'none' }}
                            >
                                {step.icon}
                            </div>

                            <h3 className="font-exo text-xl font-bold text-text-primary">{step.title}</h3>
                            <p className="font-arya text-base text-text-secondary leading-relaxed">{step.desc}</p>
                        </motion.div>
                    </div>
                ))}
            </motion.div>

            {/* Progress dots */}
            <div className="absolute bottom-12 flex gap-2 z-10">
                {STEPS.map((_, i) => (
                    <div
                        key={i}
                        className="rounded-full transition-all duration-500"
                        style={{
                            width: active === i ? '20px' : '8px',
                            height: '8px',
                            background: i <= active ? '#F97316' : '#1E293B',
                            boxShadow: active === i ? '0 0 8px rgba(249,115,22,0.8)' : 'none',
                        }}
                    />
                ))}
            </div>

            {/* Scroll hint */}
            <div className="absolute bottom-12 right-8 text-text-muted font-arya text-xs">
                {active < STEPS.length - 1 ? 'scroll to continue →' : 'scroll to proceed ↓'}
            </div>
        </div>
    );
}