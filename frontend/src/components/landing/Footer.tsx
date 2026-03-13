import { FiGithub, FiArrowUp, FiHeart } from 'react-icons/fi';

export default function Footer() {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <footer className="relative z-10 border-t border-surface-raised bg-surface/30 backdrop-blur-sm">
            <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">

                {/* Left — branding */}
                <div className="flex flex-col items-center md:items-start gap-1">
                    <span
                        className="font-exo font-bold text-lg text-text-primary"
                        style={{ textShadow: '0 0 15px rgba(249,115,22,0.4)' }}
                    >
                        GitHub Code Analyzer
                    </span>
                    <span className="font-arya text-xs text-text-muted">
                        Understand any codebase. Instantly.
                    </span>
                </div>

                {/* Center — guided by + links */}
                <div className="flex flex-col items-center gap-4">
                    {/* Professors */}
                    <div className="flex flex-col items-center gap-1">
                        <span className="font-exo text-xs text-solar-orange uppercase tracking-widest">
                            Guided By
                        </span>
                        <span className="font-arya text-sm text-text-primary">
                            Mr. Milind Waghmare
                        </span>
                        <span className="font-arya text-sm text-text-primary">
                            Mr. Ravi Mante
                        </span>
                        <span className="font-arya text-xs text-text-muted mt-1">
                            Dept. of Computer Science and Engineering
                        </span>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-6">
                        <a
                            href="https://github.com/Varshad-Potle/github-analyzer"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 font-exo text-xs text-text-muted hover:text-solar-orange transition-colors"
                        >
                            <FiGithub />
                            Source Code
                        </a>
                        <a
                            href="https://github-analyzer-f6do.onrender.com/health"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 font-exo text-xs text-text-muted hover:text-solar-orange transition-colors"
                        >
                            API Health
                        </a>
                    </div>
                </div>

                {/* Right — made with love + scroll to top */}
                <div className="flex items-center gap-4">
                    <span className="font-arya text-xs text-text-muted flex items-center gap-1">
                        Made with <FiHeart className="text-solar-orange text-xs" /> by the team
                    </span>

                    <button
                        onClick={scrollToTop}
                        className="w-9 h-9 rounded-full border border-solar-orange/30 flex items-center justify-center text-solar-orange hover:bg-solar-orange/10 transition-all"
                        style={{ boxShadow: '0 0 12px rgba(249,115,22,0.15)' }}
                        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 20px rgba(249,115,22,0.5)')}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 12px rgba(249,115,22,0.15)')}
                        title="Back to top"
                    >
                        <FiArrowUp className="text-sm" />
                    </button>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-surface-raised py-3 text-center">
                <span className="font-arya text-xs text-text-muted">
                    Semester 6 Minor Project · Computer Science and Engineering · 2026
                </span>
            </div>
        </footer>
    );
}