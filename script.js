// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded - initializing desktop...")

  // Force desktop icons to be visible
  document.querySelectorAll(".desktop-icon").forEach((icon) => {
    icon.style.display = "flex"
    console.log(`Icon initialized: ${icon.id}`)
  })

  // Initialize all components
  initWindowControls()
  initDesktopIcons()
  initStarfield()
  initGlitchEffects()
  initStartMenu()
  initIframeHandling()

  // Start the clock
  updateClock()
  setInterval(updateClock, 1000)

  // Show the title if it exists
  const title = document.querySelector(".landing-title")
  if (title) {
    title.style.display = "block"
    console.log("Title displayed")
  }

  // Make sure container is visible
  const container = document.querySelector(".container")
  if (container) {
    container.style.display = "block"
    container.style.visibility = "visible"
    console.log("Container made visible")
  }
})

// ===== WINDOW MANAGEMENT =====
function initWindowControls() {
  const windows = document.querySelectorAll(".popup-window")
  console.log(`Initializing ${windows.length} windows`)

  windows.forEach((win) => {
    const id = win.id
    const header = win.querySelector(".window-header")
    if (!header) {
      console.warn(`Window ${id} has no header`)
      return // Skip if no header found
    }

    const btnMin = header.querySelector(".minimize")
    const btnMax = header.querySelector(".maximize")
    const btnCls = header.querySelector(".close")

    if (btnMin) btnMin.addEventListener("click", () => minimizeWindow(id))
    if (btnMax)
      btnMax.addEventListener("click", (e) => {
        const winEl = e.currentTarget.closest(".popup-window")
        toggleMaximize(winEl)
      })
    if (btnCls) btnCls.addEventListener("click", () => closeWindow(id))

    // Dragging logic
    let isDragging = false,
      offsetX = 0,
      offsetY = 0
    header.addEventListener("mousedown", (e) => {
      if (e.target.tagName === "BUTTON") return // Don't drag if clicking buttons
      isDragging = true
      offsetX = e.clientX - win.offsetLeft
      offsetY = e.clientY - win.offsetTop
      win.style.zIndex = getNextZIndex()

      // Add active class to show it's being dragged
      win.classList.add("dragging")
    })

    // Use passive event listeners for better performance
    document.addEventListener(
      "mousemove",
      (e) => {
        if (isDragging) {
          // Don't drag if maximized
          if (win.classList.contains("maximized")) return

          win.style.left = `${e.clientX - offsetX}px`
          win.style.top = `${e.clientY - offsetY}px`
        }
      },
      { passive: true },
    )

    document.addEventListener(
      "mouseup",
      () => {
        isDragging = false
        win.classList.remove("dragging")
      },
      { passive: true },
    )

    // Double-click to maximize
    header.addEventListener("dblclick", (e) => {
      if (e.target.tagName !== "BUTTON") {
        toggleMaximizeWindow(id)
      }
    })

    // Resizing logic
    const directions = ["top", "right", "bottom", "left", "top-left", "top-right", "bottom-left", "bottom-right"]

    directions.forEach((dir) => {
      const resizer = document.createElement("div")
      resizer.classList.add("resizer", `resizer-${dir}`)
      win.appendChild(resizer)

      let isResizing = false

      resizer.addEventListener("mousedown", (e) => {
        if (win.classList.contains("maximized")) return

        e.preventDefault()
        e.stopPropagation()
        isResizing = true
        win.classList.add("resizing")
        win.style.zIndex = getNextZIndex() // Ensure window is on top when resizing
        const startX = e.clientX
        const startY = e.clientY
        const startWidth = Number.parseInt(getComputedStyle(win).width, 10)
        const startHeight = Number.parseInt(getComputedStyle(win).height, 10)
        const startTop = win.offsetTop
        const startLeft = win.offsetLeft

        function doDrag(e) {
          if (!isResizing) return
          let newWidth = startWidth
          let newHeight = startHeight
          let newTop = startTop
          let newLeft = startLeft

          if (dir.includes("right")) {
            newWidth = Math.max(300, startWidth + e.clientX - startX)
          }
          if (dir.includes("bottom")) {
            newHeight = Math.max(200, startHeight + e.clientY - startY)
          }
          if (dir.includes("left")) {
            const dx = e.clientX - startX
            newWidth = Math.max(300, startWidth - dx)
            newLeft = startLeft + dx
          }
          if (dir.includes("top")) {
            const dy = e.clientY - startY
            newHeight = Math.max(200, startHeight - dy)
            newTop = startTop + dy
          }

          win.style.width = `${newWidth}px`
          win.style.height = `${newHeight}px`
          win.style.top = `${newTop}px`
          win.style.left = `${newLeft}px`
        }

        function stopDrag() {
          isResizing = false
          win.classList.remove("resizing")
          window.removeEventListener("mousemove", doDrag)
          window.removeEventListener("mouseup", stopDrag)
        }

        window.addEventListener("mousemove", doDrag, { passive: true })
        window.addEventListener("mouseup", stopDrag, { passive: true })
      })
    })
  })
}

// ===== WINDOW OPERATIONS =====
let currentZIndex = 10
const windowStates = {}

function getNextZIndex() {
  return ++currentZIndex
}

function openWindow(id) {
  console.log(`Opening window: ${id}`)
  const win = document.getElementById(id)
  if (!win) {
    console.error(`Window not found: ${id}`)
    return
  }

  // 1) Hide start menu & deactivate other windows
  const startMenu = document.getElementById("start-menu")
  if (startMenu) startMenu.style.display = "none"
  document.querySelectorAll(".popup-window").forEach((w) => w.classList.remove("active"))

  // 2) Show and activate window
  win.classList.remove("hidden")
  win.classList.add("active")
  win.style.display = "flex"
  win.style.zIndex = getNextZIndex()
  win.classList.add("window-opening")
  setTimeout(() => {
    win.classList.remove("window-opening")
  }, 500)

  // 3) Restore previous bounds or clamp to viewport
  const isMobileView = isMobile()
  if (isMobileView) {
    Object.assign(win.style, {
      top: "0",
      left: "0",
      width: "100vw",
      height: "calc(100vh - 36px)",
      transform: "none",
    })
  } else {
    const stored = windowStates[id]
    if (stored) Object.assign(win.style, stored)

    const rect = win.getBoundingClientRect()
    const margin = 20
    const vw = window.innerWidth
    const vh = window.innerHeight
    let newW = rect.width,
      newH = rect.height,
      newLeft = rect.left,
      newTop = rect.top

    if (rect.width > vw - margin * 2) newW = vw - margin * 2
    if (rect.height > vh - margin * 2) newH = vh - margin * 2
    if (rect.left < margin) newLeft = margin
    if (rect.top < margin) newTop = margin
    if (rect.right > vw - margin) newLeft = vw - margin - newW
    if (rect.bottom > vh - margin) newTop = vh - margin - newH

    Object.assign(win.style, {
      width: `${newW}px`,
      height: `${newH}px`,
      left: `${newLeft}px`,
      top: `${newTop}px`,
    })
  }
}

// Helper function to detect mobile devices
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

function createTaskbarIcon(id) {
  if (document.getElementById(`taskbar-icon-${id}`)) return

  const win = document.getElementById(id)
  if (!win) return // Skip if window doesn't exist

  const titleEl = win.querySelector(".window-header span")
  const title = titleEl ? titleEl.textContent.replace(".EXE", "") : id.toUpperCase()

  const btn = document.createElement("button")
  btn.id = `taskbar-icon-${id}`
  btn.className = "taskbar-icon"

  const iconText = document.createElement("span")
  iconText.textContent = title
  btn.appendChild(iconText)

  btn.addEventListener("click", () => {
    openWindow(id)
    btn.remove()
  })

  const taskbarIcons = document.getElementById("taskbar-icons")
  if (taskbarIcons) taskbarIcons.appendChild(btn)
}

function minimizeWindow(id) {
  const win = document.getElementById(id)
  if (!win) return

  // Add minimizing animation
  win.classList.add("window-minimizing")

  setTimeout(() => {
    win.classList.remove("window-minimizing")
    win.classList.add("hidden")
    win.style.display = "none"

    // Create taskbar icon
    createTaskbarIcon(id)
  }, 300)
}

function closeWindow(id) {
  const win = document.getElementById(id)
  if (win) {
    // Add closing animation
    win.classList.add("window-closing")

    setTimeout(() => {
      // Hide window
      win.classList.remove("window-closing")
      win.classList.add("hidden")
      win.style.display = "none"

      // Remove taskbar icon
      const icon = document.getElementById(`taskbar-icon-${id}`)
      if (icon) icon.remove()
    }, 300)
  }
}

function toggleMaximize(win) {
  if (win.classList.contains("maximized")) {
    // restore
    win.classList.remove("maximized")
    win.style.top = win.dataset.prevTop
    win.style.left = win.dataset.prevLeft
    win.style.width = win.dataset.prevWidth
    win.style.height = win.dataset.prevHeight
  } else {
    // stash current geometry
    win.dataset.prevTop = win.style.top
    win.dataset.prevLeft = win.style.left
    win.dataset.prevWidth = win.style.width
    win.dataset.prevHeight = win.style.height
    // maximize
    win.style.top = "0"
    win.style.left = "0"
    win.style.width = "100vw"
    win.style.height = "100vh"
    win.classList.add("maximized")
  }
}

function toggleMaximizeWindow(id) {
  const win = document.getElementById(id)
  if (!win) return

  const isMax = !win.classList.contains("maximized")

  if (isMax) {
    // save old bounds
    windowStates[id] = {
      parent: win.parentNode,
      next: win.nextSibling,
      position: win.style.position,
      top: win.style.top,
      left: win.style.left,
      right: win.style.right,
      bottom: win.style.bottom,
      width: win.style.width,
      height: win.style.height,
      transform: win.style.transform,
    }

    win.classList.add("window-maximizing")
    setTimeout(() => {
      document.body.appendChild(win)
      win.classList.add("maximized")
      win.classList.remove("window-maximizing")
      Object.assign(win.style, {
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "36px",
        width: "auto",
        height: "auto",
        transform: "none",
        zIndex: getNextZIndex(),
      })
    }, 300)
  } else {
    win.classList.add("window-restoring")
    win.classList.remove("maximized")
    setTimeout(() => {
      const prev = windowStates[id] || {}
      Object.assign(win.style, {
        position: prev.position || "absolute",
        top: prev.top || "",
        left: prev.left || "",
        right: prev.right || "",
        bottom: prev.bottom || "",
        width: prev.width || "",
        height: prev.height || "",
        transform: prev.transform || "",
        zIndex: getNextZIndex(),
      })
      if (prev.parent) prev.parent.insertBefore(win, prev.next)
      win.classList.remove("window-restoring")
    }, 300)
  }
}

// ===== CLOCK & START MENU =====
function updateClock() {
  const clk = document.getElementById("clock")
  if (clk) {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    const seconds = now.getSeconds().toString().padStart(2, "0")
    clk.textContent = `${hours}:${minutes}:${seconds}`
    clk.classList.add("clock-pulse")
    setTimeout(() => {
      clk.classList.remove("clock-pulse")
    }, 500)
  }
}

function initStartMenu() {
  const startButton = document.getElementById("start-button")
  if (startButton) {
    console.log("Start button found, initializing...")
    startButton.addEventListener("click", () => {
      const m = document.getElementById("start-menu")
      if (!m) {
        console.warn("Start menu not found")
        return
      }

      const isVisible = m.style.display === "flex"
      if (isVisible) {
        m.classList.add("menu-hiding")
        setTimeout(() => {
          m.style.display = "none"
          m.classList.remove("menu-hiding")
        }, 300)
      } else {
        m.style.display = "flex"
        m.classList.add("menu-showing")
        setTimeout(() => {
          m.classList.remove("menu-showing")
        }, 300)
      }
    })
  } else {
    console.warn("Start button not found")
  }
}

// ===== DESKTOP ICONS =====
function initDesktopIcons() {
  const icons = document.querySelectorAll(".desktop-icon")
  console.log(`Initializing ${icons.length} desktop icons`)

  icons.forEach((icon) => {
    // IMPORTANT: Remove any existing event listeners to prevent duplicates
    const newIcon = icon.cloneNode(true)
    if (icon.parentNode) {
      icon.parentNode.replaceChild(newIcon, icon)
    }

    // Use the new icon reference
    const iconElement = newIcon

    // Make sure icon is visible
    iconElement.style.display = "flex"
    iconElement.style.visibility = "visible"

    // Set position if not already set
    if (!iconElement.style.top || !iconElement.style.left) {
      const id = iconElement.id
      // Set default positions based on ID if not already positioned
      if (id === "icon-about") {
        iconElement.style.top = "20px"
        iconElement.style.left = "20px"
      } else if (id === "icon-resume") {
        iconElement.style.top = "120px"
        iconElement.style.left = "20px"
      } else if (id === "icon-contact") {
        iconElement.style.top = "220px"
        iconElement.style.left = "20px"
      } else if (id === "icon-tigerrr") {
        iconElement.style.top = "320px"
        iconElement.style.left = "20px"
      } else if (id === "icon-octavia") {
        iconElement.style.top = "20px"
        iconElement.style.left = "120px"
      } else if (id === "icon-miles") {
        iconElement.style.top = "120px"
        iconElement.style.left = "120px"
      } else if (id === "icon-nature") {
        iconElement.style.top = "220px"
        iconElement.style.left = "120px"
      } else if (id === "icon-toader") {
        iconElement.style.top = "320px"
        iconElement.style.left = "120px"
      } else if (id === "icon-music") {
        iconElement.style.top = "20px"
        iconElement.style.left = "220px"
      } else if (id === "icon-spacesnake") {
        iconElement.style.top = "120px"
        iconElement.style.left = "220px"
      } else if (id === "icon-r3d3ch0") {
        iconElement.style.top = "220px"
        iconElement.style.left = "220px"
      } else if (id === "icon-3drave") {
        iconElement.style.top = "320px"
        iconElement.style.left = "220px"
      } else if (id === "icon-videos") {
        iconElement.style.top = "420px"
        iconElement.style.left = "20px"
      } else {
        // For any other icons, position them in a grid
        const index = Array.from(icons).indexOf(icon)
        const row = Math.floor(index / 4)
        const col = index % 4
        iconElement.style.top = `${row * 100 + 20}px`
        iconElement.style.left = `${col * 100 + 20}px`
      }
    }

    // Open on double-click
    iconElement.addEventListener("dblclick", () => {
      if (iconElement.dataset.window) {
        console.log(`Double-clicked icon: ${iconElement.dataset.window}`)
        openWindow(iconElement.dataset.window)
      } else {
        console.warn(`Icon ${iconElement.id} has no window data attribute`)
      }
    })

    // Hover effect
    iconElement.addEventListener("mouseenter", () => {
      iconElement.classList.add("icon-hover")
    })

    iconElement.addEventListener("mouseleave", () => {
      iconElement.classList.remove("icon-hover")
    })

    // Dragging functionality
    let isDragging = false
    let startX = 0,
      startY = 0

    iconElement.addEventListener("mousedown", (e) => {
      e.preventDefault()
      startX = e.clientX
      startY = e.clientY
      isDragging = false

      // Add selected class
      if (!e.ctrlKey) {
        document.querySelectorAll(".desktop-icon.selected").forEach((ic) => {
          if (ic !== iconElement) ic.classList.remove("selected")
        })
      }
      iconElement.classList.add("selected")

      const onMouseMove = (e) => {
        const dx = e.clientX - startX
        const dy = e.clientY - startY

        // Only start drag if movement is significant
        if (!isDragging && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
          isDragging = true
        }

        if (isDragging) {
          iconElement.style.left = `${iconElement.offsetLeft + dx}px`
          iconElement.style.top = `${iconElement.offsetTop + dy}px`
          startX = e.clientX
          startY = e.clientY
        }
      }

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)

        // If it was just a click (not a drag), keep selected
        if (!isDragging) {
          iconElement.classList.add("selected")
        }
      }

      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
    })

    // Prevent default browser drag behavior
    iconElement.addEventListener("dragstart", (e) => e.preventDefault())
  })
}

// ===== MULTI-SELECT =====
let selStartX, selStartY, selDiv
function onSelectStart(e) {
  if (e.target.closest(".desktop-icon, .popup-window, #start-bar, #start-menu")) return
  selStartX = e.clientX
  selStartY = e.clientY
  selDiv = document.createElement("div")
  selDiv.id = "selection-rect"
  selDiv.style.left = `${selStartX}px`
  selDiv.style.top = `${selStartY}px`
  selDiv.style.width = "0px"
  selDiv.style.height = "0px"
  document.body.appendChild(selDiv)
  document.addEventListener("mousemove", onSelectMove, { passive: true })
  document.addEventListener("mouseup", onSelectEnd, { once: true, passive: true })
  e.preventDefault()
}

function onSelectMove(e) {
  if (!selDiv) return
  const x = Math.min(e.clientX, selStartX),
    y = Math.min(e.clientY, selStartY),
    w = Math.abs(e.clientX - selStartX),
    h = Math.abs(e.clientY - selStartY)
  selDiv.style.left = `${x}px`
  selDiv.style.top = `${y}px`
  selDiv.style.width = `${w}px`
  selDiv.style.height = `${h}px`
  const box = selDiv.getBoundingClientRect()
  document.querySelectorAll(".desktop-icon").forEach((icon) => {
    const r = icon.getBoundingClientRect()
    const inside = r.left >= box.left && r.right <= box.right && r.top >= box.top && r.bottom <= box.bottom
    icon.classList.toggle("selected", inside)
  })
}

function onSelectEnd() {
  if (selDiv) selDiv.remove()
  selDiv = null
}

// ===== STARFIELD BACKGROUND =====
function initStarfield() {
  const canvas = document.getElementById("background-canvas")
  if (!canvas) {
    console.warn("Background canvas not found")
    return
  }

  const ctx = canvas.getContext("2d")
  if (!ctx) {
    console.warn("Could not get 2D context for canvas")
    return
  }

  console.log("Initializing starfield")
  let stars = []
  const STAR_COUNT = 500

  function initStars() {
    stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * canvas.width,
      o: Math.random(),
    }))
  }

  function drawStars() {
    // full‐opacity background to create motion-blur effect
    ctx.fillStyle = "rgba(0,0,0,1)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (const s of stars) {
      // twinkle
      s.o += (Math.random() - 0.5) * 0.02
      s.o = Math.max(0.1, Math.min(1, s.o))

      // move forward
      s.z -= 2
      if (s.z <= 0) {
        s.z = canvas.width
        s.x = Math.random() * canvas.width
        s.y = Math.random() * canvas.height
        s.o = Math.random()
      }

      const k = 128.0 / s.z
      const px = (s.x - canvas.width / 2) * k + canvas.width / 2
      const py = (s.y - canvas.height / 2) * k + canvas.height / 2
      const sz = Math.max(0.5, (1 - s.z / canvas.width) * 2) // half as big

      ctx.globalAlpha = s.o
      ctx.fillStyle = "#fff"
      ctx.beginPath()
      ctx.arc(px, py, sz, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.globalAlpha = 1
  }

  // on resize, recalc canvas + reinit stars
  window.addEventListener(
    "resize",
    debounce(() => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
    }, 250),
  )

  // initial sizing & stars
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  initStars()

  // loop
  function animate() {
    drawStars()
    requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}

// ===== GLITCH EFFECTS =====
function initGlitchEffects() {
  console.log("Initializing glitch effects")
  setInterval(() => {
    document.querySelectorAll(".glitch-me").forEach((el) => {
      if (Math.random() > 0.95) {
        el.classList.add("glitching")
        setTimeout(() => el.classList.remove("glitching"), 200 + Math.random() * 400)
      }
    })
  }, 2000)

  setInterval(() => {
    if (Math.random() > 0.98) {
      const glitch = document.createElement("div")
      glitch.className = "screen-glitch"
      document.body.appendChild(glitch)
      setTimeout(() => glitch.remove(), 150 + Math.random() * 250)
    }
  }, 10000)
}

// ===== IFRAME HANDLING =====
function initIframeHandling() {
  console.log("🖼️ Initializing iframe handling with display-only reload logic")

  document.querySelectorAll("iframe").forEach((iframe) => {
    const originalSrc = iframe.src
    const parent = iframe.closest(".popup-window")
    if (!parent) return

    // Track if the window was previously hidden
    let wasHidden = parent.style.display === "none"

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === "style") {
          const isHiddenNow = parent.style.display === "none"

          // Only reload if window was hidden and is now visible
          if (wasHidden && !isHiddenNow && iframe.src !== originalSrc) {
            console.log(`🔄 Window became visible, restoring iframe src: ${iframe.id || "unnamed"}`)
            iframe.src = originalSrc
          }

          // Update hidden state for next time
          wasHidden = isHiddenNow
        }
      })
    })

    observer.observe(parent, { attributes: true, attributeFilter: ["style"] })
    console.log(`🔍 Observer attached to iframe: ${iframe.id || "unnamed"}`)
  })
}

// ===== INITIALIZATION =====
// Add event listener for window selection
window.addEventListener("mousedown", onSelectStart)

// ===== DEBOUNCE FUNCTION =====
function debounce(func, wait) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

// ===== CONSOLE DEBUGGING =====
// Add this at the end to check for any issues
window.addEventListener("error", (e) => {
  console.error("JavaScript error:", e.message, "at", e.filename, "line", e.lineno)
})

console.log("Script loaded successfully")
