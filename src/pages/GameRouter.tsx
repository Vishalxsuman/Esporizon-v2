import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { matchService } from '@/services/MatchService'

const GameRouter = () => {
    const { id } = useParams<{ id: string }>()
    const [gameId, setGameId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return

        matchService.getMatch(id).then(match => {
            if (match) {
                setGameId(match.gameId)
            }
            setLoading(false)
        })
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-primary)]">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Game Not Found</h2>
                <p className="text-[var(--text-secondary)]">The requested game ({gameId}) is not available or has been moved.</p>
            </div>
        </div>
    )
}

export default GameRouter
