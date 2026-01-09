import { useState, useEffect } from 'react'
import { matchService } from '@/services/MatchService'
import type { Match, GameState } from '@/types/match'

/**
 * Custom hook for managing Card29 game state
 * ALWAYS executes - no conditional hook calls
 */
export const useCard29GameState = (matchId: string | undefined) => {
    const [match, setMatch] = useState<Match | null>(null)
    const [gameState, setGameState] = useState<GameState | null>(null)
    const [loading, setLoading] = useState(true)

    // Match listener - always runs
    useEffect(() => {
        if (!matchId) {
            setLoading(false)
            return
        }

        setLoading(true)

        const unsubscribe = matchService.listenToMatch(matchId, (updatedMatch) => {
            if (!updatedMatch) {
                setLoading(false)
                return
            }

            setMatch(updatedMatch)

            if (updatedMatch.gameState) {
                setGameState(updatedMatch.gameState as GameState)
            }

            setLoading(false)
        })

        return () => unsubscribe()
    }, [matchId])

    return { match, gameState, loading }
}
