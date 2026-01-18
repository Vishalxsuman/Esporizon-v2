export interface Tournament {
    id: string;
    name: string;
    mode: 'Solo' | 'Duo' | 'Squad';
    prizePool: number;
    entryFee: number;
    startDate: string;
    slots: { filled: number; total: number };
    status: 'Open' | 'Locked' | 'Live' | 'Completed';
    host: { name: string; rating: number };
    organizerName?: string; // For backend compatibility
    rules: string[];
    prizeDistribution: { position: string; amount: number }[];
}

export const mockTournaments: Tournament[] = [
    // UPCOMING TOURNAMENTS
    {
        id: 'ff-001',
        name: 'Clash Royale Weekend',
        mode: 'Squad',
        prizePool: 10000,
        entryFee: 50,
        startDate: '2026-01-18T18:00:00+05:30',
        slots: { filled: 67, total: 100 },
        status: 'Open',
        host: { name: 'ProGamer_Rajesh', rating: 4.8 },
        rules: [
            'No hacks or third-party tools allowed',
            'Must join lobby 10 minutes before start time',
            'Fair play monitored via spectator mode',
            'Squad members must be registered before entry',
        ],
        prizeDistribution: [
            { position: '1st', amount: 5000 },
            { position: '2nd', amount: 3000 },
            { position: '3rd', amount: 2000 },
        ],
    },
    {
        id: 'ff-002',
        name: 'Solo Rush Challenge',
        mode: 'Solo',
        prizePool: 5000,
        entryFee: 25,
        startDate: '2026-01-16T20:00:00+05:30',
        slots: { filled: 42, total: 50 },
        status: 'Open',
        host: { name: 'EliteGaming_Amit', rating: 4.6 },
        rules: [
            'Solo mode only - no teaming allowed',
            'Fair play score must be above 80%',
            'Screen recording required for top 3 finishers',
            'Disconnection = instant disqualification',
        ],
        prizeDistribution: [
            { position: '1st', amount: 2500 },
            { position: '2nd', amount: 1500 },
            { position: '3rd', amount: 1000 },
        ],
    },
    {
        id: 'ff-003',
        name: 'Duo Masters Cup',
        mode: 'Duo',
        prizePool: 8000,
        entryFee: 40,
        startDate: '2026-01-17T19:30:00+05:30',
        slots: { filled: 58, total: 80 },
        status: 'Open',
        host: { name: 'SkillArena_Official', rating: 5.0 },
        rules: [
            'Both duo members must be registered',
            'Communication via in-game voice only',
            'Results verified by admin spectators',
            'Must maintain 90%+ attendance record',
        ],
        prizeDistribution: [
            { position: '1st', amount: 4000 },
            { position: '2nd', amount: 2400 },
            { position: '3rd', amount: 1600 },
        ],
    },
    {
        id: 'ff-004',
        name: 'Midnight Arena Battle',
        mode: 'Squad',
        prizePool: 6000,
        entryFee: 30,
        startDate: '2026-01-19T23:00:00+05:30',
        slots: { filled: 35, total: 60 },
        status: 'Open',
        host: { name: 'NightOwl_Esports', rating: 4.5 },
        rules: [
            'Late-night special - all players must check in',
            'Squad coordination will be tested',
            'Fair play enforced with anti-cheat monitoring',
            'Prize distributed within 24 hours of completion',
        ],
        prizeDistribution: [
            { position: '1st', amount: 3000 },
            { position: '2nd', amount: 2000 },
            { position: '3rd', amount: 1000 },
        ],
    },

    // ONGOING TOURNAMENTS
    {
        id: 'ff-005',
        name: 'Friday Night Showdown',
        mode: 'Squad',
        prizePool: 7500,
        entryFee: 50,
        startDate: '2026-01-13T17:00:00+05:30',
        slots: { filled: 80, total: 80 },
        status: 'Live',
        host: { name: 'ProCircuit_India', rating: 4.9 },
        rules: [
            'Professional-grade monitoring active',
            'All kills verified by replay system',
            'Fair play score required: 85%+',
            'Zero tolerance for toxic behavior',
        ],
        prizeDistribution: [
            { position: '1st', amount: 4000 },
            { position: '2nd', amount: 2250 },
            { position: '3rd', amount: 1250 },
        ],
    },
    {
        id: 'ff-006',
        name: 'Lightning Solo Sprint',
        mode: 'Solo',
        prizePool: 3000,
        entryFee: 30,
        startDate: '2026-01-13T16:30:00+05:30',
        slots: { filled: 50, total: 50 },
        status: 'Live',
        host: { name: 'QuickPlay_Arena', rating: 4.4 },
        rules: [
            'Fast-paced 20-minute matches',
            'Skill-based matchmaking enabled',
            'Server lag protection active',
            'Live leaderboard updates every 5 minutes',
        ],
        prizeDistribution: [
            { position: '1st', amount: 1500 },
            { position: '2nd', amount: 900 },
            { position: '3rd', amount: 600 },
        ],
    },

    // COMPLETED TOURNAMENTS
    {
        id: 'ff-007',
        name: 'Champions League Final',
        mode: 'Squad',
        prizePool: 10000,
        entryFee: 75,
        startDate: '2026-01-12T18:00:00+05:30',
        slots: { filled: 100, total: 100 },
        status: 'Completed',
        host: { name: 'EliteEsports_Hub', rating: 5.0 },
        rules: [
            'Top-tier verified players only',
            'All matches recorded and analyzed',
            'Fair play enforced with manual review',
            'Prize pool distributed within 12 hours',
        ],
        prizeDistribution: [
            { position: '1st', amount: 5500 },
            { position: '2nd', amount: 3000 },
            { position: '3rd', amount: 1500 },
        ],
    },
    {
        id: 'ff-008',
        name: 'Beginner Friendly Cup',
        mode: 'Duo',
        prizePool: 2000,
        entryFee: 25,
        startDate: '2026-01-11T20:00:00+05:30',
        slots: { filled: 60, total: 60 },
        status: 'Completed',
        host: { name: 'NewPlayer_Support', rating: 4.3 },
        rules: [
            'Open to players with less than 100 matches',
            'Supportive environment - no toxicity',
            'Learning-focused with post-match tips',
            'Fair play score requirement: 70%+',
        ],
        prizeDistribution: [
            { position: '1st', amount: 1000 },
            { position: '2nd', amount: 600 },
            { position: '3rd', amount: 400 },
        ],
    },
    {
        id: 'ff-009',
        name: 'Thursday Evening Clash',
        mode: 'Solo',
        prizePool: 4000,
        entryFee: 40,
        startDate: '2026-01-09T19:00:00+05:30',
        slots: { filled: 50, total: 50 },
        status: 'Completed',
        host: { name: 'WeekdayWarriors', rating: 4.7 },
        rules: [
            'Evening special for working professionals',
            'Strict time management enforced',
            'All players verified before match start',
            'Results published within 1 hour',
        ],
        prizeDistribution: [
            { position: '1st', amount: 2000 },
            { position: '2nd', amount: 1200 },
            { position: '3rd', amount: 800 },
        ],
    },
    {
        id: 'ff-010',
        name: 'Republic Day Special',
        mode: 'Squad',
        prizePool: 15000,
        entryFee: 100,
        startDate: '2026-01-10T15:00:00+05:30',
        slots: { filled: 100, total: 100 },
        status: 'Completed',
        host: { name: 'Esporizon_Official', rating: 5.0 },
        rules: [
            'Special event with increased prize pool',
            'Premium fair play monitoring',
            'Professional commentary and analysis',
            'Top performers get platform recognition',
        ],
        prizeDistribution: [
            { position: '1st', amount: 8000 },
            { position: '2nd', amount: 4500 },
            { position: '3rd', amount: 2500 },
        ],
    },
];
