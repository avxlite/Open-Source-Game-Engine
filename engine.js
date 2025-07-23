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

window.addEventListener("keydown", (e) => {
  if (!DialogueManager.visible) return;

  const current = DialogueManager.lines[DialogueManager.currentLine];

  if (typeof current === "string") {
    if (e.key === "Enter") DialogueManager.nextLine();
  } else if (current.question) {
    if (e.key === "ArrowDown") {
      DialogueManager.selectedOptionIndex =
        (DialogueManager.selectedOptionIndex + 1) % current.options.length;
    }
    if (e.key === "ArrowUp") {
      DialogueManager.selectedOptionIndex =
        (DialogueManager.selectedOptionIndex - 1 + current.options.length) %
        current.options.length;
    }
    if (e.key === "Enter") {
      // Trigger the selected consequence
      const chosen = current.options[DialogueManager.selectedOptionIndex];
      if (chosen.consequence) chosen.consequence();

      // Advance
      DialogueManager.currentLine++;
      DialogueManager.currentChar = 0;
      DialogueManager.selectedOptionIndex = 0;

      if (DialogueManager.currentLine >= DialogueManager.lines.length) {
        DialogueManager.visible = false;
        if (DialogueManager.onComplete) DialogueManager.onComplete();
      }
    }
  }
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

// === Global variables ===

let hasPushedWall = false;
let hasPickedUpScissors = false;






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
  wall_beforePush: [
    "You sense something behind this wall...",
    {
      question: "Push it?",
      options: [
        {
          text: "Yes",
          consequence: () => {
            hasPushedWall = true;
            DialogueManager.insertAfterCurrent([
              "You push it with all your strength.",
              "A secret passage creaks open!",
            ]);
          },
        },
        {
          text: "No",
          consequence: () => {
            DialogueManager.insertAfterCurrent([
              "You decide to leave it alone... for now.",
              "...",
            ]);
          },
        },
      ],
    },
  ],

  wall_afterPush: [
    "You've already pushed it.",
    "The secret door creaks in the distance.",
    "Maybe... it's still open?",
  ],

  oldTree: [
    "This is one very old tree.",
    "Local folktales say it's been here for 700 years.",
    "...",
    "I'll remember this. It might help later.",
  ],

  scissors: [
    "You found a pair of scissors!",
    "They look sharp and useful.",
    "Maybe you can use them to cut something later.",
    {
      question: "Keep them?",
      options: [
        {
          text: "Yes",
          consequence: () => {
            hasPickedUpScissors = true;
            DialogueManager.insertAfterCurrent([
              "You have acquired the scissors.",
            ]);
          },
        },
        {
          text: "No",
          consequence: () => {
            DialogueManager.insertAfterCurrent([
              "Alex: Nah, I dont need them.",
            ]);
          },
        },
      ],
    },
  ],

  scissors_afterTake: ["You already have the scissors."],
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
  x: 400,
  y: 300,
  width: 10,
  height: 10,
  color: 'brown'
}

let scissors = {
  x: 700,
  y: 150,
  width: 10,
  height: 10,
  color: 'blue'
}


// === Define the interactions ===

const interactions = [
  {
    object: wall,
    dialogue: () =>
      hasPushedWall ? dialogues.wall_afterPush : dialogues.wall_beforePush,
    condition: () => true, // Always interactable
  },
  {
    object: oldTree,
    dialogue: () => dialogues.oldTree,
    condition: () => true,
  },
  {
    object: scissors,
    dialogue: () => hasPickedUpScissors ? dialogues.scissors_afterTake : dialogues.scissors,   // this line is pretty useless
    condition: () => !hasPickedUpScissors, // Only interactable if not picked up
  }
];




// === functions ===

const DialogueManager = {
  lines: [],
  currentLine: 0,
  currentChar: 0,
  visible: false,
  x: 100,
  y: 400,
  width: 600,
  height: 150,
  font: "16px serif",
  speed: 30,
  lastCharTime: 0,
  onComplete: null,
  selectedOptionIndex: 0,

  start(lines, onComplete = () => {}) {
    this.lines = lines;
    this.currentLine = 0;
    this.currentChar = 0;
    this.visible = true;
    this.onComplete = onComplete;
  },

  update(time) {
    if (!this.visible) return;
    const current = this.lines[this.currentLine];
    if (typeof current === "string") {
      if (time - this.lastCharTime > this.speed) {
        this.currentChar++;
        this.lastCharTime = time;
        if (this.currentChar > current.length) {
          this.currentChar = current.length;
        }
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

    const current = this.lines[this.currentLine];

    if (typeof current === "string") {
      ctx.fillText(
        current.substring(0, this.currentChar),
        this.x + 10,
        this.y + 30
      );
    } else if (current.question) {
      ctx.fillText(current.question, this.x + 10, this.y + 30);
      current.options.forEach((opt, idx) => {
        const prefix = this.selectedOptionIndex === idx ? "> " : "  ";
        ctx.fillText(prefix + opt.text, this.x + 10, this.y + 60 + idx * 20);
      });
    }
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
  insertAfterCurrent(newLines) {
    this.lines.splice(this.currentLine + 1, 0, ...newLines);
  },
};







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
if (DialogueManager.visible) return;

moveBody("ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", playerValues, dt);

for (let inter of interactions) {
  if (
    isColliding(playerValues, inter.object) &&
    keyJustPressed["z"] &&
    inter.condition()
  ) {
    DialogueManager.start(inter.dialogue());
    break;
  }
}

resetInputFlags();
}

function draw(time = performance.now()) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawCharImage(playerValues, playerImage);
  drawCharBody(wall);
  drawCharBody(oldTree);
  drawCharBody(scissors);




  DialogueManager.update(time);
  DialogueManager.draw();
}

// === Go! ===
gameLoop();
