const ESPO_TO_INR = 2.5 // 2.5 Espo Coin = ₹1

export const espoToINR = (espoCoins: number): number => {
    return espoCoins / ESPO_TO_INR
}

export const inrToEspo = (inr: number): number => {
    return inr * ESPO_TO_INR
}

export const formatEspoCoins = (amount: number): string => {
    return `${amount.toLocaleString()} EC`
}

export const formatWithINR = (espoCoins: number): string => {
    const inr = espoToINR(espoCoins)
    return `${espoCoins.toLocaleString()} EC (₹${inr.toFixed(2)})`
}

export const formatINRWithEspo = (inr: number): string => {
    const espo = inrToEspo(inr)
    return `₹${inr.toFixed(2)} (${espo.toLocaleString()} EC)`
}
