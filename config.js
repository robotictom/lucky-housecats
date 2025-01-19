const config = {
    balance: 1000,
    reels: 5,
    rows: 3,
    spinDuration: 2000,
    reelStopDelay: 300,
    betAmount: 10,
    symbols: [
        { name: 'cherry', src: 'images/cherry.webp', weight: 30 },
        { name: 'seven', src: 'images/seven.webp', weight: 20 },
        { name: 'bell', src: 'images/bell.webp', weight: 10 },
        { name: 'bonus', src: 'images/bonus.webp', weight: 5, isBonus: true }
    ],  
    paylines: [
        // Horizontal lines
        [0, 0, 0, 0, 0], // Top row
        [1, 1, 1, 1, 1], // Middle row
        [2, 2, 2, 2, 2], // Bottom row
        
        // Diagonals
        [0, 1, 2, 1, 0], // V shape (diagonal from top-left, middle, bottom-right)
        [2, 1, 0, 1, 2], // Reverse V shape (diagonal from bottom-left, middle, top-right)
        
        /*
        
        // X shape
        [0, 1, 2, 1, 0], // Top-left to bottom-right (part of V)
        [2, 1, 0, 1, 2]  // Bottom-left to top-right (part of reverse V)
        */
    ],
    paytable: {
        cherry: { 3: 10, 4: 50, 5: 100 },
        seven: { 3: 20, 4: 100, 5: 200 },
        bell: { 3: 15, 4: 75, 5: 150 },
        bar: { 3: 25, 4: 125, 5: 250 }
    },
    jackpot: {
        mini: 50,
        minor: 100,
        major: 500,
        grand: 1000
    }
};
