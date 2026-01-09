import { db } from './firebase'
import { doc, updateDoc } from 'firebase/firestore'
import type { GameState, Card, TrickTurn } from '@/types/match'

export const Card29Engine = {
    // Constants
    TURN_DURATION: 30, // seconds

    /**
     * Checks if the current turn has timed out and forces a move if needed
     */
    async checkTurnTimeout(matchId: string, gameState: GameState, players: any[]): Promise<void> {
        if (!gameState.turnStartedAt) return

        const now = Date.now()
        const startedAt = new Date(gameState.turnStartedAt).getTime()
        const elapsed = (now - startedAt) / 1000

        if (elapsed > gameState.turnDuration) {
            console.log('[Card29Engine] Turn timeout detected! Forcing action...')
            await this.forceAction(matchId, gameState, players)
        }
    },

    /**
     * Forces an action for the current player (Bot or Human)
     */
    async forceAction(matchId: string, gameState: GameState, players: any[]): Promise<void> {
        const currentPlayerIndex = gameState.phase === 'bidding' ? gameState.currentBidder : gameState.currentPlayer
        const currentPlayer = players[currentPlayerIndex]

        if (!currentPlayer) return

        console.log(`[Card29Engine] Forcing action for ${currentPlayer.userName} (${gameState.phase})`)

        if (gameState.phase === 'bidding') {
            // Force PASS
            await this.processBid(matchId, gameState, currentPlayer.userId, 'pass', players)
        } else if (gameState.phase === 'playing') {
            // Force Random Card
            const hand = gameState.hands[currentPlayer.userId] || []
            if (hand.length > 0) {
                // Should pick a valid card based on rules
                const validCard = this.getValidRandomCard(hand, gameState)
                await this.processPlayCard(matchId, gameState, currentPlayer.userId, validCard, players)
            }
        }
    },

    getValidRandomCard(hand: Card[], gameState: GameState): Card {
        const ledSuit = gameState.currentTrick.length > 0 ? gameState.currentTrick[0].card.suit : null

        if (ledSuit) {
            const followSuit = hand.filter(c => c.suit === ledSuit)
            if (followSuit.length > 0) return followSuit[0]
        }

        return hand[0] // Fallback
    },

    /**
     * Processes a Bid action
     */
    async processBid(matchId: string, gameState: GameState, userId: string, amount: number | 'pass', players: any[]): Promise<void> {
        // Validation moved here? For now, trust inputs but re-validate
        if (gameState.phase !== 'bidding') return

        const newBids = { ...gameState.bids, [userId]: amount === 'pass' ? 0 : amount }
        let newHighestBid = gameState.highestBid

        if (amount !== 'pass') {
            // Logic repeated from before, but centralized
            if (!newHighestBid || amount > newHighestBid.amount) {
                newHighestBid = { playerId: userId, amount }
            }
        }

        // Logic for next bidder
        const totalPlayers = players.length
        const activePlayers = players.map(p => p.userId).filter(pid => newBids[pid] !== 0)

        let newPhase: GameState['phase'] = gameState.phase
        let newBidWinner = gameState.bidWinner
        let newCurrentPlayer = gameState.currentPlayer
        let nextBidderIndex = gameState.currentBidder
        let newTrumpSuit = gameState.trumpSuit

        // Bidding End Condition
        if (activePlayers.length <= 1 && newHighestBid) {
            newPhase = 'playing'
            newBidWinner = newHighestBid.playerId
            newCurrentPlayer = players.findIndex(p => p.userId === newHighestBid?.playerId)
            if (!newTrumpSuit) newTrumpSuit = null
        } else if (activePlayers.length === 0 && Object.keys(newBids).length === totalPlayers) {
            // All pass fallback
            newPhase = 'playing'
            newBidWinner = players[0].userId
            newCurrentPlayer = 0
        } else {
            let loops = 0
            do {
                nextBidderIndex = (nextBidderIndex + 3) % totalPlayers
                loops++
            } while (newBids[players[nextBidderIndex].userId] === 0 && loops < totalPlayers)
        }

        const newState = {
            ...gameState,
            bids: newBids,
            highestBid: newHighestBid || null,
            currentBidder: nextBidderIndex,
            phase: newPhase,
            bidWinner: newBidWinner || null,
            currentPlayer: newCurrentPlayer,
            trumpSuit: (newPhase === 'playing' ? null : gameState.trumpSuit) || null,
            // Reset Timer for next turn
            turnStartedAt: new Date().toISOString(),
            turnDuration: this.TURN_DURATION,
            lastMoveTime: new Date().toISOString() // Keep for legacy compatibility if needed
        }

        await updateDoc(doc(db, 'matches', matchId), { gameState: newState })
    },

    /**
     * Processes a Play Card action with strict rule enforcement
     */
    async processPlayCard(matchId: string, gameState: GameState, userId: string, card: Card, players: any[]): Promise<void> {
        // Validate card ownership
        const playerHand = gameState.hands[userId] || []
        const hasCard = playerHand.some(c => c.suit === card.suit && c.rank === card.rank)
        if (!hasCard) {
            console.error('[Card29Engine] Player does not have this card')
            throw new Error('You do not have this card!')
        }

        // Validate follow-suit and trump enforcement
        const ledSuit = gameState.currentTrick.length > 0 ? gameState.currentTrick[0].card.suit : null
        if (ledSuit && card.suit !== ledSuit) {
            // Player didn't follow suit - must check if they have led suit
            const hasLedSuit = playerHand.some(c => c.suit === ledSuit)
            if (hasLedSuit) {
                console.error('[Card29Engine] Must follow suit!')
                throw new Error('You must follow the lead suit!')
            }

        }

        // 1. Remove card from hand
        const newHands = { ...gameState.hands }
        newHands[userId] = newHands[userId].filter(c => !(c.suit === card.suit && c.rank === card.rank))

        // 2. Add to trick
        const playedCard: TrickTurn = { playerId: userId, card, playedAt: new Date().toISOString() }
        const newTrick = [...gameState.currentTrick, playedCard]

        // 3. Update card history (keep last 4 cards)
        let newCardHistory = [...(gameState.lastTrickCards || []), playedCard]
        if (newCardHistory.length > 4) {
            newCardHistory = newCardHistory.slice(-4) // Keep only last 4
        }

        let newTricks = { ...gameState.tricks }
        let currentTrick = newTrick
        let nextPlayer = (gameState.currentPlayer + 3) % players.length
        let newScores = { ...gameState.scores }
        let round = gameState.round
        let trumpSuit = gameState.trumpSuit
        let newGamePoints = gameState.gamePoints ? { ...gameState.gamePoints } : { team1: 0, team2: 0 }
        let phase = gameState.phase
        let newBids = gameState.bids
        let newCurrentBidder = gameState.currentBidder
        let newHighestBid = gameState.highestBid
        let newBidWinner = gameState.bidWinner

        // 4. Check Trick End
        if (newTrick.length === players.length) {
            // Determine winner using proper hierarchy
            const winnerId = this.determineTrickWinner(newTrick, trumpSuit)

            // Assign points
            const points = newTrick.reduce((acc: number, t: any) => acc + this.getCardValue(t.card.rank), 0)
            newScores[winnerId] = (newScores[winnerId] || 0) + points

            console.log(`[Card29Engine] Trick complete! Winner: ${players.find(p => p.userId === winnerId)?.userName}, Points: ${points}`)

            // Store trick in object map with winner info
            const trickIndex = Object.keys(newTricks || {}).length
            newTricks = { ...newTricks, [trickIndex]: { cards: newTrick, winnerId } }
            currentTrick = []

            // Winner leads next trick
            nextPlayer = players.findIndex(p => p.userId === winnerId)

            // 5. Check Round End (8 tricks completed)
            if (Object.keys(newTricks).length === 8) {
                console.log('[Card29Engine] Round complete! Calculating scores...')

                // Calculate team scores
                const teams = {
                    team1: [players[0].userId, players[2]?.userId].filter(Boolean),
                    team2: [players[1].userId, players[3]?.userId].filter(Boolean)
                }
                const team1Score = (newScores[teams.team1[0]] || 0) + (newScores[teams.team1[1] || ''] || 0)
                const team2Score = (newScores[teams.team2[0]] || 0) + (newScores[teams.team2[1] || ''] || 0)

                console.log(`[Card29Engine] Team 1 Score: ${team1Score}, Team 2 Score: ${team2Score}`)

                const bidAmount = gameState.highestBid?.amount || 16
                const bidWinnerId = gameState.bidWinner
                const isTeam1Bidder = teams.team1.includes(bidWinnerId || '')

                // Award game points based on bid success with multipliers
                let multiplier = 1
                if (gameState.isRedoubled) multiplier = 4
                else if (gameState.isDoubled) multiplier = 2

                let gamePointsChange = (isTeam1Bidder ? (team1Score >= bidAmount) : (team2Score >= bidAmount)) ? multiplier : -multiplier

                if (isTeam1Bidder) {
                    newGamePoints.team1 = (newGamePoints.team1 || 0) + gamePointsChange
                    console.log(`[Card29Engine] Team 1 bid ${bidAmount}, scored ${team1Score}: ${gamePointsChange > 0 ? 'SUCCESS' : 'FAILED'} (Change: ${gamePointsChange})`)
                } else {
                    newGamePoints.team2 = (newGamePoints.team2 || 0) + gamePointsChange
                    console.log(`[Card29Engine] Team 2 bid ${bidAmount}, scored ${team2Score}: ${gamePointsChange > 0 ? 'SUCCESS' : 'FAILED'} (Change: ${gamePointsChange})`)
                }

                // Check for game end (first team to 6 game points wins)
                if (Math.abs(newGamePoints.team1 || 0) >= 6 || Math.abs(newGamePoints.team2 || 0) >= 6) {
                    console.log('[Card29Engine] Game Over!')
                    phase = 'completed'
                } else {
                    // Reset for next round
                    console.log('[Card29Engine] Starting new round...')
                    round++
                    newTricks = {}
                    newScores = {}
                    trumpSuit = null
                    phase = 'bidding'
                    newCardHistory = [] // Clear history for new round
                    newBids = {}
                    newCurrentBidder = 0
                    newHighestBid = null
                    newBidWinner = null

                    // Clear hands to trigger re-deal effect in UI/Logic
                    Object.keys(newHands).forEach(k => newHands[k] = [])
                }
            }
        }

        const newState = {
            ...gameState,
            hands: newHands,
            currentTrick,
            tricks: newTricks,
            currentPlayer: nextPlayer,
            scores: newScores,
            round,
            phase,
            trumpSuit,
            gamePoints: newGamePoints,
            lastTrickCards: newCardHistory,
            bids: newBids,
            currentBidder: newCurrentBidder,
            highestBid: newHighestBid,
            bidWinner: newBidWinner,

            // Reset Timer
            turnStartedAt: new Date().toISOString(),
            turnDuration: this.TURN_DURATION,
            lastMoveTime: new Date().toISOString()
        }

        await updateDoc(doc(db, 'matches', matchId), { gameState: newState })
    },

    /**
     * Determines the winner of a trick based on Trump and Lead Suit hierarchy
     * Trump cards always beat non-trump cards
     * Within same suit, higher power card wins
     */
    getRankPower(rank: string): number {
        const order = ['J', '9', 'A', '10', 'K', 'Q', '8', '7']
        const index = order.indexOf(rank)
        return index === -1 ? -1 : 100 - index
    },

    determineTrickWinner(trick: any[], trumpSuit: string | null = null, gameState?: any): string {
        if (!trick.length) return ''

        // SINGLE HAND MODE: Highest rank wins, ignore suits/trump
        if (gameState?.singleHandMode) {
            let winner = trick[0]
            let maxPower = this.getRankPower(winner.card.rank)

            for (let i = 1; i < trick.length; i++) {
                const power = this.getRankPower(trick[i].card.rank)
                if (power > maxPower) {
                    maxPower = power
                    winner = trick[i]
                }
            }
            return winner.userId
        }

        let winner = trick[0]

        for (let i = 1; i < trick.length; i++) {
            const play = trick[i]
            const winningCard = winner.card
            const currentCard = play.card

            // Trump card beats non-trump card
            if (currentCard.suit === trumpSuit && winningCard.suit !== trumpSuit) {
                winner = play
            }
            // Both trump or both same suit - compare power
            else if (currentCard.suit === winningCard.suit) {
                if (this.getCardPower(currentCard.rank) > this.getCardPower(winningCard.rank)) {
                    winner = play
                }
            }
            // If winning card is trump and current is not, winner stays same
            // If winning card is lead suit and current is neither trump nor lead, winner stays same
        }

        console.log(`[Card29Engine] Trick winner: ${winner.playerId}, Card: ${winner.card.rank}${winner.card.suit}`)
        return winner.playerId
    },

    getCardValue(rank: string): number {
        const values: any = { 'J': 3, '9': 2, 'A': 1, '10': 1 }
        return values[rank] || 0
    },

    getCardPower(rank: string): number {
        const power: any = { 'J': 8, '9': 7, 'A': 6, '10': 5, 'K': 4, 'Q': 3, '8': 2, '7': 1 }
        return power[rank] || 0
    }
}
