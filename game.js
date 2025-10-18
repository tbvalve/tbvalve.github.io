// SCENE SETUP
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 50);
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 8, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// LIGHT
const light = new THREE.PointLight(0xffffff, 1.2);
light.position.set(0, 10, 10);
scene.add(light);

// BALL
const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const ballMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00 });
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.y = 1.5;
scene.add(ball);

// PLATFORM TILES
const platformGeometry = new THREE.BoxGeometry(5, 0.5, 30);
const platformMaterial = new THREE.MeshStandardMaterial({ color: 0x1111ff, emissive: 0x1111ff });
const platforms = [];

for (let i = 0; i < 3; i++) {
  const platform = new THREE.Mesh(platformGeometry, platformMaterial.clone());
  platform.position.z = -i * 30;
  scene.add(platform);
  platforms.push(platform);
}

// OBSTACLES
const obstacles = [];
function createObstacle(zPos) {
  const obstacleGeo = new THREE.BoxGeometry(0.5, 1, 0.5);
  const obstacleMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000 });
  const obstacle = new THREE.Mesh(obstacleGeo, obstacleMat);
  obstacle.position.set((Math.random() - 0.5) * 4, 0.75, zPos);
  scene.add(obstacle);
  obstacles.push(obstacle);
}

// GAME VARIABLES
let speed = 0.4;
let leftPressed = false;
let rightPressed = false;

let velocityY = 0;
let gravity = -0.01;
let isFalling = false;

// CONTROLS
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = true;
  if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = true;
});
window.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = false;
  if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = false;
});

// RESET FUNCTION
function resetGame() {
  // Reset ball
  ball.position.set(0, 1.5, 0);
  velocityY = 0;
  isFalling = false;
  speed = 0.4;

  // Reset camera
  camera.position.set(0, 8, 20);

  // Reset platforms
  platforms.forEach((platform, index) => {
    platform.position.z = -index * 30;
  });

  // Remove old obstacles
  obstacles.forEach(ob => scene.remove(ob));
  obstacles.length = 0;
}

// ANIMATE
function animate() {
  requestAnimationFrame(animate);

  if (!isFalling) {
    ball.position.z -= speed;

    if (leftPressed) ball.position.x -= 0.1;
    if (rightPressed) ball.position.x += 0.1;

    if (Math.abs(ball.position.x) > 2.5) {
      isFalling = true;
    }
  } else {
    velocityY += gravity;
    ball.position.y += velocityY;

    if (ball.position.y < -5) {
      alert("💀 You fell off! Restarting...");
      resetGame();
    }
  }

  // Camera follows ball
  camera.position.z = ball.position.z + 10;
  camera.position.x = ball.position.x;
  camera.lookAt(ball.position);

  // Recycle platforms and add new obstacles
  platforms.forEach(platform => {
    if (platform.position.z - ball.position.z > 20) {
      platform.position.z -= 90;

      if (Math.random() < 0.6) {
        createObstacle(platform.position.z - 10);
      }
    }
  });

  // Move & remove obstacles
  obstacles.forEach((ob, i) => {
    if (ob.position.z > ball.position.z + 5) {
      scene.remove(ob);
      obstacles.splice(i, 1);
    }

    const dx = ob.position.x - ball.position.x;
    const dz = ob.position.z - ball.position.z;
    if (Math.abs(dx) < 0.5 && Math.abs(dz) < 0.5 && !isFalling) {
      alert("💥 You hit an obstacle! Restarting...");
      resetGame();
    }
  });

  renderer.render(scene, camera);
}

animate();

// HANDLE RESIZE
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
