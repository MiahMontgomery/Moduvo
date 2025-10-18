import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, AlertTriangle, Crosshair } from "lucide-react";
import * as THREE from "three";
import { ModuvoThreeUtils } from "@/lib/three-utils";
import { modularStorageData, convertToModuvoConfig, type ModularStorageProduct } from "@/data/modular-storage";

// WebXR Polyfill for broader device support
let WebXRPolyfill: any = null;
if (typeof window !== 'undefined') {
  import('webxr-polyfill').then((module) => {
    WebXRPolyfill = module.default;
    if (!('xr' in navigator)) {
      console.log("Installing WebXR polyfill for device compatibility");
      new WebXRPolyfill();
    }
  }).catch(console.warn);
}

// AR Viewer with comprehensive WebXR testing and debugging
console.log("AR Viewer module loaded - preparing for WebXR functionality");



interface ARViewerProps {
  configuration: any;
  onARComplete?: (arSessionData: {
    placementCompleted: boolean;
    placementTimestamp?: Date;
    modelType: string;
  }) => void;
}

export default function ARViewer({ configuration, onARComplete }: ARViewerProps) {
  const [isARSupported, setIsARSupported] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [arStatusMessage, setArStatusMessage] = useState('');
  const [furniturePlaced, setFurniturePlaced] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sessionRef = useRef<any>(null);
  const hitTestSourceRef = useRef<any>(null);
  const placedObjectRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const checkARSupport = async () => {
      console.log("🔍 Testing AR capabilities with comprehensive device detection...");
      setIsChecking(true);
      
      try {
        // First check if we're on HTTPS (required for WebXR)
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
          console.warn("⚠️ HTTPS required for WebXR - current protocol:", location.protocol);
          setIsARSupported(false);
          setArStatusMessage('HTTPS connection required for AR functionality.');
          setIsChecking(false);
          return;
        }

        // Request camera permission with native browser notification
        console.log("📹 Requesting camera access via native permissions...");
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 }
          } 
        });
        console.log("✅ Camera permission granted - stream active");
        stream.getTracks().forEach(track => track.stop()); // Clean up immediately
        
        // Test WebXR availability after potential polyfill installation
        await new Promise(resolve => setTimeout(resolve, 100)); // Allow polyfill to load
        
        if ('xr' in navigator) {
          console.log("🚀 WebXR detected in navigator, testing AR session support...");
          // @ts-ignore - WebXR is experimental
          const supported = await navigator.xr.isSessionSupported('immersive-ar');
          console.log(`📱 WebXR immersive-ar support: ${supported ? 'CONFIRMED' : 'NOT SUPPORTED'}`);
          
          if (supported) {
            // Additional feature testing
            // @ts-ignore
            const hitTestSupported = await navigator.xr.isSessionSupported('immersive-ar', {
              requiredFeatures: ['hit-test']
            }).catch(() => false);
            console.log(`🎯 Hit-test feature support: ${hitTestSupported ? 'AVAILABLE' : 'LIMITED'}`);
          }
          
          setIsARSupported(supported);
          setArStatusMessage(supported 
            ? 'AR system ready! Camera access granted. Tap below to start AR visualization.' 
            : 'Device supports WebXR but not AR mode. Using 3D preview instead.'
          );
        } else {
          console.log("❌ WebXR not available in navigator (even after polyfill)");
          // Check if it's a mobile device - if so, enable camera-based AR
          const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          if (isMobile) {
            console.log("📱 Mobile device detected - enabling camera-based AR fallback");
            setIsARSupported(true);
            setArStatusMessage('Camera-based AR ready! Tap below to start AR visualization.');
          } else {
            setIsARSupported(false);
            setArStatusMessage('WebXR not supported on this device. 3D preview available instead.');
          }
        }
      } catch (error) {
        console.error('AR capability check failed:', error as Error);
        setIsARSupported(false);
        
        if ((error as Error).name === 'NotAllowedError') {
          setArStatusMessage('Camera access denied. Please allow camera permissions and refresh the page.');
        } else if ((error as Error).name === 'NotFoundError') {
          setArStatusMessage('No camera found on this device. AR requires a rear-facing camera.');
        } else {
          setArStatusMessage('AR not available on this device. Please try on a mobile device with Chrome browser.');
        }
      }
      
      setIsChecking(false);
    };

    // Delay slightly to allow polyfill to initialize
    const timer = setTimeout(checkARSupport, 150);
    return () => clearTimeout(timer);
  }, []);

  const initializeThreeJS = () => {
    if (!canvasRef.current) return null;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.xr.enabled = true;

    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );

    // Add lighting for AR
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;

    return { renderer, scene, camera };
  };

  const createFurnitureModel = async (): Promise<THREE.Group | null> => {
    if (!sceneRef.current) return null;

    const threeUtils = new ModuvoThreeUtils(sceneRef.current);
    
    // Try to load 3D model first if configuration includes asset URLs
    if (configuration.assetUrls?.glb) {
      try {
        console.log("Loading 3D model from:", configuration.assetUrls.glb);
        const model = await threeUtils.loadModel(configuration.assetUrls.glb, 0.01);
        console.log("3D model loaded successfully");
        return model;
      } catch (error) {
        console.warn("Failed to load 3D model, falling back to geometric:", error);
      }
    }
    
    // Fallback to geometric model
    console.log("📦 Creating geometric model as fallback");
    const model = threeUtils.createGeometricModel(configuration);
    
    // Scale for AR (convert cm to meters)
    model.scale.setScalar(0.01);
    
    return model;
  };

  const startARSession = async () => {
    if (!isARSupported) {
      console.warn("AR not supported, cannot start session");
      return;
    }

    try {
      console.log("🚀 Starting AR session with comprehensive setup...");
      setArStatusMessage('Initializing AR session...');
      
      // Try WebXR first if available
      if ('xr' in navigator) {
        try {
          // @ts-ignore - WebXR is experimental
          const session = await navigator.xr.requestSession('immersive-ar', {
            requiredFeatures: ['hit-test'],
            optionalFeatures: ['dom-overlay', 'light-estimation'],
          });

          console.log("✅ WebXR AR session created successfully");
          sessionRef.current = session;
          setIsARActive(true);
          setArStatusMessage('AR active! Point your camera at a flat surface and tap to place furniture.');

          const threeSetup = initializeThreeJS();
          if (!threeSetup) {
            throw new Error('Failed to initialize Three.js renderer');
          }

          const { renderer, scene, camera } = threeSetup;

          // Set up WebXR session with renderer
          await renderer.xr.setSession(session);
          console.log("🎨 Renderer configured for WebXR session");
          
          // Initialize hit testing for surface detection
          try {
            const referenceSpace = await session.requestReferenceSpace('viewer');
            // @ts-ignore
            hitTestSourceRef.current = await session.requestHitTestSource({ space: referenceSpace });
            console.log("🎯 Hit-test source initialized for surface detection");
          } catch (hitTestError) {
            console.warn("Hit-test initialization failed, AR will work without surface detection:", hitTestError);
          }

          // Handle session end cleanup
          session.addEventListener('end', () => {
            console.log("🛑 AR session ended - cleaning up");
            setIsARActive(false);
            setArStatusMessage('AR session ended.');
            sessionRef.current = null;
            hitTestSourceRef.current = null;
            placedObjectRef.current = null;
            renderer.setAnimationLoop(null);
          });

          // Handle input events (tap/touch to place furniture)
          session.addEventListener('select', (event) => {
            console.log("👆 AR select event triggered - attempting furniture placement");
            onSelect(event);
          });

          // Start the WebXR render loop
          renderer.setAnimationLoop(render);
          console.log("🔄 AR render loop started");
          return;
        } catch (webxrError) {
          console.warn("WebXR AR failed, falling back to camera AR:", webxrError);
        }
      }

      // Fallback: Camera-based AR
      console.log("📱 Starting camera-based AR fallback...");
      await startCameraAR();
      
    } catch (error) {
      console.error('AR session initialization failed:', error as Error);
      let errorMessage = 'Failed to start AR session. ';
      
      if ((error as Error).name === 'NotSupportedError') {
        errorMessage += 'AR not supported on this device.';
      } else if ((error as Error).name === 'SecurityError') {
        errorMessage += 'Security error - please ensure you are on HTTPS.';
      } else {
        errorMessage += 'Please try a compatible mobile device with Chrome browser.';
      }
      
      setArStatusMessage(errorMessage);
      setIsARActive(false);
    }
  };

  const startCameraAR = async () => {
    try {
      console.log("📱 Starting camera-based AR...");
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      console.log("✅ Camera access granted for AR");
      
      // Create video element
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      video.style.position = 'fixed';
      video.style.top = '0';
      video.style.left = '0';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      video.style.zIndex = '998';
      document.body.appendChild(video);
      
      // Create canvas for AR overlay
      const canvas = document.createElement('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.zIndex = '999';
      canvas.style.pointerEvents = 'auto';
      document.body.appendChild(canvas);
      
      // Initialize Three.js for camera AR
      const threeSetup = initializeThreeJS();
      if (!threeSetup) {
        throw new Error('Failed to initialize Three.js renderer');
      }

      const { renderer, scene, camera } = threeSetup;
      
      // Set up camera AR session
      const cameraSession = {
        type: 'camera-ar',
        stream: stream,
        video: video,
        canvas: canvas,
        end: () => {
          console.log("🛑 Camera AR session ended");
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(video);
          document.body.removeChild(canvas);
          setIsARActive(false);
          setArStatusMessage('Camera AR session ended.');
          sessionRef.current = null;
          renderer.setAnimationLoop(null);
        }
      };
      
      sessionRef.current = cameraSession;
      setIsARActive(true);
      setArStatusMessage('Camera AR active! Tap anywhere to place furniture.');
      
      // Add click handler for furniture placement
      canvas.addEventListener('click', (event) => {
        console.log("👆 Camera AR click event - placing furniture");
        const rect = canvas.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Create a simple transform matrix for placement
        const transformMatrix = new Float32Array([
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          x * 2, y * 2, -2, 1  // Place 2 meters in front
        ]);
        
        placeFurnitureModel(transformMatrix);
      });
      
      // Start render loop for camera AR
      const renderCameraAR = () => {
        if (!sessionRef.current || sessionRef.current.type !== 'camera-ar') return;
        
        // Update camera position based on video
        if (video.readyState >= 2) {
          // Simple camera positioning for AR effect
          camera.position.set(0, 0, 0);
          camera.lookAt(0, 0, -1);
        }
        
        renderer.render(scene, camera);
        requestAnimationFrame(renderCameraAR);
      };
      
      renderCameraAR();
      console.log("🔄 Camera AR render loop started");
      
    } catch (error) {
      console.error('Camera AR failed:', error);
      setArStatusMessage('Failed to start camera AR: ' + (error as Error).message);
      setIsARActive(false);
    }
  };

  const onSelect = async (event: any) => {
    console.log("🎯 Processing AR select event for furniture placement");
    
    if (!sessionRef.current || !sceneRef.current) {
      console.warn("Missing session or scene reference");
      return;
    }

    // Get the current frame for hit testing
    const frame = event.frame;
    if (!frame) {
      console.warn("No frame available for hit testing");
      return;
    }

    // Perform hit testing if available
    if (hitTestSourceRef.current) {
      const hitTestResults = frame.getHitTestResults(hitTestSourceRef.current);
      console.log(`Hit test results: ${hitTestResults.length} surfaces detected`);
      
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const referenceSpace = sessionRef.current.requestReferenceSpace('local');
        
        referenceSpace.then(async (space: any) => {
          const pose = hit.getPose(space);
          
          if (pose) {
            console.log("✅ Valid surface detected, placing furniture model");
            await placeFurnitureModel(pose.transform.matrix);
          } else {
            console.warn("No valid pose from hit test result");
          }
        });
      } else {
        console.log("⚠️ No surfaces detected, placing at default position");
        // Place at default position in front of camera
        const defaultMatrix = new Float32Array([
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          0, 0, -1.5, 1  // 1.5 meters in front
        ]);
        await placeFurnitureModel(defaultMatrix);
      }
    } else {
      console.log("📍 No hit-test available, placing at default position");
      // Fallback placement without hit testing
      const defaultMatrix = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, -1.5, 1
      ]);
      await placeFurnitureModel(defaultMatrix);
    }
  };

  const placeFurnitureModel = async (transformMatrix: Float32Array) => {
    if (!sceneRef.current) return;

    // Remove previous object if it exists
    if (placedObjectRef.current) {
      sceneRef.current.remove(placedObjectRef.current);
      console.log("🗑️ Removed previous furniture model");
    }

    // Create and place new furniture model (async for 3D model loading)
    try {
      const furnitureModel = await createFurnitureModel();
      if (furnitureModel) {
        const matrix = new THREE.Matrix4().fromArray(transformMatrix);
        furnitureModel.position.setFromMatrixPosition(matrix);
        furnitureModel.quaternion.setFromRotationMatrix(matrix);
        
        sceneRef.current.add(furnitureModel);
        placedObjectRef.current = furnitureModel;
        setFurniturePlaced(true);
        
        console.log("🪑 Furniture model placed successfully in AR scene");
        setArStatusMessage('Furniture placed! Move around to view from different angles.');
        
        // Determine model type based on whether we loaded a 3D model or used geometric fallback
        const modelType = configuration.assetUrls?.glb ? 'modular_3d_model' : 'geometric_fallback';
        
        // Trigger AR completion callback after a short delay
        setTimeout(() => {
          console.log("📧 Triggering email capture after successful AR placement");
          onARComplete?.({
            placementCompleted: true,
            placementTimestamp: new Date(),
            modelType: modelType
          });
        }, 2000);
      } else {
        console.error("❌ Failed to create furniture model");
      }
    } catch (error) {
      console.error("❌ Error creating furniture model:", error);
    }
  };

  const render = (timestamp: number, frame: any) => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    
    // WebXR frame-specific rendering
    if (frame && sessionRef.current) {
      // Perform hit testing for surface detection and visual feedback
      if (hitTestSourceRef.current) {
        try {
          const hitTestResults = frame.getHitTestResults(hitTestSourceRef.current);
          // Log surface detection for debugging
          if (hitTestResults.length > 0) {
            // Surfaces detected - could add visual indicators here
          }
        } catch (error) {
          // Hit testing might fail occasionally, that's okay
        }
      }
      
      // Update any animated objects or materials here
      if (placedObjectRef.current) {
        // Optional: Add subtle rotation or animation to placed furniture
        placedObjectRef.current.rotation.y += 0.001;
      }
    }

    // Render the scene
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  const stopARSession = () => {
    if (sessionRef.current) {
      console.log("🛑 Manually stopping AR session");
      if (sessionRef.current.type === 'camera-ar') {
        sessionRef.current.end();
      } else {
        sessionRef.current.end();
      }
    }
  };

  // Test AR functionality with comprehensive device testing
  const testARCompatibility = async () => {
    console.log("🧪 Running comprehensive AR compatibility test...");
    
    const results = {
      https: location.protocol === 'https:' || location.hostname === 'localhost',
      webxr: 'xr' in navigator,
      camera: false,
      arSupport: false,
      hitTest: false
    };

    try {
      // Test camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      results.camera = true;
      stream.getTracks().forEach(track => track.stop());
      
      // Test WebXR AR support  
      if (results.webxr) {
        // @ts-ignore
        results.arSupport = await navigator.xr.isSessionSupported('immersive-ar');
        
        if (results.arSupport) {
          // @ts-ignore
          results.hitTest = await navigator.xr.isSessionSupported('immersive-ar', {
            requiredFeatures: ['hit-test']
          }).catch(() => false);
        }
      }
    } catch (error) {
      console.error("AR test failed:", error);
    }

    console.log("AR Compatibility Results:", results);
    
    const statusMessage = `
      HTTPS: ${results.https ? '✅' : '❌'}
      WebXR: ${results.webxr ? '✅' : '❌'}  
      Camera: ${results.camera ? '✅' : '❌'}
      AR Support: ${results.arSupport ? '✅' : '❌'}
      Hit Testing: ${results.hitTest ? '✅' : '❌'}
    `;
    
    setArStatusMessage(statusMessage);
    return results;
  };

  if (isChecking) {
    return (
      <Button disabled className="w-full">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        Checking AR Support...
      </Button>
    );
  }

  if (!isARSupported) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-moduvo-taupe/20 rounded-lg border border-moduvo-taupe/40">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-moduvo-gold" />
            <div>
              <p className="text-moduvo-charcoal font-medium">AR not supported</p>
              <p className="text-sm text-moduvo-gray">
                Please use a compatible mobile device with Chrome browser or scan the QR code below
              </p>
            </div>
          </div>
        </div>
        
        <Button 
          disabled 
          className="w-full bg-moduvo-taupe cursor-not-allowed text-moduvo-gray"
        >
          <Camera className="w-4 h-4 mr-2" />
          AR Not Available
        </Button>
        
        <div className="text-center">
          <p className="text-sm text-moduvo-gray mb-2">Or scan this QR code on your mobile device:</p>
          <div className="w-32 h-32 bg-moduvo-taupe/30 rounded-lg mx-auto flex items-center justify-center">
            <span className="text-moduvo-gray text-xs">QR Code</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button 
        onClick={isARActive ? stopARSession : startARSession}
        className="w-full bg-moduvo-sage hover:bg-moduvo-gold text-white transition-colors duration-200"
        disabled={isChecking}
      >
        <Camera className="w-4 h-4 mr-2" />
        {isARActive ? 'Stop AR Experience' : 'Start AR Experience'}
      </Button>
      
      {/* AR Testing Button for Development */}
      <Button 
        onClick={testARCompatibility}
        variant="outline"
        className="w-full border-moduvo-taupe text-moduvo-gray hover:bg-moduvo-taupe/20 text-sm"
      >
        <Crosshair className="w-4 h-4 mr-2" />
        Test AR Compatibility
      </Button>
      
      {arStatusMessage && (
        <div className={`p-4 rounded-lg border whitespace-pre-line ${
          isARActive 
            ? 'bg-moduvo-sage/10 border-moduvo-sage/30' 
            : 'bg-moduvo-taupe/20 border-moduvo-taupe/40'
        }`}>
          <p className={`text-sm ${
            isARActive ? 'text-moduvo-charcoal' : 'text-moduvo-gray'
          }`}>
            {arStatusMessage}
          </p>
        </div>
      )}
      
      {/* AR Session Status Overlay */}
      {isARActive && (
        <div className="fixed top-4 left-4 right-4 z-[1001] bg-moduvo-sage/90 text-white p-3 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">AR Active</span>
              {furniturePlaced && (
                <span className="text-xs bg-moduvo-gold/30 px-2 py-1 rounded">Furniture Placed</span>
              )}
            </div>
            <Button 
              onClick={stopARSession}
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-white/20"
            >
              End AR
            </Button>
          </div>
        </div>
      )}
      
      {/* AR Crosshair Overlay */}
      {isARActive && (
        <div className="fixed inset-0 z-[1000] pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 border-2 border-moduvo-sage rounded-full border-dashed opacity-90 animate-pulse shadow-lg"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-moduvo-gold rounded-full"></div>
          </div>
          <div className="absolute bottom-20 left-4 right-4 text-center">
            <p className="text-white text-sm bg-black/50 px-4 py-2 rounded-lg">
              Point at a flat surface and tap to place furniture
            </p>
          </div>
        </div>
      )}
      
      {/* Hidden canvas for WebXR rendering */}
      <canvas 
        ref={canvasRef}
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 999,
          display: isARActive ? 'block' : 'none',
          pointerEvents: isARActive ? 'auto' : 'none'
        }}
      />
    </div>
  );
}
