// Game configuration
const config = {
    canvasWidth: 1250,  // 25% increase from 1000
    canvasHeight: 875,  // 25% increase from 700
    cameraWidth: 250,   // 25% increase from 200
    cameraHeight: 188,  // 25% increase from 150
    cameraSpeed: 6,     // Slightly increased for larger canvas
    coupleWidth: 25,    // Made much smaller so it's harder to find
    coupleHeight: 35,   // Made much smaller so it's harder to find
    cameramanWidth: 375, // Another 25% increase from 300
    cameramanHeight: 469, // Another 25% increase from 375
    cameramanX: 450,    // Repositioned for larger cameraman
    cameramanY: 400,    // Repositioned for larger cameraman
    cameraScreenX: 520, // Position of camera's LCD screen (will be calculated in code)
    cameraScreenY: 450, // Position of camera's LCD screen (will be calculated in code)
    cameraScreenWidth: 180, // Adjusted to match the camera in the image
    cameraScreenHeight: 120,  // Adjusted to match the camera in the image
    jumbotronWidth: 375, // 25% increase from 300
    jumbotronHeight: 150, // 25% increase from 120
    jumbotronX: 438,    // Repositioned for larger canvas
    jumbotronY: 100     // Repositioned for larger canvas
};

// Game state
let gameState = {
    score: 0,
    cameraX: config.canvasWidth / 2 - config.cameraWidth / 2,
    cameraY: config.canvasHeight / 2 - config.cameraHeight / 2,
    coupleX: 0,
    coupleY: 0,
    keys: {},
    isCapturing: false,
    coupleInFrame: false,
    musicOn: true,
    mouseX: 0,
    mouseY: 0,
    cameraMoved: false
};

// Image assets
let images = {
    stadiumBackground: null,
    crowd: null,
    couple: null,
    cameraman: null,
    cameraOverlay: null,
    jumbotron: null,
    bandOnScreen: null
};

// Array to store all jumbotron crowd images
let crowdImages = [];
let currentJumbotronImage = 0;
let showCaptureMessage = false;
let captureMessageTimer = null;

// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = config.canvasWidth;
canvas.height = config.canvasHeight;

// Disable image smoothing for pixel art
ctx.imageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;

// Load images
function loadImages() {
    const imagePromises = [];

    // Load stadium background
    images.stadiumBackground = new Image();
    images.stadiumBackground.src = 'assets/stadium_background.png';
    imagePromises.push(new Promise(resolve => {
        images.stadiumBackground.onload = resolve;
        images.stadiumBackground.onerror = () => resolve();
    }));

    // Load crowd
    images.crowd = new Image();
    images.crowd.src = 'assets/crowd.png';
    imagePromises.push(new Promise(resolve => {
        images.crowd.onload = resolve;
        images.crowd.onerror = () => {
            createPlaceholderCrowd();
            resolve();
        };
    }));

    // Load couple sprite
    images.couple = new Image();
    images.couple.src = 'assets/couple1.webp.png';
    imagePromises.push(new Promise(resolve => {
        images.couple.onload = resolve;
        images.couple.onerror = () => {
            createPlaceholderCouple();
            resolve();
        };
    }));

    // Load cameraman
    images.cameraman = new Image();
    images.cameraman.src = 'assets/cameraman.png';
    imagePromises.push(new Promise(resolve => {
        images.cameraman.onload = resolve;
        images.cameraman.onerror = () => resolve();
    }));

    // Load camera overlay
    images.cameraOverlay = new Image();
    images.cameraOverlay.src = 'assets/camera_overlay.png';
    imagePromises.push(new Promise(resolve => {
        images.cameraOverlay.onload = resolve;
        images.cameraOverlay.onerror = () => resolve();
    }));

    // Load jumbotron
    images.jumbotron = new Image();
    images.jumbotron.src = 'assets/jumbotron.png';
    imagePromises.push(new Promise(resolve => {
        images.jumbotron.onload = resolve;
        images.jumbotron.onerror = () => resolve();
    }));

    // Load band on screen
    images.bandOnScreen = new Image();
    images.bandOnScreen.src = 'assets/band_on_screen.png';
    imagePromises.push(new Promise(resolve => {
        images.bandOnScreen.onload = resolve;
        images.bandOnScreen.onerror = () => resolve();
    }));

    // Load all close-up crowd images (1-19)
    for (let i = 1; i <= 19; i++) {
        const img = new Image();
        img.src = `assets/close-up-crowd${i}.webp`;
        crowdImages.push(img);
        imagePromises.push(new Promise(resolve => {
            img.onload = resolve;
            img.onerror = () => resolve();
        }));
    }

    return Promise.all(imagePromises);
}

// Create placeholder images if assets are missing
function createPlaceholderCrowd() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = config.canvasWidth;
    tempCanvas.height = config.canvasHeight;
    const tempCtx = tempCanvas.getContext('2d');

    // Create a pixelated crowd pattern
    const colors = ['#2B1B4D', '#1F1340', '#362454', '#4A3266'];
    const pixelSize = 20;

    for (let y = 0; y < tempCanvas.height; y += pixelSize) {
        for (let x = 0; x < tempCanvas.width; x += pixelSize) {
            tempCtx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            tempCtx.fillRect(x, y, pixelSize, pixelSize);

            // Add some "heads" randomly
            if (Math.random() > 0.7) {
                tempCtx.fillStyle = '#000';
                tempCtx.fillRect(x + 5, y + 5, 10, 10);
            }
        }
    }

    images.crowd.src = tempCanvas.toDataURL();
}

function createPlaceholderCouple() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = config.coupleWidth;
    tempCanvas.height = config.coupleHeight;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw simple couple silhouette
    tempCtx.fillStyle = '#FF69B4';
    // Person 1
    tempCtx.fillRect(5, 20, 25, 60);
    tempCtx.fillRect(10, 5, 15, 15);
    // Person 2
    tempCtx.fillRect(30, 20, 25, 60);
    tempCtx.fillRect(35, 5, 15, 15);
    // Heart between them
    tempCtx.fillStyle = '#FF0000';
    tempCtx.fillRect(25, 30, 10, 10);

    images.couple.src = tempCanvas.toDataURL();
}

// Initialize couple position (avoid cameraman area and place in crowd)
function randomizeCouplePosition() {
    const margin = 50;
    const cameramanArea = {
        x: config.cameramanX - 50,
        y: config.cameramanY - 50,
        width: config.cameramanWidth + 100,
        height: config.cameramanHeight + 100
    };

    // Define crowd areas where couples are more likely to be found
    const crowdAreas = [
        // Left side crowd
        { x: 50, y: 200, width: 300, height: 400 },
        // Right side crowd
        { x: config.canvasWidth - 350, y: 200, width: 300, height: 400 },
        // Center crowd (below jumbotron)
        { x: 350, y: 300, width: 550, height: 300 }
    ];

    let validPosition = false;
    let attempts = 0;

    while (!validPosition && attempts < 30) {
        // Select a random crowd area
        const crowdArea = crowdAreas[Math.floor(Math.random() * crowdAreas.length)];

        // Position within that crowd area
        gameState.coupleX = crowdArea.x + Math.random() * (crowdArea.width - config.coupleWidth);
        gameState.coupleY = crowdArea.y + Math.random() * (crowdArea.height - config.coupleHeight);

        // Check if couple overlaps with cameraman area
        const coupleRight = gameState.coupleX + config.coupleWidth;
        const coupleBottom = gameState.coupleY + config.coupleHeight;

        if (!(gameState.coupleX < cameramanArea.x + cameramanArea.width &&
            coupleRight > cameramanArea.x &&
            gameState.coupleY < cameramanArea.y + cameramanArea.height &&
            coupleBottom > cameramanArea.y)) {
            validPosition = true;
        }
        attempts++;
    }

    // If we couldn't find a valid position in crowd areas, fall back to anywhere
    if (!validPosition) {
        gameState.coupleX = margin + Math.random() * (config.canvasWidth - config.coupleWidth - margin * 2);
        gameState.coupleY = margin + Math.random() * (config.canvasHeight - config.coupleHeight - margin * 2);
    }
}

// Input handling
document.addEventListener('keydown', (e) => {
    gameState.keys[e.key] = true;

    if (e.key === ' ' && !gameState.isCapturing) {
        checkCapture();
    }

    if (e.key === 'm' || e.key === 'M') {
        toggleMusic();
    }
});

document.addEventListener('keyup', (e) => {
    gameState.keys[e.key] = false;
});

// Mouse movement handling for camera control
canvas.addEventListener('mousemove', (e) => {
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate new camera position (centered on mouse)
    const newCameraX = mouseX - config.cameraWidth / 2;
    const newCameraY = mouseY - config.cameraHeight / 2;

    // Check if camera position has changed
    if (Math.abs(newCameraX - gameState.cameraX) > 1 || Math.abs(newCameraY - gameState.cameraY) > 1) {
        gameState.cameraMoved = true;
    }

    // Constrain camera to canvas boundaries
    gameState.cameraX = Math.max(0, Math.min(config.canvasWidth - config.cameraWidth, newCameraX));
    gameState.cameraY = Math.max(0, Math.min(config.canvasHeight - config.cameraHeight, newCameraY));
});

// Mouse click handling for capture
canvas.addEventListener('click', (e) => {
    if (!gameState.isCapturing) {
        checkCapture();
    }
});

// Music toggle functionality
function toggleMusic() {
    gameState.musicOn = !gameState.musicOn;
    updateMusicDisplay();
}

function updateMusicDisplay() {
    const musicToggle = document.getElementById('musicToggle');
    musicToggle.textContent = gameState.musicOn ? '♪ ON' : '♪ OFF';
    musicToggle.style.color = gameState.musicOn ? '#FFD700' : '#666';
}

// Add click handler for music toggle
document.addEventListener('DOMContentLoaded', () => {
    const musicToggle = document.getElementById('musicToggle');
    if (musicToggle) {
        musicToggle.addEventListener('click', toggleMusic);
    }
});

// Update camera position based on mouse movement
function updateCamera() {
    // Camera position is now updated by mouse movement in the mousemove event handler

    // Randomly change jumbotron image (with some randomness)
    if (gameState.cameraMoved && Math.random() < 0.05 && !showCaptureMessage) {
        currentJumbotronImage = Math.floor(Math.random() * crowdImages.length);
        gameState.cameraMoved = false; // Reset the flag
    }
}

// Check if couple is in camera frame
function checkCoupleInFrame() {
    const coupleRight = gameState.coupleX + config.coupleWidth;
    const coupleBottom = gameState.coupleY + config.coupleHeight;
    const cameraRight = gameState.cameraX + config.cameraWidth;
    const cameraBottom = gameState.cameraY + config.cameraHeight;

    // Check if couple overlaps with camera frame (partial overlap is enough)
    gameState.coupleInFrame = !(gameState.coupleX > cameraRight ||
        coupleRight < gameState.cameraX ||
        gameState.coupleY > cameraBottom ||
        coupleBottom < gameState.cameraY);
}

// Check if couple is captured (fully inside frame)
function checkCapture() {
    const coupleRight = gameState.coupleX + config.coupleWidth;
    const coupleBottom = gameState.coupleY + config.coupleHeight;
    const cameraRight = gameState.cameraX + config.cameraWidth;
    const cameraBottom = gameState.cameraY + config.cameraHeight;

    // Check if couple is fully inside camera frame
    if (gameState.coupleX >= gameState.cameraX &&
        gameState.coupleY >= gameState.cameraY &&
        coupleRight <= cameraRight &&
        coupleBottom <= cameraBottom) {

        // Success! Update score and relocate couple
        gameState.score += 10;
        updateScore();
        gameState.isCapturing = true;

        // Show capture message on jumbotron
        showCaptureMessage = true;
        clearTimeout(captureMessageTimer);
        captureMessageTimer = setTimeout(() => {
            showCaptureMessage = false;
        }, 3000); // Show message for 3 seconds

        // Move couple after a brief delay
        setTimeout(() => {
            randomizeCouplePosition();
            gameState.isCapturing = false;
        }, 500);
    }
}

// Update score display
function updateScore() {
    // Update the in-game score display
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = `EXPOSED: ${gameState.score}`;
    }

    // Update the header score display
    const scoreDisplayElement = document.getElementById('scoreDisplay');
    if (scoreDisplayElement) {
        scoreDisplayElement.textContent = `TARGETS EXPOSED: ${gameState.score}`;
    }
}

// Draw zoomed couple view inside camera frame
function drawCoupleZoom(ctx) {
    if (!gameState.coupleInFrame) return;

    // Calculate couple position relative to camera frame
    const relativeX = gameState.coupleX - gameState.cameraX;
    const relativeY = gameState.coupleY - gameState.cameraY;

    // Create zoom area in bottom-right of camera frame
    const zoomSize = 60;
    const zoomX = gameState.cameraX + config.cameraWidth - zoomSize - 10;
    const zoomY = gameState.cameraY + config.cameraHeight - zoomSize - 10;

    // Draw zoom background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(zoomX, zoomY, zoomSize, zoomSize);

    // Draw border
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(zoomX, zoomY, zoomSize, zoomSize);

    // Draw zoomed couple (scaled up)
    if (images.couple.complete) {
        const scale = 3.5; // Increased zoom scale for the smaller couple
        const zoomedWidth = config.coupleWidth * scale;
        const zoomedHeight = config.coupleHeight * scale;
        const centerX = zoomX + zoomSize / 2 - zoomedWidth / 2;
        const centerY = zoomY + zoomSize / 2 - zoomedHeight / 2;

        ctx.drawImage(images.couple, centerX, centerY, zoomedWidth, zoomedHeight);
    }
}

// Draw camera overlay
function drawCameraOverlay(ctx) {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;

    // Draw camera frame
    ctx.strokeRect(gameState.cameraX, gameState.cameraY, config.cameraWidth, config.cameraHeight);

    // Draw viewfinder corners
    const cornerLength = 20;
    ctx.beginPath();
    // Top-left
    ctx.moveTo(gameState.cameraX, gameState.cameraY + cornerLength);
    ctx.lineTo(gameState.cameraX, gameState.cameraY);
    ctx.lineTo(gameState.cameraX + cornerLength, gameState.cameraY);
    // Top-right
    ctx.moveTo(gameState.cameraX + config.cameraWidth - cornerLength, gameState.cameraY);
    ctx.lineTo(gameState.cameraX + config.cameraWidth, gameState.cameraY);
    ctx.lineTo(gameState.cameraX + config.cameraWidth, gameState.cameraY + cornerLength);
    // Bottom-right
    ctx.moveTo(gameState.cameraX + config.cameraWidth, gameState.cameraY + config.cameraHeight - cornerLength);
    ctx.lineTo(gameState.cameraX + config.cameraWidth, gameState.cameraY + config.cameraHeight);
    ctx.lineTo(gameState.cameraX + config.cameraWidth - cornerLength, gameState.cameraY + config.cameraHeight);
    // Bottom-left
    ctx.moveTo(gameState.cameraX + cornerLength, gameState.cameraY + config.cameraHeight);
    ctx.lineTo(gameState.cameraX, gameState.cameraY + config.cameraHeight);
    ctx.lineTo(gameState.cameraX, gameState.cameraY + config.cameraHeight - cornerLength);
    ctx.stroke();

    // Only show recording indicators when couple is in frame
    if (gameState.coupleInFrame) {
        // Draw center crosshair
        const centerX = gameState.cameraX + config.cameraWidth / 2;
        const centerY = gameState.cameraY + config.cameraHeight / 2;
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - 19, centerY);
        ctx.lineTo(centerX + 19, centerY);
        ctx.moveTo(centerX, centerY - 19);
        ctx.lineTo(centerX, centerY + 19);
        ctx.stroke();

        // Draw small center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        ctx.stroke();

        // Draw "REC" indicator
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 18px Courier New';
        ctx.fillText('REC', gameState.cameraX + 10, gameState.cameraY + 25);

        // Draw blinking dot
        if (Math.floor(Date.now() / 500) % 2 === 0) {
            ctx.beginPath();
            ctx.arc(gameState.cameraX + 56, gameState.cameraY + 19, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw zoomed couple view
        drawCoupleZoom(ctx);
    }
}

// Function to draw jumbotron content (reused for both displays)
function drawJumbotronContent(ctx, x, y, width, height, padding, fontSize) {
    if (showCaptureMessage) {
        // Draw capture success message
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(
            x + padding,
            y + padding,
            width - padding * 2,
            height - padding * 2
        );

        // Create blinking effect based on time
        const isBlinking = Math.floor(Date.now() / 300) % 2 === 0;

        // Use red color for "TARGET FOUND" text with blinking effect
        ctx.fillStyle = isBlinking ? '#FF0000' : '#FF6B6B';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            'TARGET FOUND',
            x + width / 2,
            y + height / 2 - fontSize / 2
        );

        // Add a secondary message in gold color
        ctx.fillStyle = '#FFD700';
        ctx.fillText(
            'MATCH DETECTED',
            x + width / 2,
            y + height / 2 + fontSize / 2
        );
        ctx.textAlign = 'start';
    } else {
        // Draw random crowd image
        if (crowdImages.length > 0 && crowdImages[currentJumbotronImage].complete) {
            ctx.drawImage(
                crowdImages[currentJumbotronImage],
                x + padding,
                y + padding,
                width - padding * 2,
                height - padding * 2
            );
        } else if (images.bandOnScreen.complete) {
            // Fallback to band image if crowd images aren't loaded
            ctx.drawImage(
                images.bandOnScreen,
                x + padding,
                y + padding,
                width - padding * 2,
                height - padding * 2
            );
        }
    }
}

// Main game loop
function gameLoop() {
    // Update
    updateCamera();
    checkCoupleInFrame();

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw stadium background as the main background
    if (images.stadiumBackground.complete) {
        ctx.drawImage(images.stadiumBackground, 0, 0, canvas.width, canvas.height);
    }

    // Draw jumbotron in stadium
    if (images.jumbotron.complete) {
        ctx.drawImage(images.jumbotron, config.jumbotronX, config.jumbotronY, config.jumbotronWidth, config.jumbotronHeight);
        drawJumbotronContent(ctx, config.jumbotronX, config.jumbotronY, config.jumbotronWidth, config.jumbotronHeight, 20, 30);
    }

    // Draw couple - only make it more visible when camera is nearby
    if (images.couple.complete) {
        // Calculate distance between camera center and couple center
        const cameraCenterX = gameState.cameraX + config.cameraWidth / 2;
        const cameraCenterY = gameState.cameraY + config.cameraHeight / 2;
        const coupleCenterX = gameState.coupleX + config.coupleWidth / 2;
        const coupleCenterY = gameState.coupleY + config.coupleHeight / 2;

        const distance = Math.sqrt(
            Math.pow(cameraCenterX - coupleCenterX, 2) +
            Math.pow(cameraCenterY - coupleCenterY, 2)
        );

        // Adjust opacity based on distance
        const maxDistance = 300;
        const minOpacity = 0.2;
        const opacity = Math.max(minOpacity, Math.min(1, 1 - (distance / maxDistance)));

        // Draw with calculated opacity
        ctx.globalAlpha = opacity;
        ctx.drawImage(images.couple, gameState.coupleX, gameState.coupleY, config.coupleWidth, config.coupleHeight);
        ctx.globalAlpha = 1.0; // Reset opacity
    }

    // Draw cameraman
    if (images.cameraman.complete) {
        ctx.drawImage(images.cameraman, config.cameramanX, config.cameramanY, config.cameramanWidth, config.cameramanHeight);

        // Position the camera screen inside the camera that the cameraman is holding
        const cameraScreenX = config.cameramanX + 150;  // Moved 50px to the right (60 + 50)
        const cameraScreenY = config.cameramanY + 30; // Positioned inside the camera viewfinder

        // Draw content on camera's LCD screen (no border, smaller padding)
        drawJumbotronContent(
            ctx,
            cameraScreenX,
            cameraScreenY,
            config.cameraScreenWidth,
            config.cameraScreenHeight,
            2, // minimal padding to maximize screen space
            12 // smaller font size
        );
    }

    // Draw camera overlay
    if (images.cameraOverlay.complete && images.cameraOverlay.width > 0) {
        ctx.drawImage(images.cameraOverlay, gameState.cameraX, gameState.cameraY, config.cameraWidth, config.cameraHeight);
    } else {
        drawCameraOverlay(ctx);
    }

    requestAnimationFrame(gameLoop);
}

// Initialize game
async function init() {
    await loadImages();
    randomizeCouplePosition();
    updateScore();
    gameLoop();
}

// Start the game
init();
// === ADD THIS TO THE END OF YOUR GAME.JS FILE ===

// Global session variable
let currentGameSession = null;

// Function to initialize game with a session
function initializeWithSession(sessionId) {
    currentGameSession = sessionId;
    init(); // Your existing init function
}

// Override your existing checkCapture function
const originalCheckCapture = checkCapture;
checkCapture = function () {
    const coupleRight = gameState.coupleX + config.coupleWidth;
    const coupleBottom = gameState.coupleY + config.coupleHeight;
    const cameraRight = gameState.cameraX + config.cameraWidth;
    const cameraBottom = gameState.cameraY + config.cameraHeight;

    if (gameState.coupleX >= gameState.cameraX &&
        gameState.coupleY >= gameState.cameraY &&
        coupleRight <= cameraRight &&
        coupleBottom <= cameraBottom) {

        gameState.score += 10;
        updateScore();
        gameState.isCapturing = true;

        // Record in database
        if (currentGameSession) {
            recordCaptureInDB();
        }

        showCaptureMessage = true;
        clearTimeout(captureMessageTimer);
        captureMessageTimer = setTimeout(() => {
            showCaptureMessage = false;
        }, 3000);

        setTimeout(() => {
            randomizeCouplePosition();
            gameState.isCapturing = false;
        }, 500);
    }
};

async function recordCaptureInDB() {
    if (!currentGameSession) return;

    try {
        const { supabase } = await import('./supabaseClient.js');
        await supabase.rpc('record_capture', { session_uuid: currentGameSession });
    } catch (err) {
        console.error('Failed to record capture:', err);
    }
}

window.gameAPI = {
    initializeWithSession: initializeWithSession,
    endGame: async function () {
        if (currentGameSession) {
            try {
                const { supabase } = await import('./supabaseClient.js');
                await supabase.rpc('end_game_session', { session_uuid: currentGameSession });
                currentGameSession = null;
            } catch (err) {
                console.error('Failed to end game session:', err);
            }
        }
    }
};
