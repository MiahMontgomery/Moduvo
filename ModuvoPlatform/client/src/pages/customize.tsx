import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import ProductConfigurator from "@/components/product-configurator";
import ThreeViewer from "@/components/three-viewer";
import QuoteForm from "@/components/quote-form";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useLocation } from "wouter";

export default function Customize() {
  const [, setLocation] = useLocation();
  const [currentConfiguration, setCurrentConfiguration] = useState<any>(null);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: components = [], isLoading: componentsLoading } = useQuery({
    queryKey: ["/api/components"],
  });

  const { data: finishes = [], isLoading: finishesLoading } = useQuery({
    queryKey: ["/api/finishes"],
  });

  useEffect(() => {
    // Initialize configuration with first product if available, or create default config
    if (!currentConfiguration && !productsLoading) {
      const firstProduct = Array.isArray(products) && products.length > 0 ? products[0] : {
        id: "modular-wardrobe-200",
        name: "Premium wardrobe with sliding doors 200x66x236 cm",
        category: "Bedroom",
        price: 1299,
        description: "Premium modular wardrobe system with sliding doors. 15-year limited warranty included.",
        dimensions: { width: 200, height: 236, depth: 66 },
        basePrice: 1299
      };
      
      const firstFinish = Array.isArray(finishes) && finishes.length > 0 ? finishes[0] : {
        id: "white",
        name: "White",
        price: 0,
        description: "Classic white finish"
      };

      setCurrentConfiguration({
        product: firstProduct,
        finish: firstFinish,
        dimensions: firstProduct.dimensions || { width: 200, height: 236, depth: 66 },
        selectedComponents: [],
        // Add 3D model data for AR visualization
        assetUrls: {
          glb: "/public-objects/furniture/modular_wardrobe_white_236cm.glb"
        },
        series: "Premier",
        articleNumber: "MW-200-236",
        thumbImages: ["/public-objects/gallery-placeholder-1.jpg"]
      });
    }
  }, [products, finishes, currentConfiguration, productsLoading]);

  const handleVisualize = () => {
    if (currentConfiguration) {
      // Store configuration in localStorage for visualize page
      localStorage.setItem('moduvo-config', JSON.stringify(currentConfiguration));
      setLocation('/visualize');
    }
  };

  const handleQuoteRequest = () => {
    setShowQuoteForm(true);
  };

  return (
    <div className="min-h-screen bg-moduvo-ivory">
      <Navigation />
      
      <section className="pt-16 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-light mb-4">Configure Your Perfect Storage</h1>
            <p className="text-xl text-moduvo-gray max-w-2xl mx-auto">
              Choose from our premium collection and customize every detail to match your vision.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-1">
              <ProductConfigurator
                products={Array.isArray(products) ? products : []}
                components={Array.isArray(components) ? components : []}
                finishes={Array.isArray(finishes) ? finishes : []}
                configuration={currentConfiguration}
                onConfigurationChange={setCurrentConfiguration}
                onVisualize={handleVisualize}
                onQuoteRequest={handleQuoteRequest}
              />
            </div>

            {/* 3D Viewer */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden h-96 lg:h-full min-h-[500px]">
                <ThreeViewer 
                  configuration={currentConfiguration}
                  className="w-full h-full"
                />
                <div className="absolute bottom-4 right-4 z-10">
                  <Button 
                    onClick={handleVisualize}
                    className="bg-moduvo-gold hover:bg-moduvo-gold-light text-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualize Your Space
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showQuoteForm && (
        <section className="py-20 bg-gray-50">
          <QuoteForm 
            configuration={currentConfiguration}
            onSubmit={() => setShowQuoteForm(false)}
          />
        </section>
      )}

      <Footer />
    </div>
  );
}
