import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-moduvo-ivory">
      <Navigation />
      <HeroSection isAuthenticated={true} user={user} />
      <Footer />
    </div>
  );
}
