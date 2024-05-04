import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

let scene, camera, renderer;
let playButton;
let mixer1, mixer2, mixer1Hand, mixer2Hand, animations, animations2, animationsHand, animations2Hand;
let clock = new THREE.Clock();
let numModels = 2; // Change as needed
// Array to store all mixers
let allMixers = [];
let modelsList = []; // List to store instantiated models
let handsList = [];

init();
animate();

function init() {
    // Set up scene
    scene = new THREE.Scene();

    // Set up camera
    const width = window.innerWidth / 30; // Adjust the width of the camera view
    const height = window.innerHeight / 30; // Adjust the height of the camera view
    const near = 0.1; // Near clipping plane
    const far = 1000; // Far clipping plane
    camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, near, far);
    camera.position.set(0, 8, 35); // Move the camera to the desired position
    scene.add(camera); // Add the camera to the scene

    // Set up renderer with cyan background
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x00ffff); // Set background color to cyan
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Load 3D model (replace 'model.fbx' with your model)
    const loader = new FBXLoader();
    // Create a loader instance
    const loader2 = new FBXLoader();
    loader.load(
        'https://mouvmnt.com/models/KeyToy_Animated.fbx',
        function (keyToyObject) {
            // Hide loading screen
            loader2.load(
                'https://mouvmnt.com/models/KeyToy_Hand.fbx',
                function (handObject) {
                    // Hide loading screen
                    document.getElementById('loading').style.display = 'none';

                    // Show play button
                    document.getElementById('playButton').style.display = 'block';
                    playButton = document.getElementById('playButton');
                    playButton.addEventListener('click', function () {
                        // Remove play button
                        playButton.remove();

                        placeModels(keyToyObject);
                        placeHands(handObject);
                    });
                },
                function (xhr) {
                    //console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                },
                function (error) {
                    // Error callback
                    console.error('Error loading model:', error);
                }
            );

        },
        function (xhr) {

            //console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            // Error callback
            console.error('Error loading model:', error);
        }
    );

    // Set up lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    // Resize handler
    window.addEventListener('resize', onWindowResize);
}

function placeModels(model) {
    for (let i = 0; i < numModels; i++) {
        const clonedModel = model.clone();

        // Clone animations and add them to the cloned model
        if (model.animations && model.animations.length > 0) {
            clonedModel.animations = [];
            model.animations.forEach(animation => {
                clonedModel.animations.push(animation.clone());
            });
        }
        if (i === 0) {
            // Position first model
            clonedModel.position.set(-15, 0, 10); // Set x position to -5
            clonedModel.rotateY(-Math.PI / 5);

        } else {
            // Position second model
            clonedModel.position.set(15, 0, 10); // Set x position to 5
            clonedModel.rotateY(-Math.PI / 5);
        }
        scene.add(clonedModel);
        // Add cloned model to the list
        modelsList.push(clonedModel);
    }

    // Check if the first model has animations
    if (modelsList.length > 0) {
        const firstModel = modelsList[0];
        const secondModel = modelsList[1];
        animations = firstModel.animations;
        animations2 = secondModel.animations;
        if (animations && animations.length > 0) {
            //console.log("Animations found for the first model:", animations);
            mixer1 = new THREE.AnimationMixer(firstModel);
            allMixers.push(mixer1);
            // Filter out position and Z rotation tracks from the animation
            animations[0].tracks = animations[0].tracks.filter(track => {
                if (track.name.includes('.position')) return false; // Exclude position tracks
                if (track.name.includes('Keytoy.quaternion')) {
                    const values = track.values;
                    for (let i = 0; i < values.length; i += 4) {
                        // Access quaternion components
                        const xValue = values[i];
                        const yValue = values[i + 1];
                        const zValue = values[i + 2];
                        const wValue = values[i + 3];

                        // Create quaternion from current values
                        const quaternion = new THREE.Quaternion(xValue, yValue, zValue, wValue);

                        // Convert desired rotation (-Math.PI / 5 on Y-axis) to quaternion
                        const desiredRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 5, 0, 'XYZ'));

                        // Combine current quaternion with desired rotation
                        const finalQuaternion = quaternion.multiply(desiredRotation);

                        // Set the modified quaternion back to the track values
                        values[i] = finalQuaternion.x;
                        values[i + 1] = finalQuaternion.y;
                        values[i + 2] = finalQuaternion.z;
                        values[i + 3] = finalQuaternion.w;
                    }
                }
                return true;
            });
            //Play animation
            const action = mixer1.clipAction(animations[0]);
            action.play();
            //console.log("The first animation is played on the first model.");
        } else {
            //console.log("No animations found for the first model.");
        }

        if (animations2 && animations2.length > 0) {
            //console.log("Animations found for the second model:", animations2);
            mixer2 = new THREE.AnimationMixer(secondModel);
            allMixers.push(mixer2);
            // Filter out position and Z rotation tracks from the animation
            animations2[0].tracks = animations2[0].tracks.filter(track => {
                if (track.name.includes('.position')) return false; // Exclude position tracks
                if (track.name.includes('Keytoy.quaternion')) {
                    const values = track.values;
                    for (let i = 0; i < values.length; i += 4) {
                        // Access quaternion components
                        const xValue = values[i];
                        const yValue = values[i + 1];
                        const zValue = values[i + 2];
                        const wValue = values[i + 3];

                        // Create quaternion from current values
                        const quaternion = new THREE.Quaternion(xValue, yValue, zValue, wValue);

                        // Convert desired rotation (-Math.PI / 5 on Y-axis) to quaternion
                        const desiredRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 5, 0, 'XYZ'));

                        // Combine current quaternion with desired rotation
                        const finalQuaternion = quaternion.multiply(desiredRotation);

                        // Set the modified quaternion back to the track values
                        values[i] = finalQuaternion.x;
                        values[i + 1] = finalQuaternion.y;
                        values[i + 2] = finalQuaternion.z;
                        values[i + 3] = finalQuaternion.w;
                    }
                }
                return true;
            });
            //Play animation
            const action = mixer2.clipAction(animations2[0]);
            action.play();
            //console.log("The first animation is played on the first model.");
        } else {
            //console.log("No animations found for the first model.");
        }
    }

}


function placeHands(model) {
    for (let i = 0; i < numModels; i++) {
        const clonedHand = model.clone();

        // Clone animations and add them to the cloned model
        if (model.animations && model.animations.length > 0) {
            clonedHand.animations = [];
            model.animations.forEach(animation => {
                clonedHand.animations.push(animation.clone());
            });
        }
        if (i === 0) {
            // Position first model
            clonedHand.position.set(-22, 3, 25); // Set x position to 5
            clonedHand.rotateY(-Math.PI / 1.6);
        } else {
            // Position second model
            clonedHand.position.set(8, 3, 25); // Set x position to 5
            clonedHand.rotateY(-Math.PI / 1.6);
        }
        scene.add(clonedHand);
        // Add cloned model to the list
        handsList.push(clonedHand);
    }
    if (handsList.length > 0) {
        const firstHand = handsList[0];
        const secondHand = handsList[1];
        animationsHand = firstHand.animations;
        animations2Hand = secondHand.animations;
        if (animationsHand && animationsHand.length > 0) {
            // console.log("Animations found for the first hand model:", animationsHand);
            mixer1Hand = new THREE.AnimationMixer(firstHand);
            allMixers.push(mixer1Hand);
            //Play animation
            const action = mixer1Hand.clipAction(animationsHand[0]);
            action.play()
            // Filter out position and Z rotation tracks from the animation
            // animationsHand[0].tracks = animationsHand[0].tracks.filter(track => {
            //     if (track.name.includes('.position')) return false; // Exclude position tracks
            //     if (track.name.includes('Keytoy.quaternion')) {
            //         const values = track.values;
            //         for (let i = 0; i < values.length; i += 4) {
            //             // Access quaternion components
            //             const xValue = values[i];
            //             const yValue = values[i + 1];
            //             const zValue = values[i + 2];
            //             const wValue = values[i + 3];

            //             // Create quaternion from current values
            //             const quaternion = new THREE.Quaternion(xValue, yValue, zValue, wValue);

            //             // Convert desired rotation (-Math.PI / 5 on Y-axis) to quaternion
            //             const desiredRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 5, 0, 'XYZ'));

            //             // Combine current quaternion with desired rotation
            //             const finalQuaternion = quaternion.multiply(desiredRotation);

            //             // Set the modified quaternion back to the track values
            //             values[i] = finalQuaternion.x;
            //             values[i + 1] = finalQuaternion.y;
            //             values[i + 2] = finalQuaternion.z;
            //             values[i + 3] = finalQuaternion.w;
            //         }
            //     }
            //     return true;
            // });

            //console.log("The first animation is played on the first model.");
        } else {
            //console.log("No animations found for the first model.");
        }

        if (animations2Hand && animations2Hand.length > 0) {
            //console.log("Animations found for the second hand model:", animations2Hand);
            mixer2Hand = new THREE.AnimationMixer(secondHand);
            allMixers.push(mixer2Hand);
            //Play animation
            const action = mixer2Hand.clipAction(animations2Hand[0]);
            action.play();
            // Filter out position and Z rotation tracks from the animation
            // animations2Hand[0].tracks = animations2Hand[0].tracks.filter(track => {
            //     if (track.name.includes('.position')) return false; // Exclude position tracks
            //     if (track.name.includes('Keytoy.quaternion')) {
            //         const values = track.values;
            //         for (let i = 0; i < values.length; i += 4) {
            //             // Access quaternion components
            //             const xValue = values[i];
            //             const yValue = values[i + 1];
            //             const zValue = values[i + 2];
            //             const wValue = values[i + 3];

            //             // Create quaternion from current values
            //             const quaternion = new THREE.Quaternion(xValue, yValue, zValue, wValue);

            //             // Convert desired rotation (-Math.PI / 5 on Y-axis) to quaternion
            //             const desiredRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 5, 0, 'XYZ'));

            //             // Combine current quaternion with desired rotation
            //             const finalQuaternion = quaternion.multiply(desiredRotation);

            //             // Set the modified quaternion back to the track values
            //             values[i] = finalQuaternion.x;
            //             values[i + 1] = finalQuaternion.y;
            //             values[i + 2] = finalQuaternion.z;
            //             values[i + 3] = finalQuaternion.w;
            //         }
            //     }
            //     return true;
            // });

            //console.log("The first animation is played on the first model.");
        } else {
            //console.log("No animations found for the first model.");
        }

    }
}


function PlayAnimation() {
    //Play animation
    const action = mixer1Hand.clipAction(animationsHand[0]);
    action.play();
}


function onWindowResize() {
    const width = window.innerWidth / 30; // Adjust the width of the camera view
    const height = window.innerHeight / 30; // Adjust the height of the camera view

    // Update the camera's aspect ratio and size
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
}


function animate() {
    requestAnimationFrame(animate);
    // Update all mixers
    allMixers.forEach(mixer => {
        mixer.update(clock.getDelta());
    });

    renderer.render(scene, camera);
}

