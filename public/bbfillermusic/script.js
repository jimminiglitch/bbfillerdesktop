document.addEventListener("DOMContentLoaded", () => {
  console.log("🎵 Initializing...")

  // Define tracks with artist information
  const tracks = [
    {
      title: "Paper Doll (LIVE)",
      artist: "Dead Beast",
      src: "https://cdn.glitch.global/09e9ba26-fd4e-41f2-88c1-651c3d32a01a/Paper%20Doll%20(LIVE).mp3?v=1746751595622",
    },
    {
      title: "Hard Thing",
      artist: "Dead Beast",
      src: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/Dead%20Beast%20-%20Hard%20Thing.mp3?v=1746889492826",
    },
    {
      title: "Monsters",
      artist: "Dead Beast",
      src: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/Dead%20Beast%20-%20Monsters%20in%20the%20CiA.mp3?v=1746889496155",
    },
    {
      title: "F*ck",
      artist: "Dead Beast",
      src: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/Dead%20Beast%20-%20Fuck.mp3?v=1746889506198",
    },
    {
      title: "Manameisdrnk",
      artist: "Dead Beast",
      src: "https://cdn.glitch.me/09e9ba26-fd4e-41f2-88c1-651c3d32a01a/mynameisdrunk.wav?v=1746751634863",
    },
    {
      title: "L1k32D13",
      artist: "Dread Wingz",
      src: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/Dread%20Wingz%20-%20Like2Die.mp3?v=1746889500203",
    },
    {
      title: "M@k1n B@k1n",
      artist: "Dread Wingz",
      src: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/Dread%20Wingz%20-%20Makin%20Bacon.mp3?v=1746889503112",
    },
  ]

  // Safely get DOM elements with error handling
  function getElement(id) {
    const element = document.getElementById(id)
    if (!element) {
      console.error(`Element with id "${id}" not found`)
      return null
    }
    return element
  }

  // DOM refs - with safety checks
  const audio = getElement("music-player")
  const canvas = getElement("visualizer")
  const visualizer3d = getElement("visualizer-3d")
  const playlist = getElement("playlist")
  const playlistContainer = getElement("playlist-container")
  const closePlaylistBtn = getElement("close-playlist")
  const nowTxt = getElement("now-playing")
  const artistTxt = getElement("track-artist")
  const curT = getElement("current-time")
  const totT = getElement("total-time")
  const progBar = getElement("progress-bar")
  const progCon = getElement("progress-container")
  const menuBtn = getElement("menu-button")
  const prevBtn = getElement("prev-button")
  const nextBtn = getElement("next-button")
  const playBtn = getElement("play-button")
  const centerBtn = getElement("center-button")
  const modeBtns = document.querySelectorAll(".mode-button")
  const volumeIndicator = document.querySelector(".volume-indicator")
  const volumeFill = getElement("volume-fill")

  // Initialize canvas context if canvas exists
  let ctx = null
  if (canvas) {
    try {
      ctx = canvas.getContext("2d")
    } catch (e) {
      console.error("Error getting canvas context:", e)
    }
  }

  // State variables
  let currentTrackIndex = 0
  let isPlaying = false
  let visualizerMode = "bars"
  let audioContext = null
  let analyser = null
  let sourceNode = null
  let dataArray = null
  let timeData = null
  let audioInitialized = false
  let volume = 0.7
  const isMuted = false
  let animationId = null
  let wheelTouchActive = false
  let wheelAngle = 0
  let lastWheelAngle = 0

  // 3D visualization variables
  const three = {
    initialized: false,
    scene: null,
    camera: null,
    renderer: null,
    objects: [],
  }

  // Prevent screen from sleeping
  let wakeLock = null

  async function requestWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        wakeLock = await navigator.wakeLock.request("screen")
        console.log("Wake Lock is active")

        // Re-request wake lock if page becomes visible again
        document.addEventListener("visibilitychange", handleVisibilityChange)
      } else {
        console.log("Wake Lock API not supported")
      }
    } catch (err) {
      console.error(`Error requesting wake lock: ${err.name}, ${err.message}`)
    }
  }

  async function handleVisibilityChange() {
    if (document.visibilityState === "visible" && wakeLock === null) {
      await requestWakeLock()
    }
  }

  // Request wake lock when user interacts with the page
  document.addEventListener("click", () => {
    if (!wakeLock) {
      requestWakeLock()
    }
  })

  // Initialize Web Audio API
  function initAudio() {
    if (audioInitialized || !audio) return false

    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) {
        console.error("Web Audio API not supported in this browser")
        return false
      }

      audioContext = new AudioContext()

      // Create audio nodes
      analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048

      // Connect nodes
      sourceNode = audioContext.createMediaElementSource(audio)
      sourceNode.connect(analyser)
      analyser.connect(audioContext.destination)

      // Create data arrays
      dataArray = new Uint8Array(analyser.frequencyBinCount)
      timeData = new Uint8Array(analyser.frequencyBinCount)

      audioInitialized = true
      console.log("Audio system initialized successfully")
      return true
    } catch (e) {
      console.error("Error initializing audio system:", e)
      return false
    }
  }

  // Resize canvas to match container
  function resizeCanvas() {
    if (!canvas || !ctx) return

    try {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }

      // Also resize 3D renderer if initialized
      if (visualizerMode === "3d" && three.initialized && three.renderer) {
        three.renderer.setSize(container.clientWidth, container.clientHeight)
        three.camera.aspect = container.clientWidth / container.clientHeight
        three.camera.updateProjectionMatrix()
      }
    } catch (e) {
      console.error("Error resizing canvas:", e)
    }
  }

  // Call resize on load and window resize
  window.addEventListener("resize", resizeCanvas)
  resizeCanvas()

  // Build playlist
  function buildPlaylist() {
    if (!playlist) return

    try {
      // Clear existing playlist
      playlist.innerHTML = ""

      // Add tracks
      tracks.forEach((track, index) => {
        const li = document.createElement("li")
        li.innerHTML = `
          <div class="track-number">${index + 1}</div>
          <div class="track-details">
            <div class="track-title">${track.title}</div>
            <div class="track-artist-name">${track.artist}</div>
          </div>
        `
        li.onclick = () => {
          loadTrack(index)
          togglePlaylist()
        }
        playlist.appendChild(li)
      })

      console.log("Playlist built with", tracks.length, "tracks")
    } catch (e) {
      console.error("Error building playlist:", e)
    }
  }

  buildPlaylist()

  // Toggle playlist visibility
  function togglePlaylist() {
    if (playlistContainer) {
      playlistContainer.classList.toggle("active")
    }
  }

  // Load & play track
  function loadTrack(index) {
    if (!audio || !tracks[index]) return

    try {
      currentTrackIndex = index

      // Set audio source
      if (audio.src !== tracks[index].src) {
        audio.src = tracks[index].src
        audio.load() // Explicitly load the audio
      }

      // Update track info display
      if (nowTxt) nowTxt.textContent = tracks[index].title
      if (artistTxt) artistTxt.textContent = tracks[index].artist

      updateUI()

      if (isPlaying) {
        playAudio()
      }
    } catch (e) {
      console.error("Error loading track:", e)
    }
  }

  // Update UI elements
  function updateUI() {
    try {
      // Update playlist highlighting
      if (playlist) {
        const items = playlist.querySelectorAll("li")
        items.forEach((item, i) => {
          item.classList.toggle("playing", i === currentTrackIndex)
        })
      }

      // Update play button and track info icon
      const trackInfoIcon = document.querySelector(".track-info-icon")
      if (trackInfoIcon) {
        trackInfoIcon.textContent = isPlaying ? "▶" : "❚❚"
        trackInfoIcon.classList.toggle("pulse", isPlaying)
      }
    } catch (e) {
      console.error("Error updating UI:", e)
    }
  }

  // Play audio with error handling
  function playAudio() {
    if (!audio) return

    try {
      // Initialize audio if needed
      if (!audioInitialized) {
        if (!initAudio()) {
          console.error("Failed to initialize audio")
          return
        }
      }

      // Resume audio context if suspended
      if (audioContext && audioContext.state !== "running") {
        audioContext.resume().catch((e) => console.error("Error resuming audio context:", e))
      }

      // Play audio
      audio
        .play()
        .then(() => {
          isPlaying = true
          updateUI()
          console.log("Audio playback started")

          // Request wake lock when playback starts
          requestWakeLock()
        })
        .catch((e) => {
          console.error("Error playing audio:", e)
          isPlaying = false
          updateUI()
        })
    } catch (e) {
      console.error("Error in playAudio:", e)
    }
  }

  // Toggle play/pause
  function togglePlay() {
    if (!audio) return

    try {
      if (audio.paused) {
        playAudio()
      } else {
        audio.pause()
        isPlaying = false
        updateUI()
      }
    } catch (e) {
      console.error("Error toggling play:", e)
    }
  }

  // Format time as mm:ss
  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00"

    try {
      const minutes = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0")
      return `${minutes}:${secs}`
    } catch (e) {
      console.error("Error formatting time:", e)
      return "0:00"
    }
  }

  // Update time display
  if (audio) {
    audio.addEventListener("timeupdate", () => {
      try {
        if (audio.duration) {
          const percent = (audio.currentTime / audio.duration) * 100
          if (progBar) progBar.style.width = `${percent}%`
          if (curT) curT.textContent = formatTime(audio.currentTime)
          if (totT) totT.textContent = formatTime(audio.duration)
        }
      } catch (e) {
        console.error("Error updating time:", e)
      }
    })
  }

  // Handle track end
  if (audio) {
    audio.addEventListener("ended", () => {
      try {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length
        loadTrack(currentTrackIndex)
        playAudio()
      } catch (e) {
        console.error("Error handling track end:", e)
      }
    })
  }

  // Set up controls
  if (playBtn) playBtn.addEventListener("click", togglePlay)
  if (centerBtn) centerBtn.addEventListener("click", togglePlay)

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      try {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length
        loadTrack(currentTrackIndex)
      } catch (e) {
        console.error("Error on prev track:", e)
      }
    })
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      try {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length
        loadTrack(currentTrackIndex)
      } catch (e) {
        console.error("Error on next track:", e)
      }
    })
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", togglePlaylist)
  }

  if (closePlaylistBtn) {
    closePlaylistBtn.addEventListener("click", togglePlaylist)
  }

  if (progCon) {
    progCon.addEventListener("click", (e) => {
      try {
        if (!audio || !audio.duration) return

        const rect = progCon.getBoundingClientRect()
        const percent = (e.clientX - rect.left) / rect.width
        audio.currentTime = percent * audio.duration
      } catch (e) {
        console.error("Error seeking:", e)
      }
    })
  }

  // Set up visualizer mode buttons
  modeBtns.forEach((button) => {
    button.addEventListener("click", () => {
      try {
        visualizerMode = button.dataset.mode
        modeBtns.forEach((btn) => btn.classList.toggle("active", btn === button))

        // Toggle 3D mode
        if (visualizerMode === "3d") {
          if (canvas) canvas.style.display = "none"
          if (visualizer3d) visualizer3d.style.display = "block"

          // Initialize 3D if needed
          if (!three.initialized) {
            init3D()
          }
        } else {
          if (canvas) canvas.style.display = "block"
          if (visualizer3d) visualizer3d.style.display = "none"
        }
      } catch (e) {
        console.error("Error changing visualizer mode:", e)
      }
    })
  })

  // Volume control with iPod wheel
  const controlWheel = document.querySelector(".control-wheel")
  if (controlWheel) {
    // Mouse/touch events for the wheel
    controlWheel.addEventListener("mousedown", startWheelControl)
    controlWheel.addEventListener("touchstart", startWheelControl)

    document.addEventListener("mousemove", moveWheelControl)
    document.addEventListener("touchmove", moveWheelControl)

    document.addEventListener("mouseup", endWheelControl)
    document.addEventListener("touchend", endWheelControl)
  }

  function startWheelControl(e) {
    e.preventDefault()
    wheelTouchActive = true

    // Get center of wheel
    const rect = controlWheel.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Get touch/mouse position
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0

    // Calculate angle
    wheelAngle = Math.atan2(clientY - centerY, clientX - centerX)
    lastWheelAngle = wheelAngle

    // Show volume indicator
    if (volumeIndicator) {
      volumeIndicator.classList.add("active")
    }
  }

  function moveWheelControl(e) {
    if (!wheelTouchActive || !audio) return

    try {
      // Get center of wheel
      const rect = controlWheel.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Get touch/mouse position
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0

      // Calculate new angle
      const newAngle = Math.atan2(clientY - centerY, clientX - centerX)

      // Calculate angle difference
      let angleDiff = newAngle - lastWheelAngle

      // Handle angle wrap-around
      if (angleDiff > Math.PI) angleDiff -= Math.PI * 2
      if (angleDiff < -Math.PI) angleDiff += Math.PI * 2

      // Update volume based on wheel rotation
      volume += angleDiff * 0.1
      volume = Math.max(0, Math.min(1, volume))

      // Apply volume
      audio.volume = volume

      // Update volume indicator
      if (volumeFill) {
        volumeFill.style.width = `${volume * 100}%`
      }

      // Update last angle
      lastWheelAngle = newAngle
    } catch (e) {
      console.error("Error in wheel control:", e)
    }
  }

  function endWheelControl() {
    wheelTouchActive = false

    // Hide volume indicator after a delay
    setTimeout(() => {
      if (volumeIndicator) {
        volumeIndicator.classList.remove("active")
      }
    }, 1500)
  }

  // Initialize 3D visualization
  function init3D() {
    if (!visualizer3d || !window.THREE) {
      console.error("Cannot initialize 3D: missing element or THREE.js")
      return
    }

    try {
      // Create scene with fog for depth effect
      three.scene = new window.THREE.Scene()
      three.scene.fog = new window.THREE.FogExp2(0x000000, 0.02)

      // Create camera
      const container = visualizer3d
      const width = container.clientWidth
      const height = container.clientHeight
      three.camera = new window.THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
      three.camera.position.z = 20

      // Create renderer with post-processing capabilities
      three.renderer = new window.THREE.WebGLRenderer({ antialias: true, alpha: true })
      three.renderer.setSize(width, height)
      three.renderer.setClearColor(0x000000, 0)

      // Add renderer to container
      container.innerHTML = ""
      container.appendChild(three.renderer.domElement)

      // Add dynamic lighting
      const ambientLight = new window.THREE.AmbientLight(0xffffff, 0.3)
      three.scene.add(ambientLight)

      // Add multiple colored point lights
      const colors = [0x00ffff, 0xff00ff, 0xffff00]
      colors.forEach((color, i) => {
        const pointLight = new window.THREE.PointLight(color, 1, 100)
        const angle = (i / colors.length) * Math.PI * 2
        pointLight.position.set(Math.cos(angle) * 15, Math.sin(angle) * 15, 10)
        three.scene.add(pointLight)

        // Add light helper for visual effect
        const lightSphere = new window.THREE.Mesh(
          new window.THREE.SphereGeometry(0.5, 16, 16),
          new window.THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.7 }),
        )
        lightSphere.position.copy(pointLight.position)
        three.scene.add(lightSphere)
      })

      // Create 3D objects with more complex geometries
      create3DObjects()

      three.initialized = true
      console.log("3D visualization initialized")
    } catch (e) {
      console.error("Error initializing 3D:", e)
    }
  }

  // Create more psychedelic 3D objects
  function create3DObjects() {
    if (!three.scene) return

    try {
      // Create a group to hold all objects
      const group = new window.THREE.Group()
      three.scene.add(group)
      three.objects.push(group)

      // Create cubes in a circle with more complex materials
      const cubeCount = 64 // More cubes for more detail
      for (let i = 0; i < cubeCount; i++) {
        // Use more complex geometry
        const geometry = new window.THREE.BoxGeometry(1, 1, 1, 2, 2, 2)

        // Create more complex material with environment mapping
        const material = new window.THREE.MeshPhongMaterial({
          color: new window.THREE.Color(`hsl(${(i / cubeCount) * 360}, 100%, 50%)`),
          transparent: true,
          opacity: 0.8,
          specular: 0xffffff,
          shininess: 100,
          flatShading: true,
          emissive: new window.THREE.Color(`hsl(${((i / cubeCount) * 360 + 180) % 360}, 100%, 30%)`),
          emissiveIntensity: 0.5,
        })

        const cube = new window.THREE.Mesh(geometry, material)

        // Position in a spiral pattern
        const angle = (i / cubeCount) * Math.PI * 2
        const radius = 10 + (i / cubeCount) * 5
        cube.position.x = Math.cos(angle) * radius
        cube.position.y = Math.sin(angle) * radius
        cube.position.z = (i / cubeCount) * 10 - 5

        // Add random rotation
        cube.rotation.x = Math.random() * Math.PI
        cube.rotation.y = Math.random() * Math.PI
        cube.rotation.z = Math.random() * Math.PI

        group.add(cube)
      }

      // Create center sphere with more complex geometry
      const sphereGeometry = new window.THREE.SphereGeometry(3, 64, 64)
      const sphereMaterial = new window.THREE.MeshPhongMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.6,
        specular: 0xffffff,
        shininess: 100,
        wireframe: true,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5,
      })

      const sphere = new window.THREE.Mesh(sphereGeometry, sphereMaterial)
      group.add(sphere)

      // Add a secondary pulsing sphere inside
      const innerSphereGeometry = new window.THREE.IcosahedronGeometry(2, 2)
      const innerSphereMaterial = new window.THREE.MeshPhongMaterial({
        color: 0xff00ff,
        transparent: true,
        opacity: 0.4,
        specular: 0xffffff,
        shininess: 100,
        flatShading: true,
        emissive: 0xff00ff,
        emissiveIntensity: 0.7,
      })

      const innerSphere = new window.THREE.Mesh(innerSphereGeometry, innerSphereMaterial)
      group.add(innerSphere)

      // Add a particle system for background stars
      const particleCount = 1000
      const particleGeometry = new window.THREE.BufferGeometry()
      const particlePositions = new Float32Array(particleCount * 3)
      const particleSizes = new Float32Array(particleCount)
      const particleColors = new Float32Array(particleCount * 3)

      for (let i = 0; i < particleCount; i++) {
        // Position particles in a large sphere around the scene
        const radius = 50 + Math.random() * 100
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)

        particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
        particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        particlePositions[i * 3 + 2] = radius * Math.cos(phi)

        // Random sizes
        particleSizes[i] = 0.5 + Math.random() * 2

        // Random colors
        const hue = Math.random()
        const color = new window.THREE.Color().setHSL(hue, 1, 0.5)
        particleColors[i * 3] = color.r
        particleColors[i * 3 + 1] = color.g
        particleColors[i * 3 + 2] = color.b
      }

      particleGeometry.setAttribute("position", new window.THREE.BufferAttribute(particlePositions, 3))
      particleGeometry.setAttribute("size", new window.THREE.BufferAttribute(particleSizes, 1))
      particleGeometry.setAttribute("color", new window.THREE.BufferAttribute(particleColors, 3))

      // Create particle material
      const particleMaterial = new window.THREE.PointsMaterial({
        size: 1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
      })

      const particleSystem = new window.THREE.Points(particleGeometry, particleMaterial)
      three.scene.add(particleSystem)

      // Add some floating geometric shapes
      const geometries = [
        new window.THREE.TetrahedronGeometry(1, 0),
        new window.THREE.OctahedronGeometry(1, 0),
        new window.THREE.DodecahedronGeometry(1, 0),
        new window.THREE.IcosahedronGeometry(1, 0),
      ]

      for (let i = 0; i < 20; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)]
        const material = new window.THREE.MeshPhongMaterial({
          color: new window.THREE.Color().setHSL(Math.random(), 0.8, 0.5),
          transparent: true,
          opacity: 0.7,
          flatShading: true,
          emissive: new window.THREE.Color().setHSL(Math.random(), 0.8, 0.3),
          emissiveIntensity: 0.5,
        })

        const shape = new window.THREE.Mesh(geometry, material)

        // Position randomly
        const radius = 15 + Math.random() * 10
        const angle = Math.random() * Math.PI * 2
        const height = (Math.random() - 0.5) * 20

        shape.position.x = Math.cos(angle) * radius
        shape.position.y = height
        shape.position.z = Math.sin(angle) * radius

        // Random scale
        const scale = 0.5 + Math.random() * 1.5
        shape.scale.set(scale, scale, scale)

        // Random rotation
        shape.rotation.x = Math.random() * Math.PI * 2
        shape.rotation.y = Math.random() * Math.PI * 2
        shape.rotation.z = Math.random() * Math.PI * 2

        // Add to scene
        group.add(shape)
      }
    } catch (e) {
      console.error("Error creating 3D objects:", e)
    }
  }

  // Update 3D visualization
  function update3D() {
    if (!three.initialized || !analyser || !dataArray) return

    try {
      // Get audio data
      analyser.getByteFrequencyData(dataArray)

      // Calculate average levels for different frequency ranges
      let bassSum = 0,
        midSum = 0,
        highSum = 0
      const bassRange = 10,
        midRange = 100,
        highRange = 300

      for (let i = 0; i < bassRange; i++) {
        bassSum += dataArray[i]
      }
      for (let i = bassRange; i < midRange; i++) {
        midSum += dataArray[i]
      }
      for (let i = midRange; i < highRange; i++) {
        highSum += dataArray[i]
      }

      const bassLevel = bassSum / (bassRange * 255)
      const midLevel = midSum / ((midRange - bassRange) * 255)
      const highLevel = highSum / ((highRange - midRange) * 255)

      const time = Date.now() * 0.001

      // Get the main group
      const group = three.objects[0]
      if (!group) return

      // Create more complex rotation patterns
      group.rotation.y += 0.005
      group.rotation.x = Math.sin(time * 0.5) * 0.3
      group.rotation.z = Math.cos(time * 0.3) * 0.2

      // Add pulsing scale to the entire group
      const groupPulse = 1 + bassLevel * 0.3
      group.scale.set(groupPulse, groupPulse, groupPulse)

      // Update cubes based on frequency data with more psychedelic effects
      const cubes = group.children.filter((child) => child.geometry && child.geometry.type === "BoxGeometry")

      const cubeCount = cubes.length
      for (let i = 0; i < cubeCount; i++) {
        const cube = cubes[i]
        const dataIndex = Math.floor((i / cubeCount) * dataArray.length)
        const value = dataArray[dataIndex] / 255

        // Create more dynamic scaling
        const pulseEffect = 1 + Math.sin(time * 3 + i * 0.2) * 0.3
        cube.scale.y = 1 + value * 8 * pulseEffect

        // Add x and z scaling for more dimension
        cube.scale.x = 1 + value * 2 * Math.sin(time + i * 0.1)
        cube.scale.z = 1 + value * 2 * Math.cos(time + i * 0.1)

        // Create more complex movement patterns
        const angle = (i / cubeCount) * Math.PI * 2
        const radiusBase = 10 + value * 8

        // Add spiral effect
        const spiralOffset = i * 0.05 * Math.sin(time * 0.5)
        const verticalOffset = Math.sin(time * 2 + i * 0.2) * 5 * value

        cube.position.x = Math.cos(angle + time * (0.2 + value * 0.3)) * (radiusBase + spiralOffset)
        cube.position.y = Math.sin(angle + time * (0.2 + value * 0.3)) * (radiusBase + spiralOffset) + verticalOffset
        cube.position.z = value * 10 * Math.sin(time + i * 0.1)

        // Add more complex rotation
        cube.rotation.x += value * 0.2
        cube.rotation.y += value * 0.2
        cube.rotation.z += value * 0.1 * Math.sin(time)

        // Update color with more psychedelic patterns
        const hue = ((i / cubeCount) * 360 + time * 100) % 360
        if (cube.material) {
          // Create more vibrant colors
          cube.material.color.setHSL(hue / 360, 0.8 + value * 0.2, 0.4 + value * 0.4)
          cube.material.opacity = 0.6 + value * 0.4

          // Add emissive glow that changes with the music
          cube.material.emissive = new THREE.Color()
          cube.material.emissive.setHSL(((hue + 180) % 360) / 360, 1, value * 0.5)
          cube.material.emissiveIntensity = value * 2
        }

        // Morph cube geometry for high frequencies
        if (value > 0.8 && cube.geometry) {
          const vertices = cube.geometry.attributes.position.array
          for (let v = 0; v < vertices.length; v += 3) {
            const vertexIndex = v / 3
            const noiseX = Math.sin(time * 5 + vertexIndex) * value * 0.2
            const noiseY = Math.cos(time * 5 + vertexIndex) * value * 0.2
            const noiseZ = Math.sin(time * 5 + vertexIndex + Math.PI / 2) * value * 0.2

            vertices[v] = (vertices[v] > 0 ? 0.5 : -0.5) + noiseX
            vertices[v + 1] = (vertices[v + 1] > 0 ? 0.5 : -0.5) + noiseY
            vertices[v + 2] = (vertices[v + 2] > 0 ? 0.5 : -0.5) + noiseZ
          }
          cube.geometry.attributes.position.needsUpdate = true
        }
      }

      // Update center sphere with more psychedelic effects
      const sphere = group.children.find((child) => child.geometry && child.geometry.type === "SphereGeometry")

      if (sphere) {
        // Create pulsing effect synchronized with bass
        const bassPulse = 1 + bassLevel * 3 * (0.8 + Math.sin(time * 2) * 0.2)
        sphere.scale.set(bassPulse, bassPulse, bassPulse)

        // Add distortion to sphere based on mid frequencies
        if (sphere.geometry) {
          const vertices = sphere.geometry.attributes.position.array
          const originalPositions = sphere.geometry.userData.originalPositions

          // Store original positions if not already stored
          if (!originalPositions) {
            sphere.geometry.userData.originalPositions = new Float32Array(vertices.length)
            for (let i = 0; i < vertices.length; i++) {
              sphere.geometry.userData.originalPositions[i] = vertices[i]
            }
          }

          // Apply distortion
          for (let i = 0; i < vertices.length; i += 3) {
            const originalX = originalPositions[i]
            const originalY = originalPositions[i + 1]
            const originalZ = originalPositions[i + 2]

            const distortionFactor = midLevel * 2
            const noiseX = Math.sin(time * 3 + originalY * 5) * distortionFactor
            const noiseY = Math.cos(time * 2 + originalZ * 5) * distortionFactor
            const noiseZ = Math.sin(time * 4 + originalX * 5) * distortionFactor

            vertices[i] = originalX + noiseX
            vertices[i + 1] = originalY + noiseY
            vertices[i + 2] = originalZ + noiseZ
          }

          sphere.geometry.attributes.position.needsUpdate = true
        }

        // Change color with time and high frequencies
        const hue = (time * 100) % 360
        if (sphere.material) {
          sphere.material.color.setHSL(hue / 360, 1, 0.5)
          sphere.material.opacity = 0.6 + highLevel * 0.4
          sphere.material.wireframe = true
          sphere.material.wireframeLinewidth = 1 + highLevel * 2
        }

        // Add complex rotation
        sphere.rotation.y += 0.02
        sphere.rotation.x += 0.01
        sphere.rotation.z += 0.005 * Math.sin(time)
      }

      // Add new objects dynamically based on audio intensity
      if (Math.random() < bassLevel * 0.2) {
        // Create floating particles that appear with bass hits
        const particleGeometry = new THREE.SphereGeometry(0.2, 8, 8)
        const particleMaterial = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(Math.random(), 1, 0.7),
          emissive: new THREE.Color().setHSL(Math.random(), 1, 0.5),
          transparent: true,
          opacity: 0.8,
        })

        const particle = new THREE.Mesh(particleGeometry, particleMaterial)

        // Position randomly around the sphere
        const angle = Math.random() * Math.PI * 2
        const radius = 5 + Math.random() * 15
        const height = (Math.random() - 0.5) * 20

        particle.position.x = Math.cos(angle) * radius
        particle.position.y = height
        particle.position.z = Math.sin(angle) * radius

        // Add velocity for animation
        particle.userData = {
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
          ),
          life: 100 + Math.random() * 100,
        }

        group.add(particle)

        // Limit the number of particles
        if (group.children.length > 200) {
          // Remove oldest particles
          const particlesToRemove = group.children
            .filter((child) => child.geometry && child.geometry.type === "SphereGeometry" && child !== sphere)
            .slice(0, 10)

          particlesToRemove.forEach((p) => group.remove(p))
        }
      }

      // Animate existing particles
      const particles = group.children.filter(
        (child) =>
          child.geometry &&
          child.geometry.type === "SphereGeometry" &&
          child !== sphere &&
          child.userData &&
          child.userData.velocity,
      )

      particles.forEach((particle) => {
        // Move particle
        particle.position.x += particle.userData.velocity.x
        particle.position.y += particle.userData.velocity.y
        particle.position.z += particle.userData.velocity.z

        // Rotate particle
        particle.rotation.x += 0.02
        particle.rotation.y += 0.02

        // Reduce life and fade out
        particle.userData.life -= 1
        if (particle.userData.life < 50) {
          particle.material.opacity = particle.userData.life / 50
        }

        // Remove dead particles
        if (particle.userData.life <= 0) {
          group.remove(particle)
        }
      })

      // Render the scene
      three.renderer.render(three.scene, three.camera)
    } catch (e) {
      console.error("Error updating 3D:", e)
    }
  }

  // Draw bars visualizer
  function drawBars() {
    if (!ctx || !analyser || !dataArray) return

    try {
      const width = canvas.width
      const height = canvas.height

      // Get frequency data
      analyser.getByteFrequencyData(dataArray)

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Add a trippy background
      const time = Date.now() * 0.001
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, height)
      gradient.addColorStop(0, `hsla(${(time * 20) % 360}, 100%, 20%, 0.2)`)
      gradient.addColorStop(0.5, `hsla(${(time * 20 + 120) % 360}, 100%, 10%, 0.2)`)
      gradient.addColorStop(1, `hsla(${(time * 20 + 240) % 360}, 100%, 5%, 0.2)`)

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      const barCount = dataArray.length / 3 // Use more data for better visuals
      const barWidth = width / barCount
      const barSpacing = 1

      // Draw bars with enhanced effects
      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i] / 255

        // Make bar height more dynamic with time
        const pulseEffect = 0.8 + Math.sin(time * 2 + i * 0.1) * 0.2
        const barHeight = value * height * 0.9 * pulseEffect

        // Calculate position with a wave effect
        const xPos = i * barWidth + barSpacing / 2
        const waveOffset = Math.sin(time * 2 + i * 0.1) * 10 * value

        // Calculate color based on frequency, position, and time
        const hue = ((i / barCount) * 360 + time * 50) % 360
        const saturation = 80 + value * 20
        const lightness = 40 + value * 30

        // Create gradient for each bar
        const barGradient = ctx.createLinearGradient(xPos, height, xPos, height - barHeight)
        barGradient.addColorStop(0, `hsl(${hue}, ${saturation}%, ${lightness}%)`)
        barGradient.addColorStop(0.5, `hsl(${(hue + 30) % 360}, ${saturation}%, ${lightness + 10}%)`)
        barGradient.addColorStop(1, `hsl(${(hue + 60) % 360}, ${saturation}%, ${lightness + 20}%)`)

        ctx.fillStyle = barGradient

        // Draw the bar with a wave effect
        ctx.beginPath()
        ctx.moveTo(xPos, height)
        ctx.lineTo(xPos + waveOffset / 4, height - barHeight)
        ctx.lineTo(xPos + barWidth - barSpacing - waveOffset / 4, height - barHeight)
        ctx.lineTo(xPos + barWidth - barSpacing, height)
        ctx.closePath()
        ctx.fill()

        // Add glow for high amplitudes
        if (value > 0.5) {
          ctx.shadowColor = `hsl(${hue}, 100%, 50%)`
          ctx.shadowBlur = 15 * value
          ctx.fillRect(xPos, height - barHeight, barWidth - barSpacing, barHeight)
          ctx.shadowBlur = 0

          // Add a pulsing circle on top of high-amplitude bars
          if (value > 0.8) {
            ctx.beginPath()
            const circleRadius = value * 5 * (0.8 + Math.sin(time * 5) * 0.2)
            ctx.arc(xPos + (barWidth - barSpacing) / 2, height - barHeight - circleRadius, circleRadius, 0, Math.PI * 2)
            ctx.fillStyle = `hsla(${(hue + 180) % 360}, 100%, 70%, 0.8)`
            ctx.fill()
          }
        }
      }

      // Add floating particles based on audio intensity
      let avgAmplitude = 0
      for (let i = 0; i < dataArray.length; i++) {
        avgAmplitude += dataArray[i]
      }
      avgAmplitude = avgAmplitude / (dataArray.length * 255)

      const particleCount = Math.floor(avgAmplitude * 50)

      for (let i = 0; i < particleCount; i++) {
        const particleSize = 2 + Math.random() * 3 * avgAmplitude
        const x = Math.random() * width
        const y = Math.random() * height
        const hue = (time * 100 + i * 30) % 360

        ctx.beginPath()
        ctx.arc(x, y, particleSize, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.7)`
        ctx.fill()
      }
    } catch (e) {
      console.error("Error drawing bars:", e)
    }
  }

  // Enhance the drawWave function to make it more psychedelic
  function drawWave() {
    if (!ctx || !analyser || !dataArray || !timeData) return

    try {
      const width = canvas.width
      const height = canvas.height

      // Get time domain data
      analyser.getByteTimeDomainData(timeData)
      analyser.getByteFrequencyData(dataArray)

      // Calculate average frequency for color
      let sum = 0
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i]
      }
      const avgFreq = sum / dataArray.length / 255

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Add a trippy background
      const time = Date.now() * 0.001

      // Create a moving pattern in the background
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath()

        for (let x = 0; x < width; x++) {
          const waveHeight = Math.sin(x * 0.01 + y * 0.01 + time) * 10 * avgFreq
          const yPos = y + waveHeight

          if (x === 0) {
            ctx.moveTo(x, yPos)
          } else {
            ctx.lineTo(x, yPos)
          }
        }

        const hue = (y + time * 50) % 360
        ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 0.1)`
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Draw multiple waves with different colors and phases
      for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath()
        ctx.lineWidth = 3 - wave * 0.5

        // Create gradient for line with shifting colors
        const gradient = ctx.createLinearGradient(0, 0, width, 0)
        const baseHue = (Date.now() * 0.05 + wave * 120) % 360
        gradient.addColorStop(0, `hsl(${baseHue}, 100%, 50%)`)
        gradient.addColorStop(0.33, `hsl(${(baseHue + 60) % 360}, 100%, 50%)`)
        gradient.addColorStop(0.66, `hsl(${(baseHue + 120) % 360}, 100%, 50%)`)
        gradient.addColorStop(1, `hsl(${(baseHue + 180) % 360}, 100%, 50%)`)

        ctx.strokeStyle = gradient

        // Add phase shift for each wave
        const phaseShift = (wave * Math.PI) / 3

        // Draw waveform with distortion effects
        for (let i = 0; i < timeData.length; i++) {
          const x = (i / timeData.length) * width

          // Add distortion based on frequency data
          const distortionIndex = Math.floor((i / timeData.length) * dataArray.length)
          const distortion = (dataArray[distortionIndex] / 255) * 30

          // Calculate y position with time-based modulation
          const normalizedValue = timeData[i] / 128 - 1
          const modulatedValue = normalizedValue * (0.8 + Math.sin(time * 2 + phaseShift) * 0.2)
          const y = (modulatedValue * height) / 2 + height / 2 + Math.sin(x * 0.01 + time + phaseShift) * distortion

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            // Use quadratic curves for smoother waves
            const prevX = ((i - 1) / timeData.length) * width
            const midX = (prevX + x) / 2
            const midY = (ctx.currentY + y) / 2
            ctx.quadraticCurveTo(prevX, ctx.currentY, midX, midY)
            ctx.lineTo(x, y)
          }
        }

        // Add glow effect that pulses with the music
        ctx.shadowColor = `hsl(${(Date.now() * 0.05 + wave * 120) % 360}, 100%, 50%)`
        ctx.shadowBlur = 10 + avgFreq * 30 + Math.sin(time * 3) * 5
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      // Add floating particles that follow the wave
      const particleCount = Math.floor(avgFreq * 100)

      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * width
        const timeDataIndex = Math.floor((x / width) * timeData.length)
        const normalizedValue = timeData[timeDataIndex] / 128 - 1
        const y = (normalizedValue * height) / 2 + height / 2

        const particleSize = 1 + Math.random() * 3 * avgFreq
        const hue = (time * 100 + i * 30) % 360

        ctx.beginPath()
        ctx.arc(x, y, particleSize, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.7)`
        ctx.fill()
      }
    } catch (e) {
      console.error("Error drawing wave:", e)
    }
  }

  // Enhance the drawCircle function to make it more psychedelic
  function drawCircle() {
    if (!ctx || !analyser || !dataArray) return

    try {
      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2

      // Get frequency data
      analyser.getByteFrequencyData(dataArray)

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Add a trippy background
      const time = Date.now() * 0.001

      // Create a spiraling background
      for (let radius = 0; radius < Math.max(width, height); radius += 20) {
        ctx.beginPath()

        for (let angle = 0; angle < Math.PI * 2; angle += 0.01) {
          const x = centerX + Math.cos(angle + time + radius * 0.01) * radius
          const y = centerY + Math.sin(angle + time + radius * 0.01) * radius

          if (angle === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        const hue = (radius + time * 50) % 360
        ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 0.1)`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Calculate base radius and rotation
      const baseRadius = Math.min(width, height) / 4
      const rotation = Date.now() * 0.002

      // Calculate average frequency for effects
      let sum = 0
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i]
      }
      const avgFreq = sum / dataArray.length / 255

      // Draw multiple frequency circles with different effects
      for (let layer = 0; layer < 3; layer++) {
        const layerOffset = (layer * Math.PI) / 6
        const layerScale = 1 - layer * 0.15

        // Draw frequency bins in a circle
        for (let i = 0; i < dataArray.length; i += 2) {
          const angle = (i / dataArray.length) * Math.PI * 2 + rotation + layerOffset
          const value = dataArray[i] / 255

          // Add pulsing effect to amplitude
          const pulseEffect = 0.8 + Math.sin(time * 3 + i * 0.05) * 0.2
          const amplitude = value * baseRadius * pulseEffect * layerScale

          // Add spiral effect
          const spiralFactor = 0.1 * Math.sin(time + layer)
          const spiralRadius = baseRadius * layerScale + i * spiralFactor

          // Calculate positions with distortion
          const distortion = Math.sin(angle * 5 + time * 2) * value * 10
          const innerX = centerX + Math.cos(angle) * spiralRadius + distortion
          const innerY = centerY + Math.sin(angle) * spiralRadius + distortion
          const outerX = centerX + Math.cos(angle) * (spiralRadius + amplitude) + distortion
          const outerY = centerY + Math.sin(angle) * (spiralRadius + amplitude) + distortion

          // Calculate color with more vibrant shifts
          const hue = ((angle * 180) / Math.PI + Date.now() * 0.05 + layer * 120) % 360
          const saturation = 90 + value * 10
          const lightness = 40 + value * 30

          // Create gradient for each line
          const lineGradient = ctx.createLinearGradient(innerX, innerY, outerX, outerY)
          lineGradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.7)`)
          lineGradient.addColorStop(1, `hsla(${(hue + 60) % 360}, ${saturation}%, ${lightness + 20}%, 0.9)`)

          // Draw line from inner to outer point
          ctx.beginPath()
          ctx.moveTo(innerX, innerY)
          ctx.lineTo(outerX, outerY)
          ctx.lineWidth = 2 + value * 5
          ctx.strokeStyle = lineGradient

          // Add glow effect
          ctx.shadowColor = `hsl(${hue}, 100%, 50%)`
          ctx.shadowBlur = 10 * value
          ctx.stroke()
          ctx.shadowBlur = 0

          // Draw point at the end with pulsing effect
          const pointSize = 2 + value * 8 * (0.8 + Math.sin(time * 5 + i * 0.1) * 0.2)
          ctx.beginPath()
          ctx.arc(outerX, outerY, pointSize, 0, Math.PI * 2)

          // Create radial gradient for point
          const pointGradient = ctx.createRadialGradient(outerX, outerY, 0, outerX, outerY, pointSize)
          pointGradient.addColorStop(0, `hsla(${(hue + 30) % 360}, 100%, 70%, 0.9)`)
          pointGradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0.1)`)

          ctx.fillStyle = pointGradient
          ctx.fill()

          // Connect points with curves for high frequencies
          if (value > 0.7 && i % 8 === 0) {
            const nextI = (i + 8) % dataArray.length
            const nextAngle = (nextI / dataArray.length) * Math.PI * 2 + rotation + layerOffset
            const nextValue = dataArray[nextI] / 255
            const nextAmplitude = nextValue * baseRadius * pulseEffect * layerScale
            const nextOuterX = centerX + Math.cos(nextAngle) * (spiralRadius + nextAmplitude) + distortion
            const nextOuterY = centerY + Math.sin(nextAngle) * (spiralRadius + nextAmplitude) + distortion

            ctx.beginPath()
            ctx.moveTo(outerX, outerY)

            // Create a curved connection
            const controlX =
              centerX + Math.cos((angle + nextAngle) / 2) * (spiralRadius + Math.max(amplitude, nextAmplitude) * 1.5)
            const controlY =
              centerY + Math.sin((angle + nextAngle) / 2) * (spiralRadius + Math.max(amplitude, nextAmplitude) * 1.5)

            ctx.quadraticCurveTo(controlX, controlY, nextOuterX, nextOuterY)

            ctx.strokeStyle = `hsla(${(hue + 120) % 360}, 100%, 70%, ${value * 0.3})`
            ctx.lineWidth = 1 + value * 2
            ctx.stroke()
          }
        }
      }

      // Draw center with complex patterns
      const centerLayers = 5
      for (let i = 0; i < centerLayers; i++) {
        const layerTime = time + (i * Math.PI) / centerLayers
        const pulseSize =
          baseRadius * 0.3 * (0.6 + avgFreq * 0.8) * (0.8 + Math.sin(layerTime * 2) * 0.2) * (1 - i * 0.15)

        ctx.beginPath()

        // Create star-like shapes for center
        const points = 5 + i * 2
        for (let p = 0; p < points * 2; p++) {
          const pointRadius = p % 2 === 0 ? pulseSize : pulseSize * 0.6
          const pointAngle = (p * Math.PI) / points + layerTime

          const x = centerX + Math.cos(pointAngle) * pointRadius
          const y = centerY + Math.sin(pointAngle) * pointRadius

          if (p === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.closePath()

        // Create gradient fill
        const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize)
        const baseHue = (time * 50 + i * 30) % 360
        centerGradient.addColorStop(0, `hsla(${baseHue}, 100%, 70%, 0.9)`)
        centerGradient.addColorStop(0.5, `hsla(${(baseHue + 60) % 360}, 100%, 50%, 0.7)`)
        centerGradient.addColorStop(1, `hsla(${(baseHue + 120) % 360}, 100%, 30%, 0.1)`)

        ctx.fillStyle = centerGradient

        // Add glow effect
        ctx.shadowColor = `hsl(${baseHue}, 100%, 50%)`
        ctx.shadowBlur = 20 * avgFreq
        ctx.fill()
        ctx.shadowBlur = 0

        // Add rotating outline
        ctx.strokeStyle = `hsla(${(baseHue + 180) % 360}, 100%, 70%, 0.5)`
        ctx.lineWidth = 1 + avgFreq * 2
        ctx.stroke()
      }

      // Add floating particles that orbit the center
      const particleCount = Math.floor(avgFreq * 100)

      for (let i = 0; i < particleCount; i++) {
        const orbitRadius = baseRadius * (0.5 + Math.random() * 2)
        const orbitAngle = Math.random() * Math.PI * 2 + time * (0.5 + Math.random())
        const x = centerX + Math.cos(orbitAngle) * orbitRadius
        const y = centerY + Math.sin(orbitAngle) * orbitRadius

        const particleSize = 1 + Math.random() * 3 * avgFreq
        const hue = (time * 100 + i * 30) % 360

        ctx.beginPath()
        ctx.arc(x, y, particleSize, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.7)`
        ctx.fill()
      }
    } catch (e) {
      console.error("Error drawing circle:", e)
    }
  }

  // Draw placeholder when not playing
  function drawPlaceholder() {
    if (!ctx) return

    try {
      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw multiple pulsing circles
      const time = Date.now() * 0.001

      // Draw several concentric circles with different colors and phases
      for (let i = 0; i < 5; i++) {
        const phase = (i * Math.PI) / 5
        const pulseSpeed = 0.5 + i * 0.2
        const radius = ((Math.min(width, height) / 5) * (0.8 + Math.sin(time * pulseSpeed + phase) * 0.2) * (i + 1)) / 3

        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `hsl(${(time * 30 + i * 60) % 360}, 100%, 50%)`
        ctx.lineWidth = 2 + Math.sin(time * pulseSpeed + phase) * 1

        // Add glow effect
        ctx.shadowColor = `hsl(${(time * 30 + i * 60) % 360}, 100%, 50%)`
        ctx.shadowBlur = 10 + Math.sin(time * pulseSpeed) * 5

        ctx.stroke()
        ctx.shadowBlur = 0
      }

      // Add a spinning star in the center
      const starPoints = 5
      const outerRadius = Math.min(width, height) / 10
      const innerRadius = outerRadius / 2

      ctx.beginPath()
      for (let i = 0; i < starPoints * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const angle = (i * Math.PI) / starPoints + time
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()

      // Create a rainbow gradient fill
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, outerRadius)
      gradient.addColorStop(0, `hsl(${(time * 100) % 360}, 100%, 70%)`)
      gradient.addColorStop(0.5, `hsl(${(time * 100 + 120) % 360}, 100%, 50%)`)
      gradient.addColorStop(1, `hsl(${(time * 100 + 240) % 360}, 100%, 70%)`)

      ctx.fillStyle = gradient
      ctx.fill()

      // Add rotation effect to the whole canvas
      ctx.translate(centerX, centerY)
      ctx.rotate(time * 0.1)
      ctx.translate(-centerX, -centerY)
    } catch (e) {
      console.error("Error drawing placeholder:", e)
    }
  }

  // Main visualization loop
  function draw() {
    try {
      // Cancel any existing animation frame
      if (animationId) {
        cancelAnimationFrame(animationId)
      }

      // If 3D mode is active, update 3D visualization
      if (visualizerMode === "3d") {
        if (three.initialized) {
          if (audioInitialized && isPlaying) {
            update3D()
          } else {
            // Just render the scene without updates
            if (three.renderer && three.scene && three.camera) {
              three.renderer.render(three.scene, three.camera)
            }
          }
        }
        animationId = requestAnimationFrame(draw)
        return
      }

      // If audio isn't initialized or playing, show placeholder
      if (!audioInitialized || !isPlaying) {
        drawPlaceholder()
        animationId = requestAnimationFrame(draw)
        return
      }

      // Draw selected visualization
      switch (visualizerMode) {
        case "bars":
          drawBars()
          break
        case "wave":
          drawWave()
          break
        case "circle":
          drawCircle()
          break
        default:
          drawBars()
      }

      // Continue animation loop
      animationId = requestAnimationFrame(draw)
    } catch (e) {
      console.error("Error in draw loop:", e)
      // Try to continue the animation even if there was an error
      animationId = requestAnimationFrame(draw)
    }
  }

  // Start visualization loop
  draw()

  // Load first track
  loadTrack(0)

  console.log("🎵 SonicWave Music Player initialization complete")
})
