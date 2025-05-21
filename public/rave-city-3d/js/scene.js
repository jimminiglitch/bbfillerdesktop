/**
 * 3D Scene handling for Rave City
 */
const RaveCityScene = {
  // Three.js variables
  scene: null,
  camera: null,
  renderer: null,
  composer: null,
  controls: null,
  clock: null,
  raycaster: null,
  particles: null,
  floorMesh: null,
  skyMesh: null,
  bloomPass: null,
  glitchPass: null,
  rgbShiftPass: null,
  characters: [],
  buildings: [],
  skyObjects: [],
  lasers: [],
  smokeMachines: [],
  zones: [],
  lastGenerationPosition: null,
  generationRadius: 500,
  generationDistance: 300,
  characterTextures: [],
  characterMaterials: [],
  THREE: window.THREE, // Declare THREE variable at the top

  // Initialize Three.js scene
  init: function () {
    try {
      console.log("Initializing 3D scene...")

      // Create scene
      this.scene = new this.THREE.Scene()

      // Add fog for depth
      const RaveCityConfig = window.RaveCityConfig // Declare RaveCityConfig variable
      const theme = RaveCityConfig.visualThemes[RaveCityConfig.visualTheme]
      this.scene.fog = new this.THREE.FogExp2(theme.fogColor, 0.008)

      // Create camera
      this.camera = new this.THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
      this.camera.position.set(0, 5, 20)

      // Create renderer
      const RaveCityUI = window.RaveCityUI // Declare RaveCityUI variable
      this.renderer = new this.THREE.WebGLRenderer({
        canvas: RaveCityUI.elements.sceneCanvas,
        antialias: !RaveCityConfig.performanceMode,
        alpha: true,
        powerPreference: "high-performance",
      })
      this.renderer.setSize(window.innerWidth, window.innerHeight)

      // Set pixel ratio based on performance mode
      if (RaveCityConfig.performanceMode) {
        this.renderer.setPixelRatio(1)
      } else {
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      }

      // Create clock for animation
      this.clock = new this.THREE.Clock()

      // Create raycaster for collision detection
      this.raycaster = new this.THREE.Raycaster()

      // Create pointer lock controls for first-person movement
      this.controls = new this.THREE.PointerLockControls(this.camera, document.body)

      // Set up post-processing
      this.setupPostProcessing()

      // Create scene objects
      this.createSceneObjects()

      // Handle window resize
      window.addEventListener("resize", () => this.onWindowResize())

      console.log("3D scene initialized successfully")
    } catch (error) {
      console.error("Failed to initialize 3D scene:", error)
      RaveCityUI.showError(`Failed to initialize 3D scene: ${error.message}`)
    }
  },

  // Set up post-processing
  setupPostProcessing: function () {
    try {
      const RaveCityConfig = window.RaveCityConfig // Declare RaveCityConfig variable
      const theme = RaveCityConfig.visualThemes[RaveCityConfig.visualTheme]

      // Create composer
      this.composer = new THREE.EffectComposer(this.renderer)

      // Add render pass
      const renderPass = new THREE.RenderPass(this.scene, this.camera)
      this.composer.addPass(renderPass)

      // Add bloom pass if enabled and not in performance mode
      if (RaveCityConfig.bloomEnabled && !RaveCityConfig.performanceMode) {
        this.bloomPass = new THREE.UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          theme.bloomStrength,
          theme.bloomRadius,
          theme.bloomThreshold,
        )
        this.composer.addPass(this.bloomPass)
      }

      // Add RGB shift pass if not in performance mode
      if (!RaveCityConfig.performanceMode) {
        this.rgbShiftPass = new THREE.ShaderPass(THREE.RGBShiftShader)
        this.rgbShiftPass.uniforms.amount.value = 0.0015
        this.rgbShiftPass.uniforms.angle.value = 0
        this.composer.addPass(this.rgbShiftPass)

        // Add glitch pass
        this.glitchPass = new THREE.GlitchPass()
        this.glitchPass.goWild = false
        this.glitchPass.enabled = true
        this.composer.addPass(this.glitchPass)
      }
    } catch (error) {
      console.error("Failed to set up post-processing:", error)
      const RaveCityUI = window.RaveCityUI // Declare RaveCityUI variable
      RaveCityUI.showError(`Failed to set up post-processing: ${error.message}`)
    }
  },

  // Create scene objects
  createSceneObjects: function () {
    try {
      const RaveCityConfig = window.RaveCityConfig // Declare RaveCityConfig variable
      const theme = RaveCityConfig.visualThemes[RaveCityConfig.visualTheme]

      // Create floor (dance floor)
      this.createDanceFloor(theme)

      // Create sky dome
      this.createSkyDome(theme)

      // Create particle system
      this.createParticles(theme)

      // Create characters
      const RaveCityCharacters = window.RaveCityCharacters // Declare RaveCityCharacters variable
      RaveCityCharacters.createCharacters(theme)

      // Create buildings
      this.createBuildings(theme)

      // Create lasers
      this.createLasers(theme)

      // Create smoke machines
      if (RaveCityConfig.showSmoke && !RaveCityConfig.performanceMode) {
        this.createSmokeMachines(theme)
      }

      // Create zones (different party areas)
      this.createZones(theme)

      // Set up infinite world generation
      this.setupInfiniteWorld()
    } catch (error) {
      console.error("Failed to create scene objects:", error)
      const RaveCityUI = window.RaveCityUI // Declare RaveCityUI variable
      RaveCityUI.showError(`Failed to create scene objects: ${error.message}`)
    }
  },

  // Create dance floor
  createDanceFloor: function (theme) {
    // Create a grid floor for the dance floor
    const floorSize = 500
    const floorSegments = window.RaveCityConfig.performanceMode ? 50 : 100 // Declare RaveCityConfig variable

    const floorGeometry = new this.THREE.PlaneGeometry(floorSize, floorSize, floorSegments, floorSegments)
    const floorMaterial = new this.THREE.MeshBasicMaterial({
      color: theme.gridColor,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    })

    this.floorMesh = new this.THREE.Mesh(floorGeometry, floorMaterial)
    this.floorMesh.rotation.x = -Math.PI / 2
    this.floorMesh.position.y = -2
    this.scene.add(this.floorMesh)

    // Add a reflective surface under the wireframe
    const reflectiveGeometry = new this.THREE.PlaneGeometry(floorSize, floorSize)
    const reflectiveMaterial = new this.THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
    })

    const reflectiveMesh = new this.THREE.Mesh(reflectiveGeometry, reflectiveMaterial)
    reflectiveMesh.rotation.x = -Math.PI / 2
    reflectiveMesh.position.y = -2.1
    this.scene.add(reflectiveMesh)
  },

  // Create sky dome
  createSkyDome: function (theme) {
    // Create a large sphere for the sky
    const skyGeometry = new this.THREE.SphereGeometry(
      5000,
      window.RaveCityConfig.performanceMode ? 32 : 64, // Declare RaveCityConfig variable
      window.RaveCityConfig.performanceMode ? 32 : 64, // Declare RaveCityConfig variable
    )
    const skyMaterial = new this.THREE.MeshBasicMaterial({
      color: theme.skyColor,
      side: this.THREE.BackSide,
      transparent: true,
      opacity: 0.8,
    })

    this.skyMesh = new this.THREE.Mesh(skyGeometry, skyMaterial)
    this.scene.add(this.skyMesh)

    // Add stars to the sky dome
    const starCount = window.RaveCityConfig.performanceMode ? 1000 : 3000 // Declare RaveCityConfig variable
    const starGeometry = new this.THREE.BufferGeometry()
    const starPositions = new Float32Array(starCount * 3)

    for (let i = 0; i < starCount; i++) {
      // Create stars in a full sphere around the scene
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const radius = 900 + Math.random() * 100

      starPositions[i * 3] = radius * Math.sin(theta) * Math.cos(theta)
      starPositions[i * 3 + 1] = radius * Math.cos(phi)
      starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    }

    starGeometry.setAttribute("position", new this.THREE.BufferAttribute(starPositions, 3))

    const starMaterial = new this.THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      transparent: true,
      opacity: 0.8,
    })

    const stars = new this.THREE.Points(starGeometry, starMaterial)
    this.scene.add(stars)
    this.skyObjects.push(stars)

    // Add floating objects in the sky
    if (window.RaveCityConfig.showSkyObjects && !window.RaveCityConfig.performanceMode) {
      // Declare RaveCityConfig variable
      this.createSkyObjects(theme)
    }
  },

  // Create sky objects
  createSkyObjects: function (theme) {
    if (!window.RaveCityConfig.showSkyObjects) return // Declare RaveCityConfig variable

    for (let i = 0; i < window.RaveCityConfig.skyObjectCount; i++) {
      // Declare RaveCityConfig variable
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

  // Create a single sky object
  createSkyObject: function (x, y, z, theme) {
    // Random color
    const color1 = new this.THREE.Color(theme.particleColor1)
    const color2 = new this.THREE.Color(theme.particleColor2)
    const mixRatio = Math.random()
    const objectColor = new this.THREE.Color().lerpColors(color1, color2, mixRatio)

    // Create a random geometric shape
    let object
    const shapeType = Math.floor(Math.random() * 5)

    const material = new this.THREE.MeshBasicMaterial({
      color: objectColor,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    })

    switch (shapeType) {
      case 0: // Cube
        const cubeGeometry = new this.THREE.BoxGeometry(
          10 + Math.random() * 20,
          10 + Math.random() * 20,
          10 + Math.random() * 20,
        )
        object = new this.THREE.Mesh(cubeGeometry, material)
        break
      case 1: // Sphere
        const sphereGeometry = new this.THREE.SphereGeometry(5 + Math.random() * 15, 8, 8)
        object = new this.THREE.Mesh(sphereGeometry, material)
        break
      case 2: // Torus
        const torusGeometry = new this.THREE.TorusGeometry(10 + Math.random() * 10, 3 + Math.random() * 5, 8, 16)
        object = new this.THREE.Mesh(torusGeometry, material)
        break
      case 3: // Tetrahedron
        const tetraGeometry = new this.THREE.TetrahedronGeometry(10 + Math.random() * 15)
        object = new this.THREE.Mesh(tetraGeometry, material)
        break
      case 4: // Octahedron
        const octaGeometry = new this.THREE.OctahedronGeometry(10 + Math.random() * 15)
        object = new this.THREE.Mesh(octaGeometry, material)
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

  // Create particles
  createParticles: function (theme) {
    const particleGeometry = new this.THREE.BufferGeometry()
    const particleCount = window.RaveCityConfig.density * (window.RaveCityConfig.performanceMode ? 100 : 200) // Declare RaveCityConfig variable

    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    const color1 = new this.THREE.Color(theme.particleColor1)
    const color2 = new this.THREE.Color(theme.particleColor2)

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
      const mixedColor = new this.THREE.Color().lerpColors(color1, color2, mixRatio)

      colors[i * 3] = mixedColor.r
      colors[i * 3 + 1] = mixedColor.g
      colors[i * 3 + 2] = mixedColor.b
    }

    particleGeometry.setAttribute("position", new this.THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute("color", new this.THREE.BufferAttribute(colors, 3))

    const particleMaterial = new this.THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
    })

    this.particles = new this.THREE.Points(particleGeometry, particleMaterial)
    this.scene.add(this.particles)
  },

  // Create buildings
  createBuildings: function (theme) {
    if (!window.RaveCityConfig.showBuildings) return // Declare RaveCityConfig variable

    for (let i = 0; i < window.RaveCityConfig.buildingCount; i++) {
      // Declare RaveCityConfig variable
      // Random position
      const x = (Math.random() - 0.5) * 800
      const z = (Math.random() - 0.5) * 800

      this.createBuilding(x, z, theme)
    }
  },

  // Create a single building at specified position
  createBuilding: function (x, z, theme) {
    // Random building properties
    const width = 5 + Math.random() * 15
    const height = 20 + Math.random() * 80
    const depth = 5 + Math.random() * 15

    // Random color
    const color1 = new this.THREE.Color(theme.buildingColor1)
    const color2 = new this.THREE.Color(theme.buildingColor2)
    const mixRatio = Math.random()
    const buildingColor = new this.THREE.Color().lerpColors(color1, color2, mixRatio)

    // Create building geometry
    const buildingGeometry = new this.THREE.BoxGeometry(width, height, depth)
    const buildingMaterial = new this.THREE.MeshBasicMaterial({
      color: buildingColor,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    })

    const building = new this.THREE.Mesh(buildingGeometry, buildingMaterial)
    building.position.set(x, height / 2 - 2, z)

    this.scene.add(building)
    this.buildings.push(building)

    return building
  },

  // Create lasers
  createLasers: function (theme) {
    if (!window.RaveCityConfig.showLasers) return // Declare RaveCityConfig variable

    for (let i = 0; i < window.RaveCityConfig.laserCount; i++) {
      // Declare RaveCityConfig variable
      // Random start and end points
      const startX = (Math.random() - 0.5) * 400
      const startY = 5 + Math.random() * 50
      const startZ = (Math.random() - 0.5) * 400

      const endX = (Math.random() - 0.5) * 400
      const endY = 5 + Math.random() * 50
      const endZ = (Math.random() - 0.5) * 400

      // Random color
      const color1 = new this.THREE.Color(theme.particleColor1)
      const color2 = new this.THREE.Color(theme.particleColor2)
      const mixRatio = Math.random()
      const laserColor = new this.THREE.Color().lerpColors(color1, color2, mixRatio)

      // Create laser geometry using BufferGeometry
      const laserGeometry = new this.THREE.BufferGeometry()
      const vertices = new Float32Array([startX, startY, startZ, endX, endY, endZ])
      laserGeometry.setAttribute("position", new this.THREE.BufferAttribute(vertices, 3))

      const laserMaterial = new this.THREE.LineBasicMaterial({
        color: laserColor,
        transparent: true,
        opacity: 0.6,
      })

      const laser = new this.THREE.Line(laserGeometry, laserMaterial)
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
    for (let i = 0; i < window.RaveCityConfig.smokeCount; i++) {
      // Declare RaveCityConfig variable
      // Random position
      const x = (Math.random() - 0.5) * 400
      const y = 0
      const z = (Math.random() - 0.5) * 400

      // Create smoke particle system using BufferGeometry
      const particleCount = 50
      const smokeGeometry = new this.THREE.BufferGeometry()
      const positions = new Float32Array(particleCount * 3)
      const velocities = []

      for (let j = 0; j < particleCount; j++) {
        positions[j * 3] = x
        positions[j * 3 + 1] = y
        positions[j * 3 + 2] = z

        // Store velocity separately since BufferGeometry doesn't support custom attributes like Geometry did
        velocities.push(new this.THREE.Vector3(0, 0.5 + Math.random(), 0))
      }

      smokeGeometry.setAttribute("position", new this.THREE.BufferAttribute(positions, 3))

      const smokeMaterial = new this.THREE.PointsMaterial({
        color: 0xffffff,
        size: 5 + Math.random() * 10,
        transparent: true,
        opacity: 0.3,
      })

      const smoke = new this.THREE.Points(smokeGeometry, smokeMaterial)
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
      const zoneGeometry = new this.THREE.CircleGeometry(50 + Math.random() * 100, 32)
      const zoneMaterial = new this.THREE.MeshBasicMaterial({
        color: theme.gridColor,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      })

      const zone = new this.THREE.Mesh(zoneGeometry, zoneMaterial)
      zone.rotation.x = -Math.PI / 2
      zone.position.set(x, -1.9, z)
      this.scene.add(zone)
      this.zones.push(zone)
    }
  },

  // Set up infinite world generation
  setupInfiniteWorld: function () {
    // Create a much larger floor that extends "infinitely"
    this.updateDanceFloor(2000) // Extremely large floor

    // Set up procedural generation based on player position
    this.lastGenerationPosition = new this.THREE.Vector3() // Declare THREE variable
    this.generationRadius = 500
    this.generationDistance = 300
  },

  // Update dance floor size
  updateDanceFloor: function (size) {
    // Remove old floor
    if (this.floorMesh) {
      this.scene.remove(this.floorMesh)
    }

    const RaveCityConfig = window.RaveCityConfig // Declare RaveCityConfig variable
    const theme = RaveCityConfig.visualThemes[RaveCityConfig.visualTheme]

    // Create a much larger grid floor
    const floorSize = size
    const floorSegments = RaveCityConfig.performanceMode ? 100 : 200 // Declare RaveCityConfig variable

    const floorGeometry = new this.THREE.PlaneGeometry(floorSize, floorSize, floorSegments, floorSegments)
    const floorMaterial = new this.THREE.MeshBasicMaterial({
      color: theme.gridColor,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    })

    this.floorMesh = new this.THREE.Mesh(floorGeometry, floorMaterial)
    this.floorMesh.rotation.x = -Math.PI / 2
    this.floorMesh.position.y = -2
    this.scene.add(this.floorMesh)

    // Add a reflective surface under the wireframe
    const reflectiveGeometry = new this.THREE.PlaneGeometry(floorSize, floorSize)
    const reflectiveMaterial = new this.THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
    })

    const reflectiveMesh = new this.THREE.Mesh(reflectiveGeometry, reflectiveMaterial)
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
    const RaveCityConfig = window.RaveCityConfig // Declare RaveCityConfig variable
    const theme = RaveCityConfig.visualThemes[RaveCityConfig.visualTheme]
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
    const RaveCityCharacters = window.RaveCityCharacters // Declare RaveCityCharacters variable
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = this.generationRadius * 0.3 + Math.random() * this.generationRadius * 0.3

      const x = playerPos.x + Math.cos(angle) * distance
      const z = playerPos.z + Math.sin(angle) * distance

      RaveCityCharacters.createCharacter(x, z, theme, Math.random() > 0.5)
    }

    // Generate new sky objects
    if (!RaveCityConfig.performanceMode) {
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

  // Update objects
  updateObjects: function (deltaTime, time) {
    // Update particles
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array

      for (let i = 0; i < positions.length; i += 3) {
        // Slightly move particles up and down
        positions[i + 1] += Math.sin(time + i) * 0.01
      }

      this.particles.geometry.attributes.position.needsUpdate = true
    }

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
          object.userData.originalY + Math.sin(time * object.userData.floatSpeed + object.userData.floatOffset) * 10
      }
    })

    // Update lasers
    this.lasers.forEach((laser) => {
      // Change laser color over time
      laser.userData.mixRatio += laser.userData.colorChangeSpeed
      if (laser.userData.mixRatio > 1) {
        laser.userData.mixRatio = 0
        const tempColor = laser.userData.color1
        laser.userData.color1 = laser.userData.color2
        laser.userData.color2 = tempColor
      }

      const laserColor = new this.THREE.Color().lerpColors(
        laser.userData.color1,
        laser.userData.color2,
        laser.userData.mixRatio,
      )
      laser.material.color.set(laserColor)
    })

    // Update smoke machines
    this.smokeMachines.forEach((smoke) => {
      const positions = smoke.geometry.attributes.position.array
      const velocities = smoke.userData.velocities

      for (let i = 0; i < positions.length; i += 3) {
        // Apply velocity
        positions[i + 1] += velocities[i / 3].y * deltaTime * 10

        // Reset particle if it goes too high
        if (positions[i + 1] > 100) {
          positions[i + 1] = 0
        }
      }

      smoke.geometry.attributes.position.needsUpdate = true
    })
  },

  // Update post-processing effects based on audio
  updatePostProcessing: function (audioData) {
    const bassImpact = audioData.bassFrequency * window.RaveCityConfig.bassImpact // Declare RaveCityConfig variable

    // Adjust bloom intensity based on bass
    if (this.bloomPass) {
      this.bloomPass.strength =
        window.RaveCityConfig.visualThemes[window.RaveCityConfig.visualTheme].bloomStrength + bassImpact * 0.5 // Declare RaveCityConfig variable
    }

    // Adjust glitch intensity based on audio
    if (this.glitchPass) {
      this.glitchPass.enabled = bassImpact > 0.2
      this.glitchPass.goWild = bassImpact > 0.5
    }

    // Adjust RGB shift amount based on audio
    if (this.rgbShiftPass) {
      this.rgbShiftPass.uniforms.amount.value = 0.0015 + bassImpact * 0.001
    }
  },

  // Update theme
  updateTheme: function () {
    const RaveCityConfig = window.RaveCityConfig // Declare RaveCityConfig variable
    const theme = RaveCityConfig.visualThemes[RaveCityConfig.visualTheme]

    // Update fog color
    this.scene.fog.color.set(theme.fogColor)

    // Update floor color
    if (this.floorMesh) {
      this.floorMesh.material.color.set(theme.gridColor)
    }

    // Update sky color
    if (this.skyMesh) {
      this.skyMesh.material.color.set(theme.skyColor)
    }

    // Update particles
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array
      const colors = this.particles.geometry.attributes.color.array
      const color1 = new this.THREE.Color(theme.particleColor1)
      const color2 = new this.THREE.Color(theme.particleColor2)

      for (let i = 0; i < colors.length; i += 3) {
        const mixRatio = Math.random()
        const mixedColor = new this.THREE.Color().lerpColors(color1, color2, mixRatio)

        colors[i] = mixedColor.r
        colors[i + 1] = mixedColor.g
        colors[i + 2] = mixedColor.b
      }

      this.particles.geometry.attributes.color.needsUpdate = true
    }

    // Update buildings
    this.buildings.forEach((building) => {
      const color1 = new this.THREE.Color(theme.buildingColor1)
      const color2 = new this.THREE.Color(theme.buildingColor2)
      const mixRatio = Math.random()
      const buildingColor = new this.THREE.Color().lerpColors(color1, color2, mixRatio)
      building.material.color.set(buildingColor)
    })

    // Update lasers
    this.lasers.forEach((laser) => {
      const color1 = new this.THREE.Color(theme.particleColor1)
      const color2 = new this.THREE.Color(theme.particleColor2)
      laser.userData.color1 = color1
      laser.userData.color2 = color2
    })

    // Update bloom pass
    if (this.bloomPass) {
      this.bloomPass.strength = theme.bloomStrength
      this.bloomPass.radius = theme.bloomRadius
      this.bloomPass.threshold = theme.bloomThreshold
    }
  },

  // Handle window resize
  onWindowResize: function () {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(window.innerWidth, window.innerHeight)
    if (window.RaveCityConfig.performanceMode) {
      // Declare RaveCityConfig variable
      this.renderer.setPixelRatio(1)
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    if (this.composer && !window.RaveCityConfig.performanceMode) {
      // Declare RaveCityConfig variable
      this.composer.setSize(window.innerWidth, window.innerHeight)
    }
  },

  // Render the scene
  render: function () {
    if (this.composer && !window.RaveCityConfig.performanceMode) {
      // Declare RaveCityConfig variable
      this.composer.render()
    } else {
      this.renderer.render(this.scene, this.camera)
    }
  },
}
