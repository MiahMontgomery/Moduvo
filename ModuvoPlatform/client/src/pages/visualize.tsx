import { useState, useEffect } from "react";
import Navigation from "@/components/navigation";
import ARViewer from "@/components/ar-viewer";
import ARFallback from "@/components/ar-fallback";
import EmailCaptureModal from "@/components/email-capture-modal";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, RotateCcw, Eye, Mail } from "lucide-react";
import { useLocation } from "wouter";

export default function Visualize() {
  const [, setLocation] = useLocation();
  const [configuration, setConfiguration] = useState<any>(null);
  const [isARSupported, setIsARSupported] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [arSessionData, setArSessionData] = useState<{
    placementCompleted: boolean;
    placementTimestamp?: Date;
    modelType: string;
  } | null>(null);

  useEffect(() => {
    // Load configuration from localStorage
    const storedConfig = localStorage.getItem('moduvo-config');
    if (storedConfig) {
      setConfiguration(JSON.parse(storedConfig));
    }

    // Check AR support
    const checkARSupport = async () => {
      if ('xr' in navigator) {
        try {
          // @ts-ignore
          const supported = await navigator.xr.isSessionSupported('immersive-ar');
          setIsARSupported(supported);
        } catch (error) {
          setIsARSupported(false);
        }
      } else {
        setIsARSupported(false);
      }
    };

    checkARSupport();
  }, []);

  if (!configuration) {
    return (
      <div className="min-h-screen bg-moduvo-ivory flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">No Configuration Found</h2>
          <p className="text-moduvo-gray mb-6">Please configure a product first</p>
          <Button onClick={() => setLocation('/customize')}>
            Go to Customize
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-moduvo-ivory">
      <Navigation />
      
      <section className="pt-16 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-light mb-4">Visualize Your Space</h1>
            <p className="text-xl text-moduvo-gray max-w-2xl mx-auto">
              See your customized storage solution in your actual room using augmented reality technology.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* AR Instructions */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h3 className="text-2xl font-semibold mb-6">AR Experience</h3>
                
                {/* AR Status */}
                <div className={`flex items-center space-x-3 mb-6 p-4 rounded-lg border ${
                  isARSupported 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    isARSupported ? 'bg-green-500 animate-pulse' : 'bg-amber-500'
                  }`}></div>
                  <span className={`font-medium ${
                    isARSupported ? 'text-green-700' : 'text-amber-700'
                  }`}>
                    {isARSupported ? 'AR Ready' : 'AR Not Supported'}
                  </span>
                  <span className={`text-sm ${
                    isARSupported ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {isARSupported 
                      ? 'WebXR supported on this device' 
                      : 'Use a compatible mobile device'
                    }
                  </span>
                </div>

                {/* Instructions */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-moduvo-sage/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-semibold text-moduvo-sage">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Position Your Device</h4>
                      <p className="text-sm text-moduvo-gray">
                        Point your camera at the floor or wall where you want to place the furniture
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-moduvo-sage/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-semibold text-moduvo-sage">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Tap to Place</h4>
                      <p className="text-sm text-moduvo-gray">
                        Tap on the detected surface to place your customized storage unit
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-moduvo-sage/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-semibold text-moduvo-sage">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Adjust & Explore</h4>
                      <p className="text-sm text-moduvo-gray">
                        Move around to see your furniture from different angles
                      </p>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="space-y-4">
                  <ARViewer 
                    configuration={configuration} 
                    onARComplete={(data) => {
                      setArSessionData(data);
                      setShowEmailCapture(true);
                    }}
                  />
                  
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 border-moduvo-sage text-moduvo-sage hover:bg-moduvo-gold hover:text-white hover:border-moduvo-gold transition-colors duration-200"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 border-moduvo-sage text-moduvo-sage hover:bg-moduvo-gold hover:text-white hover:border-moduvo-gold transition-colors duration-200"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Capture
                    </Button>
                  </div>
                  
                  {/* Manual Quote Request */}
                  <Button 
                    onClick={() => setShowEmailCapture(true)}
                    className="w-full bg-moduvo-sage hover:bg-moduvo-gold text-white transition-colors duration-200"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Request Quote Without AR
                  </Button>
                </div>
                
                {/* 3D Fallback Preview */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-moduvo-sage" />
                    3D Preview
                  </h4>
                  <ARFallback 
                    configuration={configuration} 
                    className="w-full h-80"
                  />
                </div>
              </div>

              <Button 
                onClick={() => setLocation('/customize')}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Customize
              </Button>
            </div>

            {/* AR Demo and Info */}
            <div className="space-y-6">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                  alt="Smartphone showing AR furniture placement in room" 
                  className="rounded-2xl shadow-2xl w-full h-auto" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="text-sm opacity-90 mb-1">Real AR Experience</div>
                  <div className="text-lg font-semibold">WebXR-Powered Visualization</div>
                </div>
              </div>

              {/* AR Technology Info */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold mb-4">AR Technology Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-moduvo-sage rounded-full"></div>
                    <span className="text-sm">Real-time surface detection using WebXR hit-testing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-moduvo-sage rounded-full"></div>
                    <span className="text-sm">True-to-scale 3D model placement</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-moduvo-sage rounded-full"></div>
                    <span className="text-sm">Real-time lighting and shadow rendering</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-moduvo-sage rounded-full"></div>
                    <span className="text-sm">Cross-platform mobile AR support</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> AR requires a compatible mobile device with Chrome browser and WebXR support. 
                    On desktop, you'll see a fallback 3D viewer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EmailCaptureModal
        isOpen={showEmailCapture}
        onClose={() => setShowEmailCapture(false)}
        configuration={configuration}
        arSessionData={arSessionData || undefined}
      />

      <Footer />
    </div>
  );
}
