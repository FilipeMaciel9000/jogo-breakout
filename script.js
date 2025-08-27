// Canvas e contexto
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ajustar tamanho do canvas para dispositivos móveis
function adjustCanvasSize() {
  if (window.innerWidth <= 600) {
    const maxWidth = 300;
    const aspectRatio = 400 / 480;
    canvas.width = maxWidth;
    canvas.height = maxWidth * aspectRatio;
  } else {
    canvas.width = 480;
    canvas.height = 400;
  }
  // Redesenhar o jogo se necessário
  if (!gameRunning) {
    drawStaticElements();
  }
}

// Elementos da UI
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// Configurações do jogo
let score = 0;
let lives = 3;
let gameRunning = false;
let gamePaused = false;
let animationId = null;

// Plataforma
const paddleHeight = 10;
let paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;

// Bola
const ballRadius = 10;
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballSpeedX = 5;
let ballSpeedY = -5;

// Tijolos
const brickRowCount = 5;
const brickColumnCount = 8;
let brickWidth = 50;
let brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

// Ajustar tamanhos relativos com base no canvas
function adjustSizes() {
  // Ajustar tamanho da plataforma com base na largura do canvas
  paddleWidth = canvas.width * 0.15625; // 75/480

  // Ajustar tamanho dos tijolos para caber no canvas
  const availableWidth = canvas.width - brickOffsetLeft * 2;
  brickWidth =
    (availableWidth - brickPadding * (brickColumnCount - 1)) / brickColumnCount;
  brickHeight = 20;
}

// Controles
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
document.addEventListener('mousemove', mouseMoveHandler);
document.addEventListener('touchmove', touchHandler, { passive: false });

function keyDownHandler(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    rightPressed = true;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    rightPressed = false;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    leftPressed = false;
  }
}

function mouseMoveHandler(e) {
  if (!gameRunning) return;

  const relativeX = e.clientX - canvas.getBoundingClientRect().left;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;

    // Limitar a plataforma dentro do canvas
    if (paddleX < 0) {
      paddleX = 0;
    } else if (paddleX + paddleWidth > canvas.width) {
      paddleX = canvas.width - paddleWidth;
    }
  }
}

function touchHandler(e) {
  if (!gameRunning) return;

  e.preventDefault();
  const relativeX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;

    // Limitar a plataforma dentro do canvas
    if (paddleX < 0) {
      paddleX = 0;
    } else if (paddleX + paddleWidth > canvas.width) {
      paddleX = canvas.width - paddleWidth;
    }
  }
}

// Detecção de colisão
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const brick = bricks[c][r];
      if (brick.status === 1) {
        if (
          ballX + ballRadius > brick.x &&
          ballX - ballRadius < brick.x + brickWidth &&
          ballY + ballRadius > brick.y &&
          ballY - ballRadius < brick.y + brickHeight
        ) {
          ballSpeedY = -ballSpeedY;
          brick.status = 0;
          score++;
          scoreDisplay.textContent = score;

          if (score === brickRowCount * brickColumnCount) {
            showMessage('Parabéns! Você venceu!');
            resetGame();
          }
          return; // Sair após uma colisão
        }
      }
    }
  }
}

// Mostrar mensagem
function showMessage(msg) {
  ctx.font = '24px Arial';
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText(msg, canvas.width / 2, canvas.height / 2);
}

// Desenhar elementos
function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#E6B422'; // Amarelo
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = 'black';
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;

        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawStaticElements() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
}

// Lógica principal do jogo
function draw() {
  if (gamePaused || !gameRunning) return;

  // Limpar canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Desenhar elementos
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

  // Colisão com as paredes
  if (
    ballX + ballSpeedX > canvas.width - ballRadius ||
    ballX + ballSpeedX < ballRadius
  ) {
    ballSpeedX = -ballSpeedX;
  }

  if (ballY + ballSpeedY < ballRadius) {
    ballSpeedY = -ballSpeedY;
  } else if (ballY + ballSpeedY > canvas.height - ballRadius) {
    // Colisão com a plataforma
    if (ballX > paddleX && ballX < paddleX + paddleWidth) {
      ballSpeedY = -ballSpeedY;

      // Ajustar direção baseado em onde a bola acertou a plataforma
      const hitPosition = (ballX - paddleX) / paddleWidth;
      ballSpeedX = 7 * (hitPosition - 0.5);
    } else {
      // Perder uma vida
      lives--;
      livesDisplay.textContent = lives;

      if (lives === 0) {
        showMessage('Game Over!');
        resetGame();
      } else {
        // Reposicionar a bola
        resetBallAndPaddle();
      }
    }
  }

  // Mover a bola
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Mover a plataforma
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  animationId = requestAnimationFrame(draw);
}

// Reposicionar bola e plataforma
function resetBallAndPaddle() {
  ballX = canvas.width / 2;
  ballY = canvas.height - 30;
  ballSpeedX = 5;
  ballSpeedY = -5;
  paddleX = (canvas.width - paddleWidth) / 2;
}

// Controles do jogo
function startGame() {
  if (!gameRunning) {
    gameRunning = true;
    gamePaused = false;
    pauseBtn.textContent = 'Pausar';
    draw();
  }
}

function pauseGame() {
  if (!gameRunning) return;

  gamePaused = !gamePaused;
  pauseBtn.textContent = gamePaused ? 'Continuar' : 'Pausar';

  if (!gamePaused) {
    draw();
  } else {
    cancelAnimationFrame(animationId);
  }
}

function resetGame() {
  // Parar a animação se estiver rodando
  cancelAnimationFrame(animationId);

  score = 0;
  lives = 3;
  scoreDisplay.textContent = score;
  livesDisplay.textContent = lives;

  resetBallAndPaddle();

  // Resetar tijolos
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r].status = 1;
    }
  }

  gameRunning = false;
  gamePaused = false;
  pauseBtn.textContent = 'Pausar';

  // Redesenhar a tela inicial
  drawStaticElements();
}

// Event listeners para os botões
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resetBtn.addEventListener('click', resetGame);

// Ajustar tamanho do canvas quando a janela for redimensionada
window.addEventListener('resize', function () {
  adjustCanvasSize();
  adjustSizes();
  if (!gameRunning) {
    drawStaticElements();
  }
});

// Inicializar o jogo
adjustCanvasSize();
adjustSizes();
resetGame();
