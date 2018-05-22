// Game of (crazy) pong
// jshint esnext:true

var ball, p1, p2, p3, p4;
var MAX_ACC = 0.3;
var MAX_VEL = 10;
var gameOver = false;
var MAX_SCORE = 10;
var p1ai, p2ai, p3ai, p4ai;
var restartBtn;

function Ball() {
  this.r = 10;
  this.parent = undefined;
  this.pos = createVector(width / 2, height / 2);
  this.vel = p5.Vector.fromAngle(random() < 0.5 ? random(PI - PI / 4, PI + PI / 4) : random(-PI / 4, PI / 4));
  this.speed = 5;
  this.vel.setMag(this.speed);
  this.dead = false;
  this.bounce = function(angle) {
    this.vel = p5.Vector.fromAngle(angle);
    this.vel.setMag(this.speed);
  };
  this.edges = function() {
    //     if (this.pos.x < this.r) {
    //       p2.scores();
    //       this.dead = true;
    //     } else if (this.pos.x > width - this.r) {
    //       p1.scores();
    //       this.dead = true;
    //     }
    //     if (this.pos.x < this.r) {
    //       p2.scores();
    //       this.dead = true;
    //     } else if (this.pos.x > width - this.r) {
    //       p1.scores();
    //       this.dead = true;
    //     }
    var margin = 2 * this.r;
    if (this.pos.y < margin || this.pos.y > height - margin ||
      this.pos.x < margin || this.pos.x > width - margin) {
      if (this.parent) {
        this.parent.scores();
      } else {
        if (this.pos.y < margin) {
          p1.scores();
          p2.scores();
          p4.scores();
        } else if (this.pos.y > height - margin) {
          p1.scores();
          p2.scores();
          p3.scores();
        } else if (this.pos.x < margin) {
          p2.scores();
          p3.scores();
          p4.scores();
        } else if (this.pos.x > width - margin) {
          p1.scores();
          p3.scores();
          p4.scores();
        }
      }
      this.dead = true;
    }
    //     if (this.pos.y < this.r || this.pos.y > height - this.r) {
    //       this.vel.y *= -1;
    //     }
    //     this.pos.x = constrain(this.pos.x, this.r, width - this.r);
    //     this.pos.y = constrain(this.pos.y, this.r, height - this.r);
  };
  this.update = function() {
    this.pos.add(this.vel);
  };
  this.draw = function() {
    noStroke();
    fill(255);
    ellipse(this.pos.x, this.pos.y, this.r * 2);
  };
}

function Pad(coord, vertical, color, ai) {
  this.ai = ai;
  this.color = color;
  this.vertical = vertical;
  if (vertical) {
    this.pos = createVector(coord, height / 2);
    this.w = 20;
    this.h = 140;
  } else {
    this.pos = createVector(width / 2, coord);
    this.w = 140;
    this.h = 20;
  }
  this.vel = createVector(0, 0);
  this.acc = createVector(0, 0);
  this.score = 0;
  this.scores = function() {
    this.score++;
  };
  this.touches = function(ball) {
    var ballUp = ball.pos.y <= height / 2;
    var ballDown = !ballUp;
    var ballLeft = ball.pos.x <= width / 2;
    var ballRight = !ballLeft;
    var padUp = this.pos.y <= height / 2;
    var padDown = !padUp;
    var padLeft = this.pos.x <= width / 2;
    var padRight = !padLeft;
    var ballInPadVertically = ball.pos.y + ball.r > this.pos.y - this.h / 2 &&
      ball.pos.y - ball.r < this.pos.y + this.h / 2;
    var ballInPadHorizontally = ball.pos.x + ball.r > this.pos.x - this.w / 2 &&
      ball.pos.x - ball.r < this.pos.x + this.w / 2;
    var ballTouchesPadFromRight = ball.pos.x - ball.r < this.pos.x + this.w / 2;
    var ballTouchesPadFromLeft = ball.pos.x + ball.r > this.pos.x - this.w / 2;
    var ballTouchesPadFromBottom = ball.pos.y - ball.r < this.pos.y + this.h / 2;
    var ballTouchesPadFromTop = ball.pos.y + ball.r > this.pos.y - this.h / 2;
    var touches =
      (this.vertical && ballInPadVertically &&
        (ballTouchesPadFromRight && ballLeft && padLeft ||
          ballTouchesPadFromLeft && ballRight && padRight)) ||
      (!this.vertical && ballInPadHorizontally &&
        (ballTouchesPadFromBottom && ballUp && padUp ||
          ballTouchesPadFromTop && ballDown && padDown));
    return touches;
  };
  this.update = function() {
    var ballGoingUp = ball.vel.y < 0;
    var ballGoingDown = !ballGoingUp;
    var ballGoingLeft = ball.vel.x < 0;
    var ballGoingRight = !ballGoingLeft;
    var padUp = this.pos.y <= height / 2;
    var padDown = !padUp;
    var padLeft = this.pos.x <= width / 2;
    var padRight = !padLeft;

    if (this.ai) {
      if (this.vertical) {
        if ((padLeft && ballGoingLeft) || (padRight && ballGoingRight)) {
          if (ball.pos.y < this.pos.y) {
            this.acc.y = map(ball.pos.y, this.pos.y, this.pos.y - this.h / 2, 0, -MAX_ACC);
          } else if (ball.pos.y > this.pos.y) {
            this.acc.y = map(ball.pos.y, this.pos.y, this.pos.y + this.h / 2, 0, MAX_ACC);
          }
        } else if ((padLeft && ballGoingRight) || (padRight && ballGoingLeft)) {
          if (this.pos.y > height / 2) {
            this.acc.y = map(this.pos.y, height / 2, height - this.h / 2, 0, -MAX_ACC);
          } else if (this.pos.y < height / 2) {
            this.acc.y = map(this.pos.y, height / 2, this.h / 2, 0, MAX_ACC);
          }
        }
      } else {
        if ((padUp && ballGoingUp) || (padDown && ballGoingDown)) {
          if (ball.pos.x < this.pos.x) {
            this.acc.x = map(ball.pos.x, this.pos.x, this.pos.x - this.w / 2, 0, -MAX_ACC);
          } else if (ball.pos.x > this.pos.x) {
            this.acc.x = map(ball.pos.x, this.pos.x, this.pos.x + this.w / 2, 0, MAX_ACC);
          }
        } else if ((padUp && ballGoingDown) || (padDown && ballGoingUp)) {
          if (this.pos.x > width / 2) {
            this.acc.x = map(this.pos.x, width / 2, width - this.w / 2, 0, -MAX_ACC);
          } else if (this.pos.x < width / 2) {
            this.acc.x = map(this.pos.x, width / 2, this.w / 2, 0, MAX_ACC);
          }
        }
      }
    }
    this.vel.add(this.acc);
    this.vel.mult(0.98);
    this.vel.limit(MAX_VEL);
    this.acc.mult(0);
    this.pos.add(this.vel);
    this.edges();
  };
  this.edges = function() {
    if (this.vertical) {
      this.pos.y = constrain(this.pos.y, this.h / 2, height - this.h / 2);
    } else {
      this.pos.x = constrain(this.pos.x, this.w / 2, width - this.w / 2);
    }
  };
  this.draw = function() {
    rectMode(CENTER);
    fill(this.color);
    noStroke();
    rect(this.pos.x, this.pos.y, this.w, this.h);
  };
}

function drawField() {
  noStroke();
  fill(p1.color);
  textSize(72);
  text(p1.score, width / 4, height / 10);
  textSize(12);
  text('a,z', 10, 10);
  fill(p2.color);
  textSize(72);
  text(p2.score, width * 3 / 4, height / 10);
  textSize(12);
  text('k,m', 10, 20);
  fill(p3.color);
  textSize(72);
  text(p3.score, width / 4, height * 10 / 10 - 10);
  textSize(12);
  text('t,y', 10, 30);
  fill(p4.color);
  textSize(72);
  text(p4.score, width * 3 / 4, height * 10 / 10 - 10);
  textSize(12);
  text('v,b', 10, 40);
  fill(255);
  textSize(12);
  text('space - restart', 10, 50);
  if (p1.score === MAX_SCORE || p2.score == MAX_SCORE || p3.score == MAX_SCORE || p4.score == MAX_SCORE) {
    gameOver = true;
    noLoop();
  }
  rectMode(CENTER);
  var x = width / 2;
  var steps = 15;
  for (var i = 0; i < steps; i++) {
    var y = lerp(10, height - 10, i / (steps - 1));
    rect(x, y, 10, height / steps - 15);
  }
  var y = height / 2;
  var steps = 15;
  for (var i = 0; i < steps; i++) {
    var x = lerp(10, width - 10, i / (steps - 1));
    rect(x, y, width / steps - 25, 10);
  }
  ellipse(width / 2, height / 2, 30);
}

function restartGame() {
  p1.score = 0;
  p2.score = 0;
  p3.score = 0;
  p4.score = 0;
  ball = new Ball();
  loop();
}

function setup() {
  createCanvas(800, 600);
  ball = new Ball();
  var margin = 20;
  p1 = new Pad(margin, true, 'red', true);
  p2 = new Pad(width - margin, true, 'lightblue', true);
  p3 = new Pad(margin, false, 'green', true);
  p4 = new Pad(height - margin, false, 'white', true);
  p1ai = createCheckbox('p1 AI', true);
  p1ai.mousePressed(function() {
    p1.ai = !p1.ai;
  });
  p2ai = createCheckbox('p2 AI', true);
  p2ai.mousePressed(function() {
    p2.ai = !p2.ai;
  });
  p3ai = createCheckbox('p3 AI', true);
  p3ai.mousePressed(function() {
    p3.ai = !p3.ai;
  });
  p4ai = createCheckbox('p4 AI', true);
  p4ai.mousePressed(function() {
    p4.ai = !p4.ai;
  });
  restartBtn = createButton('Restart game');
  restartBtn.mousePressed(restartGame);
}

function keyPressed() {
  if (gameOver && keyCode == 32) {
    restartGame();
  }
}

function draw() {
  background(51);
  drawField();

  // t 89, y 84
  // v 66, b 86

  if (keyIsDown(90)) {
    p1.acc.y = MAX_ACC;
    //p1.vel.y = 5;
  } else if (keyIsDown(65)) {
    p1.acc.y = -MAX_ACC;
    //p1.vel.y = -5;
  } else {
    //p1.vel.y = 0;
  }
  if (keyIsDown(77)) {
    p2.acc.y = MAX_ACC;
    //p2.vel.y = 5;
  } else if (keyIsDown(75)) {
    p2.acc.y = -MAX_ACC;
    //p2.vel.y = -5;
  } else {
    //p2.vel.y = 0;
  }
  if (keyIsDown(89)) {
    p3.acc.x = MAX_ACC;
    //p3.vel.x = 5;
  } else if (keyIsDown(84)) {
    p3.acc.x = -MAX_ACC;
    //p3.vel.x = -5;
  } else {
    //p3.vel.x = 0;
  }
  if (keyIsDown(66)) {
    p4.acc.x = MAX_ACC;
    //p4.vel.x = 5;
  } else if (keyIsDown(86)) {
    p4.acc.x = -MAX_ACC;
    p4.vel.x = -5;
  } else {
    //p4.vel.x = 0;
  }

  ball.update();
  ball.edges();
  if (ball.dead) {
    ball = new Ball();
  }

  if (p1.touches(ball)) {
    var angle = map(ball.pos.y, p1.pos.y - p1.h / 2 - ball.r, p1.pos.y + p1.h / 2 + ball.r, -PI / 4, PI / 4);
    ball.pos.x = p1.pos.x + p1.w / 2 + ball.r;
    ball.bounce(angle);
    ball.parent = p1;
  }
  if (p2.touches(ball)) {
    if (ball.pos.y < p2.pos.y) {
      var angle = map(ball.pos.y, p2.pos.y - p2.h / 2 - ball.r, p2.pos.y, -3 * PI / 4, -PI);
    } else {
      var angle = map(ball.pos.y, p2.pos.y, p2.pos.y + p2.h / 2 + ball.r, PI, 3 * PI / 4);
    }
    ball.pos.x = p2.pos.x - p2.w / 2 - ball.r;
    ball.bounce(angle);
    ball.parent = p2;
  }

  if (p3.touches(ball)) {
    var angle = map(ball.pos.x, p3.pos.x - p3.w / 2 - ball.r, p3.pos.x + p3.w / 2 + ball.r, 3 * PI / 4, PI / 4);
    ball.pos.y = p3.pos.y + p3.h / 2 + ball.r;
    //ball.vel.y *= -1;
    ball.bounce(angle);
    ball.parent = p3;
  }
  if (p4.touches(ball)) {
    var angle = map(ball.pos.x, p4.pos.x - p4.w / 2 - ball.r, p4.pos.x + p4.w / 2 + ball.r, -3 * PI / 4, -PI / 4);
    ball.pos.y = p4.pos.y - p4.h / 2 - ball.r;
    //ball.vel.y *= -1;
    ball.bounce(angle);
    ball.parent = p4;
  }

  ball.draw();

  p1.update();
  p1.draw();
  p2.update();
  p2.draw();
  p3.update();
  p3.draw();
  p4.update();
  p4.draw();
}
