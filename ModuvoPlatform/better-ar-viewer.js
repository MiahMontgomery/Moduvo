// Better AR Viewer Component - More Permissive Device Detection
// This should replace or enhance your current AR viewer

class BetterARViewer {
  constructor() {
    this.isARSupported = false;
    this.isARActive = false;
    this.session = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
  }

  // More permissive AR support detection
  async checkARSupport() {
    console.log("🔍 Better AR support detection...");
    
    // Check HTTPS (required for AR)
    if (location.protocol !== 'https:') {
      console.log("❌ HTTPS required for AR");
      return false;
    }

    // Check if it's a mobile device
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log("Mobile device:", isMobile);

    // Check WebXR support
    if ('xr' in navigator) {
      console.log("✅ WebXR API available");
      
      try {
        // Try to check AR session support
        if (navigator.xr.isSessionSupported) {
          const supported = await navigator.xr.isSessionSupported('immersive-ar');
          console.log("AR session supported:", supported);
          
          if (supported) {
            console.log("✅ Full AR support detected");
            this.isARSupported = true;
            return true;
          }
        }
      } catch (error) {
        console.warn("AR session check failed:", error);
      }
    }

    // Fallback: If on mobile with HTTPS, assume basic AR capability
    if (isMobile) {
      console.log("✅ Mobile device with HTTPS - enabling basic AR");
      this.isARSupported = true;
      return true;
    }

    console.log("❌ AR not supported on this device");
    return false;
  }

  // Start AR session with better error handling
  async startARSession() {
    if (!this.isARSupported) {
      console.log("AR not supported");
      return false;
    }

    try {
      console.log("🚀 Starting AR session...");
      
      // Try WebXR AR first
      if ('xr' in navigator && navigator.xr.isSessionSupported) {
        try {
          const supported = await navigator.xr.isSessionSupported('immersive-ar');
          if (supported) {
            this.session = await navigator.xr.requestSession('immersive-ar', {
              requiredFeatures: ['hit-test'],
              optionalFeatures: ['dom-overlay', 'light-estimation'],
            });
            
            console.log("✅ WebXR AR session started");
            this.isARActive = true;
            this.setupARSession();
            return true;
          }
        } catch (error) {
          console.warn("WebXR AR failed:", error);
        }
      }

      // Fallback: Camera-based AR simulation
      console.log("📱 Using camera-based AR simulation");
      return await this.startCameraARSession();
      
    } catch (error) {
      console.error("AR session start failed:", error);
      return false;
    }
  }

  // Camera-based AR simulation for broader compatibility
  async startCameraARSession() {
    try {
      console.log("📱 Starting camera-based AR...");
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      console.log("✅ Camera access granted");
      
      // Create video element
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Create canvas for AR overlay
      const canvas = document.createElement('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.zIndex = '1000';
      canvas.style.pointerEvents = 'none';
      
      document.body.appendChild(canvas);
      
      // Simulate AR session
      this.session = {
        type: 'camera-ar',
        stream: stream,
        video: video,
        canvas: canvas,
        addEventListener: (event, handler) => {
          if (event === 'end') {
            this.endARSession();
          }
        }
      };
      
      this.isARActive = true;
      console.log("✅ Camera AR session started");
      return true;
      
    } catch (error) {
      console.error("Camera AR failed:", error);
      return false;
    }
  }

  // Setup AR session
  setupARSession() {
    if (!this.session) return;
    
    console.log("🎨 Setting up AR session...");
    
    // Add session end handler
    this.session.addEventListener('end', () => {
      this.endARSession();
    });
    
    // Add input handlers for placement
    this.session.addEventListener('select', (event) => {
      this.handleARInput(event);
    });
    
    console.log("✅ AR session setup complete");
  }

  // Handle AR input (tap to place)
  handleARInput(event) {
    console.log("👆 AR input detected");
    
    if (this.session.type === 'camera-ar') {
      // For camera AR, place at center of screen
      this.placeFurnitureAtCenter();
    } else {
      // For WebXR, use hit test
      this.placeFurnitureWithHitTest(event);
    }
  }

  // Place furniture at center (camera AR)
  placeFurnitureAtCenter() {
    console.log("📦 Placing furniture at center");
    // Add your furniture placement logic here
  }

  // Place furniture with hit test (WebXR)
  placeFurnitureWithHitTest(event) {
    console.log("🎯 Placing furniture with hit test");
    // Add your WebXR furniture placement logic here
  }

  // End AR session
  endARSession() {
    console.log("🛑 Ending AR session");
    
    if (this.session) {
      if (this.session.stream) {
        this.session.stream.getTracks().forEach(track => track.stop());
      }
      if (this.session.canvas) {
        document.body.removeChild(this.session.canvas);
      }
      this.session = null;
    }
    
    this.isARActive = false;
    console.log("✅ AR session ended");
  }

  // Initialize AR viewer
  async init() {
    console.log("🎯 Initializing Better AR Viewer...");
    
    const supported = await this.checkARSupport();
    
    if (supported) {
      console.log("✅ AR supported - enabling AR features");
      this.enableARFeatures();
    } else {
      console.log("⚠️ AR not supported - showing fallback");
      this.showFallback();
    }
  }

  // Enable AR features
  enableARFeatures() {
    // Enable AR buttons
    const arButtons = document.querySelectorAll('[data-ar-button]');
    arButtons.forEach(button => {
      button.style.display = 'block';
      button.addEventListener('click', () => this.startARSession());
    });
    
    console.log("✅ AR features enabled");
  }

  // Show fallback
  showFallback() {
    // Show 3D viewer fallback
    const fallbacks = document.querySelectorAll('[data-ar-fallback]');
    fallbacks.forEach(fallback => {
      fallback.style.display = 'block';
    });
    
    console.log("✅ Fallback 3D viewer shown");
  }
}

// Initialize when page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const arViewer = new BetterARViewer();
    arViewer.init();
    
    // Make it globally available
    window.arViewer = arViewer;
  });
}




