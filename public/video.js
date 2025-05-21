// Description: This script initializes a video system for a web application.
// It sets up video players for YouTube and Vimeo, handles window resizing,
// and provides a function to clean up video players when the window is closed.
document.addEventListener("DOMContentLoaded", () => {
  console.log("🎬 Enhanced video system initializing...")

  // Video configuration: all keys lowercase, no poster
  const videoConfig = {
    future: {
      type: "youtube",
      id: "bySOMahBN7g",
      title: "Future Unknown",
      description: "A thrilling documentary about the Clyde Cup tournament.",
    },
    critter: {
      type: "youtube",
      id: "i8h72QCGTWE",
      title: "Curious Critter POV",
      description: "S.E.P. Challenge Video 1",
    },
    joyful: {
      type: "youtube",
      id: "erZBbUa4Rac",
      title: "A Joyful and Meaningful Life",
      description: "Phantom of the Oprah pt. 3",
    },
    abstract: {
      type: "youtube",
      id: "ieB-dxSihuo",
      title: "Abstract",
      description: "S.E.P. Challenge Video 6",
    },
    papaz: {
      type: "youtube",
      id: "fJE_uqm8NOU",
      title: "Papaz",
      description: "S.E.P. Challenge Video 2",
    },
    weight: {
      type: "vimeo",
      id: "1082536082",
      title: "The Weight of Care",
      description: "An experimental documentary on the emotional weight of private care medicine in the USA.",
    },
    birdbrian: {
      type: "youtube",
      id: "6l2BltEBLt0",
      title: "Birding with Brian",
      description: "A documentary film about Birding with Brian.",
    },
    clydecup: {
      type: "youtube",
      id: "16N_xqMwHDg",
      title: "The Illustrious Clyde Cup",
      description: "",
    },
  }

  const activeVideoPlayers = new Map()
  let YT

  function loadYouTubeAPI() {
    if (window.YT) {
      YT = window.YT
      return Promise.resolve()
    }
    return new Promise((resolve) => {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
      window.onYouTubeIframeAPIReady = () => {
        YT = window.YT
        resolve()
      }
    })
  }

  const videoWindows = document.querySelectorAll(
    "#joyful, #papaz, #abstract, #weight, #birdbrian, #clydecup, #future, #critter"
  )
  console.log(`🔍 Found ${videoWindows.length} video windows`)

  videoWindows.forEach((win) => {
    const windowId = win.id.toLowerCase()
    const config = videoConfig[windowId]
    if (!config) {
      console.error(`❌ No configuration for video window: ${windowId}`)
      return
    }

    console.log(`🎬 Setting up video window: ${windowId}`)
    const windowContent = win.querySelector(".window-content")
    if (!windowContent) {
      console.error(`❌ .window-content not found for: ${windowId}`)
      return
    }

    windowContent.innerHTML = ""

    // Create a container for the video player
    const videoContainer = document.createElement("div")
    videoContainer.id = `${windowId}-player-container`
    videoContainer.style.width = "100%"
    videoContainer.style.height = "100%"
    windowContent.appendChild(videoContainer)

    // Create a simple placeholder (no poster)
    const placeholder = document.createElement("div")
    placeholder.className = "video-placeholder"
    placeholder.style.width = "100%"
    placeholder.style.height = "100%"
    placeholder.style.display = "flex"
    placeholder.style.flexDirection = "column"
    placeholder.style.justifyContent = "center"
    placeholder.style.alignItems = "center"
    placeholder.style.background = "#222"
    placeholder.style.color = "white"
    placeholder.style.textShadow = "0 0 10px rgba(0,0,0,0.8)"

    const playButton = document.createElement("div")
    playButton.innerHTML = "▶️"
    playButton.style.fontSize = "48px"
    playButton.style.cursor = "pointer"

    const titleElement = document.createElement("h3")
    titleElement.textContent = config.title
    titleElement.style.margin = "10px 0 5px 0"

    const descElement = document.createElement("p")
    descElement.textContent = config.description
    descElement.style.margin = "0"
    descElement.style.fontSize = "14px"
    descElement.style.padding = "0 20px"
    descElement.style.textAlign = "center"

    placeholder.appendChild(playButton)
    placeholder.appendChild(titleElement)
    placeholder.appendChild(descElement)
    videoContainer.appendChild(placeholder)

    placeholder.addEventListener("click", () => {
      if (config.type === "youtube") {
        loadYouTubeAPI().then(() => {
          setupYouTubePlayer(config.id, videoContainer)
          placeholder.remove()
        })
      } else if (config.type === "vimeo") {
        setupVimeoPlayer(config.id, videoContainer)
        placeholder.remove()
      }
    })
  })

  function setupYouTubePlayer(id, element) {
    if (!element || !element.id) return
    const playerDiv = document.createElement("div")
    playerDiv.id = `${element.id}-youtube-player`
    element.appendChild(playerDiv)
    const player = new YT.Player(playerDiv.id, {
      videoId: id,
      width: "100%",
      height: "100%",
      playerVars: { autoplay: 1, modestbranding: 1, rel: 0 },
      events: {
        onReady: (event) => event.target.playVideo(),
      },
    })
    activeVideoPlayers.set(element.id, player)
  }

  function setupVimeoPlayer(id, element) {
    if (!element) return
    const iframe = document.createElement("iframe")
    iframe.src = `https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0`
    iframe.style.width = "100%"
    iframe.style.height = "100%"
    iframe.style.border = "none"
    iframe.allow = "autoplay; fullscreen; picture-in-picture"
    iframe.allowFullscreen = true
    element.innerHTML = ""
    element.appendChild(iframe)
  }

  window.cleanupVideoPlayers = () => {
    activeVideoPlayers.forEach((player) => {
      if (player && typeof player.destroy === "function") player.destroy()
    })
    activeVideoPlayers.clear()
  }

  document.querySelectorAll(".popup-window .close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", () => {
      const windowId = closeBtn.closest(".popup-window").id.toLowerCase()
      const player = activeVideoPlayers.get(`${windowId}-player-container`)
      if (player && typeof player.destroy === "function") {
        player.destroy()
        activeVideoPlayers.delete(`${windowId}-player-container`)
      }
    })
  })
})
