// ULTRA TRIPPY PROFILE IMAGE EFFECTS
document.addEventListener("DOMContentLoaded", () => {
  console.log("🌀 Initializing extreme profile image effects")

  // Wait for profile images to be created
  const checkForProfileImages = setInterval(() => {
    const profileImages = document.querySelectorAll(".profile-image")

    if (profileImages.length > 0) {
      profileImages.forEach((profileImage) => {
        if (!profileImage.dataset.effectsApplied) {
          const glowEffect = profileImage.previousElementSibling
          if (glowEffect && glowEffect.classList.contains("image-glow-effect")) {
            initTrippyProfileEffects(profileImage, glowEffect)
            profileImage.dataset.effectsApplied = "true"
          }
        }
      })
    }
  }, 1000)

  function initTrippyProfileEffects(profileImage, glowEffect) {
    console.log("🌈 Applying extreme trippy effects to profile image", profileImage.dataset.index)

    // Create a container for the fractal overlay
    const fractalOverlay = document.createElement("div")
    fractalOverlay.classList.add("fractal-overlay")
    profileImage.parentNode.appendChild(fractalOverlay)

    // Create multiple clone layers for the glitch effect
    const layers = 15 // Increased number of glitch layers for trippier effect
    const glitchLayers = []

    for (let i = 0; i < layers; i++) {
      const layer = document.createElement("div")
      layer.classList.add("profile-glitch-layer")
      layer.style.zIndex = 2 + i
      layer.style.opacity = 0.7 - i * 0.1

      // Create image inside layer
      const layerImg = document.createElement("img")
      layerImg.src = profileImage.src
      layerImg.classList.add("layer-img")
      layer.appendChild(layerImg)

      // Add to DOM before the original image
      profileImage.parentNode.insertBefore(layer, profileImage)
      glitchLayers.push(layer)
    }

    // Create a canvas for pixel manipulation effects
    const pixelCanvas = document.createElement("canvas")
    pixelCanvas.width = 150
    pixelCanvas.height = 150
    pixelCanvas.classList.add("pixel-manipulation-canvas")
    pixelCanvas.style.opacity = "0.8"
    profileImage.parentNode.appendChild(pixelCanvas)

    const ctx = pixelCanvas.getContext("2d")

    // Load the image into the canvas
    const pixelImg = new Image()
    pixelImg.crossOrigin = "anonymous"
    pixelImg.src = profileImage.src
    pixelImg.onload = () => {
      ctx.drawImage(pixelImg, 0, 0, pixelCanvas.width, pixelCanvas.height)
      // Start pixel manipulation
      requestAnimationFrame(manipulatePixels)
    }

    // Create geometric shapes overlay
    const geoShapes = document.createElement("div")
    geoShapes.classList.add("geometric-shapes")
    profileImage.parentNode.appendChild(geoShapes)

    // Add shapes (increased number for trippier effect)
    for (let i = 0; i < 15; i++) {
      const shape = document.createElement("div")
      shape.classList.add("geo-shape")

      // Randomize shape type
      const shapeType = Math.floor(Math.random() * 3)
      if (shapeType === 0) {
        shape.classList.add("geo-circle")
      } else if (shapeType === 1) {
        shape.classList.add("geo-triangle")
      } else {
        shape.classList.add("geo-square")
      }

      // Randomize position
      shape.style.left = `${Math.random() * 100}%`
      shape.style.top = `${Math.random() * 100}%`

      // Randomize size
      const size = 5 + Math.random() * 20
      shape.style.width = `${size}px`
      shape.style.height = `${size}px`

      // Randomize animation delay
      shape.style.animationDelay = `${Math.random() * 5}s`

      geoShapes.appendChild(shape)
    }

    // Apply extreme glitch effects at random intervals
    setInterval(() => {
      if (Math.random() < 0.4) {
        // Increased probability for more frequent glitches
        applyExtremeGlitch()
      }
    }, 1000)

    // Apply continuous subtle glitch
    setInterval(() => {
      applySubtleGlitch()
    }, 100)

    // Apply color cycle effect
    let hueRotation = 0
    setInterval(() => {
      hueRotation = (hueRotation + 10) % 360
      glowEffect.style.filter = `hue-rotate(${hueRotation}deg)`
    }, 200)

    // Pixel manipulation function
    function manipulatePixels() {
      // Only manipulate sometimes for performance
      if (Math.random() < 0.3) {
        // Get image data
        const imageData = ctx.getImageData(0, 0, pixelCanvas.width, pixelCanvas.height)
        const data = imageData.data

        // Apply different effects based on random choice
        const effectChoice = Math.floor(Math.random() * 5)

        if (effectChoice === 0) {
          // RGB shift
          for (let i = 0; i < data.length; i += 4) {
            // Shift red channel
            if (i + 4 < data.length) {
              data[i] = data[i + 4]
            }
            // Shift blue channel
            if (i - 4 >= 0) {
              data[i + 2] = data[i - 4 + 2]
            }
          }
        } else if (effectChoice === 1) {
          // Pixelate sections
          const blockSize = Math.floor(Math.random() * 10) + 5
          for (let y = 0; y < pixelCanvas.height; y += blockSize) {
            for (let x = 0; x < pixelCanvas.width; x += blockSize) {
              // Only pixelate some blocks
              if (Math.random() < 0.5) {
                // Get the color of the first pixel in the block
                const i = (y * pixelCanvas.width + x) * 4
                const r = data[i]
                const g = data[i + 1]
                const b = data[i + 2]

                // Apply to all pixels in the block
                for (let by = 0; by < blockSize && y + by < pixelCanvas.height; by++) {
                  for (let bx = 0; bx < blockSize && x + bx < pixelCanvas.width; bx++) {
                    const idx = ((y + by) * pixelCanvas.width + (x + bx)) * 4
                    data[idx] = r
                    data[idx + 1] = g
                    data[idx + 2] = b
                  }
                }
              }
            }
          }
        } else if (effectChoice === 2) {
          // Wave distortion
          const amplitude = Math.random() * 10
          const frequency = Math.random() * 0.1

          const tempCanvas = document.createElement("canvas")
          tempCanvas.width = pixelCanvas.width
          tempCanvas.height = pixelCanvas.height
          const tempCtx = tempCanvas.getContext("2d")
          tempCtx.putImageData(imageData, 0, 0)

          ctx.clearRect(0, 0, pixelCanvas.width, pixelCanvas.height)

          for (let y = 0; y < pixelCanvas.height; y++) {
            const xOffset = Math.sin(y * frequency) * amplitude
            ctx.drawImage(tempCanvas, 0, y, pixelCanvas.width, 1, xOffset, y, pixelCanvas.width, 1)
          }

          // Skip the putImageData since we've already drawn the distorted image
          requestAnimationFrame(manipulatePixels)
          return
        } else if (effectChoice === 3) {
          // Color inversion in sections
          for (let i = 0; i < data.length; i += 4) {
            // Only invert some pixels
            if (Math.random() < 0.2) {
              data[i] = 255 - data[i] // Invert red
              data[i + 1] = 255 - data[i + 1] // Invert green
              data[i + 2] = 255 - data[i + 2] // Invert blue
            }
          }
        } else {
          // Scanlines effect
          for (let y = 0; y < pixelCanvas.height; y++) {
            if (y % 3 === 0) {
              // Every third line
              for (let x = 0; x < pixelCanvas.width; x++) {
                const i = (y * pixelCanvas.width + x) * 4
                // Brighten the line
                data[i] = Math.min(255, data[i] * 1.5)
                data[i + 1] = Math.min(255, data[i + 1] * 1.5)
                data[i + 2] = Math.min(255, data[i + 2] * 1.5)
              }
            } else if (y % 3 === 1) {
              // Every third line + 1
              for (let x = 0; x < pixelCanvas.width; x++) {
                const i = (y * pixelCanvas.width + x) * 4
                // Darken the line
                data[i] = data[i] * 0.5
                data[i + 1] = data[i + 1] * 0.5
                data[i + 2] = data[i + 2] * 0.5
              }
            }
          }
        }

        // Put the manipulated data back
        ctx.putImageData(imageData, 0, 0)
      }

      // Continue the animation
      requestAnimationFrame(manipulatePixels)
    }

    // Apply extreme glitch effect
    function applyExtremeGlitch() {
      // Apply to original image
      profileImage.classList.add("extreme-glitch")

      // Apply different effects to each layer
      glitchLayers.forEach((layer, index) => {
        // Random offset
        const xOffset = (Math.random() - 0.5) * 20
        const yOffset = (Math.random() - 0.5) * 20
        layer.style.transform = `translate(${xOffset}px, ${yOffset}px)`

        // Random filter
        const hue = Math.floor(Math.random() * 360)
        const saturate = 1 + Math.random() * 5 // Increased saturation for trippier effect
        const brightness = 0.7 + Math.random() * 0.8
        const contrast = 0.8 + Math.random() * 1.2
        const invert = Math.random() < 0.3 ? Math.random() * 0.5 : 0 // Occasional inversion

        layer.style.filter = `
          hue-rotate(${hue}deg) 
          saturate(${saturate}) 
          brightness(${brightness}) 
          contrast(${contrast}) 
          invert(${invert})
        `

        // Random blend mode - more psychedelic blend modes
        const blendModes = [
          "normal",
          "multiply",
          "screen",
          "overlay",
          "darken",
          "lighten",
          "color-dodge",
          "color-burn",
          "hard-light",
          "soft-light",
          "difference",
          "exclusion",
        ]
        const randomBlend = blendModes[Math.floor(Math.random() * blendModes.length)]
        layer.style.mixBlendMode = randomBlend

        // Random opacity
        layer.style.opacity = 0.3 + Math.random() * 0.7

        // Add specific class for animation
        layer.classList.add("layer-glitching")

        // Remove classes after animation completes
        setTimeout(() => {
          layer.classList.remove("layer-glitching")
        }, 500)
      })

      // Trigger fractal animation
      fractalOverlay.classList.add("fractal-active")

      // Reset original image after effect
      setTimeout(() => {
        profileImage.classList.remove("extreme-glitch")

        // Reset layer positions gradually
        glitchLayers.forEach((layer, index) => {
          setTimeout(() => {
            layer.style.transform = "translate(0, 0)"
            layer.style.filter = "none"
            layer.style.mixBlendMode = "normal"
            layer.style.opacity = 0.7 - index * 0.1
          }, index * 50)
        })

        // Reset fractal
        fractalOverlay.classList.remove("fractal-active")
      }, 500)
    }

    // Apply subtle continuous glitch
    function applySubtleGlitch() {
      // Only apply sometimes
      if (Math.random() < 0.3) {
        // Subtle movement
        const xOffset = (Math.random() - 0.5) * 4
        const yOffset = (Math.random() - 0.5) * 4

        // Apply to a random layer
        const randomLayer = Math.floor(Math.random() * glitchLayers.length)
        glitchLayers[randomLayer].style.transform = `translate(${xOffset}px, ${yOffset}px)`

        // Reset after short delay
        setTimeout(() => {
          glitchLayers[randomLayer].style.transform = "translate(0, 0)"
        }, 50)
      }
    }
  }
})
