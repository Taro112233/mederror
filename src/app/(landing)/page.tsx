import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import StatsSection from '@/components/sections/StatsSection';
import AboutSection from '@/components/sections/AboutSection';
import SafetySection from '@/components/sections/SafetySection';
import FAQSection from '@/components/sections/FAQSection';
import ContactSection from '@/components/sections/ContactSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <div className="w-full max-w-3xl flex flex-col flex-1 justify-center items-center px-4">
        <main className="flex-1 w-full flex flex-col gap-1 items-center justify-center py-4">
          <HeroSection />
          <FeaturesSection />
          <StatsSection />
          <AboutSection />
          <SafetySection />
          <FAQSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </div>
  );
} 