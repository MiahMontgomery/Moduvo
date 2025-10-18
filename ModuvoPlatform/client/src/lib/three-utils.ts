import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class ModuvoThreeUtils {
  private loader: GLTFLoader;
  private scene: THREE.Scene;
  private models: Map<string, THREE.Group> = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.loader = new GLTFLoader();
  }

  /**
   * Load a 3D model from URL
   */
  async loadModel(url: string, scale = 1): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          model.scale.setScalar(scale);
          
          // Enable shadows for all meshes
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          
          resolve(model);
        },
        (progress) => {
          console.log('Loading progress:', (progress.loaded / progress.total) * 100 + '%');
        },
        (error) => {
          console.error('Error loading model:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Create a simple geometric representation when 3D models are not available
   */
  createGeometricModel(configuration: any): THREE.Group {
    const group = new THREE.Group();
    
    // Main furniture piece
    const width = (configuration.dimensions?.width || 200) / 100;
    const height = (configuration.dimensions?.height || 240) / 100;
    const depth = (configuration.dimensions?.depth || 58) / 100;
    
    const geometry = new THREE.BoxGeometry(width, height, depth);
    
    // Apply finish color
    const color = configuration.finish?.color || '#FFFFFF';
    const material = new THREE.MeshLambertMaterial({ 
      color,
      transparent: true,
      opacity: 0.9
    });
    
    const mainMesh = new THREE.Mesh(geometry, material);
    mainMesh.position.y = height / 2;
    mainMesh.castShadow = true;
    mainMesh.receiveShadow = true;
    
    // Add edge lines for better definition
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x444444,
      transparent: true,
      opacity: 0.6
    });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    wireframe.position.copy(mainMesh.position);
    
    group.add(mainMesh);
    group.add(wireframe);
    
    // Add components
    if (configuration.selectedComponents) {
      configuration.selectedComponents.forEach((component: any, index: number) => {
        const compMesh = this.createComponent(component, index, width, height, depth);
        if (compMesh) {
          group.add(compMesh);
        }
      });
    }
    
    return group;
  }

  /**
   * Create component meshes based on type
   */
  private createComponent(component: any, index: number, width: number, height: number, depth: number): THREE.Group | null {
    const compGroup = new THREE.Group();
    
    switch (component.category) {
      case 'hanging_rail':
        // Create a hanging rail
        const railGeometry = new THREE.CylinderGeometry(0.01, 0.01, width * 0.8);
        const railMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const rail = new THREE.Mesh(railGeometry, railMaterial);
        rail.rotation.z = Math.PI / 2;
        rail.position.set(0, height * 0.8, -depth * 0.3);
        rail.castShadow = true;
        compGroup.add(rail);
        break;
        
      case 'drawer':
        // Create drawer representation
        const drawerGeometry = new THREE.BoxGeometry(width * 0.9, 0.15, depth * 0.8);
        const drawerMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        const drawer = new THREE.Mesh(drawerGeometry, drawerMaterial);
        drawer.position.set(0, 0.3 + (index * 0.2), depth * 0.1);
        drawer.castShadow = true;
        
        // Add drawer handle
        const handleGeometry = new THREE.BoxGeometry(0.1, 0.02, 0.02);
        const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(0, 0, depth * 0.4);
        drawer.add(handle);
        
        compGroup.add(drawer);
        break;
        
      case 'shelf':
        // Create shelf representation
        const shelfGeometry = new THREE.BoxGeometry(width * 0.95, 0.03, depth * 0.9);
        const shelfMaterial = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
        const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
        shelf.position.set(0, 0.5 + (index * 0.4), 0);
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        compGroup.add(shelf);
        break;
        
      case 'lighting':
        // Create LED strip representation
        const lightGeometry = new THREE.BoxGeometry(width * 0.9, 0.01, 0.02);
        const lightMaterial = new THREE.MeshLambertMaterial({ 
          color: 0xffffaa,
          emissive: 0x444422
        });
        const lightStrip = new THREE.Mesh(lightGeometry, lightMaterial);
        lightStrip.position.set(0, height * 0.95, -depth * 0.4);
        compGroup.add(lightStrip);
        
        // Add actual light source
        const light = new THREE.PointLight(0xffffaa, 0.5, width * 2);
        light.position.copy(lightStrip.position);
        compGroup.add(light);
        break;
        
      default:
        return null;
    }
    
    return compGroup;
  }

  /**
   * Apply material finish to a model
   */
  applyFinish(model: THREE.Group, finish: any): void {
    const color = finish?.color || '#FFFFFF';
    const metalness = finish?.name?.toLowerCase().includes('metal') ? 0.8 : 0.1;
    const roughness = finish?.name?.toLowerCase().includes('gloss') ? 0.1 : 0.7;
    
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Create new material with finish properties
        if (child.material instanceof THREE.MeshLambertMaterial) {
          const newMaterial = new THREE.MeshStandardMaterial({
            color,
            metalness,
            roughness,
            transparent: child.material.transparent,
            opacity: child.material.opacity
          });
          child.material = newMaterial;
        }
      }
    });
  }

  /**
   * Update model dimensions
   */
  updateDimensions(model: THREE.Group, dimensions: any): void {
    const scale = new THREE.Vector3(
      dimensions.width / 200,
      dimensions.height / 240,
      dimensions.depth / 58
    );
    model.scale.copy(scale);
  }

  /**
   * Setup lighting for a scene
   */
  static setupLighting(scene: THREE.Scene): void {
    // Remove existing lights
    const existingLights = scene.children.filter(child => child instanceof THREE.Light);
    existingLights.forEach(light => scene.remove(light));
    
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Main directional light (key light)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
    rimLight.position.set(0, 5, -10);
    scene.add(rimLight);
  }

  /**
   * Create a ground plane
   */
  static createGround(size = 20): THREE.Mesh {
    const groundGeometry = new THREE.PlaneGeometry(size, size);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    return ground;
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.models.forEach(model => {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
    this.models.clear();
  }
}

/**
 * WebXR AR utilities
 */
export class ModuvoARUtils {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private session: any = null;
  private hitTestSource: any = null;
  private model: THREE.Group | null = null;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
  }

  /**
   * Check if AR is supported
   */
  static async isARSupported(): Promise<boolean> {
    if ('xr' in navigator) {
      try {
        // @ts-ignore
        return await navigator.xr.isSessionSupported('immersive-ar');
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  /**
   * Start AR session
   */
  async startARSession(): Promise<void> {
    if (!await ModuvoARUtils.isARSupported()) {
      throw new Error('AR not supported');
    }

    try {
      // @ts-ignore
      this.session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
      });

      await this.renderer.xr.setSession(this.session);

      // Setup hit testing
      const referenceSpace = await this.session.requestReferenceSpace('viewer');
      this.hitTestSource = await this.session.requestHitTestSource({ space: referenceSpace });

      this.session.addEventListener('end', () => {
        this.endARSession();
      });

    } catch (error) {
      throw new Error('Failed to start AR session: ' + error);
    }
  }

  /**
   * End AR session
   */
  endARSession(): void {
    if (this.session) {
      this.session.end();
      this.session = null;
    }
    if (this.hitTestSource) {
      this.hitTestSource.cancel();
      this.hitTestSource = null;
    }
    if (this.model) {
      this.scene.remove(this.model);
      this.model = null;
    }
  }

  /**
   * Place model in AR
   */
  placeModel(model: THREE.Group, position: THREE.Vector3): void {
    if (this.model) {
      this.scene.remove(this.model);
    }
    
    this.model = model.clone();
    this.model.position.copy(position);
    this.scene.add(this.model);
  }

  /**
   * Handle AR frame for hit testing
   */
  onARFrame(frame: any, renderer: THREE.WebGLRenderer): THREE.Vector3 | null {
    if (!this.hitTestSource) return null;

    const hitTestResults = frame.getHitTestResults(this.hitTestSource);
    if (hitTestResults.length > 0) {
      const hit = hitTestResults[0];
      const pose = hit.getPose(renderer.xr.getReferenceSpace());
      
      if (pose) {
        return new THREE.Vector3(
          pose.transform.position.x,
          pose.transform.position.y,
          pose.transform.position.z
        );
      }
    }
    
    return null;
  }

  /**
   * Get current AR session
   */
  getSession(): any {
    return this.session;
  }

  /**
   * Check if AR session is active
   */
  isSessionActive(): boolean {
    return this.session !== null;
  }
}
