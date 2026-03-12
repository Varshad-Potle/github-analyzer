import { useEffect, useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import ts from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash';
import { FiCopy, FiCheck, FiLoader, FiMessageSquare } from 'react-icons/fi';
import api from '../../lib/api';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('html', xml);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('bash', bash);

interface CodeViewerProps {
    repoUrl: string;
    filePath: string | null;
    onExplain: (explanation: string) => void;
}

export default function CodeViewer({ repoUrl, filePath, onExplain }: CodeViewerProps) {
    const [content, setContent] = useState('');
    const [language, setLanguage] = useState('plaintext');
    const [loading, setLoading] = useState(false);
    const [explaining, setExplaining] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!filePath || !repoUrl) return;
        setLoading(true);
        setError('');
        api.get('/api/files/content', { params: { repoUrl, filePath } })
            .then(res => {
                setContent(res.data.content);
                setLanguage(res.data.language || 'plaintext');
                setLoading(false);
            })
            .catch(() => {
                setError('Could not load file content.');
                setLoading(false);
            });
    }, [filePath, repoUrl]);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExplain = async () => {
        if (!filePath) return;
        setExplaining(true);
        try {
            const res = await api.post('/api/chat/explain', { repoUrl, filePath });
            onExplain(res.data.explanation);
        } catch {
            onExplain('Could not explain this file. Please try again.');
        } finally {
            setExplaining(false);
        }
    };

    // ─── Empty state ─────────────────────────────────────────────────────────
    if (!filePath) {
        return (
            <div className="flex-1 bg-background flex flex-col items-center justify-center text-text-muted gap-3">
                <FiMessageSquare className="text-4xl text-surface-raised" />
                <p className="font-arya text-sm">Select a file from the tree to view its code</p>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-background flex flex-col overflow-hidden">
            {/* Tab bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-surface-raised shrink-0">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-text-primary">{filePath}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-surface-raised text-solar-gold font-exo uppercase tracking-wide">
                        {language}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExplain}
                        disabled={explaining}
                        className="flex items-center gap-1.5 text-xs font-exo px-3 py-1.5 rounded border border-solar-orange/40 text-solar-orange hover:bg-solar-orange/10 transition-colors disabled:opacity-50"
                    >
                        {explaining
                            ? <><FiLoader className="animate-spin" /> Explaining...</>
                            : 'Explain this file'
                        }
                    </button>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 text-xs font-exo px-3 py-1.5 rounded border border-surface-raised text-text-secondary hover:text-text-primary hover:border-text-muted transition-colors"
                    >
                        {copied ? <><FiCheck className="text-green-400" /> Copied</> : <><FiCopy /> Copy</>}
                    </button>
                </div>
            </div>

            {/* Code */}
            <div className="flex-1 overflow-auto">
                {loading && (
                    <div className="flex items-center gap-2 p-6 text-text-muted text-sm">
                        <FiLoader className="animate-spin" /> Loading...
                    </div>
                )}
                {error && <p className="p-6 text-red-400 text-sm">{error}</p>}
                {!loading && !error && (
                    <SyntaxHighlighter
                        language={language}
                        style={atomOneDark}
                        showLineNumbers
                        customStyle={{
                            margin: 0,
                            padding: '1rem',
                            background: 'transparent',
                            fontSize: '0.8rem',
                            height: '100%',
                        }}
                        lineNumberStyle={{ color: '#475569', minWidth: '2.5rem' }}
                    >
                        {content}
                    </SyntaxHighlighter>
                )}
            </div>
        </div>
    );
}