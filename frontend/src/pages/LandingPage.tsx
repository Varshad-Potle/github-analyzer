import ParticlesBg from '../components/landing/ParticlesBg';
import Hero from '../components/landing/Hero';

export default function LandingPage() {
    return (
        <div className="relative min-h-screen bg-background overflow-x-hidden">
            <ParticlesBg />
            <Hero />
        </div>
    );
}