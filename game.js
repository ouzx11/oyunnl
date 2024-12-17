// Canvas ve context'i al
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Resimleri yükle
const playerImage = new Image();
playerImage.src = './assets/player.png';

const itemImage = new Image();
itemImage.src = './assets/item1.png';

const backgroundImage = new Image();
backgroundImage.src = './assets/background.png';

// Oyun değişkenleri
let score = 0;
let lives = 3;  // Başlangıç canı
let gameOver = false;
let gameStarted = false;
let gamePaused = false;
let gameSpeed = 1; // Base game speed multiplier

// Oyuncu
const player = {
    x: canvas.width / 2,
    y: canvas.height - 160,
    width: 160,
    height: 160,
    speed: 15  // Karakter hızını 15'e çıkardım
};

// Düşen nesneler dizisi
let items = [];

// Klavye kontrolleri
let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', (e) => {
    if(!gameStarted || gamePaused) return;
    if(e.key === 'ArrowRight') rightPressed = true;
    if(e.key === 'ArrowLeft') leftPressed = true;
});

document.addEventListener('keyup', (e) => {
    if(!gameStarted || gamePaused) return;
    if(e.key === 'ArrowRight') rightPressed = false;
    if(e.key === 'ArrowLeft') leftPressed = false;
});

// Yeni nesne oluştur
function createItem() {
    // Calculate speed based on score
    let baseSpeed = 1.5 + Math.random() * 1; // Sabit başlangıç hızı
    let speedMultiplier = 1 + (score / 800); // Çok çok daha yavaş hız artışı
    
    return {
        x: Math.random() * (canvas.width - 80),
        y: 0,
        width: 80,
        height: 80,
        speed: baseSpeed * speedMultiplier,
        points: 10
    };
}

// Çarpışma kontrolü
function checkCollision(item) {
    return player.x < item.x + item.width &&
           player.x + player.width > item.x &&
           player.y < item.y + item.height &&
           player.y + player.height > item.y;
}

// Oyuncuyu çiz
function drawPlayer() {
    try {
        ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
    } catch (error) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        console.error('Player image error:', error);
    }
}

// Nesneleri çiz
function drawItems() {
    items.forEach(item => {
        try {
            ctx.drawImage(itemImage, item.x, item.y, item.width, item.height);
        } catch (error) {
            ctx.fillStyle = 'yellow';
            ctx.fillRect(item.x, item.y, item.width, item.height);
            console.error('Item image error:', error);
        }
    });
}

// Oyuncuyu hareket ettir
function movePlayer() {
    if(rightPressed && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if(leftPressed && player.x > 0) {
        player.x -= player.speed;
    }
}

// Nesneleri hareket ettir
function moveItems() {
    items.forEach(item => {
        item.y += item.speed;
        
        // Item ekranın altına ulaştığında
        if (item.y > canvas.height) {
            lives--; // Can azalt
            items = items.filter(i => i !== item); // Item'ı kaldır
            
            if (lives <= 0) {
                gameOver = true;
            }
        }
    });

    items = items.filter(item => item.y < canvas.height);

    items.forEach((item, index) => {
        if(checkCollision(item)) {
            score += item.points;
            scoreElement.textContent = `Score: ${score}`;
            items.splice(index, 1);
            
            // Update game speed based on score
            gameSpeed = 1 + (score / 800); // Çok çok daha yavaş hız artışı
            
            // Update item generation interval
            clearInterval(itemInterval);
            let newInterval = Math.max(600, 800 - (score * 0.3)); // Daha da yavaş hızlanma
            itemInterval = setInterval(() => {
                if(!gameOver && gameStarted && !gamePaused) {
                    items.push(createItem());
                    if(score > 500 && Math.random() < 0.1) { // Daha geç ve daha az sıklıkta ekstra nesne
                        items.push(createItem());
                    }
                }
            }, newInterval);
        }
    });
}

// Can barını çiz
function drawLives() {
    ctx.fillStyle = '#FF5252';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('❤️'.repeat(lives), 20, 40);
}

// Game over ekranı
function showGameOverScreen() {
    // Arkaplan gradyanı
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Üst başlık
    ctx.fillStyle = '#FF5252';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 100);
    
    // Altın efekti
    ctx.strokeStyle = '#FFC107';
    ctx.lineWidth = 2;
    ctx.strokeText('GAME OVER', canvas.width/2, canvas.height/2 - 100);
    
    // Final skor
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('Final Score: ' + score, canvas.width/2, canvas.height/2);
    
    // Skor çerçevesi
    ctx.strokeStyle = '#2E7D32';
    ctx.strokeText('Final Score: ' + score, canvas.width/2, canvas.height/2);
    
    // Restart mesajı
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    let message = 'Press RESTART to play again';
    ctx.fillText(message, canvas.width/2, canvas.height/2 + 80);
    
    // Yanıp sönen efekt
    let alpha = (Math.sin(Date.now() / 500) + 1) / 2;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillText('↻', canvas.width/2, canvas.height/2 + 120);
    
    // Dekoratif çizgiler
    ctx.beginPath();
    ctx.strokeStyle = '#FF5252';
    ctx.lineWidth = 3;
    ctx.moveTo(canvas.width/2 - 200, canvas.height/2 - 40);
    ctx.lineTo(canvas.width/2 + 200, canvas.height/2 - 40);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.strokeStyle = '#4CAF50';
    ctx.moveTo(canvas.width/2 - 150, canvas.height/2 + 40);
    ctx.lineTo(canvas.width/2 + 150, canvas.height/2 + 40);
    ctx.stroke();
}

// Oyunu çiz
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!gameOver) {
        try {
            if (backgroundImage.complete) {
                ctx.globalAlpha = 0.2;  
                ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
                ctx.globalAlpha = 1.0;
            }
        } catch (error) {
            console.error('Background image error:', error);
        }
        
        drawPlayer();
        drawItems();
        drawLives();  // Can barını çiz
    } else {
        showGameOverScreen();
    }
}

// Oyunu duraklat
function pauseGame() {
    gamePaused = true;
    document.getElementById('pauseScreen').style.display = 'block';
    document.getElementById('pauseButton').textContent = 'RESUME';
}

// Oyuna devam et
function resumeGame() {
    gamePaused = false;
    document.getElementById('pauseScreen').style.display = 'none';
    document.getElementById('pauseButton').textContent = 'PAUSE';
    gameLoop();
}

// Oyunu başlat
function startGame() {
    score = 0;
    lives = 3;  // Canı sıfırla
    items = [];
    gameOver = false;
    gameStarted = true;
    gamePaused = false;
    gameSpeed = 1;
    scoreElement.textContent = 'Score: 0';
    
    // Show control buttons
    document.getElementById('gameControls').style.display = 'block';
    
    // Start with faster initial interval (800ms instead of 1000ms)
    itemInterval = setInterval(() => {
        if(!gameOver && gameStarted && !gamePaused) {
            items.push(createItem());
        }
    }, 800);
    
    gameLoop();
}

// Restart game
function restartGame() {
    startGame();
}

// Oyun döngüsü
function gameLoop() {
    if(!gameOver && gameStarted && !gamePaused) {
        movePlayer();
        moveItems();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

// Sayfa yüklendiğinde
window.onload = function() {
    const startScreen = document.getElementById('startScreen');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const resumeButton = document.getElementById('resumeButton');
    const restartButton = document.getElementById('restartButton');

    startButton.addEventListener('click', () => {
        startScreen.style.display = 'none';
        startGame();
    });

    pauseButton.addEventListener('click', () => {
        if (gamePaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    });

    resumeButton.addEventListener('click', () => {
        resumeGame();
    });

    restartButton.addEventListener('click', () => {
        restartGame();
    });
    
    playerImage.onload = function() {
        console.log('Player image loaded successfully');
    };
    
    itemImage.onload = function() {
        console.log('Item image loaded successfully');
    };
    
    backgroundImage.onload = function() {
        console.log('Background image loaded successfully');
    };
    
    playerImage.onerror = function() {
        console.error('Player image could not be loaded');
    };
    
    itemImage.onerror = function() {
        console.error('Item image could not be loaded');
    };
    
    backgroundImage.onerror = function() {
        console.error('Background image could not be loaded');
    };
};
