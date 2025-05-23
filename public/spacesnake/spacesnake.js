// Game constants
const GRID = 17.5
const MAX_HS = 7
const HS_KEY = "snakeHighScores"
const STAR_COUNT = 175
const MAX_LIVES = 3
const MAX_HUNGER = 100
const HUNGER_DECREASE_RATE = 0.05 // How fast hunger decreases
const HUNGER_INCREASE_AMOUNT = 30 // How much eating increases hunger

// Online leaderboard API URL - replace with your actual API endpoint
const LEADERBOARD_API_URL = "https://spaceworm-leaderboard.glitch.me/scores"

// Power-up types
const POWERUP_TYPES = {
  GOLD: { color: "gold", effect: "extraLife", duration: 0, pts: 25 },
  BLUE: { color: "#00ffff", effect: "speedBoost", duration: 5000, pts: 25 },
  PURPLE: { color: "#ff00ff", effect: "invincible", duration: 8000, pts: 25 },
}

// DOM Elements
const splashScreen = document.getElementById("splash-screen")
const splashButton = document.getElementById("splash-button")
const canvas = document.getElementById("game-canvas")
const gameField = document.getElementById("game-field")
const ctx = canvas.getContext("2d")
const startOverlay = document.getElementById("start-overlay")
const gameoverOverlay = document.getElementById("gameover-overlay")
const controlsToggle = document.getElementById("controls-toggle")
const controlsPanel = document.getElementById("controls-panel")
const startButton = document.getElementById("start-button")
const playAgainButton = document.getElementById("play-again")
const submitScoreButton = document.getElementById("submit-score")
const clearNameButton = document.getElementById("clear-name")
const playerNameInput = document.getElementById("player-name")
const playerNameDisplay = document.getElementById("player-name-display")
const muteButton = document.getElementById("mute-button")
const volumeIcon = document.getElementById("volume-icon")
const muteIcon = document.getElementById("mute-icon")
const highScoresContainer = document.getElementById("high-scores")
const highScoresList = document.getElementById("high-scores-list")
const scoreDisplay = document.getElementById("score-display")
const levelDisplay = document.getElementById("level-display")
const bestDisplay = document.getElementById("best-display")
const statusDisplay = document.getElementById("status-display")
const finalScoreDisplay = document.getElementById("final-score")
const livesDisplay = document.getElementById("lives-display")
const hungerMeter = document.getElementById("hunger-meter")
const hungerFill = document.getElementById("hunger-fill")

// D-pad elements
const dPadContainer = document.getElementById("d-pad-container")
const dPadUp = document.getElementById("d-pad-up")
const dPadRight = document.getElementById("d-pad-right")
const dPadDown = document.getElementById("d-pad-down")
const dPadLeft = document.getElementById("d-pad-left")

// Audio elements
const music = document.getElementById("music")
const eatSound = document.getElementById("eat-sound")
const powerSound = document.getElementById("power-sound")
const levelUpSound = document.getElementById("level-up-sound")
const alienSound = document.getElementById("alien-sound")
const blackHoleSound = document.getElementById("black-hole-sound")
const asteroidSound = document.getElementById("asteroid-sound")

// Make audio elements more resilient to CORS errors
;[music, eatSound, powerSound, levelUpSound, alienSound, blackHoleSound, asteroidSound].forEach((audio) => {
  if (audio) {
    audio.addEventListener("error", (e) => {
      console.error(`Error loading audio: ${audio.id}`, e)
      // Don't let audio errors break the game
    })
  }
})

// Preload images
const alien1Img = new Image()
alien1Img.src = "assets/images/Alien1.png"
alien1Img.crossOrigin = "anonymous"

const alien2Img = new Image()
alien2Img.src = "assets/images/Alien2.png"
alien2Img.crossOrigin = "anonymous"

const astroBikeImg = new Image()
astroBikeImg.src = "assets/images/astrobike.png"
astroBikeImg.crossOrigin = "anonymous"

const powerUpSound = new Audio(
  "https://cdn.glitch.global/09e9ba26-fd4e-41f2-88c1-651c3d32a01a/coin-upaif-14631.mp3?v=1746542174524",
)
powerUpSound.crossOrigin = "anonymous"
powerUpSound.addEventListener("error", () => console.error("Error loading power-up sound"))

const keyboardSound = new Audio(
  "https://cdn.glitch.global/75a5fcf4-9aa2-4423-a1f1-825c09432eac/mech-keyboard-02-102918.mp3?v=1747514962752",
)
keyboardSound.crossOrigin = "anonymous"
keyboardSound.addEventListener("error", () => console.error("Error loading keyboard sound"))

// Game state variables
let cols, rows
let snake = []
let dx = 1,
  dy = 0
let apple = { x: 0, y: 0 }
let baseSpeed = 5,
  speed = baseSpeed
let paused = false,
  gameOver = false,
  started = false
let hueOffset = 0
let powerUps = []
let particles = []
let trail = []
let frameAcc = 0,
  lastTime = 0
let stars = []
let score = 0,
  level = 1,
  bestScore = 0,
  finalScore = 0
let isMuted = false
let lives = 1
let hunger = MAX_HUNGER
let hungerActive = false
let psychedelicMode = false
let psychedelicEndTime = 0

let totalGrowth = 0 // Track total food mice eaten (growth)
let totalPowerups = 0 // Track total powerups collected
const hungerDecreaseBase = HUNGER_DECREASE_RATE // Store the base hunger decrease rate
let bonusMiceTracker = 0 // Track bonus mice for UI display

// Bonus rats for blue power-up
let bonusRats = []
let bonusRatsActive = false
let bonusRatsStartTime = 0
let bonusRatsCaught = 0

// Alien characters
let alien1 = { active: false, y: 0, animationStartTime: 0 }
let alien2 = {
  active: false,
  x: 0,
  y: 0,
  animationStartTime: 0,
  direction: "left", // New property for direction
  entryPoint: "right", // New property for entry point
  scale: 1, // Scale for size variation
  z: 0, // Z-index for depth
}

// Astro Biker character
let astroBiker = {
  active: false,
  x: 0,
  y: 0,
  direction: "right",
  speed: 5,
  scale: 1,
  z: 0,
  animationStartTime: 0,
}

// Asteroid variables
let asteroids = []
const MAX_ASTEROIDS = 5 // Increased max asteroids
const ASTEROID_SPAWN_CHANCE = 0.002 // Increased spawn chance
const ASTEROID_TYPES = ["regular", "comet", "satellite", "debris"] // Different asteroid types

// Parallax background layers
let backgroundLayers = []
const LAYER_COUNT = 3

// Black hole effect for game over
let blackHoleActive = false
let blackHoleStartTime = 0
let blackHoleParticles = []

// Custom cursor
let customCursor = null
let typingTimer = null

// Add mobile-specific variables
let touchActive = false
let lastTouchDirection = ""
let swipeIndicatorTimeout = null
const vibrationSupported = "vibrate" in navigator
let showSwipeIndicator = true

// Function declarations

// Leaderboard toggle functions
function showLocalLeaderboard() {
  document.getElementById("local-leaderboard-toggle").classList.add("active")
  document.getElementById("online-leaderboard-toggle").classList.remove("active")
  document.getElementById("high-scores").classList.remove("hidden")
  document.getElementById("online-high-scores").classList.add("hidden")
}

function showOnlineLeaderboard() {
  document.getElementById("local-leaderboard-toggle").classList.remove("active")
  document.getElementById("online-leaderboard-toggle").classList.add("active")
  document.getElementById("high-scores").classList.add("hidden")
  document.getElementById("online-high-scores").classList.remove("hidden")

  // Load online scores
  fetchOnlineScores()
}

// Fetch online scores from API
function fetchOnlineScores() {
  const loadingElement = document.getElementById("leaderboard-loading")
  const errorElement = document.getElementById("leaderboard-error")
  const onlineScoresList = document.getElementById("online-high-scores-list")

  loadingElement.classList.remove("hidden")
  errorElement.classList.add("hidden")

  fetch(LEADERBOARD_API_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((scores) => {
      loadingElement.classList.add("hidden")

      // Clear previous scores
      onlineScoresList.innerHTML = ""

      // Sort scores by highest first
      scores.sort((a, b) => b.score - a.score)

      // Display top 10 scores
      const topScores = scores.slice(0, 10)

      if (topScores.length === 0) {
        onlineScoresList.innerHTML =
          "<div class='high-score-name' style='grid-column: span 3;'>No scores yet. Be the first!</div>"
      } else {
        topScores.forEach((score, i) => {
          // Create rank element
          const rankElement = document.createElement("div")
          rankElement.className = "high-score-rank"
          rankElement.textContent = `${i + 1}.`

          // Create name element
          const nameElement = document.createElement("div")
          nameElement.className = "high-score-name"
          nameElement.textContent = score.name || "ANON"

          // Create score element
          const scoreElement = document.createElement("div")
          scoreElement.className = "high-score-score"
          scoreElement.textContent = score.score

          // Add elements to grid
          onlineScoresList.appendChild(rankElement)
          onlineScoresList.appendChild(nameElement)
          onlineScoresList.appendChild(document.createElement("div")) // Empty cell
          onlineScoresList.appendChild(scoreElement)
        })
      }
    })
    .catch((error) => {
      console.error("Error fetching online scores:", error)
      loadingElement.classList.add("hidden")
      errorElement.classList.remove("hidden")
    })
}

function toggleControls() {
  controlsPanel.classList.toggle("hidden")
  controlsToggle.textContent = controlsPanel.classList.contains("hidden") ? "Show Controls" : "Hide Controls"
}

function startGame() {
  started = true
  startOverlay.classList.add("hidden")
  statusDisplay.textContent = "Running"

  if (!isMuted) {
    playMusic()
  }

  requestAnimationFrame(loop)
}

function playAgain() {
  resetGame()
  playerNameInput.value = ""
  updateNameDisplay()
  gameoverOverlay.classList.add("hidden")
  startOverlay.classList.remove("hidden")
}

function submitScore() {
  const name = playerNameInput.value.trim() || "ANON"

  // Add to local high scores
  addHS(name, finalScore)

  // Submit to online leaderboard
  submitOnlineScore(name, finalScore)

  // Play sound effect
  if (!isMuted) {
    powerUpSound.currentTime = 0
    powerUpSound.play().catch((err) => console.log("Sound play error:", err))
  }
}

// Submit score to online leaderboard
function submitOnlineScore(name, score) {
  fetch(LEADERBOARD_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      score: score,
      timestamp: new Date().toISOString(),
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to submit score")
      }
      return response.json()
    })
    .then(() => {
      // If online leaderboard is currently shown, refresh it
      if (!document.getElementById("online-high-scores").classList.contains("hidden")) {
        fetchOnlineScores()
      }
    })
    .catch((error) => {
      console.error("Error submitting score:", error)
      // Show error message but don't disrupt the game
    })
}

function toggleMute() {
  isMuted = !isMuted
  volumeIcon.classList.toggle("hidden")
  muteIcon.classList.toggle("hidden")

  if (isMuted) {
    stopMusic()
  } else if (started && !paused && !gameOver) {
    playMusic()
  }
}

function handleKeyDown(e) {
  if (!started) return

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
    e.preventDefault()
  }

  if (e.key === " ") {
    togglePause()
    return
  }

  if (paused || gameOver) return

  switch (e.key) {
    case "ArrowUp":
      if (dy === 0) {
        dx = 0
        dy = -1
      }
      break
    case "ArrowDown":
      if (dy === 0) {
        dx = 0
        dy = 1
      }
      break
    case "ArrowLeft":
      if (dx === 0) {
        dx = -1
        dy = 0
      }
      break
    case "ArrowRight":
      if (dx === 0) {
        dx = 1
        dy = 0
      }
      break
  }

  if (e.key.startsWith("Arrow")) speed = baseSpeed * 2
}

function handleKeyUp(e) {
  if (e.key.startsWith("Arrow")) speed = baseSpeed
}

// Touch controls for mobile
let touchStartX = 0
let touchStartY = 0

// Enhance the handleTouchStart function
function handleTouchStart(e) {
  touchActive = true
  const touch = e.touches[0]
  touchStartX = touch.clientX
  touchStartY = touch.clientY

  // If this is a D-pad button, prevent default to avoid scrolling
  if (e.target.closest(".d-pad-button")) {
    e.preventDefault()
  }
}

// Enhance the handleTouchMove function
function handleTouchMove(e) {
  if (paused || gameOver || !started || !touchActive) return

  const touch = e.touches[0]

  // Distinguish between swipe and tap
  if (
    e.touches.length > 1 ||
    (touchStartX === touch.clientX && touchStartY === touch.clientY)
  ) {
    // Likely a tap, not swipe
    return
  }

  const diffX = touch.clientX - touchStartX
  const diffY = touch.clientY - touchStartY

  // Only change direction if the swipe is significant
  if (Math.abs(diffX) > 20 || Math.abs(diffY) > 20) {
    // Reduced threshold for better responsiveness
    // Determine if the swipe is more horizontal or vertical
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (diffX > 0 && dx === 0) {
        dx = 1
        dy = 0
        lastTouchDirection = "right"
        triggerHapticFeedback()
      } else if (diffX < 0 && dx === 0) {
        dx = -1
        dy = 0
        lastTouchDirection = "left"
        triggerHapticFeedback()
      }
    } else {
      // Vertical swipe
      if (diffY > 0 && dy === 0) {
        dx = 0
        dy = 1
        lastTouchDirection = "down"
        triggerHapticFeedback()
      } else if (diffY < 0 && dy === 0) {
        dx = 0
        dy = -1
        lastTouchDirection = "up"
        triggerHapticFeedback()
      }
    }

    // Reset touch start position for continuous swiping
    touchStartX = touch.clientX
    touchStartY = touch.clientY

    // Increase speed while swiping
    speed = baseSpeed * 1.5 // Slightly reduced from 2x for better control

    // Clear any existing timeout
    if (swipeIndicatorTimeout) {
      clearTimeout(swipeIndicatorTimeout)
    }

    // Set timeout to reset speed
    swipeIndicatorTimeout = setTimeout(() => {
      if (touchActive) {
        speed = baseSpeed
      }
    }, 500)
  }
}

// Add touchend handler
function handleTouchEnd(e) {
  touchActive = false
  speed = baseSpeed

  // Remove active class from all D-pad buttons
  document.querySelectorAll(".d-pad-button").forEach((button) => {
    button.classList.remove("active")
  })
}

function togglePause() {
  if (!started || gameOver) return

  paused = !paused
  statusDisplay.textContent = paused ? "Paused" : "Running"

  // Update mobile pause button icon
  const pauseButton = document.getElementById("mobile-pause-button")
  if (paused) {
    pauseButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    `
    stopMusic()
  } else {
    pauseButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
      </svg>
    `
    if (!isMuted) {
      playMusic()
    }
  }

  // Trigger haptic feedback
  triggerHapticFeedback()
}

// Enhance D-pad controls
function handleDPadPress(dir) {
  if (paused || gameOver || !started) return

  // Add active class for visual feedback
  switch (dir) {
    case "up":
      dPadUp.classList.add("active")
      if (dy === 0) {
        dx = 0
        dy = -1
        lastTouchDirection = "up"
      }
      break
    case "right":
      dPadRight.classList.add("active")
      if (dx === 0) {
        dx = 1
        dy = 0
        lastTouchDirection = "right"
      }
      break
    case "down":
      dPadDown.classList.add("active")
      if (dy === 0) {
        dx = 0
        dy = 1
        lastTouchDirection = "down"
      }
      break
    case "left":
      dPadLeft.classList.add("active")
      if (dx === 0) {
        dx = -1
        dy = 0
        lastTouchDirection = "left"
      }
      break
  }

  // Trigger haptic feedback
  triggerHapticFeedback()

  // Increase speed while button is pressed
  speed = baseSpeed * 1.5 // Slightly reduced from 2x for better control
}

function handleDPadRelease() {
  // Remove active class from all buttons
  dPadUp.classList.remove("active")
  dPadRight.classList.remove("active")
  dPadDown.classList.remove("active")
  dPadLeft.classList.remove("active")

  // Reset speed
  speed = baseSpeed
}

function updateHUD() {
  scoreDisplay.textContent = `Score: ${score}`
  levelDisplay.textContent = `Level: ${level}`
  bestDisplay.textContent = `Best: ${bestScore}`

  // Add trackers to HUD
  updateTrackers()
}

function resetGame() {
  stopMusic()

  cols = Math.floor(canvas.width / GRID)
  rows = Math.floor(canvas.height / GRID)

  snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }]
  dx = 1
  dy = 0
  baseSpeed = 5
  speed = baseSpeed

  score = 0
  level = 1
  lives = 1
  hunger = MAX_HUNGER
  hungerActive = false
  psychedelicMode = false

  totalGrowth = 0
  totalPowerups = 0
  bonusMiceTracker = 0

  updateHUD()
  updateLivesDisplay()
  updateHungerMeter()

  paused = false
  gameOver = false
  started = false

  hueOffset = 0
  powerUps = []
  particles = []
  trail = []
  bonusRats = []
  bonusRatsActive = false
  asteroids = []
  blackHoleParticles = []
  blackHoleActive = false

  placeApple()

  // Reset aliens
  alien1 = { active: false, y: 0, animationStartTime: 0 }
  alien2 = { active: false, x: 0, y: 0, animationStartTime: 0, direction: "left", entryPoint: "right", scale: 1, z: 0 }
  astroBiker = { active: false, x: 0, y: 0, direction: "right", speed: 5, scale: 1, z: 0, animationStartTime: 0 }

  // Remove psychedelic effect if present
  gameField.classList.remove("psychedelic")
}

function playSound(sound) {
  if (isMuted || !sound) return

  try {
    // Clone and play to allow overlapping sounds
    const clone = sound.cloneNode()
    clone.volume = 0.5

    // Add error handling for play
    const playPromise = clone.play()

    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.log("Sound play error:", err)
        // Don't let sound errors break the game
      })
    }
  } catch (err) {
    console.error("Error playing sound:", err)
    // Continue game even if sound fails
  }
}

// Enhance the resizeCanvas function
function resizeCanvas() {
  const oldWidth = canvas.width
  const oldHeight = canvas.height

  canvas.width = gameField.clientWidth
  canvas.height = gameField.clientHeight

  // Only reinitialize if size actually changed
  if (oldWidth !== canvas.width || oldHeight !== canvas.height) {
    initStars()
    initBackgroundLayers()

    // Recalculate game grid
    cols = Math.floor(canvas.width / GRID)
    rows = Math.floor(canvas.height / GRID)

    // Reposition apple if it's now out of bounds
    if (apple.x >= cols || apple.y >= rows) {
      placeApple()
    }
  }
}

// Initialize game
function init() {
  // Set up event listeners
  if (splashScreen) splashScreen.addEventListener("click", showStartScreen)
  window.addEventListener("resize", resizeCanvas)
  if (controlsToggle) controlsToggle.addEventListener("click", toggleControls)
  if (startButton) startButton.addEventListener("click", startGame)
  if (playAgainButton) playAgainButton.addEventListener("click", playAgain)
  if (submitScoreButton) submitScoreButton.addEventListener("click", submitScore)
  if (clearNameButton) clearNameButton.addEventListener("click", clearName)
  if (muteButton) muteButton.addEventListener("click", toggleMute)
  window.addEventListener("keydown", handleKeyDown)
  window.addEventListener("keyup", handleKeyUp)
  window.addEventListener("touchstart", handleTouchStart)
  window.addEventListener("touchmove", handleTouchMove)

  // Add click event to game field for pausing
  if (gameField) gameField.addEventListener("click", togglePause)

  // D-pad controls
  if (dPadUp) dPadUp.addEventListener("touchstart", () => handleDPadPress("up"))
  if (dPadRight) dPadRight.addEventListener("touchstart", () => handleDPadPress("right"))
  if (dPadDown) dPadDown.addEventListener("touchstart", () => handleDPadPress("down"))
  if (dPadLeft) dPadLeft.addEventListener("touchstart", () => handleDPadPress("left"))

  if (dPadUp) dPadUp.addEventListener("touchend", () => handleDPadRelease())
  if (dPadRight) dPadRight.addEventListener("touchend", () => handleDPadRelease())
  if (dPadDown) dPadDown.addEventListener("touchend", () => handleDPadRelease())
  if (dPadLeft) dPadLeft.addEventListener("touchend", () => handleDPadRelease())

  // Add leaderboard toggle listeners
  const localLeaderboardToggle = document.getElementById("local-leaderboard-toggle")
  const onlineLeaderboardToggle = document.getElementById("online-leaderboard-toggle")
  if (localLeaderboardToggle) localLeaderboardToggle.addEventListener("click", showLocalLeaderboard)
  if (onlineLeaderboardToggle) onlineLeaderboardToggle.addEventListener("click", showOnlineLeaderboard)

  // Add mobile pause button event listener
  const mobilePauseButton = document.getElementById("mobile-pause-button")
  if (mobilePauseButton) mobilePauseButton.addEventListener("click", togglePause)

  // Add touch event listeners for haptic feedback
  if (vibrationSupported) {
    document.querySelectorAll(".d-pad-button").forEach((button) => {
      button.addEventListener("touchstart", triggerHapticFeedback)
    })
  }

  // Show swipe indicator on first game start for mobile
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    const startBtn = document.getElementById("start-button")
    if (startBtn) startBtn.addEventListener("click", showSwipeGuide)
  }

  // Initialize canvas
  resizeCanvas()

  // Load high scores
  const savedHighScores = loadHS()
  bestScore = savedHighScores[0]?.score || 0
  updateHighScoresList()
  updateHUD()

  // Initialize game state
  resetGame()

  // Check if we're on a mobile device
  checkMobile()

  // Initialize custom cursor
  initCustomCursor()

  // Set up name input
  if (playerNameInput) {
    playerNameInput.addEventListener("input", updateNameDisplay)
    playerNameInput.addEventListener("focus", () => {
      if (playerNameDisplay && playerNameDisplay.parentElement) {
        playerNameDisplay.parentElement.classList.add("active")
      }
    })
    playerNameInput.addEventListener("blur", () => {
      if (playerNameDisplay && playerNameDisplay.parentElement) {
        playerNameDisplay.parentElement.classList.remove("active")
      }
    })
  }

  // Preload all sounds
  preloadSounds()

  updateTrackers()
}

// Function to show swipe guide for first-time mobile users
function showSwipeGuide() {
  if (showSwipeIndicator) {
    const swipeIndicator = document.getElementById("swipe-indicator")
    swipeIndicator.classList.add("visible")

    setTimeout(() => {
      swipeIndicator.classList.remove("visible")
      showSwipeIndicator = false // Only show once per session
    }, 3000)
  }
}

// Function to trigger haptic feedback
function triggerHapticFeedback() {
  if (vibrationSupported) {
    navigator.vibrate(20) // Short vibration

    // Visual feedback
    const hapticFeedback = document.getElementById("haptic-feedback")
    hapticFeedback.classList.add("active")

    setTimeout(() => {
      hapticFeedback.classList.remove("active")
    }, 100)
  }
}

// Preload all sounds to prevent loading delays
function preloadSounds() {
  try {
    // Use a safer approach to load sounds
    const soundUrls = [keyboardSound.src]

    soundUrls.forEach((url) => {
      const audio = new Audio()
      audio.volume = 0.5

      // Add error handling
      audio.onerror = () => {
        console.log(`Error loading sound: ${url}`)
      }

      // Only set src after adding error handler
      audio.src = url

      // Don't actually play, just load
      audio.load()
    })
  } catch (err) {
    console.error("Error preloading sounds:", err)
  }
}

// Initialize custom cursor
function initCustomCursor() {
  // Create custom cursor element
  customCursor = document.createElement("div")
  customCursor.className = "custom-cursor-element"
  document.body.appendChild(customCursor)

  // Add event listener for mouse movement
  document.addEventListener("mousemove", (e) => {
    if (splashScreen.classList.contains("hidden")) {
      // Hide custom cursor when not on splash screen
      customCursor.style.display = "none"
      document.body.classList.remove("custom-cursor")
    } else {
      // Show and position custom cursor
      customCursor.style.display = "block"
      customCursor.style.left = e.clientX + "px"
      customCursor.style.top = e.clientY + "px"
      document.body.classList.add("custom-cursor")
    }
  })

  // Force cursor to be visible on splash screen
  if (!splashScreen.classList.contains("hidden")) {
    document.body.classList.add("custom-cursor")
  }
}

// Update name display for retro input field
function updateNameDisplay() {
  const name = playerNameInput.value.slice(0, 7)
  const displayText = name.padEnd(7, "_")
  playerNameDisplay.textContent = displayText

  // Play keyboard sound effect
  if (!isMuted) {
    // Clear previous timer
    if (typingTimer) clearTimeout(typingTimer)

    // Play sound with a slight delay to avoid too many sounds
    typingTimer = setTimeout(() => {
      keyboardSound.currentTime = 0
      keyboardSound.play().catch((err) => console.log("Sound play error:", err))
    }, 50)
  }
}

// Clear name input
function clearName() {
  playerNameInput.value = ""
  updateNameDisplay()

  // Play keyboard sound effect
  if (!isMuted) {
    keyboardSound.currentTime = 0
    keyboardSound.play().catch((err) => console.log("Sound play error:", err))
  }
}

// Improve mobile detection
function checkMobile() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  if (isMobile) {
    // Show D-pad
    dPadContainer.style.display = "block"

    // Show mobile pause button
    document.getElementById("mobile-pause-button").style.display = "flex"

    // Add touchend event listener
    window.addEventListener("touchend", handleTouchEnd)

    // Adjust game field size for mobile
    adjustGameFieldForMobile()

    // Add orientation change handler
    window.addEventListener("orientationchange", handleOrientationChange)
  }
}

// Function to adjust game field for mobile
function adjustGameFieldForMobile() {
  const isLandscape = window.innerWidth > window.innerHeight

  if (isLandscape) {
    // In landscape, make game field smaller to accommodate controls
    gameField.style.width = "min(70vh, 70vw)"
    gameField.style.height = "min(70vh, 70vw)"
  } else {
    // In portrait, make game field larger
    gameField.style.width = "min(90vw, 70vh)"
    gameField.style.height = "min(90vw, 70vh)"
  }

  // Resize canvas to match
  resizeCanvas()
}

// Handle orientation changes
function handleOrientationChange() {
  // Wait for the orientation change to complete
  setTimeout(() => {
    adjustGameFieldForMobile()
  }, 300)
}

function showStartScreen() {
  splashScreen.classList.add("hidden")
  startOverlay.classList.remove("hidden")
  document.body.style.cursor = "default"
}

// Initialize parallax background layers
function initBackgroundLayers() {
  backgroundLayers = []

  for (let i = 0; i < LAYER_COUNT; i++) {
    // Create different types of background elements for each layer
    const elements = []
    const count = 5 + Math.floor(Math.random() * 10) // Random number of elements per layer

    for (let j = 0; j < count; j++) {
      const element = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 10 + Math.random() * 30,
        color: `hsla(${Math.random() * 360}, 70%, 70%, ${0.1 + i * 0.1})`,
        shape: Math.random() > 0.5 ? "circle" : "square",
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
      }
      elements.push(element)
    }

    backgroundLayers.push({
      elements,
      speed: 0.2 + i * 0.3, // Different speed for each layer
      z: i, // Z-index for depth
    })
  }
}

// Draw parallax background layers
function drawBackgroundLayers() {
  backgroundLayers.forEach((layer) => {
    layer.elements.forEach((element) => {
      ctx.save()
      ctx.globalAlpha = 0.2 - layer.z * 0.05 // Fade out deeper layers

      // Move element based on layer speed
      element.x -= layer.speed
      element.rotation += element.rotationSpeed

      // Wrap around when off-screen
      if (element.x + element.size < 0) {
        element.x = canvas.width + element.size
        element.y = Math.random() * canvas.height
      }

      // Draw element
      ctx.translate(element.x, element.y)
      ctx.rotate(element.rotation)

      if (element.shape === "circle") {
        ctx.beginPath()
        ctx.arc(0, 0, element.size / 2, 0, Math.PI * 2)
        ctx.fillStyle = element.color
        ctx.fill()
      } else {
        ctx.fillStyle = element.color
        ctx.fillRect(-element.size / 2, -element.size / 2, element.size, element.size)
      }

      ctx.restore()
    })
  })

  ctx.globalAlpha = 1
}

// Starfield
function initStars() {
  stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    z: Math.random() * canvas.width,
    o: Math.random(),
  }))
}

function drawStars() {
  // Clear with slight motion-blur for trail effect
  ctx.fillStyle = "rgba(0,0,0,0.9)"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const s of stars) {
    // Twinkle effect
    s.o += (Math.random() - 0.5) * 0.03
    s.o = Math.max(0.1, Math.min(1, s.o))

    // Stars move faster in psychedelic mode
    const speedMultiplier = psychedelicMode ? 0.5 : 1
    s.z -= (2 + level * 0.5) * speedMultiplier

    if (s.z <= 0) {
      s.z = canvas.width
      s.x = Math.random() * canvas.width
      s.y = Math.random() * canvas.height
      s.o = Math.random()
    }

    const k = 128.0 / s.z
    const px = (s.x - canvas.width / 2) * k + canvas.width / 2
    const py = (s.y - canvas.height / 2) * k + canvas.height / 2
    const sz = Math.max(0.5, (1 - s.z / canvas.width) * 3)

    // Colorful stars based on position
    let starHue = (px + py) % 360

    // More colorful in psychedelic mode
    if (psychedelicMode) {
      starHue = (starHue + Date.now() / 20) % 360
    }

    ctx.globalAlpha = s.o

    // Larger stars get a glow effect
    if (sz > 1.5) {
      ctx.shadowColor = `hsl(${starHue},100%,70%)`
      ctx.shadowBlur = sz * 2
      ctx.fillStyle = `hsl(${starHue},100%,70%)`
    } else {
      ctx.shadowBlur = 0
      ctx.fillStyle = `hsl(${starHue},50%,90%)`
    }

    ctx.beginPath()
    ctx.arc(px, py, sz, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  ctx.shadowBlur = 0
}

// High score helpers
function loadHS() {
  const j = localStorage.getItem(HS_KEY)
  return j ? JSON.parse(j) : []
}

function saveHS(list) {
  localStorage.setItem(HS_KEY, JSON.stringify(list))
}

function addHS(name, val) {
  const l = loadHS()
  l.push({ name, score: val })
  l.sort((a, b) => b.score - a.score)
  saveHS(l.slice(0, MAX_HS))
  updateHighScoresList()
}

function updateHighScoresList() {
  const highScores = loadHS()
  if (highScores.length > 0) {
    highScoresContainer.classList.remove("hidden")
    highScoresList.innerHTML = ""

    highScores.forEach((hs, i) => {
      // Create rank element
      const rankElement = document.createElement("div")
      rankElement.className = "high-score-rank"
      rankElement.textContent = `${i + 1}.`

      // Create name element
      const nameElement = document.createElement("div")
      nameElement.className = "high-score-name"
      nameElement.textContent = hs.name

      // Create score element
      const scoreElement = document.createElement("div")
      scoreElement.className = "high-score-score"
      scoreElement.textContent = hs.score

      // Add elements to grid
      highScoresList.appendChild(rankElement)
      highScoresList.appendChild(nameElement)
      highScoresList.appendChild(document.createElement("div")) // Empty cell
      highScoresList.appendChild(scoreElement)
    })
  } else {
    highScoresContainer.classList.add("hidden")
  }
}

// Update lives display
function updateLivesDisplay() {
  livesDisplay.innerHTML = ""
  for (let i = 0; i < lives; i++) {
    const lifeIcon = document.createElement("div")
    lifeIcon.className = "life-icon"
    livesDisplay.appendChild(lifeIcon)
  }
}

// Update hunger meter
function updateHungerMeter() {
  if (level >= 5) {
    hungerActive = true
    hungerMeter.style.display = "block"
    hungerFill.style.width = `${hunger}%`
  } else {
    hungerActive = false
    hungerMeter.style.display = "none"
  }
}

function updateHungerRate(level) {
  if (level > 10) {
    HUNGER_DECREASE_RATE = hungerDecreaseBase + (level - 10) * 0.01;
  } else {
    HUNGER_DECREASE_RATE = hungerDecreaseBase;
  }
}

// Game helpers
function placeApple() {
  let tries = 0
  do {
    apple = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
    }
    tries++
  } while (
    (snake.some((s) => s.x === apple.x && s.y === apple.y) ||
      powerUps.some((p) => p.x === apple.x && p.y === apple.y)) &&
    tries < 100
  )
}

function createPowerUp() {
  // Determine which type of power-up to create
  let type
  if (lives < MAX_LIVES && Math.random() < 0.3) {
    type = "GOLD"
  } else if (Math.random() < 0.5) {
    type = "BLUE"
  } else {
    type = "PURPLE"
  }

  const powerDef = POWERUP_TYPES[type]

  // Find a valid position
  let x, y
  let valid = false

  let tries = 0

  while (!valid && tries < 100) {
    x = Math.floor(Math.random() * cols)
    y = Math.floor(Math.random() * rows)

    valid =
      !snake.some((s) => s.x === x && s.y === y) &&
      !powerUps.some((p) => p.x === x && p.y === y) &&
      !(apple.x === x && apple.y === y)

    tries++
  }

  if (valid) {
    powerUps.push({
      x,
      y,
      type,
      color: powerDef.color,
      duration: powerDef.duration,
      start: Date.now(),
    })
  }
}

function createBonusRats() {
  bonusRats = []
  bonusRatsActive = true
  bonusRatsStartTime = Date.now()
  bonusRatsCaught = 0
  bonusMiceTracker = 0

  // Create 5 bonus rats
  for (let i = 0; i < 5; i++) {
    let x, y
    let valid = false
    let tries = 0

    while (!valid && tries < 100) {
      x = Math.floor(Math.random() * cols)
      y = Math.floor(Math.random() * rows)

      valid =
        !snake.some((s) => s.x === x && s.y === y) &&
        !powerUps.some((p) => p.x === x && p.y === y) &&
        !(apple.x === x && apple.y === apple.y) &&
        !bonusRats.some((r) => r.x === x && r.y === y)

      tries++
    }

    if (valid) {
      bonusRats.push({
        x,
        y,
        moveTime: Date.now() + Math.random() * 1000,
      })
    }
  }
}

function createParticle(x, y, color) {
  const particleCount = 12

  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2
    const speed = 1 + Math.random() * 2

    particles.push({
      x: x * GRID + GRID / 2,
      y: y * GRID + GRID / 2,
      size: Math.random() * 4 + 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: color,
      alpha: 1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
    })
  }
}

function triggerAlien1Animation() {
  alien1.active = true
  alien1.y = canvas.height + alien1Img.height // Start further off-screen
  alien1.animationStartTime = Date.now()
  playSound(levelUpSound)
}

function triggerAlien2Animation() {
  if (alien2.active) return

  // Randomly choose direction and entry point
  const randomChoice = Math.random()

  // Randomize z-index and scale for depth variation - ENHANCED RANGE
  alien2.z = Math.random() * 4 - 2 // Value between -2 and 2 for more variation
  // Scale now directly based on z-position
  alien2.scale = 0.3 + Math.max(0, (alien2.z + 2) / 4) * 1.4 // Scale between 0.3 and 1.7 based on z

  if (randomChoice < 0.4) {
    // 40% chance for right to left
    alien2.direction = "left"
    alien2.entryPoint = "right"
    alien2.x = canvas.width
    alien2.y = canvas.height * (0.1 + Math.random() * 0.8) // More vertical variation
  } else if (randomChoice < 0.8) {
    // 40% chance for left to right
    alien2.direction = "right"
    alien2.entryPoint = "left"
    alien2.x = -alien2Img.width * alien2.scale
    alien2.y = canvas.height * (0.1 + Math.random() * 0.8) // More vertical variation
  } else {
    // 20% chance for top to bottom
    alien2.direction = "down"
    alien2.entryPoint = "top"
    alien2.x = canvas.width * (0.1 + Math.random() * 0.8) // More horizontal variation
    alien2.y = -alien2Img.height * alien2.scale
  }

  alien2.active = true
  alien2.animationStartTime = Date.now()

  // Play alien sound
  playSound(alienSound)
}

function triggerAstroBikerAnimation() {
  if (astroBiker.active) return;
  // Randomize direction, z-index and scale
  astroBiker.direction = Math.random() > 0.5 ? "right" : "left";
  astroBiker.z = Math.random() * Math.random() * 8 - 6; // Skewed distribution
  astroBiker.scale = 0.3 + Math.max(0, (astroBiker.z + 6) / 8) * 1.2;
  astroBiker.speed = 2 + Math.random() * 6;
  if (astroBiker.direction === "right") {
    astroBiker.x = -astroBikeImg.width * astroBiker.scale;
  } else {
    astroBiker.x = canvas.width + astroBikeImg.width * astroBiker.scale;
  }
  astroBiker.y = canvas.height * 0.1 + Math.random() * canvas.height * 0.8;
  astroBiker.active = true;
  astroBiker.animationStartTime = Date.now();
}
  function updateAliens() {
  // Randomly trigger Alien 2 animation
  if (!alien2.active && Math.random() < 0.001) {
    triggerAlien2Animation()
  }

  // Randomly trigger Astro Biker animation
  if (!astroBiker.active && Math.random() < 0.0015) {
    triggerAstroBikerAnimation()
  }

  // Update Alien 1 animation (appears from bottom during level up)
  if (alien1.active) {
    const now = Date.now();
    const elapsed = now - alien1.animationStartTime
    const duration = 5000 // 5 seconds for the full animation

    if (elapsed < duration / 2) {
      // Rising up
      alien1.y = canvas.height - (elapsed / (duration / 2)) * (canvas.height / 2)
    } else if (elapsed < duration) {
      // Going back down
      const downElapsed = elapsed - duration / 2
      alien1.y = canvas.height / 2 + (downElapsed / (duration / 2)) * (canvas.height / 2)
    } else {
      // Animation complete
      alien1.active = false
    }
  }

  // Update Alien 2 animation
  if (alien2.active) {
    const now = Date.now();
    const elapsed = now - alien2.animationStartTime
    const duration = 6000

    if (elapsed < duration) {
      switch (alien2.direction) {
        case "left":
          alien2.x = canvas.width - (elapsed / duration) * (canvas.width + alien2Img.width * alien2.scale)
          break
        case "right":
          alien2.x =
            -alien2Img.width * alien2.scale + (elapsed / duration) * (canvas.width + alien2Img.width * alien2.scale)
          break
        case "down":
          alien2.y =
            -alien2Img.height * alien2.scale + (elapsed / duration) * (canvas.height + alien2Img.height * alien2.scale)
          break
      }
    } else {
      alien2.active = false
    }
  }

  // Update Astro Biker animation
  if (astroBiker.active) {
    if (astroBiker.direction === "right") {
      astroBiker.x += astroBiker.speed
      if (astroBiker.x > canvas.width) {
        astroBiker.active = false
      }
    } else {
      astroBiker.x -= astroBiker.speed
      if (astroBiker.x + astroBikeImg.width * astroBiker.scale < 0) {
        astroBiker.active = false
      }
    }
    const elapsed = Date.now() - astroBiker.animationStartTime
    astroBiker.y += Math.sin(elapsed / 200) * 0.5
  }
}


function drawAliens() {
  // Draw background aliens (z < 0)
  if (alien2.active && alien2.z < 0) {
    drawAlien2()
  }

  if (astroBiker.active && astroBiker.z < 0) {
    drawAstroBiker()
  }

  // Draw foreground aliens (z >= 0) - these will be drawn after the snake
}

function drawForegroundAliens() {
  // Draw Alien 1 (always in foreground)
  if (alien1.active) {
    const wobble = Math.sin(Date.now() / 200) * 5 // Wobble effect
    ctx.drawImage(
      alien1Img,
      canvas.width / 2 - alien1Img.width / 2 + wobble,
      alien1.y,
      alien1Img.width,
      alien1Img.height,
    )
  }

  // Draw foreground aliens (z >= 0)
  if (alien2.active && alien2.z >= 0) {
    drawAlien2()
  }

  if (astroBiker.active && astroBiker.z >= 0) {
    drawAstroBiker()
  }
}

function drawAlien2() {
  const wobble = Math.sin(Date.now() / 150) * 3 // Wobble effect

  // Apply transparency if behind snake layer
  if (alien2.z < 0) {
    ctx.globalAlpha = 0.6
  }

  ctx.save()

  // Position at the alien's coordinates
  ctx.translate(alien2.x, alien2.y + wobble)

  // Apply scaling
  ctx.scale(alien2.scale, alien2.scale)

  // Flip horizontally if moving right
  if (alien2.direction === "right") {
    ctx.scale(-1, 1)
    ctx.drawImage(alien2Img, -alien2Img.width, 0, alien2Img.width, alien2Img.height)
  } else {
    ctx.drawImage(alien2Img, 0, 0, alien2Img.width, alien2Img.height)
  }

  ctx.restore()
  ctx.globalAlpha = 1.0 // Reset alpha
}

function drawAstroBiker() {
  // Apply transparency if behind snake layer
  if (astroBiker.z < 0) {
    ctx.globalAlpha = 0.6
  }

  ctx.save()

  // Position at the biker's coordinates
  ctx.translate(astroBiker.x, astroBiker.y)

  // Apply scaling
  ctx.scale(astroBiker.scale, astroBiker.scale)

  // Flip horizontally if moving left
  if (astroBiker.direction === "left") {
    ctx.scale(-1, 1)
    ctx.drawImage(astroBikeImg, -astroBikeImg.width, 0, astroBikeImg.width, astroBikeImg.height)
  } else {
    ctx.drawImage(astroBikeImg, 0, 0, astroBikeImg.width, astroBikeImg.height)
  }

  // Add glow effect
  ctx.globalAlpha = 0.3
  ctx.filter = "blur(8px)"
  if (astroBiker.direction === "left") {
    ctx.drawImage(astroBikeImg, -astroBikeImg.width - 5, -5, astroBikeImg.width + 10, astroBikeImg.height + 10)
  } else {
    ctx.drawImage(astroBikeImg, -5, -5, astroBikeImg.width + 10, astroBikeImg.height + 10)
  }
  ctx.filter = "none"

  ctx.restore()
  ctx.globalAlpha = 1.0 // Reset alpha
}

// Asteroid functions
function createAsteroid() {
  // Only create if we're below the maximum
  if (asteroids.length >= MAX_ASTEROIDS) return

  // Determine entry point (top, right, bottom, or left)
  const side = Math.floor(Math.random() * 4)
  let x, y, vx, vy

  switch (side) {
    case 0: // Top
      x = Math.random() * canvas.width
      y = -50
      vx = (Math.random() - 0.5) * 2
      vy = 1 + Math.random() * 2
      break
    case 1: // Right
      x = canvas.width + 50
      y = Math.random() * canvas.height
      vx = -(1 + Math.random() * 2)
      vy = (Math.random() - 0.5) * 2
      break
    case 2: // Bottom
      x = Math.random() * canvas.width
      y = canvas.height + 50
      vx = (Math.random() - 0.5) * 2
      vy = -(1 + Math.random() * 2)
      break
    case 3: // Left
      x = -50
      y = Math.random() * canvas.height
      vx = 1 + Math.random() * 2
      vy = (Math.random() - 0.5) * 2
      break
  }

  // Choose a random asteroid type
  const type = ASTEROID_TYPES[Math.floor(Math.random() * ASTEROID_TYPES.length)]

  // Generate random color for the asteroid
  const colorSchemes = [
    { base: "#8B4513", accent: "#A0522D", detail: "#CD853F" }, // Brown
    { base: "#708090", accent: "#778899", detail: "#B0C4DE" }, // Slate gray
    { base: "#4682B4", accent: "#5F9EA0", detail: "#ADD8E6" }, // Steel blue
    { base: "#800000", accent: "#8B0000", detail: "#CD5C5C" }, // Maroon
    { base: "#2F4F4F", accent: "#556B2F", detail: "#8FBC8F" }, // Dark slate gray
  ]

  const colorScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)]

  // Create asteroid with random size, rotation, z-index and color
  const newAsteroid = {
    x,
    y,
    vx,
    vy,
    size: 20 + Math.random() * 30, // Base size variation (20-50)
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.05,
    points: generateAsteroidPoints(type),
    zIndex: Math.random() * 4 - 2, // Random z-index between -2 and 2 for more variation
    colorScheme: colorScheme,
    craters: generateCraters(), // Add craters for texture
    type: type,
    health: type === "satellite" ? 2 : 1, // Satellites take 2 hits to destroy
    trail: [], // For comets
    glowColor: type === "comet" ? "#00ffff" : type === "satellite" ? "#ff00ff" : "transparent",
    collisionRadius: 0, // Will be calculated
    mass: 0, // Will be calculated
  }

  // Calculate collision radius (average distance from center to points)
  let totalRadius = 0
  newAsteroid.points.forEach((point) => {
    totalRadius += Math.sqrt(point.x * point.x + point.y * point.y)
  })

  // Apply z-index scaling to size for comets
  if (newAsteroid.type === "comet") {
    // Scale size based on z-index
    const zScale = 0.3 + Math.max(0, (newAsteroid.zIndex + 2) / 4) * 1.4 // Scale between 0.3 and 1.7 based on z
    newAsteroid.size *= zScale
  }

  newAsteroid.collisionRadius = (totalRadius / newAsteroid.points.length) * newAsteroid.size

  // Calculate mass based on size
  newAsteroid.mass = newAsteroid.size * newAsteroid.size * 0.01

  asteroids.push(newAsteroid)

  // Play asteroid sound
  playSound(asteroidSound)
}

// Add a function to generate craters for asteroid texture
function generateCraters() {
  const numCraters = 2 + Math.floor(Math.random() * 4)
  const craters = []

  for (let i = 0; i < numCraters; i++) {
    craters.push({
      x: (Math.random() - 0.5) * 0.7, // Position within asteroid (-0.35 to 0.35)
      y: (Math.random() - 0.5) * 0.7,
      size: 0.05 + Math.random() * 0.15, // Size of crater
    })
  }

  return craters
}

function generateAsteroidPoints(type) {
  // Generate random polygon points for the asteroid
  let numPoints
  let points = []

  switch (type) {
    case "comet":
      // Comets are more teardrop shaped
      numPoints = 8 + Math.floor(Math.random() * 3)
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2
        // Make one side more pointed
        let radius
        if (angle > Math.PI / 2 && angle < (3 * Math.PI) / 2) {
          radius = 0.6 + Math.random() * 0.2 // Shorter radius on one side
        } else {
          radius = 0.8 + Math.random() * 0.2 // Longer radius on the other side
        }
        points.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
        })
      }
      break

    case "satellite":
      // Satellites are more geometric/artificial
      // Create a basic rectangular shape with antennas
      points = [
        { x: -0.5, y: -0.3 },
        { x: 0.5, y: -0.3 },
        { x: 0.5, y: 0.3 },
        { x: -0.5, y: 0.3 },
      ]
      // Add solar panels
      points.push({ x: 0.8, y: -0.1 })
      points.push({ x: 0.8, y: 0.1 })
      points.push({ x: -0.8, y: -0.1 })
      points.push({ x: -0.8, y: 0.1 })
      break

    case "debris":
      // Debris is very irregular
      numPoints = 5 + Math.floor(Math.random() * 3)
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2
        const radius = 0.5 + Math.random() * 0.5 // Very random radius
        points.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
        })
      }
      break

    default: // "regular"
      // Regular asteroids are somewhat round but irregular
      numPoints = 8 + Math.floor(Math.random() * 5)
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2
        const radius = 0.7 + Math.random() * 0.3 // Random radius between 0.7 and 1.0
        points.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
        })
      }
      break
  }

  return points
}

function updateAsteroids() {
  // Randomly create new asteroids
  if (Math.random() < ASTEROID_SPAWN_CHANCE * (1 + level * 0.1) && started && !paused && !gameOver) {
    createAsteroid()
  }

  // Update existing asteroids
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const asteroid = asteroids[i]

    // Move asteroid
    asteroid.x += asteroid.vx
    asteroid.y += asteroid.vy

    // Rotate asteroid
    asteroid.rotation += asteroid.rotationSpeed

    // Add trail for comets
    if (asteroid.type === "comet" && asteroid.trail) {
      asteroid.trail.push({
        x: asteroid.x - asteroid.vx * 2,
        y: asteroid.y - asteroid.vy * 2,
        size: asteroid.size * 0.3 * Math.random(),
        alpha: 0.7,
      })

      // Limit trail length
      if (asteroid.trail.length > 10) {
        asteroid.trail.shift()
      }
    }

    // Update trail
    if (asteroid.trail) {
      for (let j = asteroid.trail.length - 1; j >= 0; j--) {
        const trailPart = asteroid.trail[j]
        trailPart.alpha -= 0.02
        trailPart.size *= 0.95

        if (trailPart.alpha <= 0) {
          asteroid.trail.splice(j, 1)
        }
      }
    }

    // Check for collisions with other asteroids
    for (let j = i + 1; j < asteroids.length; j++) {
      const otherAsteroid = asteroids[j]

      // Calculate distance between asteroids
      const dx = asteroid.x - otherAsteroid.x
      const dy = asteroid.y - otherAsteroid.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Check if they're colliding
      const minDistance = asteroid.collisionRadius + otherAsteroid.collisionRadius

      if (distance < minDistance) {
        // Calculate collision response
        const angle = Math.atan2(dy, dx)
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)

        // Rotate asteroid velocities
        const vx1 = asteroid.vx * cos + asteroid.vy * sin
        const vy1 = asteroid.vy * cos - asteroid.vx * sin
        const vx2 = otherAsteroid.vx * cos + otherAsteroid.vy * sin
        const vy2 = otherAsteroid.vy * cos - otherAsteroid.vx * sin

        // Calculate new velocities (conservation of momentum)
        const m1 = asteroid.mass
        const m2 = otherAsteroid.mass
        const u1 = (vx1 * (m1 - m2)) / (m1 + m2) + (vx2 * 2 * m2) / (m1 + m2)
        const u2 = (vx2 * (m2 - m1)) / (m1 + m2) + (vx1 * 2 * m1) / (m1 + m2)

        // Update velocities
        asteroid.vx = u1 * cos - vy1 * sin
        asteroid.vy = vy1 * cos + u1 * sin
        otherAsteroid.vx = u2 * cos - vy2 * sin
        otherAsteroid.vy = vy2 * cos + u2 * sin

        // Move asteroids apart to prevent sticking
        const overlap = minDistance - distance
        const moveX = (overlap * cos) / 2
        const moveY = (overlap * sin) / 2

        asteroid.x += moveX
        asteroid.y += moveY
        otherAsteroid.x -= moveX
        otherAsteroid.y -= moveY

        // Create collision particles
        for (let k = 0; k < 5; k++) {
          particles.push({
            x: asteroid.x + dx / 2,
            y: asteroid.y + dy / 2,
            size: 2 + Math.random() * 3,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            color: "#ffffff",
            alpha: 1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
          })
        }

        // Play collision sound
        playSound(asteroidSound)
      }
    }

    // Remove if off-screen
    if (asteroid.x < -100 || asteroid.x > canvas.width + 100 || asteroid.y < -100 || asteroid.y > canvas.height + 100) {
      asteroids.splice(i, 1)
    }
  }
}

function drawAsteroids() {
  // Sort asteroids by z-index to handle layering
  const sortedAsteroids = [...asteroids].sort((a, b) => a.zIndex - b.zIndex)

  sortedAsteroids.forEach((asteroid) => {
    // Adjust opacity based on z-index
    const zOpacity = Math.max(0.4, Math.min(1, (asteroid.zIndex + 2) / 4))
    ctx.globalAlpha = zOpacity

    // Draw comet trail first
    if (asteroid.type === "comet" && asteroid.trail) {
      asteroid.trail.forEach((trailPart) => {
        ctx.globalAlpha = trailPart.alpha * zOpacity
        ctx.beginPath()
        ctx.arc(trailPart.x, trailPart.y, trailPart.size, 0, Math.PI * 2)
        ctx.fillStyle = asteroid.glowColor
        ctx.fill()
      })
    }

    ctx.save()
    ctx.translate(asteroid.x, asteroid.y)
    ctx.rotate(asteroid.rotation)
    ctx.scale(asteroid.size, asteroid.size)

    // Draw glow effect for special asteroid types
    if (asteroid.glowColor !== "transparent") {
      ctx.shadowColor = asteroid.glowColor
      ctx.shadowBlur = 20
    }

    // Draw asteroid based on type
    switch (asteroid.type) {
      case "comet":
        drawCometAsteroid(asteroid)
        break
      case "satellite":
        drawSatelliteAsteroid(asteroid)
        break
      case "debris":
        drawDebrisAsteroid(asteroid)
        break
      default:
        drawRegularAsteroid(asteroid)
        break
    }

    ctx.restore()
    ctx.globalAlpha = 1.0 // Reset alpha
    ctx.shadowBlur = 0 // Reset shadow
  })
}

function drawRegularAsteroid(asteroid) {
  // Draw asteroid base
  ctx.beginPath()
  ctx.moveTo(asteroid.points[0].x, asteroid.points[0].y)

  for (let i = 1; i < asteroid.points.length; i++) {
    ctx.lineTo(asteroid.points[i].x, asteroid.points[i].y)
  }

  ctx.closePath()

  // Fill with gradient for more realistic look
  const gradient = ctx.createRadialGradient(0, 0, 0.2, 0, 0, 1)
  gradient.addColorStop(0, asteroid.colorScheme.base)
  gradient.addColorStop(0.7, asteroid.colorScheme.accent)
  gradient.addColorStop(1, asteroid.colorScheme.detail)

  ctx.fillStyle = gradient
  ctx.fill()

  ctx.strokeStyle = asteroid.colorScheme.detail
  ctx.lineWidth = 0.02
  ctx.stroke()

  // Draw craters for texture
  asteroid.craters.forEach((crater) => {
    ctx.beginPath()
    ctx.arc(crater.x, crater.y, crater.size, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    ctx.fill()

    // Add highlight to one side of crater for 3D effect
    ctx.beginPath()
    ctx.arc(crater.x - crater.size * 0.3, crater.y - crater.size * 0.3, crater.size * 0.4, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
    ctx.fill()
  })

  // Add some detail lines/cracks
  ctx.beginPath()
  for (let i = 0; i < 3; i++) {
    const startPoint = asteroid.points[Math.floor(Math.random() * asteroid.points.length)]
    const endPoint = asteroid.points[Math.floor(Math.random() * asteroid.points.length)]
    ctx.moveTo(startPoint.x * 0.8, startPoint.y * 0.8)
    ctx.lineTo(endPoint.x * 0.8, endPoint.y * 0.8)
  }
  ctx.strokeStyle = "rgba(0, 0, 0, 0.3)"
  ctx.lineWidth = 0.01
  ctx.stroke()
}

function drawCometAsteroid(asteroid) {
  // Draw comet base
  ctx.beginPath()
  ctx.moveTo(asteroid.points[0].x, asteroid.points[0].y)

  for (let i = 1; i < asteroid.points.length; i++) {
    ctx.lineTo(asteroid.points[i].x, asteroid.points[i].y)
  }

  ctx.closePath()

  // Fill with gradient for icy look
  const gradient = ctx.createRadialGradient(0, 0, 0.2, 0, 0, 1)
  gradient.addColorStop(0, "#ffffff")
  gradient.addColorStop(0.5, "#a0e0ff")
  gradient.addColorStop(1, "#0080c0")

  ctx.fillStyle = gradient
  ctx.fill()

  ctx.strokeStyle = "#80c0ff"
  ctx.lineWidth = 0.02
  ctx.stroke()

  // Add ice crystal details
  for (let i = 0; i < 5; i++) {
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * 0.7
    const size = 0.05 + Math.random() * 0.1

    ctx.beginPath()
    ctx.arc(Math.cos(angle) * distance, Math.sin(angle) * distance, size, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
    ctx.fill()
  }
}

function drawSatelliteAsteroid(asteroid) {
  // Draw satellite body
  ctx.beginPath()
  ctx.rect(-0.5, -0.3, 1, 0.6)
  ctx.fillStyle = "#707070"
  ctx.fill()
  ctx.strokeStyle = "#505050"
  ctx.lineWidth = 0.05
  ctx.stroke()

  // Draw solar panels
  ctx.fillStyle = "#4040ff"
  ctx.fillRect(-0.8, -0.1, 0.3, 0.2)
  ctx.fillRect(0.5, -0.1, 0.3, 0.2)

  ctx.strokeStyle = "#202020"
  ctx.lineWidth = 0.02
  ctx.strokeRect(-0.8, -0.1, 0.3, 0.2)
  ctx.strokeRect(0.5, -0.1, 0.3, 0.2)

  // Draw antenna
  ctx.beginPath()
  ctx.moveTo(0, -0.3)
  ctx.lineTo(0, -0.6)
  ctx.lineWidth = 0.03
  ctx.stroke()

  // Draw antenna dish
  ctx.beginPath()
  ctx.arc(0, -0.6, 0.1, 0, Math.PI * 2)
  ctx.fillStyle = "#c0c0c0"
  ctx.fill()
  ctx.stroke()

  // Draw lights
  const lightColor = asteroid.health > 1 ? "#00ff00" : "#ff0000"
 



  ctx.beginPath()
  ctx.arc(0.3, 0, 0.05, 0, Math.PI * 2)
  ctx.fillStyle = lightColor
  ctx.fill()

  // Add glow to lights
  ctx.shadowColor = lightColor
  ctx.shadowBlur = 5
  ctx.beginPath()
  ctx.arc(0.3, 0, 0.03, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
}



function drawDebrisAsteroid(asteroid) {
   // Draw debris base
  ctx.beginPath()
  ctx.moveTo(asteroid.points[0].x, asteroid.points[0].y)

  for (let i = 1; i < asteroid.points.length; i++) {
    ctx.lineTo(asteroid.points[i].x, asteroid.points[i].y)
  }

  ctx.closePath()

  // Fill with metallic gradient
  const gradient = ctx.createRadialGradient(0, 0, 0.2, 0, 0, 1)
  gradient.addColorStop(0, "#a0a0a0")
  gradient.addColorStop(0.7, "#707070")
  gradient.addColorStop(1, "#505050")

  ctx.fillStyle = gradient
  ctx.fill()

  ctx.strokeStyle = "#303030"
  ctx.lineWidth = 0.03
  ctx.stroke()

  // Add metal texture details
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const angle = Math.random() * Math.PI * 2
    const distance1 = Math.random() * 0.7
    const distance2 = Math.random() * 0.7

    ctx.moveTo(Math.cos(angle) * distance1, Math.sin(angle) * distance1)
    ctx.lineTo(Math.cos(angle + 0.5) * distance2, Math.sin(angle + 0.5) * distance2)
  }
  ctx.strokeStyle = "#606060"
  ctx.lineWidth = 0.02
  ctx.stroke()

  // Add some rivets
  for (let i = 0; i < 4; i++) {
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * 0.6

    ctx.beginPath()
    ctx.arc(Math.cos(angle) * distance, Math.sin(angle) * distance, 0.04, 0, Math.PI * 2)
    ctx.fillStyle = "#808080"
    ctx.fill()
    ctx.strokeStyle = "#404040"
    ctx.lineWidth = 0.01
    ctx.stroke()
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx
    p.y += p.vy
    p.alpha -= 0.01 + Math.random() * 0.01
    p.size *= 0.98
    p.rotation += p.rotationSpeed

    // Slow down particles
    p.vx *= 0.98
    p.vy *= 0.98

    if (p.alpha <= 0 || p.size <= 0.5) particles.splice(i, 1)
  }

  // Draw particles with glow effects
  particles.forEach((p) => {
    ctx.globalAlpha = p.alpha
    ctx.shadowColor = p.color
    ctx.shadowBlur = p.size * 2

    // Draw as a glowing square for a retro pixel look
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rotation)

    ctx.fillStyle = p.color
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)

    ctx.restore()
  })

  ctx.globalAlpha = 1
  ctx.shadowBlur = 0
}

function applyPowerUp(pu) {
  const powerDef = POWERUP_TYPES[pu.type]
  totalPowerups++

  // Award points
  score += powerDef.pts
  updateHUD()

  if (score > bestScore) {
    bestScore = score
    updateHUD()
  }

  // Create particles
  createParticle(pu.x, pu.y, powerDef.color)

  // Play enhanced power-up sound
  playSound(powerUpSound)

  // Apply effect based on type
  switch (pu.type) {
    case "GOLD":
      // Extra life (up to max)
      if (lives < MAX_LIVES) {
        lives++
        updateLivesDisplay()
      }
      break

    case "BLUE":
      // Speed boost + bonus rats
      speed = baseSpeed * 2
      setTimeout(() => {
        speed = baseSpeed
      }, powerDef.duration)

      // Create bonus rats
      createBonusRats()
      break

    case "PURPLE":
      // Invincibility + enhanced psychedelic mode
      psychedelicMode = true
      psychedelicEndTime = Date.now() + powerDef.duration

      // Add psychedelic effect to the game field
      gameField.classList.add("psychedelic")

      // Add additional visual effects
      document.body.classList.add("psychedelic-background")

      // Create pulsating overlay
      const psychOverlay = document.createElement("div")
      psychOverlay.className = "psychedelic-overlay"
      document.body.appendChild(psychOverlay)

      // Remove effects after duration
      setTimeout(() => {
        psychedelicMode = false
        gameField.classList.remove("psychedelic")
        document.body.classList.remove("psychedelic-background")
        if (document.querySelector(".psychedelic-overlay")) {
          document.querySelector(".psychedelic-overlay").remove()
        }
      }, powerDef.duration)
      break
  }
}

// Game update and draw
function update(dt) {
  if (!started || paused || gameOver) return
  if (!snake || snake.length === 0) return // Add this check

  // In psychedelic mode, time moves slower
  // const timeMultiplier = psychedelicMode ? 0.5 : 1
  const timeMultiplier = 1 // No longer slow time in psychedelic mode

  frameAcc += dt * timeMultiplier
  if (frameAcc < 1000 / speed) return
  frameAcc = 0

  // Update hunger if active
  if (hungerActive) {
    // Hunger decreases faster as level increases
    const hungerDecreaseRate = hungerDecreaseBase * (1 + (level - 5) * 0.1)
    hunger -= hungerDecreaseRate
    updateHungerMeter()

    // Game over if hunger reaches 0
    if (hunger <= 0) {
      gameOver = true
      endGame()
      return
    }
  }

  // Check if psychedelic mode has ended
  if (psychedelicMode && Date.now() > psychedelicEndTime) {
    psychedelicMode = false
    gameField.classList.remove("psychedelic")
  }

  // Remove expired power-ups
  powerUps = powerUps.filter((pu) => pu.duration === 0 || Date.now() - pu.start < pu.duration)

  // Randomly create new power-up
  if (Math.random() < 0.005) createPowerUp()

  // Update bonus rats
  if (bonusRatsActive) {
    // Check if bonus rats time has expired (15 seconds)
    if (Date.now() - bonusRatsStartTime > 15000) {
      bonusRatsActive = false
      bonusRats = []
    }

    // Move rats randomly
    bonusRats.forEach((rat) => {
      if (Date.now() > rat.moveTime) {
        // Choose a random direction
        const directions = [
          { x: 1, y: 0 },
          { x: -1, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: -1 },
        ]

        const dir = directions[Math.floor(Math.random() * directions.length)]

        // Calculate new position
        const newX = rat.x + dir.x
        const newY = rat.y + dir.y

        // Keep within bounds
        if (newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
          rat.x = newX
          rat.y = newY
        }

        // Set next move time
        rat.moveTime = Date.now() + 500 + Math.random() * 500
      }
    })
  }

  // Calculate new head position
  const head = { x: snake[0].x + dx, y: snake[0].y + dy }

  // In psychedelic mode, wrap around edges instead of dying
  if (psychedelicMode) {
    if (head.x < 0) head.x = cols - 1
    if (head.x >= cols) head.x = 0
    if (head.y < 0) head.y = rows - 1
    if (head.y >= rows) head.y = 0
  }

  snake.unshift(head)

  // Add to trail (reduced for less confusion)
  trail.unshift({ x: head.x, y: head.y, t: Date.now() })
  if (trail.length > 10) trail.pop() // Reduced trail length

  // Check collision with power-ups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    if (head.x === powerUps[i].x && head.y === powerUps[i].y) {
      playSound(powerSound)
      applyPowerUp(powerUps[i])
      powerUps.splice(i, 1)
    }
  }

  // Check collision with apple
  if (head.x === apple.x && head.y === apple.y) {
    playSound(eatSound)
    score += 10
    totalGrowth++
    updateHUD()

    // Increase hunger
    if (hungerActive) {
      hunger = Math.min(MAX_HUNGER, hunger + HUNGER_INCREASE_AMOUNT)
      updateHungerMeter()
    }

    if (score > bestScore) {
      bestScore = score
      updateHUD()
    }

    for (let i = 0; i < 8; i++) createParticle(apple.x, apple.y, "magenta")

    // Level up every 50 points
    if (score % 50 === 0) {
      level++
      updateHUD()
      updateHungerMeter() // Check if hunger should be activated

      // Trigger Alien 1 animation on level up
      triggerAlien1Animation()

      for (let i = 0; i < 8; i++) createParticle(head.x, head.y, "cyan")
    }

    placeApple()
  } else {
    // Only remove tail if not eating
    snake.pop()
  }

  // Check collision with bonus rats
  if (bonusRatsActive) {
    for (let i = bonusRats.length - 1; i >= 0; i--) {
      if (head.x === bonusRats[i].x && head.y === bonusRats[i].y) {
        playSound(eatSound)
        score += 10
        updateHUD()

        // Increase hunger
        if (hungerActive) {
          hunger = Math.min(MAX_HUNGER, hunger + HUNGER_INCREASE_AMOUNT)
          updateHungerMeter()
        }

        bonusRats.splice(i, 1)
        bonusRatsCaught++
        bonusMiceTracker = bonusRatsCaught

        // Check if all 5 bonus rats were caught
        // Check if all 5 bonus rats were caught
        if (bonusRatsCaught === 5) {
          // Award bonus points
          score += 50
          updateHUD()

          // Trigger Alien 1 animation
          triggerAlien1Animation()

          // Play bonus completion sound
          playSound(powerUpSound)

          // Create bonus completion particles
          for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2
            const distance = 50 + Math.random() * 100
            const centerX = canvas.width / 2
            const centerY = canvas.height / 2

            particles.push({
              x: centerX + Math.cos(angle) * distance,
              y: centerY + Math.sin(angle) * distance,
              size: 3 + Math.random() * 5,
              vx: Math.cos(angle) * (1 + Math.random() * 3),
              vy: Math.sin(angle) * (1 + Math.random() * 3),
              color: "#00ffff", // Blue color matching the power-up
              alpha: 1,
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 0.2,
            })
          }

          // Add a flash effect
          const flashEffect = document.createElement("div")
          flashEffect.style.position = "fixed"
          flashEffect.style.inset = "0"
          flashEffect.style.backgroundColor = "rgba(0, 255, 255, 0.3)"
          flashEffect.style.zIndex = "100"
          flashEffect.style.pointerEvents = "none"
          document.body.appendChild(flashEffect)

          // Remove flash effect after animation
          setTimeout(() => {
            flashEffect.style.opacity = "0"
            flashEffect.style.transition = "opacity 0.5s"
            setTimeout(() => flashEffect.remove(), 500)
          }, 300)

          // End bonus rats mode
          bonusRatsActive = false
        }
      }
    }
  }

  // No collision detection with asteroids - they're just visual elements

  // Check for collisions (unless in psychedelic mode)
  if (!psychedelicMode) {
    // Wall collision
    if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows) {
      if (lives > 1) {
        // Lose a life
        lives--
        updateLivesDisplay()

        // Reset snake position but keep length
        const length = snake.length
        snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }]

        // Grow snake back to original length
        for (let i = 1; i < length; i++) {
          snake.push({ x: snake[0].x - i * dx, y: snake[0].y - i * dy })
        }

        // Create particles
        for (let i = 0; i < 8; i++) createParticle(head.x, head.y, "red")
      } else {
        // Game over
        gameOver = true
        endGame()
        for (let i = 0; i < 20; i++) createParticle(head.x, head.y, "red")
      }
    }

    // Self collision (skip head)
    if (snake.slice(1).some((s) => s.x === head.x && s.y === head.y)) {
      if (lives > 1) {
        // Lose a life
        lives--
        updateLivesDisplay()

        // Reset snake position but keep length
        const length = snake.length
        snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }]

        // Grow snake back to original length
        for (let i = 1; i < length; i++) {
          snake.push({ x: snake[0].x - i * dx, y: snake[0].y - i * dy })
        }

        // Create particles
        for (let i = 0; i < 8; i++) createParticle(head.x, head.y, "red")
      } else {
        // Game over
        gameOver = true
        endGame()
        for (let i = 0; i < 20; i++) createParticle(head.x, head.y, "red")
      }
    }
  }
}

function draw() {
  if (!started) return

  // Draw parallax background layers
  drawBackgroundLayers()

  // Draw stars
  drawStars()

  // Draw trail with reduced intensity
  const MAX_TRAIL = 10 // Reduced trail length
  const trailOpacity = 0.3 // Less visible

  trail.forEach((pt, idx) => {
    if (idx >= MAX_TRAIL) return

    const age = Date.now() - pt.t
    const a = Math.max(0, 1 - age / 2000) * trailOpacity
    const size = GRID - 2 - idx * 0.15
    const offset = 1 + idx * 0.05

    // Rainbow trail with glow effect
    const hue = (hueOffset + idx * 10) % 360
    ctx.shadowColor = `hsl(${hue},100%,50%)`
    ctx.shadowBlur = 8 - idx * 0.3

    ctx.fillStyle = `hsla(${hue},100%,50%,${a})`
    ctx.fillRect(pt.x * GRID + offset, pt.y * GRID + offset, size, size)

    // Add a pulsing effect to the trail
    if (idx < 5) {
      const pulseSize = Math.sin(Date.now() / 200 + idx) * 2
      ctx.fillStyle = `hsla(${hue},100%,70%,${a * 0.5})`
      ctx.fillRect(
        pt.x * GRID + offset - pulseSize / 2,
        pt.y * GRID + offset - pulseSize / 2,
        size + pulseSize,
        size + pulseSize,
      )
    }
  })
  ctx.shadowBlur = 0

  // Draw background aliens and asteroids (z-index < 0.3)
  drawAliens()
  drawAsteroids()

  // Draw power-ups as pulsating orbs
  powerUps.forEach((pu) => {
    const pulse = Math.sin(Date.now() / 300) * 0.2
    const centerX = pu.x * GRID + GRID / 2
    const centerY = pu.y * GRID + GRID / 2
    const radius = GRID / 2 - 2 + pulse * GRID

    // Glow effect
    ctx.shadowColor = pu.color
    ctx.shadowBlur = 10

    // Draw orb
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    gradient.addColorStop(0, "white")
    gradient.addColorStop(0.6, pu.color)
    gradient.addColorStop(1, "rgba(0,0,0,0)")

    ctx.globalAlpha = 0.8 + pulse
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()

    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  })

  // Draw apple as a space rat
  const ratPulse = Math.sin(Date.now() / 300) * 0.2
  const ratX = apple.x * GRID + GRID / 2
  const ratY = apple.y * GRID + GRID / 2
  const ratSize = GRID / 2 - 1 + ratPulse * 2

  // Body
  ctx.fillStyle = `hsl(300,100%,${50 + ratPulse * 10}%)`
  ctx.beginPath()
  ctx.ellipse(ratX, ratY, ratSize, ratSize * 0.7, 0, 0, Math.PI * 2)
  ctx.fill()

  // Ears
  ctx.beginPath()
  ctx.ellipse(ratX - ratSize * 0.7, ratY - ratSize * 0.7, ratSize * 0.4, ratSize * 0.4, 0, 0, Math.PI * 2)
  ctx.ellipse(ratX + ratSize * 0.7, ratY - ratSize * 0.7, ratSize * 0.4, ratSize * 0.4, 0, 0, Math.PI * 2)
  ctx.fill()

  // Eyes
  ctx.fillStyle = "white"
  ctx.beginPath()
  ctx.arc(ratX - ratSize * 0.3, ratY - ratSize * 0.1, ratSize * 0.2, 0, Math.PI * 2)
  ctx.arc(ratX + ratSize * 0.3, ratY - ratSize * 0.1, ratSize * 0.2, 0, Math.PI * 2)
  ctx.fill()

  // Pupils
  ctx.fillStyle = "black"
  ctx.beginPath()
  ctx.arc(ratX - ratSize * 0.3 + Math.sin(Date.now() / 500) * 0.1, ratY - ratSize * 0.1, ratSize * 0.1, 0, Math.PI * 2)
  ctx.arc(ratX + ratSize * 0.3 + Math.sin(Date.now() / 500) * 0.1, ratY - ratSize * 0.1, ratSize * 0.1, 0, Math.PI * 2)
  ctx.fill()

  // Tail
  ctx.strokeStyle = `hsl(300,100%,${60 + ratPulse * 10}%)`
  ctx.lineWidth = ratSize * 0.3
  ctx.lineCap = "round"
  ctx.beginPath()
  ctx.moveTo(ratX - ratSize * 0.5, ratY + ratSize * 0.5)
  ctx.quadraticCurveTo(
    ratX - ratSize * 1.5,
    ratY + ratSize * 0.5 + Math.sin(Date.now() / 400) * ratSize * 0.5,
    ratX - ratSize * 2,
    ratY + Math.sin(Date.now() / 400) * ratSize,
  )
  ctx.stroke()

  // Draw bonus rats (similar to regular rat but smaller and blue)
  bonusRats.forEach((rat) => {
    const bonusRatX = rat.x * GRID + GRID / 2
    const bonusRatY = rat.y * GRID + GRID / 2
    const bonusRatSize = ratSize * 0.8

    // Body
    ctx.fillStyle = `hsl(200,100%,${50 + ratPulse * 10}%)`
    ctx.beginPath()
    ctx.ellipse(bonusRatX, bonusRatY, bonusRatSize, bonusRatSize * 0.7, 0, 0, Math.PI * 2)
    ctx.fill()

    // Ears
    ctx.beginPath()
    ctx.ellipse(
      bonusRatX - bonusRatSize * 0.7,
      bonusRatY - bonusRatSize * 0.7,
      bonusRatSize * 0.4,
      bonusRatSize * 0.4,
      0,
      0,
      Math.PI * 2,
    )
    ctx.ellipse(
      bonusRatX + bonusRatSize * 0.7,
      bonusRatY - bonusRatSize * 0.7,
      bonusRatSize * 0.4,
      bonusRatSize * 0.4,
      0,
      0,
      Math.PI * 2,
    )
    ctx.fill()

    // Eyes
    ctx.fillStyle = "white"
    ctx.beginPath()
    ctx.arc(bonusRatX - bonusRatSize * 0.3, bonusRatY - bonusRatSize * 0.1, bonusRatSize * 0.2, 0, Math.PI * 2)
    ctx.arc(bonusRatX + bonusRatSize * 0.3, bonusRatY - bonusRatSize * 0.1, bonusRatSize * 0.2, 0, Math.PI * 2)
    ctx.fill()

    // Pupils
    ctx.fillStyle = "black"
    ctx.beginPath()
    ctx.arc(
      bonusRatX - bonusRatSize * 0.3 + Math.sin(Date.now() / 500) * 0.1,
      bonusRatY - bonusRatSize * 0.1,
      bonusRatSize * 0.1,
      0,
      Math.PI * 2,
    )
    ctx.arc(
      bonusRatX + bonusRatSize * 0.3 + Math.sin(Date.now() / 500) * 0.1,
      bonusRatY - bonusRatSize * 0.1,
      bonusRatSize * 0.1,
      0,
      Math.PI * 2,
    )
    ctx.fill()
  })

  // Enhanced snake with 32-bit style and glowing effect
  snake.forEach((seg, i) => {
    const hue = (hueOffset + i * 10 + level * 20) % 360
    const segX = seg.x * GRID + GRID / 2
    const segY = seg.y * GRID + GRID / 2
    const segSize = GRID - 6

    // Glow effect for the whole snake, stronger if in psychedelic mode
    ctx.shadowColor = psychedelicMode ? `hsl(${(hue + Date.now() / 50) % 360},100%,50%)` : `hsl(${hue},100%,50%)`
    ctx.shadowBlur = psychedelicMode ? 15 : 8

    // Draw segment with gradient
    const gradient = ctx.createRadialGradient(segX, segY, 0, segX, segY, segSize)

    gradient.addColorStop(0, `hsl(${hue},100%,80%)`)
    gradient.addColorStop(0.6, `hsl(${hue},100%,50%)`)
    gradient.addColorStop(1, `hsl(${hue},100%,30%)`)

    ctx.fillStyle = gradient

    // Head is slightly larger and has different shape
    if (i === 0) {
      // Draw head
      ctx.beginPath()
      ctx.arc(segX, segY, segSize * 0.6, 0, Math.PI * 2)
      ctx.fill()

      // Eyes
      const eyeAngle = Math.atan2(dy, dx)
      const eyeX = Math.cos(eyeAngle) * segSize * 0.3
      const eyeY = Math.sin(eyeAngle) * segSize * 0.3

      ctx.fillStyle = "white"
      ctx.beginPath()
      ctx.arc(segX + eyeX - dy * segSize * 0.2, segY + eyeY + dx * segSize * 0.2, segSize * 0.15, 0, Math.PI * 2)
      ctx.arc(segX + eyeX + dy * segSize * 0.2, segY + eyeY - dx * segSize * 0.2, segSize * 0.15, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "black"
      ctx.beginPath()
      ctx.arc(segX + eyeX - dy * segSize * 0.2, segY + eyeY + dx * segSize * 0.2, segSize * 0.07, 0, Math.PI * 2)
      ctx.arc(segX + eyeX + dy * segSize * 0.2, segY + eyeY - dx * segSize * 0.2, segSize * 0.07, 0, Math.PI * 2)
      ctx.fill()
    } else {
      // Body segments get progressively smaller
      const sizeMultiplier = 1 - (i / snake.length) * 0.3
      ctx.beginPath()
      ctx.arc(segX, segY, segSize * 0.5 * sizeMultiplier, 0, Math.PI * 2)
      ctx.fill()
    }
  })

  // Reset shadow
  ctx.shadowBlur = 0

  // Draw foreground aliens and asteroids (z-index >= 0.3)
  drawForegroundAliens()

  // Draw particles
  updateParticles()

  // Draw black hole particles if active
  if (blackHoleActive) {
    updateBlackHoleParticles()
  }

  hueOffset = (hueOffset + 1 + level) % 360
}

// Black hole effect for game over
function startBlackHoleEffect() {
  blackHoleActive = true
  blackHoleStartTime = Date.now()

   // Show 3D GAME OVER text
  const gameoverText = document.getElementById('gameover-text');
  if (gameoverText) {
    gameoverText.style.opacity = '1';
    gameoverText.classList.remove('hidden');
  }

  // Create black hole container
  const blackHoleContainer = document.createElement("div")
  blackHoleContainer.className = "black-hole-container"
  document.body.appendChild(blackHoleContainer)

  // Create accretion disk
  const accretionDisk = document.createElement("div")
  accretionDisk.className = "accretion-disk"
  document.body.appendChild(accretionDisk)

  // Create multiple particle rings for more intense effect
  for (let i = 0; i < 3; i++) {
    const particleRing = document.createElement("div")
    particleRing.className = "particle-ring"
    particleRing.style.animationDelay = `${i * 0.2}s`
    document.body.appendChild(particleRing)
  }

  // Activate with a slight delay
  setTimeout(() => {
    blackHoleContainer.classList.add("black-hole-active")
    accretionDisk.classList.add("accretion-disk-active")
    document.querySelectorAll(".particle-ring").forEach((ring) => {
      ring.classList.add("particle-ring-active")
    })

    // Play black hole sound
    playSound(blackHoleSound)

    // Create particles that get sucked into the black hole
    createBlackHoleParticles()

    // Add screen shake effect
    document.body.classList.add("screen-shake")
  }, 100)

  // Remove after animation completes
  setTimeout(() => {
    // Hide 3D GAME OVER text when black hole is done
    if (gameoverText) {
      gameoverText.style.opacity = '0';
      gameoverText.classList.add('hidden');
    }
    blackHoleContainer.remove()
    accretionDisk.remove()
    document.querySelectorAll(".particle-ring").forEach((ring) => ring.remove())
    document.body.classList.remove("screen-shake")
    blackHoleActive = false
  }, 3000)
}

// Create more black hole particles for a more intense effect
function createBlackHoleParticles() {
  // Create particles that will be sucked into the black hole
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2

  for (let i = 0; i < 200; i++) {
    // Increased from 100 to 200
    const angle = Math.random() * Math.PI * 2
    const distance = 100 + Math.random() * 300 // Increased max distance

    blackHoleParticles.push({
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      size: 2 + Math.random() * 6, // Increased max size
      color: `hsl(${Math.random() * 360}, 100%, 70%)`,
      speed: 0.5 + Math.random() * 2.5, // Increased max speed
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
    })
  }

  // Also add some game elements to be sucked in (snake segments, etc.)
  // This is just visual - doesn't affect actual game objects
  for (let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2
    const distance = 150 + Math.random() * 200

    blackHoleParticles.push({
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      size: 5 + Math.random() * 10,
      color: `hsl(${(hueOffset + i * 20) % 360}, 100%, 50%)`, // Snake-like colors
      speed: 0.3 + Math.random() * 1.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      isGameElement: true, // Flag to render differently
    })
  }
}

// Update the black hole particles with more intense effects
function updateBlackHoleParticles() {
  if (!blackHoleActive) return

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const elapsed = Date.now() - blackHoleStartTime
  const intensity = Math.min(1, elapsed / 1000) // Ramps up over 1 second

  // Update and draw black hole particles
  for (let i = blackHoleParticles.length - 1; i >= 0; i--) {
    const p = blackHoleParticles[i]

    // Calculate direction to center
    const dx = centerX - p.x
    const dy = centerY - p.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    // Normalize and apply speed (faster as they get closer)
    const speedMultiplier = 1 + ((300 - dist) / 50) * intensity // More aggressive acceleration
    p.x += (dx / dist) * p.speed * speedMultiplier
    p.y += (dy / dist) * p.speed * speedMultiplier

    // Add spiral motion
    const spiralAngle = Math.atan2(dy, dx) + 0.1 * intensity
    p.x += Math.cos(spiralAngle) * p.speed * 0.5
    p.y += Math.sin(spiralAngle) * p.speed * 0.5

    // Rotate particle
    p.rotation += p.rotationSpeed

    // Stretch particles as they get closer to center (warp effect)
    const stretchFactor = Math.max(1, 3 * (1 - dist / 300) * intensity)

    // Remove if too close to center
    if (dist < 5) {
      blackHoleParticles.splice(i, 1)
      continue
    }

    // Draw particle
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rotation)

    if (p.isGameElement) {
      // Game elements (snake segments, etc.)
      ctx.fillStyle = p.color
      ctx.shadowColor = p.color
      ctx.shadowBlur = 10
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size * stretchFactor, p.size)
    } else {
      // Regular particles
      ctx.fillStyle = p.color
      ctx.shadowColor = p.color
      ctx.shadowBlur = 5
      ctx.beginPath()
      ctx.ellipse(0, 0, p.size * stretchFactor, p.size, Math.atan2(dy, dx), 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }

  ctx.shadowBlur = 0

  // Draw black hole center glow
  const glowSize = 50 + Math.sin(Date.now() / 100) * 10
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowSize)
  gradient.addColorStop(0, "rgba(255, 0, 255, 0.8)")
  gradient.addColorStop(0.5, "rgba(0, 255, 255, 0.4)")
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2)
  ctx.fill()
}

// Update the endGame function to make the game over sequence more intense
function endGame() {
  stopMusic()

  // Start black hole effect
  startBlackHoleEffect()

  // Add screen distortion effect
  document.body.classList.add("screen-distortion")

  // Calculate final score with bonuses
  const growthBonus = totalGrowth * 10
  const powerupBonus = totalPowerups * 10
  const baseScore = score
  const totalScore = baseScore + growthBonus + powerupBonus

  // Store values for animation
  window.gameStats = {
    baseScore: baseScore,
    growthBonus: growthBonus,
    powerupBonus: powerupBonus,
    totalScore: totalScore,
    totalGrowth: totalGrowth,
    totalPowerups: totalPowerups,
  }

  // Show game over overlay after black hole animation
  setTimeout(() => {
    document.body.classList.remove("screen-distortion")
    finalScoreDisplay.textContent = `Base Score: ${baseScore}`
    finalScore = totalScore
    gameoverOverlay.classList.remove("hidden")

    // Start the score animation after a short delay
    setTimeout(animateScoreCalculation, 500)

    // Focus on name input
    playerNameInput.focus()
  }, 3000)
}

// Add the score animation function after the endGame function
function animateScoreCalculation() {
  const stats = window.gameStats
  if (!stats) return

  // Get or create elements
  const finalScoreDisplay = document.getElementById("final-score")
  if (!finalScoreDisplay || !finalScoreDisplay.parentNode) return

  let statsContainer = document.getElementById("score-calculation")
  if (!statsContainer) {
    statsContainer = document.createElement("div")
    statsContainer.id = "score-calculation"
    statsContainer.className = "score-calculation"
    finalScoreDisplay.parentNode.insertBefore(statsContainer, finalScoreDisplay.nextSibling)
  }

  // Create the content
  statsContainer.innerHTML = `
    <div class="stat-row base-score">Base Score: ${stats.baseScore}</div>
    <div class="stat-row growth-bonus">
      <span class="stat-label">Growth Bonus:</span>
      <span class="stat-value">${stats.totalGrowth} × 10 = <span class="bonus-value">+${stats.growthBonus}</span></span>
      <span class="stat-icon">🐭</span>
    </div>
    <div class="stat-row powerup-bonus">
      <span class="stat-label">Powerup Bonus:</span>
      <span class="stat-value">${stats.totalPowerups} × 10 = <span class="bonus-value">+${stats.powerupBonus}</span></span>
      <span class="stat-icon">⚡</span>
    </div>
    <div class="stat-row total-score">TOTAL SCORE: <span class="final-value">${stats.totalScore}</span></div>
  `

  // Animate each row
  const rows = statsContainer.querySelectorAll(".stat-row")
  rows.forEach((row, index) => {
    row.style.opacity = "0"
    row.style.transform = "translateY(20px)"

    setTimeout(
      () => {
        row.style.opacity = "1"
        row.style.transform = "translateY(0)"
        playSound(powerSound)

        // Add flash effect on the last row
        if (index === rows.length - 1) {
          setTimeout(() => {
            row.classList.add("flash-animation")
            playSound(levelUpSound)
          }, 300)
        }
      },
      500 * (index + 1),
    )
  })
}

function loop(ts) {
  if (!lastTime) lastTime = ts
  const dt = ts - lastTime
  lastTime = ts

  update(dt)
  draw()
  updateAliens()
  updateAsteroids()

  requestAnimationFrame(loop)
}

// Game reset and initialization
function gameReset() {
  stopMusic()

  cols = Math.floor(canvas.width / GRID)
  rows = Math.floor(canvas.height / GRID)

  snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }]
  dx = 1
  dy = 0
  baseSpeed = 5
  speed = baseSpeed

  score = 0
  level = 1
  lives = 1
  hunger = MAX_HUNGER
  hungerActive = false
  psychedelicMode = false

  totalGrowth = 0
  totalPowerups = 0
  bonusMiceTracker = 0

  updateHUD()
  updateLivesDisplay()
  updateHungerMeter()

  paused = false
  gameOver = false
  started = false

  hueOffset = 0
  powerUps = []
  particles = []
  trail = []
  bonusRats = []
  bonusRatsActive = false
  asteroids = []
  blackHoleParticles = []
  blackHoleActive = false

  placeApple()

  // Reset aliens
  alien1 = { active: false, y: 0, animationStartTime: 0 }
  alien2 = { active: false, x: 0, y: 0, animationStartTime: 0, direction: "left", entryPoint: "right", scale: 1, z: 0 }
  astroBiker = { active: false, x: 0, y: 0, direction: "right", speed: 5, scale: 1, z: 0, animationStartTime: 0 }

  // Remove psychedelic effect if present
  gameField.classList.remove("psychedelic")
}

// Event handlers
function gameToggleControls() {
  controlsPanel.classList.toggle("hidden")
  controlsToggle.textContent = controlsPanel.classList.contains("hidden") ? "Show Controls" : "Hide Controls"
}

// D-pad controls
function gameHandleDPadPress(direction) {
  if (paused || gameOver || !started) return

  // Add active class for visual feedback
  switch (direction) {
    case "up":
      dPadUp.classList.add("active")
      if (dy === 0) {
        dx = 0
        dy = -1
      }
      break
    case "right":
      dPadRight.classList.add("active")
      if (dx === 0) {
        dx = 1
        dy = 0
      }
      break
    case "down":
      dPadDown.classList.add("active")
      if (dy === 0) {
        dx = 0
        dy = 1
      }
      break
    case "left":
      dPadLeft.classList.add("active")
      if (dx === 0) {
        dx = -1
        dy = 0
      }
      break
  }

  // Increase speed while button is pressed
  speed = baseSpeed * 1.5 // Slightly reduced from 2x for better control
}

function gameHandleDPadRelease() {
  // Remove active class from all buttons
  dPadUp.classList.remove("active")
  dPadRight.classList.remove("active")
  dPadDown.classList.remove("active")
  dPadLeft.classList.remove("active")

  // Reset speed
  speed = baseSpeed
}

function gameStartGame() {
  started = true
  startOverlay.classList.add("hidden")
  statusDisplay.textContent = "Running"

  if (!isMuted) {
    playMusic()
  }

  requestAnimationFrame(loop)
}

function gameEndGame() {
  stopMusic()

  // Start black hole effect
  startBlackHoleEffect()

  // Show game over overlay after black hole animation
  setTimeout(() => {
    document.body.classList.remove("screen-distortion")
    finalScoreDisplay.textContent = `Your score: ${score}`
    finalScore = score
    gameoverOverlay.classList.remove("hidden")

    // Show 3D GAME OVER text
    const gameoverText = document.getElementById('gameover-text');
    if (gameoverText) {
      gameoverText.style.opacity = '1';
      gameoverText.classList.remove('hidden');
    }

    // After black hole animation completes, call showHighScoreEntry()
    setTimeout(showHighScoreEntry, 2000); // adjust timing as needed

    // Focus on name input
    playerNameInput.focus()
  }, 3000)
}

// Function to show high score entry UI
function showHighScoreEntry() {
  // Hide 3D GAME OVER text
  const gameoverText = document.getElementById('gameover-text');
  if (gameoverText) {
    gameoverText.style.opacity = '0';
    gameoverText.classList.add('hidden');
  }

  // Show the high score entry UI
  const highScoreEntry = document.getElementById('high-score-entry');
  if (highScoreEntry) {
    highScoreEntry.classList.remove('hidden');
    highScoreEntry.style.opacity = '1';
  }

  // Focus on player name input
  playerNameInput.focus();
}

function gamePlayAgain() {
  gameReset()
  playerNameInput.value = ""
  updateNameDisplay()
  gameoverOverlay.classList.add("hidden")
  startOverlay.classList.remove("hidden")
}

function gameToggleMute() {
  isMuted = !isMuted
  volumeIcon.classList.toggle("hidden")
  muteIcon.classList.toggle("hidden")

  if (isMuted) {
    stopMusic()
  } else if (started && !paused && !gameOver) {
    playMusic()
  }
}

function gameTogglePause() {
  if (!started || gameOver) return

  paused = !paused
  statusDisplay.textContent = paused ? "Paused" : "Running"

  if (paused) {
    stopMusic()
  } else if (!isMuted) {
    playMusic()
  }
}

function playMusic() {
  if (!music) return

  music.play().catch((err) => {
    console.log("Music play error:", err)
    // Continue game even if music fails
  })
}

function stopMusic() {
  music.pause()
  music.currentTime = 0
}

function gamePlaySound(sound) {
  if (isMuted || !sound) return

  try {
    // Clone and play to allow overlapping sounds
    const clone = sound.cloneNode()
    clone.volume = 0.5

    // Add error handling for play
    const playPromise = clone.play()

    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.log("Sound play error:", err)
        // Don't let sound errors break the game
      })
    }
  } catch (err) {
    console.error("Error playing sound:", err)
  }
}

function gameUpdateHUD() {
  scoreDisplay.textContent = `Score: ${score}`
  levelDisplay.textContent = `Level: ${level}`
  bestDisplay.textContent = `Best: ${bestScore}`
}

// Keyboard controls
function gameHandleKeyDown(e) {
  if (!started) return

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
    e.preventDefault()
  }

  if (e.key === " ") {
    gameTogglePause()
    return
  }

  if (paused || gameOver) return

  switch (e.key) {
    case "ArrowUp":
      if (dy === 0) {
        dx = 0
        dy = -1
      }
      break
    case "ArrowDown":
      if (dy === 0) {
        dx = 0
        dy = 1
      }
      break
    case "ArrowLeft":
      if (dx === 0) {
        dx = -1
        dy = 0
      }
      break
    case "ArrowRight":
      if (dx === 0) {
        dx = 1
        dy = 0
      }
      break
  }

  if (e.key.startsWith("Arrow")) speed = baseSpeed * 2
}

function gameHandleKeyUp(e) {
  if (e.key.startsWith("Arrow")) speed = baseSpeed
}

// Touch controls for mobile

// Initialize the game
init()

function updateTrackers() {
  // Create or update growth tracker
  let growthTracker = document.getElementById("growth-tracker")
  if (!growthTracker) {
    growthTracker = document.createElement("div")
    growthTracker.id = "growth-tracker"
    growthTracker.className = "game-tracker growth-tracker"
    document.body.appendChild(growthTracker)
  }
  growthTracker.innerHTML = `<span class="tracker-icon">🐭</span> <span class="tracker-value">${totalGrowth}</span>`

  // Create or update powerup tracker
  let powerupTracker = document.getElementById("powerup-tracker")
  if (!powerupTracker) {
    powerupTracker = document.createElement("div")
    powerupTracker.id = "powerup-tracker"
    powerupTracker.className = "game-tracker powerup-tracker"
    document.body.appendChild(powerupTracker)
  }
  powerupTracker.innerHTML = `<span class="tracker-icon">⚡</span> <span class="tracker-value">${totalPowerups}</span>`

  // Create or update bonus mice tracker (only visible during bonus mice mode)
  let bonusMiceDisplay = document.getElementById("bonus-mice-tracker")
  if (!bonusMiceDisplay) {
    bonusMiceDisplay = document.createElement("div")
    bonusMiceDisplay.id = "bonus-mice-tracker"
    bonusMiceDisplay.className = "game-tracker bonus-mice-tracker"
    document.body.appendChild(bonusMiceDisplay)
  }

  if (bonusRatsActive) {
    bonusMiceDisplay.innerHTML = `<span class="tracker-icon blue-text">🐭</span> <span class="tracker-value">${bonusMiceTracker}/5</span>`
    bonusMiceDisplay.style.display = "flex"
  } else {
    bonusMiceDisplay.style.display = "none"
  }

  // Add labels to existing meters
  updateMeterLabels()
}

// Add function to update meter labels
function updateMeterLabels() {
  // Add label to lives display
  if (livesDisplay && livesDisplay.parentNode) {
    let livesLabel = document.getElementById("lives-label")
    if (!livesLabel) {
      livesLabel = document.createElement("div")
      livesLabel.id = "lives-label"
      livesLabel.className = "meter-label"
      livesLabel.textContent = "LIVES"
      livesDisplay.parentNode.insertBefore(livesLabel, livesDisplay)
    }
  }

  // Add label to hunger meter
  if (hungerMeter && hungerMeter.parentNode && hungerActive) {
    let hungerLabel = document.getElementById("hunger-label")
    if (!hungerLabel) {
      hungerLabel = document.createElement("div")
      hungerLabel.id = "hunger-label"
      hungerLabel.className = "meter-label"
      hungerLabel.textContent = "HUNGER"
      hungerMeter.parentNode.insertBefore(hungerLabel, hungerMeter)
    }
  }
}