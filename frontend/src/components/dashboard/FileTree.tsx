import { useEffect, useState } from 'react';
import {
    FiFolder, FiCode, FiLoader,
} from 'react-icons/fi';
import {
    SiTypescript, SiJavascript, SiPython, SiGo,
    SiRust, SiCplusplus, SiMarkdown,
} from 'react-icons/si';
import api from '../../lib/api';

interface FileItem {
    filePath: string;
    language: string;
}

interface TreeNode {
    name: string;
    path: string;
    type: 'file' | 'folder';
    language?: string;
    children?: TreeNode[];
}

interface FileTreeProps {
    repoUrl: string;
    activeFile: string | null;
    onFileSelect: (filePath: string) => void;
}

// ─── Language Icon ────────────────────────────────────────────────────────────
function LanguageIcon({ language }: { language: string }) {
    const cls = 'text-xs shrink-0';
    switch (language) {
        case 'typescript': return <SiTypescript className={`${cls} text-blue-400`} />;
        case 'javascript': return <SiJavascript className={`${cls} text-yellow-400`} />;
        case 'python': return <SiPython className={`${cls} text-blue-300`} />;
        case 'go': return <SiGo className={`${cls} text-cyan-400`} />;
        case 'rust': return <SiRust className={`${cls} text-orange-400`} />;
        case 'cpp': return <SiCplusplus className={`${cls} text-blue-500`} />;
        case 'css': return <FiCode className={`${cls} text-blue-400`} />;
        case 'markdown': return <SiMarkdown className={`${cls} text-text-muted`} />;
        default: return <FiCode className={`${cls} text-text-muted`} />;
    }
}

// ─── Build Tree from flat file list ──────────────────────────────────────────
function buildTree(files: FileItem[]): TreeNode[] {
    const root: TreeNode[] = [];

    for (const file of files) {
        const parts = file.filePath.split('/');
        let current = root;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isFile = i === parts.length - 1;
            const existing = current.find(n => n.name === part);

            if (existing) {
                current = existing.children!;
            } else {
                const node: TreeNode = {
                    name: part,
                    path: parts.slice(0, i + 1).join('/'),
                    type: isFile ? 'file' : 'folder',
                    language: isFile ? file.language : undefined,
                    children: isFile ? undefined : [],
                };
                current.push(node);
                if (!isFile) current = node.children!;
            }
        }
    }

    return root;
}

// ─── Tree Node ────────────────────────────────────────────────────────────────
function TreeNodeItem({
    node, depth, activeFile, onFileSelect,
}: {
    node: TreeNode;
    depth: number;
    activeFile: string | null;
    onFileSelect: (p: string) => void;
}) {
    const [open, setOpen] = useState(depth === 0);
    const isActive = node.path === activeFile;

    if (node.type === 'folder') {
        return (
            <div>
                <button
                    onClick={() => setOpen(o => !o)}
                    className="w-full flex items-center gap-2 px-2 py-1 hover:bg-surface-raised text-text-secondary hover:text-text-primary transition-colors text-xs"
                    style={{ paddingLeft: `${8 + depth * 12}px` }}
                >
                    <FiFolder className="text-solar-gold shrink-0 text-xs" />
                    <span className="font-arya truncate">{node.name}</span>
                </button>
                {open && node.children?.map(child => (
                    <TreeNodeItem
                        key={child.path}
                        node={child}
                        depth={depth + 1}
                        activeFile={activeFile}
                        onFileSelect={onFileSelect}
                    />
                ))}
            </div>
        );
    }

    return (
        <button
            onClick={() => onFileSelect(node.path)}
            className={`w-full flex items-center gap-2 px-2 py-1 transition-colors text-xs
        ${isActive
                    ? 'bg-solar-orange/10 border-l-2 border-solar-orange text-solar-orange'
                    : 'hover:bg-surface-raised text-text-secondary hover:text-text-primary border-l-2 border-transparent'
                }`}
            style={{ paddingLeft: `${8 + depth * 12}px` }}
        >
            <LanguageIcon language={node.language || ''} />
            <span className="font-mono truncate">{node.name}</span>
        </button>
    );
}

// ─── Main FileTree ────────────────────────────────────────────────────────────
export default function FileTree({ repoUrl, activeFile, onFileSelect }: FileTreeProps) {
    const [tree, setTree] = useState<TreeNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!repoUrl) return;
        setLoading(true);
        api.get('/api/files', { params: { repoUrl } })
            .then(res => {
                setTree(buildTree(res.data.files));
                setLoading(false);
            })
            .catch(() => {
                setError('Could not load file tree.');
                setLoading(false);
            });
    }, [repoUrl]);

    return (
        <div className="w-64 shrink-0 bg-surface border-r border-surface-raised flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2 border-b border-surface-raised">
                <span className="font-exo text-xs text-text-muted uppercase tracking-widest">
                    Files
                </span>
            </div>

            {/* Tree */}
            <div className="flex-1 overflow-y-auto py-1">
                {loading && (
                    <div className="flex items-center gap-2 px-3 py-4 text-text-muted text-xs">
                        <FiLoader className="animate-spin" /> Loading files...
                    </div>
                )}
                {error && (
                    <p className="px-3 py-4 text-red-400 text-xs">{error}</p>
                )}
                {!loading && !error && tree.map(node => (
                    <TreeNodeItem
                        key={node.path}
                        node={node}
                        depth={0}
                        activeFile={activeFile}
                        onFileSelect={onFileSelect}
                    />
                ))}
            </div>
        </div>
    );
}