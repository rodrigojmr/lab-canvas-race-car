class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');

    this.speed = 5;
    this.score = 0;

    this.road = new Road(this);
    this.car = new Car(this);
    this.obstacle = new Obstacle(this);

    this.setKeyBeindings();

    this.running = true;
  }

  setKeyBeindings() {
    window.addEventListener('keydown', event => {
      const key = event.key;
      switch (key) {
        case 'ArrowLeft':
          event.preventDefault();
          this.car.move('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          this.car.move('right');
          break;
      }
    });
    window.addEventListener('keyup', event => {
      this.car.moveSpeed = 2;
    });
  }

  startGame() {
    this.runLogic();
    if (this.running) {
      this.clean();
      this.paint();
      // requestAnimationFrame(() => this.loop());
      setTimeout(() => {
        this.startGame();
      }, 1000 / 60);
    } else {
      return false;
    }
  }

  runLogic() {
    this.road.backgroundMove();
    this.car.runLogic();
    for (let obstacle of obstacles) {
      obstacle.moveObstacle();
      obstacle.checkCollision();
      obstacle.checkPass();
    }
  }

  clean() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  paint() {
    this.road.paint();
    this.car.paint();
    for (let obstacle of obstacles) {
      obstacle.paint();
    }
    this.context.font = '30px sans-serif';
    this.context.fillStyle = '#fff';
    this.context.fillText(
      `Score: ${this.score}`,
      this.canvas.width / 2 - 70,
      30
    );
  }

  paintLose() {
    this.clean();
    this.context.fillStyle = '#000';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = '#b7060f';
    this.context.font = '30px sans-serif';
    this.context.fillText(
      'Game Over!',
      this.canvas.width / 2 - 70,
      this.canvas.height / 2
    );
    this.context.fillStyle = '#fff';
    this.context.fillText(
      `Your final score: ${this.score}`,
      this.canvas.width / 2 - 100,
      this.canvas.height / 2 + 50
    );
  }

  lose() {
    // debugger;
    this.paintLose();
    clearTimeout(this.startGame);
    clearInterval(generateObstaclePeriodically);
    this.running = false;
  }
}

class Road {
  constructor(game) {
    this.game = game;
    this.x = 0;
    this.y = 0;
    this.background = new Image();
    this.background.src = './images/road.png';
    this.leftBoundary = 55;
    this.rightBoundary = this.game.canvas.width - this.leftBoundary;
  }

  backgroundMove() {
    this.y += this.game.speed;
    this.y %= this.game.canvas.height - this.background.height - 20;
  }

  paint() {
    this.game.context.drawImage(
      this.background,
      0,
      this.y,
      this.game.canvas.width,
      this.game.canvas.height
    );
    if (this.game.speed > 0) {
      this.game.context.drawImage(
        this.background,
        0,
        this.y - this.background.height,
        this.game.canvas.width,
        this.game.canvas.height
      );
    } else {
      this.game.context.drawImage(
        this.background,
        0,
        this.y - this.game.canvas.height
      );
    }
  }
}

class Car {
  constructor(game) {
    this.game = game;
    this.image = new Image();
    this.image.src = './images/car.png';
    this.x = this.game.canvas.width / 2 - 25;
    this.y = 550;
    this.width = this.image.width * 0.3;
    this.height = this.image.height * 0.3;
    this.moveSpeed = 2;
  }

  paint() {
    this.game.context.drawImage(
      this.image,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }

  move(direction) {
    this.moveSpeed += 1;
    switch (direction) {
      case 'left':
        this.x -= this.moveSpeed;
        break;
      case 'right':
        this.x += this.moveSpeed;
        break;
      default:
        break;
    }
  }

  runLogic() {
    this.checkBoundaries();
  }

  checkBoundaries() {
    if (
      this.x < this.game.road.leftBoundary ||
      this.x + this.width > this.game.road.rightBoundary
    ) {
      this.game.lose();
    }
  }
}

class Obstacle {
  constructor(game, leftEdge, rightEdge) {
    this.game = game;
    this.y = -100;
    this.leftEdge = leftEdge;
    this.rightEdge = rightEdge;
  }

  paint() {
    // debugger;
    this.game.context.fillStyle = '#663300';
    this.game.context.fillRect(
      this.leftEdge,
      this.y,
      this.rightEdge - this.leftEdge,
      50
    );
  }

  moveObstacle() {
    this.y += this.game.speed;
  }

  checkCollision() {
    if (
      this.leftEdge < this.game.car.x + this.game.car.width &&
      this.rightEdge > this.game.car.x &&
      this.y < this.game.car.y + this.game.car.height &&
      this.y + 50 > this.game.car.y
    ) {
      this.game.lose();
    }
  }

  checkPass() {
    if (this.y > this.game.canvas.height) {
      this.game.score++;
      obstacles.shift();
    }
  }
}

const obstacles = [];

window.onload = () => {
  // debugger;
  const canvasElement = document.getElementById('canvas');
  const game = new Game(canvasElement);

  document.getElementById('start-button').onclick = () => {
    game.startGame();
    const roadWidth = game.road.rightBoundary - game.road.leftBoundary;
    const maxWidth = roadWidth - game.car.width * 1.5;
    const minWidth = game.car.width * 1.5;
    // debugger;
    function generateObstaclePeriodically() {
      const leftEdge = Math.floor(
        Math.random() *
          (game.road.rightBoundary - minWidth - game.road.leftBoundary) +
          game.road.leftBoundary
      );
      const rightEdge = function () {
        if (leftEdge < game.road.leftBoundary + minWidth) {
          return Math.floor(
            Math.random() *
              (game.road.rightBoundary - minWidth - (leftEdge + minWidth)) +
              (leftEdge + minWidth)
          );
        } else {
          return Math.floor(
            Math.random() * (game.road.rightBoundary - (leftEdge + minWidth)) +
              (leftEdge + minWidth)
          );
        }
      };
      const obstacle = new Obstacle(game, leftEdge, rightEdge());
      obstacles.push(obstacle);
    }
    setInterval(generateObstaclePeriodically, 2000);
  };
};
