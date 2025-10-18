import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface ThreeViewerProps {
  configuration: any;
  className?: string;
}

export default function ThreeViewer({ configuration, className }: ThreeViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const modelRef = useRef<THREE.Group>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!configuration || !sceneRef.current) return;

    // Remove existing model
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
    }

    // Load 3D model
    const loader = new GLTFLoader();
    
    // For demo purposes, create a simple cube representing the furniture
    const geometry = new THREE.BoxGeometry(
      (configuration.dimensions?.width || 200) / 100,
      (configuration.dimensions?.height || 240) / 100,
      (configuration.dimensions?.depth || 58) / 100
    );
    
    // Apply finish color
    const color = configuration.finish?.color || '#FFFFFF';
    const material = new THREE.MeshLambertMaterial({ color });
    
    const model = new THREE.Mesh(geometry, material);
    model.position.y = (configuration.dimensions?.height || 240) / 200; // Half height
    model.castShadow = true;
    model.receiveShadow = true;
    
    modelRef.current = new THREE.Group();
    modelRef.current.add(model);
    
    // Add components as additional boxes
    if (configuration.selectedComponents) {
      configuration.selectedComponents.forEach((component: any, index: number) => {
        const compGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.5);
        const compMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const compMesh = new THREE.Mesh(compGeometry, compMaterial);
        compMesh.position.set(index * 0.6 - 1, 0.1, 0);
        compMesh.castShadow = true;
        modelRef.current!.add(compMesh);
      });
    }
    
    sceneRef.current.add(modelRef.current);

    // If we had actual 3D models, we would load them like this:
    // if (configuration.product?.modelUrl) {
    //   loader.load(
    //     configuration.product.modelUrl,
    //     (gltf) => {
    //       modelRef.current = gltf.scene;
    //       modelRef.current.scale.setScalar(1);
    //       sceneRef.current!.add(modelRef.current);
    //     },
    //     undefined,
    //     (error) => {
    //       console.error('Error loading 3D model:', error);
    //     }
    //   );
    // }
  }, [configuration]);

  return (
    <div 
      ref={mountRef} 
      className={`relative ${className}`}
      style={{ minHeight: '400px' }}
    >
      {!configuration && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-moduvo-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 border-2 border-moduvo-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-moduvo-gray">Loading 3D viewer...</p>
          </div>
        </div>
      )}
    </div>
  );
}
