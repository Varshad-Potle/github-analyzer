import { useEffect, useRef } from 'react';

export default function ParticlesBg() {
    const particlesRef = useRef<HTMLCanvasElement>(null);
    const cursorRef = useRef<HTMLCanvasElement>(null);
    const mousePos = useRef({ x: -999, y: -999 });
    const frameRef = useRef<number>(0);
    const cursorFrame = useRef<number>(0);

    // ─── Particles + Aurora ───────────────────────────────────────────────────
    useEffect(() => {
        const canvas = particlesRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        interface Star {
            x: number; y: number;
            r: number; opacity: number;
            vx: number; vy: number;
        }

        let stars: Star[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            stars = Array.from({ length: 180 }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.3 + 0.2,
                opacity: Math.random() * 0.5 + 0.15,
                vx: (Math.random() - 0.5) * 0.08,
                vy: (Math.random() - 0.5) * 0.08,
            }));
        };

        resize();
        window.addEventListener('resize', resize);

        let auroraT = 0;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            auroraT += 0.003;

            const cx1 = canvas.width * 0.15 + Math.sin(auroraT) * 40;
            const cy1 = canvas.height * 0.8 + Math.cos(auroraT * 0.7) * 30;
            const g1 = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, 350);
            g1.addColorStop(0, 'rgba(124,58,237,0.18)');
            g1.addColorStop(0.5, 'rgba(249,115,22,0.07)');
            g1.addColorStop(1, 'transparent');
            ctx.fillStyle = g1;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const cx2 = canvas.width * 0.85 + Math.cos(auroraT * 0.8) * 50;
            const cy2 = canvas.height * 0.2 + Math.sin(auroraT * 1.1) * 40;
            const g2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 280);
            g2.addColorStop(0, 'rgba(249,115,22,0.12)');
            g2.addColorStop(0.5, 'rgba(124,58,237,0.05)');
            g2.addColorStop(1, 'transparent');
            ctx.fillStyle = g2;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const mx = mousePos.current.x;
            const my = mousePos.current.y;

            for (const s of stars) {
                if (mx > 0) {
                    const dx = s.x - mx;
                    const dy = s.y - my;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        const force = (100 - dist) / 100;
                        s.vx += (dx / dist) * force * 0.4;
                        s.vy += (dy / dist) * force * 0.4;
                    }
                }
                s.vx *= 0.95;
                s.vy *= 0.95;
                s.x += s.vx;
                s.y += s.vy;
                if (s.x < 0) s.x = canvas.width;
                if (s.x > canvas.width) s.x = 0;
                if (s.y < 0) s.y = canvas.height;
                if (s.y > canvas.height) s.y = 0;

                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
                ctx.fill();
            }

            frameRef.current = requestAnimationFrame(draw);
        };

        draw();

        const onMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', onMove);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMove);
            cancelAnimationFrame(frameRef.current);
        };
    }, []);

    // ─── Cursor canvas ────────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = cursorRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const smoothPos = { x: -999, y: -999 };

        interface TrailPoint { x: number; y: number; }
        const trail: TrailPoint[] = [];

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const tx = mousePos.current.x;
            const ty = mousePos.current.y;

            if (tx > 0) {
                smoothPos.x += (tx - smoothPos.x) * 0.12;
                smoothPos.y += (ty - smoothPos.y) * 0.12;

                const x = smoothPos.x;
                const y = smoothPos.y;

                trail.push({ x, y });
                if (trail.length > 28) trail.shift();

                // Trail dots
                for (let i = 0; i < trail.length; i++) {
                    const t = trail[i];
                    const life = i / trail.length;
                    const size = life * 3.5;
                    const alpha = life * 0.6;
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

                // Neon circle
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

            cursorFrame.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(cursorFrame.current);
        };
    }, []);

    return (
        <>
            <canvas ref={particlesRef} className="fixed inset-0 pointer-events-none z-0" />
            <canvas ref={cursorRef} className="fixed inset-0 pointer-events-none z-10" />
            <style>{`* { cursor: none !important; }`}</style>
        </>
    );
}