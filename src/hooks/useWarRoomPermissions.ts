import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { warRoomService } from '@/services/WarRoomService'
import { TrustLevel, TRUST_LEVELS } from '@/types/WarRoomTypes'

interface WarRoomPermissions {
    canView: boolean
    canComment: boolean
    canRecruit: boolean
    canPost: boolean
    canUploadClips: boolean
    trustLevel: TrustLevel
    trustLevelInfo: typeof TRUST_LEVELS[TrustLevel]
    nextLevelInfo: {
        level: TrustLevel | null
        requirements: string
    }
    isLoading: boolean
}

/**
 * React hook for checking War Room permissions based on user trust level
 * 
 * Usage:
 * const { canPost, canRecruit, trustLevel, nextLevelInfo } = useWarRoomPermissions()
 */
export function useWarRoomPermissions(): WarRoomPermissions {
    const { user } = useAuth()
    const [trustLevel, setTrustLevel] = useState<TrustLevel>(0)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!user?.uid) {
            setTrustLevel(0)
            setIsLoading(false)
            return
        }

        const fetchTrustLevel = async () => {
            if (!user?.uid) return

            try {
                const level = await warRoomService.getUserTrustLevel(user.uid)
                setTrustLevel(level)
            } catch (error) {
                if (import.meta.env.MODE !== 'production') {

                    console.error('Error fetching trust level:', error);

                }
                setTrustLevel(0)
            } finally {
                setIsLoading(false)
            }
        }

        fetchTrustLevel()
    }, [user?.uid])

    const trustLevelInfo = TRUST_LEVELS[trustLevel]
    const permissions = trustLevelInfo.permissions

    // Calculate next level info
    let nextLevel: TrustLevel | null = null
    let nextRequirements = ''

    if (trustLevel < 3) {
        nextLevel = (trustLevel + 1) as TrustLevel
        nextRequirements = TRUST_LEVELS[nextLevel].requirements
    }

    return {
        canView: permissions.canView,
        canComment: permissions.canComment,
        canRecruit: permissions.canRecruit,
        canPost: permissions.canPost,
        canUploadClips: permissions.canUploadClips,
        trustLevel,
        trustLevelInfo,
        nextLevelInfo: {
            level: nextLevel,
            requirements: nextRequirements
        },
        isLoading
    }
}
