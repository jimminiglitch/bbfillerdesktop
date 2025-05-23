/**
 * Character handling for Rave City
 */
const CHARACTER_TYPES = ["dancer", "raver", "partier", "dj", "citizen"];
const VEHICLE_TYPES = ["car", "taxi", "bus", "bike"];

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

  // Create characters with new type logic
  createCharacters: function (theme) {
    if (!window.RaveCityConfig) return;

    // DJ booth at (0,0)
    this.createCharacter(0, 0, theme, "dj");

    // 100 dancers in a circle
    for (let i = 0; i < 100; i++) {
      const { x, z } = Utils.randomCirclePosition(40);
      this.createCharacter(x, z, theme, "dancer");
    }

    // 50 citizens in a larger ring
    for (let i = 0; i < 50; i++) {
      const { x, z } = Utils.randomCirclePosition(120);
      this.createCharacter(x, z, theme, "citizen");
    }

    // Optionally, scatter some partiers/ravers
    for (let i = 0; i < 20; i++) {
      const { x, z } = Utils.randomCirclePosition(80);
      this.createCharacter(x, z, theme, "partier");
    }
    for (let i = 0; i < 15; i++) {
      const { x, z } = Utils.randomCirclePosition(90);
      this.createCharacter(x, z, theme, "raver");
    }
  },

  // Create a single character at specified position and type
  createCharacter: function (x, z, theme, type = "citizen") {
    if (
      typeof window.THREE === "undefined" ||
      !window.RaveCityConfig ||
      !window.RaveCityScene ||
      !this.characterMaterials ||
      this.characterMaterials.length === 0
    )
      return;

    // Choose a random character model of the correct type if possible
    let modelIndex = Math.floor(Math.random() * this.characterMaterials.length);
    if (type) {
      const typeIndices = window.RaveCityConfig.characterModels
        .map((model, idx) => (model.type === type ? idx : -1))
        .filter(idx => idx !== -1);
      if (typeIndices.length > 0) {
        modelIndex = typeIndices[Math.floor(Math.random() * typeIndices.length)];
      }
    }

    // Create sprite with character texture
    const sprite = new window.THREE.Sprite(this.characterMaterials[modelIndex]);

    // Scale and color by type
    let height = 3 + Math.random() * 0.5;
    let scaleX = height * 0.7;
    let scaleY = height;
    let color = null;

    if (type === "dj") {
      scaleX = 1;
      scaleY = 2;
      color = "#fff";
    } else if (type === "dancer" || type === "raver" || type === "partier") {
      color = Utils.randomNeonColor();
    } else if (type === "citizen") {
      color = "#bbb";
    }

    sprite.scale.set(scaleX, scaleY, 1);

    // Optionally tint the sprite
    if (color) {
      sprite.material.color = new window.THREE.Color(color);
    }

    // Position character
    sprite.position.set(x, scaleY / 2, z);

    // Assign userData.type and animation flags
    sprite.userData = {
      type: type,
      isDancing: type === "dancer" || type === "raver" || type === "partier",
      isDJ: type === "dj",
      danceSpeed: 0.5 + Math.random() * 1.5,
      danceOffset: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      modelIndex: modelIndex,
      height: scaleY,
      lookAtCamera: true,
    };

    // Add special look or glow for DJs
    if (type === "dj") {
      // Optionally, attach a neon rectangle mesh behind sprite for a "booth" look
      // Example: add a glowing rectangle mesh as a child
      const boothGeometry = new window.THREE.PlaneGeometry(2.2, 0.6);
      const boothMaterial = new window.THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.5,
        side: window.THREE.DoubleSide,
      });
      const boothMesh = new window.THREE.Mesh(boothGeometry, boothMaterial);
      boothMesh.position.set(0, -0.7, -0.2);
      sprite.add(boothMesh);
    }

    if (window.RaveCityScene.scene) {
      window.RaveCityScene.scene.add(sprite);
    }
    this.characters.push(sprite);

    return sprite;
  },

  // Update characters with type-based animation
  updateCharacters: function (time, beatStrength = 1) {
    if (!window.RaveCityScene || !window.RaveCityScene.camera) return;

    this.characters.forEach(character => {
      switch (character.userData.type) {
        case "dancer":
        case "raver":
        case "partier": {
          // Use procedural dance pose
          const pose = Utils.getDancePose(
            time * character.userData.danceSpeed + character.userData.danceOffset,
            beatStrength
          );
          character.position.y =
            character.userData.height / 2 +
            Math.sin(time * character.userData.danceSpeed + character.userData.danceOffset) * 0.5 * beatStrength;
          character.scale.x = 0.7 + 0.15 * Math.sin(time * 2 + pose.leftArm);
          character.scale.y = character.userData.height * (1 + 0.06 * Math.cos(time * 3 + pose.head));
          character.material.rotation = pose.head * 0.5;
          // Optionally cycle color
          // character.material.color.set(Utils.getTrippyColor(time));
          break;
        }
        case "dj":
          // Subtle head bob, hands move, booth lights pulse
          character.position.y = 1 + Math.sin(time * 2) * 0.1;
          // Optionally pulse booth glow
          if (character.children && character.children.length > 0) {
            const boothMesh = character.children[0];
            boothMesh.material.opacity = 0.5 + 0.5 * Math.abs(Math.sin(time * 2));
          }
          break;
        case "citizen":
          // Idle animation (sway or looking around)
          character.rotation.z = Math.sin(time * 0.5 + character.userData.danceOffset) * 0.05;
          break;
      }
      // Billboard: always face camera
      if (character.userData.lookAtCamera) {
        const cameraPosition = window.RaveCityScene.camera.position.clone();
        cameraPosition.y = character.position.y;
        character.lookAt(cameraPosition);
      }
    });
  },
};

// --- Traffic system ---
const RaveCityTraffic = {
  vehicles: [],
  createVehicle: function (type = "car", path = null) {
    // Create a mesh or sprite for the vehicle
    const geometry = new THREE.BoxGeometry(2, 1, 4);
    const material = new THREE.MeshPhongMaterial({ color: Utils.randomNeonColor() });
    const mesh = new THREE.Mesh(geometry, material);

    // Position mesh at start of path
    mesh.position.copy(path ? path[0] : new THREE.Vector3());

    mesh.userData = {
      type: type,
      path: path,
      progress: 0, // 0 to 1 along path
      speed: Utils.random(0.008, 0.018),
    };

    // Add pulsing light mesh on roof for rave effect
    const lightGeometry = new THREE.SphereGeometry(0.25, 8, 8);
    const lightMaterial = new THREE.MeshBasicMaterial({
      color: Utils.randomNeonColor(),
      emissive: 0xffffff,
      emissiveIntensity: 1,
    });
    const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial);
    lightMesh.position.set(0, 0.7, 0);
    mesh.add(lightMesh);

    // Add to scene and vehicles array
    window.RaveCityScene.scene.add(mesh);
    this.vehicles.push(mesh);
    return mesh;
  },
  updateVehicles: function (time) {
    this.vehicles.forEach(vehicle => {
      if (vehicle.userData.path) {
        // Move vehicle along its path
        vehicle.userData.progress += vehicle.userData.speed;
        if (vehicle.userData.progress > 1) vehicle.userData.progress = 0;

        // Simple linear interpolation for a path
        const p = vehicle.userData.progress;
        const path = vehicle.userData.path;
        const idx = Math.floor(p * (path.length - 1));
        const nextIdx = (idx + 1) % path.length;
        const t = (p * (path.length - 1)) % 1;
        vehicle.position.lerpVectors(path[idx], path[nextIdx], t);

        // Pulse the roof light
        if (vehicle.children && vehicle.children.length > 0) {
          const lightMesh = vehicle.children[0];
          lightMesh.material.color.set(Utils.getTrippyColor(time + idx));
          lightMesh.scale.setScalar(0.8 + 0.4 * Math.abs(Math.sin(time * 2 + idx)));
        }
      }
    });
  }
};

// Example path: circle around city
function createCircularPath(radius = 60, points = 40) {
  const path = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    path.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      0.5,
      Math.sin(angle) * radius
    ));
  }
  return path;
}

// Create 10 vehicles on city ring
for (let i = 0; i < 10; i++) {
  RaveCityTraffic.createVehicle("car", createCircularPath(60 + Utils.random(-8, 8)));
}
