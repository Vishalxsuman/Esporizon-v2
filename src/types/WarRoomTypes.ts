// War Room Type Definitions
// Trust Level System, Badges, and Content Types for Competitive Coordination

export type TrustLevel = 0 | 1 | 2 | 3

export interface TrustLevelInfo {
    level: TrustLevel
    name: string
    description: string
    permissions: {
        canView: boolean
        canComment: boolean
        canRecruit: boolean
        canPost: boolean
        canUploadClips: boolean
    }
    requirements: string
    color: string
}

export const TRUST_LEVELS: Record<TrustLevel, TrustLevelInfo> = {
    0: {
        level: 0,
        name: 'View Only',
        description: 'New recruit - observe and learn',
        permissions: {
            canView: true,
            canComment: false,
            canRecruit: false,
            canPost: false,
            canUploadClips: false
        },
        requirements: 'Play 1 tournament to unlock',
        color: '#6b7280' // gray
    },
    1: {
        level: 1,
        name: 'Participant',
        description: 'Active player - join the conversation',
        permissions: {
            canView: true,
            canComment: true,
            canRecruit: false,
            canPost: false,
            canUploadClips: false
        },
        requirements: 'Play 5 tournaments to unlock recruitment',
        color: '#cd7f32' // bronze
    },
    2: {
        level: 2,
        name: 'Recruiter',
        description: 'Trusted coordinator - form squads',
        permissions: {
            canView: true,
            canComment: true,
            canRecruit: true,
            canPost: false,
            canUploadClips: true
        },
        requirements: 'Play 20+ tournaments and earn badges to unlock',
        color: '#c0c0c0' // silver
    },
    3: {
        level: 3,
        name: 'Trusted Leader',
        description: 'Elite competitor - full privileges',
        permissions: {
            canView: true,
            canComment: true,
            canRecruit: true,
            canPost: true,
            canUploadClips: true
        },
        requirements: 'Top tier - earned through excellence',
        color: '#ffd700' // gold
    }
}

export type BadgeType = 'tournament_winner' | 'top_frag' | 'team_leader' | 'verified_host' | 'consistent_player'

export interface Badge {
    id: string
    type: BadgeType
    name: string
    description: string
    icon: string
    earnedAt: string
    metadata?: {
        tournamentId?: string
        tournamentName?: string
        killCount?: number
        successfulRecruitments?: number
        monthlyTournaments?: number
    }
}

export const BADGE_DEFINITIONS: Record<BadgeType, Omit<Badge, 'id' | 'earnedAt' | 'metadata'>> = {
    tournament_winner: {
        type: 'tournament_winner',
        name: 'Tournament Winner',
        description: 'Claimed victory in a competitive tournament',
        icon: '🏆'
    },
    top_frag: {
        type: 'top_frag',
        name: 'Top Frag',
        description: 'Achieved highest kills in a tournament',
        icon: '🎯'
    },
    team_leader: {
        type: 'team_leader',
        name: 'Team Leader',
        description: 'Successfully formed 3+ squads through recruitment',
        icon: '🧠'
    },
    verified_host: {
        type: 'verified_host',
        name: 'Verified Host',
        description: 'Approved tournament organizer',
        icon: '🛡'
    },
    consistent_player: {
        type: 'consistent_player',
        name: 'Consistent Player',
        description: 'Played 10+ tournaments in a month',
        icon: '🔥'
    }
}

export interface UserWarRoomProfile {
    userId: string
    trustLevel: TrustLevel
    badges: Badge[]
    stats: {
        postsCreated: number
        successfulRecruitments: number
        reportCount: number
        tournamentsCompleted: number
        monthlyTournaments: number
    }
    restrictions?: {
        isMuted: boolean
        mutedUntil?: string
        mutedReason?: string
    }
    updatedAt: string
}

// Recruitment Card Types
export type GameId = 'freefire' | 'bgmi' | 'valorant' | 'minecraft'
export type GameMode = 'solo' | 'duo' | 'squad'
export type PlayerRole = 'sniper' | 'rusher' | 'support' | 'igl' | 'any'

export interface RecruitmentCard {
    id: string
    userId: string
    userName: string
    userAvatar?: string
    trustLevel: TrustLevel
    badges: Badge[]

    // Game details
    gameId: GameId
    gameName: string
    mode: GameMode

    // Tournament context
    tournamentId: string
    tournamentName: string
    tournamentStartTime: string

    // Role requirements
    roleNeeded: PlayerRole
    roleName: string
    slotsAvailable: number
    currentMembers: string[] // user IDs who joined

    // Requirements
    minimumKD?: number
    minimumRank?: string
    requirements?: string

    // Scheduling
    timeSlot: string // e.g., "Today 8PM", "Tomorrow 6PM"
    timeSlotTimestamp: string // ISO timestamp

    // Entry fee (if any)
    entryFee?: number

    // Status
    status: 'active' | 'expired' | 'filled' | 'cancelled'
    expiresAt: string // Auto-expire after tournament starts

    // Squad chat (if created)
    squadChatId?: string

    createdAt: string
    updatedAt: string
}

export interface CreateRecruitmentDto {
    gameId: GameId
    mode: GameMode
    tournamentId: string
    roleNeeded: PlayerRole
    slotsAvailable: number
    minimumKD?: number
    minimumRank?: string
    requirements?: string
    timeSlot: string
    timeSlotTimestamp: string
    entryFee?: number
}

// Tournament Card Types (Auto-generated)
export type TournamentEventType = 'created' | 'registration_open' | 'starting_soon' | 'live' | 'completed'

export interface TournamentCard {
    id: string
    tournamentId: string
    eventType: TournamentEventType

    // Tournament details
    gameName: string
    tournamentName: string
    bannerUrl?: string

    // Stats
    prizePool: number
    entryFee: number
    slotsTotal: number
    slotsFilled: number

    // Organizer
    organizerId: string
    organizerName: string
    isVerifiedHost: boolean

    // Status
    status: 'upcoming' | 'ongoing' | 'completed'
    startTime: string

    // Winner info (if completed)
    winnerId?: string
    winnerName?: string
    winnerAvatar?: string

    // Metadata
    autoGenerated: boolean
    createdAt: string
}

// Clips Types
export interface ClipPost {
    id: string
    userId: string
    userName: string
    userAvatar?: string
    trustLevel: TrustLevel
    badges: Badge[]

    // Video details
    videoUrl: string
    thumbnailUrl: string
    duration: number // in seconds (max 45)

    // Tournament context
    tournamentId: string
    tournamentName: string
    matchId?: string

    // Performance tags
    killCount?: number
    tags: ('clutch' | 'ace' | 'headshot' | 'comeback' | 'win')[]

    // Engagement
    views: number
    likes: string[] // user IDs
    likeCount: number

    // Status
    status: 'processing' | 'active' | 'removed'

    createdAt: string
    updatedAt: string
}

export interface CreateClipDto {
    videoFile: File
    tournamentId: string
    killCount?: number
    tags: ('clutch' | 'ace' | 'headshot' | 'comeback' | 'win')[]
}

// War Room Post Categories
export type WarRoomContentType = 'recruitment' | 'tournament' | 'clip' | 'host_announcement' | 'legacy_post'

export interface WarRoomFeedItem {
    id: string
    contentType: WarRoomContentType
    data: RecruitmentCard | TournamentCard | ClipPost | any
    priority: number // Higher = shown first (verified hosts, live tournaments)
    createdAt: string
}

// Squad Chat (Temporary)
export interface SquadChat {
    id: string
    recruitmentCardId: string
    tournamentId: string
    members: string[] // user IDs
    createdAt: string
    expiresAt: string // Delete after tournament ends
}
