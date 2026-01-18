// Dossier Type Definitions
// Types for The Dossier - tactical competitive record page

export type LFGStatusMode = 'available_scrims' | 'looking_duo' | 'tournament_ready' | 'not_available'

export interface LFGStatus {
    mode: LFGStatusMode
    expiresAt?: string
    autoExpireHours?: number
    setAt: string
}

export const LFG_STATUS_CONFIG: Record<LFGStatusMode, {
    label: string
    icon: string
    color: string
    description: string
}> = {
    available_scrims: {
        label: 'Available for Scrims',
        icon: '🟢',
        color: '#10b981', // green
        description: 'Ready to join practice matches'
    },
    looking_duo: {
        label: 'Looking for Duo',
        icon: '🔵',
        color: '#3b82f6', // blue
        description: 'Seeking a duo partner'
    },
    tournament_ready: {
        label: 'Tournament Ready',
        icon: '🟠',
        color: '#f59e0b', // orange
        description: 'Prepared for competitive tournaments'
    },
    not_available: {
        label: 'Not Available',
        icon: '🔴',
        color: '#ef4444', // red
        description: 'Currently offline or busy'
    }
}

export interface SignatureGame {
    gameId: string
    gameName: string
    inGameId: string
    rank: string
    winRate: number
    tournamentsPlayed: number
    lastUpdated: string
}

export interface SkillMetrics {
    aggression: number // 0-100
    survival: number // 0-100
    teamImpact: number // 0-100
    consistency: number // 0-100
    clutchFactor: number // 0-100
    lastCalculated: string
}

export const SKILL_METRIC_DESCRIPTIONS: Record<keyof Omit<SkillMetrics, 'lastCalculated'>, string> = {
    aggression: 'Kill/Death ratio and offensive playstyle',
    survival: 'Average placement and survival time',
    teamImpact: 'Assists, revives, and team coordination',
    consistency: 'Performance stability across matches',
    clutchFactor: '1vX win rate and pressure performance'
}

export interface TrophyItem {
    id: string
    tournamentId: string
    tournamentName: string
    placement: 1 | 2 | 3
    prizeWon: number
    date: string
    gameId: string
    participants: number
}

export type ActivityType = 'tournament_joined' | 'tournament_won' | 'tournament_placed' | 'hosting_completed' | 'recruitment_formed'

export interface ActivityTimelineItem {
    id: string
    type: ActivityType
    title: string
    description?: string
    timestamp: string
    metadata?: {
        tournamentId?: string
        placement?: number
        prize?: number
        recruitmentId?: string
    }
}

export interface SocialLinks {
    youtube?: string
    twitch?: string
}

export interface HostMetrics {
    hostingRating: number // 1-5 stars
    totalPrizeDistributed: number
    tournamentsCompleted: number
    activeTournaments: number
    upcomingTournaments: number
}

export interface PlayerCardData {
    username: string
    clanTag?: string
    trustLevel: number
    badges: Array<{
        type: string
        icon: string
    }>
    signatureGame?: SignatureGame
    bestAchievement: {
        title: string
        description: string
    }
    stats: {
        wins: number
        winRate: number
        totalEarnings: number
    }
}

export interface EditModeState {
    isEditing: boolean
    editableFields: Set<string>
    pendingChanges: Record<string, any>
}

// Extended UserProfile fields (added to existing UserProfile in types/index.ts)
export interface DossierProfile {
    clanTag?: string
    clanLogo?: string
    signatureGame?: SignatureGame
    lfgStatus?: LFGStatus
    skillMetrics?: SkillMetrics
    socialLinks?: SocialLinks
    isVerifiedHost?: boolean
    hostMetrics?: HostMetrics
}
