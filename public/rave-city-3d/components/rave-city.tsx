"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass"
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader"
import { AudioVisualizer } from "@/components/audio-visualizer"
import { ThemeIndicator } from "@/components/theme-indicator"

// Character models
const characterModels = [
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3draverchick-na0XM6lySSJBjcumHMRzgv3JsBTV92.png",
    type: "dancer",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3draverchick2-zXawm0m0FDaBOPSFG2KLOS6FwtXcCq.png",
    type: "dancer",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3draverchick3-lFGKfSqBGaisScx5fLRnftI8WsH1xs.png",
    type: "dancer",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3draverchick4-uSsyDtwf9gi3YSOAwqDBS1Bt5so1wc.png",
    type: "dancer",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3draverchick5-dDcfUirnItjfpzeGtghohH5jJrUDst.png",
    type: "dancer",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3draverdude-LXE8FhxV5y5N8RYYvo6nuXM0PYwbed.png",
    type: "dancer",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3draverdude2-p8Jj5UB6eDsvQooZwrxEvBxCcLvO5q.png",
    type: "dancer",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3draverdude3-TON5jyJdrMmv5Fp3lVnXiIbkEe38zj.png",
    type: "regular",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3draverdude4-SWHkVcJdY6rPzOYPgZhHVeod2KI7mg.png",
    type: "regular",
  },
]

// Visual themes
const visualThemes = {
  rave: {
    name: "RAVE MADNESS",
    fogColor: 0x000022,
    particleColor1: 0xff00ff,
    particleColor2: 0x00ffff,
    gridColor: 0xffff00,
    buildingColor1: 0xff00ff,
    buildingColor2: 0x00ffff,
    skyColor: 0x000033,
    bloomStrength: 1.2,
    bloomRadius: 0.7,
    bloomThreshold: 0.1,
  },
  hyperspace: {
    name: "HYPERSPACE",
    fogColor: 0x000033,
    particleColor1: 0xff00ff,
    particleColor2: 0x00ffff,
    gridColor: 0xffff00,
    buildingColor1: 0x8800ff,
    buildingColor2: 0x0088ff,
    skyColor: 0x000066,
    bloomStrength: 1.0,
    bloomRadius: 0.6,
    bloomThreshold: 0.2,
  },
  vaporwave: {
    name: "VAPORWAVE",
    fogColor: 0x551a8b,
    particleColor1: 0xff71ce,
    particleColor2: 0x01cdfe,
    gridColor: 0x05ffa1,
    buildingColor1: 0xff71ce,
    buildingColor2: 0x05ffa1,
    skyColor: 0x2d1b4e,
    bloomStrength: 0.8,
    bloomRadius: 0.4,
    bloomThreshold: 0.3,
  },
  cyberpunk: {
    name: "CYBERPUNK",
    fogColor: 0x0a001a,
    particleColor1: 0xff3c6f,
    particleColor2: 0x00f9ff,
    gridColor: 0xffff00,
    buildingColor1: 0xff3c6f,
    buildingColor2: 0x00f9ff,
    skyColor: 0x0a001a,
    bloomStrength: 1.5,
    bloomRadius: 0.5,
    bloomThreshold: 0.1,
  },
  neon: {
    name: "NEON DREAMS",
    fogColor: 0x000000,
    particleColor1: 0xff00ff,
    particleColor2: 0x00ffff,
    gridColor: 0x00ff00,
    buildingColor1: 0xff00ff,
    buildingColor2: 0x00ffff,
    skyColor: 0x000000,
    bloomStrength: 1.8,
    bloomRadius: 0.8,
    bloomThreshold: 0.1,
  },
}

export default function RaveCity() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [themeKey, setThemeKey] = useState("rave")
  const [showThemeIndicator, setShowThemeIndicator] = useState(false)

  // Audio state
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const [audioData, setAudioData] = useState<Uint8Array | null>(null)

  // Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const composerRef = useRef<EffectComposer | null>(null)
  const controlsRef = useRef<PointerLockControls | null>(null)
  const clockRef = useRef<THREE.Clock | null>(null)
  const bloomPassRef = useRef<UnrealBloomPass | null>(null)
  const glitchPassRef = useRef<GlitchPass | null>(null)
  const rgbShiftPassRef = useRef<ShaderPass | null>(null)

  // Game state
  const animationFrameRef = useRef<number | null>(null)
  const characterTexturesRef = useRef<THREE.Texture[]>([])
  const characterMaterialsRef = useRef<THREE.SpriteMaterial[]>([])
  const charactersRef = useRef<THREE.Sprite[]>([])
  const buildingsRef = useRef<THREE.Mesh[]>([])
  const skyObjectsRef = useRef<THREE.Object3D[]>([])
  const lasersRef = useRef<THREE.Line[]>([])
  const particlesRef = useRef<THREE.Points | null>(null)
  const floorMeshRef = useRef<THREE.Mesh | null>(null)
  const skyMeshRef = useRef<THREE.Mesh | null>(null)

  // Movement state
  const movementRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    speed: 0.15,
    velocity: new THREE.Vector3(),
    direction: new THREE.Vector3(),
    pointerLocked: false,
  })

  // Animation state
  const timeRef = useRef(0)
  const lastTimeRef = useRef(0)

  // Procedural generation
  const lastGenerationPositionRef = useRef<THREE.Vector3 | null>(null)
  const generationRadiusRef = useRef(500)
  const generationDistanceRef = useRef(300)

  useEffect(() => {
    // Initialize audio
    initAudio()

    // Initialize Three.js scene
    initScene()

    // Initialize controls
    initControls()

    // Start animation loop
    animate()

    return () => {
      // Clean up
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      // Dispose of Three.js resources
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }

      // Remove event listeners
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("keyup", handleKeyUp)
      document.removeEventListener("pointerlockchange", handlePointerLockChange)
      document.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [])

  // Initialize audio
  const initAudio = () => {
    if (!audioRef.current) return

    // Create audio context
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Create analyser
    analyserRef.current = audioContextRef.current.createAnalyser()
    analyserRef.current.fftSize = 2048

    // Connect audio element to analyser
    const source = audioContextRef.current.createMediaElementSource(audioRef.current)
    source.connect(analyserRef.current)
    analyserRef.current.connect(audioContextRef.current.destination)

    // Start playing audio automatically
    audioRef.current.volume = 0.7
    audioRef.current.play().catch((error) => {
      console.error("Audio autoplay failed:", error)
    })
  }

  // Initialize Three.js scene
  const initScene = () => {
    if (!canvasRef.current) return

    // Create scene
    sceneRef.current = new THREE.Scene()

    // Add fog for depth
    const theme = visualThemes[themeKey as keyof typeof visualThemes]
    sceneRef.current.fog = new THREE.FogExp2(theme.fogColor, 0.008)

    // Create camera
    cameraRef.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
    cameraRef.current.position.set(0, 5, 20)

    // Create renderer
    rendererRef.current = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })
    rendererRef.current.setSize(window.innerWidth, window.innerHeight)
    rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Create clock for animation
    clockRef.current = new THREE.Clock()

    // Create pointer lock controls for first-person movement
    controlsRef.current = new PointerLockControls(cameraRef.current, document.body)

    // Set up post-processing
    setupPostProcessing()

    // Preload character textures
    preloadCharacterTextures().then(() => {
      // Create scene objects
      createSceneObjects()

      // Set up infinite world generation
      setupInfiniteWorld()
    })

    // Handle window resize
    window.addEventListener("resize", handleWindowResize)
  }

  // Set up post-processing
  const setupPostProcessing = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return

    const theme = visualThemes[themeKey as keyof typeof visualThemes]

    // Create composer
    composerRef.current = new EffectComposer(rendererRef.current)

    // Add render pass
    const renderPass = new RenderPass(sceneRef.current, cameraRef.current)
    composerRef.current.addPass(renderPass)

    // Add bloom pass
    bloomPassRef.current = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      theme.bloomStrength,
      theme.bloomRadius,
      theme.bloomThreshold,
    )
    composerRef.current.addPass(bloomPassRef.current)

    // Add RGB shift pass
    rgbShiftPassRef.current = new ShaderPass(RGBShiftShader)
    rgbShiftPassRef.current.uniforms.amount.value = 0.0015
    rgbShiftPassRef.current.uniforms.angle.value = 0
    composerRef.current.addPass(rgbShiftPassRef.current)

    // Add glitch pass
    glitchPassRef.current = new GlitchPass()
    glitchPassRef.current.goWild = false
    glitchPassRef.current.enabled = true
    composerRef.current.addPass(glitchPassRef.current)
  }

  // Preload character textures
  const preloadCharacterTextures = () => {
    return new Promise<void>((resolve) => {
      const textureLoader = new THREE.TextureLoader()
      let loadedTextures = 0

      characterModels.forEach((model, index) => {
        textureLoader.load(
          model.url,
          (texture) => {
            texture.crossOrigin = "anonymous"
            characterTexturesRef.current[index] = texture

            // Create material
            const material = new THREE.SpriteMaterial({
              map: texture,
              transparent: true,
            })
            characterMaterialsRef.current[index] = material

            loadedTextures++
            if (loadedTextures === characterModels.length) {
              resolve()
            }
          },
          undefined,
          (error) => {
            console.error("Error loading character texture:", error)
            // Still resolve to avoid blocking
            loadedTextures++
            if (loadedTextures === characterModels.length) {
              resolve()
            }
          },
        )
      })
    })
  }

  // Create scene objects
  const createSceneObjects = () => {
    if (!sceneRef.current) return

    const theme = visualThemes[themeKey as keyof typeof visualThemes]

    // Create floor (dance floor)
    createDanceFloor(theme)

    // Create sky dome
    createSkyDome(theme)

    // Create particle system
    createParticles(theme)

    // Create characters (dancers)
    createCharacters(theme)

    // Create buildings
    createBuildings(theme)

    // Create lasers
    createLasers(theme)
  }

  // Create dance floor
  const createDanceFloor = (theme: any) => {
    if (!sceneRef.current) return

    // Create a grid floor for the dance floor
    const floorSize = 500
    const floorSegments = 100

    const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize, floorSegments, floorSegments)
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: theme.gridColor,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    })

    floorMeshRef.current = new THREE.Mesh(floorGeometry, floorMaterial)
    floorMeshRef.current.rotation.x = -Math.PI / 2
    floorMeshRef.current.position.y = -2
    sceneRef.current.add(floorMeshRef.current)

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
    sceneRef.current.add(reflectiveMesh)
  }

  // Create sky dome
  const createSkyDome = (theme: any) => {
    if (!sceneRef.current) return

    // Create a large sphere for the sky
    const skyGeometry = new THREE.SphereGeometry(5000, 64, 64)
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: theme.skyColor,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.8,
    })

    skyMeshRef.current = new THREE.Mesh(skyGeometry, skyMaterial)
    sceneRef.current.add(skyMeshRef.current)

    // Add stars to the sky dome
    const starCount = 3000
    const starGeometry = new THREE.BufferGeometry()
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

    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3))

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      transparent: true,
      opacity: 0.8,
    })

    const stars = new THREE.Points(starGeometry, starMaterial)
    sceneRef.current.add(stars)
    skyObjectsRef.current.push(stars)

    // Add floating objects in the sky
    createSkyObjects(theme)
  }

  // Create sky objects
  const createSkyObjects = (theme: any) => {
    if (!sceneRef.current) return

    const skyObjectCount = 100

    for (let i = 0; i < skyObjectCount; i++) {
      // Random position in the sky
      const radius = 100 + Math.random() * 400
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = 50 + Math.random() * 300 // Higher up in the sky
      const z = radius * Math.sin(phi) * Math.sin(theta)

      createSkyObject(x, y, z, theme)
    }
  }

  // Create a single sky object
  const createSkyObject = (x: number, y: number, z: number, theme: any) => {
    if (!sceneRef.current) return

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
      default:
        const defaultGeometry = new THREE.BoxGeometry(10, 10, 10)
        object = new THREE.Mesh(defaultGeometry, material)
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

    sceneRef.current.add(object)
    skyObjectsRef.current.push(object)

    return object
  }

  // Create particles
  const createParticles = (theme: any) => {
    if (!sceneRef.current) return

    const particleGeometry = new THREE.BufferGeometry()
    const particleCount = 8000

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

    particlesRef.current = new THREE.Points(particleGeometry, particleMaterial)
    sceneRef.current.add(particlesRef.current)
  }

  // Create characters
  const createCharacters = (theme: any) => {
    if (!sceneRef.current) return

    const dancerCount = 100
    const regularPeopleCount = 50

    // Create dancers
    for (let i = 0; i < dancerCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 400
      const z = (Math.random() - 0.5) * 400

      createCharacter(x, z, theme, true)
    }

    // Create regular people
    for (let i = 0; i < regularPeopleCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 400
      const z = (Math.random() - 0.5) * 400

      createCharacter(x, z, theme, false)
    }
  }

  // Create a single character at specified position
  const createCharacter = (x: number, z: number, theme: any, isDancing: boolean) => {
    if (!sceneRef.current || characterMaterialsRef.current.length === 0) return

    // Choose a random character model
    let modelIndex = Math.floor(Math.random() * characterMaterialsRef.current.length)
    const characterType = characterModels[modelIndex].type

    // Only use dancer models for dancing characters
    if (isDancing && characterType !== "dancer") {
      // Try to find a dancer model
      const dancerIndices = characterModels
        .map((model, index) => (model.type === "dancer" ? index : -1))
        .filter((index) => index !== -1)

      if (dancerIndices.length > 0) {
        modelIndex = dancerIndices[Math.floor(Math.random() * dancerIndices.length)]
      }
    }

    // Create sprite with character texture
    const sprite = new THREE.Sprite(characterMaterialsRef.current[modelIndex])

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

    sceneRef.current.add(sprite)
    charactersRef.current.push(sprite)

    return sprite
  }

  // Create buildings
  const createBuildings = (theme: any) => {
    if (!sceneRef.current) return

    const buildingCount = 200

    for (let i = 0; i < buildingCount; i++) {
      // Random position
      const x = (Math.random() - 0.5) * 800
      const z = (Math.random() - 0.5) * 800

      createBuilding(x, z, theme)
    }
  }

  // Create a single building at specified position
  const createBuilding = (x: number, z: number, theme: any) => {
    if (!sceneRef.current) return

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

    sceneRef.current.add(building)
    buildingsRef.current.push(building)

    return building
  }

  // Create lasers
  const createLasers = (theme: any) => {
    if (!sceneRef.current) return

    const laserCount = 50

    for (let i = 0; i < laserCount; i++) {
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

      // Create laser geometry using BufferGeometry
      const laserGeometry = new THREE.BufferGeometry()
      const vertices = new Float32Array([startX, startY, startZ, endX, endY, endZ])
      laserGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3))

      const laserMaterial = new THREE.LineBasicMaterial({
        color: laserColor,
        transparent: true,
        opacity: 0.6,
      })

      const laser = new THREE.Line(laserGeometry, laserMaterial)
      sceneRef.current.add(laser)
      lasersRef.current.push(laser)

      // Add animation data
      laser.userData = {
        color1: color1,
        color2: color2,
        mixRatio: Math.random(),
        colorChangeSpeed: 0.01 + Math.random() * 0.05,
      }
    }
  }

  // Set up infinite world generation
  const setupInfiniteWorld = () => {
    if (!cameraRef.current) return

    // Create a much larger floor that extends "infinitely"
    updateDanceFloor(2000) // Extremely large floor

    // Set up procedural generation based on player position
    lastGenerationPositionRef.current = cameraRef.current.position.clone()
    generationRadiusRef.current = 500
    generationDistanceRef.current = 300
  }

  // Update dance floor size
  const updateDanceFloor = (size: number) => {
    if (!sceneRef.current || !floorMeshRef.current) return

    // Remove old floor
    sceneRef.current.remove(floorMeshRef.current)

    const theme = visualThemes[themeKey as keyof typeof visualThemes]

    // Create a much larger grid floor
    const floorSize = size
    const floorSegments = 200

    const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize, floorSegments, floorSegments)
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: theme.gridColor,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    })

    floorMeshRef.current = new THREE.Mesh(floorGeometry, floorMaterial)
    floorMeshRef.current.rotation.x = -Math.PI / 2
    floorMeshRef.current.position.y = -2
    sceneRef.current.add(floorMeshRef.current)

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
    sceneRef.current.add(reflectiveMesh)
  }

  // Initialize controls
  const initControls = () => {
    // Pointer lock
    document.body.addEventListener("click", handleClick)
    document.addEventListener("pointerlockchange", handlePointerLockChange)

    // Keyboard controls
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keyup", handleKeyUp)

    // Right-click to exit pointer lock (like Esc)
    document.addEventListener("contextmenu", handleContextMenu)
  }

  // Handle click
  const handleClick = () => {
    if (controlsRef.current) {
      controlsRef.current.lock()
    }
  }

  // Handle pointer lock change
  const handlePointerLockChange = () => {
    movementRef.current.pointerLocked = document.pointerLockElement === document.body
  }

  // Handle key down
  const handleKeyDown = (event: KeyboardEvent) => {
    if (movementRef.current.pointerLocked) {
      switch (event.code) {
        case "KeyW":
          movementRef.current.forward = true
          break
        case "KeyS":
          movementRef.current.backward = true
          break
        case "KeyA":
          movementRef.current.left = true
          break
        case "KeyD":
          movementRef.current.right = true
          break
        case "Space":
          movementRef.current.up = true
          break
        case "ShiftLeft":
          movementRef.current.down = true
          break
      }
    }

    // Global keyboard shortcuts
    switch (event.code) {
      case "KeyC":
        changeTheme()
        break
    }
  }

  // Handle key up
  const handleKeyUp = (event: KeyboardEvent) => {
    switch (event.code) {
      case "KeyW":
        movementRef.current.forward = false
        break
      case "KeyS":
        movementRef.current.backward = false
        break
      case "KeyA":
        movementRef.current.left = false
        break
      case "KeyD":
        movementRef.current.right = false
        break
      case "Space":
        movementRef.current.up = false
        break
      case "ShiftLeft":
        movementRef.current.down = false
        break
    }
  }

  // Handle context menu (right-click)
  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault()
    if (controlsRef.current) {
      controlsRef.current.unlock()
    }
  }

  // Handle window resize
  const handleWindowResize = () => {
    if (!cameraRef.current || !rendererRef.current || !composerRef.current) return

    cameraRef.current.aspect = window.innerWidth / window.innerHeight
    cameraRef.current.updateProjectionMatrix()

    rendererRef.current.setSize(window.innerWidth, window.innerHeight)
    rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    composerRef.current.setSize(window.innerWidth, window.innerHeight)
  }

  // Change theme
  const changeTheme = () => {
    const themeNames = Object.keys(visualThemes)
    const currentThemeIndex = themeNames.indexOf(themeKey)
    const nextThemeIndex = (currentThemeIndex + 1) % themeNames.length
    setThemeKey(themeNames[nextThemeIndex])

    // Update theme
    updateTheme()

    // Show theme indicator
    setShowThemeIndicator(true)
    setTimeout(() => {
      setShowThemeIndicator(false)
    }, 3000)
  }

  // Update theme
  const updateTheme = () => {
    if (!sceneRef.current || !floorMeshRef.current || !skyMeshRef.current) return

    const theme = visualThemes[themeKey as keyof typeof visualThemes]

    // Update fog color
    if (sceneRef.current.fog) {
      ;(sceneRef.current.fog as THREE.FogExp2).color.set(theme.fogColor)
    }

    // Update floor color
    floorMeshRef.current.material.color.set(theme.gridColor)

    // Update sky color
    skyMeshRef.current.material.color.set(theme.skyColor)

    // Update particles
    if (particlesRef.current) {
      const colors = particlesRef.current.geometry.attributes.color.array
      const color1 = new THREE.Color(theme.particleColor1)
      const color2 = new THREE.Color(theme.particleColor2)

      for (let i = 0; i < colors.length; i += 3) {
        const mixRatio = Math.random()
        const mixedColor = new THREE.Color().lerpColors(color1, color2, mixRatio)

        colors[i] = mixedColor.r
        colors[i + 1] = mixedColor.g
        colors[i + 2] = mixedColor.b
      }

      particlesRef.current.geometry.attributes.color.needsUpdate = true
    }

    // Update buildings
    buildingsRef.current.forEach((building) => {
      const color1 = new THREE.Color(theme.buildingColor1)
      const color2 = new THREE.Color(theme.buildingColor2)
      const mixRatio = Math.random()
      const buildingColor = new THREE.Color().lerpColors(color1, color2, mixRatio)
      building.material.color.set(buildingColor)
    })

    // Update lasers
    lasersRef.current.forEach((laser) => {
      const color1 = new THREE.Color(theme.particleColor1)
      const color2 = new THREE.Color(theme.particleColor2)
      laser.userData.color1 = color1
      laser.userData.color2 = color2
    })

    // Update bloom pass
    if (bloomPassRef.current) {
      bloomPassRef.current.strength = theme.bloomStrength
      bloomPassRef.current.radius = theme.bloomRadius
      bloomPassRef.current.threshold = theme.bloomThreshold
    }
  }

  // Animation loop
  const animate = () => {
    animationFrameRef.current = requestAnimationFrame(animate)

    // Get delta time
    const now = performance.now()
    const deltaTime = (now - lastTimeRef.current) / 1000
    lastTimeRef.current = now
    timeRef.current += deltaTime

    // Update movement
    updateMovement(deltaTime)

    // Update objects
    updateObjects(deltaTime)

    // Check for procedural generation
    checkProceduralGeneration()

    // Update audio visualizer
    updateAudioVisualizer()

    // Render the scene
    render()
  }

  // Update movement
  const updateMovement = (deltaTime: number) => {
    if (!cameraRef.current) return

    // Only apply movement if pointer is locked
    if (!movementRef.current.pointerLocked) return

    // Get camera direction
    cameraRef.current.getWorldDirection(movementRef.current.direction)

    // Reset velocity
    movementRef.current.velocity.x = 0
    movementRef.current.velocity.z = 0
    movementRef.current.velocity.y = 0

    // Calculate movement speed with delta time
    const speed = movementRef.current.speed * 2.0 * deltaTime * 60

    // Forward/backward
    if (movementRef.current.forward) {
      movementRef.current.velocity.x += movementRef.current.direction.x * speed
      movementRef.current.velocity.z += movementRef.current.direction.z * speed
    }
    if (movementRef.current.backward) {
      movementRef.current.velocity.x -= movementRef.current.direction.x * speed
      movementRef.current.velocity.z -= movementRef.current.direction.z * speed
    }

    // Left/right (strafe)
    if (movementRef.current.left) {
      movementRef.current.velocity.x += movementRef.current.direction.z * speed
      movementRef.current.velocity.z -= movementRef.current.direction.x * speed
    }
    if (movementRef.current.right) {
      movementRef.current.velocity.x -= movementRef.current.direction.z * speed
      movementRef.current.velocity.z += movementRef.current.direction.x * speed
    }

    // Up/down (flying)
    if (movementRef.current.up) {
      movementRef.current.velocity.y += speed
    }
    if (movementRef.current.down) {
      movementRef.current.velocity.y -= speed
    }

    // Apply velocity to camera position
    cameraRef.current.position.x += movementRef.current.velocity.x
    cameraRef.current.position.z += movementRef.current.velocity.z
    cameraRef.current.position.y += movementRef.current.velocity.y

    // Prevent going below the floor
    if (cameraRef.current.position.y < 0) {
      cameraRef.current.position.y = 0
    }
  }

  // Update objects
  const updateObjects = (deltaTime: number) => {
    // Update particles
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array

      for (let i = 0; i < positions.length; i += 3) {
        // Slightly move particles up and down
        positions[i + 1] += Math.sin(timeRef.current + i) * 0.01
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }

    // Update characters
    charactersRef.current.forEach((character) => {
      if (character.userData.isDancing) {
        // Make characters dance
        character.position.y =
          character.userData.height / 2 +
          Math.sin(timeRef.current * character.userData.danceSpeed + character.userData.danceOffset) * 0.5
      }

      // Make characters face the camera (billboarding)
      if (character.userData.lookAtCamera && cameraRef.current) {
        const cameraPosition = cameraRef.current.position.clone()
        cameraPosition.y = character.position.y // Keep same height
        character.lookAt(cameraPosition)
      }
    })

    // Update sky objects
    skyObjectsRef.current.forEach((object) => {
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
          Math.sin(timeRef.current * object.userData.floatSpeed + object.userData.floatOffset) * 10
      }
    })

    // Update lasers
    lasersRef.current.forEach((laser) => {
      // Change laser color over time
      laser.userData.mixRatio += laser.userData.colorChangeSpeed
      if (laser.userData.mixRatio > 1) {
        laser.userData.mixRatio = 0
        const tempColor = laser.userData.color1
        laser.userData.color1 = laser.userData.color2
        laser.userData.color2 = tempColor
      }

      const laserColor = new THREE.Color().lerpColors(
        laser.userData.color1,
        laser.userData.color2,
        laser.userData.mixRatio,
      )
      laser.material.color.set(laserColor)
    })
  }

  // Check if we need to generate more content based on player position
  const checkProceduralGeneration = () => {
    if (!cameraRef.current || !lastGenerationPositionRef.current) return

    const distanceMoved = cameraRef.current.position.distanceTo(lastGenerationPositionRef.current)

    // If player has moved far enough, generate new content
    if (distanceMoved > generationDistanceRef.current) {
      generateWorldContent()
      lastGenerationPositionRef.current.copy(cameraRef.current.position)
    }
  }

  // Generate new world content around the player
  const generateWorldContent = () => {
    if (!cameraRef.current) return

    const theme = visualThemes[themeKey as keyof typeof visualThemes]
    const playerPos = cameraRef.current.position.clone()

    // Generate new buildings
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = generationRadiusRef.current * 0.5 + Math.random() * generationRadiusRef.current * 0.5

      const x = playerPos.x + Math.cos(angle) * distance
      const z = playerPos.z + Math.sin(angle) * distance

      createBuilding(x, z, theme)
    }

    // Generate new characters
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = generationRadiusRef.current * 0.3 + Math.random() * generationRadiusRef.current * 0.3

      const x = playerPos.x + Math.cos(angle) * distance
      const z = playerPos.z + Math.sin(angle) * distance

      createCharacter(x, z, theme, Math.random() > 0.5)
    }

    // Generate new sky objects
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = generationRadiusRef.current * 0.7 + Math.random() * generationRadiusRef.current * 0.3
      const height = 50 + Math.random() * 300

      const x = playerPos.x + Math.cos(angle) * distance
      const z = playerPos.z + Math.sin(angle) * distance

      createSkyObject(x, height, z, theme)
    }
  }

  // Update audio visualizer
  const updateAudioVisualizer = () => {
    if (!analyserRef.current || !audioRef.current || !audioRef.current.paused) {
      // Get frequency data
      const frequencyData = new Uint8Array(analyserRef.current?.frequencyBinCount || 0)
      analyserRef.current?.getByteFrequencyData(frequencyData)

      // Update audio data state for visualization
      setAudioData(frequencyData)

      // Update post-processing effects based on audio
      updatePostProcessing(frequencyData)

      return frequencyData
    }

    return null
  }

  // Update post-processing effects based on audio
  const updatePostProcessing = (frequencyData: Uint8Array) => {
    if (!bloomPassRef.current || !glitchPassRef.current || !rgbShiftPassRef.current) return

    // Normalize bass frequency
    const bassFrequency = frequencyData[1] / 256
    const bassImpact = bassFrequency * 1.5

    // Adjust bloom intensity based on bass
    const theme = visualThemes[themeKey as keyof typeof visualThemes]
    bloomPassRef.current.strength = theme.bloomStrength + bassImpact * 0.5

    // Adjust glitch intensity based on audio
    glitchPassRef.current.enabled = bassImpact > 0.2
    glitchPassRef.current.goWild = bassImpact > 0.5

    // Adjust RGB shift amount based on audio
    rgbShiftPassRef.current.uniforms.amount.value = 0.0015 + bassImpact * 0.001
  }

  // Render the scene
  const render = () => {
    if (composerRef.current) {
      composerRef.current.render()
    } else if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current)
    }
  }

  return (
    <>
      <canvas ref={canvasRef} className="w-full h-screen" />

      <audio
        ref={audioRef}
        src="https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/melodic-techno-03-extended-version-moogify-9867.mp3?v=1747323781216"
        loop
        crossOrigin="anonymous"
        className="hidden"
      />

      <AudioVisualizer audioData={audioData} />

      {showThemeIndicator && <ThemeIndicator themeName={visualThemes[themeKey as keyof typeof visualThemes].name} />}
    </>
  )
}
