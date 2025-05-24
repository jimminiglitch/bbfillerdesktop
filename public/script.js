// Add this helper function at the top of your script
function safeQuerySelector(selector, parent = document) {
  const element = parent.querySelector(selector)
  if (!element) {
    console.warn(`Element not found: ${selector}`)
    return null
  }
  return element
}

// Add this to the top of your script
const eventListenerRegistry = new Map()

function registerEventListener(element, type, listener, options) {
  if (!element) return

  element.addEventListener(type, listener, options)

  if (!eventListenerRegistry.has(element)) {
    eventListenerRegistry.set(element, [])
  }

  eventListenerRegistry.get(element).push({
    type,
    listener,
    options,
  })
}

function cleanupEventListeners() {
  for (const [element, listeners] of eventListenerRegistry.entries()) {
    for (const { type, listener, options } of listeners) {
      element.removeEventListener(type, listener, options)
    }
  }
  eventListenerRegistry.clear()
}

// Add this function to create a cursor trail effect
function initCursorTrail() {
  document.addEventListener("mousemove", (e) => {
    // Only create a trail dot every few pixels to avoid performance issues
    if (Math.random() > 0.9) {
      const trail = document.createElement("div")
      trail.className = "cursor-trail"
      trail.style.left = `${e.clientX}px`
      trail.style.top = `${e.clientY}px`

      // Randomize the color for a more cyberpunk effect
      const colors = ["var(--neon-purple)", "var(--neon-pink)", "var(--neon-cyan)", "var(--neon-green)"]
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      trail.style.background = randomColor
      trail.style.boxShadow = `0 0 10px ${randomColor}`

      document.body.appendChild(trail)

      // Remove the trail element after animation completes
      setTimeout(() => {
        trail.remove()
      }, 800)
    }
  })
}

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
  initWindowResizeObservers() // Make sure this is called
  initCursorTrail() // Add this line to initialize the cursor trail

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

// Replace the current updateWindowContent function with this version
function updateWindowContent(win) {
  // Get the window content element
  const content = win.querySelector(".window-content")
  if (!content) return

  // Special handling for game windows
  if (win.id === "spacesnake") {
    const gameContainer = content.querySelector(".game-container")
    if (gameContainer) {
      // Make sure game container fills the content area
      gameContainer.style.width = "100%"
      gameContainer.style.height = "100%"
    }
  }

  // Handle iframes - don't force dimensions on all iframes
  const iframes = content.querySelectorAll("iframe")
  iframes.forEach((iframe) => {
    // Only set dimensions if iframe is direct child of content
    if (iframe.parentNode === content) {
      iframe.style.width = "100%"
      iframe.style.height = "100%"
    }
  })
}

// Add this to your initialization code
function initWindowResizeObservers() {
  // Use a debounced version of updateWindowContent to prevent too many updates
  const debouncedUpdateContent = debounce((win) => {
    updateWindowContent(win)
  }, 100)

  const windows = document.querySelectorAll(".popup-window")

  windows.forEach((win) => {
    // Create a resize observer for each window
    const resizeObserver = new ResizeObserver((entries) => {
      // Only update if the window is visible
      if (win.style.display !== "none" && !win.classList.contains("hidden")) {
        debouncedUpdateContent(win)
      }
    })

    // Start observing the window
    resizeObserver.observe(win)
  })
}

// === GLOBAL DRAG/RESIZE HELPERS ===
function startGlobalDragOrResize() {
  document.body.style.userSelect = "none";
  document.querySelectorAll("iframe").forEach(iframe => {
    iframe.style.pointerEvents = "none";
  });
}
function endGlobalDragOrResize() {
  document.body.style.userSelect = "";
  document.querySelectorAll("iframe").forEach(iframe => {
    iframe.style.pointerEvents = "";
  });
}

// ===== WINDOW MANAGEMENT =====
let currentZIndex = 10
const windowStates = {}

function getNextZIndex() {
  return ++currentZIndex
}

function initWindowControls() {
  const windows = document.querySelectorAll(".popup-window")
  console.log(`Initializing ${windows.length} windows`)

  windows.forEach((win) => {
    const id = win.id
    console.log(`Setting up window: ${id}`)

    // Clear any existing resizers to avoid duplicates
    win.querySelectorAll(".resizer").forEach((r) => r.remove())

    const header = win.querySelector(".window-header")
    if (!header) {
      console.warn(`Window ${id} has no header`)
      return // Skip if no header found
    }

    // Set up window buttons
    const btnMin = header.querySelector(".minimize")
    const btnMax = header.querySelector(".maximize")
    const btnCls = header.querySelector(".close")

    if (btnMin) btnMin.addEventListener("click", () => minimizeWindow(id))
    if (btnMax) btnMax.addEventListener("click", () => toggleMaximizeWindow(id))
    if (btnCls) btnCls.addEventListener("click", () => closeWindow(id))

    // Dragging logic
    header.addEventListener("mousedown", (e) => {
      if (e.target.tagName === "BUTTON") return // Don't drag if clicking buttons

      const offsetX = e.clientX - win.offsetLeft
      const offsetY = e.clientY - win.offsetTop
      win.style.zIndex = getNextZIndex()
      win.classList.add("dragging")
      startGlobalDragOrResize()

      function moveWindow(e) {
        if (win.classList.contains("maximized")) return
        win.style.left = `${e.clientX - offsetX}px`
        win.style.top = `${e.clientY - offsetY}px`
      }

      function stopMoving() {
        win.classList.remove("dragging")
        endGlobalDragOrResize()
        document.removeEventListener("mousemove", moveWindow)
        document.removeEventListener("mouseup", stopMoving)
        window.removeEventListener("blur", stopMoving)
      }

      document.addEventListener("mousemove", moveWindow)
      document.addEventListener("mouseup", stopMoving)
      window.addEventListener("blur", stopMoving)
    })

    // Double-click to maximize
    header.addEventListener("dblclick", (e) => {
      if (e.target.tagName !== "BUTTON") {
        toggleMaximizeWindow(id)
      }
    })

    // SIMPLIFIED RESIZER APPROACH
    // Create a single resize function that handles all directions
    function setupResizer(direction, element, win, getNextZIndex, updateWindowContent) {
      element.addEventListener("mousedown", (e) => {
        if (win.classList.contains("maximized")) return

        e.preventDefault()
        e.stopPropagation()

        win.classList.add("resizing")
        win.style.zIndex = getNextZIndex()
        startGlobalDragOrResize()

        const startX = e.clientX
        const startY = e.clientY
        const startWidth = win.offsetWidth
        const startHeight = win.offsetHeight
        const startLeft = win.offsetLeft
        const startTop = win.offsetTop

        function handleResize(e) {
          let newWidth = startWidth
          let newHeight = startHeight
          let newLeft = startLeft
          let newTop = startTop

          // Horizontal resizing
          if (direction.includes("e")) {
            newWidth = Math.max(300, startWidth + e.clientX - startX)
          }
          if (direction.includes("w")) {
            const diff = e.clientX - startX
            if (startWidth - diff > 300) {
              newWidth = startWidth - diff
              newLeft = startLeft + diff
            } else {
              newWidth = 300
              newLeft = startLeft + (startWidth - 300)
            }
          }

          // Vertical resizing
          if (direction.includes("s")) {
            newHeight = Math.max(200, startHeight + e.clientY - startY)
          }
          if (direction.includes("n")) {
            const diff = e.clientY - startY
            if (startHeight - diff > 200) {
              newHeight = startHeight - diff
              newTop = startTop + diff
            } else {
              newHeight = 200
              newTop = startTop + (startHeight - 200)
            }
          }

          win.style.width = `${newWidth}px`
          win.style.height = `${newHeight}px`
          win.style.left = `${newLeft}px`
          win.style.top = `${newTop}px`

          updateWindowContent(win)
        }

        function stopResize() {
          win.classList.remove("resizing")
          endGlobalDragOrResize()
          document.removeEventListener("mousemove", handleResize)
          document.removeEventListener("mouseup", stopResize)
          window.removeEventListener("blur", stopResize)
        }

        document.addEventListener("mousemove", handleResize)
        document.addEventListener("mouseup", stopResize)
        window.addEventListener("blur", stopResize)
      })
    }

    // Create resizers with correct positioning
    const resizers = [
      { dir: "n", class: "resizer-top" },
      { dir: "e", class: "resizer-right" },
      { dir: "s", class: "resizer-bottom" },
      { dir: "w", class: "resizer-left" },
      { dir: "nw", class: "resizer-top-left" },
      { dir: "ne", class: "resizer-top-right" },
      { dir: "sw", class: "resizer-bottom-left" },
      { dir: "se", class: "resizer-bottom-right" },
    ]

    resizers.forEach((r) => {
      const resizer = document.createElement("div")
      resizer.className = `resizer ${r.class}`
      win.appendChild(resizer)
      setupResizer(r.dir, resizer, win, getNextZIndex, updateWindowContent)
    })
  })
}

function openWindow(id) {
  console.log(`Opening window: ${id}`)
  const win = document.getElementById(id)
  if (!win) return

  // Hide start menu & deactivate other windows
  const startMenu = document.getElementById("start-menu")
  if (startMenu) startMenu.style.display = "none"
  document.querySelectorAll(".popup-window").forEach((w) => w.classList.remove("active"))

  win.classList.remove("hidden")
  win.classList.add("active")
  win.style.display = "flex"
  win.style.zIndex = getNextZIndex()
  win.classList.add("window-opening")
  setTimeout(() => {
    win.classList.remove("window-opening")
  }, 500)

  updateWindowContent(win)

  // ---- Window sizing logic ----
  const config = window.windowSizingConfig?.[id] || { mode: "default" }

  // Only apply config if window isn't previously sized/moved
  if (!windowStates[id]) {
    if (config.mode === "hug") {
      win.style.visibility = "hidden"
      win.style.display = "block"
      win.style.width = "auto"
      win.style.height = "auto"
      setTimeout(() => {
        const content = win.querySelector(".window-content")
        if (content) {
          // Add padding if needed
          const padW = 32, padH = 32
          const naturalW = Math.min(content.scrollWidth + padW, window.innerWidth * 0.95)
          const naturalH = Math.min(content.scrollHeight + padH, window.innerHeight * 0.95)
          win.style.width = `${naturalW}px`
          win.style.height = `${naturalH}px`
        }
        win.style.visibility = "visible"
        // Center
        const winWidth = win.offsetWidth
        const winHeight = win.offsetHeight
        win.style.left = `${(window.innerWidth - winWidth) / 2}px`
        win.style.top = `${(window.innerHeight - winHeight) / 2}px`
      }, 0)
      return
    } else if (config.mode === "fixed") {
      win.style.width = `${config.width}px`
      win.style.height = `${config.height}px`
      win.style.left = `${(window.innerWidth - config.width) / 2}px`
      win.style.top = `${(window.innerHeight - config.height) / 2}px`
    }
    // Otherwise, let default behavior run
  }

  // ---- Center all windows if not restored from previous position ----
  if (!windowStates[id] || (!windowStates[id].top && !windowStates[id].left)) {
    setTimeout(() => {
      const rect = win.getBoundingClientRect();
      const left = Math.max(20, Math.round((window.innerWidth - rect.width) / 2));
      const top = Math.max(20, Math.round((window.innerHeight - rect.height) / 2));
      win.style.left = left + "px";
      win.style.top = top + "px";
    }, 0);
  }

  const margin = 30 // px

  // MOBILE: Fill screen minus taskbar
  if (isMobile()) {
    Object.assign(win.style, {
      top: "0",
      left: "0",
      width: "100vw",
      height: "calc(100vh - 36px)",
      transform: "none",
    })
    return
  }

  // DESKTOP: Center, clamp, and set defaults as needed
  let width = parseInt(win.style.width, 10) || 600
  let height = parseInt(win.style.height, 10) || 400
  const vw = window.innerWidth
  const vh = window.innerHeight

  // Shrink if too big for viewport
  width = Math.min(width, vw - margin * 2)
  height = Math.min(height, vh - margin * 2)

  // Restore old state IF AND ONLY IF user had this window open before
  const stored = windowStates[id]
  if (stored && stored.width && stored.height) {
    width = Math.min(parseInt(stored.width, 10), vw - margin * 2)
    height = Math.min(parseInt(stored.height, 10), vh - margin * 2)
  }

  // Center window in viewport, or restore previous position if it fits
  let left = (vw - width) / 2
  let top = (vh - height) / 2
  if (stored && stored.left && stored.top) {
    // Clamp to viewport
    left = Math.min(Math.max(parseInt(stored.left, 10), margin), vw - width - margin)
    top = Math.min(Math.max(parseInt(stored.top, 10), margin), vh - height - margin)
  }

  Object.assign(win.style, {
    width: `${width}px`,
    height: `${height}px`,
    left: `${left}px`,
    top: `${top}px`,
    right: "",
    bottom: "",
    transform: "none",
  })
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
  if (!win || win.classList.contains("hidden")) return // Skip if already minimized

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
  if (win && !win.classList.contains("hidden")) {
    // Add closing animation
    win.classList.add("window-closing")

    // IMMEDIATELY handle all audio sources:

    // 1. Native audio/video elements
    win.querySelectorAll("audio, video").forEach((media) => {
      media.pause()
      media.currentTime = 0
      media.muted = true // Extra precaution
    })

    // 2. ALL iframes - set to about:blank immediately
    win.querySelectorAll("iframe").forEach((iframe) => {
      // Save original source for potential future reference
      if (!iframe.dataset.originalSrc) {
        iframe.dataset.originalSrc = iframe.src
      }
      // Set to about:blank to immediately stop any content
      iframe.src = "about:blank"
    })

    // 3. Any audio API contexts that might be running
    if (window.audioContexts && window.audioContexts[id]) {
      try {
        window.audioContexts[id].close()
        delete window.audioContexts[id]
      } catch (e) {
        console.warn("Error closing audio context:", e)
      }
    }

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

function toggleMaximizeWindow(id) {
  const win = document.getElementById(id)
  if (!win) return

  function enforceIframeStyle(win) {
    const iframe = win.querySelector("iframe")
    if (iframe) {
      iframe.style.width = "100%"
      iframe.style.height = "100%"
      iframe.style.border = "none"
      iframe.style.display = "block"
    }
  }

  const isMax = !win.classList.contains("maximized")

  // Ensure windowStates[id] exists before accessing its properties
  if (!windowStates[id]) {
    windowStates[id] = {}
  }

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
      enforceIframeStyle(win)
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
      enforceIframeStyle(win)
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

// --- Add this near your other initialization code (e.g., in initStartMenu or after DOMContentLoaded) ---

function setupStartMenuToggle() {
  const startButton = document.getElementById('start-button');
  const startMenu = document.getElementById('start-menu');
  if (!startButton || !startMenu) return;

  // Toggle menu on Start button click
  startButton.addEventListener('click', function (e) {
    e.stopPropagation();
    startMenu.classList.toggle('hidden');
  });

  // Hide menu on click outside
  document.addEventListener('click', function () {
    startMenu.classList.add('hidden');
  });

  // Prevent closing when clicking inside the menu
  startMenu.addEventListener('click', function (e) {
    e.stopPropagation();
  });
}

// Call this after DOMContentLoaded or inside your main init
document.addEventListener("DOMContentLoaded", () => {
  setupStartMenuToggle();
});

// Add this after your DOMContentLoaded or inside your main init function

document.getElementById('start-menu').addEventListener('click', function(e) {
  // Find the clicked element that has a data-window attribute
  const menuItem = e.target.closest('[data-window]');
  if (menuItem) {
    e.preventDefault(); // Stop default link action
    const windowId = menuItem.getAttribute('data-window');
    if (windowId) {
      openWindow(windowId); // Open the corresponding window
    }
    // Optionally, hide the menu after click
    document.getElementById('start-menu').style.display = 'none';
  }
});

// ===== START MENU OUTSIDE CLICK & RESIZE HIDE =====
document.addEventListener('DOMContentLoaded', () => {
  const startMenu = document.getElementById('start-menu');
  const startButton = document.getElementById('start-button');

  // Hide start menu when clicking outside
  document.addEventListener('mousedown', function(event) {
    if (
      startMenu.style.display === 'flex' &&
      !startMenu.contains(event.target) &&
      event.target !== startButton
    ) {
      startMenu.style.display = 'none';
    }
  });

  // Optional: hide on window resize (for mobile)
  window.addEventListener('resize', () => {
    startMenu.style.display = 'none';
  });
});

// ===== DESKTOP ICONS =====
function initDesktopIcons() {
  console.log("Initializing desktop icons")

  // For each icon container (desktop or folder)
  const containers = [
    document.getElementById("desktop-icons"),
    document.getElementById("videos-folder-content"),
    document.getElementById("coolpics-folder-content"),
    document.getElementById("interactive-folder-content"),
  ].filter(Boolean)

  containers.forEach((container) => {
    console.log(`Setting up icons in container: ${container.id}`)
    const icons = container.querySelectorAll(".desktop-icon")
    console.log(`Found ${icons.length} icons in ${container.id}`)

    // Grid settings
    const iconsPerRow = 4
    const iconSpacingX = 100
    const iconSpacingY = 100
    const startX = 20
    const startY = 20

    icons.forEach((icon, i) => {
      // Remove any existing event listeners to prevent duplicates
      const newIcon = icon.cloneNode(true)
      if (icon.parentNode) {
        icon.parentNode.replaceChild(newIcon, icon)
      }

      // Use the new icon reference
      const iconElement = newIcon

      // Calculate grid position
      const row = Math.floor(i / iconsPerRow)
      const col = i % iconsPerRow

      // Set position
      iconElement.style.position = "absolute"
      iconElement.style.left = `${startX + col * iconSpacingX}px`
      iconElement.style.top = `${startY + row * iconSpacingY}px`

      // Make sure icon is visible
      iconElement.style.display = "flex"
      iconElement.style.visibility = "visible"

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
      let startXPos = 0,
        startYPos = 0

      iconElement.addEventListener("mousedown", (e) => {
        e.preventDefault()
        startXPos = e.clientX
        startYPos = e.clientY
        isDragging = false

        // Add selected class
        if (!e.ctrlKey) {
          document.querySelectorAll(".desktop-icon.selected").forEach((ic) => {
            if (ic !== iconElement) ic.classList.remove("selected")
          })
        }
        iconElement.classList.add("selected")

        const onMouseMove = (e) => {
          const dx = e.clientX - startXPos
          const dy = e.clientY - startYPos

          // Only start drag if movement is significant
          if (!isDragging && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
            isDragging = true
          }

          if (isDragging) {
            iconElement.style.left = `${iconElement.offsetLeft + dx}px`
            iconElement.style.top = `${iconElement.offsetTop + dy}px`
            startXPos = e.clientX
            startYPos = e.clientY
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

    // Make sure the container is relatively positioned for absolute icons
    container.style.position = "relative"
    container.style.minHeight = `${startY + Math.ceil(icons.length / iconsPerRow) * iconSpacingY}px`
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

  // Set canvas dimensions explicitly
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // Make sure canvas is visible
  canvas.style.display = "block"
  canvas.style.position = "fixed"
  canvas.style.top = "0"
  canvas.style.left = "0"
  canvas.style.zIndex = "-1"

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

// Extend/Refine your window sizing config at the top of your main JS file:
window.windowSizingConfig = {
  'about':      { mode: 'hug' },                      // Auto-size to iframe/content
  'resume':     { mode: 'fixed', width: 780, height: 1000 },
  'contact':    { mode: 'fixed', width: 400, height: 500 },
  'nature':     { mode: 'fixed', width: 720, height: 620 },
  'music':      { mode: 'fixed', width: 340, height: 640 },
  'spacesnake': { mode: 'fixed', width: 720, height: 600 },
  // Add more as needed...
};

// ===== DEBOUNCE FUNCTION =====
function debounce(func, wait) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

// Add this before the window.addEventListener("error"...) line
window.addEventListener("beforeunload", cleanupEventListeners)

// ===== CONSOLE DEBUGGING =====
// Add this at the end to check for any issues
window.addEventListener("error", (e) => {
  console.error(
    "JavaScript error:",
    e.message,
    "at",
    e.filename,
    "line",
    e.lineno,
    "stack:",
    e.error?.stack || "No stack trace available",
  )
})

console.log("Script loaded successfully")

// Initialize spacesnake if it exists
const windowEl = document.getElementById("spacesnake")
if (windowEl) {
  const gameContainer = windowEl.querySelector(".game-container")
  if (window.spacesnakeCleanup) window.spacesnakeCleanup()
}
