import { useEffect } from 'react'
import { matchService } from '@/services/MatchService'
import type { Match, GameState } from '@/types/match'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/services/firebase'

/**
 * Custom hook for Card29 bot logic
 * ALWAYS executes - conditional logic is INSIDE the effect
 */
export const useCard29Bots = (
    matchId: string | undefined,
    match: Match | null,
    gameState: GameState | null,
    userId: string | undefined,
    enabled: boolean
) => {
    // Bot population - Host only
    useEffect(() => {
        // Conditional logic INSIDE effect, not around it
        if (!enabled || !match || !matchId || !userId) return
        if (match.creatorId !== userId) return
        if (match.players.length >= match.maxPlayers) return

        const fillBots = async () => {
            try {
                // console.log("Adding bot to match...")
                await matchService.addBotToMatch(matchId)
            } catch (e) {
                console.error('Failed to add bot', e)
            }
        }

        const timer = setTimeout(fillBots, 1000)
        return () => clearTimeout(timer)
    }, [enabled, match?.players.length, match?.id, matchId, userId])

    // Bot move logic - Playing phase
    useEffect(() => {
        if (!enabled || !gameState || !match || !userId || !matchId) return
        if (gameState.phase !== 'playing') return

        const currentPlayerObj = match.players[gameState.currentPlayer]
        if (!currentPlayerObj?.isBot) return
        if (match.creatorId !== userId) return

        // Forced Move Guard: If bot stalls for more than 35s, host forces a move
        const timeLeft = getTimeLeftSync(gameState)
        if (timeLeft === '0:00') {
            console.warn(`[BotGuard] ${currentPlayerObj.userName} stalled. Forcing move...`)
        }

        const makeBotMove = async (botId: string) => {
            const botHand = gameState.hands[botId] || []
            if (botHand.length === 0) {
                console.error(`[Bot] ${botId} has no cards but it's their turn!`)
                return
            }

            // 1. Check for Pair Declaration (K & Q of Trump)
            const hasKing = botHand.some(c => c.suit === gameState.trumpSuit && c.rank === 'K')
            const hasQueen = botHand.some(c => c.suit === gameState.trumpSuit && c.rank === 'Q')
            if (gameState.trumpRevealed && gameState.trumpSuit && hasKing && hasQueen && !gameState.pairDeclaredBy) {
                console.log(`[Bot] ${currentPlayerObj.userName} declaring PAIR!`)
                await matchService.declarePair29(matchId, botId, gameState, match.players)
                return
            }

            const ledSuit = gameState.currentTrick.length > 0 ? gameState.currentTrick[0].card.suit : null
            const trumpSuit = gameState.trumpSuit

            let validCards = botHand
            if (ledSuit) {
                const followSuitCards = botHand.filter(c => c.suit === ledSuit)
                if (followSuitCards.length > 0) {
                    validCards = followSuitCards
                } else if (!gameState.trumpRevealed && trumpSuit) {
                    // Bot cannot follow suit - ASK FOR TRUMP
                    console.log(`[Bot] ${currentPlayerObj.userName} asking for trump...`)
                    await matchService.revealTrump29(matchId, gameState)
                    return
                } else if (gameState.trumpRevealed && trumpSuit) {
                    const trumpCards = botHand.filter(c => c.suit === trumpSuit)
                    if (trumpCards.length > 0) {
                        validCards = trumpCards
                    }
                }
            }

            // SMARTER CARD SELECTION
            let cardToPlay: any
            if (gameState.currentTrick.length === 0) {
                // Leading: Play a high card if having many of that suit, or a scoring card
                const scoringCards = validCards.filter(c => ['J', '9', 'A', '10'].includes(c.rank))
                cardToPlay = scoringCards.length > 0 ? scoringCards[0] : validCards[0]
            } else {
                // Following:
                const trickWinnerId = matchService.determineTrickWinner(gameState.currentTrick, gameState.trumpRevealed ? gameState.trumpSuit : null)
                const isPartnerWinning = match.players.findIndex(p => p.userId === trickWinnerId) % 2 === gameState.currentPlayer % 2

                if (isPartnerWinning) {
                    // Play lowest possible non-scoring card to save high cards
                    const lowCards = validCards.filter(c => !['J', '9', 'A', '10'].includes(c.rank))
                    cardToPlay = lowCards.length > 0 ? lowCards[0] : validCards[0]
                } else {
                    // Try to win the trick with the lowest possible winning card
                    cardToPlay = validCards.sort((a, b) => {
                        const values: any = { 'J': 8, '9': 7, 'A': 6, '10': 5, 'K': 4, 'Q': 3, '8': 2, '7': 1 }
                        return values[b.rank] - values[a.rank]
                    })[0]
                }
            }

            if (!cardToPlay) cardToPlay = validCards[0]

            console.log(`[Bot] ${currentPlayerObj.userName} (Seat ${gameState.currentPlayer}) playing card:`, cardToPlay)
            try {
                await matchService.playCard29(matchId, botId, cardToPlay, gameState, match.players)
            } catch (e) {
                console.error('[BotPlayError]', e)
            }
        }

        // HUMAN-LIKE bot card play - 2.5-3 second delay
        const botDelay = 2500 + Math.random() * 500
        const timeout = setTimeout(async () => {
            try {
                await makeBotMove(currentPlayerObj.userId)
            } catch (e) {
                console.error('[BotError]', e)
            }
        }, botDelay)

        return () => clearTimeout(timeout)
    }, [enabled, gameState?.currentPlayer, gameState?.phase, gameState?.trumpRevealed, match?.id, matchId, userId])

    // Helper for sync time check
    const getTimeLeftSync = (gameState: any) => {
        if (!gameState || !gameState.turnStartedAt) return '30'
        const now = Date.now()
        let startedAtMs: number
        if (gameState.turnStartedAt && typeof gameState.turnStartedAt.toMillis === 'function') {
            startedAtMs = gameState.turnStartedAt.toMillis()
        } else if (gameState.turnStartedAt && gameState.turnStartedAt.seconds) {
            startedAtMs = gameState.turnStartedAt.seconds * 1000
        } else {
            startedAtMs = new Date(gameState.turnStartedAt).getTime()
        }
        const duration = gameState.turnDuration || 30
        const diff = Math.max(0, duration - Math.floor((now - startedAtMs) / 1000))
        return `0:${diff.toString().padStart(2, '0')}`
    }

    // Bot bidding logic
    useEffect(() => {
        if (!enabled || !gameState || !match || !userId || !matchId) return
        if (gameState.phase !== 'bidding') return

        const currentBidderObj = match.players[gameState.currentBidder]
        if (!currentBidderObj?.isBot) return
        if (match.creatorId !== userId) return

        // 0. Strict Pass Check - If bot already passed, DO NOT BID AGAIN
        if (gameState.passedPlayers?.includes(currentBidderObj.userId)) {
            console.log(`[Bot] ${currentBidderObj.userName} has already passed. Skipping loop.`)
            return
        }

        const makeBotBid = async () => {
            const botHand = gameState.hands[currentBidderObj.userId] || []
            const values: any = { 'J': 3, '9': 2, 'A': 1, '10': 1 }
            const points = botHand.reduce((acc, card) => acc + (values[card.rank] || 0), 0)

            // SMARTER BIDDING: Check for Jacks and Suits
            let bidAmount: number | 'pass' = 'pass'
            const currentHighest = gameState.highestBid?.amount || 15
            const isBotWinning = gameState.highestBid?.playerId === currentBidderObj.userId

            // Bot Bid threshold logic
            const canHold16 = points >= 3
            const canHold18 = points >= 5
            const canHold20 = points >= 7

            if (isBotWinning) {
                // Someone matched us, should we raise?
                const nextRequired = currentHighest + 1
                if (nextRequired <= 18 && canHold18) bidAmount = nextRequired
                else if (nextRequired <= 20 && canHold20) bidAmount = nextRequired
            } else {
                // Should we match or raise?
                if (currentHighest < 16 && canHold16) {
                    bidAmount = 16
                } else if (currentHighest <= 18 && canHold18) {
                    bidAmount = currentHighest // Match current
                } else if (currentHighest <= 20 && canHold20) {
                    bidAmount = currentHighest // Match current
                }
            }

            console.log(`[Bot] ${currentBidderObj.userName} decides to: ${bidAmount} (points: ${points}, winning: ${isBotWinning})`)

            try {
                await matchService.makeBid29(matchId, currentBidderObj.userId, bidAmount, gameState, match.players)
            } catch (e) {
                console.error('[BotBidError]', e)
            }
        }

        // HUMAN-LIKE bot response - 2.5-3 second delay (watchable)
        const botDelay = 2500 + Math.random() * 500 // Random 2.5-3s
        const timeout = setTimeout(makeBotBid, botDelay)
        return () => clearTimeout(timeout)
    }, [enabled, gameState?.currentBidder, gameState?.phase, match?.id, matchId, userId])

    // Bot trump selection - ONLY for bid winner bot
    useEffect(() => {
        if (!enabled || !gameState || !match || !userId || !matchId) return
        if (gameState.trumpSuit) return // Already selected
        if (gameState.phase !== 'playing') return // Must be in playing phase

        // Check if bid winner is a bot
        const bidWinnerObj = match.players.find(p => p.userId === gameState.bidWinner)
        if (!bidWinnerObj?.isBot || match.creatorId !== userId) return

        const selectTrump = async () => {
            const botHand = gameState.hands[bidWinnerObj.userId] || []
            const suitCounts: any = { 'H': 0, 'D': 0, 'C': 0, 'S': 0 }
            botHand.forEach(c => suitCounts[c.suit]++)

            const bestSuit = Object.keys(suitCounts).reduce((a, b) =>
                suitCounts[a] > suitCounts[b] ? a : b
            ) as 'H' | 'D' | 'C' | 'S'

            console.log(`[Bot] ${bidWinnerObj.userName} (Bid Winner) selects trump: ${bestSuit}`)
            await matchService.selectTrump29(matchId, bidWinnerObj.userId, bestSuit, gameState, match.players)
        }

        const botDelay = 2500 + Math.random() * 500 // Random 2.5-3s
        const timer = setTimeout(selectTrump, botDelay)
        return () => clearTimeout(timer)
    }, [enabled, gameState?.trumpSuit, gameState?.phase, gameState?.bidWinner, match?.players.length, userId])

    // Bot Bain Phase logic (Double/Redouble)
    useEffect(() => {
        if (!enabled || !gameState || !match || !userId || !matchId) return
        if (gameState.bainPhase === 'none' || !gameState.bainPhase) return
        if (match.creatorId !== userId) return

        const currentBainPhase = gameState.bainPhase
        const bidWinnerId = gameState.bidWinner
        const bidWinnerIndex = match.players.findIndex(p => p.userId === bidWinnerId)

        // Find which bot needs to act
        const botToAct = match.players.find(p => {
            if (!p.isBot) return false
            if (currentBainPhase === 'double_chance') {
                // Opponents of bid winner act
                const pIndex = match.players.findIndex(pl => pl.userId === p.userId)
                return (pIndex % 2) !== (bidWinnerIndex % 2)
            } else if (currentBainPhase === 'redouble_chance') {
                // Bid winner acts
                return p.userId === bidWinnerId
            }
            return false
        })

        if (!botToAct) return

        const makeBainDecision = async () => {
            const botHand = gameState.hands[botToAct.userId] || []
            const values: any = { 'J': 3, '9': 2, 'A': 1, '10': 1 }
            const points = botHand.reduce((acc, card) => acc + (values[card.rank] || 0), 0)

            let action: 'double' | 'redouble' | 'skip' = 'skip'

            if (currentBainPhase === 'double_chance' && points >= 6) {
                action = 'double'
            } else if (currentBainPhase === 'redouble_chance' && points >= 8) {
                action = 'redouble'
            }

            console.log(`[BotBain] ${botToAct.userName} decides to ${action} (points: ${points})`)

            let newBainPhase = gameState.bainPhase
            let isDoubled = gameState.isDoubled || false
            let isRedoubled = gameState.isRedoubled || false

            if (currentBainPhase === 'double_chance') {
                if (action === 'double') {
                    isDoubled = true
                    newBainPhase = 'redouble_chance'
                } else {
                    newBainPhase = 'none'
                }
            } else if (currentBainPhase === 'redouble_chance') {
                if (action === 'redouble') {
                    isRedoubled = true
                }
                newBainPhase = 'none'
            }

            const newState = {
                ...gameState,
                bainPhase: newBainPhase,
                isDoubled,
                isRedoubled,
                turnStartedAt: serverTimestamp(),
                lastMoveTime: new Date().toISOString()
            }

            await updateDoc(doc(db, 'matches', matchId), { gameState: newState })
        }

        const botDelay = 2500 + Math.random() * 500
        const timer = setTimeout(makeBainDecision, botDelay)
        return () => clearTimeout(timer)
    }, [enabled, gameState?.bainPhase, gameState?.isDoubled, gameState?.isRedoubled, match?.id, matchId, userId])

    // Normal Bot Play Logic
    useEffect(() => {
        if (!enabled || !gameState || !match || !userId || !matchId) return
        if (gameState.phase !== 'playing' || !gameState.trumpSuit) return

        const currentPlayerObj = match.players[gameState.currentPlayer]
        if (!currentPlayerObj?.isBot || match.creatorId !== userId) return

        const makeBotMove = async () => {
            const botHand = gameState.hands[currentPlayerObj.userId] || []
            if (botHand.length === 0) return

            const getCardValue = (rank: string) => {
                const values: any = { 'J': 3, '9': 2, 'A': 1, '10': 1 }
                return values[rank] || 0
            }

            const getRankPower = (rank: string) => {
                const power: any = { 'J': 8, '9': 7, 'A': 6, '10': 5, 'K': 4, 'Q': 3, '8': 2, '7': 1 }
                return power[rank] || 0
            }

            const currentTrick = gameState.currentTrick || []
            const ledSuit = currentTrick.length > 0 ? currentTrick[0].card.suit : null
            let cardToPlay = botHand[0]

            if (ledSuit) {
                const followCards = botHand.filter(c => c.suit === ledSuit)

                // Identify current winner of the trick
                let bestPower = -1
                let winnerSeat = -1
                currentTrick.forEach((turn: any) => {
                    let power = getRankPower(turn.card.rank)
                    if (turn.card.suit === gameState.trumpSuit && gameState.trumpRevealed) power += 10
                    else if (turn.card.suit !== ledSuit) power = -1 // Points dont count if not following or trumping

                    if (power > bestPower) {
                        bestPower = power
                        winnerSeat = match.players.findIndex(p => p.userId === turn.playerId)
                    }
                })

                const mySeat = gameState.currentPlayer
                const isPartnerWinning = winnerSeat !== -1 && (winnerSeat % 2 === mySeat % 2)

                if (followCards.length > 0) {
                    // Try to win if partner isn't winning
                    if (!isPartnerWinning) {
                        const canWin = followCards.some(c => getRankPower(c.rank) > bestPower)
                        if (canWin) {
                            // Play highest to win
                            cardToPlay = [...followCards].sort((a, b) => getRankPower(b.rank) - getRankPower(a.rank))[0]
                        } else {
                            // Can't win - play lowest "pointless" card
                            cardToPlay = [...followCards].sort((a, b) => getRankPower(a.rank) - getRankPower(b.rank))[0]
                        }
                    } else {
                        // Partner is winning - throw points or safe low card
                        const pointCards = followCards.filter(c => getCardValue(c.rank) > 0)
                        if (pointCards.length > 0) {
                            cardToPlay = pointCards[0] // Help team score
                        } else {
                            cardToPlay = followCards[0]
                        }
                    }
                } else {
                    // Can't follow suit - consider trumping
                    const trumpCards = botHand.filter(c => c.suit === gameState.trumpSuit)
                    const trickPoints = currentTrick.reduce((acc: number, t: any) => acc + getCardValue(t.card.rank), 0)

                    if (!isPartnerWinning && trumpCards.length > 0 && gameState.trumpRevealed) {
                        // Kill it with trump if it has points or high power card
                        if (trickPoints >= 2 || bestPower >= 7) {
                            cardToPlay = [...trumpCards].sort((a, b) => getRankPower(a.rank) - getRankPower(b.rank))[0]
                        } else {
                            cardToPlay = botHand[0] // Save trump
                        }
                    } else if (!gameState.trumpRevealed && !isPartnerWinning && !gameState.trumpRevealed) {
                        // Potentially reveal trump? - Bots for now just throw away low card
                        cardToPlay = [...botHand].sort((a, b) => getRankPower(a.rank) - getRankPower(b.rank))[0]
                    } else {
                        // Can't win/No trump - throw lowest card
                        cardToPlay = [...botHand].sort((a, b) => getRankPower(a.rank) - getRankPower(b.rank))[0]
                    }
                }
            } else {
                // Leading - play highest (Jacks/9s)
                cardToPlay = [...botHand].sort((a, b) => getRankPower(b.rank) - getRankPower(a.rank))[0]
            }

            console.log(`[BotSmartPlay] ${currentPlayerObj.userName} plays ${cardToPlay.rank} of ${cardToPlay.suit}`)
            await matchService.playCard29(matchId, currentPlayerObj.userId, cardToPlay, gameState, match.players)
        }

        const botDelay = 2500 + Math.random() * 500
        const timer = setTimeout(makeBotMove, botDelay)
        return () => clearTimeout(timer)
    }, [enabled, gameState?.currentPlayer, gameState?.phase, gameState?.trumpSuit, gameState?.trumpRevealed, match?.id, matchId, userId])

    // Stall Guard - Host only - Forces a move if current player (bot or human) stalls for > 35s
    useEffect(() => {
        if (!enabled || !gameState || !match || !userId || !matchId) return
        if (match.creatorId !== userId) return
        if (gameState.phase === 'completed') return

        const checkStall = async () => {
            const timeLeft = getTimeLeftSync(gameState)
            if (timeLeft === '0:00') {
                const currentPlayerId = match.players[gameState.currentPlayer].userId
                console.warn(`[StallGuard] Seat ${gameState.currentPlayer} (${currentPlayerId}) stalled. Forcing valid move.`)

                try {
                    const botHand = gameState.hands[currentPlayerId] || []
                    if (botHand.length > 0) {
                        // Force first valid card
                        const ledSuit = gameState.currentTrick.length > 0 ? gameState.currentTrick[0].card.suit : null
                        let cardToPlay = botHand[0]
                        if (ledSuit) {
                            const follow = botHand.find((c: any) => c.suit === ledSuit)
                            if (follow) cardToPlay = follow
                        }
                        await matchService.playCard29(matchId, currentPlayerId, cardToPlay, gameState, match.players)
                    } else if (gameState.phase === 'bidding') {
                        // Force pass
                        await matchService.makeBid29(matchId, currentPlayerId, 'pass', gameState, match.players)
                    } else if (gameState.phase === 'playing' && !gameState.trumpSuit && gameState.bidWinner === currentPlayerId) {
                        // Force Heart trump if choosing
                        await matchService.selectTrump29(matchId, currentPlayerId, 'H', gameState, match.players)
                    }
                } catch (e) {
                    console.error('[StallGuardError]', e)
                }
            }
        }

        const stallTimer = setInterval(checkStall, 5000) // Check every 5s
        return () => clearInterval(stallTimer)
    }, [enabled, gameState?.currentPlayer, gameState?.phase, gameState?.turnStartedAt, match?.id, matchId, userId])
}
