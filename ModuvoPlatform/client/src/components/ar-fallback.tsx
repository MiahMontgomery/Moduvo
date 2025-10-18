import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ModuvoThreeUtils } from "@/lib/three-utils";

interface ARFallbackProps {
  configuration: any;
  className?: string;
}

export default function ARFallback({ configuration, className }: ARFallbackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current || !configuration) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(3, 3, 3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add ground plane to simulate room floor
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(10, 20, 0xcccccc, 0xeeeeee);
    scene.add(gridHelper);

    // Create furniture model
    const threeUtils = new ModuvoThreeUtils(scene);
    const furnitureModel = threeUtils.createGeometricModel(configuration);
    furnitureModel.position.y = 0;
    scene.add(furnitureModel);

    // Store references
    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;

    // Add mouse controls
    let mouseX = 0;
    let mouseY = 0;
    let isMouseDown = false;

    const onMouseMove = (event: MouseEvent) => {
      if (!isMouseDown) return;
      
      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;
      
      furnitureModel.rotation.y += deltaX * 0.01;
      furnitureModel.rotation.x += deltaY * 0.01;
      
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const onMouseDown = (event: MouseEvent) => {
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mouseup', onMouseUp);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      // Gentle rotation when not being manipulated
      if (!isMouseDown) {
        furnitureModel.rotation.y += 0.005;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mouseup', onMouseUp);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, [configuration]);

  return (
    <div 
      ref={containerRef} 
      className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}
      style={{ minHeight: '400px' }}
    >
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
        3D Preview (Click and drag to rotate)
      </div>
      <div className="absolute bottom-4 right-4 bg-moduvo-sage/90 text-white px-3 py-1 rounded-full text-sm">
        Interactive Model
      </div>
    </div>
  );
}