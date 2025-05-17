// src/animations/threeD.js
import { animate, createScope, createSpring } from 'animejs';
import * as THREE from 'three';

// Create a basic 3D scene
export const createScene = (container, options = {}) => {
  if (!container) return null;

  // Get dimensions
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Create scene
  const scene = new THREE.Scene();
  
  // Create camera with defaults that can be overridden
  const camera = new THREE.PerspectiveCamera(
    options.fov || 75,
    width / height,
    options.near || 0.1,
    options.far || 1000
  );
  camera.position.z = options.cameraZ || 5;

  // Create renderer
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  // Clear container first
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  
  container.appendChild(renderer.domElement);

  // Configure scene based on options
  if (options.backgroundColor) {
    scene.background = new THREE.Color(options.backgroundColor);
  }

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, options.ambientIntensity || 0.5);
  scene.add(ambientLight);

  // Add directional light
  if (options.enableDirectionalLight !== false) {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
  }

  // Create animation scope for the scene
  const scope = createScope({ root: container });

  // Handle window resize
  const handleResize = () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  };

  window.addEventListener('resize', handleResize);

  // Animation loop function
  let frameId;
  const animate = () => {
    frameId = requestAnimationFrame(animate);
    
    if (options.onAnimate) {
      options.onAnimate(scene, camera, renderer);
    }
    
    renderer.render(scene, camera);
  };

  // Start animation loop
  animate();

  // Return everything needed to manage the scene
  return {
    scene,
    camera,
    renderer,
    scope,
    cleanup: () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      scope.revert();
      
      // Dispose of THREE.js resources
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      renderer.dispose();
      
      // Remove canvas
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    }
  };
};

// Create a 3D particle system
export const createParticleSystem = (scene, options = {}) => {
  const {
    count = 100,
    color = 0xffffff,
    size = 0.05,
    opacity = 0.7,
    speed = 0.05,
    radius = 5
  } = options;

  // Create a group to hold all particles
  const particleGroup = new THREE.Group();
  scene.add(particleGroup);

  // Create particles
  const particleGeometry = new THREE.BufferGeometry();
  const particleMaterial = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthTest: false,
  });

  // Create positions for particles in a sphere
  const positions = new Float32Array(count * 3);
  const velocities = []; // Store velocity for each particle

  for (let i = 0; i < count; i++) {
    // Random position on a sphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * Math.cbrt(Math.random()); // Cube root for more uniform distribution
    
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    
    // Random velocity vector
    velocities.push({
      x: (Math.random() - 0.5) * speed,
      y: (Math.random() - 0.5) * speed,
      z: (Math.random() - 0.5) * speed
    });
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  particleGroup.add(particles);

  // Animation function
  const updateParticles = () => {
    const positions = particles.geometry.attributes.position.array;
    
    for (let i = 0; i < count; i++) {
      // Update position based on velocity
      positions[i * 3] += velocities[i].x;
      positions[i * 3 + 1] += velocities[i].y;
      positions[i * 3 + 2] += velocities[i].z;
      
      // Check if particle is too far from center and reset
      const distance = Math.sqrt(
        positions[i * 3] ** 2 + 
        positions[i * 3 + 1] ** 2 + 
        positions[i * 3 + 2] ** 2
      );
      
      if (distance > radius * 1.5) {
        // Reset to a random position on the sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = radius * Math.random();
        
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
        
        // New random velocity
        velocities[i] = {
          x: (Math.random() - 0.5) * speed,
          y: (Math.random() - 0.5) * speed,
          z: (Math.random() - 0.5) * speed
        };
      }
    }
    
    particles.geometry.attributes.position.needsUpdate = true;
  };

  // Rotate the entire particle group
  const rotateParticleGroup = () => {
    particleGroup.rotation.y += 0.0005;
    particleGroup.rotation.x += 0.0002;
  };

  return {
    particleGroup,
    update: () => {
      updateParticles();
      rotateParticleGroup();
    },
    setOpacity: (value) => {
      particleMaterial.opacity = value;
    },
    setColor: (color) => {
      particleMaterial.color = new THREE.Color(color);
    },
    setSize: (value) => {
      particleMaterial.size = value;
    }
  };
};

// Create a floating 3D logo
export const createLogo3D = (scene, options = {}) => {
  const {
    size = 1,
    color = 0x7289da,
    position = { x: 0, y: 0, z: 0 },
    text = "CW"
  } = options;

  const group = new THREE.Group();
  
  // Create text geometry
  const loader = new THREE.FontLoader();
  
  // We'll create a placeholder mesh first, then replace it when the font loads
  const placeholder = new THREE.Mesh(
    new THREE.BoxGeometry(size, size, size * 0.1),
    new THREE.MeshBasicMaterial({ color: 0x888888 })
  );
  group.add(placeholder);
  
  // Position the group
  group.position.set(position.x, position.y, position.z);
  
  // Add to scene
  scene.add(group);
  
  // Create a floating animation for the logo
  const animateLogo = () => {
    // Create floating effect
    animate(group.position, {
      y: [position.y - 0.2, position.y + 0.2],
      duration: 2000,
      loop: true,
      direction: 'alternate',
      easing: 'easeInOutSine'
    });
    
    // Create slow rotation effect
    animate({
      value: 0
    }, {
      value: Math.PI * 2,
      duration: 10000,
      loop: true,
      easing: 'linear',
      update: function(anim) {
        group.rotation.y = anim.progress * Math.PI * 2 * 0.1;
      }
    });
  };
  
  // Start animation
  animateLogo();
  
  // Try to load a font (we could use a local font in a real app)
  loader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font) => {
    // Remove placeholder
    group.remove(placeholder);
    
    // Create text geometry
    const textGeometry = new THREE.TextGeometry(text, {
      font: font,
      size: size,
      height: size * 0.2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: size * 0.05,
      bevelSize: size * 0.02,
      bevelOffset: 0,
      bevelSegments: 5
    });
    
    // Center the geometry
    textGeometry.computeBoundingBox();
    const centerOffset = new THREE.Vector3();
    textGeometry.boundingBox.getCenter(centerOffset).multiplyScalar(-1);
    
    // Create materials
    const material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.5,
      roughness: 0.2
    });
    
    // Create mesh and add to group
    const textMesh = new THREE.Mesh(textGeometry, material);
    textMesh.position.copy(centerOffset);
    group.add(textMesh);
  });
  
  return {
    group,
    update: () => {
      // Any per-frame updates can go here
    },
    setColor: (newColor) => {
      group.traverse((object) => {
        if (object.isMesh) {
          if (object.material.color) {
            object.material.color.set(newColor);
          }
        }
      });
    }
  };
};

// Create an animated 3D background with a gradient and subtle movement
export const createAnimatedBackground = (scene, options = {}) => {
  const {
    colors = [0x1a2a6c, 0xb21f1f, 0xfdbb2d],
    segments = 20,
    width = 30,
    height = 20,
    speed = 0.5
  } = options;

  // Create a plane geometry
  const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
  
  // Create a custom shader material for the gradient
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color1: { value: new THREE.Color(colors[0]) },
      color2: { value: new THREE.Color(colors[1]) },
      color3: { value: new THREE.Color(colors[2]) }
    },
    vertexShader: `
      varying vec2 vUv;
      uniform float time;
      
      void main() {
        vUv = uv;
        // Add subtle wave effect to vertices
        vec3 pos = position;
        pos.z = sin(pos.x * 2.0 + time * 0.5) * sin(pos.y * 2.0 + time * 0.5) * 0.2;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      uniform vec3 color3;
      uniform float time;
      varying vec2 vUv;
      
      void main() {
        // Create a moving gradient effect
        float t = vUv.y + sin(vUv.x * 10.0 + time * 0.3) * 0.1;
        
        // 3-color gradient
        vec3 color;
        if (t < 0.5) {
          color = mix(color1, color2, t * 2.0);
        } else {
          color = mix(color2, color3, (t - 0.5) * 2.0);
        }
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.DoubleSide
  });
  
  // Create mesh and add to scene
  const background = new THREE.Mesh(geometry, material);
  background.position.z = -10;
  scene.add(background);
  
  // Animation time
  let time = 0;
  
  return {
    mesh: background,
    update: () => {
      time += 0.01 * speed;
      material.uniforms.time.value = time;
    },
    setColors: (newColors) => {
      if (newColors.length >= 3) {
        material.uniforms.color1.value.set(newColors[0]);
        material.uniforms.color2.value.set(newColors[1]);
        material.uniforms.color3.value.set(newColors[2]);
      }
    }
  };
};

// Helper to create a postprocessing effect
export const addBloomEffect = (scene, camera, renderer) => {
  // This would require importing additional libraries like THREE.EffectComposer
  // For simplicity, we'll just return the existing renderer for now
  return renderer;
};