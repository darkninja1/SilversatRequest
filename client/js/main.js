 const v = {
    audio:null,
    uid:null,
    uidBottom:document.getElementById('userid'),
    requestOpen:true
 };
 let locations = [];
 //important points
let locationsImportant = [
  { lat:0, lon:0, texture:"/pics/null.png", color:0x00ff00, type:"plane" }, //null island
  { lat: 39.15837166021878, lon: -76.89932926112813, texture:"/pics/logo.png", color:null, type:"plane", width: 1.35, height: 0.5}, //apl center
  { lat: 39.15837166021878, lon: -76.89932926112813, texture:null, color:0x00c3ff, type:null }
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

//values seem to be reflected the wrond direction due to something in animation

const points = [];

locations.forEach(location => {
    let pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const pointGeometry = new THREE.SphereGeometry(0.1, 16, 16); // Small marker
    if (location.lat ==0 && location.lon ==0) {
        pointMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); //null island
    }
    const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
    pointMesh.frustumCulled = false;
    scene.add(pointMesh);
    points.push({ mesh: pointMesh, lat: location.lat, lon: location.lon });
});


locationsImportant.forEach(location => {
  let pointTexture = location.texture || null;
  let pointColor = location.color || 0x00FFFFFF;
  let pointGeometry, pointMaterial;
  let transparency = false;
  if (location.type === "plane") {
    let planeWidth = location.width || 0.5;
    let planeHeight = location.height || 0.5;
    pointGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
  } else {
    pointGeometry = new THREE.SphereGeometry(0.1, 16, 16);
  }
  let pointTextureMap;
  if (pointTexture) {
    pointTextureMap = new THREE.TextureLoader().load(pointTexture);
    transparency = true;
  }
  pointMaterial = new THREE.MeshStandardMaterial({
    color: pointColor,
    map: pointTextureMap,
    transparent: transparency, // Enable transparency
    opacity: 1, // Full opacity for texture
    emissive: 0x000000,
    emissiveIntensity: 0.3,
    side: THREE.FrontSide
  });
  
  const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
  pointMesh.frustumCulled = false;
  scene.add(pointMesh);
  points.push({ mesh: pointMesh, lat: location.lat, lon: location.lon });
});

 // Lighting
 const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
 scene.add(ambientLight);

 const pointLight = new THREE.PointLight(0xffffff, 1);
 pointLight.position.set(10, 10, 10);
 scene.add(pointLight);

 // Camera position
 camera.position.z = 15;

 // Animation loop
 let angle = 0;
 const toRadians = (deg) => THREE.MathUtils.degToRad(deg);
 const fixLatitude = (lat) => /*90 -*/ lat;
 const fixLong = (long) => /*270 +*/ -long;
 const animate = () => {
    requestAnimationFrame(animate);

earth.rotation.y += 0.002;

points.forEach(point => {
  const latRad = toRadians(fixLatitude(point.lat));
  const lonRad = toRadians(fixLong(point.lon));
  const currentLonRad = lonRad - earth.rotation.y;

  const x = radius * Math.cos(latRad) * Math.cos(currentLonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.sin(currentLonRad);

  point.mesh.position.set(x, y, z);
  let outwardVector = new THREE.Vector3(x, y, z).normalize();
  point.mesh.lookAt(outwardVector.add(point.mesh.position));  // Rotate the plane to face the Earth if it's a plane
});

renderer.render(scene, camera);
 };

 animate();

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
      if (validateLatLong(input1.value, input2.value)) {
        latlongSubmit(input1.value, input2.value);
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
    if (lon && lat) {
      // Submit request and write to the database
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