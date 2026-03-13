import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGithub, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../../lib/api';

interface RepoRecord {
    repoUrl: string;
    namespace: string;
    filesCount: number;
    chunksCount: number;
    indexedAt: string;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${mins}m ago`;
}

export default function PrevRepos() {
    const [repos, setRepos] = useState<RepoRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/api/repos')
            .then(res => {
                setRepos(res.data.repos || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading || repos.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="w-full max-w-2xl mx-auto mt-8"
        >
            <p className="text-center font-exo text-xs text-text-muted uppercase tracking-widest mb-4">
                Previously Indexed
            </p>

            <div className="flex gap-3 overflow-x-auto pb-2 justify-center flex-wrap">
                {repos.map((repo, i) => {
                    const name = repo.repoUrl.replace('https://github.com/', '');
                    return (
                        <motion.button
                            key={repo.namespace}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.9 + i * 0.08 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => navigate(`/dashboard?repo=${encodeURIComponent(repo.repoUrl)}`)}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-solar-orange/20 bg-surface/60 hover:border-solar-orange/50 hover:bg-surface transition-all backdrop-blur-sm min-w-[120px]"
                            style={{ boxShadow: '0 0 12px rgba(249,115,22,0.08)' }}
                        >
                            {/* Circle avatar */}
                            <div
                                className="w-10 h-10 rounded-full border border-solar-orange/40 flex items-center justify-center"
                                style={{ boxShadow: '0 0 10px rgba(249,115,22,0.2)' }}
                            >
                                <FiGithub className="text-solar-orange text-sm" />
                            </div>

                            <span className="font-mono text-xs text-text-primary text-center leading-tight max-w-[100px] truncate">
                                {name.split('/')[1] || name}
                            </span>

                            <div className="flex items-center gap-1 text-text-muted">
                                <FiClock className="text-xs" />
                                <span className="font-arya text-xs">{timeAgo(repo.indexedAt)}</span>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
}