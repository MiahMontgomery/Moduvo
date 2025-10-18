import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { CheckCircle, Users, Clock, Star } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-moduvo-ivory">
      <Navigation />
      <HeroSection />
      
      {/* Process Section */}
      <section className="py-20 bg-moduvo-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light mb-6 text-moduvo-charcoal">
              The White-Glove Modular Experience
            </h2>
            <p className="text-xl text-moduvo-gray max-w-3xl mx-auto">
              From design consultation to professional installation, we handle everything
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-moduvo-sage rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-moduvo-charcoal">1. Design & Visualize</h3>
              <p className="text-moduvo-gray">
                Configure your perfect modular storage system online, see it in 3D, and experience it in your space with AR technology.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-moduvo-gold rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-moduvo-charcoal">2. Get Instant Quote</h3>
              <p className="text-moduvo-gray">
                Receive a detailed quote within 5 minutes, including all components, assembly, and professional installation.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-moduvo-sage rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-moduvo-charcoal">3. Professional Install</h3>
              <p className="text-moduvo-gray">
                Our certified installers handle everything from delivery to final setup, ensuring perfect fit and finish.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button
              onClick={() => setLocation('/customize')}
              className="bg-moduvo-sage hover:bg-moduvo-sage/90 text-white px-10 py-4 text-lg font-semibold"
            >
              Start Your Free Quote
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-8 text-moduvo-gray">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">500+ Installations</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-moduvo-sage" />
              <span className="font-semibold">Licensed & Insured</span>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
