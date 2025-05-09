/**
 * Class Whisper - 3D Logo Animation
 * This script creates an interactive 3D logo for the landing page
 * using Three.js library
 */

// Initialize Three.js scene when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if container exists
    const container = document.getElementById('logo-3d-container');
    if (!container) return;
  
    // Initialize Three.js scene, camera, and renderer
    const scene = new THREE.Scene();
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true // Transparent background
    });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Create logo text geometry
    const textLoader = new THREE.FontLoader();
    
    // Load font and create text
    textLoader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', function(font) {
      // 3D text for "CW" (Class Whisper initials)
      const textGeometry = new THREE.TextGeometry('CW', {
        font: font,
        size: 1.2,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
      });
      
      // Center text geometry
      textGeometry.computeBoundingBox();
      const centerOffset = -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
      
      // Material for text with dynamic color effect
      const textMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x111111,
        emissiveIntensity: 0.1
      });
      
      // Create mesh from geometry and material
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.x = centerOffset;
      textMesh.position.y = -0.5;
      textMesh.castShadow = true;
      scene.add(textMesh);
      
      // Create circular platform under the text
      const platformGeometry = new THREE.CircleGeometry(2.2, 32);
      const platformMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.8
      });
      
      const platform = new THREE.Mesh(platformGeometry, platformMaterial);
      platform.position.z = -0.5;
      platform.position.y = -1.2;
      platform.rotation.x = -Math.PI / 2;
      platform.receiveShadow = true;
      scene.add(platform);
      
      // Add ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      // Add directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);
      
      // Add point light
      const pointLight = new THREE.PointLight(0xffffff, 0.5);
      pointLight.position.set(0, 3, 5);
      scene.add(pointLight);
      
      // Add animated particles around the logo
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 100;
      
      // Create arrays for particle positions and other attributes
      const positions = new Float32Array(particlesCount * 3);
      const sizes = new Float32Array(particlesCount);
      const colors = new Float32Array(particlesCount * 3);
      
      // Set random positions, sizes, and colors for particles
      for (let i = 0; i < particlesCount; i++) {
        // Position within a sphere around the text
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.5 + Math.random() * 2;
        const x = Math.cos(angle) * radius;
        const y = (Math.random() - 0.5) * 3;
        const z = Math.sin(angle) * radius;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // Random size for each particle
        sizes[i] = Math.random() * 0.1;
        
        // Grayscale colors for particles
        const shade = Math.random() * 0.5;
        colors[i * 3] = shade;
        colors[i * 3 + 1] = shade;
        colors[i * 3 + 2] = shade;
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      // Create material for particles
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        sizeAttenuation: true,
        transparent: true,
        alphaTest: 0.5,
        vertexColors: true
      });
      
      // Create points mesh from geometry and material
      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);
      
      // Animation function
      const animate = function() {
        requestAnimationFrame(animate);
        
        // Rotate text slowly
        textMesh.rotation.y += 0.005;
        
        // Add subtle floating effect to text
        textMesh.position.y = -0.5 + Math.sin(Date.now() * 0.001) * 0.1;
        
        // Animate particles
        const positions = particlesGeometry.attributes.position.array;
        
        for (let i = 0; i < particlesCount; i++) {
          // Get current particle position
          const ix = i * 3;
          const iy = i * 3 + 1;
          const iz = i * 3 + 2;
          
          // Calculate new position
          const x = positions[ix];
          const y = positions[iy];
          const z = positions[iz];
          
          // Move particles in a circular pattern
          const newX = x * Math.cos(0.001) - z * Math.sin(0.001);
          const newZ = x * Math.sin(0.001) + z * Math.cos(0.001);
          
          // Update position
          positions[ix] = newX;
          positions[iz] = newZ;
        }
        
        // Update particles position attribute
        particlesGeometry.attributes.position.needsUpdate = true;
        
        // Render scene
        renderer.render(scene, camera);
      };
      
      // Handle window resize
      window.addEventListener('resize', function() {
        // Update camera aspect ratio
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        
        // Update renderer size
        renderer.setSize(container.clientWidth, container.clientHeight);
      });
      
      // Add interactivity - follow mouse movement
      container.addEventListener('mousemove', function(event) {
        // Get mouse position relative to container
        const rect = container.getBoundingClientRect();
        const mouseX = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        const mouseY = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
        
        // Adjust logo rotation slightly based on mouse position
        textMesh.rotation.x = mouseY * 0.3;
        textMesh.rotation.z = mouseX * 0.3;
        
        // Move point light based on mouse position
        pointLight.position.x = mouseX * 5;
        pointLight.position.y = mouseY * 5;
      });
      
      // Start animation loop
      animate();
    });
  });