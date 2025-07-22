// === setup ===

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// === Input ===
const keys = {};
const keyJustPressed = {};

window.addEventListener("keydown", (e) => {
  if (!keys[e.key]) {
    keyJustPressed[e.key] = true; // only fires if key wasn't already down
  }
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});


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



// === Dfine the dialogues ===

const dialogues = {
  wall: [
    "This is a wall.",
    "You just tried to talk to a wall.",
    "You okay, champ?",
  ],

  oldTree: [
    "This is one very old tree.",
    "Local folktales say it's been here for 700 years.",
    "...",
    "I'll remember this. It might help later.",
  ],
};






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

let oldTree = {
  x: 200,
  y: 300,
  width: 20,
  height: 100,
  color: 'brown'
}

// === functions ===

const DialogueManager = {
  lines: [],
  currentLine: 0,
  currentChar: 0,
  visible: false,
  x: 50,
  y: 300,
  width: 400,
  height: 100,
  font: "16px serif",
  speed: 30,
  lastCharTime: 0,
  onComplete: null,

  start(lines, onComplete = () => {}) {
    this.lines = lines;
    this.currentLine = 0;
    this.currentChar = 0;
    this.visible = true;
    this.onComplete = onComplete;
  },

  update(time) {
    if (!this.visible) return;
    if (time - this.lastCharTime > this.speed) {
      this.currentChar++;
      this.lastCharTime = time;
      if (this.currentChar > this.lines[this.currentLine].length) {
        this.currentChar = this.lines[this.currentLine].length;
      }
    }
  },

  draw() {
    if (!this.visible) return;
    ctx.fillStyle = "black";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = "white";
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.font = this.font;
    ctx.fillStyle = "white";
    ctx.fillText(
      this.lines[this.currentLine].substring(0, this.currentChar),
      this.x + 10,
      this.y + 30
    );
  },

  nextLine() {
    if (!this.visible) return;
    if (this.currentChar < this.lines[this.currentLine].length) {
      this.currentChar = this.lines[this.currentLine].length;
    } else if (this.currentLine < this.lines.length - 1) {
      this.currentLine++;
      this.currentChar = 0;
    } else {
      this.visible = false;
      this.onComplete?.();
    }
  },
};

window.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    DialogueManager.nextLine();
  }
});





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



function resetInputFlags() {
  for (let key in keyJustPressed) {
    keyJustPressed[key] = false;
  }
}



// === Rendering functions ===

function update(dt) {
  if (DialogueManager.visible) return; // freeze player movement
  moveBody("ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", playerValues, dt);

  if (isColliding(playerValues, wall) && keyJustPressed["z"]) {
    console.log("Collision detected!");
    DialogueManager.start(dialogues.wall);
  }

  if (isColliding(playerValues, oldTree) && keyJustPressed["z"]) {
    console.log("You found an old tree!");
    DialogueManager.start(dialogues.oldTree);
  }

  resetInputFlags();
}

function draw(time = performance.now()) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawCharImage(playerValues, playerImage);
  drawCharBody(wall);
  drawCharBody(oldTree);




  DialogueManager.update(time);
  DialogueManager.draw();
}

// === Go! ===
gameLoop();
