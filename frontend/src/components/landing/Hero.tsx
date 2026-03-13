import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import PrevRepos from './PrevRepos';

export default function Hero() {
    const [repoUrl, setRepoUrl] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const isValidGithubUrl = (url: string) =>
        /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(\/)?$/.test(url.trim());

    const handleSubmit = () => {
        const url = repoUrl.trim();
        if (!url) { setError('Please enter a GitHub repository URL.'); return; }
        if (!isValidGithubUrl(url)) { setError('Must be a valid public GitHub URL — e.g. https://github.com/user/repo'); return; }
        setError('');
        navigate('/loading', { state: { repoUrl: url.replace(/\/$/, '') } });
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit();
    };

    return (
        <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">

            {/* Badge */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6 px-4 py-1.5 rounded-full border border-solar-orange/30 bg-solar-orange/5 text-solar-gold font-exo text-xs uppercase tracking-widest"
            >
                AI-Powered Code Intelligence
            </motion.div>

            {/* Headline */}
            <motion.h1
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="font-exo font-extrabold text-5xl md:text-7xl text-white leading-tight mb-4"
                style={{ textShadow: '0 0 40px rgba(249,115,22,0.4), 0 0 80px rgba(249,115,22,0.15)' }}
            >
                Understand Any
                <br />
                <span style={{ color: '#F97316', textShadow: '0 0 40px rgba(249,115,22,0.8)' }}>
                    Codebase.
                </span>{' '}
                <span className="text-white">Instantly.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="font-arya text-lg md:text-xl text-text-secondary max-w-xl mb-10"
            >
                Paste a GitHub URL. Ask anything about the code.
            </motion.p>

            {/* Input + Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="w-full max-w-2xl flex flex-col gap-3"
            >
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={repoUrl}
                        onChange={e => { setRepoUrl(e.target.value); setError(''); }}
                        onKeyDown={handleKey}
                        placeholder="https://github.com/user/repo"
                        className="flex-1 bg-surface border border-surface-raised rounded-xl px-5 py-3.5 font-mono text-sm text-text-primary placeholder-text-muted focus:outline-none transition-all"
                        style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)' }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(249,115,22,0.6)';
                            (e.currentTarget as HTMLInputElement).style.boxShadow = 'inset 0 0 20px rgba(0,0,0,0.3), 0 0 20px rgba(249,115,22,0.3)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLInputElement).style.borderColor = '';
                            (e.currentTarget as HTMLInputElement).style.boxShadow = 'inset 0 0 20px rgba(0,0,0,0.3)';
                        }}
                        onFocus={e => {
                            (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(249,115,22,0.8)';
                            (e.currentTarget as HTMLInputElement).style.boxShadow = 'inset 0 0 20px rgba(0,0,0,0.3), 0 0 30px rgba(249,115,22,0.5)';
                        }}
                        onBlur={e => {
                            (e.currentTarget as HTMLInputElement).style.borderColor = '';
                            (e.currentTarget as HTMLInputElement).style.boxShadow = 'inset 0 0 20px rgba(0,0,0,0.3)';
                        }}
                    />
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-exo font-semibold text-sm text-white transition-all"
                        style={{
                            background: 'linear-gradient(135deg, #F97316, #EA580C)',
                            boxShadow: '0 0 20px rgba(249,115,22,0.4)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 35px rgba(249,115,22,0.7)')}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 20px rgba(249,115,22,0.4)')}
                    >
                        Analyze <FiArrowRight />
                    </button>
                </div>

                {error && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-arya text-xs text-red-400 text-left px-1"
                    >
                        {error}
                    </motion.p>
                )}
            </motion.div>

            {/* Previously indexed repos */}
            <PrevRepos />
            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-5 h-8 rounded-full border border-text-muted/30 flex items-start justify-center pt-1.5"
                >
                    <div className="w-1 h-1.5 rounded-full bg-solar-orange" style={{ boxShadow: '0 0 6px #F97316' }} />
                </motion.div>
            </motion.div>
        </section>
    );
}