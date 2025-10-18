import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import heroImage from "@assets/hero-modern-office.jpg";

interface HeroSectionProps {
  isAuthenticated?: boolean;
  user?: any;
}

export default function HeroSection({ isAuthenticated, user }: HeroSectionProps) {
  const [, setLocation] = useLocation();

  return (
    <section className="pt-16 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {isAuthenticated && user && (
              <div className="text-moduvo-gold font-medium">
                Welcome back, {user.firstName || user.email}
              </div>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight">
              Premium Modular Wardrobes,
              <span className="font-semibold text-moduvo-gold"> Professionally Installed</span>
            </h1>
            <p className="text-xl text-moduvo-gray leading-relaxed">
              Transform your bedroom with perfectly fitted modular storage systems. 
              Design in 3D, visualize with AR, and get a personalized quote in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => setLocation('/customize')}
                className="bg-moduvo-sage text-white px-8 py-4 text-lg hover:bg-moduvo-sage/90 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                Get Free Quote
              </Button>
              <Button 
                onClick={() => setLocation('/gallery')}
                variant="outline"
                className="border-2 border-moduvo-gold text-moduvo-gold px-8 py-4 text-lg hover:bg-moduvo-gold hover:text-white transition-all duration-300 font-semibold"
              >
                See Real Installations
              </Button>
            </div>
          </div>
          <div className="relative">
            <img 
              src={heroImage} 
              alt="Premium modular office storage with integrated desk and floating shelves" 
              className="rounded-2xl shadow-2xl w-full h-auto" 
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl border border-gray-100">
              <div className="text-sm text-moduvo-gray mb-1">Get your</div>
              <div className="text-2xl font-bold text-moduvo-charcoal">Free Estimate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
