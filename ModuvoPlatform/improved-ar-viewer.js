// Improved AR Viewer Component with Better Device Compatibility
// This should be added to your AR viewer component

// Enhanced AR support detection
function checkARSupport() {
  console.log("🔍 Enhanced AR support detection...");
  
  // Check for WebXR support
  if ('xr' in navigator) {
    console.log("✅ WebXR API available");
    
    // Check for AR session support
    if (navigator.xr.isSessionSupported) {
      navigator.xr.isSessionSupported('immersive-ar')
        .then(supported => {
          console.log("AR session supported:", supported);
          if (supported) {
            console.log("✅ AR sessions supported - enabling AR features");
            // Enable AR features
            return true;
          }
        })
        .catch(error => {
          console.warn("AR session check failed:", error);
        });
    }
  }
  
  // Fallback: Check for device capabilities
  const userAgent = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isHTTPS = location.protocol === 'https:';
  
  console.log("Device check:", { isMobile, isHTTPS, userAgent });
  
  // Enable AR if on mobile with HTTPS (most devices support basic AR)
  if (isMobile && isHTTPS) {
    console.log("✅ Mobile device with HTTPS - enabling AR features");
    return true;
  }
  
  return false;
}

// Improved AR session start
async function startARSession() {
  try {
    console.log("🚀 Starting AR session with improved compatibility...");
    
    // Try WebXR first
    if ('xr' in navigator && navigator.xr.isSessionSupported) {
      const supported = await navigator.xr.isSessionSupported('immersive-ar');
      if (supported) {
        console.log("Using WebXR AR session");
        return await navigator.xr.requestSession('immersive-ar', {
          requiredFeatures: ['hit-test'],
          optionalFeatures: ['dom-overlay', 'light-estimation'],
        });
      }
    }
    
    // Fallback: Use camera-based AR simulation
    console.log("Using camera-based AR simulation");
    return await startCameraARSession();
    
  } catch (error) {
    console.error("AR session start failed:", error);
    throw error;
  }
}

// Camera-based AR simulation for broader compatibility
async function startCameraARSession() {
  console.log("📱 Starting camera-based AR simulation...");
  
  // Request camera access
  const stream = await navigator.mediaDevices.getUserMedia({ 
    video: { facingMode: 'environment' } 
  });
  
  console.log("✅ Camera access granted");
  
  // Create a simulated AR session
  return {
    type: 'camera-ar',
    stream: stream,
    addEventListener: (event, handler) => {
      if (event === 'end') {
        // Handle session end
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };
}

// Enhanced AR initialization
function initializeAR() {
  console.log("🎯 Initializing enhanced AR...");
  
  const arSupported = checkARSupport();
  
  if (arSupported) {
    console.log("✅ AR supported - enabling AR features");
    // Enable AR UI elements
    document.querySelectorAll('.ar-button').forEach(btn => {
      btn.style.display = 'block';
      btn.addEventListener('click', startARSession);
    });
  } else {
    console.log("⚠️ AR not supported - showing fallback");
    // Show fallback 3D viewer
    document.querySelectorAll('.ar-fallback').forEach(fallback => {
      fallback.style.display = 'block';
    });
  }
}

// Initialize when page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', initializeAR);
}
