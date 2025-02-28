const config = {
    name: 'Lucky Housecats',
    balance: 100,
    reels: 5,
    rows: 3,
    spinDuration: 3000,
    reelStopDelay: 600,
    reelSymbolCount: 64,
    numberOfRotations: 1,
    creditvalue: [0.01, 0.02, 0.05, 0.1, 0.25, 1, 2, 5],
    symbols: [
        {
            name: 'cherry',
            src: 'images/cherry.png',
            weight: 20,
            isbonus: false,
            paytable: { 3: 5, 4: 10, 5: 40 },
        },
        {
            name: 'carrot',
            src: 'images/carrot.png',
            weight: 20,
            isbonus: false,
            paytable: { 3: 10, 4: 20, 5: 50 },
        },
        {
            name: 'ham',
            src: 'images/ham.png',
            weight: 15,
            isbonus: false,
            paytable: { 3: 15, 4: 30, 5: 60 },
        },
        {
            name: 'bed',
            src: 'images/bed.png',
            weight: 10,
            isbonus: false,
            paytable: { 3: 20, 4: 40, 5: 70 },
        },
        {
            name: 'brush',
            src: 'images/brush.png',
            weight: 10,
            isbonus: false,
            paytable: { 3: 25, 4: 50, 5: 80 },
        },
        {
            name: 'pickle',
            src: 'images/pickle.png',
            weight: 10,
            isbonus: false,
            paytable: { 3: 30, 4: 60, 5: 100 },
        },
        {
            name: 'feedme',
            src: 'images/feedme.png',
            weight: 5,
            isbonus: false,
            paytable: { 3: 35, 4: 70, 5: 120 },
        },
        {
            name: 'karen',
            src: 'images/karen.png',
            weight: 10,
            isbonus: false,
            paytable: { 3: 40, 4: 80, 5: 150 },
        },
        {
            name: 'lilly',
            src: 'images/lilly.png',
            weight: 10,
            isbonus: false,
            paytable: { 3: 10, 4: 50, 5: 250 },
        },
        {
            name: 'bonus',
            src: 'images/bonus.webp',
            weight: 0,
            isbonus: true,
            paytable: {},
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
    bonus: {
        trigger: 3,
        jackpot: {
            mini: 50,
            minor: 100,
            major: 500,
            grand: 1000,
        },
        symbols: [
            {
                name: 'multiplier_1x',
                multiplier: 1,
                weight: 10,
            },
            {
                name: 'multiplier_1x',
                multiplier: 1,
                weight: 10,
            },
            {
                name: 'multiplier_1x',
                multiplier: 1,
                weight: 10,
            },
            {
                name: 'multiplier_2x',
                multiplier: 2,
                weight: 50,
            },
            {
                name: 'multiplier_3x',
                multiplier: 3,
                weight: 50,
            },
            {
                name: 'multiplier_4x',
                multiplier: 4,
                weight: 50,
            },
            {
                name: 'multiplier_5x',
                multiplier: 5,
                weight: 25,
            },
            {
                name: 'multiplier_10x',
                multiplier: 10,
                weight: 10,
            },
            {
                name: 'multiplier_15x',
                multiplier: 15,
                weight: 5,
            },
            {
                name: 'multiplier_20x',
                multiplier: 20,
                weight: 5,
            },
            {
                name: 'multiplier_25x',
                multiplier: 25,
                weight: 5,
            },
            {
                name: 'multiplier_50x',
                multiplier: 50,
                weight: 5,
            },
            {
                name: 'jackpot_mini',
                jackpot: 'mini',
                color: '#0000FF',
                weight: 50,
            },
            {
                name: 'jackpot_minor',
                jackpot: 'minor',
                color: '#008000',
                weight: 25,
            },
            {
                name: 'jackpot_major',
                jackpot: 'major',
                color: '#FFFF00',
                weight: 25,
            },
            {
                name: 'jackpot_grand',
                jackpot: 'grand',
                color: '#FF0000',
                weight: 25,
            },
        ],
    },
};
