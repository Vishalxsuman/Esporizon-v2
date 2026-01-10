// Game Mode Configuration for Colour Prediction
export const GAME_MODES = {
    '30s': {
        id: '30s',
        label: 'Win Go 30s',
        duration: 30, // seconds
        lockTime: 5,  // seconds before end
        collectionName: 'prediction-30s'
    },
    '1min': {
        id: '1min',
        label: 'Win Go 1 Min',
        duration: 60,
        lockTime: 5,
        collectionName: 'prediction-1min'
    },
    '3min': {
        id: '3min',
        label: 'Win Go 3 Min',
        duration: 180,
        lockTime: 5,
        collectionName: 'prediction-3min'
    },
    '5min': {
        id: '5min',
        label: 'Win Go 5 Min',
        duration: 300,
        lockTime: 5,
        collectionName: 'prediction-5min'
    }
}

// Payout Multipliers
export const PAYOUT_MULTIPLIERS = {
    color: {
        Red: 1.95,
        Green: 1.95,
        Violet: 4.5
    },
    number: 9,
    bigSmall: 1.95
}

// Number to Color Mapping
export const getNumberColors = (num) => {
    if (num === 0) return ['Green', 'Violet']
    if (num === 5) return ['Green', 'Red']
    if ([1, 3, 7, 9].includes(num)) return ['Green']
    return ['Red'] // 2, 4, 6, 8
}

// Big/Small Classification
export const getBigSmall = (num) => {
    return num >= 5 ? 'Big' : 'Small'
}

// Period ID Generator
export const generatePeriodId = (modeId, counter) => {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const counterStr = counter.toString().padStart(4, '0')
    return `${dateStr}${counterStr}`
}

// Validate Game Mode
export const isValidGameMode = (modeId) => {
    return Object.keys(GAME_MODES).includes(modeId)
}

// Get Mode Config
export const getModeConfig = (modeId) => {
    return GAME_MODES[modeId]
}
