let scene, camera, renderer;
let playButton;

init();

function init() {
    // Set up scene
    scene = new THREE.Scene();

    // Set up camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Set up renderer with cyan background
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x00ffff); // Set background color to cyan
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Load 3D model (replace 'model.fbx' with your model)
    const loader = new THREE.FBXLoader();
    loader.load(
        'KeyToy_Animated.fbx',
        function (object) {
            // Hide loading screen
            document.getElementById('loading').style.display = 'none';

            // Show play button
            document.getElementById('playButton').style.display = 'block';
            playButton = document.getElementById('playButton');
            playButton.addEventListener('click', function () {
                // Function to position 3D models
                placeModels(object);
            });

            // Add loaded object to the scene
            scene.add(object);
        },
        function (xhr) {
            // Progress callback
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            // Error callback
            console.error('Error loading model:', error);
        }
    );

    // Set up lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    // Resize handler
    window.addEventListener('resize', onWindowResize);
}

function placeModels(model) {
    // Place models in equidistant positions
    const numModels = 5; // Change as needed
    const angleStep = (Math.PI * 2) / numModels;
    const distance = 5; // Change as needed

    for (let i = 0; i < numModels; i++) {
        const clonedModel = model.clone();
        const angle = i * angleStep;
        clonedModel.position.set(Math.cos(angle) * distance, 0, Math.sin(angle) * distance);
        scene.add(clonedModel);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
