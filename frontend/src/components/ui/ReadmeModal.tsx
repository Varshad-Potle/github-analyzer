import { FiX, FiCopy, FiCheck } from 'react-icons/fi';
import { useState } from 'react';

interface ReadmeModalProps {
    readme: string;
    onClose: () => void;
}

export default function ReadmeModal({ readme, onClose }: ReadmeModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(readme);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-surface border border-surface-raised rounded-xl w-[700px] max-h-[80vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-surface-raised shrink-0">
                    <span className="font-exo text-sm text-solar-gold font-semibold">Generated README.md</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 text-xs font-exo px-3 py-1.5 rounded border border-surface-raised text-text-secondary hover:text-text-primary transition-colors"
                        >
                            {copied
                                ? <><FiCheck className="text-green-400" /> Copied</>
                                : <><FiCopy /> Copy</>
                            }
                        </button>
                        <button
                            onClick={onClose}
                            className="text-text-muted hover:text-text-primary transition-colors"
                        >
                            <FiX />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    <pre className="font-mono text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">
                        {readme}
                    </pre>
                </div>
            </div>
        </div>
    );
}