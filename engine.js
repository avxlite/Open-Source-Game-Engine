// === setup ===

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// === Input ===
const keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

// === Game Loop ===
let lastTime = 0;
function gameLoop(time = 0) {
  const delta = (time - lastTime) / 1000;
  lastTime = time;

  update(delta);
  draw();

  requestAnimationFrame(gameLoop);
}
/*|||||||||||||||||||||||

 === Game State ===

||||||||||||||||||||||||||*/

 // === Defining the images ===

const playerImage = new Image();
playerImage.src = 'images/testchar.png';




// === Loading the images ===

let playerImageLoaded = false;

playerImage.onload = () => {
  playerImageLoaded = true;
}


// === Define the objects ===

let playerValues ={
  x: 100,
  y: 100,
  width: 50,
  height: 50,
  color: 'white',
  speed: 200 // pixels per second
}

let wall = {
  x: 300,
  y: 100,
  width: 100,
  height: 100,
  color: 'red'
};

// === functions ===

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}


function moveBody(upkey, downkey, leftkey, rightkey, char, dt) {
  if (keys[upkey]) char.y -= char.speed * dt;
  if (keys[downkey]) char.y += char.speed * dt;
  if (keys[leftkey]) char.x -= char.speed * dt;
  if (keys[rightkey]) char.x += char.speed * dt;
} 

function drawCharImage(char, img) {
  if (playerImageLoaded) {
    ctx.drawImage(img, char.x, char.y, char.width, char.height);
  }
}

function drawCharBody(char) {
  ctx.fillStyle = char.color;
  ctx.fillRect(char.x, char.y, char.width, char.height);
}




// === Rendering functions ===

function update(dt) {
  moveBody('ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', playerValues, dt);

  if (isColliding(playerValues, wall)) {console.log('Collision detected!');}

}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawCharImage(playerValues, playerImage);
  drawCharBody(wall);
}

// === Go! ===
gameLoop();
