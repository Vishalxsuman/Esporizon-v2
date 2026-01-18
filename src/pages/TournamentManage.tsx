import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Tournament {
    id: string;
    title: string;
    status: string;
    startDate: any;
    currentTeams: number;
    maxTeams: number;
    prizePool: number;
    perKillRate: number;
    prizeDistribution: any[];
}

interface Participant {
    id: string;
    userId: string; // Wait, participants collection structure: players[{userId, role...}]
    teamName: string;
    players: { userId: string; userName: string; role: string }[];
}

const TournamentManage = () => {
    const navigate = useNavigate();
    const { user, getToken } = useAuth();

    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);

    // Results State: map participant ID (or team ID) to { rank, kills }
    const [results, setResults] = useState<Record<string, { rank: string; kills: string }>>({});
    const [publishing, setPublishing] = useState(false);

    useEffect(() => {
        const fetchMyTournaments = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const token = await getToken();
                // Note: Modified backend filter by organizerId
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tournaments?organizerId=${user.uid}`, {
                    headers: { 'Authorization': `Bearer ${token}` } // Optional if backend public endpoint checks this? Actually my manual update didn't mandate auth, but it's good practice.
                });
                if (!response.ok) throw new Error('Failed to fetch tournaments');

                const data = await response.json();
                setTournaments(data.tournaments);
            } catch (error) {
                console.error('Error fetching tournaments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyTournaments();
    }, [user, getToken]);

    const handleManage = async (tournament: Tournament) => {
        setSelectedTournament(tournament);
        setResults({});

        try {
            setLoadingParticipants(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tournaments/${tournament.id}/participants`);
            if (!response.ok) throw new Error('Failed to fetch participants');

            const data = await response.json();
            setParticipants(data.participants);

            // Initialize results state
            const initialResults: any = {};
            data.participants.forEach((p: Participant) => {
                // We key by the first player's userId for now (assuming solo/squad leader pays prize to logic?)
                // The backend result processing iterates `results` array with `userId` and `kills`.
                // It pays to `userId`.
                // For Squads, we should ideally pay the leader or split.
                // The current backend simplistic logic pays `userId` in the result object.
                // So we should list players or teams.
                // If Team, we'll list the team and use the leader's ID for payout?
                // Let's use the first player (leader) as the payee for simplicity 
                // OR we list every player if we want per-player stats.
                // Given the `TournamentResult` UI shows "TeamName || PlayerList", let's list Teams/Entries.
                // And we'll attribute the win to the *leader* (first player in array usually).

                const leader = p.players[0];
                if (leader) {
                    initialResults[p.id] = { rank: '', kills: '0', userId: leader.userId, userName: leader.userName, teamName: p.teamName };
                }
            });
            setResults(initialResults);

        } catch (error) {
            console.error('Fetch participants error:', error);
            alert('Failed to load participants');
        } finally {
            setLoadingParticipants(false);
        }
    };

    const handlePublish = async () => {
        if (!selectedTournament) return;

        if (!confirm('Are you sure you want to publish these results? This action handles payouts and cannot be undone.')) return;

        try {
            setPublishing(true);
            const token = await getToken();

            // Transform results map to array for API
            // API expects array of { userId, kills, rank }
            const resultsArray = Object.values(results)
                .filter((r: any) => r.rank && Number(r.rank) > 0) // Only include ranked players
                .map((r: any) => ({
                    userId: r.userId,
                    kills: Number(r.kills),
                    rank: Number(r.rank),
                    teamName: r.teamName || r.userName
                }));

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tournaments/${selectedTournament.id}/results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ results: resultsArray })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to publish');
            }

            alert('Results published successfully!');
            setSelectedTournament(null);
            // Refresh list
            window.location.reload();
        } catch (error: any) {
            console.error('Publish error:', error);
            alert(error.message);
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800">
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black italic uppercase">Manage Tournaments</h1>
                        <p className="text-zinc-500 text-sm">Host Console</p>
                    </div>
                </div>

                {!selectedTournament ? (
                    <div className="grid gap-4">
                        {loading ? (
                            <div className="text-center py-20 text-zinc-500">Loading your tournaments...</div>
                        ) : tournaments.length === 0 ? (
                            <div className="text-center py-20 bg-zinc-900/50 rounded-xl border border-white/5">
                                <Trophy className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
                                <p className="text-zinc-400">You haven't hosted any tournaments yet.</p>
                                <button onClick={() => navigate('/arena/freefire')} className="mt-4 text-teal-500 font-bold text-sm">Create One</button>
                            </div>
                        ) : (
                            tournaments.map(t => (
                                <div key={t.id} className="bg-zinc-900/50 border border-white/5 p-5 rounded-xl flex items-center justify-between hover:border-white/10 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${t.status === 'completed' ? 'text-zinc-500 border-zinc-700' :
                                                t.status === 'upcoming' ? 'text-teal-500 border-teal-500/30' :
                                                    'text-amber-500 border-amber-500/30'
                                                }`}>
                                                {t.status}
                                            </span>
                                            <span className="text-zinc-500 text-xs">
                                                {new Date(t.startDate._seconds * 1000).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg">{t.title}</h3>
                                        <div className="text-xs text-zinc-400 mt-1">
                                            {t.currentTeams} / {t.maxTeams} Teams • Prize Pool: ₹{t.prizePool}
                                        </div>
                                    </div>

                                    {t.status !== 'completed' && (
                                        <button
                                            onClick={() => handleManage(t)}
                                            className="px-4 py-2 bg-zinc-800 hover:bg-teal-600 hover:text-white text-zinc-300 rounded-lg text-xs font-black uppercase tracking-wider transition-colors"
                                        >
                                            Manage Results
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="animate-fadeIn">
                        <div className="flex items-center justify-between bg-zinc-900/80 p-4 rounded-xl border border-white/10 mb-6">
                            <div>
                                <h2 className="font-bold text-xl">{selectedTournament.title}</h2>
                                <p className="text-zinc-400 text-xs">Enter results for each participant to calculate prizes.</p>
                            </div>
                            <button onClick={() => setSelectedTournament(null)} className="text-zinc-500 hover:text-white text-xs font-bold uppercase"> Cancel </button>
                        </div>

                        {loadingParticipants ? (
                            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
                        ) : participants.length === 0 ? (
                            <div className="text-center py-20 text-zinc-500">No participants joined this tournament.</div>
                        ) : (
                            <div className="bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden">
                                <div className="p-4 border-b border-white/5 grid grid-cols-12 gap-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                    <div className="col-span-1">#</div>
                                    <div className="col-span-4">Team / Player</div>
                                    <div className="col-span-3">Leader</div>
                                    <div className="col-span-2 text-center">Rank</div>
                                    <div className="col-span-2 text-center">Kills</div>
                                </div>
                                <div className="max-h-[60vh] overflow-y-auto">
                                    {participants.map((p, idx) => {
                                        const res = results[p.id] || {};
                                        return (
                                            <div key={p.id} className="p-4 border-b border-white/5 grid grid-cols-12 gap-4 items-center hover:bg-white/5 transition-colors">
                                                <div className="col-span-1 text-zinc-500 text-sm">{idx + 1}</div>
                                                <div className="col-span-4 font-medium text-white">
                                                    {p.teamName || 'Solo Player'}
                                                </div>
                                                <div className="col-span-3 text-zinc-400 text-sm truncate">
                                                    {p.players[0]?.userName || 'Unknown'}
                                                </div>
                                                <div className="col-span-2">
                                                    <input
                                                        type="number"
                                                        placeholder="Rank"
                                                        className="w-full bg-black border border-zinc-700 rounded px-2 py-1 text-center font-mono focus:border-teal-500 outline-none"
                                                        value={res.rank || ''}
                                                        onChange={(e) => setResults(prev => ({
                                                            ...prev,
                                                            [p.id]: { ...prev[p.id], rank: e.target.value }
                                                        }))}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <input
                                                        type="number"
                                                        placeholder="Kills"
                                                        className="w-full bg-black border border-zinc-700 rounded px-2 py-1 text-center font-mono focus:border-teal-500 outline-none"
                                                        value={res.kills || ''}
                                                        onChange={(e) => setResults(prev => ({
                                                            ...prev,
                                                            [p.id]: { ...prev[p.id], kills: e.target.value }
                                                        }))}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="p-4 bg-zinc-950 border-t border-white/10 flex justify-end">
                                    <button
                                        onClick={handlePublish}
                                        disabled={publishing}
                                        className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-black font-black uppercase tracking-wider rounded-lg disabled:opacity-50"
                                    >
                                        {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Publish Results
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TournamentManage;
