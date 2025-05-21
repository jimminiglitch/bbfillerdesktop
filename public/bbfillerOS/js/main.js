document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const landingScreen = document.getElementById("landing-screen")
  const bootScreen = document.getElementById("boot-screen")
  const bootLog = document.getElementById("boot-log")
  const progressBar = document.getElementById("progress-bar")

  // Only show landing screen at first
  landingScreen.style.display = "block"
  bootScreen.style.display = "none"

  // Track if profile image container has been created
  let profileContainerCreated = false
  let profileContainer = null

  // Configuration
  const CONFIG = {
    typing: {
      charDelay: 8, // Typing speed (ms per character)
      lineDelay: 150, // Delay between lines (ms)
      bootCompleteDelay: 800, // Final delay before transition (ms)
    },
    effects: {
      glitchProbability: 0.15, // Chance of glitch during typing
    },
    destination: "https://bbfillerdesktop.glitch.me", // Replace with your actual destination URL
    profileImage: "https://cdn.glitch.global/ba671d66-b64b-4bff-a7ec-568854635b97/Benny.png?v=1747652946347",
  }

  // Boot messages
  const bootMessages = [
    "Initializing neural interface...",
    "Bypassing reality filters...",
    "Injecting perception modifiers...",
    "Recalibrating sensory inputs...",
    "Dissolving cognitive boundaries...",
    "Fragmenting linear time constructs...",
    "Synthesizing quantum consciousness...",
    "Activating psychedelic protocols...",
    "Transcending dimensional limits...",
    "REALITY OVERRIDE COMPLETE",
  ]

  // Audio Configuration
  const CONFIG_AUDIO = {
    mainVolume: 0.3,
    ambientVolume: 0.12,
    effectsVolume: 0.25,
  }

  // Enhanced Audio System
  const AudioSystem = {
    // Main glitch sound
    glitchSfx: new Audio(
      "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/retro-blip-2-236668.mp3?v=1746891741011",
    ),

    // Additional sound effects
    glitchSounds: [
      {
        audio: new Audio(
          "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/retro-blip-2-236668.mp3?v=1746891741011",
        ),
        volume: CONFIG_AUDIO.effectsVolume * 0.8,
      },
      {
        audio: new Audio(
          "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/big-robot-footstep-330678.mp3?v=1746884720082",
        ),
        volume: CONFIG_AUDIO.effectsVolume * 0.6,
      },
      {
        audio: new Audio(
          "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/typing-42562.mp3?v=1746884408348",
        ),
        volume: CONFIG_AUDIO.effectsVolume,
      },
    ],

    // Low frequency drone for ambience
    droneSfx: new Audio("https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/psychtoad.mp3?v=1746846223194"),

    init() {
      // Set up main glitch sound
      this.glitchSfx.volume = CONFIG_AUDIO.mainVolume

      // Set up ambient drone
      this.droneSfx.volume = CONFIG_AUDIO.ambientVolume
      this.droneSfx.loop = true
    },

    // Play a random glitch sound
    playRandomGlitch() {
      if (Math.random() < 0.4) {
        // Increased probability
        const soundIndex = Math.floor(Math.random() * this.glitchSounds.length)
        const sound = this.glitchSounds[soundIndex]

        try {
          sound.audio.currentTime = 0
          this.playSound(sound.audio)
        } catch (e) {
          console.log("Audio error:", e)
        }
      }
    },

    // Safely play a sound with error handling
    playSound(audio) {
      try {
        audio.play().catch((e) => console.log("Audio play prevented by browser"))
      } catch (e) {
        console.log("Audio error:", e)
      }
    },

    // Fade out ambient sound
    fadeOutAmbient() {
      if (!this.droneSfx) return

      const fadeInterval = setInterval(() => {
        if (this.droneSfx.volume > 0.01) {
          this.droneSfx.volume -= 0.01
        } else {
          this.droneSfx.pause()
          clearInterval(fadeInterval)
        }
      }, 100)
    },
  }

  // Initialize audio system
  AudioSystem.init()

  // Handle click on landing screen
  landingScreen.addEventListener("click", () => {
    // Apply final glitch effect
    landingScreen.classList.add("glitching")

    // Play boot sound
    AudioSystem.playSound(AudioSystem.glitchSfx)

    // Animate out
    landingScreen.classList.add("fade-out")

    // After animation, show boot screen
    setTimeout(() => {
      landingScreen.style.display = "none"
      bootScreen.style.display = "flex"

      // Start ambient sound
      AudioSystem.playSound(AudioSystem.droneSfx)

      // Create profile image container once before starting boot sequence
      createProfileContainer()

      // Add first profile image
      addProfileImage()

      // Start boot sequence
      startBootSequence()
    }, 1000)
  })

  // Create profile container
  function createProfileContainer() {
    if (profileContainerCreated) return
    profileContainerCreated = true

    profileContainer = document.createElement("div")
    profileContainer.classList.add("profile-container")
    profileContainer.style.display = "flex"
    profileContainer.style.flexWrap = "wrap"
    profileContainer.style.justifyContent = "center"
    profileContainer.style.gap = "10px"
    profileContainer.style.marginBottom = "20px"
    profileContainer.style.maxWidth = "100%"
    profileContainer.style.overflow = "hidden"

    // Insert before the boot log
    bootScreen.insertBefore(profileContainer, bootLog)
  }

  // Add a profile image to the container
  function addProfileImage() {
    if (!profileContainer) return

    const imageWrapper = document.createElement("div")
    imageWrapper.style.position = "relative"
    imageWrapper.style.width = "150px"
    imageWrapper.style.height = "150px"
    imageWrapper.style.margin = "5px"

    const glowEffect = document.createElement("div")
    glowEffect.classList.add("image-glow-effect")
    glowEffect.style.position = "absolute"
    glowEffect.style.top = "0"
    glowEffect.style.left = "50%"
    glowEffect.style.transform = "translateX(-50%)"
    glowEffect.style.width = "150px"
    glowEffect.style.height = "150px"
    glowEffect.style.borderRadius = "50%"
    glowEffect.style.zIndex = "1"

    const profileImage = document.createElement("img")
    profileImage.src = CONFIG.profileImage
    profileImage.style.width = "150px"
    profileImage.style.height = "150px"
    profileImage.style.borderRadius = "50%"
    profileImage.style.border = "2px solid #00ffff"
    profileImage.style.boxShadow = "0 0 15px rgba(0, 255, 255, 0.7)"
    profileImage.style.opacity = "0"
    profileImage.style.transition = "opacity 1s ease"
    profileImage.style.zIndex = "2"
    profileImage.style.position = "relative"
    profileImage.classList.add("profile-image")
    profileImage.dataset.index = document.querySelectorAll(".profile-image").length

    imageWrapper.appendChild(glowEffect)
    imageWrapper.appendChild(profileImage)
    profileContainer.appendChild(imageWrapper)

    setTimeout(() => {
      profileImage.style.opacity = "1"
      glowEffect.classList.add("pulsing-glow")

      // Add periodic glitch to the image
      setInterval(() => {
        if (Math.random() < 0.3 && bootScreen.style.display !== "none") {
          profileImage.classList.add("glitch-img")
          setTimeout(() => profileImage.classList.remove("glitch-img"), 200)
        }
      }, 2000)
    }, 800)

    return profileImage
  }

  // Boot sequence
  function startBootSequence() {
    const lines = [
      "BBFILLER OS v2.0.25",
      "Loading system modules...",
      "Initializing desktop environment...",
      "Loading cyber assets...",
      "Establishing connection...",
      "Welcome, User.",
      "Launching desktop...",
    ]
    let i = 0
    bootLog.textContent = ""
    function typeLine() {
      if (i < lines.length) {
        bootLog.textContent += lines[i] + "\n"
        i++
        setTimeout(typeLine, 700)
      } else {
        // Animate progress bar
        let progress = 0
        function fillBar() {
          if (progress < 100) {
            progress += 2
            progressBar.style.width = progress + "%"
            setTimeout(fillBar, 20)
          } else {
            // Redirect to your desktop page
            window.location.href = "/"
          }
        }
        fillBar()
      }
    }
    typeLine()
  }
})
