/**
 * Configuration settings for 3D Rave City
 */
const RaveCityConfig = {
  // Core settings
  density: 60,
  movementSpeed: 2.0,
  flyingEnabled: true,
  visualTheme: "rave",
  audioReactive: true,
  volume: 0.7,
  bassImpact: 1.5,
  audioTrack: "melodic-techno",
  randomizeTracks: true,
  trippyLevel: 1.0,
  glitchIntensity: 0.15,
  colorShiftSpeed: 1.0,
  bloomEnabled: true,

  // Performance settings
  showFps: false,
  quality: "medium",
  autoOptimize: true,
  mouseSensitivity: 1.0,

  // Dancer settings
  dancerCount: 100,
  regularPeopleCount: 50,
  dancerDetail: "medium",

  // World settings
  showBuildings: true,
  buildingCount: 200,
  showSkyObjects: true,
  skyObjectCount: 100,
  showLasers: true,
  laserCount: 50,
  showSmoke: true,
  smokeCount: 8,

  // System detection
  isMobile: false,
  performanceMode: false,

  // Visual themes
  visualThemes: {
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
  },

  // Audio tracks
  audioTracks: {
    "melodic-techno": {
      url: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/melodic-techno-03-extended-version-moogify-9867.mp3?v=1747323781216",
      title: "Melodic Techno",
    },
    "berlin-techno": {
      url: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/berlin-techno-106820.mp3?v=1747327926985",
      title: "Berlin Techno",
    },
    "dopetronic-echoes": {
      url: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/dopetronic-echoes-from-nowhere-original-mix-gift-track-321994.mp3?v=1747327850182",
      title: "Dopetronic - Echoes From Nowhere",
    },
    "unknown-planet": {
      url: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/unknown-planet-driving-techno-music-312478.mp3?v=1747327934012",
      title: "Unknown Planet - Driving Techno",
    },
    "techno-pulse": {
      url: "https://cdn.glitch.global/25331b85-e206-4347-93a8-666983818ff8/techno-pulse-127292.mp3?v=1747327934012",
      title: "Techno Pulse",
    },
  },

  // Character models
  characterModels: [
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
  ],

  // Apply quality settings
  applyQualitySettings: function (quality) {
    switch (quality) {
      case "low":
        this.density = 20
        this.dancerCount = 30
        this.regularPeopleCount = 15
        this.skyObjectCount = 30
        this.buildingCount = 50
        this.laserCount = 15
        this.showSmoke = false
        this.bloomEnabled = false
        this.dancerDetail = "low"
        break
      case "medium":
        this.density = 40
        this.dancerCount = 60
        this.regularPeopleCount = 30
        this.skyObjectCount = 60
        this.buildingCount = 100
        this.laserCount = 30
        this.showSmoke = true
        this.bloomEnabled = true
        this.dancerDetail = "medium"
        break
      case "high":
        this.density = 60
        this.dancerCount = 100
        this.regularPeopleCount = 50
        this.skyObjectCount = 100
        this.buildingCount = 150
        this.laserCount = 50
        this.showSmoke = true
        this.bloomEnabled = true
        this.dancerDetail = "medium"
        break
      case "ultra":
        this.density = 100
        this.dancerCount = 150
        this.regularPeopleCount = 75
        this.skyObjectCount = 150
        this.buildingCount = 200
        this.laserCount = 80
        this.showSmoke = true
        this.bloomEnabled = true
        this.dancerDetail = "high"
        break
    }
  },
}
