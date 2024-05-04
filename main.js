import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';


const soundURL = 'Do_this.mp3';
var scene, camera, renderer;
var playButton;
var mixer1, mixer2, mixer1Hand, mixer2Hand, animations, animations2, animationsHand, animations2Hand;
var numModels = 2; // Change as needed

var modelsList = []; // List to store instantiated models
var handsList = [];
var clock = new THREE.Clock();
var clock2 = new THREE.Clock();
var clock3 = new THREE.Clock();
var clock4 = new THREE.Clock();

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

    loader.load(
        'KeyToy_Animated.fbx',
        function (keyToyObject) {
            // Hide loading screen
            loader.load(
                'KeyToy_Hand.fbx',
                function (handObject1) {
                    loader.load(
                        'KeyToy_Hand.fbx',
                        function (handObject2) {
                            // Hide loading screen
                            document.getElementById('loading').style.display = 'none';

                            // Show play button
                            document.getElementById('playButton').style.display = 'block';
                            playButton = document.getElementById('playButton');
                            playButton.addEventListener('click', function () {
                                // Remove play button
                                playButton.remove();
                                placeModels(keyToyObject);
                                placeHand(handObject1);
                                placeHand2(handObject2);
                                PlayIntroductionStep();
                                //playNextStep();
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    // Resize handler
    window.addEventListener('resize', onWindowResize);
}

function placeModels(model) {
    for (let i = 0; i < numModels; i++) {
        var clonedModel = model.clone();

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
        var firstModel = modelsList[0];
        var secondModel = modelsList[1];
        animations = firstModel.animations;
        animations2 = secondModel.animations;
        if (animations && animations.length > 0) {
            //console.log("Animations found for the first model:", animations);
            mixer1 = new THREE.AnimationMixer(firstModel);
            // Filter out position and Z rotation tracks from the animation
            animations[0].tracks = animations[0].tracks.filter(track => {
                if (track.name.includes('.position')) return false; // Exclude position tracks
                if (track.name.includes('Keytoy.quaternion')) {
                    var values = track.values;
                    for (let i = 0; i < values.length; i += 4) {
                        // Access quaternion components
                        var xValue = values[i];
                        var yValue = values[i + 1];
                        var zValue = values[i + 2];
                        var wValue = values[i + 3];

                        // Create quaternion from current values
                        var quaternion = new THREE.Quaternion(xValue, yValue, zValue, wValue);

                        // Convert desired rotation (-Math.PI / 5 on Y-axis) to quaternion
                        var desiredRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 5, 0, 'XYZ'));

                        // Combine current quaternion with desired rotation
                        var finalQuaternion = quaternion.multiply(desiredRotation);

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

            //console.log("The first animation is played on the first model.");
        } else {
            //console.log("No animations found for the first model.");
        }

        if (animations2 && animations2.length > 0) {
            //console.log("Animations found for the second model:", animations2);
            mixer2 = new THREE.AnimationMixer(secondModel);
            // Filter out position and Z rotation tracks from the animation
            animations2[0].tracks = animations2[0].tracks.filter(track => {
                if (track.name.includes('.position')) return false; // Exclude position tracks
                if (track.name.includes('Keytoy.quaternion')) {
                    var values = track.values;
                    for (let i = 0; i < values.length; i += 4) {
                        // Access quaternion components
                        var xValue = values[i];
                        var yValue = values[i + 1];
                        var zValue = values[i + 2];
                        var wValue = values[i + 3];

                        // Create quaternion from current values
                        var quaternion = new THREE.Quaternion(xValue, yValue, zValue, wValue);

                        // Convert desired rotation (-Math.PI / 5 on Y-axis) to quaternion
                        var desiredRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 5, 0, 'XYZ'));

                        // Combine current quaternion with desired rotation
                        var finalQuaternion = quaternion.multiply(desiredRotation);

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

            //console.log("The first animation is played on the first model.");
        } else {
            //console.log("No animations found for the first model.");
        }
    }

}

function PlayIntroductionStep() {
    // Load sound
    const audioLoader = new THREE.AudioLoader();
    const listener = new THREE.AudioListener();
    const audio = new THREE.Audio(listener);
    scene.add(listener);

    audioLoader.load(soundURL, function (buffer) {
        audio.setBuffer(buffer);
        audio.setLoop(false);
        audio.setVolume(0.5);
        audio.play();

        // Show hand model
        const startPosition = new THREE.Vector3(-20, 1, 15);
        const endPosition = new THREE.Vector3(-15, 1, 15);
        const handModel = handsList[0];
        handModel.position.copy(startPosition);
        handModel.visible = true;

        const duckModel = modelsList[0];
        // Animate position
        const animationDuration = 1000; // Duration of animation in milliseconds
        const animationStartTime = Date.now();
        // Animation Hand
        mixer1Hand = new THREE.AnimationMixer(handModel);
        const action = mixer1Hand.clipAction(animationsHand[0]);
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;

        //Animation Duck
        mixer1 = new THREE.AnimationMixer(duckModel);
        const actionDuck1 = mixer1.clipAction(animations[0]);
        actionDuck1.setLoop(THREE.LoopOnce);
        actionDuck1.clampWhenFinished = true;


        function animatePosition() {
            const now = Date.now();
            const elapsedTime = now - animationStartTime;
            const t = Math.min(1, elapsedTime / animationDuration); // Normalize time between 0 and 1

            const newPosition = new THREE.Vector3().lerpVectors(startPosition, endPosition, t);
            handModel.position.copy(newPosition);

            if (t < 1) {
                requestAnimationFrame(animatePosition); // Continue animation until reaching the end
            } else {
                // Start animation after translation completes
                setTimeout(() => {
                    action.play();
                    actionDuck1.play();
                }, 200); // Delay animation start by 1 second
            }
        }

        function animateToInitialPosition() {
            // Define initial and final positions
            const startPosition = new THREE.Vector3(-15, 1, 15); // End position of the animation
            const endPosition = new THREE.Vector3(-20, 1, 15); // Start position of the animation

            // Calculate animation duration
            const animationDuration = 1000; // Duration of animation in milliseconds
            const animationStartTime = Date.now();

            // Define animation function
            function animate() {
                const now = Date.now();
                const elapsedTime = now - animationStartTime;
                const t = Math.min(1, elapsedTime / animationDuration); // Normalize time between 0 and 1

                // Interpolate position
                const newPosition = new THREE.Vector3().lerpVectors(startPosition, endPosition, t);
                handModel.position.copy(newPosition);

                // Continue animation until reaching the end
                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                }
            }

            // Start animation
            animate();
        }

        animatePosition();

        // Pause animation at specific times
        setTimeout(() => {
            // Pause animation after 1 second
            action.reset(); // Reset animation
            action.play(); // Start animation
            actionDuck1.reset();
            actionDuck1.play();
        }, 4000); // Pause animation after 2 seconds

        setTimeout(() => {
            // Resume animation after 3 seconds
            action.reset(); // Reset animation
            action.play(); // Start animation
            actionDuck1.reset();
            actionDuck1.play();
        }, 7000); // Resume animation after 3 seconds

        setTimeout(() => {
            // Pause animation after 4 seconds
            action.paused = true;
            actionDuck1.play();
            mixer1.addEventListener('finished', () => {
                handModel.visible = false;
                playNextStep();
            })
            animateToInitialPosition();
        }, 10000); // Pause animation after 4 seconds
    });
}

function playNextStep() {
    const startPosition = new THREE.Vector3(6, 2, 10);
    const endPosition = new THREE.Vector3(13, 4, 30);
    var hand2Model = handsList[1];
    hand2Model.visible = true;
    hand2Model.position.copy(new THREE.Vector3(8, 0, 10));


}


function placeHand(handModel) {
    // Position first model
    handModel.position.set(-15, 1, 20); // Set x position to -5
    handModel.rotateY(-Math.PI / 5);
    //handModel.visible = false;
    scene.add(handModel);
    handsList.push(handModel);

    if (handsList.length > 0) {
        var firstHand = handsList[0];
        animationsHand = firstHand.animations;
        if (animationsHand && animationsHand.length > 0) {
            mixer1Hand = new THREE.AnimationMixer(firstHand);
            //Play animation

            //console.log("The first animation is played on the first model.");
        } else {
            //console.log("No animations found for the first model.");
        }
    }
}


function placeHand2(handModel) {
    // Position first model
    handModel.position.set(8, 1, 10); // Set x position to -5
    handModel.rotateY(-Math.PI / 5);
    scene.add(handModel);
    handsList.push(handModel);

    var secondHand = handsList[1];
    animations2Hand = secondHand.animations;
    if (animations2Hand && animations2Hand.length > 0) {
        mixer2Hand = new THREE.AnimationMixer(secondHand);
        //Play animation

        //console.log("The first animation is played on the first model.");
    } else {
        //console.log("No animations found for the first model.");
    }

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
    if (mixer1) {
        mixer1.update(clock.getDelta());
    }
    if (mixer2) {
        mixer2.update(clock2.getDelta());
    }
    if (mixer1Hand) {
        mixer1Hand.update(clock3.getDelta());
    }
    if (mixer2Hand) {
        mixer2Hand.update(clock4.getDelta());
    }
    renderer.render(scene, camera);
}

