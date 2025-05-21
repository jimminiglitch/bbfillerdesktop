/**
 * Character handling for Rave City
 */
const RaveCityCharacters = {
  // Character arrays and textures
  characters: [],
  characterTextures: [],
  characterMaterials: [],

  // Preload character textures
  preloadCharacterTextures: function () {
    return new Promise((resolve, reject) => {
      if (typeof window.THREE === "undefined") {
        console.error("THREE is not defined")
        reject(new Error("THREE is not defined"))
        return
      }

      if (!window.RaveCityConfig || !window.RaveCityConfig.characterModels) {
        console.error("Character models not defined")
        reject(new Error("Character models not defined"))
        return
      }

      const textureLoader = new window.THREE.TextureLoader()
      const totalTextures = window.RaveCityConfig.characterModels.length
      let loadedTextures = 0

      window.RaveCityConfig.characterModels.forEach((model, index) => {
        textureLoader.load(
          model.url,
          (texture) => {
            texture.crossOrigin = "anonymous"
            this.characterTextures[index] = texture

            // Create material
            const material = new window.THREE.SpriteMaterial({
              map: texture,
              transparent: true,
            })
            this.characterMaterials[index] = material

            loadedTextures++
            if (loadedTextures === totalTextures) {
              resolve()
            }
          },
          undefined,
          (error) => {
            console.error("Error loading character texture:", error)
            reject(error)
          },
        )
      })
    })
  },

  // Create characters
  createCharacters: function (theme) {
    if (!window.RaveCityConfig) return

    // Create dancers
    for (let i = 0; i < window.RaveCityConfig.dancerCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 400
      const z = (Math.random() - 0.5) * 400

      this.createCharacter(x, z, theme, true)
    }

    // Create regular people
    for (let i = 0; i < window.RaveCityConfig.regularPeopleCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 400
      const z = (Math.random() - 0.5) * 400

      this.createCharacter(x, z, theme, false)
    }
  },

  // Create a single character at specified position
  createCharacter: function (x, z, theme, isDancing) {
    if (
      typeof window.THREE === "undefined" ||
      !window.RaveCityConfig ||
      !window.RaveCityScene ||
      !this.characterMaterials ||
      this.characterMaterials.length === 0
    )
      return

    // Choose a random character model
    let modelIndex = Math.floor(Math.random() * this.characterMaterials.length)
    const characterType = window.RaveCityConfig.characterModels[modelIndex].type

    // Only use dancer models for dancing characters
    if (isDancing && characterType !== "dancer") {
      // Try to find a dancer model
      const dancerIndices = window.RaveCityConfig.characterModels
        .map((model, index) => (model.type === "dancer" ? index : -1))
        .filter((index) => index !== -1)

      if (dancerIndices.length > 0) {
        modelIndex = dancerIndices[Math.floor(Math.random() * dancerIndices.length)]
      }
    }

    // Create sprite with character texture
    const sprite = new window.THREE.Sprite(this.characterMaterials[modelIndex])

    // Scale the sprite to reasonable human proportions
    const height = 3 + Math.random() * 0.5 // Random height between 3 and 3.5 units
    sprite.scale.set(height * 0.7, height, 1)

    // Position character
    sprite.position.set(x, height / 2, z)

    // Add animation data
    sprite.userData = {
      isDancing: isDancing,
      danceSpeed: 0.5 + Math.random() * 1.5,
      danceOffset: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      modelIndex: modelIndex,
      height: height,
      lookAtCamera: true,
    }

    if (window.RaveCityScene.scene) {
      window.RaveCityScene.scene.add(sprite)
    }
    this.characters.push(sprite)

    return sprite
  },

  // Update characters
  updateCharacters: function (time) {
    if (!window.RaveCityScene || !window.RaveCityScene.camera) return

    this.characters.forEach((character) => {
      if (character.userData.isDancing) {
        // Make characters dance
        character.position.y =
          character.userData.height / 2 +
          Math.sin(time * character.userData.danceSpeed + character.userData.danceOffset) * 0.5
      }

      // Make characters face the camera (billboarding)
      if (character.userData.lookAtCamera) {
        const cameraPosition = window.RaveCityScene.camera.position.clone()
        cameraPosition.y = character.position.y // Keep same height
        character.lookAt(cameraPosition)
      }
    })
  },
}
