import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { FiGithub, FiHash } from 'react-icons/fi';

const TEAM = [
    {
        name: 'Varshad Potle',
        id: '23005055',
        github: 'Varshad-Potle',
        hasGithub: true,
    },
    {
        name: 'Vinay Sharma',
        id: '23005060',
        github: 'shekhar-vinay',
        hasGithub: true,
    },
    {
        name: 'Yash Pathak',
        id: '23005064',
        github: '',
        hasGithub: false,
    },
];

export default function TeamSection() {
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
            if (rect.top > 10 || rect.bottom < window.innerHeight - 10) return;

            if (active >= TEAM.length - 1 && e.deltaY > 0) return;
            if (active <= 0 && e.deltaY < 0) return;

            e.preventDefault();
            e.stopPropagation();

            accumRef.current += e.deltaY;

            const threshold = 200;
            if (accumRef.current > threshold) {
                accumRef.current = 0;
                const next = Math.min(active + 1, TEAM.length - 1);
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
                    The Team
                </p>
                <h2 className="font-exo text-3xl font-bold text-text-primary">
                    Built by{' '}
                    <span style={{ color: '#FCD34D', textShadow: '0 0 20px rgba(252,211,77,0.5)' }}>
                        curious engineers
                    </span>
                </h2>
            </div>

            {/* Cards track */}
            <motion.div style={{ x }} className="flex w-screen">
                {TEAM.map((member, i) => (
                    <div
                        key={member.id}
                        className="w-screen shrink-0 flex items-center justify-center px-6"
                    >
                        <motion.div
                            animate={{
                                opacity: active === i ? 1 : 0.3,
                                scale: active === i ? 1 : 0.92,
                            }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center gap-6 p-10 rounded-2xl border border-surface-raised bg-surface/50 backdrop-blur-sm max-w-sm w-full text-center"
                            style={{ boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}
                        >
                            {/* Avatar */}
                            <motion.div
                                className="w-24 h-24 rounded-full overflow-hidden border-2 border-solar-orange/40"
                                animate={{
                                    boxShadow: active === i
                                        ? ['0 0 10px rgba(249,115,22,0.2)', '0 0 30px rgba(249,115,22,0.5)', '0 0 10px rgba(249,115,22,0.2)']
                                        : '0 0 0px transparent',
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                {member.hasGithub ? (
                                    <img
                                        src={`https://github.com/${member.github}.png`}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                        onError={e => {
                                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                                            (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div
                                    className="w-full h-full bg-surface-raised items-center justify-center"
                                    style={{ display: member.hasGithub ? 'none' : 'flex' }}
                                >
                                    <span className="font-expletus text-solar-orange text-2xl font-bold">
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                            </motion.div>

                            {/* Name + ID */}
                            <div>
                                <h3
                                    className="font-expletus text-xl font-semibold text-text-primary mb-2"
                                    style={{ textShadow: active === i ? '0 0 15px rgba(252,211,77,0.3)' : 'none' }}
                                >
                                    {member.name}
                                </h3>
                                <div className="flex items-center justify-center gap-1 text-text-muted">
                                    <FiHash className="text-xs text-solar-orange/60" />
                                    <span className="font-mono text-sm">{member.id}</span>
                                </div>
                            </div>

                            {/* GitHub */}
                            {member.hasGithub && (
                                <a
                                    href={`https://github.com/${member.github}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm font-exo text-text-muted hover:text-solar-orange transition-colors px-4 py-2 rounded-full border border-surface-raised hover:border-solar-orange/30"
                                >
                                    <FiGithub />
                                    {member.github}
                                </a>
                            )}
                        </motion.div>
                    </div>
                ))}
            </motion.div>

            {/* Progress dots */}
            <div className="absolute bottom-12 flex gap-2 z-10">
                {TEAM.map((_, i) => (
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
                {active < TEAM.length - 1 ? 'scroll to continue →' : 'scroll to proceed ↓'}
            </div>
        </div>
    );
}