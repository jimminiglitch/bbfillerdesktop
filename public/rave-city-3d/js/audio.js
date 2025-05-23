/**
 * Audio handling for 3D Rave City
 */
const RaveCityAudio = {
  // Audio state
  audioContext: null,
  audioSource: null,
  audioAnalyser: null,
  frequencyData: null,
  audioElement: null,
  isPlaying: false,
  audioLoaded: false,

  // Initialize audio system
  init: function (RaveCityConfig, RaveCityUI) {
    try {
      console.log("Initializing audio system...")

      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

      // Create analyser
      this.audioAnalyser = this.audioContext.createAnalyser()
      this.audioAnalyser.fftSize = 2048

      // Load audio track
      this.loadAudioTrack(RaveCityConfig.audioTrack, RaveCityConfig, RaveCityUI)

      // Set initial volume
      this.setVolume(RaveCityConfig.volume)

      console.log("Audio system initialized successfully")
    } catch (error) {
      console.error("Failed to initialize audio:", error)
      RaveCityUI.showError(`Failed to initialize audio: ${error.message}`)
    }
  },

  // Load audio track
  loadAudioTrack: function (trackName, RaveCityConfig, RaveCityUI) {
    if (!RaveCityConfig.audioTracks[trackName]) {
      console.error(`Audio track "${trackName}" not found.`)
      RaveCityUI.showError(`Audio track "${trackName}" not found.`)
      return
    }

    const track = RaveCityConfig.audioTracks[trackName]
    RaveCityUI.elements.trackInfo.textContent = `Loading: ${track.title}`
    RaveCityUI.elements.audioStatus.textContent = "Loading audio..."
    RaveCityUI.elements.audioStatus.style.display = "block"

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
          this.playNextTrack(RaveCityConfig, RaveCityUI)
        }

        this.audioElement = track
        this.audioLoaded = true
        RaveCityUI.elements.trackInfo.textContent = `Now Playing: ${track.title}`
        RaveCityUI.elements.audioStatus.textContent = "Audio loaded, ready to play"

        if (this.isPlaying) {
          this.audioSource.start(0)
          this.isPlaying = true
          RaveCityUI.elements.audioStatus.textContent = "Playing"
          RaveCityUI.elements.audioButton.classList.add("active")
        }

        // Hide status after a few seconds
        setTimeout(() => {
          RaveCityUI.elements.audioStatus.style.display = "none"
        }, 2000)
      })
      .catch((error) => {
        console.error("Failed to load audio track:", error)
        RaveCityUI.showError(`Failed to load audio track: ${error.message}`)
        RaveCityUI.elements.audioStatus.textContent = "Error loading audio"
      })
  },

  // Play audio
  playAudio: function (RaveCityConfig, RaveCityUI) {
    if (!this.audioLoaded) {
      console.warn("Audio not loaded yet.")
      RaveCityUI.elements.audioStatus.textContent = "Audio not loaded yet"
      RaveCityUI.elements.audioStatus.style.display = "block"
      return
    }

    if (this.isPlaying) {
      console.log("Audio is already playing.")
      return
    }

    this.audioContext.resume().then(() => {
      this.audioSource.start(0)
      this.isPlaying = true
      RaveCityUI.elements.audioStatus.textContent = "Playing"
      RaveCityUI.elements.audioStatus.style.display = "block"
      RaveCityUI.elements.audioButton.classList.add("active")

      // Hide status after a few seconds
      setTimeout(() => {
        RaveCityUI.elements.audioStatus.style.display = "none"
      }, 2000)
    })
  },

  // Pause audio
  pauseAudio: function (RaveCityConfig, RaveCityUI) {
    if (!this.isPlaying) {
      console.log("Audio is already paused.")
      return
    }

    this.audioSource.stop()
    this.isPlaying = false
    RaveCityUI.elements.audioStatus.textContent = "Paused"
    RaveCityUI.elements.audioStatus.style.display = "block"
    RaveCityUI.elements.audioButton.classList.remove("active")

    // Re-create audio source to allow playing again
    this.loadAudioTrack(RaveCityConfig.audioTrack, RaveCityConfig, RaveCityUI)
  },

  // Toggle audio
  toggleAudio: function (RaveCityConfig, RaveCityUI) {
    if (this.isPlaying) {
      this.pauseAudio(RaveCityConfig, RaveCityUI)
    } else {
      this.playAudio(RaveCityConfig, RaveCityUI)
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
  playNextTrack: function (RaveCityConfig, RaveCityUI) {
    if (RaveCityConfig.randomizeTracks) {
      const trackNames = Object.keys(RaveCityConfig.audioTracks)
      let nextTrack = trackNames[Math.floor(Math.random() * trackNames.length)]

      // Ensure we don't play the same track twice in a row
      if (nextTrack === RaveCityConfig.audioTrack && trackNames.length > 1) {
        const newTrackIndex = (trackNames.indexOf(nextTrack) + 1) % trackNames.length
        nextTrack = trackNames[newTrackIndex]
      }

      RaveCityConfig.audioTrack = nextTrack
      this.loadAudioTrack(nextTrack, RaveCityConfig, RaveCityUI)
      if (this.isPlaying) {
        this.playAudio(RaveCityConfig, RaveCityUI)
      }
    } else {
      // Play tracks in order
      const trackNames = Object.keys(RaveCityConfig.audioTracks)
      const currentTrackIndex = trackNames.indexOf(RaveCityConfig.audioTrack)
      const nextTrackIndex = (currentTrackIndex + 1) % trackNames.length
      RaveCityConfig.audioTrack = trackNames[nextTrackIndex]
      this.loadAudioTrack(trackNames[nextTrackIndex], RaveCityConfig, RaveCityUI)
      if (this.isPlaying) {
        this.playAudio(RaveCityConfig, RaveCityUI)
      }
    }

    // Update active state in track selector
    document.querySelectorAll(".track-option").forEach((option) => {
      option.classList.remove("active")
      if (
        option.querySelector(".track-title").textContent === RaveCityConfig.audioTracks[RaveCityConfig.audioTrack].title
      ) {
        option.classList.add("active")
      }
    })
  },

  // Update audio visualizer
  updateAudioVisualizer: function (RaveCityConfig, RaveCityUI) {
    if (!this.audioAnalyser || !this.isPlaying) return

    // Get frequency data
    this.frequencyData = new Uint8Array(this.audioAnalyser.frequencyBinCount)
    this.audioAnalyser.getByteFrequencyData(this.frequencyData)

    // Normalize frequency data
    const normalizedData = Array.from(this.frequencyData).map((value) => value / 256)

    // Clear visualizer
    if (RaveCityUI.visualizerCtx && RaveCityUI.elements.audioVisualizer) {
      RaveCityUI.visualizerCtx.clearRect(
        0,
        0,
        RaveCityUI.elements.audioVisualizer.width,
        RaveCityUI.elements.audioVisualizer.height,
      )

      // Draw frequency bars
      const barWidth = RaveCityUI.elements.audioVisualizer.width / (normalizedData.length / 8)
      let x = 0

      for (let i = 0; i < normalizedData.length; i += 8) {
        const value = normalizedData[i]
        const barHeight = value * RaveCityUI.elements.audioVisualizer.height

        // Create gradient for bars
        const gradient = RaveCityUI.visualizerCtx.createLinearGradient(
          0,
          RaveCityUI.elements.audioVisualizer.height - barHeight,
          0,
          RaveCityUI.elements.audioVisualizer.height,
        )
        gradient.addColorStop(0, "#ff00ff")
        gradient.addColorStop(0.5, "#00ffff")
        gradient.addColorStop(1, "#ffff00")

        RaveCityUI.visualizerCtx.fillStyle = gradient
        RaveCityUI.visualizerCtx.fillRect(
          x,
          RaveCityUI.elements.audioVisualizer.height - barHeight,
          barWidth - 1,
          barHeight,
        )

        x += barWidth
      }
    }
