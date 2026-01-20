// Mock data for the esports tournament dashboard

export interface LiveTournament {
    id: string
    game: string
    gameId: string
    entryFee: number
    prizePool: number
    totalSlots: number
    filledSlots: number
    startTime: string
    difficulty: 'Beginner' | 'Intermediate' | 'Pro'
    format: 'Solo' | 'Duo' | 'Squad'
}

export interface UpcomingMatch {
    id: string
    game: string
    team1: string
    team2: string
    startTime: Date
    format: string
}

export interface UserStats {
    matchesPlayed: number
    winRate: number
    totalEarnings: number
    currentRank: number
}

export interface LeaderboardEntry {
    rank: number
    username: string
    points: number
    isCurrentUser?: boolean
}

export interface RecentActivity {
    id: string
    type: 'join' | 'win' | 'reward'
    description: string
    timestamp: Date
    amount?: number
}

export const liveTournaments: LiveTournament[] = [
    {
        id: '1',
        game: 'Free Fire',
        gameId: 'freefire',
        entryFee: 50,
        prizePool: 5000,
        totalSlots: 100,
        filledSlots: 87,
        startTime: '2 hours',
        difficulty: 'Pro',
        format: 'Squad'
    },
    {
        id: '2',
        game: 'BGMI',
        gameId: 'bgmi',
        entryFee: 100,
        prizePool: 10000,
        totalSlots: 80,
        filledSlots: 65,
        startTime: '4 hours',
        difficulty: 'Intermediate',
        format: 'Squad'
    },
    {
        id: '3',
        game: 'Valorant',
        gameId: 'valorant',
        entryFee: 200,
        prizePool: 25000,
        totalSlots: 64,
        filledSlots: 58,
        startTime: '6 hours',
        difficulty: 'Pro',
        format: 'Squad'
    },
    {
        id: '4',
        game: 'Minecraft',
        gameId: 'minecraft',
        entryFee: 25,
        prizePool: 2000,
        totalSlots: 50,
        filledSlots: 42,
        startTime: '3 hours',
        difficulty: 'Beginner',
        format: 'Solo'
    },
    {
        id: '5',
        game: 'Free Fire',
        gameId: 'freefire',
        entryFee: 75,
        prizePool: 7500,
        totalSlots: 100,
        filledSlots: 92,
        startTime: '1 hour',
        difficulty: 'Intermediate',
        format: 'Duo'
    },
    {
        id: '6',
        game: 'BGMI',
        gameId: 'bgmi',
        entryFee: 150,
        prizePool: 15000,
        totalSlots: 96,
        filledSlots: 78,
        startTime: '5 hours',
        difficulty: 'Pro',
        format: 'Squad'
    }
]

export const upcomingMatches: UpcomingMatch[] = [
    {
        id: '1',
        game: 'Free Fire',
        team1: 'Team Alpha',
        team2: 'Team Omega',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        format: 'Best of 3'
    },
    {
        id: '2',
        game: 'BGMI',
        team1: 'Phoenix Squad',
        team2: 'Viper Gaming',
        startTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
        format: 'Best of 5'
    },
    {
        id: '3',
        game: 'Valorant',
        team1: 'Radiant Esports',
        team2: 'Shadow Clan',
        startTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        format: 'Best of 3'
    }
]

export const userStats: UserStats = {
    matchesPlayed: 156,
    winRate: 68.5,
    totalEarnings: 45680,
    currentRank: 12
}

export const leaderboardData: LeaderboardEntry[] = [
    { rank: 1, username: 'ProGamer_X', points: 15420 },
    { rank: 2, username: 'SkillMaster99', points: 14890 },
    { rank: 3, username: 'NoobDestroyer', points: 14250 },
    { rank: 4, username: 'EsportsKing', points: 13680 },
    { rank: 5, username: 'VictoryClan', points: 13120 },
    { rank: 6, username: 'TacticalGenius', points: 12890 },
    { rank: 7, username: 'SniperElite', points: 12350 },
    { rank: 8, username: 'RushMaster', points: 11980 },
    { rank: 9, username: 'ClutchPlayer', points: 11560 },
    { rank: 10, username: 'GameChanger', points: 11250 },
    { rank: 11, username: 'StrategyPro', points: 10980 },
    { rank: 12, username: 'You', points: 10750, isCurrentUser: true },
    { rank: 13, username: 'FragHunter', points: 10420 },
    { rank: 14, username: 'TeamCarry', points: 10150 },
    { rank: 15, username: 'AceShooter', points: 9890 }
]

export const recentActivity: RecentActivity[] = [
    {
        id: '1',
        type: 'win',
        description: 'Won BGMI Squad Championship',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        amount: 2500
    },
    {
        id: '2',
        type: 'join',
        description: 'Joined Free Fire Pro League',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
    },
    {
        id: '3',
        type: 'reward',
        description: 'Daily login reward claimed',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        amount: 50
    },
    {
        id: '4',
        type: 'win',
        description: 'Won Valorant Ranked Match',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        amount: 500
    },
    {
        id: '5',
        type: 'join',
        description: 'Joined Minecraft Build Battle',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    }
]

export const supportedGames = [
    { id: 'freefire', name: 'Free Fire', icon: '🔥' },
    { id: 'bgmi', name: 'BGMI', icon: '🎯' },
    { id: 'valorant', name: 'Valorant', icon: '⚔️' },
    { id: 'minecraft', name: 'Minecraft', icon: '⛏️' },
    { id: 'csgo', name: 'CS:GO', icon: '💥' },
    { id: 'pubg', name: 'PUBG', icon: '🔫' }
]
