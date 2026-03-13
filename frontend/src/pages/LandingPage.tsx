import ParticlesBg from '../components/landing/ParticlesBg';
import Hero from '../components/landing/Hero';
import StepsSection from '../components/landing/StepsSection';
import TeamSection from '../components/landing/TeamSection';

export default function LandingPage() {
    return (
        <div className="relative min-h-screen bg-background overflow-x-hidden">
            <ParticlesBg />
            <Hero />
            <StepsSection />
            <TeamSection />
        </div>
    );
}