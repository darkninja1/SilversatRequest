 const v = {
    audio:null,
    uid:null
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
    v.audio.src = "/pics/"+audio; // make sure to move this later to different folder
    v.audio.loop = true; 
    v.audio.volume = 0.5;
    v.audio.load();
    v.audio.play();
};


//-------------------------------------------------------------------------------------------
// this should be deleted when adding the request name input pop up that will appear first
// the loop audio will be triggered when name input is submitted (store in local storage as precaution)
//update the UID store UID as variable under v.uid
document.body.onclick = () => {
    loopAudio("bgmusic.mp3");
};