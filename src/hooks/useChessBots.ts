import { useEffect, useRef } from 'react'
import { Chess } from 'chess.js'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { Match } from '@/types/match'

export const useChessBots = (
    matchId: string | undefined,
    match: Match | null,
    chess: Chess,
    setFen: (fen: string) => void,
    gameOver: boolean,
    userId: string | undefined,
    whiteTime: number,
    blackTime: number
) => {
    const botMoveTimer = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (!match || gameOver || !userId || !matchId) return
        if (!match.players || match.players.length < 2) return

        const isBotMatch = match.players.some(p => p.isBot)
        if (!isBotMatch) return

        const isBotTurn = (chess.turn() === 'w' && match.players[0]?.isBot) ||
            (chess.turn() === 'b' && match.players[1]?.isBot)

        // Only Host/Creator runs the bot to prevent race conditions
        if (match.creatorId !== userId) return

        if (isBotTurn && !gameOver) {
            const botThink = async () => {
                // Formatting time for realism
                const delay = Math.floor(Math.random() * 500) + 500
                if (botMoveTimer.current) clearTimeout(botMoveTimer.current)

                botMoveTimer.current = setTimeout(async () => {
                    await makeBestMove()
                }, delay)
            }
            botThink()
        }

        return () => {
            if (botMoveTimer.current) clearTimeout(botMoveTimer.current)
        }
    }, [chess.fen(), match?.id, gameOver, userId])

    const makeBestMove = async () => {
        // Minimax Depth 2
        const bestMove = getBestMove(chess, 2)
        if (bestMove) {
            try {
                const moveResult = chess.move(bestMove)
                if (moveResult) {
                    const newFen = chess.fen()
                    setFen(newFen)

                    // Sync
                    if (matchId) {
                        const matchRef = doc(db, 'matches', matchId)
                        await updateDoc(matchRef, {
                            'gameState.fen': newFen,
                            'gameState.lastMove': { from: moveResult.from, to: moveResult.to, san: moveResult.san },
                            'gameState.whiteTimeRemaining': whiteTime,
                            'gameState.blackTimeRemaining': blackTime,
                            'gameState.updatedAt': new Date().toISOString()
                        })
                    }
                }
            } catch (e) {
                console.error("Bot move error", e)
            }
        }
    }

    // Minimax Engine
    const getBestMove = (game: any, depth: number) => {
        const moves = game.moves({ verbose: true })
        if (moves.length === 0) return null

        let bestMove = null
        let bestValue = -Infinity

        for (const move of moves) {
            game.move(move)
            const value = minimax(game, depth - 1, -Infinity, Infinity, false)
            game.undo()

            // Add some randomness if values are equal to avoid repetitive play
            if (value > bestValue || (value === bestValue && Math.random() > 0.5)) {
                bestValue = value
                bestMove = move
            }
        }
        return bestMove || moves[Math.floor(Math.random() * moves.length)]
    }

    const minimax = (game: any, depth: number, alpha: number, beta: number, isMaximizing: boolean) => {
        if (depth === 0 || game.game_over()) {
            return -evaluateBoard(game.board())
        }

        const moves = game.moves()

        if (isMaximizing) {
            let maxEval = -Infinity
            for (const move of moves) {
                game.move(move)
                const evalVal = minimax(game, depth - 1, alpha, beta, false)
                game.undo()
                maxEval = Math.max(maxEval, evalVal)
                alpha = Math.max(alpha, evalVal)
                if (beta <= alpha) break
            }
            return maxEval
        } else {
            let minEval = Infinity
            for (const move of moves) {
                game.move(move)
                const evalVal = minimax(game, depth - 1, alpha, beta, true)
                game.undo()
                minEval = Math.min(minEval, evalVal)
                beta = Math.min(beta, evalVal)
                if (beta <= alpha) break
            }
            return minEval
        }
    }

    const evaluateBoard = (board: any[][]) => {
        let totalEvaluation = 0
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                totalEvaluation += getPieceValue(board[i][j])
            }
        }
        return totalEvaluation
    }

    const getPieceValue = (piece: any) => {
        if (piece === null) return 0
        const getAbsoluteValue = (piece: any) => {
            if (piece.type === 'p') return 10
            if (piece.type === 'r') return 50
            if (piece.type === 'n') return 30
            if (piece.type === 'b') return 30
            if (piece.type === 'q') return 90
            if (piece.type === 'k') return 900
            return 0
        }
        const absoluteValue = getAbsoluteValue(piece)
        return piece.color === 'w' ? absoluteValue : -absoluteValue
    }
}
