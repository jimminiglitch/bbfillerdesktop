/**
 * Main script for 3D Rave City
 */
// Instead of redeclaring these variables, we'll just use the global ones
// that are already defined in the other files

const THREE = window.THREE // Declare THREE variable
const RaveCityUI = window.RaveCityUI // Declare RaveCityUI variable
const RaveCityScene = window.RaveCityScene // Declare RaveCityScene variable
const RaveCityAudio = window.RaveCityAudio // Declare RaveCityAudio variable
const RaveCityConfig = window.RaveCityConfig // Declare RaveCityConfig variable
const RaveCityCharacters = window.RaveCityCharacters // Declare RaveCityCharacters variable

const RaveCity = {
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
    velocity: null,
    direction: null,
    pointerLocked: false,
  },

  // Animation state
  animationFrameId: null,
  time: 0,
  lastTime: 0,
  fps: 0,
  frameCount: 0,
  lastFpsUpdate: 0,

  // Initialize the application
  init: function () {
    try {
      console.log("Initializing 3D Rave City...")

      // Check if device is mobile
      this.checkMobile()

      // Initialize movement vectors
      this.movement.velocity = new THREE.Vector3()
      this.movement.direction = new THREE.Vector3()

      // Initialize UI
      RaveCityUI.initLoadingScreen()

      // Load dependencies
      this.loadDependencies()
        .then(() => {
          console.log("Dependencies loaded successfully")

          // Initialize UI
          RaveCityUI.init()

          // Initialize scene
          RaveCityScene.init()

          // Initialize audio
          RaveCityAudio.init(RaveCityConfig, RaveCityUI)

          // Start animation loop
          this.animate()

          // Hide loading screen
          setTimeout(() => {
            const loadingScreen = document.getElementById("loading-screen")
            if (loadingScreen) {
              loadingScreen.style.opacity = "0"
              setTimeout(() => {
                loadingScreen.style.display = "none"
              }, 500)
            }
          }, 1000)
        })
        .catch((error) => {
          console.error("Failed to load dependencies:", error)
          RaveCityUI.showError(`Failed to load dependencies: ${error.message}`)
        })
    } catch (error) {
      console.error("Initialization error:", error)
      RaveCityUI.showError(`Initialization error: ${error.message}`)
    }
  },

  // Check if device is mobile
  checkMobile: function () {
    RaveCityConfig.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    if (RaveCityConfig.isMobile) {
      // Reduce quality for mobile
      RaveCityConfig.quality = "low"
      RaveCityConfig.applyQualitySettings("low")
    }

    // Auto-detect performance
    if (RaveCityConfig.autoOptimize) {
      this.detectPerformance()
    }
  },

  // Detect performance capabilities
  detectPerformance: () => {
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
      const isMobile = RaveCityConfig.isMobile

      // Check GPU (indirectly through canvas performance)
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      let lowGPU = false

      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info")
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          // Check for known low-end GPU indicators
          lowGPU = /(intel|hd graphics|llvmpipe|swiftshader|microsoft basic)/i.test(renderer)
        }
      }

      return cpuCores <= 2 || lowMemory || (isMobile && lowGPU)
    }

    if (isLowEndDevice()) {
      console.log("Low-end device detected, enabling performance mode")
      RaveCityConfig.performanceMode = true
      RaveCityConfig.quality = "low"
      RaveCityConfig.applyQualitySettings("low")

      const performanceMode = document.getElementById("performance-mode")
      if (performanceMode) {
        performanceMode.classList.remove("hidden")
      }
    }
  },

  // Load dependencies
  loadDependencies: () =>
    new Promise((resolve, reject) => {
      // Preload character textures
      RaveCityCharacters.preloadCharacterTextures()
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

            const progressFill = document.getElementById("progress-fill")
            const progressPercent = document.getElementById("progress-percent")

            if (progressFill) {
              progressFill.style.width = `${progress}%`
            }

            if (progressPercent) {
              progressPercent.textContent = `${Math.round(progress)}%`
            }
          }, 150)
        })
        .catch((error) => {
          reject(error)
        })
    }),

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

    // Update characters
    RaveCityCharacters.updateCharacters(this.time)

    // Update objects
    RaveCityScene.updateObjects(deltaTime, this.time)

    // Check for procedural generation
    RaveCityScene.checkProceduralGeneration()

    // Update audio visualizer
    let audioData = null
    if (RaveCityConfig.audioReactive && RaveCityAudio.isPlaying) {
      audioData = RaveCityAudio.updateAudioVisualizer(RaveCityConfig, RaveCityUI)
    }

    // Update post-processing effects based on audio
    if (audioData && RaveCityConfig.audioReactive && RaveCityScene.updatePostProcessing) {
      RaveCityScene.updatePostProcessing(audioData)
    }

    // Render the scene
    RaveCityScene.render()

    // Update FPS counter
    this.updateFps(deltaTime)
  },

  // Update movement
  updateMovement: function (deltaTime) {
    // Only apply movement if pointer is locked
    if (!this.movement.pointerLocked) return

    // Get camera direction
    RaveCityScene.camera.getWorldDirection(this.movement.direction)

    // Reset velocity
    this.movement.velocity.x = 0
    this.movement.velocity.z = 0
    this.movement.velocity.y = 0

    // Calculate movement speed with delta time
    const speed = this.movement.speed * RaveCityConfig.movementSpeed * deltaTime * 60

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
    if (RaveCityConfig.flyingEnabled) {
      if (this.movement.up) {
        this.movement.velocity.y += speed
      }
      if (this.movement.down) {
        this.movement.velocity.y -= speed
      }
    }

    // Apply velocity to camera position
    RaveCityScene.camera.position.x += this.movement.velocity.x
    RaveCityScene.camera.position.z += this.movement.velocity.z
    RaveCityScene.camera.position.y += this.movement.velocity.y

    // Prevent going below the floor
    if (RaveCityScene.camera.position.y < 0) {
      RaveCityScene.camera.position.y = 0
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

      RaveCityUI.updateFpsCounter(this.fps)
    }
  },

  // Recreate scene objects
  recreateSceneObjects: () => {
    // Clear scene
    while (RaveCityScene.scene.children.length > 0) {
      const object = RaveCityScene.scene.children[0]
      if (object.geometry) object.geometry.dispose()
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose())
        } else {
          object.material.dispose()
        }
      }
      RaveCityScene.scene.remove(object)
    }

    // Reset arrays
    RaveCityCharacters.characters = []
    RaveCityScene.buildings = []
    RaveCityScene.skyObjects = []
    RaveCityScene.lasers = []
    RaveCityScene.smokeMachines = []
    RaveCityScene.zones = []

    // Recreate objects
    RaveCityScene.createSceneObjects()
  },
}

// Make RaveCity globally available
window.RaveCity = RaveCity

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  RaveCity.init()
})
