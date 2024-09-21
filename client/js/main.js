 const v = {
    audio:null,
    uid:null,
    uidBottom:document.getElementById('userid'),
    enable:false
 };
 // Setup scene, camera, renderer
 const scene = new THREE.Scene();
 const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
 const renderer = new THREE.WebGLRenderer({ antialias: true });
 renderer.setSize(window.innerWidth, window.innerHeight);
 document.getElementById("content").appendChild(renderer.domElement);

 // Create Earth sphere
 const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
 const earthTexture = new THREE.TextureLoader().load('/pics/earth-water.png');
 const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
 const earth = new THREE.Mesh(earthGeometry, earthMaterial);
 scene.add(earth);

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

 const animate = () => {
     requestAnimationFrame(animate);
     
     // Rotate the Earth
     earth.rotation.y += 0.002;  // slow Earth rotation

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
    input1.focus();
    let btn = document.createElement('button');
    btn.textContent = "Confirm";
    btn.classList.add('hover');
    btn.onclick = function() {uidAssign(input1);box.remove();};
    box.appendChild(btn);
    document.body.appendChild(box);
  };
const uidAssign = (input1) => {
    if (input1) {
        v.uid = input1.value;
        v.uidBottom.textContent = `UID: ${input1.value}`;
        loopAudio("bgmusic.mp3");
        v.enable = true;
    }
};

//-------------------------------------------------------------------------------------------
promptName();