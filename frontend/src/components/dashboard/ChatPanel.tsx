import { useState, useRef, useEffect } from 'react';
import { FiSend, FiLoader, FiFile, FiBookOpen } from 'react-icons/fi';
import api from '../../lib/api';
import MessageContent from './MessageContent';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    sources?: { filePath: string; snippet: string }[];
}

interface ChatPanelProps {
    repoUrl: string;
    onFileSelect: (filePath: string) => void;
    onReadmeGenerated?: (readme: string) => void;
    injectMessage?: string | null;
}

export default function ChatPanel({
    repoUrl,
    onFileSelect,
    onReadmeGenerated,
    injectMessage,
}: ChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [genReadme, setGenReadme] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const abortRef = useRef<AbortController | null>(null);

    // Scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // When CodeViewer triggers "explain this file", inject the explanation as assistant message
    useEffect(() => {
        if (!injectMessage) return;
        setMessages(prev => [...prev, { role: 'assistant', content: injectMessage }]);
    }, [injectMessage]);

    const sendMessage = async () => {
        const question = input.trim();
        if (!question || loading) return;

        const controller = new AbortController();
        abortRef.current = controller;

        setMessages(prev => [...prev, { role: 'user', content: question }]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/api/chat/query', { question, repoUrl }, {
                signal: controller.signal,
            });
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: res.data.answer,
                sources: res.data.sources,
            }]);
        } catch (err: any) {
            if (err.code === 'ERR_CANCELED') {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Response cancelled.',
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Something went wrong. Please try again.',
                }]);
            }
        } finally {
            setLoading(false);
            abortRef.current = null;
        }
    };

    const stopResponse = () => {
        abortRef.current?.abort();
    };
    const handleGenerateReadme = async () => {
        setGenReadme(true);
        try {
            const res = await api.post('/api/chat/generate-readme', { repoUrl });
            onReadmeGenerated?.(res.data.readme);
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Could not generate README. Please try again.',
            }]);
        } finally {
            setGenReadme(false);
        }
    };

    return (
        <div className="flex flex-col overflow-hidden h-full w-full bg-surface border-l border-surface-raised">
            {/* Header */}
            <div className="px-3 py-2 border-b border-surface-raised flex items-center justify-between shrink-0">
                <span className="font-exo text-xs text-text-muted uppercase tracking-widest">Chat</span>
                <button
                    onClick={handleGenerateReadme}
                    disabled={genReadme}
                    className="flex items-center gap-1 text-xs font-exo text-solar-gold hover:text-solar-orange transition-colors disabled:opacity-50"
                >
                    {genReadme
                        ? <><FiLoader className="animate-spin text-xs" /> Generating...</>
                        : <><FiBookOpen className="text-xs" /> README</>
                    }
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
                {messages.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 text-text-muted">
                        <FiSend className="text-2xl text-surface-raised" />
                        <p className="font-arya text-xs">Ask anything about this codebase</p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div
                            className={`max-w-full rounded-lg px-3 py-2 text-xs font-arya leading-relaxed overflow-hidden break-words
        ${msg.role === 'user'
                                    ? 'bg-solar-orange text-white'
                                    : 'bg-surface-raised text-text-secondary'
                                }`}
                        >
                            {msg.role === 'assistant'
                                ? <MessageContent content={msg.content} />
                                : <p>{msg.content}</p>
                            }
                        </div>

                        {/* Source file chips */}
                        {msg.sources && msg.sources.length > 0 && (
                            <div className="flex flex-wrap gap-1 max-w-full">
                                {msg.sources.map((src, si) => (
                                    <button
                                        key={si}
                                        onClick={() => onFileSelect(src.filePath)}
                                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-solar-orange/30 text-solar-orange hover:bg-solar-orange/10 transition-colors font-mono"
                                    >
                                        <FiFile className="text-xs" />
                                        {src.filePath.split('/').pop()}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                    <div className="flex items-start gap-2">
                        <div className="bg-surface-raised rounded-lg px-3 py-2 flex items-center gap-3 border border-surface-raised">
                            <span className="w-1.5 h-1.5 rounded-full bg-solar-orange animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-solar-orange animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-solar-orange animate-bounce" style={{ animationDelay: '300ms' }} />
                            <button
                                onClick={stopResponse}
                                className="ml-1 text-xs font-exo text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-300/50 px-2 py-0.5 rounded transition-colors"
                            >
                                Stop
                            </button>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-surface-raised shrink-0">
                <div className="flex gap-2">
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder="Ask about the codebase..."
                        rows={2}
                        className="flex-1 bg-background border border-surface-raised rounded-lg px-3 py-2 text-xs font-arya text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-solar-orange/50 transition-colors"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="px-3 py-2 rounded-lg bg-solar-orange hover:bg-solar-orange/80 disabled:opacity-40 transition-colors"
                    >
                        <FiSend className="text-white text-sm" />
                    </button>
                </div>
                <p className="text-xs text-text-muted mt-1 font-arya">Enter to send · Shift+Enter for newline</p>
            </div>
        </div>
    );
}