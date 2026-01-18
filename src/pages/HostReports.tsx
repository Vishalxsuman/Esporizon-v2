import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Clock, CheckCircle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../services/ReportService';
import toast from 'react-hot-toast';

interface Report {
    _id: string;
    subject: string;
    issueType: string;
    status: string;
    createdAt: string;
    playerName: string;
    messages: Array<{
        senderName: string;
        senderType: string;
        message: string;
        timestamp: string;
    }>;
    tournamentId: {
        title: string;
        game: string;
    };
}

const HostReports = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchReports();
    }, [statusFilter]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await reportService.getReportsForHost(statusFilter);
            setReports(data.reports);
        } catch (error: any) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        if (!selectedReport || !replyMessage.trim()) return;

        try {
            setSending(true);
            await reportService.addReply(selectedReport._id, replyMessage);
            toast.success('Reply sent');
            setReplyMessage('');
            const details = await reportService.getReportDetails(selectedReport._id);
            setSelectedReport(details.report);
            fetchReports();
        } catch (error: any) {
            toast.error(error.message || 'Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    const handleResolve = async () => {
        if (!selectedReport) return;

        try {
            await reportService.updateStatus(selectedReport._id, 'resolved');
            toast.success('Report marked as resolved');
            setSelectedReport(null);
            fetchReports();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
            case 'in_progress': return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
            case 'resolved': return 'text-green-500 border-green-500/30 bg-green-500/10';
            case 'closed': return 'text-gray-500 border-gray-500/30 bg-gray-500/10';
            default: return 'text-gray-500 border-gray-500/30 bg-gray-500/10';
        }
    };

    const getIssueTypeLabel = (type: string) => {
        return type.replace('_', ' ').toUpperCase();
    };

    return (
        <div className="min-h-screen bg-black text-white py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/host/dashboard')}
                        className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black italic">Player Reports</h1>
                        <p className="text-zinc-400 text-sm">Manage disputes and issues</p>
                    </div>
                </div>

                {!selectedReport ? (
                    <>
                        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                            {['', 'open', 'in_progress', 'resolved'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${statusFilter === status
                                            ? 'bg-teal-500 text-black'
                                            : 'bg-zinc-900/50 text-gray-400 border border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    {status === '' ? 'All' : status.replace('_', ' ').toUpperCase()}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-20 text-zinc-500">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
                                </div>
                            ) : reports.length === 0 ? (
                                <div className="text-center py-20 bg-zinc-900/50 rounded-xl border border-white/5">
                                    <MessageSquare className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
                                    <p className="text-zinc-400">No reports found</p>
                                </div>
                            ) : (
                                reports.map((report) => (
                                    <motion.div
                                        key={report._id}
                                        whileHover={{ y: -2 }}
                                        onClick={() => setSelectedReport(report)}
                                        className="bg-zinc-900/50 border border-white/5 p-5 rounded-xl hover:border-white/10 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(report.status)}`}>
                                                        {report.status.toUpperCase()}
                                                    </span>
                                                    <span className="text-xs text-zinc-500">
                                                        {getIssueTypeLabel(report.issueType)}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-lg mb-1">{report.subject}</h3>
                                                <p className="text-sm text-zinc-400">
                                                    {report.tournamentId?.title || 'Tournament'} • {report.playerName}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(report.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-zinc-600">
                                                    {report.messages?.length || 0} messages
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <div className="animate-fadeIn">
                        <div className="bg-zinc-900/80 p-5 rounded-xl border border-white/10 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(selectedReport.status)}`}>
                                        {selectedReport.status.toUpperCase()}
                                    </span>
                                    <span className="text-xs text-zinc-500">{getIssueTypeLabel(selectedReport.issueType)}</span>
                                </div>
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="text-zinc-500 hover:text-white text-sm font-bold"
                                >
                                    Back to List
                                </button>
                            </div>
                            <h2 className="font-bold text-xl mb-2">{selectedReport.subject}</h2>
                            <p className="text-sm text-zinc-400">
                                {selectedReport.tournamentId?.title} • Player: {selectedReport.playerName}
                            </p>
                        </div>

                        <div className="bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden mb-6">
                            <div className="max-h-[60vh] overflow-y-auto p-5 space-y-4">
                                {selectedReport.messages?.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex ${msg.senderType === 'host' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-2xl p-4 ${msg.senderType === 'host'
                                                    ? 'bg-teal-500/20 border border-teal-500/30'
                                                    : 'bg-zinc-800/50 border border-white/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs font-bold capitalize">{msg.senderName}</span>
                                                <span className="text-[10px] text-zinc-500">
                                                    {new Date(msg.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm">{msg.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedReport.status !== 'resolved' && selectedReport.status !== 'closed' && (
                            <>
                                <div className="flex gap-3 mb-4">
                                    <input
                                        type="text"
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                                        placeholder="Type your reply..."
                                        className="flex-1 px-5 py-3 bg-zinc-900 border border-white/10 rounded-xl focus:outline-none focus:border-white/20 transition-all text-white placeholder:text-gray-600"
                                    />
                                    <button
                                        onClick={handleReply}
                                        disabled={!replyMessage.trim() || sending}
                                        className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        {sending ? 'Sending...' : 'Send'}
                                    </button>
                                </div>
                                <button
                                    onClick={handleResolve}
                                    className="w-full py-3 bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Mark as Resolved
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HostReports;
