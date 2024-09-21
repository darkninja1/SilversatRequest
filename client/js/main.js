 const v = {
    audio:null,
    uid:null,
    uidBottom:document.getElementById('userid'),
    enable:false,
    requestOpen:false
 };
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
 const locations = [
    { lat: 40.7128, lon: -74.0060 }, // New York City
    { lat: 34.0522, lon: -118.2437 }, // Los Angeles
    { lat: 51.5074, lon: -0.1278 }, // London
    { lat: 35.6895, lon: 139.6917 },// Tokyo
    { lat:0, lon:0} 
];
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
     
     // Rotate the Earth
     earth.rotation.y += 0.002;  
     points.forEach(point => {
        const latRad = toRadians(fixLatitude(point.lat));
        const lonRad = toRadians(fixLong(point.lon));
        const currentLonRad = lonRad - earth.rotation.y; 
        
        const x = radius * Math.cos(latRad) * Math.cos(currentLonRad);
        const y = radius * Math.sin(latRad);
        const z = radius * Math.cos(latRad) * Math.sin(currentLonRad);

        point.mesh.position.set(x, y, z);
    });
     // Render the scene
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
    btn.onclick = function() {uidAssign(input1);box.remove();};
    box.appendChild(btn);
    document.body.appendChild(box);
    input1.focus();
  };
const uidAssign = (input1) => {
    if (input1) {
        v.uid = input1.value;
        v.uidBottom.textContent = `UID: ${input1.value}`;
        loopAudio("bgmusic.mp3");
        v.enable = true;
    }
};
const promptLatLong = function() {
    if (v.requestOpen) {
      return;
    }
    v.requestOpen = true;
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