const gameUI = {
    config: {},
    dimensions: {},
    jackpot: {},
    status: {},
    player: {},
    sounds: {},
};

const canvas = document.getElementById('slotCanvas');
const ctx = canvas.getContext('2d');

const preloader = document.getElementById('preloader');
const preloaderAnimation = document.getElementById('preloader-animation');
const preloaderAction = document.getElementById('preloader-action');
const gamewrapper = document.getElementById('gamewrapper');

gameUI.config.spinButton = document.getElementById('spin');
const slotContainer = document.getElementById('slotContainerSizer');

let breakCounter = 0;

const debugmode = false;

gameUI.status.gameState = {
    LOADING: 'LOADING',
    IDLE: 'IDLE',
    SPINNING: 'SPINNING',
    STOPPING: 'STOPPING',
    CALCULATING_PAYOUT: 'CALCULATING_PAYOUT',
    SHOWING_PAYOUT: 'SHOWING_PAYOUT',
    BONUS: 'BONUS',
};

let currentState = gameUI.status.gameState.LOADING;

gameUI.config.reelCount = config.reels;
gameUI.config.rowCount = config.rows;
gameUI.config.reelSymbolCount = config.reelSymbolCount;
gameUI.config.reelSpinSpeed = 80;
gameUI.config.reelSpacing = 0;
gameUI.config.reelStopIncrement = 2;

const reels = [];
const images = {};

function setState(newState) {
    console.log(`State changed from ${currentState} to ${newState}`);
    currentState = newState;

    const spinClasses = ['pulse', 'disabled'];

    switch (newState) {
        case gameUI.status.gameState.IDLE:
            gameUI.config.spinButton.classList.remove(...spinClasses);
            break;
        case gameUI.status.gameState.SPINNING:
            gameUI.config.spinButton.classList.add(...spinClasses);
        default:
            break;
    }

    if (debugmode) {
        debugReels();
    }
}

function isState(state) {
    return currentState === state;
}

function preloadImages() {
    return Promise.all(
        config.symbols.map((symbol) => {
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
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatCredit(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

function initUI() {
    gameUI.player.balance = config.balance;
    gameUI.player.selectedPayLines = config.paylines.length;
    gameUI.player.selectedCoinIndex = 0;
    gameUI.player.selectedCoinValue = config.creditvalue[gameUI.player.selectedCoinIndex];
    gameUI.player.userAudio = true;

    const containerWidth = slotContainerSizer.clientWidth;

    gameUI.dimensions = calculateDimensions(slotContainer.offsetWidth);

    function calculateDimensions(width) {
        let gameWidth, gameHeight, symbolWidth, symbolHeight;

        const gameUIRows = document.querySelectorAll('.gameUI');
        let totalGameUIHeight = 0;

        gameUIRows.forEach((row) => {
            totalGameUIHeight += row.clientHeight;
        });

        const availableHeight = window.innerHeight - totalGameUIHeight;

        symbolWidth = Math.floor(width / gameUI.config.reelCount);
        symbolHeight = symbolWidth;
        gameHeight = symbolHeight * gameUI.config.rowCount;
        gameWidth = width;

        if (gameHeight > availableHeight) {
            symbolHeight = Math.floor(availableHeight / gameUI.config.rowCount);
            symbolWidth = symbolHeight;
            gameHeight = symbolHeight * gameUI.config.rowCount;
            gameWidth = symbolWidth * gameUI.config.reelCount;

            gamewrapper.style.width = `${gameWidth}px`;
        }

        return {
            gameWidth: gameWidth,
            gameHeight: gameHeight,
            symbolWidth: symbolWidth,
            symbolHeight: symbolHeight,
        };
    }

    Object.keys(config.bonus.jackpot).forEach((level) => {
        gameUI.jackpot[level] = document.getElementById(`gameUI-jackpot_${level}`);
    });

    gameUI.balanceElement = document.getElementById('gameUI-balance');
    gameUI.balanceElementModal = document.getElementById('gameUI-balance-modal');
    gameUI.messageElement = document.getElementById('gameUI-message');

    gameUI.payLines = document.getElementById('gameUI-lines');
    gameUI.creditValue = document.getElementById('gameUI-creditvalue');
    gameUI.totalBet = document.getElementById('gameUI-totalbet');

    gameUI.volume = document.querySelector('button[data-action="sound"]');

    const buttons = document.querySelectorAll('button.gameUI-action');

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const action = button.getAttribute('data-action');
            const increment = Number(button.getAttribute('data-increment'));

            switch (action) {
                case 'addbalance':
                    gameUI.player.balance += increment;
                    drawUI();
                    break;
                case 'lines':
                    gameUI.player.selectedPayLines += increment;

                    if (gameUI.player.selectedPayLines > config.paylines.length) {
                        gameUI.player.selectedPayLines = 1;
                    }
                    if (gameUI.player.selectedPayLines < 1) {
                        gameUI.player.selectedPayLines = config.paylines.length;
                    }

                    const positions = [];

                    const line = config.paylines[gameUI.player.selectedPayLines - 1];

                    for (let i = 0; i < line.length; i++) {
                        const cell = line[i];

                        const x = i * gameUI.dimensions.symbolWidth + gameUI.dimensions.symbolWidth / 2;
                        const y = cell * gameUI.dimensions.symbolHeight + gameUI.dimensions.symbolHeight / 2;

                        if (i === 0) {
                            positions.push({ x: i * gameUI.dimensions.symbolWidth, y: y });
                            positions.push({ x: x, y: y });
                        } else if (i === line.length - 1) {
                            positions.push({ x: x, y: y });
                            positions.push({
                                x: i * gameUI.dimensions.symbolWidth,
                                y: y,
                            });
                        } else {
                            positions.push({ x: x, y: y });
                        }
                    }

                    drawLine(positions, true);

                    break;
                case 'coinvalue':
                    gameUI.player.selectedCoinIndex += increment;

                    if (gameUI.player.selectedCoinIndex > config.creditvalue.length - 1) {
                        gameUI.player.selectedCoinIndex = 1;
                    }
                    if (gameUI.player.selectedCoinIndex < 0) {
                        gameUI.player.selectedCoinIndex = config.creditvalue.length - 1;
                    }

                    gameUI.player.selectedCoinValue = config.creditvalue[gameUI.player.selectedCoinIndex];
                    break;
                case 'sound':
                    if (gameUI.player.userAudio === true) {
                        gameUI.player.userAudio = false;
                        gameUI.volume.querySelector('i').textContent = 'volume_off';
                    } else {
                        gameUI.player.userAudio = true;
                        gameUI.volume.querySelector('i').textContent = 'volume_up';
                    }
                    break;
                default:
                    break;
            }
            drawUI();
        });
    });

    const modalElements = document.querySelectorAll('.modal');
    const modalInstances = M.Modal.init(modalElements, {});
}

function drawUI() {
    Object.keys(config.bonus.jackpot).forEach((level) => {
        gameUI.jackpot[level].textContent = formatJackpot(config.bonus.jackpot[level]);
    });

    gameUI.payLines.textContent = gameUI.player.selectedPayLines;
    gameUI.creditValue.textContent = formatCredit(gameUI.player.selectedCoinValue);
    gameUI.totalBet.textContent = formatCredit(gameUI.player.selectedPayLines * gameUI.player.selectedCoinValue);

    gameUI.balanceElement.textContent = formatCredit(gameUI.player.balance);
    gameUI.balanceElementModal.textContent = formatCredit(gameUI.player.balance);
}

function initReels() {
    ctx.canvas.width = gameUI.dimensions.gameWidth;
    ctx.canvas.height = gameUI.dimensions.gameHeight;

    for (let i = 0; i < gameUI.config.reelCount; i++) {
        const symbols = generateRandomSymbols(gameUI.config.reelSymbolCount);
        const lastIndex = symbols.length - 1;
        let target = 0;
        do {
            target = Math.floor(Math.random() * symbols.length);
        } while (Math.abs(target - lastIndex) < gameUI.config.rowCount);

        reels.push({
            id: i + 1,
            state: gameUI.status.gameState.IDLE,
            x: i * (gameUI.dimensions.symbolWidth + gameUI.config.reelSpacing),
            y: -target * gameUI.dimensions.symbolHeight,
            spinning: false,
            target: target,
            stopTime: config.spinDuration + i * config.reelStopDelay,
            symbols: symbols,
        });
    }
    setState(gameUI.status.gameState.IDLE);
}

function drawReels() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    reels.forEach((reel) => {
        const symbolsToDraw = reel.symbols;
        symbolsToDraw.forEach((symbol, index) => {
            const yPos = reel.y + index * gameUI.dimensions.symbolHeight;
            if (yPos > 0 && yPos < gameUI.dimensions.symbolHeight) {
                reel.current = index;
            }
            drawSymbol(reel.x, yPos, symbol);
        });
    });
}

function drawSymbol(x, y, symbol) {
    const symbolWidth = gameUI.dimensions.symbolWidth;
    const symbolHeight = gameUI.dimensions.symbolHeight;
    const img = images[symbol.name];
    ctx.drawImage(img, x, y, symbolWidth, symbolHeight);

    if (symbol.isbonus) {
        ctx.save();
        ctx.font = '28px DotGothic16';
        ctx.fillStyle = symbol?.color || 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const centerX = x + symbolWidth / 2;
        const centerY = y + symbolHeight * 0.65;

        ctx.fillText(symbol?.jackpot?.toUpperCase() || symbol.payout, centerX, centerY);

        ctx.restore();
    }
}

function fetchReelResults(length) {
    let target = Math.floor(Math.random() * length);
    return target;
}

function insertBonusSymbols(symbols, target) {
    const bonusSymbol = config.symbols.find((s) => s.name === 'bonus');
    const weightedSymbols = config.bonus.symbols.flatMap((symbol) => Array(symbol.weight).fill(symbol));

    const numBonus = Math.floor(Math.random() * 7);

    const lowerBound = Math.max(0, target - 5);
    const upperBound = Math.min(symbols.length, target + 5);

    const insertionIndices = [];
    for (let i = 0; i < numBonus; i++) {
        const randomIndex = Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;
        insertionIndices.push(randomIndex);
    }

    insertionIndices.sort((a, b) => b - a);

    insertionIndices.forEach((idx) => {
        const randomIndex = Math.floor(Math.random() * weightedSymbols.length);
        const [symbol] = weightedSymbols.splice(randomIndex, 1);

        bonusSymbol.jackpot = symbol?.jackpot || null;
        bonusSymbol.color = symbol?.jackpot ? symbol.color : null;
        bonusSymbol.payout = symbol?.jackpot
            ? config.bonus.jackpot[symbol.jackpot] / gameUI.player.selectedCoinValue
            : symbol.multiplier * config.paylines.length;

        symbols.splice(idx, 0, { ...bonusSymbol });
    });
    return symbols;
}

function removeBonusSymbols(symbols) {
    return symbols.filter((symbol) => !symbol.isbonus);
}

function generateRandomSymbols(count) {
    const weightedSymbols = config.symbols.flatMap((symbol) => Array(symbol.weight).fill(symbol));

    let randomSymbols = [];

    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * weightedSymbols.length);
        const [symbol] = weightedSymbols.splice(randomIndex, 1);
        randomSymbols.push(symbol);
    }

    randomSymbols = randomSymbols.concat(randomSymbols.slice(0, gameUI.config.rowCount));
    return randomSymbols;
}

async function spinReels() {
    if (!isState(gameUI.status.gameState.IDLE)) {
        console.log('Cannot spin, game is not in IDLE state');
        return;
    }

    if (isState(gameUI.status.gameState.BONUS)) {
        gameUI.messageElement.textContent = 'Finish the bonus game first!';
        return;
    }

    if (gameUI.player.balance < gameUI.player.selectedPayLines * gameUI.player.selectedCoinValue) {
        gameUI.messageElement.textContent = 'Not enough balance!';
        return;
    }

    setState(gameUI.status.gameState.SPINNING);

    gameUI.player.balance -= gameUI.player.selectedPayLines * gameUI.player.selectedCoinValue;
    gameUI.balanceElement.textContent = formatCredit(gameUI.player.balance);
    gameUI.messageElement.textContent = 'Spinning...';

    const startTime = performance.now();

    reels.forEach((reel, index) => {
        reel.spinning = true;
        reel.state = gameUI.status.gameState.SPINNING;
        reel.spinSpeed = gameUI.config.reelSpinSpeed;
    });

    handleAudio('spinStart', 'play');

    requestAnimationFrame(animateSpin);

    function animateSpin() {
        const elapsed = performance.now() - startTime;

        reels.forEach((reel, index) => {
            if (reel.spinning) {
                if (reel.state !== gameUI.status.gameState.STOPPING) {
                    const progress = elapsed / config.spinDuration;
                    const easing = 1 - Math.pow(1 - progress, 2);
                    const newSpeed = reel.spinSpeed * easing;

                    reel.y += newSpeed;

                    if (reel.y >= 0) {
                        reel.y = -gameUI.config.reelSymbolCount * gameUI.dimensions.symbolHeight;
                    }

                    if (
                        elapsed >= reel.stopTime &&
                        (index === 0 || reels[index - 1].spinning === false) &&
                        reel.state !== gameUI.status.gameState.STOPPING
                    ) {
                        let cleanReels = removeBonusSymbols(reel.symbols);

                        reel.target = fetchReelResults(cleanReels.length - gameUI.config.rowCount);
                        reel.symbols = insertBonusSymbols(cleanReels, reel.target);
                        reel.state = gameUI.status.gameState.STOPPING;
                        reel.spinSpeed = 20;
                        reel.offset = gameUI.dimensions.symbolHeight / 4;
                        reel.y = -reel.target * gameUI.dimensions.symbolHeight + reel.offset;
                    }
                } else if (reel.state === gameUI.status.gameState.STOPPING) {
                    if (reel.offset > 0) {
                        reel.offset = reel.offset - gameUI.config.reelStopIncrement;
                        reel.y = -reel.target * gameUI.dimensions.symbolHeight + reel.offset;
                    } else {
                        stopReel(index);
                    }
                }
            }
        });

        drawReels();

        if (reels.some((reel) => reel.spinning)) {
            requestAnimationFrame(animateSpin);
        } else {
            setState(gameUI.status.gameState.CALCULATING_PAYOUT);
            const results = [];

            reels.forEach((reel, index) => {
                const target = reel.target;
                const reelRows = [];

                for (let row = 0; row < gameUI.config.rowCount; row++) {
                    reelRows.push(target + row);
                }

                results[index] = reelRows;
            });
            finalizeSpin(results);
        }
    }

    function stopReel(index) {
        const reel = reels[index];
        if (!reel.spinning) return;

        reel.spinning = false;
        reel.state = gameUI.status.gameState.IDLE;

        const playbackRate = gameUI.sounds.playbackRate[index];

        handleAudio('reelStop', 'play', playbackRate);
        console.log(`Reel ${index + 1} stopped.`);
    }
}

async function finalizeSpin(results) {
    handleAudio('spinStart', 'stop');

    const winningLines = calculateWinningLines(results);
    const bonus = calculateBonusLines(results);

    if (bonus.active) {
        setState(gameUI.status.gameState.BONUS);
    }

    if (winningLines.length > 0 || bonus.active) {
        let totalPayout = bonus.payout ? bonus.payout : 0;

        for (const line of winningLines) {
            const linePayout = line.payout;
            totalPayout += linePayout;
            animateWinningLine(line);
        }

        totalPayout = totalPayout * gameUI.player.selectedCoinValue;

        gameUI.player.balance += totalPayout;
        gameUI.messageElement.textContent = `You won ${formatCredit(totalPayout)}!`;
    } else {
        gameUI.messageElement.textContent = 'No win. Try again!';
    }

    gameUI.balanceElement.textContent = formatCredit(gameUI.player.balance);
    setState(gameUI.status.gameState.IDLE);
}

function calculateBonusLines(results) {
    if (!results || results.length === 0) {
        console.error('Invalid results array in calculateBonusLines');
        return [];
    }

    const bonus = {
        active: false,
        payout: 0,
        count: 0,
    };

    let bonusCount = 0;
    let bonusPayout = 0;

    reels.forEach((reel, index) => {
        const reelResults = results[index];

        for (let index = 0; index < reelResults.length; index++) {
            const reelIndex = reelResults[index];
            if (reel.symbols[reelIndex].isbonus) {
                bonusCount++;
                bonusPayout += reel.symbols[reelIndex].payout;
            }
        }
    });

    if (bonusCount >= config.bonus.trigger) {
        bonus.active = true;
        bonus.payout = bonusPayout;
        bonus.count = bonusCount;
    }

    return bonus;
}

function calculateWinningLines(results) {
    if (!results || results.length === 0) {
        console.error('Invalid results array in calculateWinningLines');
        return [];
    }

    const winningLines = [];

    const symbolMap = config.symbols.reduce((acc, symbol) => {
        acc[symbol.name] = symbol;
        return acc;
    }, {});

    config.paylines.forEach((payline, index) => {
        if (index <= gameUI.player.selectedPayLines) {
            const lineSymbols = payline.map((row, reelIndex) => {
                if (!results[reelIndex] || !results[reelIndex][row]) {
                    return null;
                }
                return reels[reelIndex].symbols[results[reelIndex][row]];
            });
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
                const payout = symbolMap[firstSymbol]?.paytable[matchCount] || 0;
                if (payout > 0) {
                    const cells = payline.map((row, reelIndex) => ({
                        reel: reelIndex,
                        row,
                    }));
                    winningLines.push({ index, cells, payout });
                }
            }
        }
    });

    return winningLines;
}

function animateWinningLine(line) {
    console.log(`Winning line: ${line.index + 1} pays out ${line.payout}`);

    new M.Toast({ text: `Winning line: ${line.index + 1}` });

    const positions = [];

    for (let i = 0; i < line.cells.length; i++) {
        const cell = line.cells[i];

        const x = cell.reel * gameUI.dimensions.symbolWidth + gameUI.dimensions.symbolWidth / 2;
        const y = cell.row * gameUI.dimensions.symbolHeight + gameUI.dimensions.symbolHeight / 2;

        if (i === 0) {
            positions.push({ x: cell.reel * gameUI.dimensions.symbolWidth, y: y });
            positions.push({ x: x, y: y });
        } else if (i === line.cells.length - 1) {
            positions.push({ x: x, y: y });
            positions.push({
                x: (cell.reel + 1) * gameUI.dimensions.symbolWidth,
                y: y,
            });
        } else {
            positions.push({ x: x, y: y });
        }
    }
    drawLine(positions);
}

function drawLine(positions, clear) {
    if (clear) {
        drawReels();
    }

    ctx.beginPath();

    ctx.moveTo(positions[0].x, positions[0].y);

    for (let i = 1; i < positions.length; i++) {
        const pos = positions[i];
        ctx.lineTo(pos.x, pos.y);
    }

    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(255, 111, 0, 0.7)';
    ctx.stroke();
}

async function initializeGame() {
    try {
        await preloadImages();
        initUI();
        initReels();
        initAudio();
        drawUI();
        drawReels();

        gameUI.config.spinButton.addEventListener('click', spinReels);

        const buttons = preloaderAction.querySelectorAll('button');

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                button.getAttribute('data-volume') === 'true'
                    ? (gameUI.player.userAudio = true)
                    : (gameUI.player.userAudio = false);

                preloader.classList.add('hide');
                gamewrapper.classList.remove('hide');
            });
        });

        preloaderAnimation.classList.add('hide');
        preloaderAction.classList.remove('hide');
    } catch (error) {
        console.error('Failed:', error);
        gameUI.messageElement.textContent = 'Failed to load game resources.';
    }
}

function initAudio() {
    for (let eventName in config.sounds) {
        if (config.sounds.hasOwnProperty(eventName)) {
            let audio = new Audio(config.sounds[eventName]);
            audio.preload = 'auto';
            gameUI.sounds[eventName] = audio;
        }
    }

    gameUI.sounds.playbackRate = [1.2, 1.2, 1.4, 1.6, 1.8];
}

function handleAudio(eventName, action, playbackrate) {
    if (!gameUI.player.userAudio) {
        console.log('Audio is disabled. Sound will not play.');
        return;
    }

    if (!playbackrate) {
        playbackrate = 1;
    }

    if (gameUI.sounds[eventName]) {
        const audio = gameUI.sounds[eventName];

        switch (action) {
            case 'play':
                audio.playbackRate = playbackrate;
                audio.play();
                break;
            case 'stop':
                audio.pause();
                audio.currentTime = 0;
            default:
                break;
        }
    }
}

function debugReels() {
    let debug = [];

    reels.forEach((reel, index) => {
        debug.push({
            id: reel.id,
            state: reel.state,
            y: reel.y,
            current: reel.current,
            target: reel.target,
            targetSymbol:
                reel.target != null && reel.target >= 0 && reel.target < reel.symbols.length
                    ? reel.symbols[reel.target].name
                    : undefined,
        });
    });

    console.table(debug);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});
