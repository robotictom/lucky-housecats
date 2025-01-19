// Full script.js with fixes for payout calculation and winning line highlighting
const canvas = document.getElementById('slotCanvas');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spin');
const balanceElement = document.getElementById('balance');
const messageElement = document.getElementById('message');
const slotContainer = document.getElementById('slotContainer');

let balance = config.balance;

const reelCount = config.reels;
const rowCount = config.rows;

const gameWidth = slotContainer.offsetWidth;

const symbolWidth = gameWidth / reelCount;
const symbolHeight = symbolWidth;

const gameHeight = symbolHeight * rowCount;

const reelSpacing = 0;

const reels = [];
const images = {}; // Store preloaded images
let isBonusActive = false;
let bonusData = null; // Store bonus game data
let forcedBonusSpinTracker = 0; // Track spins since the last bonus

// Preload images
function preloadImages() {
    return Promise.all(
        config.symbols.map(symbol => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = symbol.src;
                img.onload = () => {
                    images[symbol.name] = img;
                    resolve();
                };
                img.onerror = reject;
            });
        })
    );
}

function formatJackpot(amount) {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
    }).format(amount);
};

function initJackpots() {
    const jackpot_grand = document.getElementById('jackpot_grand');
    const jackpot_major = document.getElementById('jackpot_major');
    const jackpot_minor = document.getElementById('jackpot_minor');
    const jackpot_mini = document.getElementById('jackpot_mini');
    
    jackpot_grand.textContent = formatJackpot(config.jackpot.grand);
    jackpot_major.textContent = formatJackpot(config.jackpot.major);
    jackpot_minor.textContent = formatJackpot(config.jackpot.minor);
    jackpot_mini.textContent = formatJackpot(config.jackpot.mini);
}

// Initialize reels with placeholders
function initReels() {
    ctx.canvas.width  = gameWidth;
    ctx.canvas.height = gameHeight;
    
    for (let i = 0; i < reelCount; i++) {
        reels.push({
            x: i * (symbolWidth + reelSpacing),
            y: 0,
            visible: [], // Symbols visible when stopped
            animationFiller: [], // Symbols used during animation
            spinning: false,
            stopTime: 0 // Time when the reel stops spinning
        });
    }
}

// Draw reels on the canvas
function drawReels() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    reels.forEach((reel) => {
        const symbolsToDraw = reel.spinning ? reel.animationSymbols : reel.visible;
        
        symbolsToDraw.forEach((symbol, index) => {
            const yPos = reel.y + index * symbolHeight;
            drawSymbol(reel.x, yPos, symbol);
        });
    });
}

// Draw a single symbol
function drawSymbol(x, y, symbol) {
    if (!symbol || !symbol.name) {
        console.error('Invalid symbol detected:', symbol);
        ctx.fillStyle = '#f00'; // Red box for invalid symbols
        ctx.fillRect(x, y, symbolWidth, symbolHeight);
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ERR', x + symbolWidth / 2, y + symbolHeight / 2);
        return;
    }
    
    const img = images[symbol.name];
    if (img) {
        ctx.drawImage(img, x, y, symbolWidth, symbolHeight);
    } else {
        // Fallback to text if image is not available
        ctx.fillStyle = '#000';
        ctx.fillRect(x, y, symbolWidth, symbolHeight);
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol.name.toUpperCase(), x + symbolWidth / 2, y + symbolHeight / 2);
    }
}

// Generate random symbols for reel animation
function generateAnimationSymbols() {
    const weightedSymbols = config.symbols.flatMap(symbol =>
        Array(symbol.weight).fill(symbol)
    );
    
    return Array.from({ length: 40 }, () => {
        const randomIndex = Math.floor(Math.random() * weightedSymbols.length);
        return weightedSymbols[randomIndex];
    });
}


// Fetch random reel results
async function fetchReelResults() {
    const results = [];
    
    // Create a weighted array of symbols
    const weightedSymbols = config.symbols.flatMap(symbol =>
        Array(symbol.weight).fill(symbol)
    );
    
    for (let i = 0; i < reelCount; i++) {
        const reel = [];
        for (let j = 0; j < rowCount; j++) {
            const randomIndex = Math.floor(Math.random() * weightedSymbols.length);
            const symbol = weightedSymbols[randomIndex];
            reel.push({ name: symbol.name, isBonus: symbol.isBonus || false });
        }
        results.push(reel);
    }
    //console.log('Generated reel results:', JSON.stringify(results, null, 2));
    return results;
}

async function spinReels() {
    if (isBonusActive) {
        messageElement.textContent = 'Finish the bonus game first!';
        return;
    }
    
    if (balance < config.betAmount) {
        messageElement.textContent = 'Not enough balance!';
        return;
    }
    
    balance -= config.betAmount;
    balanceElement.textContent = `Balance: $${balance}`;
    messageElement.textContent = 'Spinning...';
    
    forcedBonusSpinTracker++; // Increment spin tracker
    
    // Fetch results for all reels
    const finalResults = await fetchReelResults();
    
    const startTime = performance.now();
    
    // Initialize reels for spinning
    reels.forEach((reel, index) => {
        reel.animationSymbols = generateAnimationSymbols(); // Use random symbols for animation
        reel.visible = finalResults[index] || []; // Final result
        reel.spinning = false; // Start as not spinning
        reel.velocity = 50; // Initial velocity
        reel.deceleration = 0.98; // Deceleration factor
        reel.stopTime = config.spinDuration + index * config.reelStopDelay;
        reel.y = 0; // Reset position
        
        // Delay the start of each reel's spinning
        setTimeout(() => {
            reel.spinning = true;
        }, index * config.reelStopDelay);
    });
    
    // Start animation
    requestAnimationFrame(animate);
    
    // Finalize spin after all reels have stopped
    const lastReelStopTime = config.spinDuration + (reels.length - 1) * config.reelStopDelay;
    setTimeout(() => finalizeSpin(finalResults), lastReelStopTime);

    function animate() {
        const elapsed = performance.now() - startTime;
        
        reels.forEach((reel, index) => {
            if (reel.spinning) {
                // Update reel's y position based on velocity
                reel.y += reel.velocity;
                reel.velocity *= reel.deceleration;
                
                // Loop symbols visually during spinning
                if (reel.y >= symbolHeight) {
                    reel.y = 0;
                    reel.animationSymbols.push(reel.animationSymbols.shift());
                }
                
                // Stop the reel if elapsed time exceeds stopTime
                if (elapsed >= reel.stopTime) {
                    stopReel(index); // Call stopReel immediately
                }
            }
        });
        
        // Draw reels
        drawReels();
        
        // Continue animation if any reel is still spinning
        if (reels.some(reel => reel.spinning)) {
            requestAnimationFrame(animate);
        }
    }
    
    function stopReel(index) {
        const reel = reels[index];
        if (!reel.spinning) return; // Ensure stopReel is only called once
        
        reel.spinning = false; // Mark as stopped
        reel.velocity = 0; // Stop movement
        reel.y = 0; // Align to top
        reel.animationSymbols = [...reel.visible]; // Replace with final results
        
        console.log(`Reel ${index + 1} stopped.`);
    }
    
    
}

// Finalize spin and calculate payouts
async function finalizeSpin(results) {
    const winningLines = calculateWinningLines(results);
    console.log(winningLines);
    
    if (winningLines.length > 0) {
        let totalPayout = 0;
        
        for (const line of winningLines) {
            const linePayout = line.payout;
            totalPayout += linePayout;
            
            // Highlight winning line
            await animateWinningLine(line.cells);
        }
        
        balance += totalPayout;
        messageElement.textContent = `You won $${totalPayout}!`;
    } else {
        messageElement.textContent = 'No win. Try again!';
    }
    
    balanceElement.textContent = `Balance: $${balance}`;
}

// Calculate winning lines
function calculateWinningLines(results) {
    const winningLines = [];
    
    config.paylines.forEach((payline, index) => {
        const lineSymbols = payline.map((row, reelIndex) => results[reelIndex][row]);
        const firstSymbol = lineSymbols[0]?.name;
        
        if (!firstSymbol) return;
        
        let matchCount = 1;
        for (let i = 1; i < lineSymbols.length; i++) {
            if (lineSymbols[i]?.name === firstSymbol) {
                matchCount++;
            } else {
                break;
            }
        }
        
        if (matchCount >= 3) {
            const payout = config.paytable[firstSymbol]?.[matchCount] || 0;
            if (payout > 0) {
                const cells = payline.slice(0, matchCount).map((row, reelIndex) => ({ reel: reelIndex, row }));
                winningLines.push({ cells, payout });
            }
        }
    });
    
    return winningLines;
}

// Animate winning line
function animateWinningLine(cells) {
    return new Promise(resolve => {
        let frame = 0;
        const interval = setInterval(() => {
            frame++;
            drawReels(frame % 2 === 0 ? cells : []); // Blink effect
            
            if (frame >= 6) {
                clearInterval(interval);
                resolve();
            }
        }, 300); // Blink every 300ms
    });
}

// Initialize the game
async function initializeGame() {
    try {
        await preloadImages();
        initJackpots();
        initReels();
        drawReels();
        
        balanceElement.textContent = `Balance: $${balance}`;
    } catch (error) {
        console.error('Failed to load images:', error);
        messageElement.textContent = 'Failed to load game resources.';
    }
}

spinButton.addEventListener('click', spinReels);
initializeGame();
