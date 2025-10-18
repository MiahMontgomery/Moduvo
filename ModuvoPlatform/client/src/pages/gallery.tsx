import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

// Import gallery images
import grayBuiltInOffice from "@assets/gallery/gray-built-in-office.jpg";
import blueWhiteMediaCenter from "@assets/gallery/blue-white-media-center.jpg";
import whiteBedroomStorage from "@assets/gallery/white-bedroom-storage.jpg";
import grayDeskStorageCombo from "@assets/gallery/gray-desk-storage-combo.jpg";
import whiteEntertainmentCenter from "@assets/gallery/white-entertainment-center.jpg";
import modernGrayKitchen from "@assets/gallery/modern-gray-kitchen.jpg";

const galleryImages = [
  {
    id: 1,
    title: "Executive Office Built-ins",
    description: "Sophisticated gray modular office system with glass-front cabinets and integrated desk space, perfect for professional environments",
    imageUrl: grayBuiltInOffice,
    tags: ["Office", "Gray", "Glass Doors", "Built-in", "Professional"]
  },
  {
    id: 2,
    title: "Living Room Media Center",
    description: "Elegant blue and white entertainment center with built-in seating and open shelving for modern living spaces",
    imageUrl: blueWhiteMediaCenter,
    tags: ["Living Room", "Blue", "Media", "Seating", "Entertainment"]
  },
  {
    id: 3,
    title: "Minimalist Bedroom Storage",
    description: "Clean white modular bedroom storage with seamless integration and ample wardrobe space for contemporary homes",
    imageUrl: whiteBedroomStorage,
    tags: ["Bedroom", "White", "Minimalist", "Contemporary", "Wardrobe"]
  },
  {
    id: 4,
    title: "Home Office Workspace",
    description: "Dual-desk gray modular system with integrated storage towers, creating an efficient and organized workspace",
    imageUrl: grayDeskStorageCombo,
    tags: ["Home Office", "Gray", "Desk", "Workspace", "Organization"]
  },
  {
    id: 5,
    title: "Classic Entertainment Wall",
    description: "Traditional white entertainment center with crown molding and balanced open and closed storage solutions",
    imageUrl: whiteEntertainmentCenter,
    tags: ["Entertainment", "White", "Traditional", "Crown Molding", "Classic"]
  },
  {
    id: 6,
    title: "Modern Kitchen Pantry",
    description: "Sleek gray kitchen storage system with clean lines and contemporary hardware for organized culinary spaces",
    imageUrl: modernGrayKitchen,
    tags: ["Kitchen", "Gray", "Pantry", "Modern", "Contemporary"]
  },
  {
    id: 7,
    title: "Small Space Solution",
    description: "Single modular unit with premium doors in white, perfect storage solution for studio or small bedroom",
    imageUrl: "/public-objects/gallery-placeholder-7.jpg",
    tags: ["Small Space", "Studio", "Efficient", "Single Unit"]
  },
  {
    id: 8,
    title: "Premium Interior Lighting",
    description: "Modular wardrobe system with integrated LED strip lighting and glass shelves for luxury feel",
    imageUrl: "/public-objects/gallery-placeholder-8.jpg",
    tags: ["LED Lighting", "Glass", "Premium", "Interior Design"]
  }
];

export default function Gallery() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-moduvo-ivory">
      <Navigation />
      
      <section className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
              className="mr-4 text-moduvo-charcoal hover:text-moduvo-gold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-light mb-6 text-moduvo-charcoal">
              Real Storage Transformations
            </h1>
            <p className="text-xl text-moduvo-gray max-w-3xl mx-auto">
              See how we transform bedrooms with custom modular storage installations. 
              Every project shows authentic before-and-after results from real customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {galleryImages.map((image) => (
              <div key={image.id} className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="aspect-w-4 aspect-h-3 overflow-hidden">
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-moduvo-charcoal group-hover:text-moduvo-gold transition-colors">
                    {image.title}
                  </h3>
                  <p className="text-moduvo-gray mb-4 text-sm leading-relaxed">
                    {image.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {image.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-moduvo-sage/20 text-moduvo-charcoal text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center bg-moduvo-cream rounded-2xl p-12 shadow-lg">
            <h2 className="text-3xl font-light mb-6 text-moduvo-charcoal">
              Get Your Custom Storage Quote
            </h2>
            <p className="text-moduvo-gray mb-8 text-lg max-w-2xl mx-auto">
              Design your perfect wardrobe, see it in AR, and receive a detailed quote within 5 minutes. 
              Professional installation included.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setLocation('/customize')}
                className="bg-moduvo-sage hover:bg-moduvo-sage/90 text-white px-8 py-4 text-lg font-semibold"
              >
                Start Free Quote
              </Button>
              <Button
                onClick={() => setLocation('/visualize')}
                variant="outline"
                className="border-2 border-moduvo-gold text-moduvo-gold hover:bg-moduvo-gold hover:text-white px-8 py-4 text-lg"
              >
                Try AR First
              </Button>
            </div>
          </div>

          {/* Source Attribution */}
          <div className="mt-16 text-center">
            <p className="text-sm text-moduvo-gray">
              Installations featured include authentic Moduvo modular configurations from customer homes and design blogs.{" "}
              <a 
                href="/customize" 
                className="text-moduvo-gold hover:underline inline-flex items-center"
              >
                Explore Moduvo Systems
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}