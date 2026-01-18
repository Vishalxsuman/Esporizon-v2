import { getFirebaseDb } from '@/config/firebaseConfig'
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore'
import type { Match, MatchPlayer, CreateMatchDto, JoinMatchDto, MatchResult } from '@/types/match'

export interface CreateMatchDtoExtended extends CreateMatchDto {
    timeControl?: number
}

class MatchService {
    private matchesCollection = collection(getFirebaseDb(), 'matches')

    // Create a new match
    async createMatch(dto: CreateMatchDtoExtended, userId: string, userName: string, userAvatar?: string): Promise<Match> {
        try {
            // Generate invite code for all matches (Room Code)
            const inviteCode = this.generateInviteCode()

            // Calculate expiration (30 minutes from now)
            const expiresAt = new Date()
            expiresAt.setMinutes(expiresAt.getMinutes() + 30)

            const players: MatchPlayer[] = [
                {
                    userId,
                    userName,
                    userAvatar,
                    joinedAt: new Date().toISOString(),
                    coinsLocked: dto.entryFee,
                    role: 'creator' as const,
                    isBot: false
                }
            ]

            // If playing vs computer (Chess only), add bot immediately
            if (dto.gameId === 'chess' && dto.withBots) {
                players.push({
                    userId: 'bot-chess-engine',
                    userName: 'Chess Engine (Bot)',
                    userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=chess',
                    joinedAt: new Date().toISOString(),
                    coinsLocked: 0,
                    role: 'participant' as const,
                    isBot: true
                })
            }

            // Initialize game state based on game type
            let gameState: any = null
            if (dto.gameId === 'chess') {
                gameState = {
                    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Starting position
                    turn: 'white',
                    moves: [],
                    lastMove: null,
                    createdAt: new Date().toISOString()
                }
            } else if (dto.gameId === 'card29') {
                const creatorIndex = 0 // Creator is always 0 in our logic
                gameState = {
                    deck: [],
                    hands: {},
                    currentTrick: [],
                    tricks: {}, // Object for Firestore safety
                    trumpSuit: null,
                    round: 1,
                    scores: {},
                    gamePoints: { team1: 0, team2: 0 },
                    phase: 'bidding',
                    turnStartedAt: serverTimestamp(),
                    turnDuration: 30,
                    dealerIndex: creatorIndex, // Creator (0) deals first
                    currentBidder: (creatorIndex + 3) % 4, // Starts from RHS (3)
                    currentPlayer: (creatorIndex + 3) % 4,
                    bids: {},
                    highestBid: null,
                    bidWinner: null,
                    isDoubled: false,
                    isRedoubled: false,
                    bainPhase: 'none',
                    singleHandMode: false,

                    passedPlayers: [], // Init empty passed array
                    lastTrickCards: [],
                    createdAt: new Date().toISOString()
                }
            }

            const matchData: Omit<Match, 'id'> = {
                gameId: dto.gameId,
                gameName: dto.gameId === 'chess' ? 'Chess' : '29 Card Game',
                mode: dto.mode,
                visibility: dto.visibility,
                entryFee: dto.entryFee,
                prizePool: dto.entryFee * dto.maxPlayers,
                platformFee: 10,
                platformFeeAmount: (dto.entryFee * dto.maxPlayers) * 0.1,
                winnerPrize: (dto.entryFee * dto.maxPlayers) * 0.9,
                timeControl: dto.timeControl || 600, // Default 10 min
                creatorId: userId,
                creatorName: userName,
                creatorAvatar: userAvatar,
                players,
                maxPlayers: dto.maxPlayers,
                status: (dto.gameId === 'chess' && dto.withBots) ? 'locked' : 'waiting',
                inviteCode,
                withBots: dto.withBots, // Persist bot flag
                gameState, // Add game state
                createdAt: new Date().toISOString(),
                expiresAt: expiresAt.toISOString(),
                ...((dto.gameId === 'chess' && dto.withBots) ? { startsAt: new Date().toISOString() } : {})
            }

            const docRef = await addDoc(this.matchesCollection, {
                ...matchData,
                createdAt: serverTimestamp(),
                expiresAt: Timestamp.fromDate(expiresAt)
            })

            return {
                ...matchData,
                id: docRef.id
            }
        } catch (error) {
            console.error('Error creating match:', error)
            throw new Error('Failed to create match')
        }
    }

    // New: Join Room by Code (Guest Friendly)
    async joinRoom(inviteCode: string, player: { id: string; name: string; avatar: string }): Promise<Match> {
        try {
            const match = await this.getMatchByInviteCode(inviteCode)
            if (!match) throw new Error('Room not found')

            // If game expects a fee and this is a guest joining (no wallet check here for now), allow only free games
            if (match.entryFee > 0 && player.id.startsWith('guest_')) {
                // Optional: Block guests from paid games if strict logic needed
                // throw new Error('Guests cannot join paid rooms')
            }

            return await this.joinMatch({
                matchId: match.id,
                userId: player.id,
                userName: player.name,
                userAvatar: player.avatar
            })
        } catch (error) {
            console.error('Error joining room:', error)
            throw error
        }
    }



    async makeBid29(matchId: string, userId: string, amount: number | 'pass', gameState: any, players: MatchPlayer[]) {
        const newBids = { ...gameState.bids }
        let newHighestBid = gameState.highestBid
        let newPhase = gameState.phase
        let newBidWinner = gameState.bidWinner
        let newCurrentPlayer = gameState.currentPlayer
        let newBainPhase = gameState.bainPhase
        let newCurrentBidder = gameState.currentBidder
        const passedPlayers = gameState.passedPlayers || []

        // 0. Strict Pass Check
        if (passedPlayers.includes(userId)) {
            throw new Error("Player has already passed!")
        }

        if (amount === 'pass') {
            newBids[userId] = 0 // 0 signifies "Passed"
            if (!passedPlayers.includes(userId)) {
                passedPlayers.push(userId)
            }

            // If the current highest bid holder passes, find the next highest (challenger)
            if (newHighestBid && userId === newHighestBid.playerId) {
                let bestBid = -1
                let bestPlayerId = null
                players.forEach(p => {
                    const b = newBids[p.userId] || 0
                    if (b > bestBid) {
                        bestBid = b
                        bestPlayerId = p.userId
                    } else if (b === bestBid && bestBid > 0) {
                        bestPlayerId = p.userId
                    }
                })
                if (bestBid > 0) newHighestBid = { playerId: bestPlayerId, amount: bestBid }
                else newHighestBid = null
            }
        } else {
            // New Competitive Logic:
            // 1. Initial bid must be >= 16
            // 2. Maximum bid is 28
            if (amount < 16) throw new Error("Minimum bid is 16")
            if (amount > 28) throw new Error("Maximum bid is 28")

            if (newHighestBid) {
                if (amount < newHighestBid.amount) {
                    throw new Error(`Bid must be at least ${newHighestBid.amount} `)
                }
            }

            if (newHighestBid && amount === newHighestBid.amount) {
                // If it's a match, the original winner keeps the bid,
                // and the current bidder (the one who matched) essentially challenges them.
                // We advance the turn back to the original winner to see if they raise or pass.
                const originalWinnerId = newHighestBid.playerId
                const matcherId = userId

                console.log(`[MatchService] ${matcherId} matched ${originalWinnerId} at ${amount} `)

                // Set currentBidder to original winner
                newCurrentBidder = players.findIndex(p => p.userId === originalWinnerId)
                newBids[userId] = amount // Update matcher's bid record

                await updateDoc(doc(this.matchesCollection, matchId), {
                    gameState: {
                        ...gameState,
                        bids: newBids,
                        currentBidder: newCurrentBidder,
                        passedPlayers, // Save passed players
                        turnStartedAt: serverTimestamp()
                    }
                })
                return
            }

            // Normal higher bid
            newBids[userId] = amount
            newHighestBid = { playerId: userId, amount }

            // If a player bids 28, bidding ends immediately
            if (amount === 28) {
                newPhase = 'playing'
                newBidWinner = userId
                newCurrentPlayer = players.findIndex(p => p.userId === userId)
                newBainPhase = 'double_chance'

                await updateDoc(doc(this.matchesCollection, matchId), {
                    gameState: { ...gameState, bids: newBids, highestBid: newHighestBid, phase: newPhase, bidWinner: newBidWinner, currentPlayer: newCurrentPlayer, currentBidder: newCurrentBidder, bainPhase: newBainPhase, turnStartedAt: serverTimestamp() }
                })
                return
            }
        }

        const activePlayers = players.filter(p => newBids[p.userId] !== 0)

        // Check if bidding is over (only 1 active player left)
        if (activePlayers.length <= 1 && newHighestBid) {
            newPhase = 'playing'
            newBidWinner = newHighestBid.playerId
            newCurrentPlayer = players.findIndex(p => p.userId === newHighestBid?.playerId)
            newBainPhase = 'double_chance'
        } else if (activePlayers.length === 0 && Object.keys(newBids).length >= players.length) {
            // Everyone passed, dealer is forced to bid 16
            newPhase = 'playing'
            const forcedBidderIndex = (gameState.dealerIndex || 0)
            newBidWinner = players[forcedBidderIndex].userId
            newCurrentPlayer = forcedBidderIndex
            newHighestBid = { playerId: players[forcedBidderIndex].userId, amount: 16 }
            newBainPhase = 'double_chance'
        } else {
            // Find next active bidder (counter-clockwise / RHS)
            let next = newCurrentBidder
            let loops = 0
            do {
                next = (next + 3) % players.length
                loops++
            } while ((newBids[players[next].userId] === 0 || passedPlayers.includes(players[next].userId)) && loops < players.length)
            newCurrentBidder = next
        }

        await updateDoc(doc(this.matchesCollection, matchId), {
            gameState: {
                ...gameState,
                bids: newBids,
                highestBid: newHighestBid,
                phase: newPhase,
                bidWinner: newBidWinner,
                currentPlayer: newCurrentPlayer,
                currentBidder: newCurrentBidder,
                bainPhase: newBainPhase,
                passedPlayers, // Save passed players
                turnStartedAt: serverTimestamp()
            }
        })
    }



    async joinMatch(dto: JoinMatchDto): Promise<Match> {
        try {
            const matchRef = doc(this.matchesCollection, dto.matchId)
            const matchDoc = await getDoc(matchRef)

            if (!matchDoc.exists()) {
                throw new Error('Match not found')
            }

            const match = { id: matchDoc.id, ...matchDoc.data() } as Match

            // Validations
            if (match.status !== 'waiting') {
                throw new Error('Match is no longer accepting players')
            }

            if (match.players.length >= match.maxPlayers) {
                throw new Error('Match is full')
            }

            if (match.players.some(p => p.userId === dto.userId)) {
                throw new Error('Already joined this match')
            }

            // Add player
            const newPlayer = {
                userId: dto.userId,
                userName: dto.userName,
                userAvatar: dto.userAvatar,
                joinedAt: new Date().toISOString(),
                coinsLocked: match.entryFee,
                role: 'participant' as const
            }

            const updatedPlayers = [...match.players, newPlayer]
            const prizePool = match.entryFee * updatedPlayers.length
            const platformFeeAmount = prizePool * (match.platformFee / 100)
            const winnerPrize = prizePool - platformFeeAmount

            // Auto-start if match is full
            const newStatus = updatedPlayers.length === match.maxPlayers ? 'locked' : 'waiting'

            await updateDoc(matchRef, {
                players: updatedPlayers,
                prizePool,
                platformFeeAmount,
                winnerPrize,
                status: newStatus,
                ...(newStatus === 'locked' && { startsAt: serverTimestamp() })
            })

            return {
                ...match,
                players: updatedPlayers,
                prizePool,
                platformFeeAmount,
                winnerPrize,
                status: newStatus,
                ...(newStatus === 'locked' && { startsAt: new Date().toISOString() })
            }
        } catch (error) {
            console.error('Error joining match:', error)
            throw error instanceof Error ? error : new Error('Failed to join match')
        }
    }

    // Get match by ID
    async getMatch(matchId: string): Promise<Match | null> {
        try {
            const matchDoc = await getDoc(doc(this.matchesCollection, matchId))
            if (!matchDoc.exists()) return null
            return { id: matchDoc.id, ...matchDoc.data() } as Match
        } catch (error) {
            console.error('Error getting match:', error)
            return null
        }
    }



    // Get public lobbies
    async getPublicLobbies(gameId?: 'chess' | 'card29'): Promise<Match[]> {
        try {
            let q = query(
                this.matchesCollection,
                where('visibility', '==', 'public'),
                where('status', '==', 'waiting'),
                orderBy('createdAt', 'desc'),
                limit(20)
            )

            if (gameId) {
                q = query(
                    this.matchesCollection,
                    where('visibility', '==', 'public'),
                    where('status', '==', 'waiting'),
                    where('gameId', '==', gameId),
                    orderBy('createdAt', 'desc'),
                    limit(20)
                )
            }

            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match))
        } catch (error) {
            console.error('Error getting public lobbies:', error)
            return []
        }
    }

    // Listen to match updates in real-time
    listenToMatch(matchId: string, callback: (match: Match | null) => void): () => void {
        const matchRef = doc(this.matchesCollection, matchId)
        return onSnapshot(matchRef, (snapshot) => {
            if (!snapshot.exists()) {
                callback(null)
                return
            }
            callback({ id: snapshot.id, ...snapshot.data() } as Match)
        }, (error) => {
            console.error('Error listening to match:', error)
            callback(null)
        })
    }

    // Submit match result
    async submitResult(result: MatchResult): Promise<void> {
        try {
            const matchRef = doc(this.matchesCollection, result.matchId)
            await updateDoc(matchRef, {
                status: 'completed',
                winnerId: result.winnerId,
                winnerName: result.winnerName,
                completedAt: serverTimestamp()
            })
        } catch (error) {
            console.error('Error submitting result:', error)
            throw new Error('Failed to submit match result')
        }
    }

    // Cancel match
    async cancelMatch(matchId: string, userId: string): Promise<void> {
        try {
            const match = await this.getMatch(matchId)
            if (!match) throw new Error('Match not found')
            if (match.creatorId !== userId) throw new Error('Only creator can cancel')
            if (match.status !== 'waiting') throw new Error('Cannot cancel started match')

            const matchRef = doc(this.matchesCollection, matchId)
            await updateDoc(matchRef, {
                status: 'cancelled'
            })
        } catch (error) {
            console.error('Error cancelling match:', error)
            throw error instanceof Error ? error : new Error('Failed to cancel match')
        }
    }

    // Get user's active matches
    async getUserMatches(userId: string): Promise<Match[]> {
        try {
            const q = query(
                this.matchesCollection,
                where('status', 'in', ['waiting', 'locked', 'in_progress']),
                orderBy('createdAt', 'desc')
            )
            const snapshot = await getDocs(q)
            const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match))
            return matches.filter(m => m.players.some(p => p.userId === userId))
        } catch (error) {
            console.error('Error getting user matches:', error)
            return []
        }
    }

    // Get match by invite code
    async getMatchByInviteCode(code: string): Promise<Match | null> {
        try {
            const q = query(
                this.matchesCollection,
                where('inviteCode', '==', code.toUpperCase()),
                where('status', 'in', ['waiting', 'locked']),
                limit(1)
            )
            const snapshot = await getDocs(q)
            if (snapshot.empty) return null
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Match
        } catch (error) {
            console.error('Error getting match by code:', error)
            return null
        }
    }

    // Helper: Generate random invite code
    private generateInviteCode(): string {
        // Shorter 6-character code for better sharing
        return Math.random().toString(36).substring(2, 8).toUpperCase()
    }

    // Add a bot to an existing match (for 29 Card Game)
    async addBotToMatch(matchId: string): Promise<void> {
        try {
            const matchRef = doc(this.matchesCollection, matchId)
            const matchDoc = await getDoc(matchRef)

            if (!matchDoc.exists()) throw new Error('Match not found')

            const match = matchDoc.data() as Match

            if (match.players.length >= match.maxPlayers) throw new Error('Match is full')

            const botNumber = match.players.filter(p => p.isBot).length + 1
            const botPlayer = {
                userId: `bot - ${Date.now()} `,
                userName: `Bot Player ${botNumber} `,
                userAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${Date.now()}`,
                joinedAt: new Date().toISOString(),
                coinsLocked: 0,
                role: 'participant',
                isBot: true
            }

            const updatedPlayers = [...match.players, botPlayer]
            const newStatus = updatedPlayers.length === match.maxPlayers ? 'locked' : match.status

            await updateDoc(matchRef, {
                players: updatedPlayers,
                status: newStatus,
                ...(newStatus === 'locked' && { startsAt: serverTimestamp() })
            })
        } catch (error) {
            console.error('Error adding bot:', error)
            throw new Error('Failed to add bot')
        }
    }

    // Remove a bot from an existing match
    async removeBotFromMatch(matchId: string, botUserId: string): Promise<void> {
        try {
            const matchRef = doc(this.matchesCollection, matchId)
            const matchDoc = await getDoc(matchRef)

            if (!matchDoc.exists()) throw new Error('Match not found')

            const match = matchDoc.data() as Match
            const updatedPlayers = match.players.filter(p => p.userId !== botUserId)

            // If we remove a bot, match should go back to waiting if it was locked
            const newStatus = updatedPlayers.length < match.maxPlayers ? 'waiting' : match.status

            await updateDoc(matchRef, {
                players: updatedPlayers,
                status: newStatus
            })
        } catch (error) {
            console.error('Error removing bot:', error)
            throw new Error('Failed to remove bot')
        }
    }

    async playCard29(matchId: string, playerId: string, card: any, gameState: any, players: MatchPlayer[]) {
        // PREVENT MULTIPLE PLAYS OR WRONG TURN
        const currentPlayerIndex = players.findIndex(p => p.userId === playerId)
        if (gameState.currentPlayer !== currentPlayerIndex) {
            console.warn(`[playCard29] ${playerId} tried to play out of turn. Current: ${gameState.currentPlayer}`)
            return
        }
        if (gameState.currentTrick.some((t: any) => t.playerId === playerId)) {
            console.warn(`[playCard29] ${playerId} already played in this trick.`)
            return
        }

        // STRICT RULE VALIDATION
        if (gameState.currentTrick && gameState.currentTrick.length > 0) {
            const ledSuit = gameState.currentTrick[0].card.suit;
            const myHand = gameState.hands[playerId];
            const hasLedSuit = myHand.some((c: any) => c.suit === ledSuit);

            if (hasLedSuit) {
                if (card.suit !== ledSuit) {
                    throw new Error("Must follow suit!");
                }
            }
        }

        const newHands = { ...gameState.hands }
        // Remove card from hand
        newHands[playerId] = newHands[playerId].filter((c: any) => c.suit !== card.suit || c.rank !== card.rank)

        const trickTurn = { playerId, card, playerName: players.find(p => p.userId === playerId)?.userName || 'Player' }
        const newTrick = [...gameState.currentTrick, trickTurn]

        // Maintain flat history (limit to 4)
        const newHistory = [...(gameState.lastTrickCards || []), trickTurn].slice(-4)

        let nextPlayer = (gameState.currentPlayer - 1 + players.length) % players.length
        let newTricks = gameState.tricks
        let newScores = { ...gameState.scores }
        let currentTrick = newTrick
        let round = gameState.round
        let trumpSuit = gameState.trumpSuit
        let phase = gameState.phase

        // Trick Complete Logic (4 players)
        if (newTrick.length === players.length) {
            // Determine winner immediately for animation
            const winnerId = this.determineTrickWinner(newTrick, gameState.trumpRevealed ? trumpSuit : null, gameState)

            // interim update so everyone sees the 4th card AND knows who won for animation
            await updateDoc(doc(this.matchesCollection, matchId), {
                'gameState.hands': newHands,
                'gameState.currentTrick': newTrick,
                'gameState.lastTrickCards': newHistory,
                'gameState.lastMoveTime': new Date().toISOString(),
                'gameState.lastWinnerId': winnerId
            })

            // Wait 2 seconds so players can see the completed trick
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Assign points
            let points = newTrick.reduce((acc: number, t: any) => acc + this.getCardValue(t.card.rank), 0)

            newScores[winnerId] = (newScores[winnerId] || 0) + points

            // Store trick in object map (Firestore safe)
            const trickIndex = Object.keys(newTricks).length
            newTricks = { ...newTricks, [trickIndex]: newTrick }

            currentTrick = [] // Clear trick

            // Winner starts next trick
            nextPlayer = players.findIndex(p => p.userId === winnerId)

            // SINGLE HAND MODE CHECK - Finish game after 1 trick
            if (gameState.singleHandMode) {
                const multiplier = gameState.isRedoubled ? 4 : (gameState.isDoubled ? 2 : 1)
                const baseChange = 1 * multiplier

                const bidWinnerTeam = (players.findIndex(p => p.userId === gameState.bidWinner) % 2)
                const trickWinnerTeam = (players.findIndex(p => p.userId === winnerId) % 2)

                const isWinnerBidderTeam = (bidWinnerTeam === trickWinnerTeam)
                const finalChange = isWinnerBidderTeam ? baseChange : -baseChange

                const newGamePoints = gameState.gamePoints ? { ...gameState.gamePoints } : { team1: 0, team2: 0 }
                if (bidWinnerTeam === 0) {
                    newGamePoints.team1 = (newGamePoints.team1 || 0) + finalChange
                } else {
                    newGamePoints.team2 = (newGamePoints.team2 || 0) + finalChange
                }

                await updateDoc(doc(this.matchesCollection, matchId), {
                    status: 'completed',
                    winnerId: winnerId,
                    'gameState.gamePoints': newGamePoints,
                    'gameState.phase': 'completed'
                })
                return
            }

            // Round End (8 tricks)
            if (Object.keys(newTricks).length === 8) {
                const team1Ids = [players[0].userId, players[2].userId]
                const team2Ids = [players[1].userId, players[3].userId]

                const team1Points = team1Ids.reduce((sum, id) => sum + (newScores[id] || 0), 0)
                const team2Points = team2Ids.reduce((sum, id) => sum + (newScores[id] || 0), 0)

                const bidAmount = (gameState.highestBid?.amount || 16) + (gameState.bidAdjustment || 0)
                const bidWinnerId = gameState.bidWinner
                const bidWinnerTeam = team1Ids.includes(bidWinnerId) ? 1 : 2

                const cardPointsForBidWinner = bidWinnerTeam === 1 ? team1Points : team2Points
                const isBidSuccessful = cardPointsForBidWinner >= bidAmount

                const multiplier = gameState.isRedoubled ? 4 : (gameState.isDoubled ? 2 : 1)
                let gamePointChange = 1 * multiplier

                // DRAW RULE: If trump not revealed, round is a draw (doesn't count in points)
                const isDraw = !gameState.trumpRevealed
                if (isDraw) {
                    gamePointChange = 0
                }

                const newGamePoints = gameState.gamePoints ? { ...gameState.gamePoints } : { team1: 0, team2: 0 }

                if (!isDraw) {
                    if (isBidSuccessful) {
                        // Bidder team wins points
                        if (bidWinnerTeam === 1) newGamePoints.team1 = (newGamePoints.team1 || 0) + gamePointChange
                        else newGamePoints.team2 = (newGamePoints.team2 || 0) + gamePointChange
                    } else {
                        // Bidder team LOSES points (Black Pips) - Opponents DO NOT gain points
                        if (bidWinnerTeam === 1) newGamePoints.team1 = (newGamePoints.team1 || 0) - gamePointChange
                        else newGamePoints.team2 = (newGamePoints.team2 || 0) - gamePointChange
                    }
                }

                // Set Victory Check (First to 6 pips)
                const team1Score = newGamePoints.team1 || 0
                const team2Score = newGamePoints.team2 || 0

                if (Math.abs(team1Score) >= 6 || Math.abs(team2Score) >= 6) {
                    // Show Set Victory Popup
                    const winningTeam = Math.abs(team1Score) >= 6 ? 1 : 2
                    gameState.setWinner = { team: winningTeam }
                    gameState.showSetPopup = true
                    // We don't change phase to completed yet, allowing players to click OK
                } else {
                    // Show Round Winner Popup (don't reset yet)
                    const winningTeam = isBidSuccessful ? bidWinnerTeam : (bidWinnerTeam === 1 ? 2 : 1)
                    gameState.roundWinner = {
                        team: isDraw ? 0 : winningTeam,
                        points: winningTeam === 1 ? team1Points : team2Points,
                        bidWon: isBidSuccessful,
                        isDraw: isDraw
                    }
                    gameState.showRoundPopup = true
                }

                gameState.gamePoints = newGamePoints
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
            lastTrickCards: newHistory,
            turnStartedAt: serverTimestamp(), // RESET TIMER ON EVERY MOVE
            lastMoveTime: new Date().toISOString()
        }

        await updateDoc(doc(this.matchesCollection, matchId), {
            gameState: newState
        })
    }

    async selectTrump29(matchId: string, userId: string, suit: string, gameState: any, players: MatchPlayer[]) {
        if (gameState.bidWinner !== userId) throw new Error("Only the bid winner can select trump")
        const newHands = { ...gameState.hands }
        const remaining = gameState.remainingDeck || []

        if (!gameState.secondDealComplete && remaining.length >= 16) {
            const dealerIndex = gameState.dealerIndex || 0
            const firstToReceive = (dealerIndex + 3) % 4 // RHS of dealer
            players.forEach((_, i) => {
                const seatToReceive = (firstToReceive - i + 4) % 4 // Counter-clockwise
                const p = players[seatToReceive]
                const secondCards = remaining.slice(i * 4, (i + 1) * 4)
                newHands[p.userId] = [...(newHands[p.userId] || []), ...secondCards]
            })
        }

        const newState = {
            ...gameState,
            trumpSuit: suit,
            hands: newHands,
            secondDealComplete: true,
            remainingDeck: [],
            turnStartedAt: serverTimestamp(),
            lastMoveTime: new Date().toISOString()
        }

        await updateDoc(doc(this.matchesCollection, matchId), {
            gameState: newState
        })
    }

    async revealTrump29(matchId: string, gameState: any) {
        if (!gameState.trumpSuit) return

        const newState = {
            ...gameState,
            trumpRevealed: true,
            turnStartedAt: serverTimestamp(),
            lastMoveTime: new Date().toISOString()
        }

        await updateDoc(doc(this.matchesCollection, matchId), {
            gameState: newState
        })
    }

    async declarePair29(matchId: string, playerId: string, gameState: any, players: MatchPlayer[]) {
        if (!gameState.trumpRevealed || !gameState.trumpSuit) throw new Error("Trump must be revealed first")

        const myHand = gameState.hands[playerId] || []
        const hasKing = myHand.some((c: any) => c.suit === gameState.trumpSuit && c.rank === 'K')
        const hasQueen = myHand.some((c: any) => c.suit === gameState.trumpSuit && c.rank === 'Q')

        if (!hasKing || !hasQueen) throw new Error("You don't have the Pair (K & Q of Trump)")

        const bidderTeam = players.findIndex(p => p.userId === gameState.bidWinner) % 2
        const playerTeam = players.findIndex(p => p.userId === playerId) % 2

        // If bidder team declares, bid reduces by 4. If opponents declare, bid increases by 4.
        const adjustment = bidderTeam === playerTeam ? -4 : 4

        const newState = {
            ...gameState,
            bidAdjustment: (gameState.bidAdjustment || 0) + adjustment,
            pairDeclaredBy: playerId,
            turnStartedAt: serverTimestamp()
        }

        await updateDoc(doc(this.matchesCollection, matchId), {
            gameState: newState
        })
    }

    async dismissRoundPopup(matchId: string, gameState: any) {
        // Rotate dealer and start player (Counter-clockwise / RHS)
        const newDealerIndex = ((gameState.dealerIndex || 0) + 3) % 4
        const nextStartPlayer = (newDealerIndex + 3) % 4

        const newState = {
            ...gameState,
            round: (gameState.round || 1) + 1,
            dealerIndex: newDealerIndex,
            currentBidder: nextStartPlayer,
            currentPlayer: nextStartPlayer,
            currentTrick: [],
            tricks: {},
            scores: {},
            trumpSuit: null,
            trumpRevealed: false,
            highestBid: null,
            bidWinner: null,
            bids: {},
            passedPlayers: [],
            secondDealComplete: false,
            phase: 'bidding',
            hands: {},
            roundWinner: null,
            showRoundPopup: false,
            bidAdjustment: 0,
            pairDeclaredBy: null,
            pairShown: false,
            remainingDeck: [],
            lastTrickCards: [],
            turnStartedAt: serverTimestamp()
        }

        await updateDoc(doc(this.matchesCollection, matchId), {
            gameState: newState
        })
    }

    async dismissSetPopup(matchId: string, gameState: any) {
        // Full reset for a new set
        const newState = {
            ...gameState,
            round: 1,
            gamePoints: { team1: 0, team2: 0 }, // Reset points
            currentTrick: [],
            tricks: {},
            scores: {},
            trumpSuit: null,
            trumpRevealed: false,
            highestBid: null,
            bidWinner: null,
            bids: {},
            passedPlayers: [],
            secondDealComplete: false,
            phase: 'bidding',
            hands: {},
            roundWinner: null,
            showRoundPopup: false,
            setWinner: null,
            showSetPopup: false,
            bidAdjustment: 0,
            pairDeclaredBy: null,
            remainingDeck: [],
            turnStartedAt: serverTimestamp(),
            currentBidder: 0,
            currentPlayer: 0
        }

        await updateDoc(doc(this.matchesCollection, matchId), {
            gameState: newState
        })
    }

    determineTrickWinner(trick: any[], trumpSuit: string | null, gameState?: any): string {
        const rankValues: any = { 'J': 8, '9': 7, 'A': 6, '10': 5, 'K': 4, 'Q': 3, '8': 2, '7': 1 }

        if (gameState?.singleHandMode) {
            let winner = trick[0]
            trick.forEach((t: any) => {
                if (rankValues[t.card.rank] > rankValues[winner.card.rank]) {
                    winner = t
                }
            })
            return winner.playerId
        }

        let winner = trick[0]
        trick.forEach((t: any) => {
            if (t.card.suit === trumpSuit && winner.card.suit !== trumpSuit) {
                winner = t
            } else if (t.card.suit === winner.card.suit && rankValues[t.card.rank] > rankValues[winner.card.rank]) {
                winner = t
            }
        })
        return winner.playerId
    }

    getCardValue(rank: string): number {
        const values: any = { 'J': 3, '9': 2, 'A': 1, '10': 1, 'K': 0, 'Q': 0, '8': 0, '7': 0 }
        return values[rank] || 0
    }
}

export const matchService = new MatchService()
