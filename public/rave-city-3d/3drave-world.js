// 3D Rave City - World System
// Handles scene creation, objects, and rendering

// Declare RaveCity and THREE
export const RaveCity = {}
import * as THREE from "three"

// Extend RaveCity object with world-related methods
Object.assign(RaveCity, {
  // Initialize Three.js scene
  initScene: function () {
    try {
      console.log("Initializing 3D scene...")

      // Create scene
      this.scene = new THREE.Scene()

      // Add fog for depth
      const theme = (this.visualThemes && this.config && this.visualThemes[this.config.visualTheme]) || {}
      this.scene.fog = new THREE.FogExp2(theme.fogColor, 0.008) // Reduced fog density for more visibility

      // Create camera
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
      this.camera.position.set(0, 5, 20)

      // Create renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.elements.sceneCanvas,
        antialias: !this.config.performanceMode,
        alpha: true,
        powerPreference: "high-performance",
      })
      this.renderer.setSize(window.innerWidth, window.innerHeight)

      // Set pixel ratio based on performance mode
      this.updatePixelRatio()

      // Create clock for animation
      this.clock = new THREE.Clock()

      // Create raycaster for collision detection
      this.raycaster = new THREE.Raycaster()

      // Create pointer lock controls for first-person movement
      this.controls = new THREE.PointerLockControls(this.camera, document.body)

      // Add crosshair
      this.createCrosshair()

      // Set up post-processing
      this.setupPostProcessing()

      // Create scene objects
      this.createSceneObjects()

      // Handle window resize
      window.addEventListener("resize", () => this.onWindowResize())

      // Hide loading screen
      setTimeout(() => {
        this.elements.loadingScreen.style.opacity = "0"
        setTimeout(() => {
          this.elements.loadingScreen.style.display = "none"
        }, 500)
      }, 1000)

      console.log("3D scene initialized successfully")
    } catch (error) {
      console.error("Failed to initialize 3D scene:", error)
      this.showError(`Failed to initialize 3D scene: ${error.message}`)
    }
  },

  // Update pixel ratio dynamically
  updatePixelRatio: function () {
    if (this.config.performanceMode) {
      this.renderer.setPixelRatio(1)
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }
  },

  // Create crosshair
  createCrosshair: () => {
    const crosshair = document.createElement("div")
    crosshair.className = "crosshair"
    document.body.appendChild(crosshair)
  },

  // Set up post-processing
  setupPostProcessing: function () {
    try {
      const theme = this.visualThemes[this.config.visualTheme];

      // Create composer
      this.composer = new THREE.EffectComposer(this.renderer);

      // Add bloom pass
      this.bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        theme.bloomStrength,
        theme.bloomRadius,
        theme.bloomThreshold
      );
      this.bloomPass.threshold = theme.bloomThreshold;
      this.composer.addPass(this.bloomPass);

      // Add RGB shift pass if not in performance mode
      if (!this.config.performanceMode) {
        this.rgbShiftPass = new THREE.ShaderPass(THREE.RGBShiftShader);
        this.rgbShiftPass.uniforms.amount.value = 0.0015;
        this.rgbShiftPass.uniforms.angle.value = 0;
        this.composer.addPass(this.rgbShiftPass);

        // Add glitch pass
        this.glitchPass = new THREE.GlitchPass();
        this.glitchPass.goWild = false;
        this.glitchPass.enabled = true;
        this.composer.addPass(this.glitchPass);
      }
    } catch (error) {
      console.error("Failed to set up post-processing:", error);
      this.showError(`Failed to set up post-processing: ${error.message}`);
    }
  },

  // Create scene objects
  createSceneObjects: function () {
    try {
      const theme = this.visualThemes[this.config.visualTheme]

      // Create floor (dance floor)
      this.createDanceFloor(theme)

      // Create sky dome
      this.createSkyDome(theme)

      // Create particle system
      this.createParticles(theme)

      // Create characters
      this.createCharacters(theme)

      // Create buildings
      this.createBuildings(theme)

      // Create lasers
      this.createLasers(theme)

      // Create smoke machines
      if (this.config.showSmoke && !this.config.performanceMode) {
        this.createSmokeMachines(theme)
      }

      // Create zones (different party areas)
      this.createZones(theme)

      // Set up infinite world generation
      this.setupInfiniteWorld()
    } catch (error) {
      console.error("Failed to create scene objects:", error)
      this.showError(`Failed to create scene objects: ${error.message}`)
    }
  },

  // Set up infinite world generation
  setupInfiniteWorld: function () {
    // Create a much larger floor that extends "infinitely"
    this.updateDanceFloor(2000) // Extremely large floor

    // Set up procedural generation based on player position
    this.lastGenerationPosition = new THREE.Vector3()
    this.generationRadius = 500
    this.generationDistance = 300
  },

  // Update dance floor size
  updateDanceFloor: function (size) {
    // Remove old floor
    if (this.floorMesh) {
      this.scene.remove(this.floorMesh)
    }

    const theme = this.visualThemes[this.config.visualTheme]

    // Create a much larger grid floor
    const floorSize = size
    const floorSegments = this.config.performanceMode ? 100 : 200

    const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize, floorSegments, floorSegments)
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: theme.gridColor,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    })

    this.floorMesh = new THREE.Mesh(floorGeometry, floorMaterial)
    this.floorMesh.rotation.x = -Math.PI / 2
    this.floorMesh.position.y = -2
    this.scene.add(this.floorMesh)

    // Add a reflective surface under the wireframe
    const reflectiveGeometry = new THREE.PlaneGeometry(floorSize, floorSize)
    const reflectiveMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
    })

    const reflectiveMesh = new THREE.Mesh(reflectiveGeometry, reflectiveMaterial)
    reflectiveMesh.rotation.x = -Math.PI / 2
    reflectiveMesh.position.y = -2.1
    this.scene.add(reflectiveMesh)
  },

  // Check if we need to generate more content based on player position
  checkProceduralGeneration: function () {
    if (!this.lastGenerationPosition) return

    const distanceMoved = this.camera.position.distanceTo(this.lastGenerationPosition)

    // If player has moved far enough, generate new content
    if (distanceMoved > this.generationDistance) {
      this.generateWorldContent()
      this.lastGenerationPosition.copy(this.camera.position)
    }
  },

  // Generate new world content around the player
  generateWorldContent: function () {
    const theme = this.visualThemes[this.config.visualTheme]
    const playerPos = this.camera.position.clone()

    // Generate new buildings
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = this.generationRadius * 0.5 + Math.random() * this.generationRadius * 0.5

      const x = playerPos.x + Math.cos(angle) * distance
      const z = playerPos.z + Math.sin(angle) * distance

      this.createBuilding(x, z, theme)
    }

    // Generate new characters
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = this.generationRadius * 0.3 + Math.random() * this.generationRadius * 0.3

      const x = playerPos.x + Math.cos(angle) * distance
      const z = playerPos.z + Math.sin(angle) * distance

      this.createCharacter(x, z, theme, Math.random() > 0.5)
    }

    // Generate new sky objects
    if (!this.config.performanceMode) {
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2
        const distance = this.generationRadius * 0.7 + Math.random() * this.generationRadius * 0.3
        const height = 50 + Math.random() * 300

        const x = playerPos.x + Math.cos(angle) * distance
        const z = playerPos.z + Math.sin(angle) * distance

        this.createSkyObject(x, height, z, theme)
      }
    }
  },

  // Create a single building at specified position
  createBuilding: function (x, z, theme) {
    // Random building properties
    const width = 5 + Math.random() * 15
    const height = 20 + Math.random() * 80
    const depth = 5 + Math.random() * 15

    // Random color
    const color1 = new THREE.Color(theme.buildingColor1)
    const color2 = new THREE.Color(theme.buildingColor2)
    const mixRatio = Math.random()
    const buildingColor = new THREE.Color().lerpColors(color1, color2, mixRatio)

    // Create building geometry
    const buildingGeometry = new THREE.BoxGeometry(width, height, depth)
    const buildingMaterial = new THREE.MeshBasicMaterial({
      color: buildingColor,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    })

    const building = new THREE.Mesh(buildingGeometry, buildingMaterial)
    building.position.set(x, height / 2 - 2, z)

    this.scene.add(building)
    this.buildings.push(building)

    return building
  },

  // Create a single character at specified position
  createCharacter: function (x, z, theme, isDancing) {
    // Choose a random character model
    let modelIndex = Math.floor(Math.random() * this.characterMaterials.length)
    const characterType = this.characterModels[modelIndex].type

    // Only use dancer models for dancing characters
    if (isDancing && characterType !== "dancer") {
      // Try to find a dancer model
      const dancerIndices = this.characterModels
        .map((model, index) => (model.type === "dancer" ? index : -1))
        .filter((index) => index !== -1)

      if (dancerIndices.length > 0) {
        modelIndex = dancerIndices[Math.floor(Math.random() * dancerIndices.length)]
      }
    }

    // Create sprite with character texture
    const sprite = new THREE.Sprite(this.characterMaterials[modelIndex])

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

    this.scene.add(sprite)
    this.characters.push(sprite)

    return sprite
  },

  // Create a single sky object at specified position
  createSkyObject: function (x, y, z, theme) {
    // Random color
    const color1 = new THREE.Color(theme.particleColor1)
    const color2 = new THREE.Color(theme.particleColor2)
    const mixRatio = Math.random()
    const objectColor = new THREE.Color().lerpColors(color1, color2, mixRatio)

    // Create a random geometric shape
    let object
    const shapeType = Math.floor(Math.random() * 5)

    const material = new THREE.MeshBasicMaterial({
      color: objectColor,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    })

    switch (shapeType) {
      case 0: // Cube
        const cubeGeometry = new THREE.BoxGeometry(
          10 + Math.random() * 20,
          10 + Math.random() * 20,
          10 + Math.random() * 20,
        )
        object = new THREE.Mesh(cubeGeometry, material)
        break
      case 1: // Sphere
        const sphereGeometry = new THREE.SphereGeometry(5 + Math.random() * 15, 8, 8)
        object = new THREE.Mesh(sphereGeometry, material)
        break
      case 2: // Torus
        const torusGeometry = new THREE.TorusGeometry(10 + Math.random() * 10, 3 + Math.random() * 5, 8, 16)
        object = new THREE.Mesh(torusGeometry, material)
        break
      case 3: // Tetrahedron
        const tetraGeometry = new THREE.TetrahedronGeometry(10 + Math.random() * 15)
        object = new THREE.Mesh(tetraGeometry, material)
        break
      case 4: // Octahedron
        const octaGeometry = new THREE.OctahedronGeometry(10 + Math.random() * 15)
        object = new THREE.Mesh(octaGeometry, material)
        break
    }

    // Position
    object.position.set(x, y, z)

    // Add animation data
    object.userData = {
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01,
      },
      floatSpeed: 0.2 + Math.random() * 0.8,
      floatOffset: Math.random() * Math.PI * 2,
      originalY: y,
    }

    this.scene.add(object)
    this.skyObjects.push(object)

    return object
  },

  // Create dance floor
  createDanceFloor: function (theme) {
    // Create a grid floor for the dance floor
    const floorSize = 500 // Much larger floor
    const floorSegments = this.config.performanceMode ? 50 : 100

    const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize, floorSegments, floorSegments)
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: theme.gridColor,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    })

    this.floorMesh = new THREE.Mesh(floorGeometry, floorMaterial)
    this.floorMesh.rotation.x = -Math.PI / 2
    this.floorMesh.position.y = -2
    this.scene.add(this.floorMesh)

    // Add a reflective surface under the wireframe
    const reflectiveGeometry = new THREE.PlaneGeometry(floorSize, floorSize)
    const reflectiveMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
    })

    const reflectiveMesh = new THREE.Mesh(reflectiveGeometry, reflectiveMaterial)
    reflectiveMesh.rotation.x = -Math.PI / 2
    reflectiveMesh.position.y = -2.1
    this.scene.add(reflectiveMesh)
  },

  // Create sky dome
  createSkyDome: function (theme) {
    // Create a large sphere for the sky
    const skyGeometry = new THREE.SphereGeometry(
      5000,
      this.config.performanceMode ? 32 : 64,
      this.config.performanceMode ? 32 : 64,
    )
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: theme.skyColor,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.8,
    })

    this.skyMesh = new THREE.Mesh(skyGeometry, skyMaterial)
    this.scene.add(this.skyMesh)

    // Add stars to the sky dome
    const starCount = this.config.performanceMode ? 1000 : 3000
    const starGeometry = new THREE.BufferGeometry()
    const starPositions = new Float32Array(starCount * 3)

    for (let i = 0; i < starCount; i++) {
      // Create stars in a full sphere around the scene
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const radius = 900 + Math.random() * 100

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      starPositions[i * 3 + 1] = radius * Math.cos(phi)
      starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    }

    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3))

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      transparent: true,
      opacity: 0.8,
    })

    const stars = new THREE.Points(starGeometry, starMaterial)
    this.scene.add(stars)
    this.skyObjects.push(stars)

    // Add floating objects in the sky
    if (this.config.showSkyObjects && !this.config.performanceMode) {
      this.createSkyObjects(theme)
    }
  },

  // Create sky objects
  createSkyObjects: function (theme) {
    if (!this.config.showSkyObjects) return

    for (let i = 0; i < this.config.skyObjectCount; i++) {
      // Random position in the sky
      const radius = 100 + Math.random() * 400
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = 50 + Math.random() * 300 // Higher up in the sky
      const z = radius * Math.sin(phi) * Math.sin(theta)

      this.createSkyObject(x, y, z, theme)
    }
  },

  // Create particles
  createParticles: function (theme) {
    const particleGeometry = new THREE.BufferGeometry()
    const particleCount = this.config.density * (this.config.performanceMode ? 100 : 200) // More particles

    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    const color1 = new THREE.Color(theme.particleColor1)
    const color2 = new THREE.Color(theme.particleColor2)

    for (let i = 0; i < particleCount; i++) {
      // Position - spread out over a much larger area
      const x = (Math.random() - 0.5) * 500
      const y = Math.random() * 200
      const z = (Math.random() - 0.5) * 500

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      // Color
      const mixRatio = Math.random()
      const mixedColor = new THREE.Color().lerpColors(color1, color2, mixRatio)

      colors[i * 3] = mixedColor.r
      colors[i * 3 + 1] = mixedColor.g
      colors[i * 3 + 2] = mixedColor.b
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    const particleMaterial = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
    })

    this.particles = new THREE.Points(particleGeometry, particleMaterial)
    this.scene.add(this.particles)
  },

  // Create characters
  createCharacters: function (theme) {
    if (!this.config.showDancers) return

    // Create dancers
    for (let i = 0; i < this.config.dancerCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 400
      const z = (Math.random() - 0.5) * 400

      this.createCharacter(x, z, theme, true)
    }

    // Create regular people
    for (let i = 0; i < this.config.regularPeopleCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 400
      const z = (Math.random() - 0.5) * 400

      this.createCharacter(x, z, theme, false)
    }
  },

  // Create buildings
  createBuildings: function (theme) {
    if (!this.config.showBuildings) return

    for (let i = 0; i < this.config.buildingCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 800
      const z = (Math.random() - 0.5) * 800

      this.createBuilding(x, z, theme)
    }
  },

  // Create lasers
  createLasers: function (theme) {
    if (!this.config.showLasers) return

    for (let i = 0; i < this.config.laserCount; i++) {
      // Random start and end points
      const startX = (Math.random() - 0.5) * 400
      const startY = 5 + Math.random() * 50
      const startZ = (Math.random() - 0.5) * 400

      const endX = (Math.random() - 0.5) * 400
      const endY = 5 + Math.random() * 50
      const endZ = (Math.random() - 0.5) * 400

      // Random color
      const color1 = new THREE.Color(theme.particleColor1)
      const color2 = new THREE.Color(theme.particleColor2)
      const mixRatio = Math.random()
      const laserColor = new THREE.Color().lerpColors(color1, color2, mixRatio)

      // Create laser geometry using BufferGeometry instead of Geometry
      const laserGeometry = new THREE.BufferGeometry()
      const vertices = new Float32Array([startX, startY, startZ, endX, endY, endZ])
      laserGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3))

      const laserMaterial = new THREE.LineBasicMaterial({
        color: laserColor,
        transparent: true,
        opacity: 0.6,
      })

      const laser = new THREE.Line(laserGeometry, laserMaterial)
      this.scene.add(laser)
      this.lasers.push(laser)

      // Add animation data
      laser.userData = {
        color1: color1,
        color2: color2,
        mixRatio: Math.random(),
        colorChangeSpeed: 0.01 + Math.random() * 0.05,
      }
    }
  },

  // Create smoke machines
  createSmokeMachines: function (theme) {
    for (let i = 0; i < this.config.smokeCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 400
      const y = 0
      const z = (Math.random() - 0.5) * 400

      // Create smoke particle system using BufferGeometry
      const particleCount = 50
      const smokeGeometry = new THREE.BufferGeometry()
      const positions = new Float32Array(particleCount * 3)
      const velocities = []

      for (let j = 0; j < particleCount; j++) {
        positions[j * 3] = x
        positions[j * 3 + 1] = y
        positions[j * 3 + 2] = z

        // Store velocity separately since BufferGeometry doesn't support custom attributes like Geometry did
        velocities.push(new THREE.Vector3(0, 0.5 + Math.random(), 0))
      }

      smokeGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

      const smokeMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 5 + Math.random() * 10,
        transparent: true,
        opacity: 0.3,
      })

      const smoke = new THREE.Points(smokeGeometry, smokeMaterial)
      smoke.userData = { velocities: velocities } // Store velocities in userData
      this.scene.add(smoke)
      this.smokeMachines.push(smoke)
    }
  },

  // Create zones
  createZones: function (theme) {
    // Create different party zones
    const zoneCount = 4
    for (let i = 0; i < zoneCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 800
      const z = (Math.random() - 0.5) * 800

      // Create zone geometry
      const zoneGeometry = new THREE.CircleGeometry(50 + Math.random() * 100, 32)
      const zoneMaterial = new THREE.MeshBasicMaterial({
        color: theme.gridColor,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      })

      const zone = new THREE.Mesh(zoneGeometry, zoneMaterial)
      zone.rotation.x = -Math.PI / 2
      zone.position.set(x, -1.9, z)
      this.scene.add(zone)
      this.zones.push(zone)
    }
  },

  // Update objects
  updateObjects: function (deltaTime) {
    // Increment time for animations
    this.time = (this.time || 0) + deltaTime;
    // Update particles
    if (this.particles) {
      if (!this.cachedParticlePositions) {
        // Cache initial particle positions
        this.cachedParticlePositions = Array.from(this.particles.geometry.attributes.position.array);
      }

      const positions = this.particles.geometry.attributes.position.array;

      for (let i = 0; i < positions.length; i += 3) {
        // Use cached positions and apply only the vertical oscillation
        positions[i] = this.cachedParticlePositions[i];
        positions[i + 1] = this.cachedParticlePositions[i + 1] + Math.sin(this.time + i) * 0.01;
        positions[i + 2] = this.cachedParticlePositions[i + 2];
      }

      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    // Update characters
    this.characters.forEach((character) => {
      if (character.userData.isDancing) {
        // Make characters dance
        character.position.y =
          character.userData.height / 2 +
          Math.sin(this.time * character.userData.danceSpeed + character.userData.danceOffset) * 0.5
      }

      // Make characters face the camera (billboarding)
      if (character.userData.lookAtCamera) {
        const cameraPosition = this.camera.position.clone()
        cameraPosition.y = character.position.y // Keep same height
        character.lookAt(cameraPosition)
      }
    })

    // Update sky objects
    this.skyObjects.forEach((object) => {
      // Rotate objects
      if (object.userData && object.userData.rotationSpeed) {
        object.rotation.x += object.userData.rotationSpeed.x
        object.rotation.y += object.userData.rotationSpeed.y
        object.rotation.z += object.userData.rotationSpeed.z
      }

      // Float objects up and down
      if (object.userData && object.userData.floatSpeed) {
        object.position.y =
          object.userData.originalY +
          Math.sin(this.time * object.userData.floatSpeed + object.userData.floatOffset) * 10
      }
    })

    // Update lasers
    this.lasers.forEach((laser) => {
      // Change laser color over time
      laser.userData.mixRatio += laser.userData.colorChangeSpeed
      if (laser.userData.mixRatio > 1) {
        laser.userData.mixRatio = 0
        laser.userData.colorChangeSpeed = 0.01 + Math.random() * 0.05
      }

      const laserColor = new THREE.Color().lerpColors(
        laser.userData.color1,
        laser.userData.color2,
        laser.userData.mixRatio,
      )
      laser.material.color.set(laserColor)
    })

    // Update smoke machines
    this.smokeMachines.forEach((smoke) => {
      if (smoke.userData && smoke.userData.velocities) {
        const positions = smoke.geometry.attributes.position.array
        const velocities = smoke.userData.velocities

        for (let i = 0; i < velocities.length; i++) {
          const idx = i * 3
          positions[idx + 1] += velocities[i].y * deltaTime * 10

          // Reset particle if it goes too high
          if (positions[idx + 1] > 100) {
            positions[idx + 1] = 0
          }
        }

        smoke.geometry.attributes.position.needsUpdate = true
      }
    })

    // Update sky dome position to follow camera
    if (this.skyMesh) {
      this.skyMesh.position.copy(this.camera.position)
    }
  },

  // Update theme
  updateTheme: function () {
    const theme = this.visualThemes[this.config.visualTheme]

    // Update fog color
    this.scene.fog.color.set(theme.fogColor)
  updateTheme: function () {
    const theme = this.visualThemes[this.config.visualTheme];

    // Update fog color
    if (this.scene.fog) {
      this.scene.fog.color.set(theme.fogColor);
    }

    // Update floor color
    if (this.floorMesh) {
      this.floorMesh.material.color.set(theme.gridColor);
    }

    // Update sky color
    if (this.skyMesh) {
      this.skyMesh.material.color.set(theme.skyColor);
    }

    // Update particles color
    if (this.particles) {
      const color1 = new THREE.Color(theme.particleColor1);
      const color2 = new THREE.Color(theme.particleColor2);
      const colors = this.particles.geometry.attributes.color.array;

      for (let i = 0; i < colors.length; i += 3) {
        const mixRatio = Math.random();
        const mixedColor = new THREE.Color().lerpColors(color1, color2, mixRatio);

        colors[i] = mixedColor.r;
        colors[i + 1] = mixedColor.g;
        colors[i + 2] = mixedColor.b;
      }

      this.particles.geometry.attributes.color.needsUpdate = true;
    }

    // Update buildings color
    if (this.buildings) {
      this.buildings.forEach((building, index) => {
        if (!building.userData.cachedColor) {
          const color1 = new THREE.Color(theme.buildingColor1);
          const color2 = new THREE.Color(theme.buildingColor2);
          const mixRatio = (index / this.buildings.length) % 1; // Deterministic mix ratio
          building.userData.cachedColor = new THREE.Color().lerpColors(color1, color2, mixRatio);
        }
        building.material.color.set(building.userData.cachedColor);
      });
    }

    // Update lasers color
    if (this.lasers) {
      this.lasers.forEach((laser) => {
        if (laser.userData.color1 instanceof THREE.Color) {
          laser.userData.color1.set(theme.particleColor1);
        } else {
          laser.userData.color1 = new THREE.Color(theme.particleColor1);
        }
        if (laser.userData.color2 instanceof THREE.Color) {
          laser.userData.color2.set(theme.particleColor2);
        } else {
          laser.userData.color2 = new THREE.Color(theme.particleColor2);
        }
      });
    }

    // Update bloom pass
    if (this.bloomPass && !this.config.performanceMode) {
      if (theme.bloomStrength !== undefined) {
        this.bloomPass.strength = theme.bloomStrength;
      }
      if (theme.bloomRadius !== undefined) {
        this.bloomPass.radius = theme.bloomRadius;
      }
      if (theme.bloomThreshold !== undefined) {
        this.bloomPass.threshold = theme.bloomThreshold;
      }
    }
  },
