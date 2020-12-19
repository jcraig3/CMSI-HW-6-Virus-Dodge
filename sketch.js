/* global loadImage createCanvas noStroke background
  fill mouseX mouseY constrain width height text
  collideCircleCircle noLoop exit frameRate RIGHT LEFT ellipse
*/

let health = 100;
let time = 0;
let enemies = [];
let healthboxes = [];
let decoy;
let decoyRefresh = 0;
let gameIsOver = false;

const healthSpan = document.querySelector("#health");
const decoySpan = document.querySelector("#decoy");
const timeSpan = document.querySelector("#time");

function setup() {
  createCanvas(800, 800);
  noStroke();
  spawnEnemies();
}

function draw() {
  background("pink");
  player.draw();
  player.move({ x: mouseX, y: mouseY });
  enemies.forEach(enemy => enemy.draw());
  enemies.forEach(enemy => enemy.move(decoy || player));
  healthboxes.forEach(box => box.update());
  checkForCollisions();
  editEnemySize();
  updateHealth();
  healthCheck();
  updateTime();
  decoyStats();
  spawnHealthBox();
}

class healthbox {
  constructor(x, y, index) {
    Object.assign(this, { x, y, index });
  }
  update() {
    fill("purple");
    ellipse(this.x, this.y, 20, 20);
    let [dx, dy] = [this.x - player.x, this.y - player.y];
    const distance = Math.hypot(dx, dy);
    let overlap = 20 + player.radius - distance;
    if (overlap > 0) {
      health = health > 90 ? 100 : health + 10;
      this.delete();
    }
  }
  delete() {
    healthboxes.splice(this.index, 1);
    healthboxes.forEach(box => {
      if (box.index > this.index) {
        this.index--;
      }
    });
  }
}

class Player {
  constructor(x, y, color, radius, speed) {
    Object.assign(this, { x, y, color, radius, speed });
  }
  draw() {
    fill(this.color);
    ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
  }
  move(target) {
    this.x += (target.x - this.x) * this.speed;
    this.y += (target.y - this.y) * this.speed;
  }
}
const player = new Player(100, 30, "lightgreen", 10, 0.05);

class enemy {
  constructor(type, x, y, radius, speed) {
    Object.assign(this, { type, x, y, radius, speed });
  }
  draw() {
    fill("rgb(255, 255, 255, 0.7)");
    ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
  }
  move(target) {
    this.x += (target.x - this.x) * this.speed;
    this.y += (target.y - this.y) * this.speed;
  }
  collidesWith(other) {
    let [dx, dy] = [this.x - other.x, this.y - other.y];
    const distance = Math.hypot(dx, dy);
    let overlap = this.radius + other.radius - distance;
    if (overlap > 0) {
      return true
    }
    return collideCircleCircle(
      this.x,
      this.y,
      this.diameter,
      other.x,
      other.y,
      other.diameter
    );
  }
}

function spawnEnemies() {
  addEnemy("small", 1, undefined, 10);
  addEnemy("medium", 1, undefined, 30);
  addEnemy("large", 1, undefined, 15);
}

function editEnemySize() {
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].y <= enemies[i].radius) {
      enemies[i].y = enemies[i].radius;
    }
  }
}

function spawnHealthBox() {
  if ((Math.round(60 * time) / 60) % 10 === 0) {
    spawnEnemies();
    if (Math.random() > 0.3) {
      healthboxes.push(
        new healthbox(
          Math.random() * width,
          Math.random() * height,
          healthboxes.length
        )
      );
    }
  }
}

function addEnemy(
  type,
  enemySpawnNumber = 1,
  enemySpawnLocation = [Math.random() * width, Math.random() * height],
  size = Math.random() * 20 + 10,
  speed = Math.random() * 0.03 + 0.003
) {
  for (let i = 0; i < enemySpawnNumber; i++) {
    enemies.push(
      new enemy(
        type,
        enemySpawnLocation[0] + i,
        enemySpawnLocation[1],
        size,
        speed
      )
    );
  }
}

function mouseClicked() {
  if (!decoy & (time - decoyRefresh > 10)) {
    decoy = new Player(player.x, player.y, "lightgreen", 10, 0);
    decoy.ttl = frameRate() * 5;
  }
}

function healthCheck() {
  if (health <= 0) {
    gameIsOver = true;
    text("GAME OVER!! The Virus was ELIMINATED", width / 2 - 60, height / 2 - 20);
    text(`You lasted ${Math.round(time)} seconds!`, width / 2, height / 2 + 20);
    noLoop();
  }
}

function decoyStats() {
  if (decoy) {
    decoy.draw();
    decoy.ttl--;
    if (decoy.ttl < 0) {
      decoy = undefined;
      decoyRefresh = time;
    }
  } else {
    if (time - decoyRefresh > 10) {
      decoySpan.textContent = "Click to drop decoy!!!";
    } else {
      decoySpan.textContent = "Decoy not ready :(";
    }
  }
}

function checkForCollisions() {
    for (let enemy of enemies) {
      if (enemy.collidesWith(player)) {
        health -= 1;
      }
    }
  }

function updateHealth() {
  healthSpan.textContent = health;
}

function updateTime() {
  time += 1 / 60;
  timeSpan.textContent = Math.round(time);
}
