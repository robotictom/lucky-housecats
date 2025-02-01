const config = {
    balance: 100,
    reels: 5,
    rows: 3,
    spinDuration: 5000,
    reelStopDelay: 750,
    reelSymbolCount: 64,
    numberOfRotations: 1,
    creditvalue: [0.01, 0.02, 0.05, 0.1, 1, 2, 5],
    symbols: [
        {
            name: 'cherry',
            src: 'images/cherry.png',
            weight: 20,
            paytable: { 3: 5, 4: 10, 5: 40 },
        },
        {
            name: 'carrot',
            src: 'images/carrot.png',
            weight: 20,
            paytable: { 3: 10, 4: 20, 5: 50 },
        },
        {
            name: 'ham',
            src: 'images/ham.png',
            weight: 15,
            paytable: { 3: 15, 4: 30, 5: 60 },
        },
        {
            name: 'bed',
            src: 'images/bed.png',
            weight: 10,
            paytable: { 3: 20, 4: 40, 5: 70 },
        },
        {
            name: 'brush',
            src: 'images/brush.png',
            weight: 10,
            paytable: { 3: 25, 4: 50, 5: 80 },
        },
        {
            name: 'pickle',
            src: 'images/pickle.png',
            weight: 10,
            paytable: { 3: 30, 4: 60, 5: 100 },
        },
        {
            name: 'feedme',
            src: 'images/feedme.png',
            weight: 5,
            paytable: { 3: 35, 4: 70, 5: 120 },
        },
        {
            name: 'karen',
            src: 'images/karen.png',
            weight: 10,
            paytable: { 3: 40, 4: 80, 5: 150 },
        },
        {
            name: 'lilly',
            src: 'images/lilly.png',
            weight: 10,
            paytable: { 3: 10, 4: 50, 5: 250 },
        },
        {
            name: 'bonus',
            src: 'images/bonus.webp',
            weight: 0,
            isbonus: true,
            paytable: { 3: 50, 4: 100, 5: 500 },
        },
    ],
    sounds: {   
        spinStart: 'sounds/spin.mp3',
        reelStop: 'sounds/stop.wav',
    },
    paylines: [
        // Horizontal lines

        [1, 1, 1, 1, 1], // Middle row
        [0, 0, 0, 0, 0], // Top row
        [2, 2, 2, 2, 2], // Bottom row

        // Diagonals
        [0, 1, 2, 1, 0], // V shape (diagonal from top-left, middle, bottom-right)
        [2, 1, 0, 1, 2], // Reverse V shape (diagonal from bottom-left, middle, top-right)

        [1, 0, 0, 0, 1],
        [1, 2, 2, 2, 1],
        [2, 2, 1, 0, 0],
        [0, 0, 1, 2, 2],
        [0, 0, 1, 2, 2],
        [0, 1, 1, 1, 2],
        [1, 2, 1, 0, 1],
        [1, 0, 1, 2, 1],
        [0, 1, 0, 1, 0],
        [2, 1, 2, 1, 2],
        [1, 1, 0, 1, 1],
        [1, 1, 2, 1, 1],
        [0, 2, 0, 2, 0],
        [2, 0, 2, 0, 2],
        [2, 0, 1, 0, 2],
    ],
    jackpot: {
        mini: 50,
        minor: 100,
        major: 500,
        grand: 1000,
    },
};
