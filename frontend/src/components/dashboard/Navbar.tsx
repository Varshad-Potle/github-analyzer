import { FiArrowLeft, FiGithub, FiExternalLink } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
    repoUrl: string;
}

export default function Navbar({ repoUrl }: NavbarProps) {
    const navigate = useNavigate();

    const repoName = repoUrl
        .replace('https://github.com/', '')
        .replace(/\/$/, '');

    return (
        <div className="h-12 w-full bg-surface border-b border-solar-orange/30 flex items-center justify-between px-4 shrink-0">
            {/* Left — repo info */}
            <div className="flex items-center gap-3">
                <FiGithub className="text-solar-orange text-lg" />
                <span className="font-exo text-sm text-text-primary font-semibold">
                    {repoName}
                </span>
                <a
                    href={repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-muted hover:text-solar-orange transition-colors"
                >
                    <FiExternalLink className="text-sm" />
                </a>
            </div>

            {/* Right — back button */}
            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-text-secondary hover:text-solar-orange transition-colors text-sm font-arya"
            >
                <FiArrowLeft />
                Back to Home
            </button>
        </div>
    );
}