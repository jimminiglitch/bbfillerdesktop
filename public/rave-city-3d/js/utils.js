/**
 * Utility functions for 3D Rave City
 */

const Utils = {
  /**
   * Clamp a value between min and max
   */
  clamp: (value, min, max) => Math.min(Math.max(value, min), max),

  /**
   * Linear interpolation
   */
  lerp: (start, end, t) => start * (1 - t) + end * t,

  /**
   * Map a value from one range to another
   */
  map: (value, inMin, inMax, outMin, outMax) => {
    return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin))
  },

  /**
   * Generate a random number between min and max
   */
  random: (min, max) => Math.random() * (max - min) + min,

  /**
   * Generate a random integer between min and max (inclusive)
   */
  randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

  /**
   * Generate a random color
   */
  randomColor: () => {
    return `rgb(${Utils.randomInt(0, 255)}, ${Utils.randomInt(0, 255)}, ${Utils.randomInt(0, 255)})`
  },

  /**
   * Generate a random neon color
   */
  randomNeonColor: () => {
    const neonColors = [
      "#ff00ff", // Magenta
      "#00ffff", // Cyan
      "#ffff00", // Yellow
      "#ff0000", // Red
      "#00ff00", // Green
      "#0000ff", // Blue
      "#ff8000", // Orange
      "#8000ff", // Purple
    ]
    return neonColors[Utils.randomInt(0, neonColors.length - 1)]
  },

  /**
   * Debounce a function
   */
  debounce: (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  /**
   * Save settings to localStorage
   */
  saveSettings: (settings) => {
    try {
      localStorage.setItem("raveCity_settings", JSON.stringify(settings))
      return true
    } catch (error) {
      console.error("Failed to save settings:", error)
      return false
    }
  },

  /**
   * Load settings from localStorage
   */
  loadSettings: () => {
    try {
      const settings = localStorage.getItem("raveCity_settings")
      return settings ? JSON.parse(settings) : null
    } catch (error) {
      console.error("Failed to load settings:", error)
      return null
    }
  },

  /**
   * Format time in seconds to MM:SS format
   */
  formatTime: (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  },

  /**
   * Check if WebGL is supported
   */
  isWebGLSupported: () => {
    try {
      const canvas = document.createElement("canvas")
      return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")))
    } catch (e) {
      return false
    }
  },

  /**
   * Check if the device is mobile
   */
  isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  },

  /**
   * Toggle fullscreen
   */
  toggleFullscreen: () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  },
}

// Export the Utils object
window.Utils = Utils
