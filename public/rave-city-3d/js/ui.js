/**
 * UI handling for Rave City
 */
const RaveCityUI = {
  // DOM Elements
  elements: {},
  visualizerCtx: null,

  // Initialize UI
  init: function () {
    // Get DOM elements
    this.getElements()

    // Initialize controls
    this.initControls()

    // Initialize settings panel
    this.initSettingsPanel()

    // Initialize track selector
    this.populateTrackSelector()

    // Update theme indicator
    this.updateThemeIndicator()
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
    if (this.elements.audioVisualizer) {
      this.visualizerCtx = this.elements.audioVisualizer.getContext("2d")

      // Set canvas size
      this.elements.audioVisualizer.width = this.elements.audioVisualizer.offsetWidth
      this.elements.audioVisualizer.height = this.elements.audioVisualizer.offsetHeight
    }
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
      const RaveCityScene = window.RaveCityScene // Declare RaveCityScene
      if (RaveCityScene && RaveCityScene.controls) {
        RaveCityScene.controls.lock()
      }
    })

    document.addEventListener("pointerlockchange", () => {
      const RaveCity = window.RaveCity // Declare RaveCity
      if (RaveCity && RaveCity.movement) {
        RaveCity.movement.pointerLocked = document.pointerLockElement === document.body
      }
    })

    // Keyboard controls
    document.addEventListener("keydown", (event) => {
      const RaveCity = window.RaveCity // Declare RaveCity
      const RaveCityAudio = window.RaveCityAudio // Declare RaveCityAudio
      const RaveCityConfig = window.RaveCityConfig // Declare RaveCityConfig
      if (RaveCity && RaveCity.movement && RaveCity.movement.pointerLocked) {
        switch (event.code) {
          case "KeyW":
            RaveCity.movement.forward = true
            break
          case "KeyS":
            RaveCity.movement.backward = true
            break
          case "KeyA":
            RaveCity.movement.left = true
            break
          case "KeyD":
            RaveCity.movement.right = true
            break
          case "Space":
            RaveCity.movement.up = true
            break
          case "ShiftLeft":
            RaveCity.movement.down = true
            break
        }
      }

      // Global keyboard shortcuts
      switch (event.code) {
        case "Escape":
          const RaveCityScene = window.RaveCityScene // Declare RaveCityScene
          if (RaveCityScene && RaveCityScene.controls) {
            RaveCityScene.controls.unlock()
          }
          break
        case "KeyF":
          this.toggleFullscreen()
          break
        case "KeyM":
          if (RaveCityAudio) RaveCityAudio.toggleAudio(this)
          break
        case "KeyT":
          this.changeTheme()
          break
        case "KeyN":
          if (RaveCityAudio) RaveCityAudio.playNextTrack(RaveCityConfig, this)
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
      const RaveCity = window.RaveCity // Declare RaveCity
      if (RaveCity && RaveCity.movement) {
        switch (event.code) {
          case "KeyW":
            RaveCity.movement.forward = false
            break
          case "KeyS":
            RaveCity.movement.backward = false
            break
          case "KeyA":
            RaveCity.movement.left = false
            break
          case "KeyD":
            RaveCity.movement.right = false
            break
          case "Space":
            RaveCity.movement.up = false
            break
          case "ShiftLeft":
            RaveCity.movement.down = false
            break
        }
      }
    })

    // Button controls
    if (this.elements.fullscreenButton) {
      this.elements.fullscreenButton.addEventListener("click", () => this.toggleFullscreen())
    }
    if (this.elements.themeButton) {
      this.elements.themeButton.addEventListener("click", () => this.changeTheme())
    }
    if (this.elements.trackButton) {
      this.elements.trackButton.addEventListener("click", () => this.toggleTrackSelector())
    }
    if (this.elements.audioButton) {
      this.elements.audioButton.addEventListener("click", () => {
        const RaveCityAudio = window.RaveCityAudio // Declare RaveCityAudio
        if (RaveCityAudio) RaveCityAudio.toggleAudio(this)
      })
    }
    if (this.elements.helpButton) {
      this.elements.helpButton.addEventListener("click", () => this.toggleControlsInfo())
    }
    if (this.elements.settingsButton) {
      this.elements.settingsButton.addEventListener("click", () => this.toggleSettings())
    }
    if (this.elements.settingsApply) {
      this.elements.settingsApply.addEventListener("click", () => this.applySettings())
    }
    if (this.elements.settingsClose) {
      this.elements.settingsClose.addEventListener("click", () => this.toggleSettings())
    }
    if (this.elements.settingsReset) {
      this.elements.settingsReset.addEventListener("click", () => this.resetSettings())
    }
    if (this.elements.closeControls) {
      this.elements.closeControls.addEventListener("click", () => this.toggleControlsInfo())
    }
    if (this.elements.closeTracks) {
      this.elements.closeTracks.addEventListener("click", () => this.toggleTrackSelector())
    }

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
  initSettingsPanel: () => {
    const RaveCityConfig = window.RaveCityConfig // Declare RaveCityConfig
    if (!RaveCityConfig) return

    // Set initial values based on config
    const qualitySelect = document.getElementById("quality-setting")
    if (qualitySelect) qualitySelect.value = RaveCityConfig.quality

    const densityInput = document.getElementById("density-setting")
    if (densityInput) densityInput.value = RaveCityConfig.density

    const fpsCheckbox = document.getElementById("fps-setting")
    if (fpsCheckbox) fpsCheckbox.checked = RaveCityConfig.showFps

    const autoOptimizeCheckbox = document.getElementById("auto-optimize-setting")
    if (autoOptimizeCheckbox) autoOptimizeCheckbox.checked = RaveCityConfig.autoOptimize

    const bloomInput = document.getElementById("bloom-setting")
    if (bloomInput && RaveCityConfig.visualThemes && RaveCityConfig.visualTheme) {
      bloomInput.value = RaveCityConfig.visualThemes[RaveCityConfig.visualTheme].bloomStrength
    }

    const glitchInput = document.getElementById("glitch-setting")
    if (glitchInput) glitchInput.value = RaveCityConfig.glitchIntensity

    const colorShiftInput = document.getElementById("color-shift-setting")
    if (colorShiftInput) colorShiftInput.value = RaveCityConfig.colorShiftSpeed

    const volumeInput = document.getElementById("volume-setting")
    if (volumeInput) volumeInput.value = RaveCityConfig.volume

    const bassInput = document.getElementById("bass-setting")
    if (bassInput) bassInput.value = RaveCityConfig.bassImpact

    const randomTracksCheckbox = document.getElementById("random-tracks-setting")
    if (randomTracksCheckbox) randomTracksCheckbox.checked = RaveCityConfig.randomizeTracks

    const movementSpeedInput = document.getElementById("movement-speed-setting")
    if (movementSpeedInput) movementSpeedInput.value = RaveCityConfig.movementSpeed

    const flyingCheckbox = document.getElementById("flying-setting")
    if (flyingCheckbox) flyingCheckbox.checked = RaveCityConfig.flyingEnabled

    const sensitivityInput = document.getElementById("sensitivity-setting")
    if (sensitivityInput) sensitivityInput.value = RaveCityConfig.mouseSensitivity

    const dancerCountInput = document.getElementById("dancer-count-setting")
    if (dancerCountInput) dancerCountInput.value = RaveCityConfig.dancerCount

    const dancerDetailSelect = document.getElementById("dancer-detail-setting")
    if (dancerDetailSelect) dancerDetailSelect.value = RaveCityConfig.dancerDetail
  },

  // Populate track selector
  populateTrackSelector: function () {
    const RaveCityConfig = window.RaveCityConfig // Declare RaveCityConfig
    if (!RaveCityConfig || !RaveCityConfig.audioTracks || !this.elements.trackList) return

    const trackNames = Object.keys(RaveCityConfig.audioTracks)

    // Clear existing options
    this.elements.trackList.innerHTML = ""

    trackNames.forEach((trackName) => {
      const track = RaveCityConfig.audioTracks[trackName]
      const trackOption = document.createElement("div")
      trackOption.className = "track-option"
      if (trackName === RaveCityConfig.audioTrack) {
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
        RaveCityConfig.audioTrack = trackName
        const RaveCityAudio = window.RaveCityAudio // Declare RaveCityAudio
        if (RaveCityAudio) {
          RaveCityAudio.loadAudioTrack(trackName, RaveCityConfig, this)
        }

        // Update active state
        document.querySelectorAll(".track-option").forEach((option) => {
          option.classList.remove("active")
        })
        trackOption.classList.add("active")
      })

      this.elements.trackList.appendChild(trackOption)
    })
  },

  // Toggle fullscreen
  toggleFullscreen: function () {
    if (document.fullscreenElement) {
      document.exitFullscreen()
      if (this.elements.fullscreenButton) {
        this.elements.fullscreenButton.classList.remove("active")
      }
    } else {
      document.body.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
      if (this.elements.fullscreenButton) {
        this.elements.fullscreenButton.classList.add("active")
      }
    }
  },

  // Change theme
  changeTheme: function () {
    const RaveCityConfig = window.RaveCityConfig // Declare RaveCityConfig
    const RaveCityScene = window.RaveCityScene // Declare RaveCityScene
    if (!RaveCityConfig || !RaveCityConfig.visualThemes || !RaveCityConfig.visualTheme) return

    const themeNames = Object.keys(RaveCityConfig.visualThemes)
    const currentThemeIndex = themeNames.indexOf(RaveCityConfig.visualTheme)
    const nextThemeIndex = (currentThemeIndex + 1) % themeNames.length
    RaveCityConfig.visualTheme = themeNames[nextThemeIndex]

    // Update theme
    if (RaveCityScene && RaveCityScene.updateTheme) {
      RaveCityScene.updateTheme()
    }

    // Update theme indicator
    this.updateThemeIndicator()
  },

  // Update theme indicator
  updateThemeIndicator: function () {
    if (
      !this.elements.themeIndicator ||
      !window.RaveCityConfig ||
      !window.RaveCityConfig.visualThemes ||
      !window.RaveCityConfig.visualTheme
    )
      return

    this.elements.themeIndicator.textContent =
      window.RaveCityConfig.visualThemes[window.RaveCityConfig.visualTheme].name
    this.elements.themeIndicator.classList.add("visible")

    setTimeout(() => {
      this.elements.themeIndicator.classList.remove("visible")
    }, 3000)
  },

  // Toggle track selector
  toggleTrackSelector: function () {
    if (!this.elements.trackSelector || !this.elements.trackButton) return

    this.elements.trackSelector.classList.toggle("hidden")
    this.elements.trackButton.classList.toggle("active", !this.elements.trackSelector.classList.contains("hidden"))
  },

  // Toggle controls info
  toggleControlsInfo: function () {
    if (!this.elements.controlsInfo || !this.elements.helpButton) return

    this.elements.controlsInfo.classList.toggle("hidden")
    this.elements.helpButton.classList.toggle("active", !this.elements.controlsInfo.classList.contains("hidden"))
  },

  // Toggle settings
  toggleSettings: function () {
    if (!this.elements.settingsPanel || !this.elements.settingsButton) return

    this.elements.settingsPanel.classList.toggle("hidden")
    this.elements.settingsButton.classList.toggle("active", !this.elements.settingsPanel.classList.contains("hidden"))
  },

  // Apply settings
  applySettings: function () {
    const RaveCityConfig = window.RaveCityConfig // Declare RaveCityConfig
    const RaveCityAudio = window.RaveCityAudio // Declare RaveCityAudio
    const RaveCityScene = window.RaveCityScene // Declare RaveCityScene
    const RaveCity = window.RaveCity // Declare RaveCity
    if (!RaveCityConfig) return

    // Get settings values
    const quality = document.getElementById("quality-setting")?.value || "medium"
    const density = Number.parseInt(document.getElementById("density-setting")?.value || "60")
    const showFps = document.getElementById("fps-setting")?.checked || false
    const autoOptimize = document.getElementById("auto-optimize-setting")?.checked || true
    const bloomIntensity = Number.parseFloat(document.getElementById("bloom-setting")?.value || "1.2")
    const glitchIntensity = Number.parseFloat(document.getElementById("glitch-setting")?.value || "0.15")
    const colorShiftSpeed = Number.parseFloat(document.getElementById("color-shift-setting")?.value || "1.0")
    const volume = Number.parseFloat(document.getElementById("volume-setting")?.value || "0.7")
    const bassImpact = Number.parseFloat(document.getElementById("bass-setting")?.value || "1.5")
    const randomizeTracks = document.getElementById("random-tracks-setting")?.checked || true
    const movementSpeed = Number.parseFloat(document.getElementById("movement-speed-setting")?.value || "2.0")
    const flyingEnabled = document.getElementById("flying-setting")?.checked || true
    const sensitivity = Number.parseFloat(document.getElementById("sensitivity-setting")?.value || "1.0")
    const dancerCount = Number.parseInt(document.getElementById("dancer-count-setting")?.value || "100")
    const dancerDetail = document.getElementById("dancer-detail-setting")?.value || "medium"

    // Apply quality preset first
    RaveCityConfig.quality = quality
    if (RaveCityConfig.applyQualitySettings) {
      RaveCityConfig.applyQualitySettings(quality)
    }

    // Apply individual settings that override the preset
    RaveCityConfig.density = density
    RaveCityConfig.showFps = showFps
    RaveCityConfig.autoOptimize = autoOptimize
    if (RaveCityConfig.visualThemes && RaveCityConfig.visualTheme) {
      RaveCityConfig.visualThemes[RaveCityConfig.visualTheme].bloomStrength = bloomIntensity
    }
    RaveCityConfig.glitchIntensity = glitchIntensity
    RaveCityConfig.colorShiftSpeed = colorShiftSpeed
    RaveCityConfig.volume = volume
    RaveCityConfig.bassImpact = bassImpact
    RaveCityConfig.randomizeTracks = randomizeTracks
    RaveCityConfig.movementSpeed = movementSpeed
    RaveCityConfig.flyingEnabled = flyingEnabled
    RaveCityConfig.mouseSensitivity = sensitivity
    RaveCityConfig.dancerCount = dancerCount
    RaveCityConfig.dancerDetail = dancerDetail

    // Apply audio settings
    if (RaveCityAudio && RaveCityAudio.setVolume) {
      RaveCityAudio.setVolume(volume)
    }

    // Update visual effects
    if (RaveCityScene && RaveCityScene.updateTheme) {
      RaveCityScene.updateTheme()
    }

    // Recreate scene objects
    if (RaveCity && RaveCity.recreateSceneObjects) {
      RaveCity.recreateSceneObjects()
    }

    // Toggle settings panel
    this.toggleSettings()
  },

  // Reset settings to defaults
  resetSettings: function () {
    const RaveCityConfig = window.RaveCityConfig // Declare RaveCityConfig
    const RaveCityScene = window.RaveCityScene // Declare RaveCityScene
    const RaveCityAudio = window.RaveCityAudio // Declare RaveCityAudio
    const RaveCity = window.RaveCity // Declare RaveCity
    if (!RaveCityConfig) return

    if (confirm("Reset all settings to default values?")) {
      // Reset to medium quality
      RaveCityConfig.quality = "medium"
      if (RaveCityConfig.applyQualitySettings) {
        RaveCityConfig.applyQualitySettings("medium")
      }

      // Reset other settings
      RaveCityConfig.showFps = false
      RaveCityConfig.autoOptimize = true
      RaveCityConfig.volume = 0.7
      RaveCityConfig.bassImpact = 1.5
      RaveCityConfig.randomizeTracks = true
      RaveCityConfig.movementSpeed = 2.0
      RaveCityConfig.flyingEnabled = true
      RaveCityConfig.mouseSensitivity = 1.0

      // Reset theme settings
      if (RaveCityConfig.visualThemes) {
        Object.keys(RaveCityConfig.visualThemes).forEach((theme) => {
          RaveCityConfig.visualThemes[theme].bloomStrength =
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
      }

      // Update UI to reflect changes
      this.initSettingsPanel()

      // Apply audio settings
      if (RaveCityAudio && RaveCityAudio.setVolume) {
        RaveCityAudio.setVolume(RaveCityConfig.volume)
      }

      // Update visual effects
      if (RaveCityScene && RaveCityScene.updateTheme) {
        RaveCityScene.updateTheme()
      }

      // Recreate scene objects
      if (RaveCity && RaveCity.recreateSceneObjects) {
        RaveCity.recreateSceneObjects()
      }
    }
  },

  // Show error message
  showError: function (message) {
    console.error(message)
    if (this.elements.errorMessage) {
      this.elements.errorMessage.textContent = message
      this.elements.errorMessage.classList.remove("hidden")

      setTimeout(() => {
        this.elements.errorMessage.classList.add("hidden")
      }, 5000)
    }
  },

  // Initialize loading screen
  initLoadingScreen: function () {
    if (!this.elements.loadingText) return

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

  // Update FPS counter
  updateFpsCounter: function (fps) {
    if (!this.elements.fpsCounter || !window.RaveCityConfig) return

    if (window.RaveCityConfig.showFps) {
      this.elements.fpsCounter.textContent = `FPS: ${fps}`
      this.elements.fpsCounter.style.display = "block"
    } else {
      this.elements.fpsCounter.style.display = "none"
    }
  },
}
