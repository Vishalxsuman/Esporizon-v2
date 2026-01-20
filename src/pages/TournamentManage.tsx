import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tournamentService } from '@/services/TournamentService';

import { Tournament, TournamentParticipant } from '@/types/tournament';
import TournamentChatRoom from '@/components/TournamentChatRoom';

const RoomDetailsForm = ({ tournamentId, initialData }: { tournamentId: string, initialData?: any }) => {
    const [roomId, setRoomId] = useState(initialData?.roomId || '');
    const [password, setPassword] = useState(initialData?.password || '');
    const [server, setServer] = useState(initialData?.server || 'India');
    const [map, setMap] = useState(initialData?.map || '');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        setLoading(true);
        try {
            await tournamentService.updateRoomDetails(tournamentId, { roomId, password, server, map });
            alert('Room details updated & posted to chat!');
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error(error);

            }
            alert('Failed to update room details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <input
                    placeholder="Room ID"
                    value={roomId}
                    onChange={e => setRoomId(e.target.value)}
                    className="bg-black/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                />
                <input
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="bg-black/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <input
                    placeholder="Server (e.g. India)"
                    value={server}
                    onChange={e => setServer(e.target.value)}
                    className="bg-black/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                />
                <input
                    placeholder="Map (e.g. Bermuda)"
                    value={map}
                    onChange={e => setMap(e.target.value)}
                    className="bg-black/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                />
            </div>
            <button
                onClick={handleUpdate}
                disabled={loading}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
                {loading ? 'Updating...' : 'Update & Post to Chat'}
            </button>
        </div>
    );
};

const LiveStreamForm = ({ tournamentId, initialData, onUpdate }: { tournamentId: string, initialData?: any, onUpdate?: () => void }) => {
    const [isLive, setIsLive] = useState(initialData?.status === 'live');
    const [url, setUrl] = useState(initialData?.youtubeUrl || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIsLive(initialData?.status === 'live');
        setUrl(initialData?.youtubeUrl || '');
    }, [initialData]);

    const handleSave = async () => {
        if (!isLive) return; // Should likely use STOP button for this case, or toggle behaves differently

        // Validation
        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            alert('Invalid YouTube URL');
            return;
        }

        setLoading(true);
        try {
            await tournamentService.updateLiveStream(tournamentId, { isLive: true, youtubeUrl: url });
            alert('Live stream updated successfully!');
            onUpdate?.();
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error(error);

            }
            alert('Failed to update live stream');
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async () => {
        if (!confirm('Stop live stream? This will mark existing stream as ended.')) return;
        setLoading(true);
        try {
            await tournamentService.updateLiveStream(tournamentId, { isLive: false });
            setIsLive(false);
            setUrl('');
            alert('Stream stopped');
            onUpdate?.();
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.error(error);

            }
            alert('Failed to stop stream');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-red-500/50'}`} />
                    </div>
                    <h3 className="font-bold text-lg">Live Stream</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 uppercase font-black tracking-wider">
                        {isLive ? 'LIVE' : 'OFFLINE'}
                    </span>
                    <button
                        onClick={() => !isLive ? setIsLive(true) : handleStop()}
                        className={`w-10 h-5 rounded-full transition-colors relative flex items-center px-1 ${isLive ? 'bg-red-500' : 'bg-zinc-700'}`}
                    >
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isLive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>

            {isLive && (
                <div className="space-y-3 animate-fadeIn">
                    <input
                        placeholder="https://youtube.com/live/..."
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        className="w-full bg-black/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500 outline-none placeholder:text-zinc-600"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex-1 py-2 bg-white text-black hover:bg-zinc-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Update Stream'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


const TournamentManage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
    const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);

    // Results State: map participant ID (or team ID) to { rank, kills }
    const [results, setResults] = useState<Record<string, { rank: string; kills: string }>>({});
    const [publishing, setPublishing] = useState(false);

    useEffect(() => {
        const fetchMyTournaments = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const data = await tournamentService.getOrganizerTournaments(user!.id);
                setTournaments(data);
            } catch (error) {
                if (import.meta.env.MODE !== 'production') {

                    console.error('Error fetching tournaments:', error);

                }
            } finally {
                setLoading(false);
            }
        };

        fetchMyTournaments();
    }, [user]);

    const handleManage = async (tournament: Tournament) => {
        setSelectedTournament(tournament);
        setResults({});

        try {
            setLoadingParticipants(true);
            const data = await tournamentService.getParticipants(tournament.id);
            setParticipants(data);

            // Initialize results state
            const initialResults: any = {};
            data.forEach((p: TournamentParticipant) => {
                const leader = p.players[0];
                if (leader) {
                    initialResults[p.id] = { rank: '', kills: '0', userId: leader.userId, userName: leader.userName, teamName: p.teamName };
                }
            });
            setResults(initialResults);

        } catch (error) {
            if (import.meta.env.MODE !== 'production') {

                console.warn('Participants data unavailable:', error);

            }
        } finally {
            setLoadingParticipants(false);
        }
    };

    const handlePublish = async () => {
        if (!selectedTournament) return;

        if (!confirm('Are you sure you want to publish these results? This action handles payouts and cannot be undone.')) return;

        try {
            setPublishing(true);

            // Transform results map to array for API
            const resultsArray = Object.values(results)
                .filter((r: any) => r.rank && Number(r.rank) > 0) // Only include ranked players
                .map((r: any) => ({
                    userId: r.userId,
                    kills: Number(r.kills),
                    rank: Number(r.rank),
                    teamName: r.teamName || r.userName
                }));

            await tournamentService.publishResults(selectedTournament.id, resultsArray);

            alert('Results published successfully!');
            setSelectedTournament(null);
            // Refresh list
            window.location.reload();
        } catch (error: any) {
            if (import.meta.env.MODE !== 'production') {

                console.error('Publish error:', error);

            }
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
                                                {new Date(t.startDate).toLocaleDateString()}
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
                    <div className="animate-fadeIn space-y-6">
                        <div className="flex items-center justify-between bg-zinc-900/80 p-4 rounded-xl border border-white/10">
                            <div>
                                <h2 className="font-bold text-xl">{selectedTournament.title}</h2>
                                <p className="text-zinc-400 text-xs">Manage tournament details, room info, and results.</p>
                            </div>
                            <button onClick={() => setSelectedTournament(null)} className="text-zinc-500 hover:text-white text-xs font-bold uppercase"> Cancel </button>
                        </div >

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* LEFT COLUMN: Room Details & Chat */}
                            <div className="space-y-6">
                                {/* Live Stream */}
                                <LiveStreamForm
                                    tournamentId={selectedTournament.id}
                                    initialData={selectedTournament}
                                    onUpdate={() => {
                                        // Optional: Refresh tournament data
                                    }}
                                />

                                {/* Room Details Form */}
                                <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                            <Save className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        <h3 className="font-bold text-lg">Room Details</h3>
                                    </div>

                                    <RoomDetailsForm tournamentId={selectedTournament.id} initialData={selectedTournament.roomDetails} />
                                </div>

                                {/* Chat Console */}
                                <div className="h-[500px]">
                                    <TournamentChatRoom
                                        tournamentId={selectedTournament.id}
                                        tournamentName={selectedTournament.title}
                                        isAdmin={true}
                                    />
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Results Management */}
                            <div>
                                <div className="bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden">
                                    <div className="p-4 bg-zinc-950/50 border-b border-white/5">
                                        <h3 className="font-bold text-lg">Results & Standings</h3>
                                    </div>

                                    {loadingParticipants ? (
                                        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
                                    ) : participants.length === 0 ? (
                                        <div className="text-center py-20 text-zinc-500">No participants joined this tournament.</div>
                                    ) : (
                                        <>
                                            <div className="p-4 border-b border-white/5 grid grid-cols-12 gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                                <div className="col-span-1">#</div>
                                                <div className="col-span-5">Team / Player</div>
                                                <div className="col-span-3 text-center">Rank</div>
                                                <div className="col-span-3 text-center">Kills</div>
                                            </div>
                                            <div className="max-h-[500px] overflow-y-auto">
                                                {participants.map((p, idx) => {
                                                    const res = results[p.id] || {};
                                                    return (
                                                        <div key={p.id} className="p-3 border-b border-white/5 grid grid-cols-12 gap-2 items-center hover:bg-white/5 transition-colors">
                                                            <div className="col-span-1 text-zinc-500 text-xs">{idx + 1}</div>
                                                            <div className="col-span-5">
                                                                <div className="font-medium text-white text-sm truncate">{p.teamName || 'Solo'}</div>
                                                                <div className="text-zinc-500 text-[10px] truncate">{p.players[0]?.userName}</div>
                                                            </div>
                                                            <div className="col-span-3">
                                                                <input
                                                                    type="number"
                                                                    placeholder="-"
                                                                    className="w-full bg-black/50 border border-zinc-700 rounded px-2 py-1 text-center font-mono focus:border-teal-500 outline-none hover:border-zinc-500 transition-colors"
                                                                    value={res.rank || ''}
                                                                    onChange={(e) => setResults(prev => ({
                                                                        ...prev,
                                                                        [p.id]: { ...prev[p.id], rank: e.target.value }
                                                                    }))}
                                                                />
                                                            </div>
                                                            <div className="col-span-3">
                                                                <input
                                                                    type="number"
                                                                    placeholder="-"
                                                                    className="w-full bg-black/50 border border-zinc-700 rounded px-2 py-1 text-center font-mono focus:border-teal-500 outline-none hover:border-zinc-500 transition-colors"
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
                                                    className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-black font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
                                                    Publish Results
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div >
                )}
            </div >
        </div >
    );
};

export default TournamentManage;
