import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/api';

const STAGES = [
    { key: 'cloning', message: "Breaking and entering (legally)... cloning your repo" },
    { key: 'reading', message: "Speed-reading thousands of lines so you don't have to..." },
    { key: 'chunking', message: "Slicing and dicing the codebase into digestible bits..." },
    { key: 'embedding', message: "Teaching the AI what your code actually means..." },
    { key: 'storing', message: "Filing everything neatly into the vector database..." },
    { key: 'done', message: "All done. Time to ask the dumb questions." },
];

const TIMEOUT_MS = 90_000;

export default function LoadingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const repoUrl = (location.state as any)?.repoUrl || '';

    const [stageIndex, setStageIndex] = useState(0);
    const [cancelled, setCancelled] = useState(false);
    const [error, setError] = useState('');

    const abortRef = useRef<AbortController | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mousePos = useRef({ x: -999, y: -999 });
    const animFrameRef = useRef<number>(0);

    // ─── Redirect if no repoUrl ───────────────────────────────────────────────
    useEffect(() => {
        if (!repoUrl) navigate('/');
    }, [repoUrl, navigate]);

    // ─── Stage cycling while loading ──────────────────────────────────────────
    useEffect(() => {
        if (cancelled || error) return;
        if (stageIndex >= STAGES.length - 2) return;
        const t = setTimeout(() => setStageIndex(i => i + 1), 12000);
        return () => clearTimeout(t);
    }, [stageIndex, cancelled, error]);

    // ─── API call ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!repoUrl) return;
        let mounted = true;

        const controller = new AbortController();
        abortRef.current = controller;

        const timeout = setTimeout(() => {
            controller.abort();
            if (mounted) setCancelled(true);
        }, TIMEOUT_MS);

        api.post('/api/repos/index', { repoUrl }, { signal: controller.signal })
            .then(() => {
                clearTimeout(timeout);
                if (!mounted) return;
                setStageIndex(STAGES.length - 1);
                setTimeout(() => {
                    navigate(`/dashboard?repo=${encodeURIComponent(repoUrl)}`);
                }, 1500);
            })
            .catch((err) => {
                clearTimeout(timeout);
                if (!mounted) return;
                if (err.code === 'ERR_CANCELED') {
                    setCancelled(true);
                } else {
                    setError(err.response?.data?.error || 'Something went wrong. Please try again.');
                }
            });

        return () => {
            mounted = false;
            clearTimeout(timeout);
        };
    }, [repoUrl, navigate]);

    // ─── Solar beam cursor canvas ─────────────────────────────────────────────
    // ─── Canvas: stars + cursor glow ─────────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            generateStars();
        };

        // ── Stars ──────────────────────────────────────────────────────────────
        interface Star { x: number; y: number; r: number; opacity: number; }
        let stars: Star[] = [];

        const generateStars = () => {
            stars = Array.from({ length: 160 }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.2 + 0.3,
                opacity: Math.random() * 0.6 + 0.2,
            }));
        };

        generateStars();
        resize();
        window.addEventListener('resize', resize);

        // ── Smooth cursor position (lerped) ───────────────────────────────────
        const smoothPos = { x: -999, y: -999 };

        interface TrailPoint { x: number; y: number; life: number; }
        const trail: TrailPoint[] = [];

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw stars
            for (const s of stars) {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
                ctx.fill();
            }

            const tx = mousePos.current.x;
            const ty = mousePos.current.y;
            if (tx > 0) {
                smoothPos.x += (tx - smoothPos.x) * 0.12;
                smoothPos.y += (ty - smoothPos.y) * 0.12;

                const x = smoothPos.x;
                const y = smoothPos.y;

                // Add trail point at smoothed position
                trail.push({ x, y, life: 1 });
                if (trail.length > 28) trail.shift();

                // Draw trail — dots that fade out
                for (let i = 0; i < trail.length; i++) {
                    const t = trail[i];
                    t.life = i / trail.length; // older = more faded
                    const size = t.life * 3.5;
                    const alpha = t.life * 0.6;
                    const hue = 25 + (i / trail.length) * 20;
                    ctx.beginPath();
                    ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
                    ctx.shadowBlur = 6;
                    ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.5)`;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }

                // Outer soft glow
                const grad = ctx.createRadialGradient(x, y, 0, x, y, 160);
                grad.addColorStop(0, 'rgba(251,191,36,0.15)');
                grad.addColorStop(0.5, 'rgba(249,115,22,0.06)');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x, y, 160, 0, Math.PI * 2);
                ctx.fill();

                // Solid neon cursor circle
                ctx.beginPath();
                ctx.arc(x, y, 7, 0, Math.PI * 2);
                ctx.strokeStyle = '#F97316';
                ctx.lineWidth = 1.5;
                ctx.shadowBlur = 12;
                ctx.shadowColor = '#F97316';
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Inner dot
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fillStyle = '#FCD34D';
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#FCD34D';
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            animFrameRef.current = requestAnimationFrame(draw);
        };

        draw();

        const onMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', onMouseMove);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    // ─── Cancelled / error state ──────────────────────────────────────────────
    if (cancelled || error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-8" style={{ cursor: 'none' }}>
                <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
                <div className="relative z-10 max-w-md w-full border border-red-500/30 rounded-2xl bg-black/80 p-8 flex flex-col items-center gap-6 text-center">
                    <div className="w-12 h-12 rounded-full border-2 border-red-500/50 flex items-center justify-center">
                        <span className="text-red-400 text-xl">✕</span>
                    </div>
                    <div>
                        <h2 className="font-exo text-lg font-bold text-red-400 mb-2">
                            {cancelled ? 'Repository Too Large' : 'Something Went Wrong'}
                        </h2>
                        <p className="font-arya text-sm text-text-secondary leading-relaxed">
                            {cancelled
                                ? 'This repo is too large for our free-tier embeddings. Try a smaller repo — under 50 files works best.'
                                : error
                            }
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="font-exo text-sm px-6 py-2.5 rounded-lg border border-solar-orange text-solar-orange hover:bg-solar-orange/10 transition-colors"
                    >
                        ← Go Back
                    </button>
                </div>
            </div>
        );
    }

    const currentStage = STAGES[Math.min(stageIndex, STAGES.length - 1)];
    const isDone = stageIndex === STAGES.length - 1;

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden" style={{ cursor: 'none' }}>
            <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

            <div
                className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 blur-3xl z-0"
                style={{ background: 'radial-gradient(ellipse, #F97316 0%, #7C3AED 50%, transparent 70%)' }}
            />

            <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-lg">
                <p className="font-mono text-xs text-text-muted tracking-wider">
                    {repoUrl.replace('https://github.com/', '')}
                </p>

                <div className="text-center min-h-[3rem] flex items-center justify-center">
                    <p
                        key={currentStage.key}
                        className="font-exo text-lg text-text-primary"
                        style={{
                            animation: 'fadeIn 0.5s ease-in-out',
                            textShadow: isDone ? '0 0 20px rgba(249,115,22,0.8)' : 'none',
                            color: isDone ? '#F97316' : undefined,
                        }}
                    >
                        {currentStage.message}
                    </p>
                </div>

                <div className="w-full h-0.5 bg-surface-raised rounded-full overflow-hidden relative">
                    {isDone ? (
                        <div className="h-full w-full bg-solar-orange rounded-full transition-all duration-700" />
                    ) : (
                        <div
                            className="h-full absolute top-0 rounded-full"
                            style={{
                                width: '40%',
                                animation: 'slideBar 1.8s ease-in-out infinite',
                                background: 'linear-gradient(90deg, transparent, #FACC15, #F97316, #FACC15, transparent)',
                                boxShadow: '0 0 12px rgba(249,115,22,0.8)',
                            }}
                        />
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {STAGES.slice(0, -1).map((s, i) => (
                        <div
                            key={s.key}
                            className="rounded-full transition-all duration-500"
                            style={{
                                width: i <= stageIndex ? '8px' : '6px',
                                height: i <= stageIndex ? '8px' : '6px',
                                background: i <= stageIndex ? '#F97316' : '#1E293B',
                                boxShadow: i === stageIndex ? '0 0 8px rgba(249,115,22,0.8)' : 'none',
                            }}
                        />
                    ))}
                </div>
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideBar {
          0%   { left: -40%; }
          100% { left: 140%; }
        }
      `}</style>
        </div>
    );
}