import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-background flex items-center justify-center gap-4">
            <button
                onClick={() => navigate('/loading', {
                    state: { repoUrl: 'https://github.com/Varshad-Potle/Random-Password-Generator' }
                })}
                className="font-exo text-solar-orange border border-solar-orange px-4 py-2 rounded hover:bg-solar-orange/10"
            >
                Test Loading Page
            </button>
        </div>
    );
}