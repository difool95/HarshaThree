import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';


const soundURL = 'Do_this.mp3';
var scene, camera, renderer;
var playButton;
var keyMixer, keyMixer2, mixer1, mixer11, mixer2, mixer21, mixer1Hand, mixer2Hand;
var keyAnimations, keyAnimations2, animations, animations2, animationsHand, animations2Hand;
var numModels = 2; // Change as needed

var keysList = [];
var modelsList = []; // List to store instantiated models
var handsList = [];
var clock = new THREE.Clock();
var clock2 = new THREE.Clock();
var clock3 = new THREE.Clock();
var clock4 = new THREE.Clock();
var clock5 = new THREE.Clock();
var clock6 = new THREE.Clock();
var clock7 = new THREE.Clock();
var clock8 = new THREE.Clock();

let audio;
let initialPosition = new THREE.Vector3(8, 0, 10);
let destinationPosition = new THREE.Vector3(15, 1, 15);
let arrowHelper1 = null;
// Set up raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
// Mouse variables
let mouseDown = false;
let mouseX = 0,
    mouseY = 0;

let step1 = false;
let step2 = false;
let step3 = false;
let step4 = false;
// Event listeners for mouse down, move, and up
document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mouseup', onMouseUp);
// Create a video element
var video = document.createElement('video');
video.src = 'rotatinArrow.webm';
video.autoplay = true;
video.loop = true;
video.muted = true; // Ensure autoplay works on most browsers
video.playsinline = true; // Enable inline playback on mobile devices

// Create a video texture
var videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.format = THREE.RGBAFormat; // Enable transparency
var planeMesh;

//(13.16,5.9,30) (14, 5.2, 29.4) (13.9, 4, 29.4) (13, 3.5, 30.1) (12.3, 4.06, 30.6) (12.1, 5, 30.75) (12.6, 5.8, 30.43)
const positions = [
    new THREE.Vector3(13.16, 5.9, 30),
    new THREE.Vector3(14, 5.2, 29.4),
    new THREE.Vector3(13.9, 4, 29.4),
    new THREE.Vector3(13, 3.5, 30.1),
    new THREE.Vector3(12.3, 4.06, 30.6),
    new THREE.Vector3(12.1, 5, 30.75),
    new THREE.Vector3(12.6, 5.8, 30.43)
];
// Set the tolerance distance for considering the mouse close to a point
const tolerance = 0.5; // Adjust as needed

let currentStep = 0; // Current step in the sequence


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

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xe5e8dc); // Set background color to cyan
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    // Load 3D model (replace 'model.fbx' with your model)
    const loader = new FBXLoader();

    loader.load(
        'untitled.fbx',
        function (keyToyObject) {
            // Hide loading screen
            loader.load(
                'KeyToy_Hand.fbx',
                function (handObject1) {
                    loader.load(
                        'KeyToy_Hand.fbx',
                        function (handObject2) {
                            loader.load(
                                'key.fbx',
                                function (keyObject) {
                                    // Hide loading screen
                                    document.getElementById('loading').style.display = 'none';

                                    // Show play button
                                    document.getElementById('playButton').style.display = 'block';
                                    playButton = document.getElementById('playButton');
                                    playButton.addEventListener('click', function () {
                                        // Remove play button
                                        playButton.remove();
                                        //DISABLE KEY NOT USED
                                        keyToyObject.children[1].children[0].visible = false;

                                        placeKeyModels(keyObject);
                                        placeModels(keyToyObject);
                                        placeHand(handObject1);
                                        placeHand2(handObject2);
                                        PlayIntroductionStep();
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
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);
    addRotatingVideo();
    // Resize handler
    window.addEventListener('resize', onWindowResize);
}
function addRotatingVideo() {
    // Create a material with the video texture and transparency
    var material = new THREE.MeshBasicMaterial({ map: videoTexture, transparent: true, color: 0x26448d });

    // Create a plane geometry
    var planeGeometry = new THREE.PlaneGeometry(3.5, 3.5); // Adjust size as needed

    // Create a mesh with the geometry and material
    planeMesh = new THREE.Mesh(planeGeometry, material);
    // Set the position of the plane mesh
    planeMesh.position.set(13.2, 4.7, 30);

    // Rotate the plane mesh
    planeMesh.rotation.y = Math.PI / 5; // Rotate 36 degrees around the y-axis
    // Add the mesh to the scene
    scene.add(planeMesh);
    planeMesh.visible = false;
    video.play();

}

function placeKeyModels(model) {
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
            clonedModel.position.set(-14.5, 0.9, 10); // Set x position to -5
            clonedModel.rotateY(-Math.PI / 5);
        } else {
            // Position second model
            clonedModel.position.set(15.5, 0.9, 10); // Set x position to 5
            clonedModel.rotateY(-Math.PI / 5);
        }
        scene.add(clonedModel);
        // Add cloned model to the list
        keysList.push(clonedModel);
    }

    // Check if the first model has animations
    if (keysList.length > 0) {
        var firstModel = keysList[0];
        var secondModel = keysList[1];
        keyAnimations = firstModel.animations;
        keyAnimations2 = secondModel.animations;
        if (keyAnimations && keyAnimations.length > 0) {
            //console.log("Animations found for the first model:", animations);
            keyMixer = new THREE.AnimationMixer(firstModel);
            // Filter out position and Z rotation tracks from the animation
            keyAnimations[0].tracks = keyAnimations[0].tracks.filter(track => {
                if (track.name.includes('.position')) return false; // Exclude position tracks

                return true;
            });
            //console.log("The first animation is played on the first model.");
        } else {
            //console.log("No animations found for the first model.");
        }

        if (keyAnimations2 && keyAnimations2.length > 0) {
            //console.log("Animations found for the second model:", animations2);
            keyMixer2 = new THREE.AnimationMixer(secondModel);
            // Filter out position and Z rotation tracks from the animation
            keyAnimations2[0].tracks = keyAnimations2[0].tracks.filter(track => {
                if (track.name.includes('.position')) return false; // Exclude position tracks
                return true;
            });
            //console.log("The first animation is played on the first model.");
        } else {
            //console.log("No animations found for the first model.");
        }
    }
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
    audio = new THREE.Audio(listener);
    scene.add(listener);

    audioLoader.load(soundURL, function (buffer) {
        audio.setBuffer(buffer);
        audio.setLoop(false);
        audio.setVolume(1);
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
        const actionDuck1 = mixer1.clipAction(animations[1]);
        actionDuck1.setLoop(THREE.LoopOnce);
        actionDuck1.clampWhenFinished = true;

        mixer11 = new THREE.AnimationMixer(duckModel);
        const actionDuck11 = mixer11.clipAction(animations[9]);
        actionDuck11.setLoop(THREE.LoopOnce);
        actionDuck11.clampWhenFinished = true;

        const keyModel = keysList[0];
        keyMixer = new THREE.AnimationMixer(keyModel);
        const actionKey1 = keyMixer.clipAction(keyAnimations[0]);
        actionKey1.setLoop(THREE.LoopOnce);
        actionKey1.clampWhenFinished = true;


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
                    actionKey1.play();
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
            actionKey1.reset();
            actionKey1.play();
        }, 4000); // Pause animation after 2 seconds

        setTimeout(() => {
            // Resume animation after 3 seconds
            action.reset(); // Reset animation
            action.play(); // Start animation
            actionKey1.reset();
            actionKey1.play();
        }, 7000); // Resume animation after 3 seconds

        setTimeout(() => {
            // Restore child's initial rotation and position
            keyModel.visible = false;
            duckModel.children[1].children[0].visible = true;
            // Pause animation after 4 seconds
            action.paused = true;
            actionKey1.paused = true;
            actionDuck1.play();
            actionDuck11.play();
            mixer1.addEventListener('finished', () => {
                handModel.visible = false;
                actionDuck11.paused = true;
                playFirstStep();
            })
            animateToInitialPosition();
        }, 10000); // Pause animation after 4 seconds
    });
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
    handModel.position.set(8, 0, 10); // Set x position to -5
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




function playFirstStep() {
    step1 = true;
    audio.play();
    const startPosition = new THREE.Vector3(6, 2, 30);
    const endPosition = new THREE.Vector3(13, 4, 30);
    const duration = 3000; // Animation duration in milliseconds
    var hand2Model = handsList[1];
    hand2Model.visible = true;
    hand2Model.children[0].name = "hand2";
    hand2Model.position.copy(new THREE.Vector3(8, 0, 10));
    arrowHelper1 = createArrowHelper(startPosition, endPosition, 2.5, 1.5);
    scene.add(arrowHelper1);
    animateArrowHelper(arrowHelper1, startPosition, endPosition, duration);
}




function createArrowHelper(startPosition, endPosition, headLength, headWidth) {
    // Calculate direction vector from start to end
    const direction = new THREE.Vector3().copy(endPosition).sub(startPosition).normalize();

    // Calculate the length of the arrow (distance between start and end points)
    const length = startPosition.distanceTo(endPosition);

    // Create ArrowHelper with the calculated direction, length, headLength, and headWidth
    const arrowHelper = new THREE.ArrowHelper(direction, startPosition, length, 0x26448d, headLength, headWidth);

    return arrowHelper;
}

function animateArrowHelper(arrowHelper, startPosition, endPosition, duration) {
    const startTime = Date.now();

    function animatel() {
        const now = Date.now();
        const elapsedTime = (now - startTime) % duration;
        const t = elapsedTime / duration;

        // Interpolate scale
        const scaleFactor = Math.min(1, 2 * t); // Scale from 0 to 1 in the first half of the animation
        arrowHelper.scale.setScalar(scaleFactor);

        requestAnimationFrame(animatel);
    }

    animatel();
}



function playSecondStep() {
    step1 = false;
    //Play VFX three js
    congratsParticleEffect();
    // Pause animation at specific times
    setTimeout(() => {
        step2 = true;
        audio.play();
        planeMesh.visible = true;
    }, 4000); // Pause animation after 2 seconds
}

var count = 200;
var defaults = {
    origin: { y: 0.7 }
};

function fire(particleRatio, opts) {
    confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
    });
}
function congratsParticleEffect() {
    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });
    fire(0.2, {
        spread: 60,
    });
    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });

}

// Function to check if the mouse is close to a given Vector3 position
function isMouseCloseToPosition(mouse, position) {
    // Check if mouse is close to any position other than the current one
    for (let i = 0; i < positions.length; i++) {
        if (mouse.distanceTo(positions[i]) <= tolerance && currentStep == i) {
            return true;
        }
    }
    // Check if mouse is close to the current position
    // return mouse.distanceTo(position) <= tolerance;
}


function PlayFinalAnimation() {
    planeMesh.visible = false;
    congratsParticleEffect();
    const handModel = handsList[1];
    // Animation Hand
    mixer2Hand = new THREE.AnimationMixer(handModel);
    const action = mixer2Hand.clipAction(animations2Hand[0]);
    action.setLoop(THREE.LoopOnce);
    action.clampWhenFinished = true;
    action.play();

    const keyModel = keysList[1];
    keyMixer2 = new THREE.AnimationMixer(keyModel);
    const actionKey = keyMixer2.clipAction(keyAnimations2[0]);
    actionKey.setLoop(THREE.LoopOnce);
    actionKey.clampWhenFinished = true;
    actionKey.play();

    setTimeout(() => {
        //Play duck animation
        keysList[1].visible = false;
        handModel.visible = false;
        const duckModel = modelsList[1];
        duckModel.children[1].children[0].visible = true;
        mixer2 = new THREE.AnimationMixer(duckModel);
        const actionDuck2 = mixer2.clipAction(animations2[1]);
        actionDuck2.setLoop(THREE.LoopOnce);
        actionDuck2.clampWhenFinished = true;
        actionDuck2.play();

        mixer21 = new THREE.AnimationMixer(duckModel);
        const actionDuck21 = mixer21.clipAction(animations2[9]);
        actionDuck21.setLoop(THREE.LoopOnce);
        actionDuck21.clampWhenFinished = true;
        actionDuck21.play();

    }, 4000); // Resume animation after 3 seconds
}

function PlayAnimationStep() {
    planeMesh.visible = false;
    congratsParticleEffect();
    const handModel = handsList[1];
    // Animation Hand
    mixer2Hand = new THREE.AnimationMixer(handModel);
    const action = mixer2Hand.clipAction(animations2Hand[0]);
    action.setLoop(THREE.LoopOnce);
    action.clampWhenFinished = true;
    action.play();

    const keyModel = keysList[1];
    keyMixer2 = new THREE.AnimationMixer(keyModel);
    const actionKey = keyMixer2.clipAction(keyAnimations2[0]);
    actionKey.setLoop(THREE.LoopOnce);
    actionKey.clampWhenFinished = true;
    actionKey.play();

    setTimeout(() => {
        if (step3) {
            playThirdStep();
        }
        if (step4) {
            playFourthStep();
        }
    }, 4000); // Resume animation after 3 seconds
}

function playThirdStep() {
    audio.play();
    planeMesh.visible = true;
}


function playFourthStep() {
    audio.play();
    planeMesh.visible = true;
}

function onMouseDown(event) {
    // Update the mouse position
    mouseX = event.clientX;
    mouseY = event.clientY;

    // Set mouse position for raycasting
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Raycast to check for intersections
    raycaster.setFromCamera(mouse, camera);
    if (step1) {
        // Check if the ray intersects with the object
        if (handsList[1] != null) {
            const intersects = raycaster.intersectObjects([handsList[1].children[0]]);

            if (intersects.length > 0) {
                mouseDown = true;
                //DISABLE ARROW HELPER
                arrowHelper1.visible = false;
            }
        }
    }
    if (step2) {
        if (planeMesh != null) {
            mouseDown = true;
        }
    }

    if (step3) {
        if (planeMesh != null) {
            mouseDown = true;
        }
    }

    if (step4) {
        if (planeMesh != null) {
            mouseDown = true;
        }
    }
}

function onMouseMove(event) {
    if (mouseDown) {
        if (step1) {
            // Calculate the movement in screen space
            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;

            // Convert movement to world space (adjust the factor as needed)
            const movementX = deltaX * 0.03;
            const movementY = deltaY * 0.03;
            // Update object position
            handsList[1].position.x += movementX;
            handsList[1].position.y -= movementY; // Invert Y-axis for orthographic camera

            //NEED TO REACH // (15, 1, 15) HAND 2
            //"<"  ">
            if (handsList[1].position.x > 14 && handsList[1].position.x < 16 && handsList[1].position.y > 0 && handsList[1].position.y < 2) {
                handsList[1].position.copy(destinationPosition);
                playSecondStep();
            }
            mouseX = event.clientX;
            mouseY = event.clientY;
        }
        if (step2) {
            // Update the mouse position
            mouseX = event.clientX;
            mouseY = event.clientY;

            // Set mouse position for raycasting
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // Raycast to check for intersections
            raycaster.setFromCamera(mouse, camera);
            if (planeMesh != null) {
                //planeMesh.visible = false;
                //Check for intersections between the raycaster and the plane mesh
                const intersects = raycaster.intersectObject(planeMesh);
                // Check if the mouse is close to the current position
                if (intersects.length > 0) {
                    const intersectPoint = intersects[0].point;
                    if (isMouseCloseToPosition(intersectPoint, positions[currentStep])) {
                        // Move to the next step if the mouse is close to the current position
                        currentStep++;
                        // Check if all steps have been completed
                        if (currentStep === positions.length) {
                            step2 = false;
                            step3 = true;
                            PlayAnimationStep();
                            // Reset currentStep for future checks
                            currentStep = 0;
                        }
                    }
                    // else {
                    //     // Reset currentStep if the mouse is not close to the expected position
                    //     currentStep = 0;
                    // }
                }
                else {
                    currentStep = 0;
                }
            }
        }

        if (step3) {
            // Update the mouse position
            mouseX = event.clientX;
            mouseY = event.clientY;

            // Set mouse position for raycasting
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // Raycast to check for intersections
            raycaster.setFromCamera(mouse, camera);
            if (planeMesh != null) {
                //planeMesh.visible = false;
                //Check for intersections between the raycaster and the plane mesh
                const intersects = raycaster.intersectObject(planeMesh);
                // Check if the mouse is close to the current position
                if (intersects.length > 0) {
                    const intersectPoint = intersects[0].point;
                    if (isMouseCloseToPosition(intersectPoint, positions[currentStep])) {
                        // Move to the next step if the mouse is close to the current position
                        currentStep++;
                        // Check if all steps have been completed
                        if (currentStep === positions.length) {
                            step3 = false;
                            step4 = true;
                            PlayAnimationStep();
                            // Reset currentStep for future checks
                            currentStep = 0;
                        }
                    }
                    // else {
                    //     // Reset currentStep if the mouse is not close to the expected position
                    //     currentStep = 0;
                    // }
                }
                else {
                    currentStep = 0;
                }
            }
        }
        if (step4) {
            // Update the mouse position
            mouseX = event.clientX;
            mouseY = event.clientY;

            // Set mouse position for raycasting
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // Raycast to check for intersections
            raycaster.setFromCamera(mouse, camera);
            if (planeMesh != null) {
                //planeMesh.visible = false;
                //Check for intersections between the raycaster and the plane mesh
                const intersects = raycaster.intersectObject(planeMesh);
                // Check if the mouse is close to the current position
                if (intersects.length > 0) {
                    const intersectPoint = intersects[0].point;
                    if (isMouseCloseToPosition(intersectPoint, positions[currentStep])) {
                        // Move to the next step if the mouse is close to the current position
                        currentStep++;
                        // Check if all steps have been completed
                        if (currentStep === positions.length) {
                            step4 = false;
                            // PLAY END ANIMATION
                            PlayFinalAnimation();
                            // Reset currentStep for future checks
                            currentStep = 0;
                        }
                    }
                    // else {
                    //     // Reset currentStep if the mouse is not close to the expected position
                    //     currentStep = 0;
                    // }
                }
                else {
                    currentStep = 0;
                }
            }
        }

    }
}



function onMouseUp(event) {
    if (step1) {
        arrowHelper1.visible = true;
        handsList[1].position.copy(initialPosition);
        audio.play();
    }
    if (step2) {
        currentStep = 0;
        //planeMesh.visible = true;
    }
    if (step3) {
        currentStep = 0;
        //planeMesh.visible = true;
    }
    if (step4) {
        currentStep = 0;
        //planeMesh.visible = true;
    }
    mouseDown = false;
}

function animate() {
    requestAnimationFrame(animate);
    // Update video texture
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        videoTexture.needsUpdate = true;
    }
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
    if (keyMixer) {
        keyMixer.update(clock5.getDelta());
    }
    if (keyMixer2) {
        keyMixer2.update(clock6.getDelta());
    }

    if (mixer11) {
        mixer11.update(clock7.getDelta());
    }
    if (mixer21) {
        mixer21.update(clock8.getDelta());
    }

    renderer.render(scene, camera);
}
