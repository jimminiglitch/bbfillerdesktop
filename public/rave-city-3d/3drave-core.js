// 3D Rave City - Core System
// Main application structure and initialization

// Main RaveCity object
const RaveCity = {
  // Configuration and state
  config: {
    density: 60,
    movementSpeed: 2.0,
    flyingEnabled: true,
    visualTheme: "rave",
    audioReactive: true,
    volume: 0.7,
    bassImpact: 1.5,
    audioTrack: "melodic-techno",
    randomizeTracks: true,
    trippyLevel: 1.0,
    glitchIntensity: 0.15,
    colorShiftSpeed: 1.0,
    bloomEnabled: true,
    showDancers: true,
    dancerCount: 100,
    regularPeopleCount: 50,
    showBuildings: true,
    buildingCount: 200,
    showSkyObjects: true,
    skyObjectCount: 100,
    showLasers: true,
    laserCount: 50,
    showSmoke: true,
    smokeCount: 8,
    isMobile: false,
    showFps: false,
    quality: "medium",
    mouseSensitivity: 1.0,
    performanceMode: false,
    autoDetectPerformance: true,
  },

  // Visual themes
  visualThemes: {
    rave: {
      name: "RAVE MADNESS",
      fogColor: 0x000022,
      particleColor1: 0xff00ff,
      particleColor2: 0x00ffff,
      gridColor: 0xffff00,
      buildingColor1: 0xff00ff,
      buildingColor2: 0x00ffff,
      skyColor: 0x000033,
      bloomStrength: 1.2,
      bloomRadius: 0.7,
      bloomThreshold: 0.1,
    },
    hyperspace: {
      name: "HYPERSPACE",
      fogColor: 0x000033,
      particleColor1: 0xff00ff,
      particleColor2: 0x00ffff,
      gridColor: 0xffff00,
      buildingColor1: 0x8800ff,
      buildingColor2: 0x0088ff,
      skyColor: 0x000066,
      bloomStrength: 1.0,
      bloomRadius: 0.6,
      bloomThreshold: 0.2,
    },
    vaporwave: {
      name: "VAPORWAVE",
      fogColor: 0x551a8b,
      particleColor1: 0xff71ce,
      particleColor2: 0x01cdfe,
      gridColor: 0x05ffa1,
      buildingColor1: 0xff71ce,
      buildingColor2: 0x05ffa1,
      skyColor: 0x2d1b4e,
      bloomStrength: 0.8,
      bloomRadius: 0.4,
      bloomThreshold: 0.3,
    },
    cyberpunk: {
      name: "CYBERPUNK",
      fogColor: 0x0a001a,
      particleColor1: 0xff3c6f,
      particleColor2: 0x00f9ff,
      gridColor: 0xffff00,
      buildingColor1: 0xff3c6f,
      buildingColor2: 0x00f9ff,
      skyColor: 0x0a001a,
      bloomStrength: 1.5,
      bloomRadius: 0.5,
      bloomThreshold: 0.1,
    },
    neon: {
      name: "NEON DREAMS",
      fogColor: 0x000000,
      particleColor1: 0xff00ff,
      particleColor2: 0x00ffff,
      gridColor: 0x00ff00,
      buildingColor1: 0xff00ff,
      buildingColor2: 0x00ffff,
      skyColor: 0x000000,
      bloomStrength: 1.8,
      bloomRadius: 0.8,
      bloomThreshold: 0.1,
    },
  },

  // Audio tracks
  audioTracks: {
    "melodic-techno": {
      url: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/melodic-techno-03-extended-version-moogify-9867.mp3",
      title: "Melodic Techno",
    },
    "berlin-techno": {
      url: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/berlin-techno-106820.mp3?v=1747327926985",
      title: "Berlin Techno",
    },
    "dopetronic-echoes": {
      url: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/dopetronic-echoes-from-nowhere-original-mix-gift-track-321994.mp3?v=1747327850182",
      title: "Dopetronic - Echoes From Nowhere",
    },
    "unknown-planet": {
      url: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/unknown-planet-driving-techno-music-312478.mp3?v=1747327934012",
      title: "Unknown Planet - Driving Techno",
    },
    "acid-house": {
      url: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/acid-house-loop-3-21579.mp3?v=1747327934012",
      title: "Acid House Loop",
    },
    "future-bass": {
      url: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/future-bass-royalty-free-music-167020.mp3?v=1747327934012",
      title: "Future Bass",
    },
  },

  // Character models
  characterModels: [
    {
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3draverchick-na0XM6lySSJBjcumHMRzgv3JsBTV92.png",
      type: "dancer",
    },
    {
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3draverchick2-zXawm0m0FDaBOPSFG2KLOS6FwtXcCq.png",
      type: "dancer",
    },
    {
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3draverchick3-lFGKfSqBGaisScx5fLRnftI8WsH1xs.png",
      type: "dancer",
    },
    {
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3draverchick4-uSsyDtwf9gi3YSOAwqDBS1Bt5so1wc.png",
      type: "dancer",
    },
    {
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3draverchick5-dDcfUirnItjfpzeGtghohH5jJrUDst.png",
      type: "dancer",
    },
    {
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3draverdude-LXE8FhxV5y5N8RYYvo6nuXM0PYwbed.png",
      type: "dancer",
    },
    {
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3draverdude2-p8Jj5UB6eDsvQooZwrxEvBxCcLvO5q.png",
      type: "dancer",
    },
    {
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3draverdude3-TON5jyJdrMmv5Fp3lVnXiIbkEe38zj.png",
      type: "regular",
    },
    {
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3draverdude4-SWHkVcJdY6rPzOYPgZhHVeod2KI7mg.png",
      type: "regular",
    },
  ],

  // DOM Elements
  elements: {},

  // Movement state
  movement: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    speed: 0.15,
    velocity: typeof THREE !== "undefined" ? new THREE.Vector3() : null,
    direction: new THREE.Vector3(),
    pointerLocked: false,
  },

  // Animation state
  animationFrameId: null,
  time: 0,
  lastTime: 0,
  fps: 0,
  frameCount: 0,
  lastFpsUpdate: 0,

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

  // Initialize the application
  init: function () {
    try {
      console.log("Initializing 3D Rave City...");
      this.setupEnvironment();
      this.loadDependenciesAndInitialize();
    } catch (error) {
      console.error("Initialization error:", error);
      this.showError(`Initialization error: ${error.message}`);
    }
  ,

  // Setup environment (DOM elements, mobile check, loading screen)
  setupEnvironment: function () {
    this.getElements();
    this.checkMobile();
    this.initLoadingScreen();
  },

  // Load dependencies and initialize the scene
  loadDependenciesAndInitialize: function () {
    this.loadDependencies()
      .then(() => {
        console.log("Dependencies loaded successfully");
        this.initializeSceneComponents();
      })
      .catch((error) => {
        console.error("Failed to load dependencies:", error);
        this.showError(`Failed to load dependencies: ${error.message}`);
      });
  },

  // Initialize scene components
  initializeSceneComponents: function () {
    this.initScene();
    this.initAudio();
    this.initControls();
    this.startAnimationLoop();
  },

  // Start animation loop and handle controls info
  startAnimationLoop: function () {
    this.animate();
    setTimeout(() => {
      if (!this.movement.pointerLocked) {
        this.elements.controlsInfo.style.display = "none";
      }
    }, 3000);
  },

  // Get DOM elements
  getElements: function () {
    this.elements = {
      loadingScreen: document.getElementById("loading-screen"),
      loadingText: document.getElementById("loading-text"),
      progressFill: document.getElementById("progress-fill"),
      progressPercent: document.getElementById("progress-percent"),
      sceneCanvas: document.getElementById("scene-canvas"),
      audioVisualizer: document.getElementById("audio-visualizer"),
      trackInfo: document.getElementById("track-info"),
      audioStatus: document.getElementById("audio-status"),
      errorMessage: document.getElementById("error-message"),
      controlsInfo: document.getElementById("controls-info"),
      themeIndicator: document.getElementById("theme-indicator"),
      themeButton: document.getElementById("theme-button"),
      trackButton: document.getElementById("track-button"),
      trackSelector: document.getElementById("track-selector"),
      audioButton: document.getElementById("audio-button"),
      fullscreenButton: document.getElementById("fullscreen-button"),
      helpButton: document.getElementById("help-button"),
      settingsButton: document.getElementById("settings-button"),
      settingsPanel: document.getElementById("settings-panel"),
      settingsApply: document.getElementById("settings-apply"),
      settingsClose: document.getElementById("settings-close"),
      performanceIndicator: document.getElementById("performance-indicator"),
      performanceMode: document.getElementById("performance-mode"),
    }

    // Canvas contexts
    this.visualizerCtx = this.elements.audioVisualizer.getContext("2d")
  },

  // Check if device is mobile
  checkMobile: function () {
    this.config.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    if (this.config.isMobile) {
      // Reduce quality for mobile
      this.config.quality = "low"
      this.applyQualitySettings("low")
    }

    // Auto-detect performance
    if (this.config.autoDetectPerformance) {
      this.detectPerformance()
    }
  },

  detectPerformance: function () {
    // Check for low-end devices
    const isLowEndDevice = () => {
      // Check CPU cores
      const cpuCores = navigator.hardwareConcurrency || 2;

      // Check memory (if available)
      const lowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;

      // Check if device is mobile
      const isMobile = this.config.isMobile;

      return cpuCores <= 2 || lowMemory || isMobile;
    };

    if (isLowEndDevice()) {
      console.log("Low-end device detected, enabling performance mode");
      this.config.performanceMode = true;
      this.config.quality = "ultra-low";
      this.applyQualitySettings("ultra-low");
      this.elements.performanceMode.style.display = "block";
    }
  },
  },

  // Apply quality settings
  applyQualitySettings: function (quality) {
    switch (quality) {
      case "ultra-low":
        this.config.density = 10
        this.config.dancerCount = 15
        this.config.regularPeopleCount = 5
        this.config.skyObjectCount = 10
        this.config.buildingCount = 20
        this.config.laserCount = 5
        this.config.showSmoke = false
        this.config.bloomEnabled = false
        this.config.showSkyObjects = false
        break
      case "low":
        this.config.density = 20
        this.config.dancerCount = 30
        this.config.regularPeopleCount = 15
        this.config.skyObjectCount = 30
        this.config.buildingCount = 50
        this.config.laserCount = 15
        this.config.showSmoke = false
        this.config.bloomEnabled = false
        break
      case "medium":
        this.config.density = 40
        this.config.dancerCount = 60
        this.config.regularPeopleCount = 30
        this.config.skyObjectCount = 60
        this.config.buildingCount = 100
        this.config.laserCount = 30
        this.config.showSmoke = true
        this.config.bloomEnabled = true
        break
      case "high":
        this.config.density = 60
        this.config.dancerCount = 100
        this.config.regularPeopleCount = 50
        this.config.skyObjectCount = 100
        this.config.buildingCount = 150
        this.config.laserCount = 50
        this.config.showSmoke = true
        this.config.bloomEnabled = true
        break
      case "ultra":
        this.config.density = 100
        this.config.dancerCount = 150
        this.config.regularPeopleCount = 75
        this.config.skyObjectCount = 150
        this.config.buildingCount = 200
        this.config.laserCount = 80
        this.config.showSmoke = true
        this.config.bloomEnabled = true
        break
    }
  },

  // Initialize loading screen
  initLoadingScreen: function () {
    // Glitch text effect
    setInterval(() => {
      if (Math.random() > 0.6) {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|:<>?"
        let glitched = ""
        const originalText = "INITIALIZING NEURAL INTERFACE"

        for (let i = 0; i < originalText.length; i++) {
          if (Math.random() > 0.7) {
            glitched += characters.charAt(Math.floor(Math.random() * characters.length))
          } else {
            glitched += originalText[i]
          }
        }

        this.elements.loadingText.textContent = glitched
      } else {
        this.elements.loadingText.textContent = "INITIALIZING NEURAL INTERFACE"
      }
    }, 80)
  },

  // Load dependencies
  loadDependencies: function () {
    return new Promise((resolve, reject) => {
      // Preload character textures
      this.preloadCharacterTextures()
        .then(() => {
          // Simulate loading progress
          let progress = 0
          const interval = setInterval(() => {
            progress += Math.random() * 10
            if (progress >= 100) {
              progress = 100
              clearInterval(interval)
              resolve()
            }
            this.elements.progressFill.style.width = `${progress}%`
            this.elements.progressPercent.textContent = `${Math.round(progress)}%`
          }, 150)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  // Preload character textures
  preloadCharacterTextures: function () {
    return new Promise((resolve, reject) => {
      const textureLoader = new THREE.TextureLoader()
      const totalTextures = this.characterModels.length
      let loadedTextures = 0

      this.characterModels.forEach((model, index) => {
        textureLoader.load(
          model.url,
          (texture) => {
            texture.crossOrigin = "anonymous"
            this.characterTextures[index] = texture

            // Create material
            const material = new THREE.SpriteMaterial({
              map: texture,
              transparent: true,
            })
            this.characterMaterials[index] = material

            loadedTextures++
            if (loadedTextures === totalTextures) {
              resolve()
            }
          },
          undefined,
          (error) => {
            console.error("Error loading character texture:", error)
            reject(error)
          },
        )
      })
    })
  },

  // Show error message
  showError: function (message) {
    console.error(message)
    this.elements.errorMessage.textContent = message
    this.elements.errorMessage.style.display = "block"
  },

  // Animate the scene
  animate: function () {
    this.animationFrameId = requestAnimationFrame(() => this.animate())

    // Get delta time
    const deltaTime = this.clock.getDelta()
    this.time += deltaTime

    // Update movement
    this.updateMovement(deltaTime)

    // Update objects
    this.updateObjects(deltaTime)

    this.checkProceduralGeneration()

    // Update audio visualizer
    if (this.config.audioReactive && this.isPlaying) {
      this.updateAudioVisualizer()
    }

    // Render the scene
    this.render()

    // Update FPS counter
    this.updateFps(deltaTime)
  },

  // Update movement
  updateMovement: function (deltaTime) {
    // Only apply movement if pointer is locked
    if (!this.movement.pointerLocked) return

    // Get camera direction
    this.camera.getWorldDirection(this.movement.direction)

    // Reset velocity
    this.movement.velocity.x = 0
    this.movement.velocity.z = 0
    this.movement.velocity.y = 0

    // Calculate movement speed with delta time
    const speed = this.movement.speed * this.config.movementSpeed * deltaTime * 60

    // Forward/backward
    if (this.movement.forward) {
      this.movement.velocity.x += this.movement.direction.x * speed
      this.movement.velocity.z += this.movement.direction.z * speed
    }
    if (this.movement.backward) {
      this.movement.velocity.x -= this.movement.direction.x * speed
      this.movement.velocity.z -= this.movement.direction.z * speed
    }

    // Left/right (strafe)
    if (this.movement.left) {
      this.movement.velocity.x += this.movement.direction.z * speed
      this.movement.velocity.z -= this.movement.direction.x * speed
    }
    if (this.movement.right) {
      this.movement.velocity.x -= this.movement.direction.z * speed
      this.movement.velocity.z += this.movement.direction.x * speed
    }

    // Up/down (flying)
    if (this.config.flyingEnabled) {
      if (this.movement.up) {
        this.movement.velocity.y += speed
      }
      if (this.movement.down) {
        this.movement.velocity.y -= speed
      }
    }

    // Apply velocity to camera position
    this.camera.position.x += this.movement.velocity.x
    this.camera.position.z += this.movement.velocity.z
    this.camera.position.y += this.movement.velocity.y

    // Prevent going below the floor
    if (this.camera.position.y < 0) {
      this.camera.position.y = 0
    }
  },

  // Update FPS counter
  updateFps: function (deltaTime) {
    this.frameCount++
    const now = performance.now()
    if (now - this.lastFpsUpdate >= 1000) {
      this.fps = Math.round(this.frameCount / ((now - this.lastFpsUpdate) / 1000))
      this.frameCount = 0
      this.lastFpsUpdate = now

      if (this.config.showFps) {
        this.elements.performanceIndicator.textContent = `FPS: ${this.fps}`
        this.elements.performanceIndicator.style.display = "block"
      } else {
        this.elements.performanceIndicator.style.display = "none"
      }
    }
  },

  // Render the scene
  render: function () {
    if (this.composer && !this.config.performanceMode) {
      this.composer.render()
    } else {
      this.renderer.render(this.scene, this.camera)
    }
  },

  // Handle window resize
  onWindowResize: function () {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(window.innerWidth, window.innerHeight)
    if (this.config.performanceMode) {
      this.renderer.setPixelRatio(1)
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    if (this.composer && !this.config.performanceMode) {
      this.composer.setSize(window.innerWidth, window.innerHeight)
    }
  },

  // Initialize controls
  initControls: function () {
    // Pointer lock
    document.body.addEventListener("click", () => {
      this.controls.lock()
    })

    document.addEventListener("pointerlockchange", () => {
      this.movement.pointerLocked = document.pointerLockElement === document.body
      this.elements.controlsInfo.style.display = this.movement.pointerLocked ? "none" : "block"
    })

    // Keyboard controls
    document.addEventListener("keydown", (event) => {
      switch (event.code) {
        case "KeyW":
          this.movement.forward = true
          break
        case "KeyS":
          this.movement.backward = true
          break
        case "KeyA":
          this.movement.left = true
          break
        case "KeyD":
          this.movement.right = true
          break
        case "Space":
          this.movement.up = true
          break
        case "ShiftLeft":
          this.movement.down = true
          break
        case "Escape":
          this.controls.unlock()
          break
        case "KeyF":
          this.toggleFullscreen()
          break
        case "KeyM":
          this.toggleAudio()
          break
        case "KeyT":
          this.changeTheme()
          break
        case "KeyN":
          this.playNextTrack()
          break
        case "KeyP":
          this.toggleSettings()
          break
        case "KeyH":
          this.toggleControlsInfo()
          break
      }
    })

    document.addEventListener("keyup", (event) => {
      switch (event.code) {
        case "KeyW":
          this.movement.forward = false
          break
        case "KeyS":
          this.movement.backward = false
          break
        case "KeyA":
          this.movement.left = false
          break
        case "KeyD":
          this.movement.right = false
          break
        case "Space":
          this.movement.up = false
          break
        case "ShiftLeft":
          this.movement.down = false
          break
      }
    })

    // Button controls
    this.elements.fullscreenButton.addEventListener("click", () => this.toggleFullscreen())
    this.elements.themeButton.addEventListener("click", () => this.changeTheme())
    this.elements.trackButton.addEventListener("click", () => this.toggleTrackSelector())
    this.elements.audioButton.addEventListener("click", () => this.toggleAudio())
    this.elements.helpButton.addEventListener("click", () => this.toggleControlsInfo())
    this.elements.settingsButton.addEventListener("click", () => this.toggleSettings())
    this.elements.settingsApply.addEventListener("click", () => this.applySettings())
    this.elements.settingsClose.addEventListener("click", () => this.toggleSettings())

    // Track selector
    this.populateTrackSelector()

    // Theme indicator
    this.updateThemeIndicator()

    // Initialize settings panel values
    this.initSettingsPanel()
  },

  // Initialize settings panel
  initSettingsPanel: function () {
    // Set initial values based on config
    document.getElementById("quality-setting").value = this.config.quality
    document.getElementById("density-setting").value = this.config.density
    document.getElementById("fps-setting").checked = this.config.showFps
    document.getElementById("bloom-setting").value = this.visualThemes[this.config.visualTheme].bloomStrength
    document.getElementById("glitch-setting").value = this.config.glitchIntensity
    document.getElementById("color-shift-setting").value = this.config.colorShiftSpeed
    document.getElementById("volume-setting").value = this.config.volume
    document.getElementById("bass-setting").value = this.config.bassImpact
    document.getElementById("random-tracks-setting").checked = this.config.randomizeTracks
    document.getElementById("movement-speed-setting").value = this.config.movementSpeed
    document.getElementById("flying-setting").checked = this.config.flyingEnabled
    document.getElementById("sensitivity-setting").value = this.config.mouseSensitivity
  },

  // Toggle fullscreen
  toggleFullscreen: function () {
    if (document.fullscreenElement) {
      document.exitFullscreen()
      this.elements.fullscreenButton.classList.remove("active")
    } else {
      document.body.requestFullscreen()
      this.elements.fullscreenButton.classList.add("active")
    }
  },

  // Change theme
  changeTheme: function () {
    const themeNames = Object.keys(this.visualThemes)
    const currentThemeIndex = themeNames.indexOf(this.config.visualTheme)
    const nextThemeIndex = (currentThemeIndex + 1) % themeNames.length
    this.config.visualTheme = themeNames[nextThemeIndex]

    // Update theme
    this.updateTheme()
  },

  // Update theme indicator
  updateThemeIndicator: function () {
    this.elements.themeIndicator.textContent = this.visualThemes[this.config.visualTheme].name
    this.elements.themeIndicator.classList.add("fade-in")
    this.elements.themeIndicator.style.opacity = 1

    setTimeout(() => {
      this.elements.themeIndicator.classList.remove("fade-in")
      this.elements.themeIndicator.classList.add("fade-out")
      setTimeout(() => {
        this.elements.themeIndicator.classList.remove("fade-out")
        this.elements.themeIndicator.style.opacity = 0
      }, 500)
    }, 3000)
  },

  // Toggle track selector
  toggleTrackSelector: function () {
    this.elements.trackSelector.style.display = this.elements.trackSelector.style.display === "none" ? "block" : "none"

    if (this.elements.trackSelector.style.display === "block") {
      this.elements.trackButton.classList.add("active")
    } else {
      this.elements.trackButton.classList.remove("active")
    }
  },

  // Toggle controls info
  toggleControlsInfo: function () {
    this.elements.controlsInfo.style.display = this.elements.controlsInfo.style.display === "none" ? "block" : "none"

    if (this.elements.controlsInfo.style.display === "block") {
      this.elements.helpButton.classList.add("active")
    } else {
      this.elements.helpButton.classList.remove("active")
    }
  },

  // Toggle settings
  toggleSettings: function () {
    this.elements.settingsPanel.style.display = this.elements.settingsPanel.style.display === "none" ? "block" : "none"

    if (this.elements.settingsPanel.style.display === "block") {
      this.elements.settingsButton.classList.add("active")
    } else {
      this.elements.settingsButton.classList.remove("active")
    }
  },

  // Apply settings
  applySettings: function () {
    // Get settings values
    const quality = document.getElementById("quality-setting").value
    const density = document.getElementById("density-setting").value
    const showFps = document.getElementById("fps-setting").checked
    const bloomIntensity = document.getElementById("bloom-setting").value
    const glitchIntensity = document.getElementById("glitch-setting").value
    const colorShiftSpeed = document.getElementById("color-shift-setting").value
    const volume = document.getElementById("volume-setting").value
    const bassImpact = document.getElementById("bass-setting").value
    const randomizeTracks = document.getElementById("random-tracks-setting").checked
    const movementSpeed = document.getElementById("movement-speed-setting").value
    const flyingEnabled = document.getElementById("flying-setting").checked
    const sensitivity = document.getElementById("sensitivity-setting").value

    // Apply settings
    this.config.quality = quality
    this.applyQualitySettings(quality)
    this.config.density = density
    this.config.showFps = showFps
    this.config.volume = volume
    this.config.bassImpact = bassImpact
    this.config.randomizeTracks = randomizeTracks
    this.config.movementSpeed = movementSpeed
    this.config.flyingEnabled = flyingEnabled
    this.config.mouseSensitivity = sensitivity

    // Apply audio settings
    this.setVolume(volume)

    // Apply visual effects settings
    this.config.glitchIntensity = glitchIntensity
    this.config.colorShiftSpeed = colorShiftSpeed

    if (this.bloomPass && !this.config.performanceMode) {
      this.bloomPass.strength = bloomIntensity
    }

    // Update scene objects
    this.updateScene()

    // Toggle settings panel
    this.toggleSettings()
  },

  // Update scene
  updateScene: function () {
    // Clear scene
    this.clearScene()

    // Create scene objects
    this.createSceneObjects()
  },

  // Clear scene
  clearScene: function () {
    // Remove all objects from the scene
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0])
    }

    // Dispose of geometries and materials
    if (this.particles) this.particles.geometry.dispose()
    if (this.particles) this.particles.material.dispose()
    if (this.floorMesh) this.floorMesh.geometry.dispose()
    if (this.floorMesh) this.floorMesh.material.dispose()
    if (this.skyMesh) this.skyMesh.geometry.dispose()
    if (this.skyMesh) this.skyMesh.material.dispose()

    this.characters.forEach((character) => {
      if (character.material) character.material.dispose()
    })

    this.buildings.forEach((building) => {
      building.geometry.dispose()
      building.material.dispose()
    })

    this.lasers.forEach((laser) => {
      laser.geometry.dispose()
      laser.material.dispose()
    })

    this.smokeMachines.forEach((smoke) => {
      smoke.geometry.dispose()
      smoke.material.dispose()
    })

    this.zones.forEach((zone) => {
      zone.geometry.dispose()
      zone.material.dispose()
    })

    this.characters = []
    this.buildings = []
    this.lasers = []
    this.smokeMachines = []
    this.zones = []
  },

  // Populate track selector
  populateTrackSelector: function () {
    const trackNames = Object.keys(this.audioTracks)

    // Clear existing options
    while (this.elements.trackSelector.children.length > 1) {
      this.elements.trackSelector.removeChild(this.elements.trackSelector.lastChild)
    }

    trackNames.forEach((trackName) => {
      const track = this.audioTracks[trackName]
      const trackOption = document.createElement("div")
      trackOption.className = "track-option"
      trackOption.textContent = track.title
      trackOption.dataset.track = trackName

      if (trackName === this.config.audioTrack) {
        trackOption.classList.add("active")
      }

      trackOption.addEventListener("click", () => {
        this.config.audioTrack = trackName
        this.loadAudioTrack(trackName)
        this.toggleTrackSelector()

        // Update active state
        document.querySelectorAll(".track-option").forEach((option) => {
          option.classList.remove("active")
        })
        trackOption.classList.add("active")
      })

      this.elements.trackSelector.appendChild(trackOption)
    })
  },
}

// Initialize Three.js
import * as THREE from "three"

// Initialize RaveCity when the page loads
window.onload = () => {
  RaveCity.init()
}
