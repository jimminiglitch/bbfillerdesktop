/**
 * 3D Rave City - Immersive Party Experience
 * A complete rewrite with improved UX/UI and better loading
 */

// Main RaveCity object
const RaveCity = {
  // Configuration
  config: {
    // Core settings
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

    // Performance settings
    showFps: false,
    quality: "medium",
    autoOptimize: true,
    mouseSensitivity: 1.0,

    // Dancer settings
    dancerCount: 100,
    regularPeopleCount: 50,
    dancerDetail: "medium",

    // World settings
    showBuildings: true,
    buildingCount: 200,
    showSkyObjects: true,
    skyObjectCount: 100,
    showLasers: true,
    laserCount: 50,
    showSmoke: true,
    smokeCount: 8,

    // System detection
    isMobile: false,
    performanceMode: false,
  },

  // Base URL for audio assets
  audioBaseUrl: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8",

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
      url: `${RaveCity.config.audioBaseUrl}/melodic-techno-03-extended-version-moogify-9867.mp3`,
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
    "techno-pulse": {
      url: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/techno-pulse-127292.mp3?v=1747327934012",
      title: "Techno Pulse",
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
    velocity: new THREE.Vector3(),
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

  // Audio state
  audioContext: null,
  audioSource: null,
  audioAnalyser: null,
  frequencyData: null,
  audioElement: null,
  isPlaying: false,
  audioLoaded: false,

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
      console.log("Initializing 3D Rave City...")

      // Get DOM elements
      this.getElements()

      // Check if device is mobile
      this.checkMobile()

      // Initialize loading screen
      this.initLoadingScreen()

      // Load dependencies
      this.loadDependencies()
        .then(() => {
          console.log("Dependencies loaded successfully")

          // Initialize scene
          this.initScene()

          // Initialize audio
          this.initAudio()

          // Initialize UI
          this.initUI()

          // Start animation loop
          this.animate()

          // Hide loading screen
          setTimeout(() => {
            document.getElementById("loading-screen").style.opacity = "0"
            setTimeout(() => {
              document.getElementById("loading-screen").style.display = "none"
            }, 500)
          }, 1000)
        })
        .catch((error) => {
          console.error("Failed to load dependencies:", error)
          this.showError(`Failed to load dependencies: ${error.message}`)
        })
    } catch (error) {
      console.error("Initialization error:", error)
      this.showError(`Initialization error: ${error.message}`)
    }
  },

  // Get DOM elements
  getElements: function () {
    this.elements = {
      // Main elements
      loadingScreen: document.getElementById("loading-screen"),
      loadingText: document.getElementById("loading-text"),
      progressFill: document.getElementById("progress-fill"),
      progressPercent: document.getElementById("progress-percent"),
      sceneCanvas: document.getElementById("scene-canvas"),

      // UI elements
      audioVisualizer: document.getElementById("audio-visualizer"),
      trackInfo: document.getElementById("track-info"),
      audioStatus: document.getElementById("audio-status"),
      themeIndicator: document.getElementById("theme-indicator"),
      fpsCounter: document.getElementById("fps-counter"),
      performanceMode: document.getElementById("performance-mode"),
      controlsInfo: document.getElementById("controls-info"),
      settingsPanel: document.getElementById("settings-panel"),
      trackSelector: document.getElementById("track-selector"),
      trackList: document.getElementById("track-list"),
      errorMessage: document.getElementById("error-message"),

      // Buttons
      fullscreenButton: document.getElementById("fullscreen-button"),
      settingsButton: document.getElementById("settings-button"),
      themeButton: document.getElementById("theme-button"),
      trackButton: document.getElementById("track-button"),
      audioButton: document.getElementById("audio-button"),
      helpButton: document.getElementById("help-button"),
      settingsApply: document.getElementById("settings-apply"),
      settingsClose: document.getElementById("settings-close"),
      settingsReset: document.getElementById("settings-reset"),
      closeControls: document.getElementById("close-controls"),
      closeTracks: document.getElementById("close-tracks"),
    }

    // Canvas contexts
    this.visualizerCtx = this.elements.audioVisualizer.getContext("2d")
  },

  // Check if device is mobile
  checkMobile: function () {
    // Use user agent to detect mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    this.config.isMobile = isMobile

    if (this.config.isMobile) {
      // Reduce quality for mobile
      this.config.quality = "low"
      this.applyQualitySettings("low")
    }

    // Auto-detect performance
    if (this.config.autoOptimize) {
      this.detectPerformance()
    }
  },

  // Detect performance capabilities
  detectPerformance: function () {
    // Check for low-end devices
    const isLowEndDevice = () => {
      // Check CPU cores
      const cpuCores = navigator.hardwareConcurrency || 2

      // Check memory (if available)
      let lowMemory = false
      if (navigator.deviceMemory) {
        lowMemory = navigator.deviceMemory < 4
      }

      // Check if device is mobile
      const isMobile = this.config.isMobile

      let lowGPU = false
      try {
        const canvas = document.createElement("canvas")
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
        if (gl) {
          const debugInfo = gl.getExtension("WEBGL_debug_renderer_info")
          if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
            // Check for known low-end GPU indicators
            lowGPU = /(intel|hd graphics|llvmpipe|swiftshader|microsoft basic)/i.test(renderer)
          } else {
            // Extension not available, assume not low-end
            lowGPU = false
          }
        }
      } catch (e) {
        lowGPU = false
      }

      return cpuCores <= 2 || lowMemory || (isMobile && lowGPU)
    }

    if (isLowEndDevice()) {
      console.log("Low-end device detected, enabling performance mode")
      this.config.performanceMode = true
      this.config.quality = "low"
      this.applyQualitySettings("low")
      this.elements.performanceMode.classList.remove("hidden")
    }
  },

  // Apply quality settings
  applyQualitySettings: function (quality) {
    switch (quality) {
      case "low":
        this.config.density = 20
        this.config.dancerCount = 30
        this.config.regularPeopleCount = 15
        this.config.skyObjectCount = 30
        this.config.buildingCount = 50
        this.config.laserCount = 15
        this.config.showSmoke = false
        this.config.bloomEnabled = false
        this.config.dancerDetail = "low"
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
        this.config.dancerDetail = "medium"
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
        this.config.dancerDetail = "medium"
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
        this.config.dancerDetail = "high"
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
      })
    })
  },

  // Initialize Three.js scene
  initScene: function () {
    try {
      console.log("Initializing 3D scene...")

      // Create scene
      this.scene = new THREE.Scene()

      // Add fog for depth
      const theme = this.visualThemes[this.config.visualTheme]
      this.scene.fog = new THREE.FogExp2(theme.fogColor, 0.008)

      // Create camera
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
      this.camera.position.set(0, 5, 20)

      // Create renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.elements.sceneCanvas,
        antialias: !this.config.performanceMode,
        alpha: true,
        powerPreference: "high-performance",
      })
      this.renderer.setSize(window.innerWidth, window.innerHeight)

      // Set pixel ratio based on performance mode
      if (this.config.performanceMode) {
        this.renderer.setPixelRatio(1)
      } else {
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      }

      // Create clock for animation
      this.clock = new THREE.Clock()

      // Create raycaster for collision detection
      this.raycaster = new THREE.Raycaster()

      // Create pointer lock controls for first-person movement
      this.controls = new THREE.PointerLockControls(this.camera, document.body)

      // Set up post-processing
      this.setupPostProcessing()

      // Create scene objects
      this.createSceneObjects()

      // Handle window resize
      window.addEventListener("resize", () => this.onWindowResize())

      console.log("3D scene initialized successfully")
    } catch (error) {
      console.error("Failed to initialize 3D scene:", error)
      this.showError(`Failed to initialize 3D scene: ${error.message}`)
    }
  },

  // Set up post-processing
  setupPostProcessing: function () {
    try {
      const theme = this.visualThemes[this.config.visualTheme]
      // Create composer
      this.composer = new THREE.EffectComposer(this.renderer)

      // Add render pass
      const renderPass = new THREE.RenderPass(this.scene, this.camera)
      // Dynamically adjust bloom pass based on resolution and performance
      const isHighResolution = window.innerWidth * window.innerHeight > 1920 * 1080 // Example threshold for high resolution
      if (this.config.bloomEnabled && !this.config.performanceMode && !isHighResolution) {
        this.bloomPass = new THREE.UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          theme.bloomStrength,
          theme.bloomRadius,
          theme.bloomThreshold,
        )
        this.composer.addPass(this.bloomPass)
      }

      // Add RGB shift pass if not in performance mode
      if (!this.config.performanceMode) {
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
        this.composer.addPass(this.glitchPass)
      }
    } catch (error) {
      console.error("Failed to set up post-processing:", error)
      this.showError(`Failed to set up post-processing: ${error.message}`)
    }
  },

  // Create scene objects
  createSceneObjects: function () {
    try {
      const theme = this.visualThemes[this.config.visualTheme]

      // Create floor (dance floor)
      this.createDanceFloor(theme)

      // Create sky dome
      this.createSkyDome(theme)

      // Create particle system
      this.createParticles(theme)

      // Create characters
      this.createCharacters(theme)

      // Create buildings
      this.createBuildings(theme)

      // Create lasers
      this.createLasers(theme)

      // Create smoke machines
      if (this.config.showSmoke && !this.config.performanceMode) {
        this.createSmokeMachines(theme)
      }

      // Create zones (different party areas)
      this.createZones(theme)

      // Set up infinite world generation
      this.setupInfiniteWorld()
    } catch (error) {
      console.error("Failed to create scene objects:", error)
      this.showError(`Failed to create scene objects: ${error.message}`)
    }
  },

  // Initialize audio system
  initAudio: function () {
    try {
      console.log("Initializing audio system...")

      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

      // Create analyser
      this.audioAnalyser = this.audioContext.createAnalyser()
      this.audioAnalyser.fftSize = 2048

      // Load audio track
      this.loadAudioTrack(this.config.audioTrack)

      // Set initial volume
      this.setVolume(this.config.volume)

      console.log("Audio system initialized successfully")
    } catch (error) {
      console.error("Failed to initialize audio:", error)
      this.showError(`Failed to initialize audio: ${error.message}`)
    }
  },

  // Initialize UI
  initUI: function () {
    // Initialize controls
    this.initControls()

    // Initialize settings panel
    this.initSettingsPanel()

    // Initialize track selector
    this.populateTrackSelector()

    // Update theme indicator
    this.updateThemeIndicator()
  },

  // Initialize controls
  initControls: function () {
    // Pointer lock
    document.body.addEventListener("click", () => {
      if (
        !this.elements.settingsPanel.classList.contains("hidden") ||
        !this.elements.trackSelector.classList.contains("hidden") ||
        !this.elements.controlsInfo.classList.contains("hidden")
      ) {
        return
      }
      this.controls.lock()
    })

    document.addEventListener("pointerlockchange", () => {
      this.movement.pointerLocked = document.pointerLockElement === document.body
    })

    // Keyboard controls
    document.addEventListener("keydown", (event) => {
      if (this.movement.pointerLocked) {
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
        }
      }

      // Global keyboard shortcuts
      switch (event.code) {
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
    this.elements.settingsReset.addEventListener("click", () => this.resetSettings())
    this.elements.closeControls.addEventListener("click", () => this.toggleControlsInfo())
    this.elements.closeTracks.addEventListener("click", () => this.toggleTrackSelector())

    // Range input value display
    document.querySelectorAll('input[type="range"]').forEach((input) => {
      const valueDisplay = input.nextElementSibling
      if (valueDisplay && valueDisplay.classList.contains("setting-value")) {
        // Set initial value
        valueDisplay.textContent = input.id === "volume-setting" ? `${Math.round(input.value * 100)}%` : input.value

        // Update on change
        input.addEventListener("input", () => {
          valueDisplay.textContent = input.id === "volume-setting" ? `${Math.round(input.value * 100)}%` : input.value
        })
      }
    })
  },

  // Initialize settings panel
  initSettingsPanel: function () {
    // Set initial values based on config
    document.getElementById("quality-setting").value = this.config.quality
    document.getElementById("density-setting").value = this.config.density
    document.getElementById("fps-setting").checked = this.config.showFps
    document.getElementById("auto-optimize-setting").checked = this.config.autoOptimize
    document.getElementById("bloom-setting").value = this.visualThemes[this.config.visualTheme].bloomStrength
    document.getElementById("glitch-setting").value = this.config.glitchIntensity
    document.getElementById("color-shift-setting").value = this.config.colorShiftSpeed
    document.getElementById("volume-setting").value = this.config.volume
    document.getElementById("bass-setting").value = this.config.bassImpact
    document.getElementById("random-tracks-setting").checked = this.config.randomizeTracks
    document.getElementById("movement-speed-setting").value = this.config.movementSpeed
    document.getElementById("flying-setting").checked = this.config.flyingEnabled
    document.getElementById("sensitivity-setting").value = this.config.mouseSensitivity
    document.getElementById("dancer-count-setting").value = this.config.dancerCount
    document.getElementById("dancer-detail-setting").value = this.config.dancerDetail
  },

  // Populate track selector
  populateTrackSelector: function () {
    const trackNames = Object.keys(this.audioTracks)

    // Clear existing options
    this.elements.trackList.innerHTML = ""

    trackNames.forEach((trackName) => {
      const track = this.audioTracks[trackName]
      const trackOption = document.createElement("div")
      trackOption.className = "track-option"
      if (trackName === this.config.audioTrack) {
        trackOption.classList.add("active")
      }

      // Create track title
      const trackTitle = document.createElement("span")
      trackTitle.className = "track-title"
      trackTitle.textContent = track.title
      trackOption.appendChild(trackTitle)

      // Create play button
      const playButton = document.createElement("span")
      playButton.className = "track-play"
      playButton.innerHTML = "▶"
      trackOption.appendChild(playButton)

      trackOption.addEventListener("click", () => {
        this.config.audioTrack = trackName
        this.loadAudioTrack(trackName)

        // Update active state
        document.querySelectorAll(".track-option").forEach((option) => {
          option.classList.remove("active")
        })
        trackOption.classList.add("active")
      })

      this.elements.trackList.appendChild(trackOption)
    })
  },

  // Animation loop
  animate: function () {
    this.animationFrameId = requestAnimationFrame(() => this.animate())

    // Get delta time
    const now = performance.now()
    const deltaTime = (now - this.lastTime) / 1000
    this.lastTime = now
    this.time += deltaTime

    // Update movement
    this.updateMovement(deltaTime)

    // Update objects
    this.updateObjects(deltaTime)

    // Check for procedural generation
    this.checkProceduralGeneration()

    // Update audio visualizer
    let audioData = null
    if (this.config.audioReactive && this.isPlaying) {
      audioData = this.updateAudioVisualizer()
    }

    // Update post-processing effects based on audio
    if (audioData && this.config.audioReactive) {
      this.updatePostProcessing(audioData)
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
        this.elements.fpsCounter.textContent = `FPS: ${this.fps}`
        this.elements.fpsCounter.style.display = "block"
      } else {
        this.elements.fpsCounter.style.display = "none"
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

    // Update theme indicator
    this.updateThemeIndicator()
  },

  // Update theme indicator
  updateThemeIndicator: function () {
    this.elements.themeIndicator.textContent = this.visualThemes[this.config.visualTheme].name
    this.elements.themeIndicator.classList.add("visible")

    setTimeout(() => {
      this.elements.themeIndicator.classList.remove("visible")
    }, 3000)
  },

  // Toggle track selector
  toggleTrackSelector: function () {
    this.elements.trackSelector.classList.toggle("hidden")
    this.elements.trackButton.classList.toggle("active", !this.elements.trackSelector.classList.contains("hidden"))
  },

  // Toggle controls info
  toggleControlsInfo: function () {
    this.elements.controlsInfo.classList.toggle("hidden")
    this.elements.helpButton.classList.toggle("active", !this.elements.controlsInfo.classList.contains("hidden"))
  },

  // Toggle settings
  toggleSettings: function () {
    this.elements.settingsPanel.classList.toggle("hidden")
    this.elements.settingsButton.classList.toggle("active", !this.elements.settingsPanel.classList.contains("hidden"))
  },

  // Apply settings
    // Get settings values
    const quality = document.getElementById("quality-setting").value
    const density = Number.parseInt(document.getElementById("density-setting").value)
    const showFps = document.getElementById("fps-setting").checked
    const autoOptimize = document.getElementById("auto-optimize-setting").checked
    const bloomIntensity = Number.parseFloat(document.getElementById("bloom-setting").value)
    const glitchIntensity = Number.parseFloat(document.getElementById("glitch-setting").value)
    const colorShiftSpeed = Number.parseFloat(document.getElementById("color-shift-setting").value)
    const volume = Number.parseFloat(document.getElementById("volume-setting").value)
    const bassImpact = Number.parseFloat(document.getElementById("bass-setting").value)
    const randomizeTracks = document.getElementById("random-tracks-setting").checked
    const movementSpeed = Number.parseFloat(document.getElementById("movement-speed-setting").value)
    const flyingEnabled = document.getElementById("flying-setting").checked
    const sensitivity = Number.parseFloat(document.getElementById("sensitivity-setting").value)
    const dancerCount = Number.parseInt(document.getElementById("dancer-count-setting").value)
    const dancerDetail = document.getElementById("dancer-detail-setting").value

    // Apply quality preset first
    this.config.quality = quality
    this.applyQualitySettings(quality)
    this.applyQualitySettings(quality)

    // Apply individual settings that override the preset
    this.config.density = density
    this.config.showFps = showFps
    this.config.autoOptimize = autoOptimize
    this.visualThemes[this.config.visualTheme].bloomStrength = bloomIntensity
    this.config.glitchIntensity = glitchIntensity
    this.config.colorShiftSpeed = colorShiftSpeed
    this.config.volume = volume
    this.config.bassImpact = bassImpact
    this.config.randomizeTracks = randomizeTracks
    this.config.movementSpeed = movementSpeed
    this.config.flyingEnabled = flyingEnabled
    this.config.mouseSensitivity = sensitivity
    this.config.dancerCount = dancerCount
    this.config.dancerDetail = dancerDetail

    // Apply audio settings
    this.setVolume(volume)

    // Update visual effects
    this.updateTheme()

    // Recreate scene objects
    this.recreateSceneObjects()

    // Toggle settings panel
    this.toggleSettings()
  },

  // Reset settings to defaults
  resetSettings: function () {
    if (confirm("Reset all settings to default values?")) {
      // Reset to medium quality
      this.config.quality = "medium"
      this.applyQualitySettings("medium")

      // Reset other settings
      this.config.showFps = false
      this.config.autoOptimize = true
      this.config.volume = 0.7
      this.config.bassImpact = 1.5
      this.config.randomizeTracks = true
      this.config.movementSpeed = 2.0
      this.config.flyingEnabled = true
      this.config.mouseSensitivity = 1.0

      // Reset theme settings
      Object.keys(this.visualThemes).forEach((theme) => {
        this.visualThemes[theme].bloomStrength =
          theme === "rave"
            ? 1.2
            : theme === "hyperspace"
              ? 1.0
              : theme === "vaporwave"
                ? 0.8
                : theme === "cyberpunk"
                  ? 1.5
                  : 1.8
      })

      // Update UI to reflect changes
      this.initSettingsPanel()

      // Apply audio settings
      this.setVolume(this.config.volume)

      // Update visual effects
      this.updateTheme()

      // Recreate scene objects
      this.recreateSceneObjects()
    }
  },

  // Recreate scene objects
  recreateSceneObjects: function () {
    // Clear scene
    while (this.scene.children.length > 0) {
      const object = this.scene.children[0]
      if (object.geometry) object.geometry.dispose()
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose())
        } else {
          object.material.dispose()
        }
      }
      this.scene.remove(object)
    }

    // Reset arrays
    this.characters = []
    this.buildings = []
    this.skyObjects = []
    this.lasers = []
    this.smokeMachines = []
    this.zones = []

    // Recreate objects
    this.createSceneObjects()
  },

  // Show error message
  showError: function (message) {
    console.error(message)
    this.elements.errorMessage.textContent = message
    this.elements.errorMessage.classList.remove("hidden")

    setTimeout(() => {
      this.elements.errorMessage.classList.add("hidden")
    }, 5000)
  },

  // Load audio track
  loadAudioTrack: function (trackName) {
    if (!this.audioTracks[trackName]) {
      console.error(`Audio track "${trackName}" not found.`)
      this.showError(`Audio track "${trackName}" not found.`)
      return
    }

    const track = this.audioTracks[trackName]
    this.elements.trackInfo.textContent = `Loading: ${track.title}`
    this.elements.audioStatus.textContent = "Loading audio..."
    this.elements.audioStatus.style.display = "block"

    fetch(track.url)
      .then((response) => response.arrayBuffer())
      .then((buffer) => this.audioContext.decodeAudioData(buffer))
      .then((audioBuffer) => {
        if (this.audioSource) {
          this.audioSource.stop()
          this.audioSource.disconnect(this.audioAnalyser)
        }

        this.audioSource = this.audioContext.createBufferSource()
        this.audioSource.buffer = audioBuffer
        this.audioSource.loop = true
        this.audioSource.connect(this.audioAnalyser)
        this.audioAnalyser.connect(this.audioContext.destination)

        this.audioSource.onended = () => {
          console.log("Track ended, playing next track")
          this.playNextTrack()
        }

        this.audioElement = track
        this.audioLoaded = true
        this.elements.trackInfo.textContent = `Now Playing: ${track.title}`
        this.elements.audioStatus.textContent = "Audio loaded, ready to play"

        if (this.isPlaying) {
          this.audioSource.start(0)
          this.elements.audioStatus.textContent = "Playing"
          this.elements.audioButton.classList.add("active")
        }

        // Hide status after a few seconds
        setTimeout(() => {
          this.elements.audioStatus.style.display = "none"
        }, 2000)
      })
      .catch((error) => {
        console.error("Failed to load audio track:", error)
        this.showError(`Failed to load audio track: ${error.message}`)
        this.elements.audioStatus.textContent = "Error loading audio"
      })
  },

  // Play audio
  playAudio: function () {
    if (!this.audioLoaded) {
      console.warn("Audio not loaded yet.")
      this.elements.audioStatus.textContent = "Audio not loaded yet"
      this.elements.audioStatus.style.display = "block"
      return
    }

    if (this.isPlaying) {
      console.log("Audio is already playing.")
      return
    }

    this.audioContext.resume().then(() => {
      this.audioSource.start(0)
      this.isPlaying = true
      this.elements.audioStatus.textContent = "Playing"
      this.elements.audioStatus.style.display = "block"
      this.elements.audioButton.classList.add("active")

      // Hide status after a few seconds
      setTimeout(() => {
        this.elements.audioStatus.style.display = "none"
      }, 2000)
    })
  },

  // Pause audio
  pauseAudio: function () {
    if (!this.isPlaying) {
      console.log("Audio is already paused.")
      return
    }

    this.audioSource.stop()
    this.isPlaying = false
    this.elements.audioStatus.textContent = "Paused"
    this.elements.audioStatus.style.display = "block"
    this.elements.audioButton.classList.remove("active")

    // Re-create audio source to allow playing again
    this.loadAudioTrack(this.config.audioTrack)
  },

  // Toggle audio
  toggleAudio: function () {
    if (this.isPlaying) {
      this.pauseAudio()
    } else {
      this.playAudio()
    }
  },

  // Set volume
  setVolume: function (volume) {
    if (!this.audioSource) return

    const gainNode = this.audioContext.createGain()
    gainNode.gain.value = volume
    this.audioSource.disconnect(this.audioContext.destination)
    this.audioSource.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
  },

  // Play next track
  playNextTrack: function () {
    if (this.config.randomizeTracks) {
      const trackNames = Object.keys(this.audioTracks)
      let nextTrack = trackNames[Math.floor(Math.random() * trackNames.length)]

      // Ensure we don't play the same track twice in a row
      if (nextTrack === this.config.audioTrack && trackNames.length > 1) {
        const newTrackIndex = (trackNames.indexOf(nextTrack) + 1) % trackNames.length
        nextTrack = trackNames[newTrackIndex]
      }

      this.config.audioTrack = nextTrack
      this.loadAudioTrack(nextTrack)
      if (this.isPlaying) {
        this.playAudio()
      }
    } else {
      // Play tracks in order
      const trackNames = Object.keys(this.audioTracks)
      const currentTrackIndex = trackNames.indexOf(this.config.audioTrack)
      const nextTrackIndex = (currentTrackIndex + 1) % trackNames.length
      this.config.audioTrack = trackNames[nextTrackIndex]
      this.loadAudioTrack(trackNames[nextTrackIndex])
      if (this.isPlaying) {
        this.playAudio()
      }
    }

    // Update active state in track selector
    document.querySelectorAll(".track-option").forEach((option) => {
      option.classList.remove("active")
      if (option.querySelector(".track-title").textContent === this.audioTracks[this.config.audioTrack].title) {
        option.classList.add("active")
      }
    })
  },

  // Update audio visualizer
  updateAudioVisualizer: function () {
    if (!this.audioAnalyser || !this.isPlaying) return

    // Get frequency data
    this.frequencyData = new Uint8Array(this.audioAnalyser.frequencyBinCount)
    this.audioAnalyser.getByteFrequencyData(this.frequencyData)

    // Normalize frequency data
    const normalizedData = Array.from(this.frequencyData).map((value) => value / 256)

    // Clear visualizer
    this.visualizerCtx.clearRect(0, 0, this.elements.audioVisualizer.width, this.elements.audioVisualizer.height)

    // Draw frequency bars
    const barWidth = this.elements.audioVisualizer.width / (normalizedData.length / 8)
    let x = 0

    for (let i = 0; i < normalizedData.length; i += 8) {
      const value = normalizedData[i]
      const barHeight = value * this.elements.audioVisualizer.height

      // Create gradient for bars
      const gradient = this.visualizerCtx.createLinearGradient(
        0,
        this.elements.audioVisualizer.height - barHeight,
        0,
        this.elements.audioVisualizer.height,
      )
      gradient.addColorStop(0, "#ff00ff")
      gradient.addColorStop(0.5, "#00ffff")
      gradient.addColorStop(1, "#ffff00")

      this.visualizerCtx.fillStyle = gradient
      this.visualizerCtx.fillRect(x, this.elements.audioVisualizer.height - barHeight, barWidth - 1, barHeight)

      x += barWidth
    }

    // Adjust trippy level based on audio
    const averageFrequency = normalizedData.reduce((a, b) => a + b, 0) / normalizedData.length
    this.config.trippyLevel = 0.5 + averageFrequency * 1.5

    // Return bass frequency for visual effects
    return {
      bassFrequency: normalizedData[1],
      averageFrequency: averageFrequency,
    }
  },

  // Update post-processing effects based on audio
  updatePostProcessing: function (audioData) {
    const bassImpact = audioData.bassFrequency * this.config.bassImpact

    // Adjust bloom intensity based on bass
    if (this.bloomPass) {
      this.bloomPass.strength = this.visualThemes[this.config.visualTheme].bloomStrength + bassImpact * 0.5
    }

    // Adjust glitch intensity based on audio
    if (this.glitchPass) {
      this.glitchPass.enabled = bassImpact > 0.2
      this.glitchPass.goWild = bassImpact > 0.5
    }

    // Adjust RGB shift amount based on audio
    if (this.rgbShiftPass) {
      this.rgbShiftPass.uniforms.amount.value = 0.0015 + bassImpact * 0.001
    }
  },

  // Create dance floor
  createDanceFloor: function (theme) {
    // Create a grid floor for the dance floor
    const floorSize = 500
    const floorSegments = this.config.performanceMode ? 50 : 100

    const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize, floorSegments, floorSegments)
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: theme.gridColor,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    })

    this.floorMesh = new THREE.Mesh(floorGeometry, floorMaterial)
    this.floorMesh.rotation.x = -Math.PI / 2
    this.floorMesh.position.y = -2
    this.scene.add(this.floorMesh)

    // Add a reflective surface under the wireframe
    const reflectiveGeometry = new THREE.PlaneGeometry(floorSize, floorSize)
    const reflectiveMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
    })

    const reflectiveMesh = new THREE.Mesh(reflectiveGeometry, reflectiveMaterial)
    reflectiveMesh.rotation.x = -Math.PI / 2
    reflectiveMesh.position.y = -2.1
    this.scene.add(reflectiveMesh)
  },

  // Set up infinite world generation
  setupInfiniteWorld: function () {
    // Create a much larger floor that extends "infinitely"
    this.updateDanceFloor(2000) // Extremely large floor

    // Set up procedural generation based on player position
    this.lastGenerationPosition = new THREE.Vector3()
    this.generationRadius = 500
    this.generationDistance = 300
  },

  // Update dance floor size
  updateDanceFloor: function (size) {
    // Remove old floor
    if (this.floorMesh) {
      this.scene.remove(this.floorMesh)
    }

    const theme = this.visualThemes[this.config.visualTheme]

    // Create a much larger grid floor
    const floorSize = size
    const floorSegments = this.config.performanceMode ? 100 : 200

    const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize, floorSegments, floorSegments)
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: theme.gridColor,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    })

    this.floorMesh = new THREE.Mesh(floorGeometry, floorMaterial)
    this.floorMesh.rotation.x = -Math.PI / 2
    this.floorMesh.position.y = -2
    this.scene.add(this.floorMesh)

    // Add a reflective surface under the wireframe
    const reflectiveGeometry = new THREE.PlaneGeometry(floorSize, floorSize)
    const reflectiveMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
    })

    const reflectiveMesh = new THREE.Mesh(reflectiveGeometry, reflectiveMaterial)
    reflectiveMesh.rotation.x = -Math.PI / 2
    reflectiveMesh.position.y = -2.1
    this.scene.add(reflectiveMesh)
  },

  // Create sky dome
  createSkyDome: function (theme) {
    // Create a large sphere for the sky
    const skyGeometry = new THREE.SphereGeometry(
      5000,
      this.config.performanceMode ? 32 : 64,
      this.config.performanceMode ? 32 : 64,
    )
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: theme.skyColor,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.8,
    })

    this.skyMesh = new THREE.Mesh(skyGeometry, skyMaterial)
    this.scene.add(this.skyMesh)

    // Add stars to the sky dome
    const starCount = this.config.performanceMode ? 1000 : 3000
    const starGeometry = new THREE.BufferGeometry()
    const starPositions = new Float32Array(starCount * 3)

    for (let i = 0; i < starCount; i++) {
      // Create stars in a full sphere around the scene
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const radius = 900 + Math.random() * 100

      starPositions[i * 3] = radius * Math.sin(theta) * Math.cos(theta)
      starPositions[i * 3 + 1] = radius * Math.cos(phi)
      starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    }

    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3))

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      transparent: true,
      opacity: 0.8,
    })

    const stars = new THREE.Points(starGeometry, starMaterial)
    this.scene.add(stars)
    this.skyObjects.push(stars)

    // Add floating objects in the sky
    if (this.config.showSkyObjects && !this.config.performanceMode) {
      this.createSkyObjects(theme)
    }
  },

  // Create sky objects
  createSkyObjects: function (theme) {
    if (!this.config.showSkyObjects) return

    for (let i = 0; i < this.config.skyObjectCount; i++) {
      // Random position in the sky
      const radius = 100 + Math.random() * 400
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = 50 + Math.random() * 300 // Higher up in the sky
      const z = radius * Math.sin(phi) * Math.sin(theta)

      this.createSkyObject(x, y, z, theme)
    }
  },

  // Create a single sky object
    // Random color
    const color1 = new THREE.Color(theme.particleColor1)
    const color2 = new THREE.Color(theme.particleColor2)
    const mixRatio = Math.random()
    const objectColor = new THREE.Color().lerpColors(color1, color2, mixRatio)
    const objectColor = new THREE.Color().lerpColors(color1, color2, mixRatio)

    // Create a random geometric shape
    let object
    const shapeType = Math.floor(Math.random() * 5)

    const material = new THREE.MeshBasicMaterial({
      color: objectColor,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    })

    switch (shapeType) {
      case 0: // Cube
        const cubeGeometry = new THREE.BoxGeometry(
          10 + Math.random() * 20,
          10 + Math.random() * 20,
          10 + Math.random() * 20,
        )
        object = new THREE.Mesh(cubeGeometry, material)
        break
      case 1: // Sphere
        const sphereGeometry = new THREE.SphereGeometry(5 + Math.random() * 15, 8, 8)
        object = new THREE.Mesh(sphereGeometry, material)
        break
      case 2: // Torus
        const torusGeometry = new THREE.TorusGeometry(10 + Math.random() * 10, 3 + Math.random() * 5, 8, 16)
        object = new THREE.Mesh(torusGeometry, material)
        break
      case 3: // Tetrahedron
        const tetraGeometry = new THREE.TetrahedronGeometry(10 + Math.random() * 15)
        object = new THREE.Mesh(tetraGeometry, material)
        break
      case 4: // Octahedron
        const octaGeometry = new THREE.OctahedronGeometry(10 + Math.random() * 15)
        object = new THREE.Mesh(octaGeometry, material)
        break
    }

    // Position
    object.position.set(x, y, z)

    // Add animation data
    object.userData = {
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01,
      },
      floatSpeed: 0.2 + Math.random() * 0.8,
      floatOffset: Math.random() * Math.PI * 2,
      originalY: y,
    }

    this.scene.add(object)
    this.skyObjects.push(object)

    return object
  },

  // Create particles
  createParticles: function (theme) {
    const particleGeometry = new THREE.BufferGeometry()
    const particleCount = this.config.density * (this.config.performanceMode ? 100 : 200)

    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    const color1 = new THREE.Color(theme.particleColor1)
    const color2 = new THREE.Color(theme.particleColor2)

    for (let i = 0; i < particleCount; i++) {
      // Position - spread out over a much larger area
      const x = (Math.random() - 0.5) * 500
      const y = Math.random() * 200
      const z = (Math.random() - 0.5) * 500

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      // Color
      const mixRatio = Math.random()
      const mixedColor = new THREE.Color().lerpColors(color1, color2, mixRatio)

      colors[i * 3] = mixedColor.r
      colors[i * 3 + 1] = mixedColor.g
      colors[i * 3 + 2] = mixedColor.b
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    const particleMaterial = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
    })

    this.particles = new THREE.Points(particleGeometry, particleMaterial)
    this.scene.add(this.particles)
  },

  // Create characters
  createCharacters: function (theme) {
    // Create dancers
    for (let i = 0; i < this.config.dancerCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 400
      const z = (Math.random() - 0.5) * 400

      this.createCharacter(x, z, theme, true)
    }

    // Create regular people
    for (let i = 0; i < this.config.regularPeopleCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 400
      const z = (Math.random() - 0.5) * 400

      this.createCharacter(x, z, theme, false)
    }
  },

  // Create a single character at specified position
  createCharacter: function (x, z, theme, isDancing) {
    // Choose a random character model
    let modelIndex = Math.floor(Math.random() * this.characterMaterials.length)
    const characterType = this.characterModels[modelIndex].type

    // Only use dancer models for dancing characters
    if (isDancing && characterType !== "dancer") {
      // Try to find a dancer model
      const dancerIndices = this.characterModels
        .map((model, index) => (model.type === "dancer" ? index : -1))
        .filter((index) => index !== -1)

      if (dancerIndices.length > 0) {
        modelIndex = dancerIndices[Math.floor(Math.random() * dancerIndices.length)]
      }
    }

    // Create sprite with character texture
    const sprite = new THREE.Sprite(this.characterMaterials[modelIndex])

    // Scale the sprite to reasonable human proportions
    const height = 3 + Math.random() * 0.5 // Random height between 3 and 3.5 units
    sprite.scale.set(height * 0.7, height, 1)

    // Position character
    sprite.position.set(x, height / 2, z)

    // Add animation data
    sprite.userData = {
      isDancing: isDancing,
      danceSpeed: 0.5 + Math.random() * 1.5,
      danceOffset: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      modelIndex: modelIndex,
      height: height,
      lookAtCamera: true,
    }

    this.scene.add(sprite)
    this.characters.push(sprite)

    return sprite
  },

  // Create buildings
  createBuildings: function (theme) {
    if (!this.config.showBuildings) return

    for (let i = 0; i < this.config.buildingCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 800
      const z = (Math.random() - 0.5) * 800

      this.createBuilding(x, z, theme)
    }
  },

  // Create a single building at specified position
  createBuilding: function (x, z, theme) {
    // Random building properties
    const width = 5 + Math.random() * 15
    const height = 20 + Math.random() * 80
    const depth = 5 + Math.random() * 15

    // Random color
    const color1 = new THREE.Color(theme.buildingColor1)
    const color2 = new THREE.Color(theme.buildingColor2)
    const mixRatio = Math.random()
    const buildingColor = new THREE.Color().lerpColors(color1, color2, mixRatio)

    // Create building geometry
    const buildingGeometry = new THREE.BoxGeometry(width, height, depth)
    const buildingMaterial = new THREE.MeshBasicMaterial({
      color: buildingColor,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    })

    const building = new THREE.Mesh(buildingGeometry, buildingMaterial)
    building.position.set(x, height / 2 - 2, z)

    this.scene.add(building)
    this.buildings.push(building)

    return building
  },

  // Create lasers
  createLasers: function (theme) {
    if (!this.config.showLasers) return

    for (let i = 0; i < this.config.laserCount; i++) {
      // Random start and end points
      const startX = (Math.random() - 0.5) * 400
      const startY = 5 + Math.random() * 50
      const startZ = (Math.random() - 0.5) * 400

      const endX = (Math.random() - 0.5) * 400
      const endY = 5 + Math.random() * 50
      const endZ = (Math.random() - 0.5) * 400

      // Random color
      const color1 = new THREE.Color(theme.particleColor1)
      const color2 = new THREE.Color(theme.particleColor2)
      const mixRatio = Math.random()
      const laserColor = new THREE.Color().lerpColors(color1, color2, mixRatio)

      // Create laser geometry using BufferGeometry
      const laserGeometry = new THREE.BufferGeometry()
      const vertices = new Float32Array([startX, startY, startZ, endX, endY, endZ])
      laserGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3))

      const laserMaterial = new THREE.LineBasicMaterial({
        color: laserColor,
        transparent: true,
        opacity: 0.6,
      })

      const laser = new THREE.Line(laserGeometry, laserMaterial)
      this.scene.add(laser)
      this.lasers.push(laser)

      // Add animation data
      laser.userData = {
        color1: color1,
        color2: color2,
        mixRatio: Math.random(),
        colorChangeSpeed: 0.01 + Math.random() * 0.05,
      }
    }
  },

  // Create smoke machines
  createSmokeMachines: function (theme) {
    for (let i = 0; i < this.config.smokeCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 400
      const y = 0
      const z = (Math.random() - 0.5) * 400

      // Create smoke particle system using BufferGeometry
      const particleCount = 50
      const smokeGeometry = new THREE.BufferGeometry()
      const positions = new Float32Array(particleCount * 3)
      const velocities = []

      for (let j = 0; j < particleCount; j++) {
        positions[j * 3] = x
        positions[j * 3 + 1] = y
        positions[j * 3 + 2] = z

        // Store velocity separately since BufferGeometry doesn't support custom attributes like Geometry did
        velocities.push(new THREE.Vector3(0, 0.5 + Math.random(), 0))
      }

      smokeGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

      const smokeMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 5 + Math.random() * 10,
        transparent: true,
        opacity: 0.3,
      })

      const smoke = new THREE.Points(smokeGeometry, smokeMaterial)
      smoke.userData = { velocities: velocities } // Store velocities in userData
      this.scene.add(smoke)
      this.smokeMachines.push(smoke)
    }
  },

  // Create zones
  createZones: function (theme) {
    // Create different party zones
    const zoneCount = 4
    for (let i = 0; i < zoneCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 800
      const z = (Math.random() - 0.5) * 800

      // Create zone geometry
      const zoneGeometry = new THREE.CircleGeometry(50 + Math.random() * 100, 32)
      const zoneMaterial = new THREE.MeshBasicMaterial({
        color: theme.gridColor,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      })

      const zone = new THREE.Mesh(zoneGeometry, zoneMaterial)
      zone.rotation.x = -Math.PI / 2
      zone.position.set(x, -1.9, z)
      this.scene.add(zone)
      this.zones.push(zone)
    }
  },

  // Check if we need to generate more content based on player position
  checkProceduralGeneration: function () {
    if (!this.lastGenerationPosition) return

    const distanceMoved = this.camera.position.distanceTo(this.lastGenerationPosition)

    // If player has moved far enough, generate new content
    if (distanceMoved > this.generationDistance) {
      this.generateWorldContent()
      this.lastGenerationPosition.copy(this.camera.position)
    }
  },

  // Generate new world content around the player
  generateWorldContent: function () {
    const theme = this.visualThemes[this.config.visualTheme]
    const playerPos = this.camera.position.clone()

    // Generate new buildings
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = this.generationRadius * 0.5 + Math.random() * this.generationRadius * 0.5

      const x = playerPos.x + Math.cos(angle) * distance
      const z = playerPos.z + Math.sin(angle) * distance

      this.createBuilding(x, z, theme)
    }

    // Generate new characters
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = this.generationRadius * 0.3 + Math.random() * this.generationRadius * 0.3

      const x = playerPos.x + Math.cos(angle) * distance
      const z = playerPos.z + Math.sin(angle) * distance

      this.createCharacter(x, z, theme, Math.random() > 0.5)
    }

    // Generate new sky objects
    if (!this.config.performanceMode) {
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2
        const distance = this.generationRadius * 0.7 + Math.random() * this.generationRadius * 0.3
        const height = 50 + Math.random() * 300

        const x = playerPos.x + Math.cos(angle) * distance
        const z = playerPos.z + Math.sin(angle) * distance

        this.createSkyObject(x, height, z, theme)
      }
    }
  },

  // Update objects
  updateObjects: function (deltaTime) {
    // Update particles
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array

      for (let i = 0; i < positions.length; i += 3) {
        // Slightly move particles up and down
        positions[i + 1] += Math.sin(this.time + i) * 0.01
        this.particles.geometry.attributes.position.needsUpdate = true
      }
    }

    // Update characters
    this.characters.forEach((character) => {
      if (character.userData.isDancing) {
        // Make characters dance
        character.position.y =
          character.userData.height / 2 +
          Math.sin(this.time * character.userData.danceSpeed + character.userData.danceOffset) * 0.5
      }

      // Make characters face the camera (billboarding)
      if (character.userData.lookAtCamera) {
        const cameraPosition = this.camera.position.clone()
        cameraPosition.y = character.position.y // Keep same height
        character.lookAt(cameraPosition)
      }
    })

    // Update sky objects
    this.skyObjects.forEach((object) => {
      // Rotate objects
      if (object.userData && object.userData.rotationSpeed) {
        object.rotation.x += object.userData.rotationSpeed.x
        object.rotation.y += object.userData.rotationSpeed.y
        object.rotation.z += object.userData.rotationSpeed.z
      }

      // Float objects up and down
      if (object.userData && object.userData.floatSpeed) {
        object.position.y =
          object.userData.originalY +
          Math.sin(this.time * object.userData.floatSpeed + object.userData.floatOffset) * 10
      }
    })

    // Update lasers
    this.lasers.forEach((laser) => {
      // Change laser color over time
      laser.userData.mixRatio += laser.userData.colorChangeSpeed
      if (laser.userData.mixRatio > 1) {
        laser.userData.mixRatio = 0
        const tempColor = laser.userData.color1
        laser.userData.color1 = laser.userData.color2
        laser.userData.color2 = tempColor
      }

      const laserColor = new THREE.Color().lerpColors(
        laser.userData.color1,
        laser.userData.color2,
        laser.userData.mixRatio,
      )
      laser.material.color.set(laserColor)
    })

    // Update smoke machines
    this.smokeMachines.forEach((smoke) => {
      const positions = smoke.geometry.attributes.position.array
      const velocities = smoke.userData.velocities

      for (let i = 0; i < positions.length; i += 3) {
        // Apply velocity
        positions[i + 1] += velocities[i / 3].y * deltaTime * 10

        // Reset particle if it goes too high
        if (positions[i + 1] > 100) {
          positions[i + 1] = 0
        }
      }

      smoke.geometry.attributes.position.needsUpdate = true
    })
  },

  // Update theme
  updateTheme: function () {
    const theme = this.visualThemes[this.config.visualTheme]

    // Update fog color
    this.scene.fog.color.set(theme.fogColor)

    // Update floor color
    if (this.floorMesh) {
      this.floorMesh.material.color.set(theme.gridColor)
    }

    // Update sky color
    if (this.skyMesh) {
      this.skyMesh.material.color.set(theme.skyColor)
    }

    // Update particles
    if (this.particles) {
      const colors = this.particles.geometry.attributes.color.array
      const color1 = new THREE.Color(theme.particleColor1)
      const color2 = new THREE.Color(theme.particleColor2)

      for (let i = 0; i < colors.length; i += 3) {
        const mixRatio = Math.random()
        const mixedColor = new THREE.Color().lerpColors(color1, color2, mixRatio)

        colors[i] = mixedColor.r
        colors[i + 1] = mixedColor.g
        colors[i + 2] = mixedColor.b
      }

      this.particles.geometry.attributes.color.needsUpdate = true
    }

    // Update buildings
    this.buildings.forEach((building) => {
      const color1 = new THREE.Color(theme.buildingColor1)
      const color2 = new THREE.Color(theme.buildingColor2)
      const mixRatio = Math.random()
      const buildingColor = new THREE.Color().lerpColors(color1, color2, mixRatio)
      building.material.color.set(buildingColor)
    })

    // Update lasers
    this.lasers.forEach((laser) => {
      const color1 = new THREE.Color(theme.particleColor1)
      const color2 = new THREE.Color(theme.particleColor2)
      laser.userData.color1 = color1
      laser.userData.color2 = color2
    })

    // Update bloom pass
    if (this.bloomPass) {
      this.bloomPass.strength = theme.bloomStrength
      this.bloomPass.radius = theme.bloomRadius
      this.bloomPass.threshold = theme.bloomThreshold
    }
  },
}

// Initialize the application
RaveCity.init()
