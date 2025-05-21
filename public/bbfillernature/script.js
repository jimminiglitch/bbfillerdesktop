document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("gallery-container")
  const items = document.querySelectorAll(".gallery-item")
  const prevArea = document.getElementById("prevArea")
  const nextArea = document.getElementById("nextArea")
  const fullscreenBtn = document.getElementById("fullscreenBtn")
  let currentIndex = 0
  let isTransitioning = false

  function showSlide(index) {
    if (isTransitioning) return
    isTransitioning = true

    // Hide current slide
    const currentSlide = document.querySelector(".gallery-item.active")
    currentSlide.classList.remove("active")

    // Wait for fade out transition
    setTimeout(() => {
      // Show new slide
      items.forEach((item, i) => {
        item.classList.toggle("active", i === index)
      })
      isTransitioning = false
    }, 500) // Match this to the CSS transition time
  }

  function goToPrevSlide() {
    currentIndex = (currentIndex - 1 + items.length) % items.length
    showSlide(currentIndex)
  }

  function goToNextSlide() {
    currentIndex = (currentIndex + 1) % items.length
    showSlide(currentIndex)
  }

  // Click navigation
  prevArea.addEventListener("click", goToPrevSlide)
  nextArea.addEventListener("click", goToNextSlide)

  // Fullscreen functionality
  fullscreenBtn.addEventListener("click", toggleFullscreen)

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (container.requestFullscreen) {
        container.requestFullscreen()
      } else if (container.webkitRequestFullscreen) {
        /* Safari */
        container.webkitRequestFullscreen()
      } else if (container.msRequestFullscreen) {
        /* IE11 */
        container.msRequestFullscreen()
      }
      container.classList.add("fullscreen-container")
      fullscreenBtn.innerHTML = `
        <svg class="fullscreen-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
        </svg>
        Exit Fullscreen
      `
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        /* Safari */
        document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) {
        /* IE11 */
        document.msExitFullscreen()
      }
      container.classList.remove("fullscreen-container")
      fullscreenBtn.innerHTML = `
        <svg class="fullscreen-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
        </svg>
        Fullscreen
      `
    }
  }

  // Handle fullscreen change
  document.addEventListener("fullscreenchange", handleFullscreenChange)
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
  document.addEventListener("mozfullscreenchange", handleFullscreenChange)
  document.addEventListener("MSFullscreenChange", handleFullscreenChange)

  function handleFullscreenChange() {
    if (
      !document.fullscreenElement &&
      !document.webkitFullscreenElement &&
      !document.mozFullScreenElement &&
      !document.msFullscreenElement
    ) {
      container.classList.remove("fullscreen-container")
      fullscreenBtn.innerHTML = `
        <svg class="fullscreen-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
        </svg>
        Fullscreen
      `
    }
  }

  // Add keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      goToPrevSlide()
    } else if (e.key === "ArrowRight") {
      goToNextSlide()
    } else if (e.key === "f" || e.key === "F") {
      toggleFullscreen()
    } else if (e.key === "Escape" && document.fullscreenElement) {
      document.exitFullscreen()
    }
  })

  // Add touch swipe support
  let touchStartX = 0
  document.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX
  })

  document.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].screenX
    if (touchEndX - touchStartX > 50) goToPrevSlide()
    if (touchEndX - touchStartX < -50) goToNextSlide()
  })

  // Show navigation indicators on hover
  const galleryWrapper = document.querySelector(".gallery-wrapper")
  galleryWrapper.addEventListener("mousemove", (e) => {
    const navAreas = document.querySelectorAll(".nav-area")
    navAreas.forEach((area) => {
      area.style.opacity = "0.1"
    })
  })

  galleryWrapper.addEventListener("mouseleave", () => {
    const navAreas = document.querySelectorAll(".nav-area")
    navAreas.forEach((area) => {
      area.style.opacity = "0"
    })
  })

  // Ensure window is scrollable on smaller screens
  document.body.style.overflowY = "auto"
})
