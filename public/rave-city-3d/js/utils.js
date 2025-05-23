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
   * Easing function: easeInOutQuad
   */
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  /**
   * Generate a random position on a circle (XZ plane)
   */
  randomCirclePosition: (radius) => {
    const angle = Math.random() * 2 * Math.PI;
    return {
      x: Math.cos(angle) * radius,
      y: 0,
      z: Math.sin(angle) * radius
    };
  },

  /**
   * Generate a random position on a sphere
   */
  randomSpherePosition: (radius) => {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    return {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.sin(phi) * Math.sin(theta),
      z: radius * Math.cos(phi)
    };
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

  /**
   * Throttle a function
   */
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  },

  /**
   * Generate a random neon linear gradient (CSS)
   */
  generateNeonGradient: () => {
    const c1 = Utils.randomNeonColor();
    const c2 = Utils.randomNeonColor();
    return `linear-gradient(135deg, ${c1}, ${c2})`;
  },

  /**
   * Generate a procedural dance pose for a character.
   * Returns rotation (in radians) for arms/legs/head based on time & music beat.
   */
  getDancePose: (time, beatStrength = 1.0) => {
    // Example: sway arms & legs, bounce head
    const armSwing = Math.sin(time * 2.1 + Math.random() * 10) * 0.5 * beatStrength;
    const legKick = Math.sin(time * 1.7 + Math.random() * 10) * 0.4 * beatStrength;
    const headBob = Math.sin(time * 3.3) * 0.25 * beatStrength;

    return {
      leftArm: armSwing,
      rightArm: -armSwing,
      leftLeg: legKick,
      rightLeg: -legKick,
      head: headBob
    };
  },

  /**
   * Populate a city grid with N positions.
   */
  populateCityGrid: (rows, cols, spacing) => {
    const positions = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        positions.push({
          x: (i - rows / 2) * spacing,
          y: 0,
          z: (j - cols / 2) * spacing
        });
      }
    }
    return positions;
  },

  /**
   * Scatter N objects randomly in a ring (good for cars, dancers).
   */
  scatterRing: (count, radius) => {
    const positions = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      positions.push({
        x: Math.cos(angle) * radius + Utils.random(-3, 3),
        y: 0,
        z: Math.sin(angle) * radius + Utils.random(-3, 3)
      });
    }
    return positions;
  },

  /**
   * Cycle through neon colors for trippy aura effects.
   */
  getTrippyColor: (time, speed = 1) => {
    // Use HSL for smooth rainbow
    const hue = (time * speed * 60) % 360;
    return `hsl(${hue}, 100%, 60%)`;
  },

  /**
   * Create a pulsing intensity (for lights, emissive, scale, etc.)
   */
  getPulse: (time, freq = 1, min = 0.5, max = 1.5) => {
    const t = (Math.sin(time * freq * 2 * Math.PI) + 1) / 2; // [0,1]
    return Utils.lerp(min, max, t);
  },

  /**
   * Get a neon shadow style for canvas or CSS
   */
  getNeonShadow: (color = "#ff00ff", blur = 15) => {
    return `0 0 ${blur}px 3px ${color}, 0 0 ${blur * 2}px 6px ${color}`;
  },
}

// Export the Utils object
window.Utils = Utils
