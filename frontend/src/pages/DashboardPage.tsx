import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/dashboard/Navbar';
import FileTree from '../components/dashboard/FileTree';
import CodeViewer from '../components/dashboard/CodeViewer';
import ChatPanel from '../components/dashboard/ChatPanel';
import ReadmeModal from '../components/ui/ReadmeModal';

// ─── Drag Divider ─────────────────────────────────────────────────────────────
function Divider({ onDrag }: { onDrag: (dx: number) => void }) {
    const dragging = useRef(false);
    const lastX = useRef(0);
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!dragging.current) return;
            const dx = e.clientX - lastX.current;
            lastX.current = e.clientX;
            onDrag(dx);
        };

        const onMouseUp = () => {
            if (!dragging.current) return;
            dragging.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            divRef.current?.classList.remove('bg-solar-orange/60');
            divRef.current?.classList.add('bg-surface-raised');
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [onDrag]);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        dragging.current = true;
        lastX.current = e.clientX;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        divRef.current?.classList.add('bg-solar-orange/60');
        divRef.current?.classList.remove('bg-surface-raised');
    };

    return (
        <div
            ref={divRef}
            onMouseDown={handleMouseDown}
            className="w-1 shrink-0 bg-surface-raised hover:bg-solar-orange/40 cursor-col-resize transition-colors"
        />
    );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function DashboardPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const repoUrl = searchParams.get('repo') || '';

    const [activeFile, setActiveFile] = useState<string | null>(null);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [readme, setReadme] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const codeRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<HTMLDivElement>(null);

    // Use refs for widths during drag — avoids re-renders
    const codeWidthRef = useRef<number | null>(null);
    const chatWidthRef = useRef<number>(320);

    // Sync DOM directly during drag without triggering React re-renders
    const handleDividerDrag = useCallback((dx: number) => {
        const container = containerRef.current;
        const codeEl = codeRef.current;
        const chatEl = chatRef.current;
        if (!container || !codeEl || !chatEl) return;

        const totalWidth = container.offsetWidth;
        const fileTreeW = 256;
        const available = totalWidth - fileTreeW - 2;

        const CODE_MIN = 300;
        const CODE_MAX = Math.floor(available * 0.65);
        const CHAT_MIN = 280;
        const CHAT_MAX = 500;

        const currentCode = codeWidthRef.current ?? (available - chatWidthRef.current);
        let newCode = currentCode + dx;
        let newChat = available - newCode;

        // Apply code limits
        if (newCode < CODE_MIN) { newCode = CODE_MIN; newChat = available - newCode; }
        if (newCode > CODE_MAX) { newCode = CODE_MAX; newChat = available - newCode; }

        // Apply chat limits
        if (newChat < CHAT_MIN) { newChat = CHAT_MIN; newCode = available - newChat; }
        if (newChat > CHAT_MAX) { newChat = CHAT_MAX; newCode = available - newChat; }

        codeWidthRef.current = newCode;
        chatWidthRef.current = newChat;

        codeEl.style.width = `${newCode}px`;
        codeEl.style.flex = 'none';
        chatEl.style.width = `${newChat}px`;
    }, []);

    if (!repoUrl) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <p className="font-exo text-text-secondary">No repository specified.</p>
                <button
                    onClick={() => navigate('/')}
                    className="font-exo text-sm px-4 py-2 rounded border border-solar-orange text-solar-orange hover:bg-solar-orange/10 transition-colors"
                >
                    Go to Home
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden">
            <Navbar repoUrl={repoUrl} />

            <div ref={containerRef} className="flex flex-1 overflow-hidden">
                {/* Left — File Tree (fixed) */}
                <FileTree
                    repoUrl={repoUrl}
                    activeFile={activeFile}
                    onFileSelect={setActiveFile}
                />

                {/* Center — Code Viewer */}
                <div ref={codeRef} className="flex overflow-hidden" style={{ flex: 1, minWidth: 0 }}>
                    <CodeViewer
                        repoUrl={repoUrl}
                        filePath={activeFile}
                        onExplain={setExplanation}
                    />
                </div>

                {/* Drag divider */}
                <Divider onDrag={handleDividerDrag} />

                {/* Right — Chat Panel */}
                <div ref={chatRef} className="flex overflow-hidden" style={{ width: '320px', minWidth: '280px', maxWidth: '500px' }}>
                    <ChatPanel
                        repoUrl={repoUrl}
                        onFileSelect={setActiveFile}
                        onReadmeGenerated={setReadme}
                        injectMessage={explanation}
                    />
                </div>
            </div>

            {readme && (
                <ReadmeModal readme={readme} onClose={() => setReadme(null)} />
            )}
        </div>
    );
}