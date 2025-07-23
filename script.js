import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, model;
const canvas = document.getElementById('robot-canvas');

let camPos = { x: 0, y: 0, z: 5 };
let lookAt = { x: 0, y: 0, z: 0 };
let modelScale = 0.4;

let autoRotate = false; // Default to OFF
let shadowPlane; // Store globally for theme switching

function setAutoRotate(on) {
  autoRotate = on;
  const toggle = document.getElementById('rotate-toggle-btn');
  toggle.checked = on;
  
}

function setThemeMode(isNight) {
  const body = document.body;
  const label = document.getElementById('theme-toggle-label');
  if (isNight) {
    body.classList.add('night-mode');
    label.textContent = 'Night Mode';
    if (shadowPlane) shadowPlane.material.color.set(0x222222); // dark for night
  } else {
    body.classList.remove('night-mode');
    label.textContent = 'Day Mode';
    if (shadowPlane) shadowPlane.material.color.set(0xffffff); // white for day
  }
}

function init() {
  scene = new THREE.Scene();
  scene.background = null;

  const width = window.innerWidth;
  const height = window.innerHeight;

  camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
  camera.position.set(camPos.x, camPos.y, camPos.z);
  camera.lookAt(lookAt.x, lookAt.y, lookAt.z);

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputEncoding = THREE.sRGBEncoding;

  // Improved lighting for more vibrant colors
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x888888, 1.3);
  hemiLight.position.set(0, 10, 0);
  scene.add(hemiLight);

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight1.position.set(5, 10, 7.5);
  dirLight1.castShadow = true;
  dirLight1.shadow.mapSize.width = 1024;
  dirLight1.shadow.mapSize.height = 1024;
  dirLight1.shadow.camera.near = 1;
  dirLight1.shadow.camera.far = 20;
  scene.add(dirLight1);

  // Add a second directional light from the opposite side
  const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight2.position.set(-7, 6, -5);
  scene.add(dirLight2);

  // Add a subtle ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
  scene.add(ambientLight);

  // White shadow plane under model (make it very large to cover the whole screen)
  const shadowPlaneGeometry = new THREE.PlaneGeometry(40, 40); // Large enough to cover viewport
  const shadowPlaneMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  shadowPlane = new THREE.Mesh(shadowPlaneGeometry, shadowPlaneMaterial);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -1.1;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);


  const gltfLoader = new GLTFLoader();
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Progress bar elements
  const progressBar = document.getElementById('progress-bar');
  const progressBarInner = document.getElementById('progress-bar-inner');
  let progressBarLabel = document.getElementById('progress-bar-label');
  if (!progressBarLabel) {
    progressBarLabel = document.createElement('span');
    progressBarLabel.id = 'progress-bar-label';
    progressBar.appendChild(progressBarLabel);
  }

  // function updateProgressBar(percent) {
  //   progressBarInner.style.width = percent + '%';
  //   progressBarLabel.textContent = 'LOADING... ' + Math.floor(percent) + '%';
  //   if (percent >= 100) {
  //     progressBar.style.display = 'none';
  //     document.getElementById('explore-btn').style.display = 'block';
  //   }
  // }

  // Load GLB model
  gltfLoader.load('model/boston.glb', (gltf) => {
    model = gltf.scene;
    model.position.set(0, -1, 0);
    model.scale.set(modelScale, modelScale, modelScale);
    model.rotation.set(0, 0, 0);
    scene.add(model);
    animate();
  },  // Progress callback
  (progress) => {
    var percent = progress.loaded / progress.total * 100;
    // updateProgressBar(percent);
  },
  // Error callback
  (error) => {
    console.error('Error loading GLB model:', error);
  });

  var i = 0;
  function move() {
    if (i == 0) {
      i = 1;
      var elem1 = document.getElementById("progress-bar-inner");
      var elem2 = document.getElementById("progress-bar-label");
      var width = 10;
      var id = setInterval(frame, 10);
      function frame() {
        if (width >= 100) {
          clearInterval(id);
          i = 0;
          progressBar.style.display = 'none';
          document.getElementById('explore-btn').style.display = 'block';
        } else {
          width++;
          elem1.style.width = width + "%";
          elem2.textContent = 'LOADING...' + width + "%";
        }
      }
    }
  }
  move()
  

  
  

  // Add toggle button logic
  const toggle = document.getElementById('rotate-toggle-btn');
  toggle.addEventListener('change', (e) => {
    console.log('Toggle button changed:', e.target.checked);
    setAutoRotate(e.target.checked);
  });
  setAutoRotate(false);

  const themeToggle = document.getElementById('theme-toggle-btn');
  themeToggle.addEventListener('change', (e) => {
    setThemeMode(themeToggle.checked);
  });
  setThemeMode(false);

  // Add click event to explore button to hide overlay
  var exploreBtn = document.getElementById('explore-btn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', function() {
      var loaderOverlay = document.getElementById('loader-overlay');
      if (loaderOverlay) loaderOverlay.style.display = 'none';
    });
  }
}

function animate() {
  requestAnimationFrame(animate);
  
  if (model) {
    // Keep model scale consistent
    model.scale.set(modelScale, modelScale, modelScale);
    
    // Always keep model upright
    model.rotation.x = 0;
    // Handle auto-rotation
    if (autoRotate) {
      model.rotation.y += 0.008;
      // Optional: Add some debugging to see if rotation is happening
      if (Math.floor(model.rotation.y * 100) % 100 === 0) {
        console.log('Model rotating, Y rotation:', model.rotation.y);
      }
    }
  } else {
    // Debug: Check if model is not loaded
    console.log('Model not loaded yet, autoRotate:', autoRotate);
  }
  
  renderer.render(scene, camera);
}

function onWindowResize() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

window.addEventListener('resize', onWindowResize);

init();

// To set your own cinematic camera angle:
// camera.position.set(x, y, z);
// camera.lookAt(targetX, targetY, targetZ);
