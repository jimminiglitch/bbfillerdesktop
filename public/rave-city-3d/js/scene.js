/**
 * 3D Scene handling for Rave City
 */
const RaveCityScene = {
  // Three.js variables
  scene: null,
  camera: null,
  renderer: null,
  composer: null,
  controls: null,
  clock: null,
  raycaster: null,
  particles: null,
  floorMesh: null,
  skyMesh: null,
  bloomPass: null,
  glitchPass: null,
  rgbShiftPass: null,
  characters: [],
  buildings: [],
  skyObjects: [],
  lasers: [],
  smokeMachines: [],
  zones: [],
  lastGenerationPosition: null,
  generationRadius: 500,
  generationDistance: 300,
  characterTextures: [],
  characterMaterials: [],
  THREE: window.THREE, // Declare THREE variable at the top

  // Initialize Three.js scene
  init: function () {
    try {
      console.log("Initializing 3D scene...")

      // Create scene
      this.scene = new this.THREE.Scene()

      // Add fog for depth
      const RaveCityConfig = window.RaveCityConfig // Declare RaveCityConfig variable
      const theme = RaveCityConfig.visualThemes[RaveCityConfig.visualTheme]
      this.scene.fog = new this.THREE.FogExp2(theme.fogColor, 0.008)

      // Create camera
      this.camera = new this.THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
      this.camera.position.set(0, 5, 20)

      // Create renderer
      const RaveCityUI = window.RaveCityUI // Declare RaveCityUI variable
      this.renderer = new this.THREE.WebGLRenderer({
        canvas: RaveCityUI.elements.sceneCanvas,
        antialias: !RaveCityConfig.performanceMode,
        alpha: true,
        powerPreference: "high-performance",
      })
      this.renderer.setSize(window.innerWidth, window.innerHeight)

      // Set pixel ratio based on performance mode
      if (RaveCityConfig.performanceMode) {
        this.renderer.setPixelRatio(1)
      } else {
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      }

      // Create clock for animation
      this.clock = new this.THREE.Clock()

      // Create raycaster for collision detection
      this.raycaster = new this.THREE.Raycaster()

      // Create pointer lock controls for first-person movement
      this.controls = new this.THREE.PointerLockControls(this.camera, document.body)

      // Set up post-processing
      this.setupPostProcessing()

      // Create scene objects
      this.createSceneObjects()

      // Handle window resize
      window.addEventListener("resize", () => this.onWindowResize())

      console.log("3D scene initialized successfully")
    } catch (error) {
      console.error("Failed to initialize 3D scene:", error)
      RaveCityUI.showError(`Failed to initialize 3D scene: ${error.message}`)
    }
  },

  // Set up post-processing
  setupPostProcessing: function () {
    try {
      const RaveCityConfig = window.RaveCityConfig // Declare RaveCityConfig variable
      const theme = RaveCityConfig.visualThemes[RaveCityConfig.visualTheme]

      // Create composer
      this.composer = new THREE.EffectComposer(this.renderer)

      // Add render pass
      const renderPass = new THREE.RenderPass(this.scene, this.camera)
      this.composer.addPass(renderPass)

      // Add bloom pass if enabled and not in performance mode
      if (RaveCityConfig.bloomEnabled && !RaveCityConfig.performanceMode) {
        this.bloomPass = new THREE.UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          theme.bloomStrength,
          theme.bloomRadius,
          theme.bloomThreshold,
        )
        this.composer.addPass(this.bloomPass)
      }

      // Add RGB shift pass if not in performance mode
      if (!RaveCityConfig.performanceMode) {
        this.rgbShiftPass = new THREE.ShaderPass(THREE.RGBShiftShader)
        this.rgbShiftPass.uniforms.amount.value = 0.0015
        this.rgbShiftPass.uniforms.angle.value = 0
        this.composer.addPass(this.rgbShiftPass)

        // Add glitch pass
        this.glitchPass = new THREE.GlitchPass()
        this.glitchPass.goWild = false
        this.glitchPass.enabled = true
        this.composer.addPass(this.glitchPass)
      }
    } catch (error) {
      console.error("Failed to set up post-processing:", error)
      const RaveCityUI = window.RaveCityUI // Declare RaveCityUI variable
      RaveCityUI.showError(`Failed to set up post-processing: ${error.message}`)
    }
  },

  // Create scene objects
  createSceneObjects: function () {
    try {
      const RaveCityConfig = window.RaveCityConfig;
      const theme = RaveCityConfig.visualThemes[RaveCityConfig.visualTheme];

      // Create floor (dance floor)
      this.createDanceFloor(theme);

      // Create sky dome
      this.createSkyDome(theme);

      // Create particle system
      this.createParticles(theme);

      // --- Procedural Crowd! ---
      const crowdConfig = [
        { type: "dj", count: 1, position: { x: 0, z: 0 } },
        { type: "dancer", count: 24, radius: 30 },
        { type: "raver", count: 30, radius: 40 },
        { type: "partier", count: 16, radius: 50 },
        { type: "citizen", count: 50, radius: 120 },
      ];
      crowdConfig.forEach((cfg) => {
        for (let i = 0; i < cfg.count; i++) {
          let x, z;
          if (cfg.position) {
            x = cfg.position.x;
            z = cfg.position.z;
          } else {
            const angle = (i / cfg.count) * Math.PI * 2;
            x = Math.cos(angle) * (cfg.radius ?? 0) + Utils.random(-6, 6);
            z = Math.sin(angle) * (cfg.radius ?? 0) + Utils.random(-6, 6);
          }
          window.RaveCityCharacters.createCharacter(
            x,
            z,
            theme,
            cfg.type
          );
        }
      });

      // --- Add new city effects below ---

      // Create buildings (now with window lights)
      this.createBuildings(theme);

      // Optionally, add procedural window lights/spotlights:
      if (!this.buildingSpotlights) this.buildingSpotlights = [];
      this.buildings.forEach(building => {
        if (Math.random() > 0.7) {
          const spot = this.addBuildingSpotlight(building, theme);
          if (spot) this.buildingSpotlights.push(spot);
        }
      });
    } catch (error) {
      console.error("Failed to create scene objects:", error)
      const RaveCityUI = window.RaveCityUI // Declare RaveCityUI variable
      RaveCityUI.showError(`Failed to create scene objects: ${error.message}`)
    }
  },

  // Update objects in the scene
  updateObjects: function () {
    const time = performance.now() * 0.001

    // Update particles
    if (this.particles) {
      this.particles.rotation.y += 0.01
    }

    // Update floor rotation for dance floor effect
    if (this.floorMesh) {
      this.floorMesh.rotation.x = Math.sin(time * 0.5) * 0.1
      this.floorMesh.rotation.z = Math.cos(time * 0.5) * 0.1
    }

    // Update building spotlights
    if (this.buildingSpotlights) {
      this.buildingSpotlights.forEach((spot, i) => {
        spot.angle = 0.15 + 0.05 * Math.sin(time * 0.7 + i);
        spot.intensity = 1.5 + 1.5 * Math.abs(Math.sin(time * 1.2 + i));
        spot.target.position.x += Math.sin(time * 0.2 + i) * 0.25;
        spot.target.position.z += Math.cos(time * 0.2 + i) * 0.25;
      });
    }

    // Animate window lights for trippy vibes
    this.buildings.forEach((building, bi) => {
      if (building.userData.windowLights) {
        building.userData.windowLights.forEach((win, wi) => {
          win.material.opacity = 0.55 + 0.4 * Math.abs(Math.sin(time * 1.7 + bi + wi));
          if (Math.random() > 0.995) {
            win.material.color.set(Utils.randomNeonColor());
          }
        });
      }
    });

    // Update camera and controls
    this.controls.update()

    // Render scene
    this.composer.render()
  },

  // Handle window resize
  onWindowResize: function () {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    if (this.composer) {
      this.composer.setSize(window.innerWidth, window.innerHeight)
    }
  },

  // Add building spotlight
  addBuildingSpotlight: function (building, theme) {
    try {
      const intensity = Utils.random(0.5, 1.5)
      const distance = 100
      const decay = 2
      const angle = Math.PI / 6

      // Create spotlight
      const spotLight = new this.THREE.SpotLight(theme.spotlightColor, intensity, distance, angle, decay)
      spotLight.position.set(
        building.position.x + Utils.random(-5, 5),
        building.position.y + Utils.random(10, 20),
        building.position.z + Utils.random(-5, 5)
      )
      spotLight.target = new this.THREE.Object3D()
      spotLight.target.position.copy(building.position)
      this.scene.add(spotLight)
      this.scene.add(spotLight.target)

      // Create light beam geometry
      const beamGeometry = new this.THREE.CylinderGeometry(0.1, 0.5, 1, 8, 1)
      const beamMaterial = new this.THREE.MeshBasicMaterial({
        color: theme.spotlightColor,
        transparent: true,
        opacity: 0.5,
      })
      const lightBeam = new this.THREE.Mesh(beamGeometry, beamMaterial)
      lightBeam.position.copy(spotLight.position)
      lightBeam.rotation.x = -Math.PI / 2
      this.scene.add(lightBeam)

      // Animate light beam
      const animateBeam = () => {
        const time = performance.now() * 0.001
        lightBeam.scale.y = 1 + Math.sin(time * 2) * 0.2
        requestAnimationFrame(animateBeam)
      }
      animateBeam()

      return spotLight
    } catch (error) {
      console.error("Failed to add building spotlight:", error)
    }
  },

  // Create dance floor
  createDanceFloor: function (theme) {
    const geometry = new this.THREE.CircleGeometry(50, 32)
    const material = new this.THREE.MeshStandardMaterial({
      color: theme.floorColor,
      roughness: 0.5,
      metalness: 0.5,
    })
    this.floorMesh = new this.THREE.Mesh(geometry, material)
    this.floorMesh.rotation.x = -Math.PI / 2
    this.scene.add(this.floorMesh)
  },

  // Create sky dome
  createSkyDome: function (theme) {
    const geometry = new this.THREE.SphereGeometry(500, 32, 32)
    const material = new this.THREE.MeshBasicMaterial({
      color: theme.skyColor,
      side: this.THREE.BackSide,
    })
    this.skyMesh = new this.THREE.Mesh(geometry, material)
    this.scene.add(this.skyMesh)
  },

  // Create particle system
  createParticles: function (theme) {
    const particleCount = 1000
    const particles = new this.THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      positions.set([
        (Math.random() - 0.5) * 2000,
        Math.random() * 2000,
        (Math.random() - 0.5) * 2000,
      ], i * 3)

      colors.set([
        Math.random(),
        Math.random(),
        Math.random(),
      ], i * 3)
    }

    particles.setAttribute('position', new this.THREE.BufferAttribute(positions, 3))
    particles.setAttribute('color', new this.THREE.BufferAttribute(colors, 3))

    const material = new this.THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
    })

    this.particles = new this.THREE.Points(particles, material)
    this.scene.add(this.particles)
  },

  // Create buildings
  createBuildings: function (theme) {
    const buildingCount = 100
    const buildings = new this.THREE.Group()

    for (let i = 0; i < buildingCount; i++) {
      const height = Math.random() * 100 + 10
      const width = Math.random() * 10 + 5
      const depth = Math.random() * 10 + 5

      const geometry = new this.THREE.BoxGeometry(width, height, depth)
      const material = new this.THREE.MeshStandardMaterial({
        color: theme.buildingColor,
        roughness: 0.7,
        metalness: 0.3,
      })

      const building = new this.THREE.Mesh(geometry, material)

      // Position building randomly in the scene
      building.position.set(
        (Math.random() - 0.5) * 2000,
        height / 2,
        (Math.random() - 0.5) * 2000
      )

      // Add building to group
      buildings.add(building)

      // --- Add window lights ---
      const windowCount = Math.floor(Math.random() * 10) + 5
      const windowGeometry = new this.THREE.PlaneGeometry(1, 2)
      const windowMaterial = new this.THREE.MeshBasicMaterial({
        color: theme.windowColor,
        transparent: true,
        opacity: 0.8,
      })

      const windows = new this.THREE.Group()
      for (let j = 0; j < windowCount; j++) {
        const windowMesh = new this.THREE.Mesh(windowGeometry, windowMaterial)

        // Position window randomly on the building facade
        windowMesh.position.set(
          Utils.random(-width / 2 + 0.5, width / 2 - 0.5),
          Utils.random(0, height),
          depth / 2 + 0.01
        )

        // Add window to group
        windows.add(windowMesh)
      }

      // Assign window group to building userData
      building.userData.windowLights = windows.children

      // Add windows to building
      this.scene.add(windows)
    }

    this.buildings.push(...buildings.children)
    this.scene.add(buildings)
  },

  // Animate function
  animate: function () {
    requestAnimationFrame(() => this.animate())

    // Update objects
    this.updateObjects()
  },
}

// Initialize and animate the scene
RaveCityScene.init()
RaveCityScene.animate()
