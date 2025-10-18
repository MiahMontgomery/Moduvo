import { useState } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { GalleryManager } from "@/components/GalleryManager";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

// Default gallery images for initial state
const defaultGalleryImages = [
  {
    id: 1,
    title: "Modern Bedroom Wardrobe",
    description: "Floor-to-ceiling modular wardrobes with sliding doors in pure white, featuring custom built-in styling with crown molding",
    imageUrl: "/public-objects/gallery-placeholder-1.jpg",
    tags: ["Bedroom", "White", "Sliding Doors", "Built-in"]
  },
  {
    id: 2,
    title: "Walk-in Closet Solution",
    description: "Open modular wardrobe system with premium interior organizers and integrated LED lighting strips",
    imageUrl: "/public-objects/gallery-placeholder-2.jpg",
    tags: ["Walk-in", "Open Storage", "Lighting", "Organization"]
  },
  {
    id: 3,
    title: "Corner Installation",
    description: "Smart corner placement with high-gloss doors in charcoal, maximizing storage in compact bedroom spaces",
    imageUrl: "/public-objects/gallery-placeholder-3.jpg",
    tags: ["Corner", "High-gloss", "Space-saving", "Modern"]
  },
  {
    id: 4,
    title: "Custom Built-in Look",
    description: "Modular wardrobes enhanced with custom crown molding and baseboards for seamless built-in appearance",
    imageUrl: "/public-objects/gallery-placeholder-4.jpg",
    tags: ["Custom", "Built-in", "Traditional", "Trim Work"]
  }
];

export default function GalleryAdmin() {
  const [, setLocation] = useLocation();
  const [galleryImages, setGalleryImages] = useState(defaultGalleryImages);

  const handleImagesUpdate = (images: typeof defaultGalleryImages) => {
    setGalleryImages(images);
    
    // In a real app, you would save this to the database
    // For now, we'll store it in localStorage for persistence
    localStorage.setItem('moduvo-gallery-images', JSON.stringify(images));
  };

  return (
    <div className="min-h-screen bg-moduvo-ivory">
      <Navigation />
      
      <section className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
              className="text-moduvo-charcoal hover:text-moduvo-gold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            <Button
              onClick={() => setLocation('/gallery')}
              className="bg-moduvo-sage hover:bg-moduvo-sage/80 text-white"
            >
              View Gallery
            </Button>
          </div>

          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-light mb-6 text-moduvo-charcoal">
              Gallery Management
            </h1>
            <p className="text-xl text-moduvo-gray max-w-3xl mx-auto">
              Upload and manage your project photos. Add new images to showcase your modular storage installations.
            </p>
          </div>

          <GalleryManager 
            images={galleryImages}
            onImagesUpdate={handleImagesUpdate}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}