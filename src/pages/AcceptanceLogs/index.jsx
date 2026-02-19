import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { HiRefresh, HiSearch, HiClipboardList, HiCheckCircle, HiCalendar, HiUser, HiBriefcase, HiEye } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AcceptanceLogs = () => {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [logsPerPage] = useState(10);

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        filterLogs();
    }, [logs, search]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const allLogs = await orderService.getAcceptanceLogs();
            setLogs(allLogs);
        } catch (error) {
            console.error('Error fetching acceptance logs:', error);
            toast.error('Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    const filterLogs = () => {
        const result = logs.filter(log =>
            log.userName?.toLowerCase().includes(search.toLowerCase()) ||
            log.providerName?.toLowerCase().includes(search.toLowerCase()) ||
            log.service?.toLowerCase().includes(search.toLowerCase()) ||
            log.location?.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredLogs(result);
        setCurrentPage(1);
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Pagination logic
    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Acceptance Logs</h1>
                    <p className="text-slate-500 mt-1 font-medium">Global history of customer and provider mutual matches</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchLogs}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
                    >
                        <HiRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-premium p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl">
                        <HiClipboardList />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Total Matches</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-2">{logs.length}</h4>
                    </div>
                </div>
                <div className="card-premium p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-2xl">
                        <HiCheckCircle />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Completed Today</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-2">
                            {logs.filter(l => new Date(l.acceptedAt).toDateString() === new Date().toDateString()).length}
                        </h4>
                    </div>
                </div>
                <div className="card-premium p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 text-2xl">
                        <HiCalendar />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Active History</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-2">Global</h4>
                    </div>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiSearch className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by customer, provider, service or location..."
                    className="input-field pl-12 bg-white/50 focus:bg-white border-slate-200"
                />
            </div>

            {/* Logs Table */}
            <div className="card-premium overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-80 gap-4">
                        <div className="h-12 w-12 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing Acceptance Logs...</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl mb-6">
                            <HiClipboardList className="h-10 w-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No logs found</h3>
                        <p className="text-slate-500 mt-2">We couldn't find any results matching your search.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Match Details</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Service & Category</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 transition-all">
                                    {currentLogs.map((log) => (
                                        <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <HiUser className="text-indigo-400 h-4 w-4" />
                                                        <span className="font-bold text-slate-900">{log.userName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <HiBriefcase className="text-purple-400 h-4 w-4" />
                                                        <span className="font-bold text-slate-600">{log.providerName}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div>
                                                    <p className="font-black text-slate-900 text-sm group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{log.service}</p>
                                                    <p className="text-[11px] text-slate-400 uppercase font-black tracking-tight mt-0.5">{log.providerCategory}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-xs font-bold text-slate-500 truncate max-w-[200px]" title={log.location}>
                                                    {log.location || 'Not Specified'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="space-y-1">
                                                    <p className="text-[11px] font-black text-slate-900 uppercase">Accepted At</p>
                                                    <p className="text-[10px] text-slate-400 font-bold">{formatDate(log.acceptedAt)}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link
                                                        to={`/acceptance-logs/${log.id}`}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                        title="View Details"
                                                    >
                                                        <HiEye className="h-5 w-5" />
                                                    </Link>
                                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 shadow-sm shadow-emerald-50">
                                                        ACCEPTED
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-8 py-5 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Showing <span className="text-slate-900">{indexOfFirstLog + 1}-{Math.min(indexOfLastLog, filteredLogs.length)}</span> of {filteredLogs.length}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-white transition-all"
                                    >
                                        Prev
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                            .map((p, i, arr) => (
                                                <div key={p} className="flex items-center gap-1">
                                                    {i > 0 && arr[i - 1] !== p - 1 && <span className="text-slate-300">...</span>}
                                                    <button
                                                        onClick={() => paginate(p)}
                                                        className={`h-9 w-9 rounded-xl text-xs font-bold transition-all ${currentPage === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-white'}`}
                                                    >
                                                        {p}
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-white transition-all"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AcceptanceLogs;
