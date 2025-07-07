 //Copyrite Dominik Honzak 2024
 const socket = io();
 const v = {
    audio:null,
    uid:null,
    uidBottom:document.getElementById('userid'),
    requestOpen:true,
    scheduleList:document.getElementById('scheduleList')
 };
 let locations = [{ lat: 39.15837166021878, lon: -76.89932926112813, texture:null, color:0x00c3ff, type:null }];
//important points
let locationsImportant = [
  { lat:0, lon:0, texture:"/pics/null.png", color:0x00ff00, type:"plane" }, //null island
  { lat: 39.15837166021878, lon: -76.89932926112813, texture:"/pics/logo.png", color:null, type:"plane", width: 1.35, height: 0.5}, //apl center
  // { lat: 39.15837166021878, lon: -76.89932926112813, texture:null, color:0x00c3ff, type:null }
];

// Setup scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("content").appendChild(renderer.domElement);

// Create Earth sphere
const radius = 5;
const earthGeometry = new THREE.SphereGeometry(radius, 64, 64);
const earthTexture = new THREE.TextureLoader().load('/pics/earth-water.png');
const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

const points = [];

// Function to convert geographic coords to 3D position
const positionOnSphere = (lat, lon, radius) => {
  const phi = (90 - lat) * Math.PI / 180; // Convert latitude to phi (0 at north pole)
  const theta = (lon + 180) * Math.PI / 180; // Convert longitude to theta
  
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta), // Note: negative X for correct orientation
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

// Initialize all points
const locationsRender = () => {
  [...locations, ...locationsImportant].forEach(location => {
    let pointGeometry, pointMaterial;
    
    if (location.type === "plane") {
      const planeWidth = location.width || 0.5;
      const planeHeight = location.height || 0.5;
      pointGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    } else {
      pointGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    }

    // Create material
    if (location.texture) {
      const texture = new THREE.TextureLoader().load(location.texture);
      pointMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        emissive: 0x333333,  // Base glow color (dark gray)
        emissiveIntensity: 1,  // Glow strength (0-1)
        roughness: 0.1,  // Makes surface more reflective
        metalness: 0.1  // Adds metallic shine
      });
    } else {
      pointMaterial = new THREE.MeshStandardMaterial({
        color: location.color || 0xff0000,
        emissive: location.color || 0xff0000,  // Same as base color
        emissiveIntensity: 0.9,  // Subtle glow
        roughness: 0.3,
        metalness: 0.7
      });
    }

    const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
    pointMesh.frustumCulled = false;
    
    // Set initial position
    const position = positionOnSphere(location.lat, location.lon, radius);
    pointMesh.position.copy(position);
    
    // Orient planes to face outward
    if (location.type === "plane") {
      pointMesh.lookAt(position.clone().multiplyScalar(2));
    }

    scene.add(pointMesh);
    points.push(pointMesh);
  });
};

// Lighting - Sun simulation
const sunlight = new THREE.DirectionalLight(0xffffff, 1);
sunlight.castShadow = true;
sunlight.shadow.mapSize.width = 2048;
sunlight.shadow.mapSize.height = 2048;
scene.add(sunlight);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Update sun position based on current time
const updateSunPosition = () => {
  const now = new Date();
  const hoursUTC = now.getUTCHours() + now.getUTCMinutes()/60;
  
  // Sun moves 15 degrees per hour (360/24)
  const sunLongitude = -180 + -(hoursUTC * 15);
  const sunPosition = positionOnSphere(0, sunLongitude, 100); // Far away light
  
  sunlight.position.copy(sunPosition);
  sunlight.lookAt(0, 0, 0);
  
  // Update Earth's night side with ambient light (might not be right)
  const nightIntensity = 0.1 + 0.4 * (1 - Math.abs(sunLongitude % 180)/90);
  ambientLight.intensity = nightIntensity;
};

// Camera position and controls
camera.position.z = 15;

let angle = 0;
let autoRotate = true;
let rotationSpeed = 0.002;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Fixed mouse controls
renderer.domElement.addEventListener('mousedown', (e) => {
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
});

renderer.domElement.addEventListener('mousemove', (e) => {
  if (isDragging) {
    autoRotate = false;
    
    const deltaMove = {
      x: e.clientX - previousMousePosition.x,
      y: e.clientY - previousMousePosition.y
    };
    
    angle -= deltaMove.x * 0.01;
    
    previousMousePosition = { x: e.clientX, y: e.clientY };
  }
});

renderer.domElement.addEventListener('mouseup', () => {
  isDragging = false;
  setTimeout(() => autoRotate = true, 3000);
});

// Touch controls
renderer.domElement.addEventListener('touchstart', (e) => {
  isDragging = true;
  previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  e.preventDefault();
});

renderer.domElement.addEventListener('touchmove', (e) => {
  if (isDragging) {
    autoRotate = false;
    
    const deltaMove = {
      x: e.touches[0].clientX - previousMousePosition.x,
      y: e.touches[0].clientY - previousMousePosition.y
    };
    
    angle -= deltaMove.x * 0.01;
    
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  e.preventDefault();
});

// Animation loop
const animate = () => {
  requestAnimationFrame(animate);

  // Update sun position based on current time
  updateSunPosition();

  // Auto-rotate camera if not dragging
  if (autoRotate) {
    angle += rotationSpeed;
  }
  
  // Update camera position
  camera.position.x = 15 * Math.sin(angle);
  camera.position.z = 15 * Math.cos(angle);
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
};

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add starfield background
const createStarfield = (numStars = 2000) => {
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1,
    transparent: true,
    opacity: 0.8
  });

  const starVertices = [];
  const radius = 100; // Sphere radius for star distribution

  for (let i = 0; i < numStars; i++) {
    // Random spherical coordinates
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    // Convert to Cartesian coordinates
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    starVertices.push(x, y, z);
    
    // Random size variation
    if (Math.random() > 0.9) {
      starsMaterial.size = 0.4; // Some bigger stars
    } else {
      starsMaterial.size = 0.2 + Math.random() * 0.05;
    }
  }

  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  const starField = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starField);
};


// Initial setup
updateSunPosition();
animate();
createStarfield(5000);

 // Handle window resizing
 window.addEventListener('resize', () => {
     renderer.setSize(window.innerWidth, window.innerHeight);
     camera.aspect = window.innerWidth / window.innerHeight;
     camera.updateProjectionMatrix();
 });
 const loopAudio = (audio) => {
    if (v.audio) {
        v.audio.pause();
        v.audio.remove();
    }
    v.audio = document.createElement("audio");
    v.audio.src = "/music/"+audio; // make sure to move this later to different folder
    v.audio.loop = true; 
    v.audio.volume = 0.5;
    v.audio.load();
    v.audio.play();
};
const promptName = function() {
    let box = document.createElement('div');
    box.classList.add('box');
    let h1 = document.createElement('h1');
    h1.textContent = "Full Name";
    box.appendChild(h1);
    let input1 = document.createElement('input');
    input1.placeholder = "Input name here..."
    box.appendChild(input1);
    let btn = document.createElement('button');
    btn.textContent = "Confirm";
    btn.classList.add('hover');
    btn.onclick = () => {
      uidAssign(input1);
      box.remove();
    };
    input1.onkeydown = (event) => {
      if (event.key === 'Enter') {
        uidAssign(input1);
        box.remove();
      }
    };    
    box.appendChild(btn);
    document.body.appendChild(box);
    input1.focus();
  };
const uidAssign = (input1) => {
    v.uid = input1.value ? input1.value : "Anonymous";
    v.uidBottom.textContent = `UID: ${v.uid}`;
    loopAudio("bgmusic.mp3");
    socket.emit('render');
    v.requestOpen = false;
};
const promptRequest = function() {
  if (v.requestOpen) {
    return;
  }
  v.requestOpen = true;
  let box = document.createElement('div');
  box.classList.add('box');
  let h1 = document.createElement('h1');
  h1.textContent = "Location Request";
  box.appendChild(h1);
  let flexContainer = document.createElement('div');
  flexContainer.classList.add('flexContainer');
  let btn = document.createElement('button');
  btn.textContent = "Lat & Long";
  btn.classList.add('hover');
  btn.classList.add('promptRequest');
  flexContainer.appendChild(btn);
  let h3 = document.createElement('h3');
  h3.textContent = "Or";
  h3.classList.add('promptRequest');
  flexContainer.appendChild(h3);
  let btn2 = document.createElement('button');
  btn2.textContent = "Current Location";
  btn2.classList.add('hover');
  btn2.classList.add('promptRequest');
  flexContainer.appendChild(btn2);
  btn.onclick = function() {
    promptLatLong();
    box.remove();
  };
  btn2.onclick = function() {
    requestLocation();
    box.remove();
  };
  box.appendChild(flexContainer);
  document.body.appendChild(box);
};
const requestLocation = () => {
  addPopupAlert("Feature is Currently Unavailable");
  v.requestOpen = false; // move to the end of the confirmation window see below -->
  //request current location and put a confirmation window up
};
const promptLatLong = function() {
    let box = document.createElement('div');
    box.classList.add('box');
    let h1 = document.createElement('h1');
    h1.textContent = "Lat & Long";
    box.appendChild(h1);
    let h3 = document.createElement('h3');
    h3.textContent = "Longitude";
    box.appendChild(h3);
    let input1 = document.createElement('input');
    input1.placeholder = "Input longitude here...";
    box.appendChild(input1);
    let h31 = document.createElement('h3');
    h31.textContent = "Latitude";
    box.appendChild(h31);
    let input2 = document.createElement('input');
    input2.placeholder = "Input latitude here...";
    box.appendChild(input2);
    let btn = document.createElement('button');
    btn.textContent = "Confirm";
    btn.classList.add('hover');
    btn.onclick = function() {
      let lon = parseFloat(input1.value);
      let lat = parseFloat(input2.value);
      if (validateLatLong(lon, lat)) {
        latlongSubmit(lon, lat);
      } else {
        addPopupAlert("Invalid Latitude or Longitude");
      }
      box.remove();
      v.requestOpen = false;
    };
    box.appendChild(btn);
    document.body.appendChild(box);
    input1.focus();
  };
  
  const validateLatLong = (lon, lat) => {
    const lonVal = parseFloat(lon);
    const latVal = parseFloat(lat);
    const withinLongitudeRange = lonVal >= -180 && lonVal <= 180;
    const withinLatitudeRange = latVal >= -90 && latVal <= 90;
    
    // ISS latitude range: approx -51.6 to 51.6 degrees due to its orbital inclination
    const withinISSlatitude = latVal >= -51.6 && latVal <= 51.6;
    
    return withinLongitudeRange && withinLatitudeRange && withinISSlatitude;
  };
  
  const latlongSubmit = (lon, lat) => {
      let uid = v.uid;
      socket.emit("request", { uid, lat , lon });
      addPopupAlert("Request Sent");
  };
  const generateSchedule = (schedule) => {
    for (let i = 0;i < schedule.length;i++) {
      let item = document.createElement('div');
      item.classList.add("schedule");
      let bullet = document.createElement('span');
      bullet.classList.add("bullet");
      bullet.classList.add(schedule.Type.toLowerCase());
      item.appendChild(bullet);
      let type = document.createElement('span');
      type.textContent = schedule.Type;
      item.appendChild(type);
      let timeContainer = document.createElement('div');
      let time = document.createElement('i');
      time.textContent = schedule.Time.toLocaleString();
      timeContainer.appendChild(time);
      item.appendChild(timeContainer);
      v.scheduleList.appendChild(item);
    }
  };
  const addPopupAlert = (message) => {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'popup-alert fade-in';
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
  
    setTimeout(() => {
      alertDiv.classList.remove('fade-in');
      alertDiv.classList.add('fade-out');
      setTimeout(() => document.body.removeChild(alertDiv), 1000);
    }, 3000);
  };
  
//-------------------------------------------------------------------------------------------
promptName();
//-------------------------------------------------------------------------------------------
socket.on('success', () => {
  
});
socket.on('fail', () => {
  
});
socket.on('404', () => {
  // location.href = '/404';
});

socket.on('render', (requestList) => {
  locations = requestList.requests;
  console.log(locations);
  locationsRender();
});
//socket error and success function callbacks here