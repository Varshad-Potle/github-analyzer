import { useEffect, useRef } from 'react';

export default function ParticlesBg() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mousePos = useRef({ x: -999, y: -999 });
    const frameRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
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

        // Aurora blobs
        let auroraT = 0;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            auroraT += 0.003;

            // ── Aurora blobs ────────────────────────────────────────────────
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

            // ── Stars ────────────────────────────────────────────────────────
            const mx = mousePos.current.x;
            const my = mousePos.current.y;

            for (const s of stars) {
                // Repulse from cursor
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

                // Dampen and move
                s.vx *= 0.95;
                s.vy *= 0.95;
                s.x += s.vx;
                s.y += s.vy;

                // Wrap edges
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

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
        />
    );
}